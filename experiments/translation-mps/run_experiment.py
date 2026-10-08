"""Bounded, offline Marian fine-tuning experiment with before/after evaluation."""

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import platform
import random
import statistics
import time

ROOT = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(ROOT / ".cache" / "huggingface"))
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import psutil
import sacrebleu
import torch
import transformers
from transformers import MarianMTModel, MarianTokenizer


def log(event, **values):
    print(json.dumps({"event": event, **values}, ensure_ascii=False), flush=True)


def read_data(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def synchronize(device):
    if device.type == "mps":
        torch.mps.synchronize()


class MemorySamples:
    """Stage/step samples, not a claim of the absolute process or GPU peak."""

    def __init__(self, device):
        self.device = device
        self.process = psutil.Process()
        self.peak = {"rss_gib": 0.0, "mps_tensor_gib": 0.0, "mps_driver_gib": 0.0}

    def sample(self):
        sample = {"rss_gib": self.process.memory_info().rss / 1024**3}
        if self.device.type == "mps":
            sample["mps_tensor_gib"] = torch.mps.current_allocated_memory() / 1024**3
            sample["mps_driver_gib"] = torch.mps.driver_allocated_memory() / 1024**3
        for key, value in sample.items():
            self.peak[key] = max(self.peak[key], value)
        return {key: round(value, 3) for key, value in sample.items()}


def encode(tokenizer, rows, max_length):
    # Fixed shapes avoid unbounded MPS graph-cache growth in this small run.
    inputs = tokenizer(
        [row["zh"] for row in rows], padding="max_length",
        max_length=max_length, truncation=True, return_tensors="pt",
    )
    targets = tokenizer(
        text_target=[row["en"] for row in rows], padding="max_length",
        max_length=max_length, truncation=True, return_tensors="pt",
    )
    labels = targets["input_ids"].clone()
    labels[targets["attention_mask"] == 0] = -100
    return {**inputs, "labels": labels}


def batches(rows, size):
    for index in range(0, len(rows), size):
        yield rows[index:index + size]


@torch.inference_mode()
def evaluate(model, tokenizer, rows, device, size, max_length, memory):
    model.eval()
    synchronize(device)
    started = time.perf_counter()
    total_loss = 0.0
    total_tokens = 0
    predictions = []
    for group in batches(rows, size):
        encoded = {key: value.to(device) for key, value in encode(tokenizer, group, max_length).items()}
        result = model(**encoded, use_cache=False)
        tokens = int((encoded["labels"] != -100).sum().item())
        loss = float(result.loss.item())
        if not math.isfinite(loss):
            raise RuntimeError("Evaluation produced non-finite loss")
        total_loss += loss * tokens
        total_tokens += tokens
        generated = model.generate(
            input_ids=encoded["input_ids"], attention_mask=encoded["attention_mask"],
            max_new_tokens=max_length, num_beams=2, do_sample=False, use_cache=True,
        )
        predictions.extend(tokenizer.batch_decode(generated.cpu(), skip_special_tokens=True))
        memory.sample()
    synchronize(device)
    return {
        "token_cross_entropy": total_loss / total_tokens,
        "chrf_plus_plus": sacrebleu.corpus_chrf(
            predictions, [[row["en"] for row in rows]], word_order=2,
        ).score,
        "evaluation_seconds_including_loss_and_translation": time.perf_counter() - started,
        "predictions": predictions,
        "memory": memory.sample(),
    }


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--steps", type=int, default=32)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--accumulation", type=int, default=2)
    parser.add_argument("--max-length", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--max-train-seconds", type=float, default=300)
    parser.add_argument("--device", choices=["mps", "cpu"], default="mps")
    args = parser.parse_args()
    if min(args.steps, args.batch_size, args.accumulation, args.max_length) < 1:
        parser.error("Steps, batch size, accumulation, and max length must be positive")
    if args.device == "mps" and not torch.backends.mps.is_available():
        raise RuntimeError("MPS is unavailable. On Codex, GPU access may require running outside the sandbox.")

    output = ROOT / "outputs"
    output.mkdir(exist_ok=True)
    train = read_data(ROOT / "data" / "train.jsonl")
    held_out = read_data(ROOT / "data" / "eval.jsonl")
    if {row["zh"] for row in train} & {row["zh"] for row in held_out}:
        raise ValueError("An exact source sentence occurs in both training and evaluation")
    torch.set_num_threads(4)
    torch.manual_seed(42)
    random.seed(42)
    device = torch.device(args.device)
    memory = MemorySamples(device)
    log("environment", torch=torch.__version__, transformers=transformers.__version__,
        device=str(device), mps_available=torch.backends.mps.is_available(),
        system_memory_gib=round(psutil.virtual_memory().total / 1024**3, 2),
        train_pairs=len(train), evaluation_pairs=len(held_out), configuration=vars(args))

    base = ROOT / "models" / "base"
    tokenizer = MarianTokenizer.from_pretrained(base, local_files_only=True)
    model = MarianMTModel.from_pretrained(base, local_files_only=True).to(device)
    parameter_count = sum(parameter.numel() for parameter in model.parameters())
    # Reject hidden truncation rather than silently training on incomplete examples.
    for rows in [train, held_out]:
        source_lengths = [len(ids) for ids in tokenizer([row["zh"] for row in rows])["input_ids"]]
        target_lengths = [len(ids) for ids in tokenizer(text_target=[row["en"] for row in rows])["input_ids"]]
        if max(source_lengths + target_lengths) > args.max_length:
            raise ValueError("Increase --max-length: at least one example would be truncated")
    log("model_loaded", parameters=parameter_count, memory=memory.sample())
    probe = model.model.encoder.layers[0].self_attn.q_proj.weight
    probe_before = probe[:8, :8].detach().cpu().clone()
    log("baseline_started")
    baseline = evaluate(model, tokenizer, held_out, device, args.batch_size, args.max_length, memory)
    write_json(output / "baseline.json", baseline)
    log("baseline_complete", **{key: value for key, value in baseline.items() if key != "predictions"})

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate, weight_decay=0.01, foreach=False)
    order = list(range(len(train)))
    rng = random.Random(42)
    rng.shuffle(order)
    cursor = 0

    def next_group():
        nonlocal cursor
        indices = []
        for _ in range(args.batch_size):
            if cursor == len(order):
                cursor = 0
                rng.shuffle(order)
            indices.append(order[cursor])
            cursor += 1
        return [train[index] for index in indices]

    model.train()
    history = []
    warmup = min(3, args.steps)
    synchronize(device)
    train_started = time.perf_counter()
    with (output / "training.jsonl").open("w", encoding="utf-8") as history_file:
        for step in range(1, args.steps + 1):
            if history and time.perf_counter() - train_started > args.max_train_seconds:
                log("training_time_limit", completed_steps=len(history))
                break
            step_started = time.perf_counter()
            optimizer.zero_grad(set_to_none=True)
            fraction = step / warmup if step <= warmup else max(0.0, (args.steps - step + 1) / max(1, args.steps - warmup))
            learning_rate = args.learning_rate * fraction
            for group in optimizer.param_groups:
                group["lr"] = learning_rate
            step_losses = []
            for _ in range(args.accumulation):
                encoded = {key: value.to(device) for key, value in encode(tokenizer, next_group(), args.max_length).items()}
                loss = model(**encoded, use_cache=False).loss
                raw_loss = float(loss.detach().item())
                if not math.isfinite(raw_loss):
                    raise RuntimeError("Training produced non-finite loss")
                step_losses.append(raw_loss)
                (loss / args.accumulation).backward()
                memory.sample()
            norm = float(torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0, error_if_nonfinite=True).item())
            optimizer.step()
            synchronize(device)
            row = {
                "step": step, "mean_loss": statistics.mean(step_losses),
                "gradient_norm_before_clipping": norm, "learning_rate": learning_rate,
                "seconds": time.perf_counter() - step_started,
                "elapsed_seconds": time.perf_counter() - train_started, "memory": memory.sample(),
            }
            history.append(row)
            history_file.write(json.dumps(row) + "\n")
            history_file.flush()
            if step == 1 or step % 4 == 0 or step == args.steps:
                log("training_step", **row)
    synchronize(device)
    training_seconds = time.perf_counter() - train_started
    update = float((probe[:8, :8].detach().cpu() - probe_before).norm().item())
    if not history or update == 0.0:
        raise RuntimeError("No real parameter update was observed")
    optimizer.zero_grad(set_to_none=True)
    del optimizer
    if device.type == "mps":
        torch.mps.empty_cache()
    log("fine_tuned_evaluation_started")
    fine_tuned = evaluate(model, tokenizer, held_out, device, args.batch_size, args.max_length, memory)
    write_json(output / "fine_tuned.json", fine_tuned)

    checkpoint = ROOT / "models" / "fine-tuned-smoke"
    checkpoint.mkdir(parents=True, exist_ok=True)
    model.to("cpu")
    model.save_pretrained(checkpoint, safe_serialization=True)
    tokenizer.save_pretrained(checkpoint)
    log("checkpoint_saved", path=str(checkpoint))
    comparisons = [
        {**row, "baseline": before, "fine_tuned": after}
        for row, before, after in zip(held_out, baseline["predictions"], fine_tuned["predictions"], strict=True)
    ]
    summary = {
        "purpose": "Local training feasibility experiment; synthetic, unreviewed data; not a production translation model",
        "environment": {"platform": platform.platform(), "python": platform.python_version(),
                        "torch": torch.__version__, "transformers": transformers.__version__,
                        "device": str(device), "system_memory_gib": psutil.virtual_memory().total / 1024**3},
        "configuration": vars(args), "parameter_count": parameter_count,
        "data": {"train_pairs": len(train), "evaluation_pairs": len(held_out),
                 "train_sha256": hashlib.sha256((ROOT / "data" / "train.jsonl").read_bytes()).hexdigest(),
                 "evaluation_sha256": hashlib.sha256((ROOT / "data" / "eval.jsonl").read_bytes()).hexdigest()},
        "model_source": json.loads((output / "model_source.json").read_text()),
        "completed_optimizer_steps": len(history), "training_seconds": training_seconds,
        "median_step_seconds": statistics.median(row["seconds"] for row in history),
        "probe_weight_update_l2": update, "sampled_peak_memory_gib": memory.peak,
        "baseline": {key: value for key, value in baseline.items() if key != "predictions"},
        "fine_tuned": {key: value for key, value in fine_tuned.items() if key != "predictions"},
        "checkpoint_path": str(checkpoint), "comparisons": comparisons,
    }
    write_json(output / "results.json", summary)
    write_json(checkpoint / "experiment_metadata.json", {
        "purpose": summary["purpose"], "model_source": summary["model_source"],
        "data": summary["data"], "completed_optimizer_steps": len(history),
    })
    log("experiment_complete", completed_optimizer_steps=len(history),
        training_seconds=round(training_seconds, 2),
        baseline_chrf=round(baseline["chrf_plus_plus"], 2),
        fine_tuned_chrf=round(fine_tuned["chrf_plus_plus"], 2),
        sampled_peak_memory_gib=memory.peak, results=str(output / "results.json"))


if __name__ == "__main__":
    main()

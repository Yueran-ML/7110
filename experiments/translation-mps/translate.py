"""Translate a sentence with the downloaded base or experimental checkpoint."""

import argparse
import os
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parent
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import torch
from transformers import MarianMTModel, MarianTokenizer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("text", nargs="*")
    parser.add_argument("--checkpoint", choices=["base", "fine-tuned-smoke"], default="base")
    parser.add_argument("--device", choices=["auto", "mps", "cpu"], default="auto")
    args = parser.parse_args()
    device = "mps" if args.device == "auto" and torch.backends.mps.is_available() else args.device
    if device == "auto":
        device = "cpu"
    checkpoint = ROOT / "models" / args.checkpoint
    torch.set_num_threads(4)
    print("Loading the local translation model...", flush=True)
    tokenizer = MarianTokenizer.from_pretrained(checkpoint, local_files_only=True)
    model = MarianMTModel.from_pretrained(checkpoint, local_files_only=True).to(device).eval()
    print(f"Model: {args.checkpoint}; device: {device}", flush=True)
    def translate(text):
        encoded = tokenizer(text, return_tensors="pt")
        if encoded["input_ids"].shape[1] > 128:
            raise ValueError("This demonstration accepts short descriptions of at most 128 tokens")
        encoded = {key: value.to(device) for key, value in encoded.items()}
        started = time.perf_counter()
        with torch.inference_mode():
            generated = model.generate(**encoded, max_new_tokens=128, num_beams=2, do_sample=False)
        translated = tokenizer.decode(generated[0].cpu(), skip_special_tokens=True)
        print(f"{text}\n{translated}\n{time.perf_counter() - started:.2f}s", flush=True)

    if args.text:
        for text in args.text:
            translate(text)
    else:
        print("输入中文短句后回车。输入 /quit 退出。\n这是本地实验模型，翻译可能有误。", flush=True)
        while True:
            try:
                text = input("中文 > ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if text.lower() in {"/quit", "quit", "exit"}:
                break
            if text:
                try:
                    translate(text)
                except ValueError as error:
                    print(error, flush=True)


if __name__ == "__main__":
    main()

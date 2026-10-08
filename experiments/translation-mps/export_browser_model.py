"""Export and quantize the saved checkpoint for the self-hosted browser app."""

import hashlib
import argparse
import json
import os
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent.parent
os.environ.setdefault("HF_HOME", str(ROOT / ".cache" / "huggingface"))
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

import onnx
import numpy as np
import torch
from onnxruntime.quantization import QuantType, quantize_dynamic
from onnxruntime.quantization.shape_inference import quant_pre_process
from optimum.exporters.onnx import main_export
from transformers import MarianTokenizer


def fold_shared_transposes(path):
    # ONNX export may retain the tied LM head as a Transpose in an If branch.
    # Dynamic quantization only quantizes constant MatMul weights, so fold this
    # constant first and share it at the ancestor scope across both branches.
    model = onnx.load(path)
    initializers = {item.name: item for item in model.graph.initializer}

    def visit(graph):
        for node in list(graph.node):
            if node.op_type == "Transpose" and node.input[0] in initializers:
                value = onnx.numpy_helper.to_array(initializers[node.input[0]])
                permutation = next((list(attr.ints) for attr in node.attribute if attr.name == "perm"), None)
                folded = np.ascontiguousarray(np.transpose(value, permutation))
                name = node.output[0]
                if name in initializers:
                    if not np.array_equal(onnx.numpy_helper.to_array(initializers[name]), folded):
                        raise ValueError("Conflicting folded constants across decoder branches")
                else:
                    constant = onnx.numpy_helper.from_array(folded, name)
                    model.graph.initializer.append(constant)
                    initializers[name] = constant
                graph.node.remove(node)
            for attr in node.attribute:
                if attr.type == onnx.AttributeProto.GRAPH:
                    visit(attr.g)

    visit(model.graph)
    onnx.checker.check_model(model)
    onnx.save(model, path)


def remove_unused_initializers(path):
    model = onnx.load(path)
    referenced = set()

    def visit(graph):
        referenced.update(output.name for output in graph.output)
        for node in graph.node:
            referenced.update(node.input)
            for attr in node.attribute:
                if attr.type == onnx.AttributeProto.GRAPH:
                    visit(attr.g)

    visit(model.graph)
    for initializer in list(model.graph.initializer):
        if initializer.name not in referenced:
            model.graph.initializer.remove(initializer)
    onnx.checker.check_model(model)
    onnx.save(model, path)


def browser_tokenizer(tokenizer, checkpoint):
    # Marian's source/target SentencePiece vocabularies share the model ID space.
    # This follows Transformers.js's Marian conversion algorithm:
    # https://github.com/huggingface/transformers.js/blob/3.8.1/scripts/extra/marian.py
    vocabulary = json.loads((checkpoint / "vocab.json").read_text())
    special = set(tokenizer.all_special_tokens)
    scores = {}
    for spm in [tokenizer.spm_source, tokenizer.spm_target]:
        for index in range(spm.GetPieceSize()):
            piece = spm.IdToPiece(index)
            scores[piece] = max(scores.get(piece, -100.0), spm.GetScore(index))
    eos = tokenizer.eos_token
    end = {"SpecialToken": {"id": eos, "type_id": 0}}
    return {
        "version": "1.0", "truncation": None, "padding": None,
        "added_tokens": [
            {"id": vocabulary[token], "content": token, "special": True,
             "single_word": False, "lstrip": False, "rstrip": False, "normalized": False}
            for token in tokenizer.all_special_tokens
        ],
        "normalizer": {"type": "Precompiled", "precompiled_charsmap": None},
        "pre_tokenizer": {"type": "Sequence", "pretokenizers": [
            {"type": "WhitespaceSplit"},
            {"type": "Metaspace", "replacement": "▁", "add_prefix_space": True},
        ]},
        "post_processor": {"type": "TemplateProcessing",
            "single": [{"Sequence": {"id": "A", "type_id": 0}}, end],
            "pair": [{"Sequence": {"id": "A", "type_id": 0}}, end,
                     {"Sequence": {"id": "B", "type_id": 0}}, end],
            "special_tokens": {eos: {"id": eos, "ids": [tokenizer.eos_token_id], "tokens": [eos]}},
        },
        "decoder": {"type": "Metaspace", "replacement": "▁", "add_prefix_space": True},
        "model": {"type": "Unigram", "unk_id": vocabulary[tokenizer.unk_token],
                  "vocab": [[token, 0.0 if token in special else scores.get(token, -100.0)]
                            for token, _ in sorted(vocabulary.items(), key=lambda item: item[1])]},
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reuse-export", action="store_true")
    args = parser.parse_args()
    torch.set_num_threads(4)
    checkpoint = ROOT / "models" / "fine-tuned-smoke"
    full_precision = ROOT / "models" / "onnx-fp32"
    full_precision.mkdir(parents=True, exist_ok=True)
    os.chdir(full_precision)
    destination = PROJECT / "public" / "models" / "waypoint-zh-en-v1"
    destination.mkdir(parents=True, exist_ok=True)
    if not args.reuse_export:
        print("Exporting the fine-tuned checkpoint to ONNX (CPU)...", flush=True)
        main_export(
            str(checkpoint), output=full_precision, task="text2text-generation-with-past",
            opset=18, device="cpu", local_files_only=True, do_validation=True, atol=1e-4,
            batch_size=1, sequence_length=8, library_name="transformers",
        )
    output_graphs = destination / "onnx"
    output_graphs.mkdir(exist_ok=True)
    for name in ["encoder_model", "decoder_model_merged"]:
        target = output_graphs / f"{name}_quantized.onnx"
        prepared = full_precision / f"{name}_prepared.onnx"
        quant_pre_process(
            full_precision / f"{name}.onnx", prepared,
            skip_symbolic_shape=True, skip_onnx_shape=True,
        )
        fold_shared_transposes(prepared)
        print(f"Quantizing {name}...", flush=True)
        quantize_dynamic(
            str(prepared), str(target),
            weight_type=QuantType.QInt8, per_channel=True, reduce_range=True,
            op_types_to_quantize=["MatMul", "Gather"],
            extra_options={"EnableSubgraph": True, "MatMulConstBOnly": True},
        )
        remove_unused_initializers(target)
        onnx.checker.check_model(str(target))
        if target.stat().st_size >= 100 * 1024**2:
            raise ValueError(f"{target.name} exceeds the ordinary GitHub file limit")
    for name in ["config.json", "generation_config.json", "tokenizer_config.json", "special_tokens_map.json"]:
        shutil.copyfile(checkpoint / name, destination / name)
    tokenizer = MarianTokenizer.from_pretrained(checkpoint, local_files_only=True)
    (destination / "tokenizer.json").write_text(
        json.dumps(browser_tokenizer(tokenizer, checkpoint), ensure_ascii=False), encoding="utf-8",
    )
    results = json.loads((ROOT / "outputs" / "results.json").read_text())
    metadata = {
        "model_id": destination.name, "base_model": {key: value for key, value in results["model_source"].items() if key != "local_path"},
        "modification": "32 full-model fine-tuning steps on 64 AI-authored synthetic pairs; dynamic int8 ONNX conversion",
        "training_data_reviewed": False, "license": "CC-BY-4.0",
        "files": {str(file.relative_to(destination)): {
            "bytes": file.stat().st_size, "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
        } for file in sorted(destination.rglob("*")) if file.is_file() and file.name != "model-manifest.json"},
    }
    (destination / "model-manifest.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8",
    )
    print(json.dumps({"directory": str(destination), "files": metadata["files"]}, indent=2), flush=True)


if __name__ == "__main__":
    main()

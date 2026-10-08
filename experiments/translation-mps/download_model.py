"""Download only the required public model files using the Hugging Face CLI."""

import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
os.environ.setdefault("HF_HOME", str(ROOT / ".cache" / "huggingface"))
os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")

from huggingface_hub import HfApi


def main():
    repo = "Helsinki-NLP/opus-mt-zh-en"
    revision = "cf109095479db38d6df799875e34039d4938aaa6"
    info = HfApi().model_info(repo, revision=revision, token=False)
    available = {item.rfilename for item in info.siblings}
    weights = "model.safetensors" if "model.safetensors" in available else "pytorch_model.bin"
    wanted = {
        weights, "config.json", "generation_config.json", "source.spm", "target.spm",
        "tokenizer_config.json", "vocab.json", "special_tokens_map.json", "README.md",
    }
    files = sorted(wanted & available)
    destination = ROOT / "models" / "base"
    destination.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {repo} at revision {info.sha}", flush=True)
    subprocess.run(
        [str(Path(sys.executable).with_name("hf")), "download", repo,
         "--revision", info.sha, "--local-dir", str(destination),
         "--max-workers", "2", "--include", *files],
        check=True,
    )
    output = ROOT / "outputs"
    output.mkdir(exist_ok=True)
    record = {
        "repo": repo, "revision": info.sha, "files": files,
        "license": getattr(info.card_data, "license", None),
        "local_path": str(destination),
    }
    (output / "model_source.json").write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8",
    )
    print(json.dumps(record, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()

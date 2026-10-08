# Local M3 translation experiment

The local experiment succeeded on an Apple M3 MacBook Air with 16 GiB unified
memory. It used the MPS GPU backend for real forward/backward computation and
32 full-model optimizer updates. The existing Waypoint app was not changed or
deployed.

## Try it

Double-click `try_translation.command` in Finder. It opens Terminal, loads the
saved experimental model, and accepts Chinese short descriptions. Enter `/quit`
to exit. All inference is local. If Finder does not launch it, use:

```sh
cd /Users/yueran/Downloads/7110/experiments/translation-mps
.venv/bin/python translate.py --checkpoint fine-tuned-smoke
```

To compare against the unmodified base model:

```sh
.venv/bin/python translate.py --checkpoint base '我喉咙痛，没发烧，已经三天了。'
```

## Measured results

| Item | Result |
| --- | --- |
| Base model | Helsinki-NLP/opus-mt-zh-en, 77,943,296 parameters |
| Base revision | cf109095479db38d6df799875e34039d4938aaa6 |
| Training examples | 64 AI-authored synthetic Chinese/English pairs |
| Held-out examples | 12 AI-authored pairs with different scenarios |
| Optimizer steps | 32 |
| Batch / accumulation | 2 / 2, effective batch 4 |
| Maximum source/target length | 64 tokens; no example truncated |
| Training duration | 20.05 seconds, excluding setup, download, evaluation, saving |
| Median optimizer-step duration | 0.488 seconds |
| Sampled maximum MPS driver allocation | 2.420 GiB |
| Sampled maximum live MPS tensor allocation | 1.160 GiB |
| Sampled maximum process RSS | 0.405 GiB |
| Held-out chrF++ | 47.65 before; 58.93 after |
| Held-out token cross-entropy | 1.168 before; 0.967 after |

Memory columns describe different overlapping accounting views and must not be
added together. They are stage/step samples, not continuous absolute peaks.
Evaluation durations are not comparable inference-speed benchmarks because the
second evaluation benefits from already compiled GPU kernels and warm caches.

The saved checkpoint was independently reloaded and translated these new inputs:

| Chinese | Saved-model output |
| --- | --- |
| 我喉咙痛，没发烧，已经三天了。 | My throat is sore, I have no fever. It has been three days. |
| 我昨天吃了一片扑热息痛，但是今天还是头痛。 | I had a paracetamol yesterday, but I have a headache today. |

The first cold translation took 1.46 seconds and the next took 0.34 seconds on
this Mac, using beam size 2. These are two examples, not a phone benchmark.

## What this establishes

This proves local M3 training, checkpoint saving/reloading, and basic Chinese to
English inference work. It does not establish translation accuracy for real
users. The data is synthetic and has not been independently reviewed; chrF++ is
a text-similarity metric, not an accuracy percentage. Some apparent gains are
wording changes rather than corrections of meaning.

Known remaining problems in the held-out examples include:

- `气短` becomes `a little short` rather than `short of breath`.
- `金属味` becomes a smell rather than a taste.
- The decimal temperature `38.2` is formatted as `38:2`.
- Acid reflux is translated too literally.

These failures were recorded without retraining against the evaluation set.
See `outputs/results.json` for all 12 before/after comparisons and
`data/README.md` for the data provenance and limitations.

## Reproduce

Python 3.12 was used. The installed versions are recorded in
`requirements-lock.txt`.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python download_model.py
.venv/bin/python -u run_experiment.py
```

Within Codex, MPS access requires execution outside the default filesystem
sandbox. Running from a normal local Terminal can use MPS directly. The training
script requires MPS by default rather than silently switching to CPU; pass
`--device cpu` explicitly to test that path.

Model downloads, the isolated environment, logs, and checkpoints are ignored by
Git in this directory. The saved model has now been exported and quantized for
the Waypoint preparation card in `public/models/waypoint-zh-en-v1/`. The local
integration has not been pushed or deployed. To reproduce the browser export,
install `optimum-onnx[onnxruntime]`, `onnx`, `onnxruntime`, and `accelerate` in this
environment and run `.venv/bin/python export_browser_model.py`. Upstream weights are from
[Helsinki-NLP/opus-mt-zh-en](https://huggingface.co/Helsinki-NLP/opus-mt-zh-en),
developed by the University of Helsinki Language Technology Research Group,
under CC BY 4.0. The saved checkpoint is a modified version; keep this attribution
when distributing it.

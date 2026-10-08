# Waypoint Chinese to English prototype model

Base: [Helsinki-NLP/opus-mt-zh-en](https://huggingface.co/Helsinki-NLP/opus-mt-zh-en),
developed by the University of Helsinki Language Technology Research Group.
Base revision: `cf109095479db38d6df799875e34039d4938aaa6`.

License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
Retain the attribution, license link, and description of modifications when
redistributing this model.

Modifications by the Waypoint prototype: 32 full-model fine-tuning steps on 64
AI-authored synthetic Chinese/English pairs, followed by ONNX export and dynamic
int8 quantization. The data was not independently reviewed. Remaining errors
include breathlessness, reflux, taste descriptions and decimal formatting.

The tokenizer conversion follows the Marian algorithm from
[Transformers.js 3.8.1](https://github.com/huggingface/transformers.js/blob/3.8.1/scripts/extra/marian.py),
an Apache-2.0 project. The ONNX graphs and tokenizer are intended to run locally
in the browser. This folder contains the deployable model; it does not contain
the Python training environment or original full-precision weights.

`model-manifest.json` records model provenance and file checksums. Upload both
files in `onnx/` and all JSON files in this directory together.

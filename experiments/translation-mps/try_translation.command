#!/bin/zsh
cd -- "${0:A:h}" || exit 1
exec .venv/bin/python -u translate.py --checkpoint fine-tuned-smoke

# Synthetic smoke-test data

These 64 training pairs and 12 held-out evaluation pairs were drafted by the AI
assistant for a local training experiment. They contain invented symptom
descriptions, not patient records or COMP7110 interview data. They have not been
independently reviewed by a bilingual medical professional.

Evaluation scenarios are intentionally different from the training scenarios.
Generic language and some terms necessarily overlap. The evaluation set is too
small and too artificial to establish translation quality for real users.
Do not tune training choices against this set or report these scores as a
clinical benchmark. Review negations, timing, quantities, and symptom meaning
alongside any automatic translation metric.

The aim is to verify that the M3 can load the model, translate examples, perform
real gradient updates, save a checkpoint, and report measured time and memory.

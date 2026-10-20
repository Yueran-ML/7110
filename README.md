# Waypoint

A mobile-first prototype that answers one question for international students using a GP in Australia: **what do I do next, and by when?**

It covers one healthcare pathway, the routine GP visit for a non-emergency illness, in three stages, then keeps the dates that follow.

- **Before**: the questions to ask when you book and why each answer matters, which service is for what, how the money moves with OSHC, what to bring.
- **Visit**: write symptoms and what you have tried in Chinese or English. Chinese notes can be translated locally into editable English before you show or copy the prep card. The original notes remain visible underneath.
- **After**: tap what you left the clinic with (prescription, referral, pathology form, receipt, certificate) and get the next steps, each labelled with who does it: you, the clinic, the pharmacy, the insurer or the university.
- **Dates to watch**: enter the visit date. The app works out when the prescription expires and when a referral's 12 months run out, and asks for the dates only you can know: the specialist appointment, the follow-up, the OSHC claim deadline, the university deadline. They stay on the phone and show on the home screen until ticked off.

Plus private notes that never leave the phone, and a bilingual glossary reachable from each screen.

## Why not just ask a chatbot

A chatbot answers the question you ask. The students we interviewed knew the medical advice but did not know there was a next administrative step, so they never asked. Waypoint pushes those steps and dates at you and remembers them: three weeks later it still knows your claim window is closing. It also states only rules it can name a source for.

## What it deliberately does not do

- No diagnosis or symptom triage. Unsure how serious it is? The app points to Healthdirect (1800 022 222) and 000.
- No cost or coverage promises. Every fee statement says what to ask and who to ask.
- No accounts, no backend, no health data stored anywhere but the user's own browser (`localStorage`).
- No doctor-side features. Whether clinics would distribute or contribute is a hypothesis to test by interview, not by code.
- No numbers it cannot source. Where a deadline depends on the insurer, the university or the doctor, the app asks the user to enter it instead of guessing.

## Rules the app states, and what to verify before participant testing

| Clock | Rule as shown in the app | Source named | Team to do |
|---|---|---|---|
| Prescription and repeats expire | 12 months from the date written; some medicines shorter | Services Australia (PBS) | Check the PBS prescription-validity page and the Queensland medicines regulation for private scripts |
| Referral covers visits until | 12 months from the first specialist appointment, unless the GP wrote otherwise | Services Australia (Medicare referral rules) | Check the Services Australia referrals page; ask one OSHC insurer whether it applies the same rule to specialist claims |
| OSHC claim deadline | Entered by the user; +12 and +24 month shortcuts | The user's policy | Shortcuts are conveniences, not a rule; confirm no major OSHC insurer uses a shorter limit |
| University deadline for the certificate | Entered by the user | The user's course rule | none |
| Go back if not better by; follow-up | Entered by the user; +3, +7, +14 day shortcuts | The doctor | none |

Clinics near campus (`places` in `src/content.js`) appear only after a team member has phoned the clinic and filled in `verified` (date) and `directBills`. Nothing there is copied from a website or a chatbot.

## Evidence

Built from the COMP7110 team Gita discovery record: de-identified interview records P007, P008, P014, P016, P019 to P022, the team synthesis, hypotheses H1 to H5 and the learning cards. The recurring gaps it targets are the pre-visit decision and cost uncertainty, medical vocabulary in the room, and the post-visit hand-off (prescription, referral, claim) where students knew the advice but not the next administrative step.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # source/translation invalidation checks
npm run build    # complete static website in dist/, including the model
```

Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## Where the source lives

This repository builds the prototype and deploys it to GitHub Pages. The same source, including the model files, is also kept in the COMP7110 team repository under `apps/waypoint/`, where it is not deployed. That copy leaves out this README and the Pages workflow.

## Local translation and uploading

The prototype includes a modified `Helsinki-NLP/opus-mt-zh-en` model, fine-tuned
locally for 32 steps on 64 AI-authored synthetic bilingual examples. It is an
experimental translation aid, and some symptoms and quantities still translate
incorrectly. The editable English fields let the user correct wording before
copying. Editing a Chinese source invalidates its old translation; a late
background response cannot replace a newer input.

Translation runs in a Web Worker with Transformers.js 3.8.1 and the WASM backend.
The first use downloads approximately 150 MB of model files plus the runtime.
Model files may be cached by the browser; cache retention depends on the browser
and available space. User text is not sent to a translation API. The model and
runtime are served from this website, with no remote Hugging Face model fallback.
Other app functions do not require loading the translation model.

The deployable model is committed as regular files in
`public/models/waypoint-zh-en-v1/`. Its two ONNX files are approximately 50 MiB and
89 MiB, each below GitHub's 100 MiB per-file limit. Include **all** files in this
folder when submitting changes in GitHub Desktop. Large-file warnings above
50 MiB are expected. Use GitHub Desktop rather than the GitHub website's file
upload control, which has a lower per-file limit.

The runtime in `public/runtime/onnx/` is generated from the locked npm dependencies
by `predev`/`prebuild`; it is intentionally ignored by Git. The existing Actions
workflow runs `npm ci` and `npm run build`, which generates and publishes it along
with the frontend and model. The app is now a multi-file static build; distribute
the whole `dist` directory when serving it directly, rather than just its HTML.
Paths are relative so the deployed `/7110/` project URL works.

In GitHub Desktop, review the changes, commit them to `main`, then click
**Push origin**. Wait for the **Deploy to GitHub Pages** workflow to succeed.
The Python experiment directory has its own ignore rules for virtual
environments, logs and the original full-precision checkpoints; those large files
do not need to be uploaded. Neither an inference server nor Python is needed by
the deployed website.

Model attribution and modifications are documented in the model folder. The
local training experiment and reproducible export script are in
`experiments/translation-mps/`. Starting a new visit also clears prep-card inputs,
English translations and the packed checklist.

## Status

Prototype for research testing, Iteration 2 of COMP7110 (University of Queensland, 2026 semester 2). Content dated 2026-09-18. Material AI assistance was used to structure and draft the code and copy; the team reviews all content against the interview evidence before it is tested with participants.

# Waypoint

A mobile-first prototype that answers one question for international students using a GP in Australia: **what do I do next?**

It covers one healthcare pathway, the routine GP visit for a non-emergency illness, in three stages:

- **Before**: which service is for what, how the money moves with OSHC, what to ask when booking.
- **Visit**: a prep card that turns your symptoms into a sentence you can show the doctor, with a Chinese mirror for you.
- **After**: tap what you left the clinic with (prescription, referral, pathology form, receipt, certificate) and get the next steps, each labelled with who does it: you, the clinic, the pharmacy, the insurer or the university.

Plus a bilingual glossary of the words that appear on forms and receipts, and private notes that never leave the phone.

## What it deliberately does not do

- No diagnosis or symptom triage. Unsure how serious it is? The app points to Healthdirect (1800 022 222) and 000.
- No cost or coverage promises. Every fee statement says what to ask and who to ask.
- No accounts, no backend, no health data stored anywhere but the user's own browser (`localStorage`).
- No doctor-side features. Whether clinics would distribute or contribute is a hypothesis to test by interview, not by code.

## Evidence

Built from the COMP7110 team Gita discovery record: de-identified interview records P007, P008, P014, P016, P019 to P022, the team synthesis, hypotheses H1 to H5 and the learning cards. The recurring gaps it targets are the pre-visit decision and cost uncertainty, medical vocabulary in the room, and the post-visit hand-off (prescription, referral, claim) where students knew the advice but not the next administrative step.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # single-file build in dist/index.html
```

Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## Status

Prototype for research testing, Iteration 2 of COMP7110 (University of Queensland, 2026 semester 2). Content dated 2026-09-04. Material AI assistance was used to structure and draft the code and copy; the team reviews all content against the interview evidence before it is tested with participants.

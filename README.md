# Waypoint

A mobile-first prototype that answers one question for international students using a GP in Australia: **what do I do next, and by when?**

It covers one healthcare pathway, the routine GP visit for a non-emergency illness, in three stages, then keeps the dates that follow.

- **Before**: the questions to ask when you book and why each answer matters, which service is for what, how the money moves with OSHC, what to bring.
- **Visit**: a prep card that turns your symptoms into a sentence you can show the doctor, with a Chinese mirror for you.
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
npm run build    # single-file build in dist/index.html
```

Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## Status

Prototype for research testing, Iteration 2 of COMP7110 (University of Queensland, 2026 semester 2). Content dated 2026-09-18. Material AI assistance was used to structure and draft the code and copy; the team reviews all content against the interview evidence before it is tested with participants.

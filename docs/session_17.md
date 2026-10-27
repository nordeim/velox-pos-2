# Session-17 narration — the Session-11 work cycle

*(the working log of the cycle; the formal record is
`docs/remediation-plan-session-11.md` and the worklog entry)*

The workspace had been reset — fresh `git clone` + `cp .env.example .env`
(AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"` per the contract)
+ `bun install` + `db:push` + `db:seed -- --demo` + `bunx playwright install
chromium` (1243). **Received-tree gate: GREEN on first run** — lint 0 errors
(1 documented warning) · tsc clean · unit 133/133 · build green
(hygiene-clean; `ƒ /` in the route table) · smoke 13/13 · e2e 84/84. The
Session-10 baseline held.

**The reference re-measured live end-to-end — NO drift for the FIFTH
consecutive cycle** (the sidebar chrome, the POS gate, both stat families,
the Reports pills, the Settings fiscal labels + Save + Add, the Inventory
chips, the Spanish copy, the login internals incl. the F-59 blur(4px), the
`/` landing, the reference's own mobile defect at 390×844 — every pinned
surface byte-exact). With the style surface stable five cycles running, the
audit went to a NEW depth: **the dialog family** (each dialog opens
client-side — the reference 403s writes, but opening is free) and **the
form-text color census** — the container/color layer no prior session had
ever measured.

Six findings, all clone-side (the ledger is
`docs/remediation-plan-session-11.md`):

- **F-70 (HIGH — the headline)**: the login's TYPED credentials computed
  `rgb(231,233,239)` — near-white on the near-white card, INVISIBLE since
  Session-101. The base inputs carried no text color, so the `.theme-light`
  scope's foreground re-point never REACHED the fields. Every e2e passed
  (fills don't read rendered text) and every screenshot showed the EMPTY
  form. Cured at the root (`text-foreground` on the base Input/Textarea +
  the scoped foreground to zinc-950) and pinned on the TYPED text.
- **F-64**: the reference's dialogs are SOLID `#0f121a` + `#262a36` + NO
  blur; the clone's `glass-dark border-edge` pair was doubly wrong (the
  values mismatched AND the border-edge utility was inert — trap #15). The
  strips swept 11 dialog sites AND four SelectContent sites carrying the
  same inert pair; `--card` re-pointed; the Close hit-area to 36px. The
  mobile drawer keeps glass-dark by design (the superset surface).
- **F-66**: the reference's form text is ONE family — labels, dialog titles,
  and input text ALL `#e7e9ef`; the clone's 35 `text-white/70` labels + 11
  `text-white` titles + ~30 per-field input overrides bypassed the token
  the whole time. The base components own the color now. En-route catch: the
  `--foreground` triplet `221 28% 93%` computed `#e8ebf2` — its "#e7e9ef"
  comment was a rounding approximation; all five foreground-family triplets
  re-pointed to the exact `225 20% 92%`.
- **F-67**: six dialog Cancellations + two AlertDialogCancels + the receipt
  "Cerrar" were bare ghosts; the reference's Cancel is the gray
  `glass-button` family — the clone's own category-dialog pattern applied
  everywhere.
- **F-68**: the New Register dialog 448 → 512px (`sm:max-w-lg`).
- **F-69**: the select dropdown surface `#10121e` → `#161922` (the measured
  listbox).
- **F-65 (RETRACTED)**: the "outline Create" reading missed the
  `background-image` gradient layer — the clone's `glass-button-primary`
  was byte-exact all along. Trap #23 records the two-layer lesson: measure
  `background-color` AND `background-image` before concluding.

**TDD:** all pins red-first (231,233,239≠9,9,11; glass-dark≠solid;
white/70≠#e7e9ef; transparent≠gray; 448≠512), then green. En-route: the raw
dialog-width reads raced the zoom-in-95 entrance (511.58 mid-zoom) — all
three width pins hardened to `expect.poll` (the F-51 doctrine, third
strike).

**Re-certification:** lint 0 · tsc · unit **133/133** · build green
(hygiene-clean) · smoke **13/13** · e2e **88/88** (+4 pins). Live evidence
**12/12** on the rebuilt standalone (all six fixes measured live + the
checkout journey T-000039 + the mobile drawer contract at 390×844). VLM
sweep of screenshots 55–60: **6/6 effective** (including the typed-text
legibility check). Docs lockstep: README, AGENTS (the dialog/form-text
contracts), CLAUDE, PAD v1.9, SKILL v2.7.0 (traps 22/23/24 + the Session-11
addendum), the docs-counts constants, the session narration (this file),
and the worklog.

Pushed to `main` via the SSH wrapper; the operator key shredded after.

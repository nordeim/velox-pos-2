# Session-15 narration — the Session-10 work cycle

*(the working log of the cycle; the formal record is
`docs/remediation-plan-session-10.md` and the worklog entry)*

The workspace had been reset — fresh `git clone` + `cp .env.example .env`
(AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"` per the contract)
+ `bun install` + `db:push` + `db:seed -- --demo` + `bunx playwright install
chromium` (1243). **Received-tree gate: GREEN on first run** — lint 0 errors
(1 documented warning) · tsc clean · unit 133/133 · build green · smoke 13/13
· e2e 80/80. The Session-9 baseline held.

**The reference re-measured live end-to-end — NO drift for the FOURTH
consecutive cycle** (the sidebar chrome, the POS gate, the Dashboard h3s +
weekday axes, the Inventory chips, the Reports pills + container, the Settings
fiscal labels + Save + Add, the Spanish copy, the login internals, the
reference's own mobile defect at 390×844 — every pinned surface byte-exact,
and the nav hrefs censused for the first time: the reference's 8 hrefs are the
clone's exact paths). With the style surface stable four cycles running, the
audit went to a NEW depth: **whole-DOM dumps** of the stat-card families, the
empty-state census, and the muted-tone sweep — surfaces every prior session
had only ever copy-pinned.

Five findings, all clone-side (the ledger is
`docs/remediation-plan-session-10.md`):

- **F-59** — the login card's `backdrop-blur-sm` computed 8px in v4 (the blur
  scale was renamed; v3's 4px is v4's `backdrop-blur-xs`). The trap was
  documented AND correctly applied to the drawer backdrop — but missed on the
  login card, and nothing pinned the computed filter. Cured + pinned.
- **F-60** — the reference lands on `/` after login; the clone landed on
  `/POS`. The redirect now defaults to `/` and a new `(app)/page.tsx` serves
  the terminal at the root (the router already mapped it; no route existed).
- **F-61** — the Dashboard stat family: the reference ships SOLID-GRADIENT
  40px chips with WHITE icons + gradient opacity-20 corner blobs + semibold
  slate-500 labels + bold mt-1 values. The clone's invented flat /20 chips had
  survived because the copy was pinned and the treatments were not. The exact
  gradients live as `.stat-grad-*` CSS classes (the utility gradients
  serialize `lab()` stops — the `.brand-chip` doctrine, re-caught live). The
  value color keeps the readable superset (the reference's slate-800 values
  are its VLM-confirmed near-invisible defect).
- **F-62** — the Reports stat family is DIFFERENT on the reference
  (horizontal cards, 48px rounded-2xl /15+/30 chips on the LEFT, w-6 tone-400
  icons, 400 white/35 labels, font-black values, no blob). The dedicated
  `ReportsStat` component now serves it. Also surfaced: `text-indigo-400`
  computed `lab(...)` until the unpinned `--color-indigo-400: #818cf8` hex
  was added to the `@theme` block.
- **F-63** — the systematic muted-tone substitution: the reference's slate-500
  subtitles, slate-400 empty copy, 64px slate-200 stroke-2 empty icons,
  white/25 cart copy, and py-12 rhythms had all been substituted with white/xx
  variants across seven views. Matched verbatim, site by site.

**TDD:** all five fixes red-first (8px≠4px, /POS≠/, 44px≠40px, 44px≠48px,
white/50≠slate-500), then green. Two en-route lessons: `toHaveURL` regexes
match the FULL url string (the landing pin needs the predicate form), and the
Registers empty-card pins are order-dependent (they moved to
registers-shifts.spec's first test, where the empty state is guaranteed — the
full-suite run caught what the isolated run passed).

**Re-certification:** lint 0 · tsc · unit **133/133** · build green
(hygiene-clean; `ƒ /` in the route table) · smoke **13/13** · e2e **84/84**
(+4 pins). Live evidence **12/12** on the rebuilt standalone (all five fixes
measured live + the checkout journey + the drawer contract at 390×844). VLM
sweep of screenshots 49–54: **6/6 effective**. Docs lockstep: README, AGENTS
(the new stat-card + muted-tone contracts section), CLAUDE, PAD v1.8,
SKILL v2.6.0 (traps 19/20/21 + the Session-10 addendum), the docs-counts
constants, the session narration (this file), and the worklog.

Pushed to `main` via the SSH wrapper; the operator key shredded after.

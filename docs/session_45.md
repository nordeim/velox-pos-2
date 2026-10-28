# Session 45 — the Session-25 cycle narration

> The numbering convention, continued: the Session-25 remediation cycle (the ledger is
> `docs/remediation-plan-session-25.md`) narrates as session_45 — session_43 was the
> Session-24 cycle's own narration, session_44 the operator's raw-log commit of that same
> conversation, so the sequence moves to 45. Companion: the worklog's Session-25 entry
> (the condensed record) and the plan (the full verification ledger V1–V19 + the
> execution record).

This cycle opened with a clone, not a pull: the sandbox workspace had been RESET since
the Session-24 push — the checkout, the persisted sweep scripts, and the bin/ssh shim
all gone — so the documented rebuild ran in full: a fresh `.env` with a new 64-hex
secret, `bun install`, `db:push` + `db:seed`, and a chromium-1243 install. The
received-tree fast gate ran green on arrival (lint 0 with the one documented warning,
tsc, unit 151/151), and the static sweeps came back clean after their tooling was
recreated: the zero-importer census (one fix during recreation — the first draft's
import regex missed the `from "..."` form and flagged twenty-five false-positive dead
files before the convention entries were restored) found zero dead files across 146
scanned sources; the credential checker (also recreated, also with one fix — the scrypt
salt must be DECODED from hex, mirroring `verifyPassword` exactly, or the freshly seeded
hash never matches) verified the documented credential; and the Session-24 code review
confirmed the prior commit had touched exactly what its plan said — the CSV walk spec,
the s24 evidence script, the count lockstep, and the docs. Zero unplanned production
code; this cycle's own diff would turn out to be the same shape, with one test-tier
exception the gate itself would surface.

The reference sweep ran next — the NINETEENTH consecutive cycle — and every standing
pin held byte-exact: the login card's blur(4px) and white/95 and 16px radius and
30px/700 h1 and 48px inputs and 54px SSO buttons; the F-76 alert's exact copy and
red-50/0.7 wash (re-verified with wrong credentials); the post-login landing on `/`
with the 220px sidebar and its eight links; the Dashboard's date line and its two
16px/700 chart headings; the Spanish families on Sales and Cashiers with "Turnos
Recientes" still an H3. The reference's OWN mobile defect — the D-1 drift Session-21
caught — is STABLE: no hamburger, the static 220px sidebar, main crushed to 170px
beside it, the document computing exactly 390. The reference's Reports surface is
still empty (2× "No data for this period") — the demo account remains write-restricted,
so the with-data tiers stay the functional superset. The reference mobile capture was
refreshed for the cycle's record.

Then the clone-side verification, the operator's standing priority: the mobile drawer
probed live on the dev server at 390×844 with REAL clicks throughout (the Session-24
V14 law, now in AGENTS) — the labeled hamburger, the dialog semantics with its eight
labeled links at 288px, the tw-animate-css `animation-name: enter`, focus moving to the
close button on open, the body scroll-lock, Escape restoring the hamburger's focus and
releasing the lock, drawer navigation unmounting it, zero horizontal overflow. No
Tailwind v4 regression anywhere in the chain; the 13 mobile e2e pins would stay green
through both full-suite runs. (The fresh dev boot logs the documented
`instrumentation.ts` Edge-Runtime warning about `process.exit` — pre-existing,
production boot-guard only; the page compiles and serves 200.)

The session_43 pointer had named three candidates for this cycle's depth. The receipt's
PDF/email shape remains unmeasurable on the write-gated reference and stays a future
candidate. The Registers shift-lifecycle dialogs were weighed and found already pinned
— registers-shifts.spec's five tests cover the open/close/variance/delete journeys
through the real dialogs. The StoreSettings save→toast candidate was chosen, and the
ANALYZE took it to its deepest unpinned chain: not the basic save (surfaces.spec
already pins the store-name round-trip) but the FISCAL receipt round-trip — the fiscal
Switch's inverted wiring (`checked={!form.hideFiscalOnReceipt}`, switch ON = "Visible
on receipt"), the RUC/regime fills, the save payload, the `setSettings` store refresh,
and finally the RECEIPT's fiscal conditional
`!settings?.hideFiscalOnReceipt && (settings?.fiscalRuc || settings?.taxId)` rendering
the dashed-border RUC line — a chain that crosses THREE surfaces (settings → store →
terminal receipt) and was e2e-invisible in BOTH render states. The live probes measured
every leg correct: the flip + fill + save persisted the state (API verified), a full
UI checkout rendered the fiscal line with the exact RUC text, the POLARITY state (the
toggle off, the RUC still set) rendered nothing — the guard proven, not just
empty-field absence — and the restore returned the seed defaults.

The cure follows the F-119/F-121/F-122 patterns:
`tests/e2e/with-data-fiscal-receipt-walk.spec.ts`, provisioning its idempotent
"Fiscal Walk" chain (the POSTs asserted, the F-120 law) and pinning both states — the
visible state (flip + fill + save + toast + the API-persisted `hideFiscalOnReceipt:
false` + the RUC + a real checkout through the terminal + the receipt's fiscal line
asserted by its EXACT template text `FWALK-RUC-001 · S-Corp Test` inside
`.receipt-print` + the shift closed with an exact-variance count) and the gated
polarity (the flag off with the RUC still set + the API verify that both persist + the
second checkout rendering NO fiscal line + the full restore to seed defaults). The
spec's first run failed ONE step — its own probe bug, caught by strict mode: TWO
inputs on the page carry the "Tax ID / EIN" label (Business Information's `taxId` and
the fiscal card's `fiscalRuc`), and the restore's unscoped `getByLabel` resolved to
both. The fix scopes every fiscal-field locator to the `region "Fiscal / Tax Data"`;
the law is now in AGENTS. Both tests then passed; zero production-code changes.

The ordering analysis is part of the record: FOUR specs now persist data, and the file
names carry the constraint — the fiscal walk sorts between the dashboard walk and the
inventory CSV walk (d < f < i < r). Its sales and product perturb no product- or
sale-derived pin (every downstream walk derives from the API at runtime — verified
before the spec landed, the reports walk carrying no hardcoded tickets), and the
self-clean law is EXTENDED to the settings surface: both shifts closed with
exact-variance counts, the settings restored to seed defaults — and even a mid-test
failure leaves a safe state for the remaining specs, because the downstream walks are
settings-independent by construction. The count lockstep rode in the same commit: E2E
113 → 115, specs 11 → 12, desktop 99 → 101, the "Session-24 lock" literal becoming the
Session-25 lock, and every live-tense site moving — README's badge and scripts and
testing section, CLAUDE's baseline plus the four-walk ordering law, AGENTS's Session-25
fiscal round-trip contracts (the inverted-wiring law, the receipt's conditional as law,
the settings self-clean extension, the two-fields-one-label scoping law), PAD v1.23
with its revision block and spec map, the SKILL v2.21.0 with the Session-25 addendum.

The full gate then surfaced the cycle's second finding — the kind only a FRESH
environment can expose. The two evidence harnesses that had been green for eight
cycles failed one check each on this cycle's freshly seeded demo db (s17 18/19, s18
19/20). The forensics queried the db directly and found the boundary: the demo seed's
sale timestamps are relative to the SEED time, so which of the day-6 sales fall inside
the 7-day CALENDAR window depends on the hour the db was seeded — a morning-seeded db
carries 29 sales/$369.46 in the window, while the afternoon-seeded recording that the
Session-17 hardcodes captured carried 28/$366.56 (the difference exactly the boundary
sale T-000005, $2.90, landing at 01:02 of the window's first day). The PAGE derived
correctly both times — the runtime-derivation design working as intended — only the
harnesses' hardcoded 7-day literals had drifted, invisibly, because every prior cycle's
demo db was warm since Session-22 and never re-seeded. The cure is the harness family's
own law applied retroactively: s17's 7-day check now derives its expectation from the
sales API at runtime (mirroring `periodStart(7)`'s exact semantics), and s18's truth
block now derives a `week {n, sum}` pair that its coherence check asserts against.
Both harnesses re-ran green: 19/19 and 20/20, alongside s16's unaffected 13/13.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
151/151 (15 files — unmoved) · build · smoke 13/13 · e2e 115/115 — twice, consecutively
— with the fixtures and the self-clean verified in the post-run db (the settings at
seed defaults, zero open shifts, both fiscal shifts closed at 103.25, the product's
stock correctly decremented by the two checkouts). The evidence tier got its record:
the committed self-provisioning `scripts/capture-s25-evidence.mjs`, capturing
screenshots 111–113 from the remediated dev server — 111 the fiscal settings card with
the toggle ON and the fields filled (the API state verified live), 112 the receipt
rendering the fiscal line (the checkout driven through the real terminal), 113 the
mobile drawer at 390 — the captures verified distinct before commit (the Session-24
byte-identical lesson), and the script's own self-clean verified live. The next cycle's
candidates: the receipt's PDF/email shape (still a pure-superset feature build), a
with-data walk of the Cashiers shift-ledger interactions, or the auth surface's
password-reset round-trip at the suite tier.

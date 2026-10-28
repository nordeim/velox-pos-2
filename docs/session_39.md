# Session 39 — the Session-22 cycle narration

> The numbering convention, continued: the Session-22 remediation cycle (the ledger is
> `docs/remediation-plan-session-22.md`) narrates as session_39 — session_37 was the
> Session-21 cycle's own narration, session_38 the operator's raw-log commit of that same
> conversation, so the sequence moves to 39. Companion: the worklog's Session-22 entry
> (the condensed record) and the plan (the full verification ledger V1–V19 + the
> execution record).

This cycle opened with a clone, not a pull: the sandbox workspace had been reset, so the
refresh was `git clone` onto `126c45d` (the Session-21 push plus the operator's session_38
raw-log commit) and the documented rebuild ran in full — a fresh 64-hex AUTH_SECRET in a
regenerated `.env`, `bun install`, `db:push` + `db:seed`, chromium-1243 installed (the
cache carried only 1200). The received-tree gate ran fully green on arrival — lint 0 (the
one documented warning), tsc, unit 151/151, build, smoke 13/13, e2e 107/107 — and the
static sweeps came back clean: zero dead files (the census script recreated outside the
repo after the sandbox reset took the persisted copy), secrets confined to test fixtures,
the documented credential verifying against the dev db (the checker runs under bun — its
first draft assumed a 4-part hash shape and was corrected to the repo's 3-part
`scrypt$salt$key`), and the Session-21 code review confirming the prior commits had
touched exactly the surgical `loadCore` fix, the restructured walk, the store regression
test, the count lockstep, and the docs.

The reference sweep ran next — the SIXTEENTH consecutive cycle — and every standing pin
held byte-exact: the login card's blur(4px) and white/95 and 16px radius and 30px/700 h1
and 48px inputs; the F-76 alert's exact copy and red-50/0.7 wash; the 220px sidebar with
its eight links and the `/` landing; the Dashboard date line ("Wednesday, October 28,
2026") and its two 16px/700 chart headings; the Spanish families on Sales and Cashiers
with "Turnos Recientes" still an H3. The reference's OWN mobile defect — the D-1 drift
Session-21 caught — is STABLE in its new shape: no hamburger, the static 220px sidebar,
and now the document computing exactly 390 on every route with main crushed to 170px
beside the rail. No new drift; the D-1 record still describes the reference exactly; the
clone's drawer superset remains strictly better.

Then the clone-side verification, the operator's standing priority: the mobile drawer
probed live on the dev server at 390×844 — the labeled hamburger, the dialog semantics
with its eight labeled links at 288px, focus moving to the close button on open, the body
scroll-lock while open, Escape restoring the hamburger's focus and releasing the lock,
drawer navigation unmounting it, zero horizontal overflow. No Tailwind v4 regression
anywhere in the chain: the plain-CSS glass-* doctrine, `@theme inline`, and the
`@custom-variant hover` unwrap all hold, and the 13 mobile e2e pins stay green.

Then the NEW depth, on the session_37 pointer: the with-data Reports walk. The reference
side first — its Reports surface is EMPTY ($0.00 stats, twice "No data for this period"):
the demo account is write-restricted, so the with-data shape is unmeasurable on the
reference (the same posture as the receipt PDF/email shape). The with-data tier is
therefore a functional-superset addition, exactly the s20/s21 lineage. The clone-side
ANALYZE came next: the fixture chain provisioned through the API (a cash sale and a card
sale — the byMethod two-row shape), and both widths measured CORRECT with data — the
stats rendering EXACTLY the API-derived values ($9.75 / 2 / $4.88), both method tables
with their share bars (cash 67% emerald first, card 33% violet), the chart's topmost tick
at $10 covering the $9.75 data, and the surface contained at 390 with the chart's right
edge at 353. The finding was the missing protection (F-119): every standing Reports pin
is empty-state, and the CHAIN — the API's sales list through the store's collection
through the memoized summarize/dailySeries/byMethod values to the DOM testids — was
e2e-invisible. The cure is `tests/e2e/with-data-reports-walk.spec.ts`: the exact wiring
pin (the expected values DERIVED FROM THE API at runtime, never hardcoded) plus the
with-data containment at 390.

And the ANALYZE earned its keep before the spec even landed. The provisioning script's
first sale POST 400'd on `items.0.name` — and the forensics that followed exposed a real
latent defect in the STANDING suite (F-120): the Session-21 drift-sweep walk's fixture
sale POST carried the same pre-contract `quantity` payload and had been silently 400ing
for two sessions. `sale.ticket` was always undefined; `filter({ hasText: undefined })`
applies NO filter; the Sales leg's settled wait matched ANY row — terminal.spec's sale
when it ran first, the empty-state td row on a colder db. The walk had passed 107/107
twice with ZERO "Drift Sweep" sales in the db (verified directly against the post-run
e2e.db). The cure: the contract-correct line payload plus `expect(resp.ok())` on every
provisioning POST — in the walk, in the committed s21 evidence script (whose capture 99
had been showing whatever sales the dev db already carried), and in this cycle's own s22
provisioning. The walk re-ran green with the fixture sale VERIFIED in the db; the s21
script re-ran green with captures 99–101 refreshed to show the fixture's own ticket row.

The spec's own first run failed on a test-wiring bug worth recording: the method-name
span CONTAINS the count span as a child, so the name span's textContent is the composite
"cash(1)" — the name-alone assertion failed and the pin now asserts the composite. And
the spec's file name is load-bearing by design: `with-data-reports-walk.spec.ts` sorts
LAST in the chromium project because it PERSISTS sales — surfaces.spec's empty-Reports
pin ("No data for this period" visible) must run before the walk's data exists. Both
lessons are now in AGENTS.

The counts moved in the same commit as the suite: E2E 107 → 109, specs 8 → 9, desktop 93
→ 95 (UNIT stays 151/15). The lockstep rode every live-tense site — the docs-counts
constants and the "Session-21 lock" → "Session-22 lock" literal, README's badge and
scripts and testing, CLAUDE's baseline plus the persistence-ordering law, AGENTS' Session-22
with-data contracts plus the F-120 POST-assertion law, PAD v1.20 with its revision block
and spec map, the SKILL v2.18.0 with the Session-22 addendum.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit 151/151
(15 files) · build · smoke 13/13 · e2e 109/109 — twice, consecutively, on the F-120-cured
tree, with both fixtures verified in the db. The three with-data evidence harnesses all
green (s16 13/13, s17 19/19, s18 20/20). The evidence tier got its record:
`scripts/capture-s22-evidence.mjs`, self-provisioning in the family posture, captured
screenshots 102–104 from the remediated dev server — 102 the with-data Reports desktop
(the derivation verified live against a warm db carrying THREE sales from two different
fixtures, $14.75/3 — the runtime-derivation design proving exactly why hardcoded values
are forbidden), 103 the with-data Reports contained at 390, 104 the mobile drawer — plus
the refreshed 99–101 (the F-120 repair) and the D-1-shape reference capture. The next
cycle's candidates: the receipt's PDF/email shape (still unmeasurable on the
write-gated reference), a with-data walk of the Dashboard's chart families at the
remaining widths, or a deeper probe of the store's bootstrap pair now that the sales
collection has its own with-data consumer.

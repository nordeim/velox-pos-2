# Session 43 — the Session-24 cycle narration

> The numbering convention, continued: the Session-24 remediation cycle (the ledger is
> `docs/remediation-plan-session-24.md`) narrates as session_43 — session_41 was the
> Session-23 cycle's own narration, session_42 the operator's raw-log commit of that same
> conversation, so the sequence moves to 43. Companion: the worklog's Session-24 entry
> (the condensed record) and the plan (the full verification ledger V1–V19 + the
> execution record).

This cycle opened with a pull, not a clone: the sandbox workspace had SURVIVED since the
Session-23 push, so the refresh was a fast-forward onto `ae2d395` (the Session-23 push
plus the operator's session_42 raw-log commit) and the documented rebuild was not needed —
the `.env` with its 64-hex secret, the `db/` directory with its four database files, the
node_modules, and the chromium cache all intact. The received-tree fast gate ran green on
arrival (lint 0 with the one documented warning, tsc, unit 151/151), and the static sweeps
came back clean: zero dead files across 144 scanned sources (two more than Session-23 —
its spec and its evidence script), no live secrets, the documented credential verifying
against the dev db, and the Session-23 code review confirming the prior commit had touched
exactly what its plan said — the dashboard-walk spec, the s23 evidence script, the count
lockstep, and the docs. Zero unplanned production code; this cycle's own diff would turn
out to be the same shape.

The reference sweep ran next — the EIGHTEENTH consecutive cycle — and every standing pin
held byte-exact: the login card's blur(4px) and white/95 and 16px radius and 30px/700 h1
and 48px inputs and 54px SSO buttons; the F-76 alert's exact copy and red-50/0.7 wash
(re-verified with wrong credentials); the post-login landing on `/` with the 220px sidebar
and its eight links; the Dashboard's date line ("Wednesday, October 28, 2026") and its two
16px/700 chart headings; the Spanish families on Sales and Cashiers with "Turnos
Recientes" still an H3. The reference's OWN mobile defect — the D-1 drift Session-21
caught — is STABLE: no hamburger, the static 220px sidebar, main crushed to 170px beside
it, the document computing exactly 390 on every route. The reference's Reports surface is
still empty (2× "No data for this period") — the demo account remains write-restricted, so
the with-data tiers stay the functional superset. The reference mobile capture was
refreshed for the cycle's record.

Then the clone-side verification, the operator's standing priority: the mobile drawer
probed live on the dev server at 390×844 — the labeled hamburger, the dialog semantics
with its eight labeled links at 288px, focus moving to the close button on open, the body
scroll-lock while open, the tw-animate-css `animation-name: enter`, Escape restoring the
hamburger's focus and releasing the lock, drawer navigation unmounting it, zero
horizontal overflow. No Tailwind v4 regression anywhere in the chain; the 13 mobile e2e
pins would stay green through both full-suite runs. The probe itself taught a lesson
worth recording: the first Escape-restore read came back false, and the forensics (the
F-118 posture — suspect the probe first) found the cause in the PROBE, not the code: a
synthetic `el.click()` inside `page.evaluate` does not move focus the way a real user
click does, and the drawer saves `document.activeElement` at open — so it had correctly
restored focus to the BODY the synthetic click never left. The real-click probe passed
cleanly, and the law (probe focus behavior with a real click, never an eval dispatch) is
now in AGENTS for every future cycle.

The session_41 pointer had named three candidates for this cycle's depth. The receipt's
PDF/email shape remains unmeasurable on the write-gated reference and stays a future
candidate. The StoreSettings save→toast walk was weighed and deferred — a smaller chain,
its CTA style already pinned in surfaces.spec and its with-data shape in the s18 evidence
tier. The Inventory CSV round-trip was chosen, and the ANALYZE earned its keep before any
spec was written: the CSV round-trip is a README-advertised superset feature ("CSV export
+ import"), yet the e2e suite protected NONE of its wiring — the unit tier pins the pure
`parseCsv`/`parseCsvRow`/`productsToCsv` seam, but the import chain (the hidden file
input → the parse → the per-row POSTs → `upsertProduct` → the ledger re-render → the
"Import complete" toast), the export chain (the store → `productsToCsv` with its
category-NAME resolution — a store-dependent derivation the unit tier cannot test → the
Blob → the download's content), and the error path (the blank-name row) were all
e2e-invisible. The live probes measured every leg CORRECT: a two-row fixture imported
through the real input (the toast, the count 3 → 5, both rows rendering), the exported
file read back (the header byte-exact, the rows serializing exactly — the category name
resolved, `String(number)` costs, the empty columns empty), and the blank-name error (the
exact toast, the count unchanged). The finding was the missing protection — F-122.

The cure follows the F-119/F-121 patterns exactly:
`tests/e2e/with-data-inventory-csv.spec.ts`, provisioning its idempotent "CSV Walk"
category (the POST asserted, the F-120 law) and building the import CSV in-spec as a
`setInputFiles` buffer — no temp files — with values chosen to serialize byte-stably
(cost `1.5`, never `1.50`; the empty category and cost columns as empty strings). The
round-trip test pins the chain end-to-end: the import leg (the toast, the API-derived
count +2, both Product cells, the API verify — row 1's `categoryId` resolved by NAME,
row 2 null), then the export leg (`waitForEvent("download")` → the suggested filename
`products.csv` → the content: the header byte-exact, both fixture lines BYTE-EXACT, and
the line count = 1 + the API-derived product total — `toContain` per line, never
full-file equality, because the export is the full ledger and the other fixtures' rows
ride along by design). The second test pins the error path: the blank-name buffer → the
exact "Import failed: name is required" toast → the count UNCHANGED → the barcode absent
from the API. The spec landed green on its first full run (one tsc-only wiring fix during
authoring: the provision helper's narrowing); the characterization green, the ANALYZE
pre-proven.

The ordering analysis is part of the record: THREE specs now persist data, and the file
names carry the constraint — the CSV walk sorts between the dashboard walk and the
reports walk (d < i < r). Its products perturb no sale-derived pin (the reports walk
derives its expectations from the sales API at runtime; the dashboard walk runs before
it), and inventory.spec's "No products found" and "1 products registered" pins run before
the CSV walk's imports exist (i < w, in the serial one-worker suite). The fresh-db-per-run
contract (global-setup deletes and re-provisions before boot) keeps the twice-consecutive
gate runs independent. The count lockstep rode in the same commit: E2E 111 → 113, specs
10 → 11, desktop 97 → 99, the "Session-23 lock" literal becoming the Session-24 lock, and
every live-tense site moving — README's badge and scripts and testing section, CLAUDE's
baseline plus the three-walk ordering law, AGENTS's Session-24 CSV round-trip contracts
(the byte-exact-per-line law, the byte-stable fixture values, the category resolution
both ways, the extended ordering law, the V14 probe-methodology law), PAD v1.22 with its
revision block and spec map, the SKILL v2.20.0 with the Session-24 addendum.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit 151/151
(15 files — unmoved) · build · smoke 13/13 · e2e 113/113 — twice, consecutively — with
the fixtures verified in the post-run e2e db (both CSVRT rows, the category resolved, the
error row absent, the other walks' fixtures intact: 7 products, 5 sales, 6 categories).
The three with-data evidence harnesses all green (s16 13/13, s17 19/19, s18 20/20), the
older captures restored so only this cycle's changed captures commit. The evidence tier
got its record: the committed self-provisioning `scripts/capture-s24-evidence.mjs`,
capturing screenshots 108–110 from the remediated dev server — 108 the with-data
Inventory ledger with the imported rows (the count derived live 5 → 7, the category
resolution verified in the API), 109 the import-complete toast moment, 110 the mobile
drawer at 390. The export round-trip was verified in the same run (the header and both
fixture lines byte-exact against the downloaded file). A capture-methodology catch is
part of the record: the first pass produced byte-identical 108 and 109 — the toast's
five-second auto-dismiss window spans both captures, so the "settled" ledger showed the
toast too; the fix waits for the toast's hidden state before the settled capture, giving
the two frames their distinct stories. The next cycle's candidates: the StoreSettings
save→toast→re-render walk (the remaining unpinned loop from session_41), the receipt's
PDF/email shape (still unmeasurable on the write-gated reference — a pure-superset
feature build), or a with-data walk of the Registers shift-lifecycle dialogs.

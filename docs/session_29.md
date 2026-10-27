# Session 29 — the Session-17 cycle narration

> The numbering convention, continued: the Session-17 remediation cycle (the ledger is
> `docs/remediation-plan-session-17.md`) narrates as session_29 — session_27 was the
> Session-16 cycle's own narration, session_28 the operator's raw-log commit of that same
> conversation, so the sequence moves to 29. Companion: the worklog's Session-17 entry
> (the condensed record) and the plan (the full verification ledger V1–V22).

The workspace had been reset — twice, as it turned out. The first reset interrupted the
prior Session-17 attempt mid-lockstep (its evidence harness, its AGENTS/CLAUDE edits, and
its plan existed only on the lost disk — never committed, never pushed), so this cycle
opened with a fresh `git clone` at `ceb4530` and redid the depth end-to-end. The remote
was exactly where Session-16 left it: the push `797b9c9` plus the operator's session_28
raw-log commit. Nothing of the Session-17 attempt survived; everything had to be
re-derived. That is the honest state this cycle started from, and it is recorded in the
plan's V1 so no future cycle mistakes the two attempts.

The fresh sandbox tripped the same environment-only wire Session-16 did, one revision
later: the cached Playwright browsers were build 1200, the pinned Playwright 1.63 needs
1243 — the first e2e run failed at setup until `bunx playwright install chromium`
re-provisioned the matching build. From there the received-tree gate came up green at
the Session-16 baselines: lint 0 (the one documented warning) · tsc · unit 149/149
(14 files) · build · smoke 13/13 · e2e 104/104. The lock held.

The drift sweep came first, as always. Every standing pin measured byte-exact for the
ELEVENTH consecutive cycle — the login card's blur(4px) · white/95 · 16px, the h1 at
30px/700, the 48px/12px inputs, the 54px SSO; the F-76 error panel with its exact
"Invalid email or password" copy and its red-50/0.7 wash; the sidebar at 220px with its
eight links and the 42px violet-600/0.2 pill sitting on Terminal; the terminal's shift
gate and its CART; the Dashboard's en-US date line and its two 16px/700 chart h3s; the
Spanish families on Sales and Cashiers. The reference's own mobile defect too: still no
hamburger at 390×844, still the static 220px z-50 sidebar. Eleven cycles, zero drift.

Then the NEW depth, and it came in two halves. The reference side first: the
Inventory/Reports internals measured at a precision no cycle had taken before. The
Inventory empty state decoded at parity everywhere — h1 24px/700, the "0 products
registered" subline at 14px slate-500, the byte-exact "Search by name or code..."
placeholder in its h-9 field, and the "No products found" cell in its exact
`text-center py-12 text-slate-400 text-sm` treatment. The Reports surface decoded at
byte parity too, with two facts worth pinning: the reference's ACTIVE period pill is
**"30 days"** — and the clone's `days = 30` default already matches it, a coincidence of
design that this cycle converted from assumption into a measured pin — and the third
stat label reads **"Avg. Ticket"**, byte-identical clone to reference. The stat cards
themselves: the reference's class list lacks the clone's `glass-card` alias, but the
computed surface is the identical rgba(16,18,32,0.9) canvas under the identical 1px
white/0.07 border — the class-name difference is invisible in computed styles, and the
labels (12px/400, white/0.35, CSS-uppercased) sit above values in `<p>` at 24px/900.

Then the with-data half: the demo seed (15 products, 5 categories, 1 register, 1 closed
shift, 33 sales) booted on the standalone and probed against the db's own truth —
$410.64 across 33 sales, $246.74 card across 16, $163.90 cash across 17, one product
out, two low, twelve in stock. The clone rendered every value correctly: the Inventory
table's fifteen rows with their stock chips and category dots, the search filtering
Espresso to one row, the Reports family with its four pills and its three stats, the
method rows with their 60/40 shares, and the seven-day window reading $366.56 across
28. **No with-data defects.** The one candidate finding — the seven-day window showing
28 sales when all 33 sit within 6.9 days — dissolved on inspection: the seam's
calendar-bucket semantics (seven day-buckets including today, coherent with
`dailySeries`, already unit-pinned) exclude the five sales on the seventh calendar-day
back. The page is right; the first pin expectation was wrong. Withdrawn, on the record.

Getting to 17/17 took three probe fixes, and every one of them was a lesson about the
probes, not the app. The settled-state wait for the Reports page hung to its timeout
because the h2s render CSS-uppercased — innerText reads "DAILY SALES", never "Daily
Sales". The wait's options object had been passed as the function argument (the second
parameter), so the intended 15s timeout silently became the 30s default. And the
MethodTable rows parsed as noise until the probe read child nodes instead of span
indexes — the method name is a bare text node, and the share span nests inside the
font-bold money span, so span-index probes read "" and "$246.7460%". Add the oklab
dust — v4 serializing white/α as `oklab(0.999994 … / 0.4)` — and the cycle's real
yield is four measurement postures, now recorded in AGENTS.md: pin textContent, match
innerText case-insensitively; pass `waitForFunction` its options as the THIRD argument;
parse DOM rows by child nodes; and pin the ALPHA of an oklab serialization, never its
full string. The clone code was correct every time.

The structural find, then, was the one thing the audit could not fix in place: the
with-data Inventory/Reports contracts had no standing tier. The logic seams are
unit-pinned, the empty-state surface is e2e-pinned, but the live with-data rendering is
invisible to the empty-store e2e by construction — and the Session-16 harness covers
only Registers/Sales/Cashiers. **F-112**: the evidence tier extended.
`scripts/capture-s17-evidence.mjs` — the s16 pattern's successor on port 3418, with the
demo-db provisioning guard, the settled-state waits, and every one of this cycle's
postures baked in — pinned the seventeen with-data contracts plus the standing F-76 and
drawer spot-checks: **19/19**, with the F-76 alert surfacing its own oklab form live
(`oklab(0.970522 … / 0.7)` — the either-form regex catching it exactly as designed).
Screenshots 87–89 joined the numbered record. The VLM cross-check matched **3/3** on
the captures.

The full gate on the final tree: lint 0 (1 documented warning) · tsc · unit **149/149**
(14 files) · build · smoke **13/13** · e2e **104/104** — and this time the
count-lockstep gate stayed green with NOTHING re-anchored: the evidence tier rides
outside the unit/e2e counts by the V24 doctrine, the constants are unmoved, and the
"Session-16 lock" literal stays, by design, naming the cycle that last re-anchored
them. The docs moved in lockstep: AGENTS gained the Session-17 contracts (the
two-harness evidence tier, the calendar-bucket law, the four measurement postures),
CLAUDE gained the tier-4 Evidence line, PAD shipped v1.15 with the revision block, the
SKILL shipped v2.13.0 with the addendum, the worklog gained its Session-17 entry, and
the plan's ledger closes the record with V1's note about the lost first attempt.
`.env.example` verified byte-identical to the `.env` it seeded.

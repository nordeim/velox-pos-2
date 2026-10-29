# Session 51 — the Session-28 cycle narration

> The numbering convention, continued: the Session-28 remediation cycle (the ledger is
> `docs/remediation-plan-session-28.md`) narrates as session_51 — session_49 was the
> Session-27 cycle's own narration, session_50 the operator's raw-log commit of that same
> conversation, so the sequence moves to 51. Companion: the worklog's Session-28 entry
> (the condensed record) and the plan (the full verification ledger V1–V8 + the
> execution record).

The cycle opened with a clone, not a pull — the third full sandbox reset, and this
time the whole environment went with it: `/home/z/my-project/scripts/` (the standing
audit scripts) died alongside the repo. The rebuild rode the documented ladder — the
`.env` with a fresh 64-hex AUTH_SECRET, `bun install`, db:push/db:seed, chromium-1243 —
and then the cycle absorbed a genuine operational change: the new sandbox kills every
background process at the end of each tool call, so the "boot the dev server once,
probe across calls" posture of Sessions 1–27 is gone. Its replacement is a
self-contained wrapper — boot, wait-for-ready, run the payload, kill by port — one
bundle per call; the reference sweeps kept their multi-call posture because
agent-browser's daemon state survives across calls (verified, then re-verified by the
whole sweep riding it). The audit scripts were rebuilt from their plan-corpus
descriptions; the census came back needing two authenticity fixes before it matched
its own record (`@/` path-alias resolution, and the dependency scan scoped to runtime
`dependencies` — the devDependencies are toolchain), and then read exactly as the
ledger demands: 156 scanned, ZERO dead, the dep report exactly the documented trio.

The received tree's fast gate ran green on arrival (lint 0 with the one documented
warning, tsc, unit 151/151), the received delta was exactly the operator's session_50
raw log (+60, matching the Session-27 record line for line), and the static sweeps
came back clean — the secrets scan finding only the documented locations, the scrypt
credential checker verifying the owner against the warm db.

The reference sweep — the twenty-second consecutive — held every standing pin
byte-exact: the login card's blur and white/95 and 16px radius and 30px/700 h1 and
48px inputs and 54px/16px SSO; the F-76 alert re-verified with wrong credentials; the
`/` landing with the 220px sidebar and its eight links; the Dashboard's date line
("Thursday, October 29, 2026") and both 16px/700 chart h3s; the Spanish families; the
Reports surface still empty in its 2× "No data for this period" (the demo account
remains write-restricted, the with-data tiers still the functional superset). The
reference's own mobile defect stayed stable at the D-1 shape, and the cycle's
reference capture was refreshed. Then the clone-side verification, the operator's
standing priority: the mobile drawer probed live at 390×844 with REAL clicks
throughout — the labeled hamburger, the 288px dialog with its eight labeled links,
the `enter` animation (read on the `[role=dialog]` element itself — the first probe
read the header-row child and false-negatived; the animate class sits on the dialog
content, not its children), focus moving to the close button, the body scroll-lock,
Escape restoring the hamburger's focus and releasing the lock, the route-close
unmount, zero horizontal overflow at every step. No Tailwind v4 regression anywhere.

The sweep's one NEW measurement became the cycle's first cure. The reference's
Cashiers "Turnos Recientes" ledger, settled and probed twice: the six-header table
with ZERO tbody rows and no empty-state copy anywhere in the body — while its Sales
and Inventory empty ledgers DO render in-table empty rows ("Sin ventas" colSpan 7 /
"No products found" colSpan 7). The convention is per-surface, and the Cashiers
ledger's empty state is the bare table. The prior record had attributed the CLONE's
own "Sin turnos registrados" row to the reference — a Session-2-era convention the
records carried forward unmeasured through Session-27. The cure is the cycle's first
`src/` change since Session-21: the empty branch removed from `cashiers-view.tsx`,
TDD-first. The pin's journey taught the cycle's hardest lesson: its first home
(surfaces.spec) failed the full run — registers-shifts.spec sorts earlier and its
CLOSED shift renders a ledger row forever after (no shift DELETE endpoints exist), so
the zero-shift state is only readable before "r". The pin now lives in
navigation.spec by the ordering law's inverse (n < r), the trade-off is recorded in
AGENTS (the empty ledger loses its only post-bootstrap DOM observable — waits must
ride the roster copy or a with-data row), and the s16 harness's wait arm now rides
the demo db's "Cerrado" chip alone.

The session_49 pointer had named the two candidates, and the cycle took the second:
the Sales receipt-viewer with-data journeys. The audit confirmed the gap — the
viewer's content, the ledger row's derived cells, the search's three arms, and the
refund round-trip had ZERO with-data protection: F-110's saleTimestamp was pinned on
the CHECKOUT receipt only, terminal.spec pinned the checkout-derived row visibility
and the F-115 print wrapper, the s16 harness the demo-seeded family. A regression in
the item-line math, the description format, the chip families, the search filter, or
the one-way refund guard would all have passed the entire 119-test suite green. The
reference is write-gated — its Sales ledger renders "Sin ventas" forever — so this
tier is a functional-SUPERSET pin of the clone's own working surface.

The ANALYZE took it live through the API-and-browser bundle: the fixture chain, a
checkout pinned to the active shift, and the page measured in both states — the
ledger row `["T-000001", "29 oct 2026", "Store Owner", "cash", "$9.00", "Completada"]`
(the es-MX Fecha, the Cajero cell from the sale's own cashier include, the capitalize
"cash" chip on the emerald oklab /0.15 with rgb(52,211,153) text, the money cell),
the viewer's content (the ticket title, the "29/10/2026 15:31" description, the
"2 × Viewer Walk Coffee" + "$9.00" item line, the dashed Total row, the
"Método"/"cash" row, the Cerrar/Imprimir footer outside .receipt-print), the search
(the no-match "Sin ventas" in-table row, the byCustomer narrowing), and the refund
round-trip (the PATCH at 200, the same-status re-PATCH at 200, the un-refund at 400
with the API's own copy, the re-mounted chip "Reembolsada" on the orange family, the
viewer opening on the refunded sale unchanged). The fixture was then closed at exact
variance and deleted children-first (sales and shifts have no DELETE endpoints — the
teardown rode PrismaClient), the dev db verified pristine. Two of the ANALYZE's
search probes fell to a shell quoting error — the byTicket and byCashier arms were
re-measured live by the cycle's evidence script instead (byTicket=1, byCashier=1 of
1 expected) and pinned by the spec.

The cure — `with-data-sales-receipt-viewer-walk.spec.ts`, three tests — landed after
one authoring iteration, and the catch is the cycle's locator law: the item-line pin's
text filter on an unqualified `div` matched the ANCESTOR container, whose last span
is the method row's — silently mis-targeting the line-money pin and aborting Test 1
before its self-clean close, which Test 3's shift-free canary then caught (the
self-clean law's canary working exactly as designed). The fix scopes text-filtered row
locators to the LEAF class (`div.flex.justify-between`); the lesson is in AGENTS.
The ordering analysis is part of the record: SIX specs now persist data — the sales
walk sorts LAST among the walks (c < d < f < i < r < s), after every empty-state pin
of what it creates, its shift self-closing at exact variance.

The count lockstep rode in the same commit — E2E 119 → 123 (desktop 105 → 109: the
walk's three tests plus the relocated bare-ledger pin), spec files 13 → 14, the
"Session-27 lock" literal becoming the Session-28 lock — with every live-tense site
moving: README's badge and scripts and testing section, CLAUDE's baseline plus the
six-walk ordering, AGENTS's Session-28 Sales contracts, PAD v1.26 with its spec map
and revision block, and the SKILL v2.24.0 with the Session-28 addendum and the
sandbox-bundle doctrine note. The docs-counts gate caught one stale site mid-flight
(the SKILL's §12 headline) and passed on the first re-run after its cure — the
lockstep working as designed.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
151/151 (15 files — unmoved) · build · smoke 13/13 · e2e 123/123 — twice,
consecutively — with the post-run db verified as state, not exit codes: the settings
at seed defaults, zero open shifts globally, eleven fixture sales, the walk's one
sale left refunded (the one-way guard means it stays; the scratch db is per-run).
The three with-data harnesses re-ran green (s16 13/13, s17 19/19, s18 20/20 — the
money-unit cure holding on the afternoon seed), and the content-identical harness
captures were restored so only this cycle's captures commit. The evidence tier got
its record: the committed `scripts/capture-s28-evidence.mjs`, capturing screenshots
120–122 — the ledger row with the viewer open, the Reembolsada flip, and the mobile
drawer at 390 — with the captures verified distinct and the script's self-clean
verified live. The `.env.example` verified key-for-key against the working `.env`
(COOKIE_SECURE the documented optional escape hatch). The next cycle's candidates:
the receipt PDF/email shape (still the pure-superset feature build — the last
standing session_47 candidate, now deferred twice: it needs production code plus a
PDF/email dependency and a full cycle's attention), the deeper Settings/Dashboard
journeys, or whatever the next operator log names.

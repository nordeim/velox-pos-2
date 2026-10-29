# Session 49 — the Session-27 cycle narration

> The numbering convention, continued: the Session-27 remediation cycle (the ledger is
> `docs/remediation-plan-session-27.md`) narrates as session_49 — session_47 was the
> Session-26 cycle's own narration, session_48 the operator's raw-log commit of that same
> conversation, so the sequence moves to 49. Companion: the worklog's Session-27 entry
> (the condensed record) and the plan (the full verification ledger V1–V8 + the
> execution record).

The cycle opened with a pull, not a clone — the first non-reset workspace since
Session-24. The checkout, the `.env`, the db, node_modules, and chromium all survived;
the pull brought exactly one file, the operator's `session_48` raw log, whose record
matches the Session-26 delivery line for line. The received tree's fast gate ran green
on arrival (lint 0 with the one documented warning, tsc, unit 151/151), and the static
sweeps came back clean: the census scans 149 sources (the Session-26 evidence script
the one addition) with zero dead, the secrets scan finds only the documented
locations, and the documented credential verifies against the warm db.

The reference sweep ran next — the twenty-first consecutive cycle — and every standing
pin held byte-exact: the login card's blur(4px) and white/95 and 16px radius and
30px/700 h1 and 48px inputs and 54px/16px SSO buttons; the F-76 alert re-verified
with wrong credentials ("Invalid email or password" on the red-50/0.7 wash); the `/`
landing with the 220px sidebar and its eight links; the Dashboard's date line
("Thursday, October 29, 2026") and both 16px/700 chart h3s; the Spanish families on
Sales and Cashiers; the Reports surface still empty in its 2× "No data for this
period" (the demo account remains write-restricted, the with-data tiers still the
functional superset). The reference's OWN mobile defect is STABLE at the D-1 shape —
no hamburger, the static 220px sidebar, main crushed to 170px, the document computing
exactly 390 — and the cycle's reference capture was refreshed. Then the clone-side
verification, the operator's standing priority: the mobile drawer probed live at
390×844 with REAL clicks throughout (the V14 law) — the labeled hamburger, the 288px
dialog with its eight labeled links, the tw-animate-css `enter` animation, focus
moving to the close button, the body scroll-lock, Escape restoring the hamburger's
focus and releasing the lock, the route-close unmount, zero horizontal overflow at
every step. No Tailwind v4 regression anywhere in the chain.

The session_47 pointer had named the Cashiers shift-ledger walk as the leading
candidate, and the audit confirmed it. The "Turnos Recientes" table is a FOUR-WAY
JOIN rendered client-side: the store bootstraps `/api/shifts` (openedAt descending,
register and cashier included) alongside the sales, and each row derives six cells —
the cashier identity (the shifts POST pins `cashierId` to the owner, so the seed's
"Store Owner" renders; no cashier users are ever created), the register name, the
INICIO cell (`shiftTime(openedAt) · shiftDuration(openedAt, closedAt)` — local HH:MM
plus rounded minutes), the FIN polarity fork (`shiftTime(closedAt)` or the em dash),
the VENTAS cell (the money-formatted SUM of that shift's sales plus its count), and
the Estado chip (Abierto on emerald, Cerrado on white). The existing pins covered
everything around it — the drift sweep's F-117 asserts only that a fixture shift's
row is VISIBLE at 390, surfaces.spec pins the empty states and the roster flow,
registers-shifts.spec pins the shift dialogs on another surface — but nothing pinned
the join. A sale landing on the wrong shift's row, a count drifting from its total,
a polarity flip in the FIN ternary, or a mis-ordered list would all have passed the
entire 117-test suite green. The reference's own ledger is permanently empty
(write-gated, "Sin turnos registrados"), so this tier is a functional-SUPERSET pin.

The ANALYZE took it live: the fixture chain (category, product, register, shift)
provisioned through the API, a checkout pinned to the active shift, and the page
measured in both states — the active row rendering `["Store Owner", "Ledger Walk
Register", "00:19 · 0m", "—", "$9.00 (1)", "Abierto"]`, then after the
exact-variance close the closed row rendering `["Store Owner", "Ledger Walk
Register", "00:19 · 1m", "00:20", "$9.00 (1)", "Cerrado"]` — the FIN cell filled,
the duration recomputed against the close moment, the chip family flipped. Every leg
CORRECT; zero production defects; the fixture then deleted from the dev db. The
cure follows the F-122/F-123/F-124 pattern: `with-data-cashiers-ledger-walk.spec.ts`,
two tests. The first pins the closed row end-to-end — the fixture chain (shift →
two sales, both `shiftId`-asserted → the close at exact variance), the expectations
derived at runtime (the shift's sales from `/api/sales`, the times mirrored from the
seam's own math), and all six cells asserted exact, plus the six Spanish headers
pinned in their source case. The second pins the active polarity — the zero state
(Fin "—", `$0.00 (0)`, Abierto), the live join after a sale, and the flip to closed
with the FIN cell filled — and verifies the register ends shift-free.

The spec's first run failed on one cell, and the catch is the cycle's law: the
identity-cell expectation derived from `/api/auth/me`, whose `publicUser` omits
`fullName` — so the spec expected the email while the row renders "Store Owner"
(from the shift's own cashier include). The fix derives the expected CAJERO cell
from the ledger's OWN `/api/shifts` payload — the view's exact input, the true
"fix the MIRROR" rule — and both tests passed. (Two earlier type-narrowing fixes
re-applied the Session-24 `let`-plus-closure lesson: the fixture ids now resolve
through find-then-create ternaries.) The ordering analysis is part of the record:
FIVE specs now persist data, the ledger walk sorting FIRST among the walks
(c < d < f < i < r) — safe by construction, because every existing walk derives its
expectations from the APIs at runtime — and the walk self-cleans both its shifts
with exact-variance closes, keeping "No active shift" true for the mobile project
that runs after chromium.

The count lockstep rode in the same commit — E2E 117 → 119, desktop 103 → 105,
specs 12 → 13, the "Session-26 lock" literal becoming the Session-27 lock — with
every live-tense site moving: README's badge and scripts and testing section,
CLAUDE's baseline plus the five-walk ordering and the self-clean laws, AGENTS's
Session-27 ledger contracts (the join as law, the `/api/shifts` data-source and
re-mount law, the identity-cell mirror law, the seam-math mirror law, the
five-specs ordering law), PAD v1.25 with its spec map and revision block, and the
SKILL v2.23.0 with the Session-27 addendum. The docs-counts gate passed on the
first unit run — no negative collisions this time (the Session-26 re-scoping held).

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
151/151 (15 files — unmoved) · build · smoke 13/13 · e2e 119/119 — twice,
consecutively — with the post-run db verified as state, not exit codes: the settings
at seed defaults, zero open shifts globally, both walk shifts closed, three walk
sales persisted as the idempotent fixture. The three with-data harnesses re-ran
green (s16 13/13, s17 19/19, s18 20/20 — the Session-26 money-unit cure holding),
and the content-identical harness captures were restored so only this cycle's
captures commit. The evidence tier got its record: the committed
`scripts/capture-s27-evidence.mjs`, capturing screenshots 117–119 — the closed
ledger row with the headers, the active Abierto row, and the mobile drawer at 390 —
with the captures verified distinct and the script's self-clean verified live. The
`.env.example` verified key-for-key against the working `.env` (which carried over
unchanged with the surviving workspace). The next cycle's candidates: the receipt
PDF/email shape (still the pure-superset feature build, now the only standing
candidate from the session_47 list), the Sales ledger's receipt-viewer with-data
journeys, or whatever the next operator log names.

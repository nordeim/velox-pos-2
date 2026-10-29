# Session-27 remediation plan — the Cashiers shift-ledger with-data walk (F-125)

**Received tree:** `b75fd88` (the Session-26 push `f5b8a4e` + the operator's `session_48`
raw-log commit — the pull brought exactly that one file). The workspace SURVIVED this
cycle (the first non-reset since Session-24): `.env`, `db/custom.db`, node_modules,
and chromium-1243 all intact — no rebuild needed, the fast gate ran green on arrival.

**Cycle shape:** the session_47 "Next" pointer's LEADING candidate → the Cashiers
shift-ledger with-data walk → ANALYZE live → a new 2-test spec (F-125) → the count
lockstep → the full gate → screenshots 117–119 → docs → push. Test-tier only; zero
production-code changes expected (the ANALYZE measured every leg CORRECT).

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|-------|-----|--------|
| V1 | Received-tree fast gate | `lint` → `tsc` → `test` on the pulled tree | GREEN — lint 0 errors (1 documented warning), tsc clean, unit 151/151 (15 files) |
| V2 | Received delta | `git diff f5b8a4e..b75fd88 --stat` | exactly `docs/session_48.md` (+109) — the operator's raw log, matching the Session-26 record |
| V3 | Zero-importer census | `bun /home/z/my-project/scripts/zero-importer-census.mjs` | 149 scanned (+1 = the s26 evidence script), ZERO dead; react-dom + z-ai-web-dev-sdk the documented known pair |
| V4 | Secrets scan | ripgrep for the credential, excluding the documented locations | Only the documented locations (the doc corpus + the e2e boot fixtures + the seed) |
| V5 | Owner credential | `bun /home/z/my-project/scripts/check-owner-credential.mjs` | VERIFIES |
| V6 | Reference sweep #21 | agent-browser, computed styles, one login (2 of the 10/15-min budget) | ALL pins HOLD — see V6 detail |
| V7 | Clone mobile drawer 390×844 | agent-browser, REAL clicks throughout (the V14 law) | ALL superset pins PASS — see V7 detail; NO Tailwind v4 regression |
| V8 | The F-125 ANALYZE | curl + agent-browser against the dev server (§1.3) | every leg CORRECT live; zero production defects |

**V6 detail — sweep #21 (the twenty-first consecutive hold):** the login card
(backdrop `blur(4px)` · `rgba(255,255,255,0.95)` · 16px radius · h1 30px/700 · inputs
48px · SSO 54px/16px); the F-76 alert byte-exact on `rgba(254, 242, 242, 0.7)`
(re-verified with wrong credentials); the `/` landing + the 220px sidebar + the 8
links (/POS … /StoreSettings); the Dashboard date line ("Thursday, October 29, 2026")
+ both chart h3s at 16px/700; the Spanish families ("Historial de Ventas" H1,
"Cajeros" H1 + "Turnos Recientes" H3 at 16px/700); Reports STILL empty (2× "No data
for this period" — the demo account remains write-restricted, the with-data tiers
stay the functional superset). The reference's OWN mobile defect is STABLE at the
D-1 shape: document 390, NO hamburger, the static 220px sidebar, main crushed to
170px. Reference capture refreshed: `docs/screenshots/ref-mobile-pos-390-s27.png`.

**V7 detail — the clone's mobile drawer:** the labeled hamburger → the dialog at
288px with its 8 labeled links → `animation-name: enter` → focus moves to the close
button on open → the body scroll-lock (`overflow: hidden`) → Escape unmounts the
dialog, RESTORES the hamburger's focus, releases the lock → a link click navigates
(`/Dashboard`) and unmounts the drawer → zero horizontal overflow at every step.

## 1. Findings

### F-125 — the Cashiers "Turnos Recientes" ledger derivation has ZERO with-data protection (this cycle's NEW depth)

**The chain (all verified live in §1.3):** the ledger row is a FOUR-WAY JOIN rendered
client-side — `cashiers-view.tsx` takes the store's `shifts` (bootstrapped from
`/api/shifts`, ordered `openedAt: desc`, `include`-ing register + cashier) and
`sales`, then per row derives: the cashier cell (`s.cashier?.fullName ||
s.cashier?.email || "—"` — the shifts POST pins `cashierId` to the owner, so the
seed's "Store Owner" renders), the register cell (`s.register?.name`), the INICIO
cell (`shiftTime(openedAt) · shiftDuration(openedAt, closedAt)` — local HH:MM +
rounded minutes), the FIN cell (`s.closedAt ? shiftTime(closedAt) : "—"`), the
VENTAS cell (`formatMoney(total, currency) (n)` where `total = sales.filter(sale =>
sale.shiftId === s.id).reduce(sum)` and `n` is that filter's length), and the ESTADO
chip (`Abierto` on emerald-500/15 when active, `Cerrado` on white/5 + white/50 when
closed).

**The evidence of the gap:** the drift sweep's F-117 containment test provisions a
shift and asserts only that its ROW IS VISIBLE at 390 (`filter({ hasText: "Drift
Sweep Register" })`); surfaces.spec pins the Cashiers EMPTY states and the roster
flow; registers-shifts.spec pins the shift DIALOGS on the Registers surface. NOTHING
pins the ledger's DERIVATION with data: the shift×sales join (a sale landing on the
wrong shift's row, or the count drifting from the total), the time formatting, the
active/closed polarity (the FIN "—"/`shiftTime(closedAt)` fork, the two chip
families), or the row's identity cells. A broken `shiftId` pin at checkout, a
mis-ordered shift list, a polarity flip in the FIN ternary, or a join that counted
another shift's sales would ALL pass the entire 117-test suite green.

**Why this tier is a functional SUPERSET pin:** the reference's demo account is
write-restricted — it can never open a shift or make a sale, so its OWN "Turnos
Recientes" table is permanently empty ("Sin turnos registrados"). The clone's live
ledger IS the superset feature; this walk pins it end-to-end.

**The candidates weighed (the session_47 pointer):** ① the Cashiers shift-ledger
walk — SELECTED (the recorded leading candidate: a four-way join with a polarity
fork, unpinned at any tier, fully provisionable through the documented API chains,
self-cleanable); ② the receipt PDF/email shape — STILL unmeasurable on the
write-gated reference (no sale can reach its receipt email/PDF) and a
production-code feature build — deferred again to a dedicated feature cycle; ③
whatever the next operator log names.

### 1.3 The ANALYZE (measured live on the dev server before this plan)

Every leg measured CORRECT — the values the spec transcribes:

- The fixture chain (login → category "Cashiers Ledger Walk" → product "Ledger Walk
  Coffee" CWALK-390 at $4.50/taxRate 0 → register "Ledger Walk Register" with
  openingFloat 50 → shift POST `{ registerId, openingFloat: 50 }`): all 200/201; the
  shift answers `cashierId === userId` (the owner — "Store Owner" renders in the
  CAJERO cell).
- A checkout (`items:[{productId, name, price: 4.5, qty: 2, taxRate: 0}],
  paymentMethod: "cash", amountPaid: 15`) → `total: 9`, the ticket allocated, the
  sale pinned to the active shift.
- The ACTIVE row (goto /Cashiers after the sale):
  `["Store Owner", "Ledger Walk Register", "00:19 · 0m", "—", "$9.00 (1)", "Abierto"]`
  — the chip on `oklab(… / 0.15)` (emerald-500/15's v4 serialization).
- The close (`PATCH /api/shifts/:id { countedCash: 59 }` → `variance: 0`,
  `status: "closed"`), then the CLOSED row:
  `["Store Owner", "Ledger Walk Register", "00:19 · 1m", "00:20", "$9.00 (1)",
  "Cerrado"]` — the FIN cell filled with `shiftTime(closedAt)`, the duration
  recomputed against the close moment, the chip family flipped to white/5 +
  white/50.
- The ledger headers: `Cajero / Caja / Inicio / Fin / Ventas / Estado` (text nodes
  in the SOURCE case — CSS-uppercased visually; the s17 textContent lesson).
- The API shape for the spec's derivations: `/api/shifts` (the full ledger,
  `openedAt` desc, register + cashier included), `/api/sales` (filter by `shiftId`),
  `/api/auth/me` (the owner's `fullName`).
- **Cleanup verified live:** the ANALYZE fixture (sales → shift → register →
  product → category) deleted from the dev db — zero remaining walk sales, zero
  shifts.

**The ordering analysis (why a FIFTH persisting spec is safe):** the new file
`with-data-cashiers-ledger-walk.spec.ts` sorts FIRST among the walks (c < d < f <
i < r) and after every empty-state pin that matters: surfaces.spec's empty-Reports
and "0 usuarios registrados" (s < w; the walk creates NO cashier users — the shift
POST pins cashierId to the owner, so the roster's role=cashier filter is
unperturbed), inventory.spec's "No products found" (i < w), registers-shifts.spec's
dialog journey (r-e-g < w), and the drift sweep's containment (v < w — its own
self-owned fixture). The four existing walks all derive their expectations from the
APIs at runtime (verified in prior cycles), so the cashiers walk's extra
product/sale/shift perturbs none of them; and the walk SELF-CLEANS both its shifts
(closed with exact-variance counts — the fiscal-walk law), leaving "No active
shift" true for the mobile project that runs after chromium.

## 2. The cure — `tests/e2e/with-data-cashiers-ledger-walk.spec.ts` (2 tests)

The fiscal walk's conventions: idempotent provisioning with POSTs asserted (the
F-120 law), runtime-derived expectations (never a hardcoded total), the self-clean
law (both shifts closed with exact variance), and the mirrored seam math (the
INICIO/FIN times + duration computed in-spec with the same `getHours/getMinutes`
padStart + `Math.round(minutes)` logic — the "fix the MIRROR" rule).

### 2.1 Test 1 — the CLOSED row derivation (the four-way join, both sales counted)

1. **Fixture (API, idempotent):** category + product ($4.50, taxRate 0, barcode
   CWALK-390) + register (openingFloat 50) — POSTs asserted.
2. **The chain:** open the shift → TWO sales (qty 1 → $4.50, customer "Ledger Walk
   A"; qty 2 → $9.00, customer "Ledger Walk B") → both pinned to the shift (assert
   `shiftId` in the responses) → close with `countedCash: 63.50` → assert
   `variance: 0` + `status: "closed"` in the response.
3. **Derive:** the shift's `openedAt`/`closedAt` → the expected INICIO
   (`HH:MM · Dm`, D from the same rounded-minutes math), FIN (`HH:MM`), the row's
   expected cells; `/api/sales` filtered by `shiftId` → `{n: 2, total: 13.50}`;
   `/api/auth/me` → the owner's `fullName ?? email`.
4. **Pin:** goto /Cashiers → the row filtered by the register name (unique at this
   point) → all SIX cells exact: `[ownerName, "Ledger Walk Register",
   "HH:MM · Dm", "HH:MM", "$13.50 (2)", "Cerrado"]` + the six headers + the
   "Turnos Recientes" h3.

### 2.2 Test 2 — the ACTIVE polarity + the lifecycle flip

1. **The active zero state:** open a second shift on the (now-free) register →
   goto /Cashiers → the NEWEST row (.first() — the ledger sorts openedAt desc):
   `[ownerName, "Ledger Walk Register", "HH:MM · …", "—", "$0.00 (0)", "Abierto"]`
   — the FIN "—" polarity + the zero-sales derivation + the emerald chip.
2. **The live join:** a sale (qty 1 → $4.50) via the API → goto /Cashiers (a fresh
   mount re-bootstraps the store) → the row's VENTAS cell now `"$4.50 (1)"`.
3. **The flip:** close the shift (`countedCash: 54.50` → variance 0) → reload →
   the chip `Cerrado`, the FIN cell filled with the derived close time.

### 2.3 Counts

E2E **117 → 119** (desktop **103 → 105**; mobile 13 + setup 1 unmoved) · spec files
**12 → 13** · unit stays **151/15**.

## 3. Execution order

1. Write the spec (characterization — the ANALYZE measured every leg green; the
   first run must PASS, the F-122/F-123/F-124 pattern).
2. `lint` + `typecheck` (the spec must clear both).
3. `build` then the two tests alone (`--grep`), then the full suite ×2 consecutive
   (117+2 = 119 expected both runs).
4. The count lockstep in the SAME commit: `docs-counts.test.ts` (E2E 119, SPECS 13,
   the "Session-26 lock" → "Session-27 lock" literal, the "105 desktop" breakdown)
   + README (badge/scripts/testing + the walk paragraph) + CLAUDE (the baseline +
   the five-walk ordering) + AGENTS (the Session-27 ledger contracts + the ordering
   law extended to FIVE specs) + PAD v1.25 (scale line + file tree + spec map +
   the revision block) + SKILL v2.23.0 (version + baselines + the addendum).
5. The s27 evidence script: screenshots 117–119 (the closed-row ledger; the active
   Abierto row; the mobile drawer) — self-provisioning, self-cleaning, captures
   verified DISTINCT before commit.
6. The full gate: lint → tsc → unit → build → smoke → e2e ×2 → the three
   with-data harnesses (s16 13/13 · s17 19/19 · s18 20/20).
7. `.env.example` verify · worklog entry · session_49.md narration · commit · the
   SSH-wrapper push (dry-run → fingerprint → push → dual verify → shred).

## 4. Execution record (filled in as the cycle runs)

- **The F-125 spec written** (`tests/e2e/with-data-cashiers-ledger-walk.spec.ts`,
  2 tests): the closed-row derivation (the fixture chain — shift → TWO sales
  pinned by `shiftId` → the exact-variance close at 63.50 → all SIX cells
  exact against API-derived expectations + the six Spanish headers in the
  SOURCE case) and the active polarity (the zero state — Fin "—", "$0.00 (0)",
  Abierto → the live join after a sale → the flip to Cerrado with the FIN cell
  filled + the register's active-shift-count zero verified). Lint 0 · tsc clean
  (after TWO narrowing fixes — the `let`+closure lesson re-applied: the
  fixture ids now resolve through find-then-create ternaries so they stay
  const-narrowed).
- **ONE authoring iteration, caught by the first run**: the identity-cell
  expectation derived from `/api/auth/me` — whose `publicUser` OMITS
  `fullName` — so the spec expected the email while the row renders "Store
  Owner" (from the shift's own cashier include). Fixed by deriving the CAJERO
  cell from the ledger's OWN `/api/shifts` payload (the view's exact input —
  the true "fix the MIRROR" rule). Both tests then PASSED (8.6s). The law is
  in AGENTS.
- **The count lockstep executed in the same commit**: docs-counts.test.ts (E2E
  119, E2E_SPECS 13, the "Session-26 lock" → "Session-27 lock" literal, the
  "105 desktop" breakdown, the F-125 provenance comment) + README
  (badge/scripts/testing + the Session-27 paragraph) + CLAUDE (baseline 119 +
  the five-walk ordering + the self-clean laws) + AGENTS (the Session-27
  ledger-derivation contracts: the join-as-law, the /api/shifts
  data-source + re-mount law, the identity-cell mirror law, the seam-math
  mirror law, the five-specs ordering law) + PAD **v1.25** (scale line + the
  E2E tier + the spec map + the 13-spec file tree + the revision block) +
  SKILL **v2.23.0** (version + header baselines + commands + the testing tier
  + the Session-27 addendum). UNIT stays 151/15.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **151/151** (15 files) · build green · smoke
  **13/13** · e2e **119/119 × 2 consecutive full runs** (105 desktop + 13
  mobile + 1 setup) · the three with-data harnesses **s16 13/13 · s17 19/19 ·
  s18 20/20** (the Session-26 money-unit cure holding; the older harness
  captures restored — content-identical).
- **The post-run db state verified (state, not exit codes)**: the settings at
  seed defaults (storeName "My Store" · hideFiscalOnReceipt true · fiscalRuc
  ""), ZERO open shifts globally (the self-clean held — the mobile project's
  "No active shift" parity pin safe), the walk's 2 shifts both closed, and 3
  walk sales persisted (the idempotent fixture — 2 from the closed-row test +
  1 from the polarity test).
- **Evidence: screenshots 117–119** captured from the remediated dev server
  via the committed `scripts/capture-s27-evidence.mjs` — 117 the CLOSED ledger
  row (the FIN time filled, `$9.00 (1)`, the Cerrado chip, the Cajero/Caja/
  Inicio/Fin/Ventas/Estado headers), 118 the ACTIVE row (Fin "—", `$9.00
  (1)`, Abierto), 119 the mobile drawer at 390 (288px, zero overflow — the
  operator's priority surface). The captures verified DISTINCT before commit.
  Plus the D-1-shape reference capture (`ref-mobile-pos-390-s27.png`). The
  script's self-clean verified live (the evidence shift closed at exact
  variance, zero active on the walk's register).
- **`.env.example` verified** against the working `.env` (key-for-key aligned;
  the workspace SURVIVED this cycle, so the Session-26 `.env` carried over
  unchanged — DATABASE_URL `file:../db/custom.db` + the 64-hex AUTH_SECRET).

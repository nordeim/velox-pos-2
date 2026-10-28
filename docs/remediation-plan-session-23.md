# VeloxPOS Remediation Plan — Session-23

**Date:** 2026-10-28 (Session-23 work cycle)
**Tree:** `e1502b6` received (the Session-22 push `65988f6` + the operator's session_40 raw-log
commit; a `git pull` fast-forward this cycle — the workspace SURVIVED, so the documented rebuild
was NOT needed: `.env` intact with its 64-hex `AUTH_SECRET`, `db/custom.db` carrying the s22
evidence state (3 sales / 2 products / 2 categories), `node_modules` intact, chromium-1243
cached). **Scope:** the standing audit→remediate→push cycle — the received-tree fast gate, the
SEVENTEENTH consecutive live reference re-measurement at every previously-pinned depth (**all
standing pins hold; the reference's mobile defect is STABLE at its Session-21 D-1 shape**), the
clone-side mobile-navigation re-verification (the operator's named priority — the drawer superset
probed live on the dev server at 390×844), and this cycle's NEW depth — **the with-data Dashboard
walk** (the session_39 "Next" pointer: "a with-data walk of the Dashboard's chart families at the
remaining widths") — plus the static sweep (zero-importer census, secrets, credential, the
Session-22 code review) and a probe of the third session_39 candidate (the store's bootstrap
pair — audited CLEAN, no F-118 genus race remains). **Method:** skills/web-application (§14
testing tiers, §15 the gate doctrine), skills/agent-browser (computed styles are ground truth),
skills/tdd + skills/principle-test-behavior-not-implementation (the pins assert observable DOM
values derived from the API's own data — never class strings), the count-lockstep doctrine
(docs-counts gate — this cycle's counts MOVE: E2E **109 → 111**, E2E_SPECS **9 → 10**, desktop
**95 → 97**; UNIT stays **151/15**).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull origin main` (fast-forward `65988f6..e1502b6` — session_40.md, the operator's raw log, only) | tree @ `e1502b6`, clean, main-only |
| V2 | Environment contract | `.env` verified: `DATABASE_URL="file:../db/custom.db"` (byte-exact) + the 64-hex `AUTH_SECRET` intact · `db/` at the repo root (`custom.db` + `demo.db` + `e2e.db` + `smoke.db`, all git-ignored, `.gitkeep` committed) · dev server boots (`GET /login` 200) | environment ready — the `.env`/`db/` contract the operator asks for is in place |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-22 lock holds |
| V4 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** (142 scanned); deps: only the known entries (`prisma` the CLI, `react-dom` the implicit Next entry, `z-ai-web-dev-sdk` the evidence-script family) |
| V5 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (`check-owner-credential.mjs`, under bun) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V6 | Secrets scan | ripgrep for key/secret patterns across `src/ scripts/ tests/ prisma/` | clean — no live secrets (the known test-fixture constants aside) |
| V7 | Session-22 code review (Mode C) | `git show 65988f6` (file-by-file) + targeted reads | the Session-22 commit touched exactly what its plan said: the new `with-data-reports-walk.spec.ts` (362 lines — the runtime-derivation design, every provisioning POST asserting `resp.ok()`, the composite `cash(1)` pin), the surgical F-120 fix in `viewport-drift-sweep.spec.ts` (the contract-correct `name`/`price`/`qty`/`taxRate` line payload + the ok/ticket assertions), the s21 script's same repair, the new s22 evidence script, the docs-counts re-anchor, the docs, the screenshots — **ZERO unplanned production code** (the only production file the Session-22 cycle touched: none; the F-119/F-120 cures are test-tier) |
| V8 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900) | **HOLDS (17th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 "Welcome to VeloxPOS (Point Of Sale)" · inputs 48px/12px · SSO 54px/16px |
| V9 | Live drift — the F-76 error alert | wrong-credentials submit (isolated session) | **HOLDS byte-exact**: "Invalid email or password" · rgba(254,242,242,0.7) (red-50/0.7) · 12px radius |
| V10 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · 8 links (Terminal/Dashboard/Inventory/Sales/Registers/Cashiers/Reports/Settings) · doc 1440 = client 1440 (no overflow) |
| V11 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers (1440×900) | **HOLDS**: the date line "Wednesday, October 28, 2026"; both chart h3s 16px/700 ("Sales — Last 7 days" / "Products by Category"); stat labels 12px/600 slate-500 rgb(100,116,139) uppercase; "Historial de Ventas" h1; "Cajeros" h1 + "Turnos Recientes" as H3 |
| V12 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS + /Dashboard + /Inventory + /Sales + /Reports | **STABLE at the D-1 shape (no NEW drift)**: no hamburger, the static 220px sidebar, main squeezed to 170px, the document contained at exactly 390 on every route. The Session-21 D-1 record still describes the current reference exactly. Screenshot refreshed: `docs/screenshots/ref-mobile-pos-390-s23.png` |
| V13 | Live drift — the reference's Reports surface | /Reports at 1440×900 (sessioned) | **STILL EMPTY**: $0.00 stats, 2× "No data for this period", the 4 pills (7/14/30/90 days) — the demo account remains write-restricted; the with-data tier stays a functional-SUPERSET addition (the s20/s21/s22 lineage) |
| V14 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog, 288px (w-72), 8 labeled links · focus → Close on open · body scroll-lock while open · `animation-name: enter` (tw-animate-css) · Escape closes + restores the hamburger's focus + releases the lock · drawer navigation unmounts (verified via /Reports) · zero horizontal overflow at 390. NO Tailwind v4 regression (the plain-CSS glass-* doctrine, `@theme inline`, the `@custom-variant hover` unwrap all hold) |
| V15 | The store bootstrap pair (the third session_39 candidate — probed) | full read of `src/lib/store.ts` (the `loadAll`/`loadCore` pair) + `use-pos-bootstrap.ts` | **CLEAN — no F-118 genus race remains**: `loadAll` owns the five collections (products/categories/registers/shifts/sales) in ONE `set()`; `loadCore` refreshes settings ONLY (the F-118 cure, unit-pinned by `tests/unit/store.test.ts`). The bootstrap hook's `Promise.all` can no longer interleave two writers into one key. No finding — recorded as the audit's negative result |
| V16 | NEW depth — the clone's with-data Dashboard ANALYZE | the dev server (warm db: 3 sales / 2 products / 2 categories) + agent-browser probes at 1440/1024/768/390 | **ZERO live defects — the surface measures CORRECT with data at ALL FOUR widths**: stats exactly `$14.75 / 3 / 2 / 0` through the live `stat-today-s-sales`/`stat-transactions`/`stat-products`/`stat-low-stock` testids (StatCard already carries them) · the chart's y-ticks 0/5/10/15 (niceScale — the top tick 15 COVERS the $14.75 data, the F-107 contract live) with weekday x-labels Thu..Wed and the smooth C-segment path · the category-breakdown rows derived (Reports Walk 1 / Drift Sweep 1, both 50% bars) · containment: 390 doc/main 390/390 (chart 316px right 353), 768 (sidebar 220, chart 474), 1024 (sidebar 220, chart 714), 1440 (chart 731). The gap is the MISSING protection (F-121) |
| V17 | vitest + playwright config review (the operator's standing ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (15 files / 151 tests), e2e = production standalone on :3100 + a FRESH scratch `db/e2e.db` per run + desktop/mobile projects + storageState auth. This cycle EXTENDS a spec through them (the new file is picked up by the testDir glob — the configs need no changes) |
| V18 | `.env.example` verify (the operator's standing ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment; the working `.env` carries its 64-hex secret |
| V19 | Spec-ordering analysis for the new file | alphabetical census of `tests/e2e/` vs every empty-state pin | `with-data-dashboard-walk.spec.ts` sorts AFTER surfaces/terminal/viewport-drift-sweep (v < w) and BEFORE with-data-reports-walk (d < r): every empty-state pin of what it creates runs BEFORE its data exists; the reports walk derives its expectations from the API at runtime (robust to the extra sale by design). The mobile project runs after chromium — the walk CLOSES its shift (the self-clean law) |

---

## 1. Findings

### F-121 — the Dashboard surface has no with-data e2e tier (this cycle's NEW depth)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-121** | **MEDIUM** (a protection gap, not a live defect — the V16 ANALYZE proves the surface currently correct with data; the risk is undetected regression) | `tests/e2e/` (no with-data Dashboard spec exists; surfaces.spec.ts pins the EMPTY state's styles only; the s18 harness pins the with-data shape at 1440 in the EVIDENCE tier only) | **The Dashboard — the app's landing view, and the only major surface whose value is computed from BOTH the sales ledger AND the product/category collections — has no with-data protection in the e2e suite.** The standing pins: surfaces.spec asserts the empty-state stat labels/chips/styles and the section-heading levels; the s20 drift-sweep battery covers /Dashboard at all four audit widths EMPTY (data-agnostic containment only); the s18 evidence harness pins the with-data stats/chart/categories at 1440 — but the harness tier runs on the demo db OUTSIDE the suite, and NOTHING pins the with-data shape at 390/768/1024 anywhere. The chain this gap leaves e2e-invisible: the API's sales list → the store's `sales` collection → `summarize(sales, 1)` → the `stat-today-s-sales`/`stat-transactions` testids; the products/categories APIs → `products.length`/`lowStockCount`/the category-breakdown rows and their bar widths; `dailySeries(sales, 7)` → the chart's weekday labels + the niceScale domain covering the today bucket. A regression of the F-118 genus (a second writer clobbering `sales`), a lost StatCard testid, a `lowStockCount` wiring break, a category row that stops rendering when data exists, or a with-data containment break at 390/768/1024 would ALL pass the entire suite today. The reference itself cannot produce this state (V13 — write-gated, its Dashboard carries $0.00), so the tier is a superset addition (the s20/s21/s22 posture). Cure: the with-data Dashboard walk. |

**The session_39 "Next" candidates — disposition:** the with-data Dashboard walk is THIS cycle's
depth (landed). The store's bootstrap pair was probed and found CLEAN (V15 — the F-118 cure
closed the genus; recorded as the audit's negative result, no work needed). The receipt's
PDF/email shape remains a FUTURE candidate (still unmeasurable on the write-gated reference —
a pure-superset feature build, deferred by design).

---

## 2. The cure — `tests/e2e/with-data-dashboard-walk.spec.ts` (2 tests)

The F-119 pattern applied to the Dashboard, with the surface's own shape:

### 2.1 The fixture (self-contained, idempotent — the reports-walk posture)

One chain provisioned through the API (every POST asserting `resp.ok()` — the F-120 law):
category "Dashboard Walk" → product "Dashboard Walk Coffee" $3.25 (stock 10, minStock 2 — an
"ok" stock status so it never perturbs the Low Stock derivation) → register → active shift →
ONE cash sale (2 × $3.25). The spec CLOSES its shift before the assertions (the self-clean
law — the mobile project's POS gate test needs no active shift).

### 2.2 Test 1 — the exact wiring pin (values DERIVED FROM THE APIs at runtime, never hardcoded)

- **Today's Sales / Transactions** — derived from `/api/sales`: filter `status === "completed"`
  and created-today (the `inPeriod(sale, 1, now)` semantics: `created >=` the local midnight
  start and `<= now`; every sale in the fresh run-db is created TODAY, so the today bucket is
  the full completed set — the s22 assumption, unchanged), `round2` the sum, count the rows.
  Assert `stat-today-s-sales` = `fmt(revenue)` and `stat-transactions` = the count (EXACT).
- **Products / Low Stock** — derived from `/api/products`: `products.length`;
  `lowStockCount` = the products where `active && !(stock > 0 && stock > minStock)` (the
  `stockStatus` seam's "ok" condition, mirrored). Assert EXACT.
- **The category breakdown** — derived from `/api/categories` × `/api/products`: rows =
  categories with count > 0, sorted count-desc (+ "Uncategorized" if any product lacks a
  categoryId), bar width = `round(count / total * 100)`%. Assert each row's name+count text
  and its bar's `style` width (the behavior-not-implementation doctrine).
- **The chart's domain COVERS the data (the F-107 contract, live)**: the line-chart's tick
  texts → filter to numeric (the s18 mixed-tick lesson — the Dashboard's x axis is weekday
  labels), `Math.max` them, assert `>= the derived today revenue` (the today bucket is the
  series' last point and its max — every sale in the run-db is created today).
- **The chart's last x-label is TODAY's weekday** (derived: `new Date().toLocaleString("en-US",
  { weekday: "short" })`) — the `dailySeries(sales, 7)` window's right edge.

### 2.3 Test 2 — the with-data containment at the remaining widths (768/1024/390)

With the fixture's data live: at 768 and 1024 the md+ chrome holds (the 220px sidebar visible,
the hamburger hidden — VISIBILITY pins, never count) and doc/main compute
`scrollWidth <= clientWidth`; at 390 the sub-md chrome holds (the hamburger visible), the
frame contains, AND the chart + the category breakdown stay inside the viewport (boundingBox
right edges ≤ 390) — the drift-sweep battery's data-agnostic guard, extended to the with-data
shape at the widths it never visited with data.

### 2.4 Ordering + counts

The file name sorts after `viewport-drift-sweep.spec.ts` and before
`with-data-reports-walk.spec.ts` — every empty-state pin of what it creates runs first; the
reports walk is derivation-robust to the extra sale. E2E **109 → 111**, E2E_SPECS **9 → 10**,
desktop **95 → 97** (UNIT stays 151/15) — the count-lockstep constants AND every live-tense
doc site ride in the SAME commit (the docs-counts gate re-anchored).

---

## 3. Execution order

1. The spec lands (`tests/e2e/with-data-dashboard-walk.spec.ts`, 2 tests) → `bun run build` →
   run the new spec against the standing artifact → **both tests PASS** (the characterization
   green — the V16 ANALYZE pre-proved the design; if a pin fails, forensics FIRST, the F-118
   posture: suspect the probe, then the production code, never the suite's roll).
2. The count-lockstep ride (constants + every live doc site, SAME commit) → `bun run test`
   green (the gate re-anchored).
3. The full gate on the final tree: lint 0 · tsc · unit **151/151** (15 files — UNMOVED) ·
   build · smoke 13/13 · e2e **111/111** (97 desktop + 13 mobile + 1 setup) — plus a second
   consecutive full run.
4. The three with-data evidence harnesses (s16 13/13 · s17 19/19 · s18 20/20) on the final
   tree.
5. Screenshots 105–107 from the remediated dev server → `docs/screenshots/` (via the committed
   `scripts/capture-s23-evidence.mjs` — the with-data Dashboard desktop, the with-data
   Dashboard contained at 390, the mobile drawer).
6. Docs lockstep (§2.4) + the worklog's Session-23 entry + `docs/session_41.md` (the narration
   — the numbering convention: session_39 was the Session-22 cycle's narration, session_40 the
   operator's raw log, so this cycle narrates as session_41).
7. Commit (`test(session-23)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The spec landed green on its FIRST full run** (the characterization green — the V16
  ANALYZE pre-proved the design, the surface being currently correct): after one tsc-only
  wiring fix during authoring (the `ProductRow` type initially omitted `barcode` — the
  fixture's idempotency lookup needs it), both tests passed against the standing artifact
  (`3 passed (10.3s)` including the setup sign-in). Zero production-code changes this cycle
  — the finding was the missing tier, exactly as planned.
- **The fixture verified in the db** (the F-120 posture — verify state, not exit codes):
  after the two consecutive full runs, `db/e2e.db` carries ALL FIVE fixture sales —
  terminal.spec's checkout (T-000001), the drift-sweep's (T-000002 "Drift Sweep"), the
  dashboard walk's (T-000003 "Dashboard Walk"), and the reports walk's pair (T-000004
  cash / T-000005 card) — every walk genuinely provisioning.
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E 111, E2E_SPECS
  10, the "Session-22 lock" → "Session-23 lock" literal, the "95 → 97 desktop" breakdown)
  + README (badge/scripts/testing + the Session-23 walk paragraph) + CLAUDE (baseline +
  the two-walk ordering law, restated precisely: between the two walks the relative order
  is FLEXIBLE — each derives from the API at runtime — the names keep the reports walk
  last by convention) + AGENTS (the Session-23 with-data Dashboard contracts: the
  calendar-bucket mirror law, the "fix the MIRROR" rule, the mixed-tick filter, the
  two-persisting-specs ordering law) + PAD **v1.21** (scale line + file tree + testing
  chapter + spec map + the revision block) + SKILL **v2.19.0** (version + header baselines
  + commands + testing tier + the Session-23 addendum). UNIT stays 151/15.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc
  clean · unit **151/151** (15 files) · build green · smoke **13/13** · e2e **111/111 × 2
  consecutive full runs** (97 desktop + 13 mobile + 1 setup) · the three with-data
  harnesses **s16 13/13 · s17 19/19 · s18 20/20** (the older harness captures restored —
  only this cycle's changed captures commit).
- **Evidence: screenshots 105–107** captured from the remediated dev server via the
  committed `scripts/capture-s23-evidence.mjs` — 105 the with-data Dashboard desktop (the
  derivation verified live against a warm db carrying sales from FOUR different fixtures —
  $21.25/4/3/0, topTick 25 ≥ 21.25, lastTick "Wed", 3 category rows — the
  runtime-derivation design proving itself exactly why hardcoded values are forbidden), 106
  the with-data Dashboard contained at 390 (chart + categories right 353, 3 positive
  bars), 107 the mobile drawer at 390 (288px, zero overflow — the operator's priority
  surface). Plus the D-1-shape reference capture (`ref-mobile-pos-390-s23.png`).
- **`.env.example` verified** against the working `.env` (V18 — key-for-key aligned; the
  working `.env` carries its 64-hex AUTH_SECRET).

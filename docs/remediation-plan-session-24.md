# VeloxPOS Remediation Plan — Session-24

**Date:** 2026-10-28 (Session-24 work cycle)
**Tree:** `ae2d395` received (the Session-23 push `d17f129` + the operator's session_42 raw-log
commit; a `git pull` fast-forward this cycle — the workspace SURVIVED, so the documented rebuild
was NOT needed: `.env` intact with its 64-hex `AUTH_SECRET`, `db/` at the repo root carrying
`custom.db` (warm: 5 products / 3 sales / 3 categories), `demo.db`, `e2e.db`, `smoke.db`,
`node_modules` intact). **Scope:** the standing audit→remediate→push cycle — the received-tree
fast gate, the EIGHTEENTH consecutive live reference re-measurement at every previously-pinned
depth (**all standing pins hold; the reference's mobile defect is STABLE at its Session-21 D-1
shape**), the clone-side mobile-navigation re-verification (the operator's named priority — the
drawer superset probed live on the dev server at 390×844), and this cycle's NEW depth — **the
Inventory CSV round-trip e2e walk** (the session_41 "Next" pointer: "the Inventory CSV
round-trip against a populated ledger") — plus the static sweep (zero-importer census, secrets,
credential, the Session-23 code review). **Method:** skills/web-application (§14 testing tiers,
§15 the gate doctrine), skills/agent-browser (computed styles are ground truth),
skills/tdd + skills/principle-test-behavior-not-implementation (the pins assert observable DOM
values, file content, and API state — never class strings), the count-lockstep doctrine
(docs-counts gate — this cycle's counts MOVE: E2E **111 → 113**, E2E_SPECS **10 → 11**, desktop
**97 → 99**; UNIT stays **151/15**).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull origin main` (fast-forward `d17f129..ae2d395` — session_42.md, the operator's raw log, only) | tree @ `ae2d395`, clean, main-only |
| V2 | Environment contract | `.env` verified: `DATABASE_URL="file:../db/custom.db"` (byte-exact) + the 64-hex `AUTH_SECRET` intact · `db/` at the repo root (custom/demo/e2e/smoke, git-ignored, `.gitkeep` committed) · dev server boots (`GET /login` 200) | environment ready — the `.env`/`db/` contract the operator asks for is in place |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-23 lock holds |
| V4 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** (144 scanned, +2 from Session-23's spec + evidence script); deps: only the known entries (`prisma` the CLI, `react-dom` the implicit Next entry, `z-ai-web-dev-sdk` the evidence-script family) |
| V5 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (`check-owner-credential.mjs`, under bun) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V6 | Secrets scan | ripgrep for key/secret/password patterns across `src/ scripts/ tests/ prisma/` | clean — no live secrets (the known demo-credential constants aside: `prisma/seed.ts` + the evidence-script family) |
| V7 | Session-23 code review (Mode C) | `git show d17f129 --stat` + the received-file reads | the Session-23 commit touched exactly what its plan said: the new `with-data-dashboard-walk.spec.ts` (373 lines), the s23 evidence script (239), screenshots 105–107 + the ref capture, the docs-counts re-anchor, and the docs (AGENTS/CLAUDE/PAD/README/SKILL/plan/session_41/worklog) — **ZERO production code** (`src/` untouched, the F-121 cure is test-tier) |
| V8 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900) | **HOLDS (18th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 "Welcome to VeloxPOS (Point Of Sale)" · inputs 48px/12px · SSO 54px/16px |
| V9 | Live drift — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · rgba(254,242,242,0.7) (red-50/0.7) · 12px radius |
| V10 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · 8 links (Terminal/Dashboard/Inventory/Sales/Registers/Cashiers/Reports/Settings) · doc 1440 = client 1440 (no overflow) |
| V11 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers (1440×900) | **HOLDS**: the date line "Wednesday, October 28, 2026"; both chart h3s 16px/700 ("Sales — Last 7 days" / "Products by Category"); "Historial de Ventas" h1; "Cajeros" h1 + "Turnos Recientes" as H3 |
| V12 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS + /Dashboard | **STABLE at the D-1 shape (no NEW drift)**: no hamburger, the static 220px sidebar, main squeezed to 170px, the document contained at exactly 390 on every route. The Session-21 D-1 record still describes the reference exactly. Screenshot refreshed: `docs/screenshots/ref-mobile-pos-390-s24.png` |
| V13 | Live drift — the reference's Reports surface | /Reports at 1440×900 (sessioned) | **STILL EMPTY**: 2× "No data for this period", the 4 pills (7/14/30/90 days) — the demo account remains write-restricted; the with-data tiers stay a functional-SUPERSET addition (the s20..s23 lineage) |
| V14 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog, 288px (w-72), 8 labeled links · focus → Close on open · body scroll-lock while open · `animation-name: enter` (tw-animate-css) · Escape closes + restores the hamburger's focus + releases the lock · drawer navigation unmounts (verified via /Reports) · zero horizontal overflow at 390. NO Tailwind v4 regression (the plain-CSS glass-* doctrine, `@theme inline`, the `@custom-variant hover` unwrap all hold). **Probe-methodology note (recorded for future cycles):** a synthetic `el.click()` inside `page.evaluate` does NOT move focus (unlike a real user click) — the drawer saves `document.activeElement` at open, so an eval-click probe falsely reads "focus not restored". The real CLI click (or Playwright's `.click()`) is the correct probe; the e2e pin (13/13 through Session-23) uses the real click and holds |
| V15 | The session_41 "Next" candidates — disposition | analysis against the standing suite + the evidence tier | **The Inventory CSV round-trip is THIS cycle's depth** (the deeper gap: a README-advertised superset feature whose full UI chain has ZERO e2e protection — see F-122). The StoreSettings save→toast walk remains a candidate (a smaller chain; its CTA style is pinned in surfaces.spec and its with-data shape in the s18 evidence tier — the save LOOP itself is unpinned but lower-risk than the CSV chain). The receipt's PDF/email shape remains a FUTURE candidate (a pure-superset feature build — new production code, unmeasurable on the write-gated reference, deferred by design) |
| V16 | NEW depth — the clone's CSV round-trip ANALYZE | the dev server (warm db: 3 products / 3 categories) + agent-browser probes: the import happy path (a 2-row fixture through the real file input), the export (the download's file content), the error path (a blank-name row) | **ZERO live defects — every leg of the chain measures CORRECT live**: IMPORT — the toast "Import complete", the count 3 → 5, both fixture rows rendering in the ledger; EXPORT — the header `name,barcode,category,price,cost,stock,minStock,taxRate,unit,active` byte-exact, the imported rows serializing back exactly (the category-NAME resolution working: `categoryId` → the name in the file; `String(number)` semantics: cost 1.50 → `1.5`), the export reading the LIVE store (stock reflecting the fixture sales' decrements); ERROR — the toast "Import failed: name is required" (parseCsvRow's exact message), the count UNCHANGED (zero rows imported). The gap is the MISSING protection (F-122) |
| V17 | vitest + playwright config review (the operator's standing ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (15 files / 151 tests), e2e = production standalone on :3100 + a FRESH scratch `db/e2e.db` per run (global-setup deletes + re-provisions BEFORE boot) + desktop/mobile projects + storageState auth + `workers: 1` (serial). This cycle EXTENDS a spec through them (the new file is picked up by the testDir glob — the configs need no changes) |
| V18 | `.env.example` verify (the operator's standing ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment; the working `.env` carries its 64-hex secret |
| V19 | Spec-ordering + state-isolation analysis for the new file | alphabetical census of `tests/e2e/` vs every product-sensitive pin + the provisioning contract | `with-data-inventory-csv.spec.ts` sorts AFTER `with-data-dashboard-walk.spec.ts` (d < i) and BEFORE `with-data-reports-walk.spec.ts` (i < r): inventory.spec's "No products found" + "1 products registered" pins run BEFORE it exists (i < w, workers: 1); the dashboard walk runs BEFORE it (d < i — its product/category derivations see only its own fixture); the reports walk derives everything from the SALES API at runtime (robust to extra products by design — it provisions its own product and pins no global count); the mobile project's specs carry no product-count pins; the fresh-db-per-run contract (global-setup deletes + re-provisions before boot) makes the twice-consecutive gate runs independent |

---

## 1. Findings

### F-122 — the Inventory CSV round-trip has no e2e protection (this cycle's NEW depth)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-122** | **MEDIUM** (a protection gap, not a live defect — the V16 ANALYZE proves every leg of the chain currently correct live; the risk is undetected regression) | `tests/e2e/` (no CSV spec exists; `tests/unit/inventory-status.test.ts` pins the pure `parseCsv`/`parseCsvRow`/`productsToCsv` seam only) | **The Inventory CSV round-trip — a README-advertised superset feature ("CSV export + import") — has ZERO e2e protection of its UI chain.** The unit tier pins the pure seam, but the WIRING is e2e-invisible: the IMPORT chain (the hidden file input → `parseCsv`/`parseCsvRow` → the per-row `POST /api/products` → `upsertProduct` into the store → the ledger's re-render → the "Import complete" toast) and the EXPORT chain (the store's products → `productsToCsv` with its **category-NAME resolution** (`categoryId` → the category's name — a store-dependent derivation the unit tier cannot test) → the Blob → the `a.download="products.csv"` trigger → the downloaded file's content). A lost `upsertProduct` call, a broken download trigger, a category-resolution break, a toast regression, or a parse-error handling break would ALL pass the entire suite today — and the reference itself cannot produce this state (its demo account is write-restricted; V13), so the feature is superset-only and its regression would be invisible against the reference too. The error path (a blank-name row → "Import failed: name is required", zero rows imported) is equally unpinned. Cure: the CSV round-trip walk (§2). |

**The session_41 "Next" candidates — disposition:** the Inventory CSV round-trip is THIS
cycle's depth (landed). The StoreSettings save→toast walk and the receipt's PDF/email shape
remain future candidates (V15).

---

## 2. The cure — `tests/e2e/with-data-inventory-csv.spec.ts` (2 tests)

The F-119/F-121 pattern applied to the CSV surface, with the round-trip's own shape.

### 2.1 The fixture (self-contained, idempotent)

One category "CSV Walk" provisioned through the API (the POST asserting `resp.ok()` — the
F-120 law; re-used if present on a warm db). The import CSV is built IN THE SPEC as a buffer
(`setInputFiles` with `{ name, mimeType, buffer }` — no temp files) with TWO rows chosen to
serialize byte-stably through `String(number)`:

- Row 1 (the category-resolution leg): `CSV Round Tea,CSVRT-001,CSV Walk,4.25,1.5,20,5,0,Piece,true`
- Row 2 (the no-category leg): `CSV Round Choco,CSVRT-002,,3.75,,15,3,16,Piece,true`

Row 1's stock 20 > minStock 5 = an "ok" stock status (never perturbs any Low Stock derivation);
row 2's stock 15 > minStock 3 likewise. The barcodes are unique to this spec (no collision with
the other fixtures' `DWALK/DSWEEP/RWALK` codes).

### 2.2 Test 1 — the round-trip wiring pin (values DERIVED FROM THE APIs at runtime)

- **Pre-state** — `GET /api/products`: the pre-import count + the barcode set (the CSVRT codes
  absent — the fresh-db contract).
- **Import** — `setInputFiles` on the hidden `input[aria-label="Import products from CSV"]`
  with the buffer → the toast "Import complete" in the Notifications region → the ledger count
  text = preCount + 2 → both rows' Product cells visible → **API verify (the F-120 posture —
  state, not just UI)**: both barcodes present, row 1's `categoryId` = the provisioned
  category's id, row 2's `categoryId` = null.
- **Export** — `page.waitForEvent("download")` around the "Export products as CSV" click →
  `download.suggestedFilename()` = `products.csv` (the `a.download` attribute) → the file
  content: the header line byte-exact, row 1's line byte-exact (`CSV Round Tea,CSVRT-001,CSV
  Walk,4.25,1.5,20,5,0,Piece,true` — the category-NAME resolution round-trip), row 2's line
  byte-exact (the empty category + empty cost columns), and the data-line count = the
  API-derived product total at export time (`toContain` per line — NEVER full-file equality;
  the export is the FULL ledger and the other fixtures' rows ride along by design).

### 2.3 Test 2 — the import error path

A one-row buffer CSV with a BLANK name (`,CSVERR-001,,4.25,,10,5,0,Piece,true`) → the toast
"Import failed: name is required" (`parseCsvRow`'s exact message through the catch) → the
ledger count UNCHANGED → API verify: the barcode absent (zero rows imported).

### 2.4 Ordering + counts

The file name sorts after `with-data-dashboard-walk.spec.ts` and before
`with-data-reports-walk.spec.ts` (d < i < r) — V19's isolation analysis. E2E **111 → 113**,
E2E_SPECS **10 → 11**, desktop **97 → 99** (UNIT stays 151/15) — the count-lockstep constants
AND every live-tense doc site ride in the SAME commit (the docs-counts gate re-anchored).

---

## 3. Execution order

1. The spec lands (`tests/e2e/with-data-inventory-csv.spec.ts`, 2 tests) → `bun run build` →
   run the new spec against the standing artifact → **both tests PASS** (the characterization
   green — the V16 ANALYZE pre-proved the design; if a pin fails, forensics FIRST, the F-118
   posture: suspect the probe, then the production code, never the suite's roll).
2. The count-lockstep ride (constants + every live doc site, SAME commit) → `bun run test`
   green (the gate re-anchored).
3. The full gate on the final tree: lint 0 · tsc · unit **151/151** (15 files — UNMOVED) ·
   build · smoke 13/13 · e2e **113/113** (99 desktop + 13 mobile + 1 setup) — plus a second
   consecutive full run.
4. The three with-data evidence harnesses (s16 13/13 · s17 19/19 · s18 20/20) on the final
   tree.
5. Screenshots 108–110 from the remediated dev server → `docs/screenshots/` (via the committed
   `scripts/capture-s24-evidence.mjs` — the with-data Inventory ledger with the imported rows,
   the CSV export capture, the mobile drawer).
6. Docs lockstep (§2.4) + the worklog's Session-24 entry + `docs/session_43.md` (the narration
   — the numbering convention: session_41 was the Session-23 cycle's narration, session_42 the
   operator's raw log, so this cycle narrates as session_43).
7. Commit (`test(session-24)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The spec landed green on its FIRST full run** (the characterization green — the V16
  ANALYZE pre-proved the design, the surface being currently correct): after one tsc-only
  fix during authoring (the `provision` helper's `catId` needed the early-return narrowing
  pattern — `let` + closure assignment doesn't narrow), both tests passed against the
  standing artifact (`3 passed (10.4s)` including the setup sign-in). Zero production-code
  changes this cycle — the finding was the missing tier, exactly as planned.
- **The fixture verified in the db** (the F-120 posture — verify state, not exit codes):
  after the two consecutive full runs, `db/e2e.db` carries BOTH CSV walk rows (CSVRT-001
  `CSV Round Tea` with the categoryId resolved to the "CSV Walk" category, CSVRT-002 `CSV
  Round Choco` with `categoryId: null`), the error row CSVERR-001 ABSENT, and the other
  walks' fixtures intact (7 products — inventory.spec's, terminal's, the drift-sweep's,
  the dashboard walk's, the reports walk's, + the CSV pair; 5 sales; 6 categories).
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E 113, E2E_SPECS
  11, the "Session-23 lock" → "Session-24 lock" literal, the "99 desktop" breakdown) +
  README (badge/scripts/testing + the Session-24 walk paragraph) + CLAUDE (baseline 113 +
  the three-walk ordering law, the CSV walk's products perturbing no sale-derived pin) +
  AGENTS (the Session-24 CSV round-trip contracts: the byte-exact-per-line law, the
  byte-stable fixture values, the category resolution both ways, the three-persisting-specs
  ordering law, the V14 probe-methodology law) + PAD **v1.22** (scale line + file tree +
  the spec map + the revision block) + SKILL **v2.20.0** (version + header baselines +
  commands + testing tier + the Session-24 addendum). UNIT stays 151/15.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc
  clean · unit **151/151** (15 files) · build green · smoke **13/13** · e2e **113/113 × 2
  consecutive full runs** (99 desktop + 13 mobile + 1 setup) · the three with-data
  harnesses **s16 13/13 · s17 19/19 · s18 20/20** (the older harness captures restored —
  only this cycle's changed captures commit).
- **Evidence: screenshots 108–110** captured from the remediated dev server via the
  committed `scripts/capture-s24-evidence.mjs` — 108 the with-data Inventory ledger with
  the imported CSV rows (the count derived live 5 → 7, the tea row's category resolved by
  name, the choco row uncategorized), 109 the import-complete toast moment, 110 the mobile
  drawer at 390 (288px, zero overflow — the operator's priority surface). The export
  round-trip verified live in the same run (the header byte-exact, both fixture lines
  byte-exact, 7 data lines = the API total). **A capture-methodology catch, recorded:**
  the first pass produced byte-identical 108/109 (the toast's 5s auto-dismiss window
  spans both captures — the "settled" ledger showed the toast too); the fix waits for the
  toast's `hidden` state before the settled capture, giving the two frames their distinct
  stories. Plus the D-1-shape reference capture (`ref-mobile-pos-390-s24.png`).
- **`.env.example` verified** against the working `.env` (V18 — key-for-key aligned; the
  working `.env` carries its 64-hex AUTH_SECRET).

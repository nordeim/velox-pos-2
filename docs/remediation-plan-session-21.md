# VeloxPOS Remediation Plan — Session-21

**Date:** 2026-10-28 (Session-21 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-20 tree (HEAD `e9513d7` — the
Session-20 push `927bc98` + the operator's session_36 raw-log commit; a git-pull refresh this
cycle, the workspace persisted from Session-20). A full received-tree gate re-verification, the
FIFTEENTH consecutive live reference re-measurement at every previously-pinned depth (**one
drift found — the reference's phone layout changed**, see D-1), the clone-side
mobile-navigation re-verification (the operator's named priority — the drawer superset probed
live on the dev server at 390×844), and this cycle's NEW-depth audit — **the with-data mobile
walk of the remaining ledger surfaces (Sales and Cashiers at 390, the session_35 "Next"
pointer: "a deeper with-data mobile walk of the remaining ledger surfaces (Sales and Cashiers
at 390, the two tables the s20 guard covers only by the frame contract)")** — plus the static
sweep (zero-importer file/dependency censuses, secrets, credential, the Session-20 code
review).
**Method:** skills/web-application (§14 testing tiers, §15 the gate doctrine),
skills/agent-browser (computed styles are ground truth), skills/tdd +
skills/principle-test-behavior-not-implementation (the pins assert observable frame geometry
and FUNCTIONAL scrolling — the `scrollLeft` read-back, never class strings), the count-lockstep
doctrine (docs-counts gate — this cycle's counts stay **UNMOVED**: E2E 107, E2E_SPECS 8,
UNIT 149/14; the restructured test keeps the totals).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull origin main` (`927bc98` → `e9513d7` — ONLY `docs/session_36.md`, the operator's raw-log commit of the session_35 conversation); clean tree | synced @ `e9513d7` |
| V2 | Environment contract | the persisted workspace re-verified: `.env` `DATABASE_URL="file:../db/custom.db"` (byte-exact) — but the template's unevaluated `AUTH_SECRET="$(openssl rand -hex 32)"` literal had replaced the generated secret (the sandbox's .env reset); **regenerated a fresh 64-hex secret** · `db/` at the repo root (`custom.db`/`demo.db`/`e2e.db`/`smoke.db` + `.gitkeep`) · bun 1.3.14 · agent-browser 0.39.4 · Playwright chromium-1243 cached | environment ready — the `.env`/`db/` contract the operator asked for is in place and re-verified |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 149/149** (14 files) — the Session-20 lock holds |
| V4 | Standalone build + smoke | `bun run build` → `bun run smoke` | build green (full route table; the documented instrumentation boot-guard warning) · smoke **13/13** (incl. artifact hygiene + the no-secret boot refusal) |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **107/107** (2.9m — 93 desktop + 13 mobile + 1 setup); the mobile drawer suite + the Session-20 drift-sweep battery green on arrival |
| V6 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** (88 live; the one convention flag `src/instrumentation.ts`); deps: only the known tooling/type-level/CLI entries + `z-ai-web-dev-sdk` (live — the VLM evidence-script family) |
| V7 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (the persisted `check-owner-credential.mjs`, run with **bun** — it imports `bun:sqlite`) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V8 | Secrets scan | `git grep` for 40+ hex runs across the tracked tree | clean — the hits are test fixtures (the suite's throwaway AUTH_SECRET constants, the lighthouse archive hashes, bun.lock hashes); no live secrets |
| V9 | Session-20 code review (Mode C) | `git diff 6f32b4f..927bc98` | the Session-20 commit touched exactly what the plan said: the new `viewport-drift-sweep.spec.ts` (2 tests), docs-counts re-anchor, the evidence script, screenshots 96–98, the docs lockstep (AGENTS/CLAUDE/README/PAD/SKILL/worklog/session_35) — ZERO unplanned production code; the session_36 commit is the operator's raw log only |
| V10 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900; note: the `--viewport` flag did not apply — the persisted session carried 390×844; `set viewport` is the working command) | **HOLDS (15th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px/16px |
| V11 | Live drift — the F-76 error alert | wrong-credentials submit (`main [role=alert]` scoping) | **HOLDS byte-exact**: "Invalid email or password" · 16px pad · red-50/0.7 (rgba(254,242,242,0.7)) · 1px red-200 (rgb(254,202,202)) · 12px radius |
| V12 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · z-50 · 8 links |
| V13 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: the date line 14px slate-500 rgb(100,116,139) en-US; both chart h3s 16px/700; "Historial de Ventas" + the byte-exact search placeholder + the 7 ledger headers; "Cajeros" h1 24px/700 + "Turnos Recientes" as H3 |
| V14 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS + /Dashboard + /Inventory + /Sales + /Registers | **DRIFTED (D-1, this cycle's reference-side finding)**: still NO hamburger, still the static 220px sidebar — but the document NO LONGER scrolls to 1280px. Every route now computes docScrollW 390 = clientW 390 with **main crushed to 170px** (390 − 220) carrying its own `overflow-x: auto` — the reference changed its phone layout from "document overflows" to "content squeezed beside the sidebar". The defect class persists (unusable 170px main), the observable changed. Screenshot: `docs/screenshots/ref-mobile-pos-390-s21.png` |
| V15 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog, 288px (w-72), glass-dark rgba(13,15,26,0.95), 8 labeled links · focus → Close on open · Escape closes + restores the hamburger's focus + releases the scroll lock · drawer navigation auto-closes (unmounts, verified via /Dashboard) · zero horizontal overflow at 390px — plus the 13/13 mobile e2e (V5). NO Tailwind v4 regression (the glass-* plain-CSS doctrine, `@theme inline`, the `@custom-variant hover` unwrap all hold) |
| V16 | NEW depth — the with-data ledgers at 390 (Sales/Cashiers) | dev server + API-provisioned data (category/product/register/shift; the dev db already carried 4 sales + 9 shifts from prior cycles' testing); agent-browser probes on /Sales + /Cashiers at 390×844 | **ZERO live defects — the surfaces measure CORRECT with data**: Sales doc 390/390, main 390/390, table 720 (the `min-w-[720px]` floor), container `.vpx-scroll overflow-x-auto`, functionalScroll TRUE, 4 rows; Cashiers doc 390/390, main 390/390, table 640 (the `min-w-[640px]` floor), functionalScroll TRUE, 9 rows. The gap is the MISSING protection (F-117) |
| V17 | NEW depth — the mutation proof on the NEW surfaces | the live injected regression (`.vpx-scroll { overflow-x: visible !important }`) on /Sales + /Cashiers at 390, the V18 posture | **the pin design is evidence-backed on both new surfaces**: intact functionalScroll TRUE → under the mutation FALSE (`scrollLeft = 50` no-ops) — the functional-scroll pin CATCHES the regression class on Sales AND Cashiers (pinCatches: true, both) |
| V18 | vitest + playwright config review (the operator's standing ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (14 files / 149 tests), e2e = production standalone on :3100 + own `db/e2e.db` + desktop/mobile projects + storageState auth; this cycle EXTENDS a spec through them (the configs need no changes) |
| V19 | `.env.example` verify (the operator's standing ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment; the working `.env` now carries the freshly regenerated 64-hex secret |

---

## 1. Findings

### F-117 — the with-data containment guard covers Inventory only (this cycle's NEW depth)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-117** | **MEDIUM** (a protection gap, not a live defect — the code is currently correct; the risk is undetected regression) | `tests/e2e/viewport-drift-sweep.spec.ts` (Test 2's Inventory-only coverage) | **The with-data ledger containment guard pins Inventory only.** The clone ships THREE wide ledger tables — Inventory `min-w-[760px]` (inventory-view.tsx:535), Sales `min-w-[720px]` (sales-view.tsx:126), Cashiers `min-w-[640px]` (cashiers-view.tsx:219) — each inside its own `.vpx-scroll overflow-x-auto` container. The s20 guard (Test 2) provisions a product and walks **Inventory@390 only**; Sales and Cashiers are covered **only by the frame contract** (Test 1's empty-store battery) — and the V18 mutation proof already established the frame pin is BLIND to the inner-container break (the outer `glass-card overflow-hidden` absorbs the spill; Chromium's `scrollWidth` cannot distinguish `auto` from `visible`). A Tailwind v4 utility edit that breaks either container (the exact trap class this repo documents) or strips either table's `min-w-*` floor would pass the ENTIRE suite today. The V16/V17 ANALYZE proves both surfaces currently correct with data at 390 — the finding is the missing protection on the two remaining ledgers (the session_35 "Next" pointer, named exactly). Cure: restructure Test 2 into the three-ledger walk. |

### F-118 — the store's shifts-collection bootstrap race (found BY the F-117 walk during execution)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-118** | **HIGH** (a real production race — intermittent data loss in the ledger views; found live by the F-117 walk's first full-suite runs, reclassified from the F-117 protection-gap-only expectation) | `src/lib/store.ts` (`loadCore`), `src/components/pos/use-pos-bootstrap.ts` (the parallel pair) | **Two writers raced on the store's `shifts` collection.** `loadAll` fetched `/api/shifts` (the FULL list — the Cashiers "Turnos Recientes" and Registers history invariant) while `loadCore` fetched `/api/shifts?status=active` (the ACTIVE-ONLY list) and wrote it into the SAME key — both inside the bootstrap hook's `Promise.all([loadAll(), loadCore()])`. Whichever write landed last won; when loadCore's landed last, the ledgers lost their closed-shift history ("Sin turnos registrados" with three closed shifts in the db — the walk's Cashiers leg, flaky 2-in-4 full runs). Invisible to 20 sessions of empty-store e2e by construction (no closed shifts exist to lose — the s15 V24 doctrine). No consumer reads the active-only value (the terminal gate filters the collection itself). Cure: the deterministic unit regression (`tests/unit/store.test.ts`, RED on the pre-fix store) + `loadCore` refreshes settings ONLY. |

### D-1 — the reference's phone layout changed (recorded; reference-side drift)

| ID | Severity | Location | Description |
|---|---|---|---|
| **D-1** | **INFORMATIONAL** (reference-side; the clone's posture is unaffected — the drawer superset remains strictly better) | the reference's phone layout; the live-tense doc sites describing it | **The 15th sweep caught the reference's mobile defect EVOLVED.** Sessions 101–20 measured: no hamburger + the static 220px sidebar + **the 390px document scrolling out to 1280px**. This cycle: still no hamburger, still the 220px static sidebar — but the document now computes `scrollWidth 390 = clientWidth 390` on every route, with **main squeezed to 170px** (390 − 220) carrying its own `overflow-x: auto`. The reference restructured its phone layout from "document overflows" to "content crushed beside the sidebar". The defect class persists (an unusable 170px main beside a chrome-only 220px rail); the observable changed. The clone's drawer superset (hamburger + 288px dialog + full-width main) remains the correct posture — no clone code changes. The live-tense doc sites that state the OLD observable as current fact need the refresh (AGENTS the four-width section, PAD ADR-004's rationale note, README's mobile-drawer line, the SKILL's live testing section where it echoes the class); history blocks (session plans, PAD revision blocks, the SKILL's Session-20 addendum) keep their historical statements by design. |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every other standing reference pin** (V10–V13): FIFTEENTH cycle, all byte-exact except D-1. The
  reference is stable on every previously-pinned surface; the pin doctrine keeps proving it.
- **The clone's mobile navigation** (V15): the drawer superset is fully live on the dev server
  (all a11y pins + the 13/13 mobile e2e) — the operator's priority check passes with no Tailwind
  v4 regression.
- **The Sales/Cashiers surfaces themselves** (V16): zero live findings with data at 390 — both
  ledgers contained, functionally scrollable, floors intact. The finding is the missing TIER, not
  a broken surface (the F-117 classification, the F-116 posture).
- **The received tree** (V3–V5): fully green at the Session-20 baselines.
- **The vitest/playwright configs** (V18): current and well-formed — no changes needed (the
  operator's "add test suites by modifying the respective config files" is satisfied by the
  standing configs + this cycle's spec extension through them).
- **The e2e count stays 107** — the restructure keeps both tests in the drift-sweep spec (the
  battery + the with-data guard, now the three-ledger walk). No count-lockstep ride this cycle;
  the guard-coverage DESCRIPTIONS move in the same commit (the docs-alignment duty).

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The production cure is ONE restructured test (no production code changes):**
   `tests/e2e/viewport-drift-sweep.spec.ts` Test 2 becomes **the three-ledger with-data walk**:
   - **The provisioning chain** (the serial one-worker suite owns its data; names unique to this
     spec, idempotent on re-runs): the existing "Drift Sweep" category + "Drift Sweep Cola"
     product, PLUS a "Drift Sweep Register" register → an open shift (POST /api/shifts
     `{registerId, openingFloat: 100}` — the shift's `cashierId` is the owner, so the Cashiers
     ledger renders it) → a checkout (POST /api/sales `{items: [{productId, quantity: 2}],
     paymentMethod: "cash", amountPaid: 20}` — lowercase enum, the Zod gate). One chain feeds
     all three ledgers: the product → Inventory, the sale → Sales, the shift → Cashiers.
   - **The walk**: 390×844, then for each of [/Inventory, /Sales, /Cashiers]: `goto` +
     the settled wait (the V16 posture — the route's OWN row: the product row / the sale's
     ticket row / the shift row carrying the register name), then ONE evaluate returning
     `{docScrollW, clientW, mainScrollW, functionalScroll, tableScrollW}` with the container
     lookup `table.closest(".vpx-scroll")` (the s20 lesson — never a document-order find).
   - **The per-route assertions** (messages carry the route name): doc/main `scrollWidth ≤ 390`;
     the container is a FUNCTIONAL scroll region (`scrollLeft = 50` read-back — the V18/V17
     mutation-proven observable); the table keeps its floor (**≥ 760 / 720 / 640** per route —
     the container contains, the table never shrinks).
2. **The TDD posture (the honest red for a protection gap):** the pins land FIRST and must PASS
   on the standing build — the defect class is the MISSING protection, and the V17 mutation
   probe IS the red proof on both new surfaces (the pin's observable provably fails under the
   injected regression: `functionalScroll: false` measured live on Sales AND Cashiers). No
   production code changes ride this cycle — a characterization extension over measured-correct
   behavior, with the mutation proofs recorded as the regression-class evidence.
3. **The D-1 doc refresh (live-tense sites only):** AGENTS.md (the four-width section's
   reference-defect line — the new observable + the drift note), PAD v1.18 → **v1.19** (ADR-004's
   rationale gains the Session-21 drift note; the live testing chapter's drift-sweep entry
   extends to the three-ledger walk; a Session-21 revision block), README (the mobile-drawer
   overview line refresh + the testing section's guard sentence), SKILL **v2.16.0 → v2.17.0**
   (the live testing section's guard extension + the Session-21 addendum with the D-1 record),
   CLAUDE (the drift-sweep law line extends to the three ledgers). History blocks keep their
   historical statements.
4. **Counts UNMOVED — the lockstep gate stays green:** E2E 107, E2E_SPECS 8, UNIT 149/14. The
   docs-counts constants do not change; the guard-coverage descriptions do (same commit).
5. **Evidence: screenshots 99–101** (the numbered record continues at 98): 99 the with-data
   Sales ledger contained at 390 (the ticket row + the functional scroll verified live during
   capture), 100 the with-data Cashiers ledger contained at 390 (the shift row + the functional
   scroll), 101 the mobile drawer at 390 (the operator's priority surface) — captured from the
   remediated dev server via the committed self-provisioning `scripts/capture-s21-evidence.mjs`
   (the s19/s20 family posture).
6. **The three standing with-data harnesses** (`capture-s16/s17/s18-evidence.mjs`) run on the
   final tree — the cycle doctrine (run all when the with-data protection changes).

### The RED posture (the mutation proofs, recorded)

- The V17 probe injected the regression class (`.vpx-scroll { overflow-x: visible !important }`)
  on BOTH new surfaces and measured the failure: the functional scroll no-ops (`scrollLeft = 50`
  → reads 0) on Sales AND Cashiers, while the intact build scrolls both. A pin asserting the
  functional scroll therefore FAILS under the regression — the red is proven by construction, on
  the live DOM, before the spec is written (the V18 posture, extended). The frame-level battery
  assertions additionally catch the double-break class on every route at every width.

---

## 3. Execution order

1. This plan → validation against the codebase (the provisioning chain's API contracts —
   `shiftOpenSchema`, `saleCreateSchema` (lowercase `paymentMethod`), the cashiers ledger's row
   source (`recentShifts`, the shift's `cashier` relation) — the doc-site anchor list, the
   screenshot numbering 99–101).
2. **The spec lands** (the restructured Test 2) → `bun run build` → run the drift-sweep spec
   against the standing artifact → **both tests PASS** (the characterization green; the red is
   the V17 mutation record).
3. **The full gate on the final tree:** lint 0 · tsc · unit **149/149** (14 files) · build ·
   smoke 13/13 · e2e **107/107** (93 desktop + 13 mobile + 1 setup).
4. **The three with-data evidence harnesses** (s16 Registers/Sales/Cashiers · s17
   Inventory/Reports · s18 StoreSettings/Dashboard) on the final tree — all green.
5. Screenshots 99–101 from the remediated dev server → `docs/screenshots/` (via the committed
   `scripts/capture-s21-evidence.mjs`).
6. Docs lockstep (§2.3) + the worklog's Session-21 entry + `docs/session_37.md` (the narration).
7. Commit (`test(session-21)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The audit pre-proved the F-117 design** (V16/V17): both new ledger surfaces measured
  correct with data at 390; the mutation proofs established the functional-scroll pin's
  observable on Sales AND Cashiers (the injected regression no-ops the assignment on both).
  Zero checks weakened.
- **The spec landed and its first full-suite runs caught a REAL production bug the empty-store
  suite could never see (F-118 — reclassified from "protection gap only" to "the walk caught a
  live race").** The Cashiers leg flaked twice in four full runs: the ledger rendered "Sin
  turnos registrados" with three closed shifts in the db. The trace + network forensics
  (test-results trace.zip: the API returned the correct 3-shift list with 200s on every leg)
  isolated the root cause to the CLIENT store: `loadCore` wrote the active-only shifts into
  the same `shifts` key `loadAll` fills with the full ledger list — racing inside the
  bootstrap hook's `Promise.all`, the last writer won (the pre-fix interleaving: loadCore's
  filtered fetch resolving after loadAll's full fetch). Twenty sessions of empty-store e2e
  never saw it (no closed shifts exist to lose — the s15 V24 doctrine, proven twice now).
- **The TDD cure (F-118)**: the deterministic regression FIRST — `tests/unit/store.test.ts`
  (the path-dispatched transport mock; the race test pins the active-only-fetch-resolves-LAST
  interleaving, the direct test pins loadCore leaving a populated collection alone) → **RED on
  the pre-fix store (both its)** → the surgical fix (`loadCore` refreshes settings ONLY — no
  consumer reads the active-only value; the terminal gate filters the collection itself:
  `shifts.find(sh => sh.status === "active")`) → **GREEN**. UNIT **149 → 151** (14 → 15 files —
  the store seam joins the registry).
- **The F-117 walk also learned the self-clean law the hard way**: the first version left its
  shift ACTIVE, and the mobile project's terminal-gate test (which runs AFTER chromium) failed
  on the very next run — the spec now CLOSES its shift before the walk (the terminal.spec
  posture; a closed shift still renders the Cashiers ledger row, "Cerrado" — verified in
  capture 100).
- **Count lockstep executed in the same commit**: docs-counts.test.ts (UNIT 151, UNIT_FILES 15,
  the "Session-20 lock" → "Session-21 lock" literal) + vitest.config.ts header (15 files +
  store in the registry list) + README (badge/scripts/tree/testing) + CLAUDE (baseline + the
  drift-sweep extension + the store law) + AGENTS (the file count + the Session-21
  store-writer contracts + the three-ledger walk contract + the D-1 refresh) + PAD **v1.19**
  (scale line + file tree + testing chapter + the spec map + ADR-004's drift note + the
  revision block) + SKILL **v2.17.0** (version + header baselines + commands + testing + the
  Session-21 addendum). E2E stays 107 — the walk RESTRUCTURES the s20 guard's second test
  (one provisioning chain, three route visits, per-route floors 760/720/640).
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc clean ·
  unit **151/151** (15 files) · build green · smoke **13/13** · e2e **107/107 × 2 consecutive
  full runs** (the race cure verified — the flake was 2-in-4 pre-fix) · the three with-data
  harnesses **s16 13/13 · s17 19/19 · s18 20/20**.
- **Evidence: screenshots 99–101** captured from the remediated dev server via the committed
  self-provisioning `scripts/capture-s21-evidence.mjs` — 99 the with-data Sales ledger
  contained at 390 (ticket row + table 720 + functionalScroll verified live), 100 the
  with-data Cashiers ledger contained at 390 (the F-118 surface: the CLOSED shift row renders
  "Cerrado" + table 640 + functionalScroll — the race's exact failure mode, now cured and
  proven live), 101 the mobile drawer at 390 (288px, 8 links, zero overflow — the operator's
  priority surface). Plus the D-1 reference-side drift capture
  (`ref-mobile-pos-390-s21.png` — the reference's new crushed-main phone layout).
- **`.env.example` verified** against the working `.env` (V19 — key-for-key aligned; the
  working `.env` carries the freshly regenerated 64-hex AUTH_SECRET after the sandbox's
  template-literal reset was caught at V2).

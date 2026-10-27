# VeloxPOS Remediation Plan — Session-20

**Date:** 2026-10-28 (Session-20 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-19 tree (HEAD `6f32b4f` =
the Session-19 push `2d18c51` + the operator's session_34 raw-log commit — a git-pull refresh
this cycle, the workspace persisted from Session-19: `.env`/`db/`/`node_modules` all in place).
A full received-tree gate re-verification, the FOURTEENTH consecutive live reference
re-measurement at every previously-pinned depth (zero drift), the clone-side
mobile-navigation re-verification (the operator's named priority — the drawer superset probed
live on the dev server at 390×844), and this cycle's NEW-depth audit — **the four-width
responsive drift-sweep tier (the session_33 "Next" pointer: "the neo-crm-style drift-sweep
gates at 390/768/1024/1440 widths — a standing visual-regression tier this codebase does not
yet have"; the master skill §15's `gate:full` doctrine)** — plus the static sweep (zero-importer
file/dependency censuses, secrets, credential, Session-19 code review).
**Method:** skills/web-application (§14 testing tiers, §15 the gate + the drift-sweep
doctrine), skills/agent-browser (computed styles are ground truth), skills/tdd +
skills/principle-test-behavior-not-implementation (the pins assert observable frame geometry
and FUNCTIONAL scrolling — scrollLeft assignment, never class strings), the count-lockstep
doctrine (docs-counts gate — this cycle moves E2E 105→107 and E2E_SPECS 7→8).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull origin main` (`2d18c51` → `6f32b4f` — ONLY `docs/session_34.md`, the operator's raw-log commit of the session_33 conversation); clean tree | synced @ `6f32b4f` |
| V2 | Environment contract | the persisted Session-19 workspace re-verified: `.env` (`DATABASE_URL="file:../db/custom.db"` + the 64-hex `AUTH_SECRET`) · `db/` at the repo root (`custom.db`/`e2e.db`/`smoke.db` + `.gitkeep`) · bun 1.3.14 · agent-browser 0.39.4 · Playwright 1.63 + chromium-1243 | environment ready — the `.env`/`db/` contract the operator asked for was already in place and is re-verified byte-for-byte |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 149/149** (14 files) — the Session-19 lock holds |
| V4 | Standalone build + smoke | `bun run build` → `bun run smoke` | build green (full route table; the documented instrumentation boot-guard warning) · smoke **13/13** (incl. artifact hygiene + the no-secret boot refusal) |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **105/105** (2.4m — 91 desktop + 13 mobile + 1 setup); the mobile drawer suite green (the operator's named priority holds on the received tree) |
| V6 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** (88 live; the one convention flag `src/instrumentation.ts`); deps: only the known tooling/type-level/CLI entries + `z-ai-web-dev-sdk` (live — the VLM evidence-script family) |
| V7 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (the persisted `check-owner-credential.mjs`) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V8 | Secrets scan | `git grep` for 40+ hex runs across the tracked tree | clean — the hits are test fixtures (the suite's throwaway AUTH_SECRET constants, the lighthouse archive hashes); no live secrets |
| V9 | Session-19 code review (Mode C) | `git diff c16900c..6f32b4f` | the Session-19 commits touched exactly what the plan said: `tokens.css` (the print `color: #000` descendant rule), `sales-view.tsx` (the `.receipt-print` wrapper, footer outside), `terminal.spec.ts` (the print pins), `docs-counts.test.ts`, the evidence script + docs/screenshots/worklog — ZERO unplanned production code |
| V10 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900) | **HOLDS (14th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px/16px |
| V11 | Live drift — the F-76 error alert | wrong-credentials submit (`main [role=alert]` scoping) | **HOLDS byte-exact**: "Invalid email or password" · 16px pad · red-50/0.7 · 1px red-200 · 12px radius |
| V12 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · z-50 · 8 links |
| V13 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: date line 14px slate-500 en-US; both chart h3s 16px/700; "Historial de Ventas" + the 7 ledger headers + the byte-exact search placeholder; "Cajeros" h1 24px/700 + "Turnos Recientes" as H3 |
| V14 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS | **HOLDS**: still NO hamburger, the 220px static sidebar, the document scrolls to 1280px wide at a 390px viewport — the reference's own defect, unchanged (14th cycle) |
| V15 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog + aria-label, 288px (w-72), glass-dark rgba(13,15,26,0.95), 8 labeled links · focus → Close on open · Escape closes + restores the hamburger's focus + releases the scroll lock · drawer navigation auto-closes (unmounts, verified via /Dashboard) · zero horizontal overflow at 390px — plus the 13/13 mobile e2e (V5). NO Tailwind v4 regression (the glass-* plain-CSS doctrine, `@theme inline`, `@custom-variant hover` all hold) |
| V16 | NEW depth — the four-width route battery (empty store) | the persisted ANALYZE probe (`width-sweep-analyze.mjs`, outside the repo) on the dev server: 8 routes × 4 widths (390/768/1024/1440) | **ZERO overflow**: every route computes docScrollW === clientW at all four widths; the chrome switches exactly at md (aside `hidden md:flex`, hamburger `md:hidden`); Dashboard stats stack 1-col @390 → 2-col @768+ — the responsive frame is CORRECT but NONE of it is pinned (see F-116) |
| V17 | NEW depth — the four-width battery (demo-seeded, with data) | the persisted ANALYZE probe (`width-sweep-demo-analyze.mjs`): the standalone build on :3421 with a fresh `db/demo.db` (`db:seed -- --demo`) | **ZERO overflow with data**: the ledger tables (Inventory 773px, Sales 723px, Cashiers 640px at 390) stay contained inside their `.vpx-scroll overflow-x-auto` containers — the neo-crm M-109c1 genus (a seeded row's min-content overflowing the phone frame) does NOT exist here — but the containment contract has NO guard anywhere |
| V18 | NEW depth — the containment structure + mutation proof | the persisted probe (`containment-mutation-proof.mjs`): the live DOM census + the injected regression (`overflow-x: visible` on `.vpx-scroll`) | **the pin design is evidence-backed**: the containment is DOUBLE (`glass-card overflow-hidden` clips + `.vpx-scroll overflow-x-auto` scrolls); a frame-level pin alone does NOT catch the inner break (the outer clip absorbs it — measured live); Chromium reports `scrollWidth > clientWidth` even for visible overflow (a scrollWidth probe cannot distinguish); the **FUNCTIONAL scroll probe** (`scrollLeft = 50` then read back) DOES catch it — under the mutation scrollLeft no-ops (`functionalScroll: false`, measured) — the honest pin is the functional one |
| V19 | vitest + playwright config review (the operator's ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (14 files / 149 tests), e2e = production standalone on :3100 + own `db/e2e.db` + desktop/mobile projects + storageState auth; this cycle ADDS a spec through them (the configs need no changes — V19's s19 posture re-confirmed) |
| V20 | `.env.example` verify (the operator's ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment — the working `.env` carries the generated 64-hex secret |

---

## 1. Findings

### The responsive drift-sweep tier (this cycle's NEW depth — the session_33 pointer)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-116** | **MEDIUM** (a protection gap, not a live defect — the code is currently correct; the risk is undetected regression) | `tests/e2e/**` (the missing spec) | **The four-width responsive frame has ZERO standing e2e protection.** The suite pins 390×844 (the mobile drawer spec, /POS-centered) and 1440×900 (the desktop specs) — the intermediate widths **768 and 1024 have no coverage at all**; the route-battery overflow contract exists for /POS@390 only (one test in mobile-navigation.spec); and the with-data ledger containment (the neo-crm M-109c1 genus — a seeded row's min-content overflowing the phone frame, invisible to the empty-store suite by construction) has no guard anywhere. The V16/V17 ANALYZE proves the frame currently correct at 8 routes × 4 widths, empty AND demo-seeded — and the reference itself ships the regression class (its own static 220px sidebar scrolls the 390px document to 1280px, V14). A Tailwind v4 utility edit (the `hidden md:flex` family — the exact trap class this repo documents) could silently break any intermediate width with nothing failing. Cure: the new `tests/e2e/viewport-drift-sweep.spec.ts` — the route-battery sweep at the four audit widths + the chrome-switch contract + the with-data functional-scroll containment guard (the V18 mutation-proven pin design). |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V10–V14): FOURTEENTH consecutive drift-free cycle. The
  reference is stable; the pin doctrine keeps proving it.
- **The clone's mobile navigation** (V15): the drawer superset is fully live on the dev
  server (all a11y pins + the 13/13 mobile e2e) — the operator's priority check passes with
  no Tailwind v4 regression.
- **The four-width frame itself** (V16/V17): zero overflow findings on the standing code —
  the defect class the sweep guards against does not currently exist. The finding is the
  missing TIER, not a broken surface (the F-116 classification).
- **The frame-level-only pin design** (V18, withdrawn pre-spec): a doc/main-overflow pin
  alone cannot catch the inner-container break (the outer `overflow-hidden` absorbs it —
  measured); the scrollWidth census cannot distinguish `overflow-x: auto` from `visible`
  (Chromium reports content width for both — measured). The functional scroll probe is the
  only honest observable — adopted in the GREEN design.
- **The received tree** (V3–V5): fully green at the Session-19 baselines.
- **The vitest/playwright configs** (V19): current and well-formed — no changes needed
  (the operator's "add test suites by modifying the respective config files" is satisfied by
  the standing configs + this cycle's spec addition through them).

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The production cure is ONE new spec file (no production code changes):**
   `tests/e2e/viewport-drift-sweep.spec.ts` (the chromium project — desktop 1440×900 base,
   `setViewportSize` per test, the neo-crm battery posture), **2 tests**:
   - **Test 1 — `no route overflows the four audit widths (the 390/768/1024/1440 battery)`:**
     for each width in [390, 768, 1024, 1440]: `setViewportSize`, then for each of the 8
     reference routes (`/POS /Dashboard /Inventory /Sales /Registers /Cashiers /Reports
     /StoreSettings`): `goto` (domcontentloaded) + a 600ms hydration settle, then the
     frame assertions — `document.documentElement.scrollWidth <= clientWidth` AND
     `main.scrollWidth <= clientWidth` (the doc-level + main-level pair, the neo-crm
     battery contract). Plus the chrome-switch assertions per width (on /POS, the first
     route): at 390 the hamburger is visible AND the sidebar (`[data-testid="app-sidebar"]`)
     is hidden; at 768/1024/1440 the sidebar is visible AND the hamburger is hidden —
     VISIBILITY assertions (`offsetParent`), never count (`hidden md:flex` elements stay in
     the DOM below md — the AGENTS law).
   - **Test 2 — `the with-data ledger stays contained and scrollable at 390 (the M-109c1
     guard)`:** self-provisioned data through the API (the s19 `provisionFixture` posture —
     a "Drift Sweep" category + a product; the serial one-worker suite owns its data),
     Inventory at 390×844, the settled wait (the product row visible — the s16
     bootstrap-race lesson): (a) `main.scrollWidth <= 390` (the frame contract); (b) the
     ledger container (`.vpx-scroll` filtered `has: table`) is a **FUNCTIONAL scroll
     region** — `scrollLeft = 50` then read back `> 0` (the V18 mutation-proven observable:
     under the injected `overflow-x: visible` regression the assignment no-ops); (c) the
     table keeps its min-width floor (`table.scrollWidth >= 760` — the `min-w-[760px]`
     contract: the table stays a table; the container does the containing, never the table
     shrinking).
2. **The TDD posture (the honest red for a protection gap):** the pins land FIRST and must
   PASS on the standing build — this cycle's defect class is the MISSING TIER, and the
   V18 mutation probe IS the red proof (the pin's observable provably fails under the
   injected regression: `functionalScroll: false` measured live; the frame pin catches the
   double-break class). No production code changes ride this cycle — a characterization
   spec over measured-correct behavior, with the mutation proof recorded as the
   regression-class evidence.
3. **The count lockstep (E2E 105 → 107, E2E_SPECS 7 → 8, desktop 91 → 93):** the
   docs-counts constants AND every live-tense doc site move in the SAME commit:
   `docs-counts.test.ts` (E2E/E2E_SPECS constants + the comment + the "Session-19 lock"
   literal → the **Session-20 lock** — this cycle re-anchors the count, the lock name moves
   with it + the desktop/mobile breakdown in the SKILL assertion), README (badge,
   scripts table, testing section), CLAUDE (the baseline + the drift-sweep line), PAD
   **v1.17 → v1.18** (header + Last Updated + every E2E site + the revision block), SKILL
   **v2.15.0 → v2.16.0** (version + the Session-20 addendum + header/commands/testing
   counts + the "91 desktop" breakdown site), AGENTS (the Session-20 contracts section).
   UNIT stays 149/14 (no new seams — the sweep is e2e-tier).
4. **Docs lockstep:** this plan, AGENTS.md (the four-width battery doctrine), CLAUDE.md
   (the baseline + the drift-sweep line), PAD v1.18, velox-pos_SKILL.md v2.16.0, README,
   the repo worklog's Session-20 entry, `docs/session_35.md` (the narration).
   `.env.example` re-verified (V20 — no changes needed).
5. **Evidence: screenshots 96–98** (the numbered record continues at 95): 96 the
   demo-seeded Inventory at 390×844 (the contained ledger — the with-data containment
   surface, the operator's superset priority), 97 the POS terminal at 768×1024-zone (the
   md chrome switch: the sidebar + the 380px cart rail), 98 the mobile drawer at 390×844
   (the operator's named priority surface) — captured from the running dev server via the
   committed self-provisioning `scripts/capture-s20-evidence.mjs` (the s19 family
   posture).

### The RED posture (the mutation proof, recorded)

- The V18 probe injected the regression class (`overflow-x: visible` on `.vpx-scroll`) and
  measured the failure: the functional scroll no-ops (`scrollLeft = 50` → reads 0). A pin
  asserting the functional scroll therefore FAILS under the regression — the red is proven
  by construction, on the live DOM, before the spec is written. The frame-level battery
  assertions additionally catch the double-break class (both containers broken → main/doc
  overflow) and any non-table frame regression at any of the four widths.

---

## 3. Execution order

1. This plan → validation against the codebase (the spec's insertion points, the
   docs-counts anchor list, the screenshot numbering 96–98).
2. **The spec lands** (`tests/e2e/viewport-drift-sweep.spec.ts`, 2 tests) → `bun run
   build` → run the spec against the standing artifact → **both tests PASS** (the
   characterization green; the red is the V18 mutation record).
3. **The count lockstep:** docs-counts.test.ts (E2E 107, E2E_SPECS 8, the Session-20
   lock literal, the desktop breakdown) + every doc site (README, CLAUDE, PAD v1.18,
   SKILL v2.16.0, AGENTS) in the SAME commit.
4. **The full gate on the final tree:** lint 0 · tsc · unit **149/149** (14 files) ·
   build · smoke 13/13 · e2e **107/107** (93 desktop + 13 mobile + 1 setup).
5. Screenshots 96–98 from the remediated dev server → `docs/screenshots/` (via the
   committed `scripts/capture-s20-evidence.mjs`).
6. Docs lockstep (§2.4) + the worklog's Session-20 entry + `docs/session_35.md` (the
   narration).
7. Commit (`test(session-20)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The audit pre-proved the design** (V16–V18): the four-width battery measured zero
  overflow at 8 routes × 4 widths on the empty AND demo-seeded stores; the mutation
  proof established the containment pin's observable (the functional scrollLeft
  read-back — the scrollWidth census and the frame-level pin both measured blind to
  the inner break). Zero checks weakened; zero production code touched.
- **The spec landed** (`tests/e2e/viewport-drift-sweep.spec.ts`, 2 tests) and the
  FIRST run caught a PROBE bug, not an app bug — the ledger-container lookup
  `.find(c => c.querySelector("table"))` picked `main` (which itself carries
  `.vpx-scroll` and contains every table) and the functional-scroll assertion failed
  falsely. Fixed with `table.closest(".vpx-scroll")` (the table's OWN wrapper) — the
  second run: **both tests PASS on the standing build** (the characterization green;
  the red is the V18 mutation record). The lesson is now in AGENTS + the SKILL
  addendum.
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E 105 → 107,
  E2E_SPECS 7 → 8, the "Session-19 lock" → "Session-20 lock" literal, the 93-desktop
  breakdown) + README (badge/scripts/testing) + CLAUDE (baseline + the drift-sweep
  law line) + PAD **v1.18** (header + Last Updated + scale line + file tree + the
  spec map + the revision block) + SKILL **v2.16.0** (version + last_updated + header
  baselines + commands + testing + the Session-20 addendum) + AGENTS (the Session-20
  contracts section). The lockstep gate caught ONE conflict mid-pass — the PAD's
  scoped negative `not.toContain("8 spec files")` was a retired-form ban from the
  7-spec era; with the tree legitimately back at 8 specs the ban moved to
  `"7 spec files"` (the gate doing exactly its job).
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) ·
  tsc clean · unit **149/149** (14 files — UNMOVED, the lockstep gate green with the
  re-anchored constants) · build green · smoke **13/13** · e2e **107/107** (2.9m —
  93 desktop + 13 mobile + 1 setup; the battery 29.2s, the with-data guard 0.9s).
- **Evidence: screenshots 96–98** captured from the remediated dev server via the
  committed self-provisioning `scripts/capture-s20-evidence.mjs` — 96 the with-data
  Inventory contained at 390 (main=390/390 + functionalScroll=true verified live
  during capture), 97 the POS md chrome switch at 768 (sidebar visible + the 380px
  cart rail + hamburger gone + doc=768 verified), 98 the mobile drawer at 390 (288px,
  8 links, zero overflow — the operator's priority surface). The STANDING protection
  lives in the e2e suite itself — the battery + the containment guard run on every
  `bun run test:e2e`.
- **`.env.example` verified** against the working `.env` (V20 — key-for-key aligned;
  the empty-string AUTH_SECRET placeholder contract).

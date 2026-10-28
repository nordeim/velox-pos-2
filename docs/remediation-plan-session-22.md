# VeloxPOS Remediation Plan — Session-22

**Date:** 2026-10-28 (Session-22 work cycle)
**Tree:** `126c45d` received (the Session-21 push `182fe3b` + the operator's session_38 raw-log
commit; a FRESH CLONE this cycle — the sandbox workspace was reset, so the refresh was
`git clone https://github.com/nordeim/velox-pos-2.git` and the documented rebuild ran: `.env`
regenerated with a fresh 64-hex `AUTH_SECRET`, `bun install`, `db:push` + `db:seed`,
chromium-1243 installed). **Scope:** the standing audit→remediate→push cycle — a full
received-tree gate re-verification, the SIXTEENTH consecutive live reference re-measurement at
every previously-pinned depth (**all standing pins hold; the reference's mobile defect is
STABLE at its Session-21 D-1 shape**), the clone-side mobile-navigation re-verification (the
operator's named priority — the drawer superset probed live on the dev server at 390×844), and
this cycle's NEW depth — **the with-data Reports walk (the session_37 "Next" pointer: "a
with-data walk of the remaining Reports periods", named exactly)** — plus the static sweep
(zero-importer file/dependency censuses, secrets, credential, the Session-21 code review).
**Method:** skills/web-application (§14 testing tiers, §15 the gate doctrine), skills/agent-browser
(computed styles are ground truth), skills/tdd + skills/principle-test-behavior-not-implementation
(the pins assert observable DOM values derived from the API's own data — never class strings),
the count-lockstep doctrine (docs-counts gate — this cycle's counts MOVE: E2E **107 → 109**,
E2E_SPECS **8 → 9**, desktop **93 → 95**; UNIT stays **151/15**).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git clone` (the sandbox was reset — no prior workspace survived); `main` @ `126c45d`, clean tree | fresh tree @ `126c45d` |
| V2 | Environment contract (the documented rebuild) | `.env` regenerated: `DATABASE_URL="file:../db/custom.db"` (byte-exact) + a fresh 64-hex `AUTH_SECRET` (openssl) · `bun install` (472 packages) · `bun run db:push` + `db:seed` (owner ready, counts 0) · bun 1.3.14 · agent-browser 0.39.4 · Playwright chromium-1243 installed (the cache carried only 1200) | environment ready — the `.env`/`db/` contract the operator asks for is in place |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-21 lock holds |
| V4 | Standalone build + smoke | `bun run build` → `bun run smoke` | build green (full route table) · smoke **13/13** (incl. artifact hygiene + the no-secret boot refusal) |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **107/107** (2.9m — 93 desktop + 13 mobile + 1 setup); the mobile drawer suite + the Session-20/21 drift-sweep battery green on arrival |
| V6 | Zero-importer census — FILES + DEPENDENCIES | the recreated sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo — the sandbox reset took the persisted copy) | **ZERO dead files** (140 scanned); deps: only the known entries (`prisma` the CLI, `react-dom` the implicit Next entry, `z-ai-web-dev-sdk` the evidence-script family) |
| V7 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (the recreated `check-owner-credential.mjs`, run under **bun** — it imports `bun:sqlite`; the first draft's 4-part hash-shape assumption was WRONG, corrected to the repo's 3-part `scrypt$salt$key` shape) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V8 | Secrets scan | `git grep` for 40+ hex runs across the tracked tree | clean — the hits are test fixtures (the suite's throwaway AUTH_SECRET constants, fake reset tokens, bun.lock hashes); no live secrets |
| V9 | Session-21 code review (Mode C) | `git diff e9513d7..HEAD` (the `182fe3b` + `126c45d` commits) | the Session-21 commit touched exactly what the plan said: the surgical `loadCore` fix (settings-only, the F-118 race cure with its why-comment), the restructured drift-sweep walk, the new `store.test.ts`, the count-lockstep, the docs, the evidence script + screenshots 99–101; the session_38 commit is the operator's raw log only — **ZERO unplanned production code** |
| V10 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900, `set viewport` after open — the flag does not apply) | **HOLDS (16th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px/16px |
| V11 | Live drift — the F-76 error alert | wrong-credentials submit (`main [role=alert]` scoping) | **HOLDS byte-exact**: "Invalid email or password" · 16px pad · red-50/0.7 (rgba(254,242,242,0.7)) · 1px red-200 (rgb(254,202,202)) · 12px radius |
| V12 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · z-50 · 8 links (Terminal…Settings) |
| V13 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: the date line "Wednesday, October 28, 2026" 14px slate-500 rgb(100,116,139); both chart h3s 16px/700 ("Sales — Last 7 days" / "Products by Category"); "Historial de Ventas" + the byte-exact search placeholder + the 7 ledger headers; "Cajeros" h1 24px/700 + "Turnos Recientes" as H3 |
| V14 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS + /Dashboard + /Inventory + /Sales + /Registers | **STABLE at the D-1 shape (no NEW drift)**: no hamburger, the static 220px sidebar, the document contained at exactly 390 on every route with **main squeezed to 170px** (its own `overflow-x: auto`). The Session-21 D-1 record still describes the current reference exactly. Screenshot refreshed: `docs/screenshots/ref-mobile-pos-390-s22.png` |
| V15 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog + "Navigation menu", 288px (w-72), glass-dark rgba(13,15,26,0.95), 8 labeled links · focus → Close on open · body scroll-lock while open · Escape closes + restores the hamburger's focus + releases the lock · drawer navigation auto-closes (unmounts, verified via /Dashboard) · zero horizontal overflow at 390 — plus the 13/13 mobile e2e (V5). NO Tailwind v4 regression (the plain-CSS glass-* doctrine, `@theme inline`, the `@custom-variant hover` unwrap all hold) |
| V16 | NEW depth — the reference's Reports surface (the parity side) | agent-browser on the reference's /Reports (1440×900, fresh login — the prior session expired) | **the reference is EMPTY** ($0.00 stats, 2× "No data for this period", no method rows, its pills carry no aria-pressed — the clone's pressed-state is the documented a11y superset). The with-data Reports shape is **UNMEASURABLE on the reference** (its demo account is write-restricted — the same posture as the receipt PDF/email shape, recorded session_37). The with-data tier is therefore a functional-SUPERSET addition, grounded in the reference's own empty-state DOM structure — exactly the s20/s21 with-data lineage |
| V17 | NEW depth — the clone's with-data Reports ANALYZE | the dev server + the API-provisioned chain (category "Reports Walk" → product "Reports Walk Coffee" $3.25 → register → active shift → a CASH sale 2×$3.25 + a CARD sale 1×$3.25); agent-browser probes at 1440 + 390 | **ZERO live defects — the surfaces measure CORRECT with data**: stats "$9.75 / 2 / $4.88" (exactly the API-derived values) · BOTH method tables render (cash $6.50 the 67% emerald bar first, card $3.25 the 33% violet bar — revenue-desc) · the chart's y-ticks $0..$10 with the top **$10 ≥ the $9.75 data** (the F-107 domain-covers-data contract, live) · at 390: doc/main 390/390, the chart 316px right 353 (contained), the bars 212/104px. The gap is the MISSING protection (F-119) |
| V18 | vitest + playwright config review (the operator's standing ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (15 files / 151 tests), e2e = production standalone on :3100 + a FRESH scratch `db/e2e.db` per run (the global-setup deletes + re-provisions before boot — every sale in the run is created TODAY, so every period window deterministically includes them) + desktop/mobile projects + storageState auth. This cycle EXTENDS a spec through them (the new file is picked up by the testDir glob — the configs need no changes) |
| V19 | `.env.example` verify (the operator's standing ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment; the working `.env` carries the freshly generated 64-hex secret |

---

## 1. Findings

### F-119 — the Reports surface has no with-data e2e tier (this cycle's NEW depth)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-119** | **MEDIUM** (a protection gap, not a live defect — the code is currently correct; the risk is undetected regression) | `tests/e2e/` (no with-data Reports spec exists; surfaces.spec.ts pins the EMPTY state only) | **The Reports surface — the only view whose entire value is COMPUTED from the sales ledger — has no with-data protection anywhere.** The standing pins are all empty-state: "Reports renders the reference copy, period pills, and empty states" asserts "$0.00"-era stats, "No data for this period", and the pill mechanics; the s20 drift-sweep battery covers /Reports at all four widths EMPTY only. The with-data tier is where the real wiring lives — `summarize`/`dailySeries`/`byMethod` are unit-pinned as PURE seams, but the CHAIN (the API's sales list → the store's collection → the memoized values → the DOM testids) is e2e-invisible: a store-wiring regression of the exact F-118 genus (a second writer clobbering the `sales` collection), a lost `data-testid`, a MethodTable that stops rendering when data exists, a chart domain that stops covering its data (the F-107 class), or a with-data containment break at 390 would ALL pass the entire suite today. The V17 ANALYZE proves the surface currently correct with data (stats exactly the API-derived values; both method tables + share bars; the top tick ≥ the data) — the finding is the missing tier, the session_37 "Next" pointer named exactly. The reference itself cannot produce this state (V16 — write-gated), so the tier is a superset addition (the s20/s21 posture). Cure: the with-data Reports walk. |

### F-120 — the drift-sweep walk's sale fixture never materialized (found BY this cycle's ANALYZE)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-120** | **MEDIUM** (a latent e2e defect — the Sales leg's settled wait was vacuous; found live by the V17 ANALYZE's first POST attempt, which 400'd on the same payload shape) | `tests/e2e/viewport-drift-sweep.spec.ts` (the three-ledger walk's sale POST) + `scripts/capture-s21-evidence.mjs` (the same payload) | **The Session-21 walk's fixture sale POST silently 400'd — its payload carried the PRE-contract `items: [{ productId, quantity }]` shape instead of the `saleCreateSchema` line contract (`name`/`price`/`qty`/`taxRate`), so `sale.ticket` was always `undefined` and the Sales leg's settled wait (`filter({ hasText: undefined })` — no filter applied) matched ANY row: terminal.spec's sale when it ran first, the empty-state td row on a colder db. Verified against the post-run `db/e2e.db`: the "Drift Sweep" customer had ZERO sales while the walk passed 107/107 twice. The walk's containment probes still measured a real row this run (terminal.spec's sale existed), but the walk's DATA-OWNERSHIP claim ("the sale → Sales") was false, and on a db without prior sales the Sales leg would pass against the EMPTY-STATE row — the leg was not actually pinning "with-data". The same broken payload sat in the committed s21 evidence script (its capture 99 showed whatever sales the dev db already carried). Cure: the contract-correct payload + `expect(resp.ok())` on every provisioning POST (a silent 400 makes every downstream wait vacuous) in BOTH files, the same assertion added to this cycle's s22 provisioning, and the lesson written into AGENTS. |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V10–V13): SIXTEENTH cycle, all byte-exact. The reference is
  stable on every previously-pinned surface.
- **The reference's mobile defect** (V14): STABLE at the Session-21 D-1 shape (no hamburger, the
  220px static sidebar, main crushed to 170px, the document contained at 390) — no NEW drift; the
  D-1 doc record from Session-21 still describes it exactly. The clone's drawer superset remains
  strictly better.
- **The clone's mobile navigation** (V15): fully live on the dev server (all a11y pins + the 13/13
  mobile e2e) — the operator's priority check passes with no Tailwind v4 regression.
- **The clone's with-data Reports surface itself** (V17): zero live findings — the stats compute
  exactly, both method tables render with correct shares, the chart domain covers the data, the
  surface contains at 390. The finding is the missing TIER, not a broken surface (the F-116/F-117
  classification, the third cycle of the same posture).
- **The reference's pills carry no `aria-pressed`** (V16): the clone's pressed-state toggle is the
  documented a11y-superset posture (surfaces.spec pins it) — not a parity bug to "fix".
- **The received tree** (V3–V5): fully green at the Session-21 baselines.
- **The vitest/playwright configs** (V18): current and well-formed — no changes needed (the
  operator's standing "add test suites by modifying the respective config files" is satisfied by
  the standing configs + this cycle's spec extension THROUGH them, the V18-of-Session-21 doctrine).
- **The first credential-checker draft** (V7): my 4-part hash-shape assumption was wrong — the
  repo's shape is the 3-part `scrypt$salt$key` (16-byte salt, 64-byte key). Corrected and verified;
  recorded so the next sweep script starts from the right shape.
- **The F-120 fix does not move the counts**: the drift-sweep walk restructures its provisioning
  (same 2 tests), the s22 spec keeps its 2 — E2E stays 109, SPECS 9, desktop 95.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The cure is ONE new spec (no production code changes):**
   `tests/e2e/reports-walk.spec.ts` — the with-data Reports walk, 2 tests, following the
   drift-sweep family posture:
   - **The provisioning chain** (idempotent, self-owned, names unique to this spec — the serial
     one-worker suite): the "Reports Walk" category → the "Reports Walk Coffee" product ($3.25,
     barcode `RWALK-390`) → the "Reports Walk Register" register → an active shift → TWO sales
     (a CASH sale 2×$3.25 with `amountPaid`, a CARD sale 1×$3.25 without — the card contract
     takes no amountPaid) → **self-clean: the shift CLOSES** (countedCash = float + cash
     revenue; exact variance) before the walks (the terminal.spec/drift-sweep law — an ACTIVE
     shift leaks into the downstream POS gates).
   - **Test 1 — "the Reports stats compute from the ledger with data (the exact wiring pin)"**
     (desktop 1440): goto /Reports, settle on `stat-total-revenue` visible AND the
     `revenue-by-method` list rendered; fetch `/api/sales` via `page.request`, derive the
     expected values IN THE TEST (filter `status === "completed"`; revenue = round2 sum;
     transactions = count; avg = round2(revenue/count); per-method revenue/count/share;
     format via the same `Intl.NumberFormat("en-US", currency)` contract); then assert the
     DOM equals the derivation EXACTLY: the three stat testids, BOTH method tables
     (`revenue-by-method` with the share spans, `breakdown-by-method` without), each row's
     method name + count + revenue + share, the share bars' widths > 0, and the chart's
     topmost y-tick ≥ the today-bucket revenue (the F-107 domain-covers-data contract, live).
     Then click the "7 days" pill → aria-pressed true AND the stats UNCHANGED (every sale in
     the fresh run-db is today — the period switch must not lose data).
   - **Test 2 — "the with-data Reports surface stays contained at 390"** (the s20/s21 lineage
     extension): viewport 390×844, goto /Reports, settle on the stats + method lists; assert
     doc/main `scrollWidth ≤ 390`, the chart's bounding box right ≤ 390, the method bars
     render with width > 0, and the stats still compute (the exact-value re-assert at the
     mobile width).
2. **The TDD posture (the honest red for a protection gap):** the pins land FIRST and must PASS
   on the standing build — the defect class is the MISSING protection (the F-116/F-117
   characterization posture, now the AGENTS law). The red proof for an exact-text-equality pin is
   by construction (any divergence — the F-118-genus store clobber, a lost testid, a broken
   MethodTable render — flips the equality); the chart-domain pin's discriminative power is the
   Session-15 F-107 record itself (the pre-fix `niceTicks` top sat BELOW the data peak — the live
   bug this observable caught once already). No production code changes ride this cycle.
3. **The count-lockstep ride (SAME commit):** E2E **107 → 109**, E2E_SPECS **8 → 9**, desktop
   **93 → 95**; UNIT stays 151/15. Sites: `tests/unit/docs-counts.test.ts` (the constants + the
   "Session-21 lock" → "Session-22 lock" literal + the "(93 desktop…)" breakdown literal),
   README (badge, the scripts row, the testing section), CLAUDE (the baseline), AGENTS (the
   Session-22 contracts section — the with-data Reports law), PAD **v1.19 → v1.20** (the scale
   line, the file tree's spec count, the testing chapter's e2e block, the spec map, the Session-22
   revision block), SKILL **v2.17.0 → v2.18.0** (the header baselines, the commands, the live
   testing section, the Session-22 addendum). History blocks (the SKILL's session addenda, the
   PAD revision blocks, the worklog, the session logs) keep their historical numbers by design.
4. **Evidence: screenshots 102–104** (the numbered record continues at 101): 102 the with-data
   Reports desktop (the stats + both method tables + the chart with data), 103 the with-data
   Reports contained at 390, 104 the mobile drawer at 390 (the operator's priority surface) —
   captured from the remediated dev server via a committed self-provisioning
   `scripts/capture-s22-evidence.mjs` (the s19/s20/s21 family posture).
5. **The three standing with-data harnesses** (`capture-s16/s17/s18-evidence.mjs`) run on the
   final tree — the cycle doctrine (run all when a with-data protection changes). The s18 harness
   itself covers Reports/Inventory with data — the closest existing cousin of this cycle's tier.

### The RED posture (recorded)

- The exact-equality pin's red is by construction: the pin asserts the DOM renders values
  DERIVED FROM THE API'S OWN RESPONSE — any link in the chain (API → store → memo → DOM) that
  breaks flips the equality (the F-118 store-clobber class renders "$0.00" against the derived
  "$9.75"). The V17 ANALYZE measured the chain live end-to-end — the derivation mirrors
  `summarize`/`byMethod` exactly (round2, revenue-desc, share = method/total), and the measured
  DOM matched on every axis (the $9.75/2/$4.88 stats, the 67%/33% bars, the $10 top tick).
- The chart-domain pin's red is the Session-15 F-107 record: the pre-fix domain top
  (the largest nice multiple ≤ max) sat BELOW the data peak — `$8` against a `$9.75` peak —
  exactly the divergence the ≥ assertion catches.

---

## 3. Execution order

1. This plan → validation against the codebase (the sale-item contract's `name`+`price`+`qty`
   fields — the ANALYZE's first POST attempt failed on the missing `name`, corrected live; the
   card contract takes no `amountPaid`; the docs-counts constants; the screenshot numbering
   102–104; the AGENTS/PAD/SKILL live-site anchor list).
2. **The spec lands** (`tests/e2e/reports-walk.spec.ts`, 2 tests) → `bun run build` → run the
   new spec against the standing artifact → **both tests PASS** (the characterization green;
   the red is the construction + F-107 record).
3. **The count-lockstep ride** (constants + every live doc site, SAME commit) →
   `bun run test` green (the gate re-anchored).
4. **The full gate on the final tree:** lint 0 · tsc · unit **151/151** (15 files — UNMOVED) ·
   build · smoke 13/13 · e2e **109/109** (95 desktop + 13 mobile + 1 setup) — plus a second
   consecutive full run (the race-cure verification posture).
5. **The three with-data evidence harnesses** (s16 13/13 · s17 19/19 · s18 20/20) on the final
   tree.
6. Screenshots 102–104 from the remediated dev server → `docs/screenshots/` (via the committed
   `scripts/capture-s22-evidence.mjs`).
7. Docs lockstep (§2.3) + the worklog's Session-22 entry + `docs/session_39.md` (the narration —
   the numbering convention: session_37 was the Session-21 cycle's narration, session_38 the
   operator's raw log, so this cycle narrates as session_39).
8. Commit (`test(session-22)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The ANALYZE pre-proved the F-119 design** (V17): the with-data surface measured CORRECT at
  1440 and 390 (stats exactly the API-derived $9.75/2/$4.88; both method tables; topTick $10 ≥
  the $9.75 data; contained at 390 with the bars at 212/104px). Zero checks weakened.
- **The spec's first run failed on a TEST-WIRING bug** (not production): the method-name span
  CONTAINS the count span as a child, so `span.capitalize`'s textContent is the composite
  "cash(1)" — the name-alone assertion failed; fixed to pin the composite (the first run's
  lesson, now in AGENTS).
- **The ANALYZE's own first POST attempt exposed F-120**: the V17 provisioning script's sale
  POST 400'd on `items.0.name` — and the SAME pre-contract `quantity` payload shape sat in the
  standing drift-sweep walk and the s21 evidence script. Forensics against the post-run
  `db/e2e.db`: ZERO "Drift Sweep" sales while the walk passed 107/107 twice — `sale.ticket`
  was undefined, `filter({ hasText: undefined })` applied no filter, and the Sales leg matched
  terminal.spec's sale. **The cure**: the contract-correct line payload
  (`name`/`price`/`qty`/`taxRate`) + `expect(resp.ok())` on every provisioning POST in the
  walk, the s21 script, AND this cycle's s22 provisioning; the walk re-run green with the
  fixture sale VERIFIED in the db (T-000001, $5.00, customer "Drift Sweep"); the s21 script
  re-run green with captures 99–101 refreshed (capture 99 now genuinely shows the fixture's
  ticket row — the repaired script's captures stay in this cycle's commit).
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E 109, E2E_SPECS 9,
  the "Session-21 lock" → "Session-22 lock" literal, the "93 → 95 desktop" breakdown) + README
  (badge/scripts/testing) + CLAUDE (baseline + the persistence-ordering law) + AGENTS (the
  Session-22 with-data contracts + the F-120 POST-assertion law) + PAD **v1.20** (scale line +
  file tree + testing chapter + spec map + the revision block) + SKILL **v2.18.0** (version +
  header baselines + commands + testing + the Session-22 addendum). UNIT stays 151/15.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc clean ·
  unit **151/151** (15 files) · build green · smoke **13/13** · e2e **109/109 × 2 consecutive
  full runs** (95 desktop + 13 mobile + 1 setup) · the three with-data harnesses **s16 13/13 ·
  s17 19/19 · s18 20/20** (the older harness captures restored — only this cycle's changed
  captures commit).
- **Evidence: screenshots 102–104** captured from the remediated dev server via the committed
  `scripts/capture-s22-evidence.mjs` — 102 the with-data Reports desktop (stats + both method
  tables + the chart with data; the derivation verified live against the warm db's THREE sales
  from two different fixtures — $14.75/3, the runtime-derivation design proving itself), 103
  the with-data Reports contained at 390 (chart right 353, both bars), 104 the mobile drawer at
  390 (288px, 8 links, zero overflow — the operator's priority surface). Plus the D-1-shape
  reference capture (`ref-mobile-pos-390-s22.png`) and the refreshed 99–101 (the F-120 repair).
- **`.env.example` verified** against the working `.env` (V19 — key-for-key aligned; the working
  `.env` carries the freshly generated 64-hex AUTH_SECRET).

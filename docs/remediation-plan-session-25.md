# VeloxPOS Remediation Plan — Session-25

**Date:** 2026-10-28 (Session-25 work cycle)
**Tree:** `35a13a6` received (the Session-24 push `0276d83` + the operator's session_44 raw-log
commit; a FRESH CLONE this cycle — the sandbox workspace was reset, so the documented rebuild
ran: `.env` regenerated with a fresh 64-hex `AUTH_SECRET`, `bun install`, `db:push` +
`db:seed`, chromium-1243 installed). **Scope:** the standing audit→remediate→push cycle —
the received-tree fast gate, the NINETEENTH consecutive live reference re-measurement at
every previously-pinned depth (**all standing pins hold; the reference's mobile defect is
STABLE at its Session-21 D-1 shape**), the clone-side mobile-navigation re-verification (the
operator's named priority — the drawer superset probed live on the dev server at 390×844),
and this cycle's NEW depth — **the fiscal receipt round-trip e2e walk** (the session_43
"Next" pointer's first candidate: "a with-data walk of the StoreSettings save→toast loop")
— plus the static sweep (zero-importer census, secrets, credential, the Session-24 code
review). **Method:** skills/web-application (§14 testing tiers, §15 the gate doctrine),
skills/agent-browser (computed styles are ground truth), skills/tdd +
skills/principle-test-behavior-not-implementation (the pins assert observable DOM values,
API state, and rendered receipt content — never class strings), the count-lockstep doctrine
(docs-counts gate — this cycle's counts MOVE: E2E **113 → 115**, E2E_SPECS **11 → 12**,
desktop **99 → 101**; UNIT stays **151/15**).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the sandbox was RESET — the workspace, the persisted sweep scripts, and the bin/ssh shim all gone) | tree @ `35a13a6`, clean, main-only |
| V2 | The documented rebuild (fresh clone) | `.env` regenerated (`DATABASE_URL="file:../db/custom.db"` byte-exact + a fresh 64-hex `AUTH_SECRET`) · `bun install` (472 packages) · `db:push` + `db:seed` (owner + settings, 0 products) · `bunx playwright install chromium` (chromium-1243 + headless-shell cached) | environment ready — the `.env`/`db/` contract the operator asks for is in place |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-24 lock holds |
| V4 | Zero-importer census — FILES + DEPENDENCIES | the sweep script RECREATED after the reset (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo; one regex fix during recreation — the original missed the `from "..."` import form, the recreation's first draft flagged 25 false-positive dead files before the `from`-form + Next.js-convention entries were restored) | **ZERO dead files** (146 scanned, +2 from Session-24's spec + evidence script); deps: only the known entries (`react-dom` the implicit Next entry, `z-ai-web-dev-sdk` the evidence-script family) |
| V5 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify (`check-owner-credential.mjs`, recreated after the reset under bun; one fix during recreation — the salt must be DECODED from hex (`Buffer.from(salt, "hex")`), mirroring `verifyPassword` exactly; the hex-string-as-salt draft failed against the FRESHLY seeded db) | **the documented `$Abcd1234` VERIFIES** against the fresh `db/custom.db` |
| V6 | Secrets scan | ripgrep for key/secret patterns across `src/ scripts/ tests/ prisma/` | clean — no live secrets (the known fixture constants aside: the demo credential in seed/evidence scripts + the documented e2e-boot 64-hex `AUTH_SECRET` in playwright.config.ts and the capture-script family) |
| V7 | Session-24 code review (Mode C) | `git show 0276d83 --stat` + `git show 35a13a6 --stat` | the Session-24 commit touched exactly what its plan said: the new `with-data-inventory-csv.spec.ts` (245 lines), the s24 evidence script (168), screenshots 108–110 + the ref capture, the docs-counts re-anchor, and the docs (AGENTS/CLAUDE/PAD/README/SKILL/plan/session_43/worklog) — **ZERO production code** (`src/` untouched); the session_44 commit is the operator's raw log only |
| V8 | Live drift — the login card | agent-browser computed styles on `/login` (1440×900) | **HOLDS (19th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 "Welcome to VeloxPOS (Point Of Sale)" · inputs 48px/12px · SSO 54px/16px |
| V9 | Live drift — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · rgba(254,242,242,0.7) · 12px radius |
| V10 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · 8 links · doc 1440 = client 1440 (no overflow) |
| V11 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers (1440×900) | **HOLDS**: the date line "Wednesday, October 28, 2026"; both chart h3s 16px/700 ("Sales — Last 7 days" / "Products by Category"); "Historial de Ventas" h1; "Cajeros" h1 + "Turnos Recientes" as H3 |
| V12 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS | **STABLE at the D-1 shape (no NEW drift)**: no hamburger, the static 220px sidebar, main squeezed to 170px, the document contained at exactly 390. The Session-21 D-1 record still describes the reference exactly. Screenshot refreshed: `docs/screenshots/ref-mobile-pos-390-s25.png` |
| V13 | Live drift — the reference's Reports surface | /Reports at 1440×900 (sessioned) | **STILL EMPTY**: 2× "No data for this period", the 4 pills (7/14/30/90 days) — the demo account remains write-restricted; the with-data tiers stay a functional-SUPERSET addition (the s20..s24 lineage) |
| V14 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey (REAL clicks throughout — the Session-24 V14 law) | **ALL SUPERSET pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog, 288px (w-72), 8 labeled links · `animation-name: enter` (tw-animate-css) · focus → Close on open · body scroll-lock while open · Escape closes + restores the hamburger's focus + releases the lock · drawer navigation unmounts (verified via /Reports) · zero horizontal overflow at 390. NO Tailwind v4 regression (the plain-CSS glass-* doctrine, `@theme inline`, the `@custom-variant hover` unwrap all hold). Dev-log note: the fresh dev boot logs the documented `instrumentation.ts` Edge-Runtime `process.exit` warning (pre-existing, production boot-guard only — the page compiles and serves 200) |
| V15 | The session_43 "Next" candidates — disposition | analysis against the standing suite | **The fiscal receipt round-trip is THIS cycle's depth** (the session_43 pointer's "StoreSettings save→toast" candidate, taken to its deepest unpinned chain — see F-123). The receipt's PDF/email shape remains a FUTURE candidate (a pure-superset feature build — new production code, unmeasurable on the write-gated reference, deferred by design). The Registers shift-lifecycle dialogs were weighed and found ALREADY PINNED (registers-shifts.spec's five tests cover the open/close/variance/delete journeys through the real dialogs) |
| V16 | NEW depth — the fiscal receipt round-trip ANALYZE | the dev server + agent-browser: the settings leg (flip + fill + save + toast + API verify), the receipt leg (a full UI checkout with the fiscal settings live, then the polarity state), the restore | **ZERO live defects — every leg of the chain measures CORRECT live**: SETTINGS — the switch flip (checked false→true, the label "Hidden on receipt" ⇄ "Visible on receipt"), the Tax ID / EIN fill, Save Changes → the "Settings saved" toast → the API persists `hideFiscalOnReceipt: false` + the RUC, the UI survives reload; RECEIPT VISIBLE — a full UI checkout (open shift 100 → add product → CHARGE → cash 5) → the receipt renders the fiscal line with the exact RUC text; RECEIPT HIDDEN (the polarity state) — toggle OFF with the RUC STILL SET → the second checkout's receipt does NOT render the line (the `!hideFiscalOnReceipt` guard proven, not just empty-field absence); RESTORE — the settings return to seed defaults. The gap is the MISSING protection (F-123) |
| V17 | vitest + playwright config review (the operator's standing ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (15 files / 151 tests), e2e = production standalone on :3100 + a FRESH scratch `db/e2e.db` per run (global-setup deletes + re-provisions BEFORE boot) + desktop/mobile projects + storageState auth + `workers: 1` (serial). This cycle EXTENDS a spec through them (the new file is picked up by the testDir glob — the configs need no changes) |
| V18 | `.env.example` verify (the operator's standing ask) | key-for-key diff against the working `.env` | aligned: `DATABASE_URL="file:../db/custom.db"` · `NEXT_PUBLIC_SITE_URL` · `AUTH_SECRET=""` (the empty-string placeholder contract) + the COOKIE_SECURE comment; the working `.env` carries its 64-hex secret |
| V19 | Spec-ordering + state-isolation analysis for the new file | alphabetical census of `tests/e2e/` vs every settings/sale-sensitive pin | `with-data-fiscal-receipt-walk.spec.ts` sorts AFTER `with-data-dashboard-walk.spec.ts` (d < f) and BEFORE `with-data-inventory-csv.spec.ts` (f < i) and `with-data-reports-walk.spec.ts` (f < r): surfaces.spec's settings pins (the default toggle state, the basic save loop, the listboxes — s < w) and terminal.spec's receipt pins (t < w) run BEFORE it exists; the CSV walk derives product counts from the API (robust to the fiscal walk's product + sales); the reports walk derives everything from the SALES API at runtime (no hardcoded tickets — verified); the drift-sweep ran before (v < w); the mobile project carries no settings/receipt pins. The walk SELF-CLEANS: both shifts CLOSED, the settings RESTORED to seed defaults (toggle hidden + RUC empty) — and even a mid-test failure leaves a safe state for the remaining specs (the CSV/reports walks are settings-independent by construction, verified) |

---

## 1. Findings

### F-123 — the fiscal receipt round-trip has no e2e protection (this cycle's NEW depth)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-123** | **MEDIUM** (a protection gap, not a live defect — the V16 ANALYZE proves every leg of the chain currently correct live; the risk is undetected regression) | `tests/e2e/` (no fiscal spec exists; surfaces.spec pins the toggle's DEFAULT state + static labels + the basic store-name save; terminal.spec pins the receipt's ticket/timestamp/footer/print-path but never the fiscal conditional) | **The fiscal receipt round-trip — the deepest functional chain on the StoreSettings surface — has ZERO e2e protection.** The chain: the fiscal Switch flip (the INVERTED wiring: `checked={!form.hideFiscalOnReceipt}`, switch ON = "Visible on receipt") → the Tax ID / EIN fill → Save Changes → the PATCH payload carrying `hideFiscalOnReceipt` + `fiscalRuc`/`fiscalBusinessType` → `setSettings(row)` (the store refresh) → the "Settings saved" toast → the TERMINAL CHECKOUT → the receipt's fiscal conditional `!settings?.hideFiscalOnReceipt && (settings?.fiscalRuc \|\| settings?.taxId)` rendering the dashed-border RUC line (with the business-type suffix). A polarity flip in the conditional, a lost `fiscalRuc` in the save payload, a broken `setSettings` refresh, or the receipt's fiscal `<p>` stopping rendering would ALL pass the entire suite today — the surfaces.spec settings test pins only the DEFAULT (hidden) state and the store-name save; nothing anywhere pins the receipt's fiscal line in EITHER render state. The reference cannot produce this state (write-gated; its fiscal toggle is an icon-button with NO switch semantics — the clone's labeled Radix Switch is the documented a11y superset), so the tier is superset protection. Cure: the fiscal receipt round-trip walk (§2). |

**The session_43 "Next" candidates — disposition:** the fiscal receipt round-trip is THIS
cycle's depth (landed — the "StoreSettings save→toast" pointer taken to its deepest
unpinned chain). The receipt's PDF/email shape remains a FUTURE candidate (deferred by
design). The Registers shift-lifecycle dialogs were weighed and found ALREADY PINNED
(V15).

---

## 2. The cure — `tests/e2e/with-data-fiscal-receipt-walk.spec.ts` (2 tests)

The F-119/F-121/F-122 pattern applied to the fiscal surface, with the round-trip's own shape.

### 2.1 The fixture (self-contained, idempotent, self-cleaning)

One chain provisioned through the API (every POST asserting `resp.ok()` — the F-120 law):
category "Fiscal Walk" → product "Fiscal Walk Coffee" $3.25 (barcode `FWALK-390`, stock
10 / minStock 2 — an "ok" stock status) → register "Fiscal Walk Register" (openingFloat
100). The register card is locatable by the standing `register-<name>` testid
(registers-shifts.spec's pattern). The settings mutations are the WALK's own: every test
ends with the settings RESTORED to seed defaults (toggle hidden + RUC empty) — the
self-clean law.

### 2.2 Test 1 — the VISIBLE state (the settings flip → save → store refresh → the receipt renders the fiscal line)

- `/StoreSettings`: the Switch (`aria-label="Show fiscal data on receipt"`) flips → the
  label swaps to "Visible on receipt" (the inverted wiring live) → fill "Tax ID / EIN"
  with `FWALK-RUC-001` and "Tax Regime" with `S-Corp Test` → Save Changes → the "Settings
  saved" toast.
- **API verify (state, not just UI)**: `GET /api/store-settings` → `hideFiscalOnReceipt:
  false` + `fiscalRuc: "FWALK-RUC-001"` persisted.
- The checkout journey through the REAL UI (terminal.spec's proven locators): `/Registers`
  → the register card's "Open shift" → the float 100 → `/POS` → "Add Fiscal Walk Coffee
  to cart" → CHARGE ("Charge $3.25") → "Amount received" 5 → Complete cash sale.
- **The receipt pin**: the fiscal line renders with the EXACT template text
  `FWALK-RUC-001 · S-Corp Test` (the RUC + the business-type suffix — the template, not
  just presence), inside the `.receipt-print` wrapper.
- Self-clean: close the receipt → the register's "Close shift" → counted 103.25 (the
  float + the cash sale — an exact variance).

### 2.3 Test 2 — the HIDDEN polarity + the full restore

- With the RUC still set (the strongest hidden condition): flip the Switch OFF → the
  label "Hidden on receipt" → Save → toast → **API verify**: `hideFiscalOnReceipt: true`
  AND `fiscalRuc` STILL persisted (the polarity state — the field exists but is gated).
- The second checkout journey (open shift → add → charge → complete).
- **The polarity pin**: the receipt does NOT render the fiscal line (the
  `!hideFiscalOnReceipt` guard — proving the polarity, not just empty-field absence).
- Self-clean ×2: close the receipt → close the shift (103.25) → the FULL restore (clear
  the RUC + Save) → **API verify the seed defaults** (`hideFiscalOnReceipt: true`,
  `fiscalRuc: ""`) — the law for every downstream spec.

### 2.4 Ordering + counts

The file name sorts after `with-data-dashboard-walk.spec.ts` and before
`with-data-inventory-csv.spec.ts` / `with-data-reports-walk.spec.ts` (d < f < i < r) —
V19's isolation analysis. E2E **113 → 115**, E2E_SPECS **11 → 12**, desktop **99 → 101**
(UNIT stays 151/15) — the count-lockstep constants AND every live-tense doc site ride in
the SAME commit (the docs-counts gate re-anchored).

---

## 3. Execution order

1. The spec lands (`tests/e2e/with-data-fiscal-receipt-walk.spec.ts`, 2 tests) →
   `bun run build` → run the new spec against the standing artifact → **both tests PASS**
   (the characterization green — the V16 ANALYZE pre-proved the design; if a pin fails,
   forensics FIRST, the F-118 posture: suspect the probe, then the production code, never
   the suite's roll).
2. The count-lockstep ride (constants + every live doc site, SAME commit) → `bun run test`
   green (the gate re-anchored).
3. The full gate on the final tree: lint 0 · tsc · unit **151/151** (15 files — UNMOVED) ·
   build · smoke 13/13 · e2e **115/115** (101 desktop + 13 mobile + 1 setup) — plus a
   second consecutive full run.
4. The three with-data evidence harnesses (s16 13/13 · s17 19/19 · s18 20/20) on the
   final tree.
5. Screenshots 111–113 from the remediated dev server → `docs/screenshots/` (via the
   committed `scripts/capture-s25-evidence.mjs` — the fiscal settings card with the
   toggle ON, the receipt rendering the fiscal line, the mobile drawer).
6. Docs lockstep (§2.4) + the worklog's Session-25 entry + `docs/session_45.md` (the
   narration — the numbering convention: session_43 was the Session-24 cycle's narration,
   session_44 the operator's raw log, so this cycle narrates as session_45).
7. Commit (`test(session-25)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first; the bin/ssh paramiko shim
   RECREATED after the workspace reset) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The spec landed green after ONE probe fix** (the characterization green — the V16
  ANALYZE pre-proved the design): test 1 (the visible state) passed on the FIRST run;
  test 2 failed at its RESTORE step on a strict-mode violation — TWO inputs carry the
  "Tax ID / EIN" label (Business Information's `taxId` and the fiscal card's
  `fiscalRuc`) and the restore's `getByLabel` was unscoped. The fix scopes every
  fiscal-field locator to the `region "Fiscal / Tax Data"` (the law now in AGENTS);
  both tests then passed (`3 passed (14.8s)`). Zero production-code changes — the
  finding was the missing tier, exactly as planned.
- **The fixture + self-clean verified in the db** (the F-120 posture — verify state,
  not exit codes): after the two consecutive full runs, `db/e2e.db` carries the fiscal
  walk's product (stock 8 = 10 − the two checkouts' decrements), **the settings
  RESTORED to seed defaults** (`hideFiscalOnReceipt: true`, `fiscalRuc: ""`,
  storeName "My Store"), **ZERO open shifts**, and the fiscal register's TWO shifts
  both `closed` with exact 103.25 counts. Totals: 8 products / 7 sales (every walk's
  fixtures present).
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E 115,
  E2E_SPECS 12, the "Session-24 lock" → "Session-25 lock" literal, the "101 desktop"
  breakdown) + README (badge/scripts/testing + the Session-25 walk paragraph) + CLAUDE
  (baseline 115 + the four-walk ordering law d < f < i < r + the settings self-clean
  extension) + AGENTS (the Session-25 fiscal round-trip contracts: the inverted-wiring
  law, the receipt's fiscal conditional as law, the settings self-clean law, the
  two-fields-one-label scoping law, the four-persisting-specs ordering law) + PAD
  **v1.23** (scale line + file tree + the spec map + the revision block) + SKILL
  **v2.21.0** (version + header baselines + commands + testing tier + the Session-25
  addendum). UNIT stays 151/15.
- **A GATE-TIME FINDING, CURED IN THE SAME CYCLE — the evidence harnesses'
  hour-drift (the volatile-expectation law, applied retroactively)**: the s17/s18
  harnesses failed ONE check each on this cycle's FRESH demo.db (s17 18/19, s18
  19/20) — the forensics (the db queried directly) traced it to the SEED HOUR: the
  demo seed's sale timestamps are relative to the seed time, so which boundary sales
  fall inside the 7-day CALENDAR window depends on the hour the db was seeded (a
  morning-seeded db carries 29/$369.46 in the window; the afternoon-seeded recording
  the Session-17 hardcodes captured carried 28/$366.56 — the diff is exactly the
  boundary sale T-000005, $2.90 at 01:02 of the window's first day). The PAGE derived
  correctly both times — only the harnesses' HARDCODED 7-day literals drifted (prior
  cycles' demo.db was warm since Session-22 and never re-seeded, so the drift was
  invisible). **The cure (test-tier only)**: s17's 7-day check now DERIVES its
  expectation from the sales API at runtime (mirroring `periodStart(7)`'s exact
  semantics — today 00:00 − 6 days, completed only); s18's truth block now derives a
  `week {n, sum}` pair and the coherence check asserts the buckets sum to IT (the
  derivation was already there — only the assertion literal was hardcoded). Both
  harnesses re-ran GREEN: **s17 19/19 · s18 20/20** (s16 13/13 — unaffected, its
  checks are window-independent).
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc
  clean · unit **151/151** (15 files) · build green · smoke **13/13** · e2e
  **115/115 × 2 consecutive full runs** (101 desktop + 13 mobile + 1 setup) · the
  three with-data harnesses **s16 13/13 · s17 19/19 · s18 20/20** (the older harness
  captures restored — only this cycle's changed captures commit).
- **Evidence: screenshots 111–113** captured from the remediated dev server via the
  committed `scripts/capture-s25-evidence.mjs` — 111 the fiscal settings card with the
  toggle ON ("Visible on receipt" + the RUC/regime filled, the API state verified
  live), 112 the receipt rendering the fiscal line (`FWALK-RUC-001 · S-Corp Test`
  inside `.receipt-print`, the checkout driven through the real terminal), 113 the
  mobile drawer at 390 (288px, zero overflow — the operator's priority surface). The
  script's self-clean verified live (the shift closed, the settings restored to seed
  defaults). The captures verified DISTINCT before commit (the s24 byte-identical
  lesson). Plus the D-1-shape reference capture (`ref-mobile-pos-390-s25.png`).
- **`.env.example` verified** against the working `.env` (V18 — key-for-key aligned;
  the working `.env` carries its 64-hex AUTH_SECRET).

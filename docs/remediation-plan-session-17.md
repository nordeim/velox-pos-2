# VeloxPOS Remediation Plan — Session-17

**Date:** 2026-10-27 (Session-17 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-16 tree (HEAD `ceb4530` =
`797b9c9` + the operator's session_28 raw-log commit; the workspace was RESET TWICE — a fresh
`git clone https://github.com/nordeim/velox-pos-2.git` re-established it, and the
Session-17 cycle's own in-flight work from the first reset was lost locally before its
commit — this cycle redoes it end-to-end from the received tree). A full
received-tree gate re-verification, a live reference re-measurement at every previously-pinned
depth (the "reference DRIFTS" law — ELEVENTH consecutive cycle, zero drift on every standing
pin), this cycle's NEW-depth audit — **the Inventory/Reports with-data states under the demo
seed (the session_28 "Next" pointer's named target: the with-data surfaces the empty-store
e2e can never see) plus the reference-side Inventory/Reports internals measured at leaf
precision** — and the static sweep (zero-importer file + dependency censuses, secrets,
credential, Session-16 code review). **Method:** skills/web-application (§12 v4 traps, §14
testing tiers, §15 gate), skills/agent-browser (computed styles are ground truth; the
oklab-alpha and innerText-case postures — this cycle's measurement lessons),
skills/tdd (the with-data class lands in the EVIDENCE tier, not the unit/e2e counts — the
V24 doctrine), the count-lockstep doctrine (docs-counts gate — this cycle moves NO counts),
VLM cross-verification for the visually-loaded findings (DOM probes are the authority — the
S9 doctrine).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | workspace reset → fresh `git clone` | clean tree @ `ceb4530` (= the Session-16 push `797b9c9` + the operator's session_28 commit); the prior Session-17 attempt's uncommitted work (the evidence harness, the AGENTS/CLAUDE edits, this plan's first draft) was LOST in the reset — never pushed — so this cycle re-executes the whole depth from the received tree |
| V2 | Environment contract | `.env` from `.env.example`, `bun install` (472 pkgs), `db:push` + `db:seed`, `bunx playwright install chromium` | `.env` carries `DATABASE_URL="file:../db/custom.db"` ✓; `db/` at the root ✓; **one env-only defect: the sandbox's cached browsers (build 1200) don't match Playwright 1.63 (needs 1243) — `bunx playwright install chromium`, no code change; recorded so the next fresh-clone cycle runs it before the gate** |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 149/149** (14 files) — the Session-16 lock holds |
| V4 | Standalone build | `bun run build` | green — the full route table renders |
| V5 | Smoke suite | `bun run smoke` | **13/13** — incl. the artifact-hygiene probe + the no-secret boot refusal |
| V6 | Full e2e on the received tree | `CI=1 bun run test:e2e` (after the browser install) | **104/104** (2.3m) — the Session-16 lock holds (90 desktop + 13 mobile + 1 setup) |
| V7 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** — the one flag (`src/instrumentation.ts`) is Next.js's auto-registered `register()` convention entry, live by design; deps: only the known type-level/peer-coupled withdrawals (`react-dom`, `@types/react`, `@types/react-dom`) — **`@radix-ui/react-toast` and `axe-core` remain gone** (the s15 removals hold) |
| V8 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify (`check-owner-credential.mjs`, outside the repo) cross-checked against the app's own `verifyPassword` | **the documented `$Abcd1234` VERIFIES** (the standalone checker first failed on its own salt-handling bug — passing the hex string raw instead of hex-decoding it; fixed, then byte-verified via `src/lib/auth.ts`'s own code path) |
| V9 | Secrets scan | `git grep` across the tracked tree (session logs + archive + lockfile + skills excluded) | clean — zero hits |
| V10 | Session-16 code review (Mode C) | `saleTimestamp` seam + both adoption sites + the full `toLocale*` census | clean: the seam adopted at `terminal-view.tsx:219` + `sales-view.tsx:45`, unit-pinned ×3, e2e-pinned on the checkout receipt; every remaining `toLocale*` site is EXPLICIT-locale by pinned design (the chart's `en-US` labels in `reports.ts:132` + `dashboard-view.tsx:22,44` = the F-55 date line; the ledger's `es-MX` cell in `sales-view.tsx:31`) |
| V11 | Live drift — the login card | agent-browser computed styles on `/login` | **HOLDS (11th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px |
| V12 | Live drift — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · 12px radius · red-50/0.7 · 1px red-200 · 16px pad · inner 14px red-700 |
| V13 | Live drift — the sidebar + terminal gate | computed styles post-login (/POS) | **HOLDS**: the aside 220px (the nav content 219px — flex-1, the s16-recorded read) · 8 links · the Terminal link 42px @ `rgba(124,58,237,0.2)` (violet-600/0.2) · the gate + CART |
| V14 | Live drift — the Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: the date line 14px slate-500 ("Tuesday, October 27, 2026", en-US); both chart h3s 16px/700; "Historial de Ventas" h1 24px + the 7 ledger headers + the byte-exact "Buscar por ticket, cliente o cajero..." placeholder + the slate-400 leaf empty cell; "Cajeros" + "Turnos Recientes" |
| V15 | Live drift — the mobile defect | viewport 390×844 on /POS | **HOLDS**: still NO hamburger, the 220px z-50 static sidebar — the reference's own defect, unchanged; the clone's drawer superset stays correct (13/13 mobile e2e green in V6) |
| V16 | NEW depth — the reference Inventory surface | computed styles + DOM census on /Inventory (empty — the demo account is write-gated) | **PARITY**: h1 "Inventory" 24px/700; "0 products registered" 14px slate-500 (rgb(100,116,139)); the search input h-9 (36px) with the placeholder **"Search by name or code..."** byte-exact; the empty cell **"No products found" `text-center py-12 text-slate-400 text-sm`** (14px, centered, 48px vertical pad — the s10 F-63 pin re-proven live) |
| V17 | NEW depth — the reference Reports surface | /Reports full DOM walk (empty store) | **PARITY byte-level**: h1 "Reports" 24px; the sub "Sales & revenue analytics" white/0.35; **4 period pills** (7/14/30/90 days; 12px/700; inactive white/0.4; **ACTIVE = "30 days"** full-white — the clone's `days = 30` default matches, no drift); **three h2 sections** ("Daily Sales" / "Revenue by Payment Method" / "Breakdown by Method" — 14px/700, CSS-uppercased, 0.7px tracking); the 3 stat cards `rounded-2xl p-5 flex items-center gap-4` (surface rgba(16,18,32,0.9) + 1px white/0.07 — the clone's `glass-card` computes the BYTE-IDENTICAL surface; the class-name difference is invisible); labels **"Total Revenue" / "Transactions" / "Avg. Ticket"** 12px/400 white/0.35 CSS-uppercased; values `<p>` **24px/900** (font-black — "Avg. Ticket" byte-identical clone↔reference) |
| V18 | NEW depth — the with-data audit (demo seed) | `db/demo.db` (--demo: 15 products, 5 categories, 1 register, 1 closed shift, 33 sales) → standalone on :3418 → DOM probes (`audit-s17-withdata.mjs`, persisted outside the repo) | **ALL GREEN 17/17, no with-data defects**: Inventory — h1/subline ("15 products registered"), the byte-exact search placeholder @ h-9, 6 category pills @ 36px (All + the 5 demo categories), 15 rows with the 7-column header set, the stock-chip census **out=1 / low=2 / ok=12** (the db truth), the category dots (the Beverages row's dot = rgb(139,92,246) = `#8b5cf6`), the search filter (Espresso → 1 row); Reports — h1 + sub white/0.35, the 4 pills with 30 days active (full-white; the inactive pills serialize as `oklab(0.999994 … / 0.4)` — the v4 dust, pinned by ALPHA), the stat family (labels 12px/400 uppercase, values `<p>` 24px/900), the 30-day values **$410.64 / 33 / $12.44** (the db truth), the glass-card surface, the three h2s, the method rows **card $246.74 (16) / cash $163.90 (17)** with shares **60% / 40%**, the breakdown bars mirroring the shares, and the **7-day window narrowing to $366.56 / 28** (the calendar-bucket truth) |
| V19 | Coverage check (the F-111 pattern) | `reports.test.ts` + `surfaces.spec.ts` reads | the LOGIC seams are unit-pinned (`summarize` incl. the calendar-bucket windows + `avgTicket`, `byMethod` shares, `dailySeries`) and the EMPTY-state surface is e2e-pinned (the Reports copy/pills/empty states, "Avg. Ticket", the pill switch, the chart family) — **the live WITH-DATA rendering is covered by NO tier**: the empty-store e2e can never see it (the V24 doctrine), and the s16 evidence harness covers only Registers/Sales/Cashiers → **F-112** |
| V20 | The db truth (expected values) | read-only sqlite (`demo-db-truth.ts`): total 33/$410.64/avg $12.44; card 16/$246.74, cash 17/$163.90; stock out=1/low=2/ok=12/lowStock=3; 5 categories × 3 products; windows 7d=$366.56/28, 30d=$410.64/33 | the exact anchors the audit's expectations derive from — every page-side value in V18 matches this truth byte-for-byte |
| V21 | The 7-day window semantics (the mid-audit suspicion) | `summarize`/`dailySeries` seam reads + the db window query | the page's 7-day window showed $366.56/28 while all 33 sales are within 6.9 days — **correct by design**: the seam uses CALENDAR-BUCKET semantics (7 day-buckets including today, the standard analytics window, coherent with `dailySeries`); the 5 sales on the 7th calendar-day-back fall outside the bucket — the pin's first expectation (33) was wrong, the page is right, and the semantics are unit-pinned |
| V22 | Audit-infra lessons (three probe bugs, all in the audit script — zero checks weakened) | the 3 mid-run FAILs/timeout diagnosed at the DOM | (1) **the innerText-case trap** — the h2s/labels render CSS-uppercased in innerText ("DAILY SALES") while textContent keeps the source case; a settled-state wait matching "Daily Sales" in innerText NEVER fires (30s hang). Pin textContent; match innerText case-insensitively. (2) **the waitForFunction arity trap** — `waitForFunction(fn, {timeout})` passes the options as the function ARG; options is the THIRD parameter (`waitForFunction(fn, null, {timeout})`); the mis-passed form silently becomes the 30s default. (3) **the row-structure trap** — the MethodTable's method name is a BARE TEXT NODE (not a span) and the share span NESTS inside the font-bold money span; span-index probes read "" and "$246.7460%". Parse child nodes, never span indexes. All three are measurement lessons for AGENTS.md — the clone code is correct |

---

## 1. Findings

### The with-data cluster (this cycle's NEW depth — session_28's named target)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-112** | **MEDIUM** (structural — the with-data regression harness) | `scripts/capture-s17-evidence.mjs` (new, the s16-pattern successor) | This cycle's NEW-depth measurements (V18) exist only as one-off audit probes; the s15/s16 lesson is that the with-data class is invisible to the empty-store e2e by construction, and the evidence tier is the only place these contracts get re-proven per cycle. The s16 harness covers Registers/Sales/Cashiers but NOT Inventory/Reports. Cure: the Session-17 evidence script pins the measured with-data Inventory/Reports contracts on the demo-seeded db — the Inventory table census (15 rows, the 7-column header set, the stock-chip census, the category dots, the search filter) and the Reports family (the 4 pills with 30 active, the stat family + the 30-day db truth, the glass-card surface, the three h2s, the method rows + shares + bars, the 7-day window narrowing) — plus the standing F-76/drawer spot-checks; screenshots continue at 87. |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V11–V15): ELEVENTH consecutive drift-free cycle. The
  reference is stable; the pin doctrine keeps proving it.
- **The reference's Inventory/Reports internals** (V16/V17): byte-parity everywhere —
  including the active "30 days" pill (the clone's default matches), the "Avg. Ticket"
  label (byte-identical), and the stat-card surface (the clone's `glass-card` computes the
  identical rgba(16,18,32,0.9) + 1px white/0.07; the reference's class list just lacks the
  `glass-card` alias — invisible in computed styles). No change.
- **The clone's with-data Inventory/Reports surfaces** (V18): no defects found — 17/17.
- **The 7-day window "discrepancy"** (V21): calendar-bucket semantics, correct by design,
  unit-pinned. Not a bug; the audit pin re-derived from the same semantics.
- **The three audit-infra FAILs** (V22): all probe bugs in the audit script (the
  innerText-case wait, the waitForFunction arity, the row parser), all fixed in the probe —
  the clone code is correct; the lessons get recorded.
- **The e2e setup failure on the first run** (V2): the sandbox's browser cache (build 1200)
  doesn't match Playwright 1.63 (needs 1243) — `bunx playwright install chromium`,
  environment-only, no code change, recorded so the next fresh-clone cycle runs it before
  the gate.
- **The credential checker's first FAIL** (V8): the standalone checker's own salt-handling
  bug (raw hex string instead of hex-decoded bytes) — fixed in the checker; the credential
  itself verifies byte-clean via the app's own code path.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **F-112 is EVIDENCE-TIER ONLY** (the s15 V24 doctrine): the with-data contracts land in
   `scripts/capture-s17-evidence.mjs` — NOT in the unit or e2e suites. UNIT stays 149
   (14 files), E2E stays 104 (7 specs): **the count-lockstep constants DO NOT MOVE this
   cycle**, and the "Session-16 lock" literal stays (the lock names the cycle that last
   re-anchored the counts — re-anchoring without a count change is a no-op by the gate's
   design). No lockstep collateral anywhere.
2. **The evidence script mirrors the s16 harness** (`scripts/capture-s16-evidence.mjs`):
   the same server-lifecycle ownership (spawn → health → sign-in through the REAL UI →
   probe → kill), the same demo-db provisioning guard (db/demo.db, `--demo` seed), port
   **3418**, the same throwaway AUTH_SECRET pattern (localhost-only test server — the
   documented posture), and the s16 race lessons applied (settled-state waits, the 700ms
   animation settle before geometry reads). Screenshots continue the numbered record at
   **87**.
3. **The audit's measurement postures carry into the harness** (V22's lessons, upstream):
   pin textContent (source case) for CSS-uppercased labels; wait on innerText
   case-insensitively; pass `waitForFunction` options as the THIRD argument; pin the ALPHA
   for v4's oklab white/α serializations (0.4 pills / 0.35 labels), never the full
   serialization; parse the MethodTable rows by child nodes.
4. **No production-code changes**: the audit found zero with-data defects (V18) and the
   reference sweep found zero drift (V11–V17). This cycle's deliverable is the harness +
   the docs lockstep + the session record.
5. **Docs lockstep** (counts unchanged — content only): AGENTS.md (the Session-17
   contracts section: F-112's Inventory/Reports evidence coverage + the four measurement
   lessons from V22), CLAUDE.md (the evidence-tier line in Testing conventions — the tier
   now names BOTH harnesses), PAD **v1.15** (header + Last Updated + the v1.15 revision
   block), velox-pos_SKILL.md **v2.13.0** (the Session-17 addendum), README (no count
   changes — untouched), the repo worklog's Session-17 entry, `docs/session_29.md` (the
   narration), `.env.example` re-verified against `.env`.

### The RED posture (evidence-tier)

- The evidence script is not TDD-able in the unit sense (it pins LIVE rendering on a
  booted artifact); its "red" is the harness's own failure modes: every check must be
  honest-failing (a settled-state wait that times out if the data never lands — proven
  live when the innerText-case bug hung the first run, V22). The 17/17 audit run is the
  pre-harness proof that every pinned contract is reachable and correct; the harness then
  re-proves them standing, plus the F-76/drawer spot-checks.

---

## 3. Execution order

1. The with-data audit (done — V18, 17/17) → this plan → validation against the codebase
   (insertion points, ports, the screenshot numbering, the AGENTS/CLAUDE/PAD/SKILL
   anchors).
2. Build `scripts/capture-s17-evidence.mjs` (the s16 pattern + the Inventory/Reports
   contracts + the F-76/drawer spot-checks) → run → **must pass 19/19** (the 17 with-data
   contracts + the F-76 + drawer standing spot-checks) → screenshots 87–89 →
   docs/screenshots/.
3. The VLM cross-check on the evidence captures (the s16 family pattern,
   `vlm-verify-s17.mjs` — 3 checks: the with-data Inventory, the with-data Reports, the
   7-day switch).
4. The full gate on the final tree: lint 0 · tsc · unit **149/149** (14 files) · build ·
   smoke 13/13 · e2e **104/104** (the constants unmoved — the lockstep gate must stay
   green with zero re-anchoring).
5. Docs lockstep (§2.5) + `.env.example` verify.
6. Commit (`fix(session-17)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — `--remote git@github.com:nordeim/velox-pos-2.git`,
   dry-run first) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The with-data audit pre-proved every contract** (V18): 17/17 on the first
  complete run — after the three mid-run probe bugs were diagnosed and fixed in
  the audit script itself (V22: the innerText-case wait hang, the waitForFunction
  arity, the MethodTable row parser; plus the first-row dot expectation — the
  Beverages row is found by its cell text, never assumed at rows[0]). Zero clone
  code changed; zero checks weakened.
- **F-112 harness green on its first complete run**:
  `scripts/capture-s17-evidence.mjs` — **19/19 PASSED** (the 17 with-data
  Inventory/Reports contracts + the F-76 spot-check — which surfaced the oklab
  form `oklab(0.970522 … / 0.7)` live, the either-form posture working as
  designed — + the mobile drawer). Screenshots **87–89** captured
  (87-inventory-withdata, 88-reports-withdata, 89-reports-7day).
- **VLM cross-check: 3/3** on the evidence captures (the with-data Inventory
  table, the with-data Reports family, the 7-day switch).
- **Full gate on the final tree: GREEN** — lint 0 errors (1 documented warning) ·
  tsc clean · unit **149/149** (14 files) · build green · smoke **13/13** · e2e
  **104/104**. The docs-counts lockstep gate stayed green with ZERO re-anchoring —
  the count constants unmoved, the "Session-16 lock" literal intact (§2.1's
  design held exactly).
- **`.env.example` verified identical to `.env`** (this cycle's .env was CREATED
  from it; `diff` clean).
- **Docs lockstep**: this plan's record, AGENTS.md (the Session-17 contracts
  section: the two-harness evidence tier, the calendar-bucket law, the four
  measurement postures), CLAUDE.md (the tier-4 Evidence line in Testing
  conventions), PAD **v1.15** (header + Last Updated + the revision block),
  velox-pos_SKILL.md **v2.13.0** (the Session-17 addendum), the repo worklog's
  Session-17 entry, and `docs/session_29.md` (the narration). README untouched
  (no count changes — by design).

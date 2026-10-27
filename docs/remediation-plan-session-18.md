# VeloxPOS Remediation Plan — Session-18

**Date:** 2026-10-27 (Session-18 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-17 tree (HEAD `e67a997` =
the Session-17 push `b1c6e9a` + the operator's session_30 raw-log commit — the workspace
synced by fast-forward pull, clean tree, NO reset this cycle). A full received-tree gate
re-verification, a live reference re-measurement at every previously-pinned depth (the
"reference DRIFTS" law — TWELFTH consecutive cycle, zero drift on every standing pin),
this cycle's NEW-depth audit — **the StoreSettings/Dashboard with-data states under the
demo seed (the session_29 "Next" pointer's named target: the with-data surfaces the
empty-store e2e can never see) plus the reference-side StoreSettings internals measured
at full depth for the first time since Session-15's listbox enumerations** — and the
static sweep (zero-importer file + dependency censuses, secrets, credential, Session-17
code review). **Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15
gate), skills/agent-browser (computed styles are ground truth; the class-string lesson
re-learned), skills/tdd (the with-data class lands in the EVIDENCE tier, not the
unit/e2e counts — the V24 doctrine), the count-lockstep doctrine (docs-counts gate —
this cycle moves NO counts), VLM cross-verification for the visually-loaded findings
(DOM probes are the authority — the S9 doctrine).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git fetch` + fast-forward pull (no reset — the prior cycle's push landed after the local snapshot) | clean tree @ `e67a997` (= the Session-17 push `b1c6e9a` + the operator's session_30 raw-log commit, ONE commit pulled: `docs/session_30.md`) |
| V2 | Environment contract | `.env` vs `.env.example` diff · `db/` census · `bun --version` · agent-browser 0.39.4 · Playwright 1.63 + chromium-1243 | `.env` byte-identical to `.env.example` ✓ · `db/` at the root with all four dbs ✓ · bun 1.3.14 ✓ · the s17 browser-build lesson pre-applied (1243 cached) — NO env defects this cycle |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 149/149** (14 files) — the Session-16 lock holds |
| V4 | Standalone build + smoke | `bun run build` → `bun run smoke` | build green (full route table) · smoke **13/13** (incl. the artifact-hygiene probe + the no-secret boot refusal) |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **104/104** (2.3m) — the Session-16 lock holds (90 desktop + 13 mobile + 1 setup) |
| V6 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** — the one flag (`src/instrumentation.ts`) is Next.js's auto-registered `register()` convention entry, live by design; deps: only the known type-level/peer-coupled withdrawals (`react-dom`, `@types/react`, `@types/react-dom`); `@radix-ui/react-toast` + `axe-core` remain gone (the s15 removals hold) |
| V7 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify (`check-owner-credential.mjs`, outside the repo — NOTE: a bun script, `bun:sqlite`; plain node fails with ERR_UNSUPPORTED_ESM_URL_SCHEME, not a code defect) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V8 | Secrets scan | `git grep` across the tracked tree (session logs + archive + lockfile + skills + the wrapper docs excluded) | clean — zero hits; the `AUTH_SECRET` sites are the documented throwaway test constant (e2e config + evidence scripts, localhost-only — the known pattern) |
| V9 | Session-17 code review (Mode C) | `git diff ceb4530..e67a997` + the s17 harness posture read | the Session-17 commits touched ONLY evidence scripts/docs/screenshots (zero production code — the §2.4 design held); the harness adopts all four recorded postures (23 textContent pins, `waitForFunction` 3-arg, the either-form oklab regex at line 354); the VLM script follows the s16 family pattern |
| V10 | Live drift — the login card | agent-browser computed styles on `/login` | **HOLDS (12th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px |
| V11 | Live drift — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · 12px radius · red-50/0.7 · 1px red-200 · 16px pad · inner 14px red-700 — probe note: the reference's `<main>` does NOT carry the clone's `login-canvas` class; scope reference-side probes to `main [role=alert]` |
| V12 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · 8 links · the Terminal link 42px @ `rgba(124,58,237,0.2)` · z-50 |
| V13 | Live drift — the Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: the date line "Tuesday, October 27, 2026" 14px slate-500 en-US; both chart h3s 16px/700; "Historial de Ventas" h1 24px/700 + the 7 ledger headers + the byte-exact "Buscar por ticket, cliente o cajero..." + the slate-400 "Sin ventas" leaf; "Cajeros" h1 + "Turnos Recientes" as **H3** 16px (the F-57 level contract re-proven live) |
| V14 | Live drift — the mobile defect | viewport 390×844 on /POS | **HOLDS**: still NO hamburger, the 220px z-50 STATIC sidebar — the reference's own defect, unchanged; the clone's drawer superset stays correct (13/13 mobile e2e green in V5) |
| V15 | NEW depth — the reference StoreSettings internals (the s15 surfaces re-measured at full structure) | agent-browser full DOM walk on /StoreSettings (desktop 1440×900) | **PARITY everywhere**: h1 "Store Settings" + the sub "Customize your business" 14px slate-500; **6 sections** all H3 16px (Business Information / Branding / Receipt / Fiscal / Tax Data / Card Payment Provider / Product Categories); the six bare icons in `flex items-center gap-2` headers at 20px — **store indigo-500 rgb(99,102,241) · palette purple-500 · file-text green-500 · receipt orange-500 · credit-card blue-500 · tag amber-500** (the Session-6 pins re-proven); labels 14px/500 @ #e7e9ef (F-66); inputs 36px/12px; the Business Information card carries Store name (default "My Store") + Logo (Upload logo glass button) + Address/Phone/Email + Tax ID / EIN + Currency ("USD - US Dollar" trigger @ 36px/12px); the Branding card = Primary color + Secondary color; the Receipt footer textarea rows=2/60px/12px; the Fiscal card = the pinned 4 labels + the `lucide-toggle-left w-6 h-6 text-slate-400` icon-button "Hidden on receipt" (NO role=switch — the s15 posture re-proven); the Provider trigger "None"; Categories = Add 34px/8px + "No categories" slate-400; Save Changes 54px/12px |
| V16 | NEW depth — the two listbox enumerations (F-108/F-109 re-verify) | open both listboxes live | **BOTH HOLD**: Currency = [USD - US Dollar, EUR - Euro, GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso] @ the #161922/6px dropdown panel; Provider = [**None**, Stripe, PayPal, Clip, Mercado Pago] — the "None" is the reference's DISPLAY label and the clone's `cardProviderLabel("none")` already renders the identical "None" (the stored code value stays "none") — **no drift, withdrawn** |
| V17 | NEW depth — the with-data audit (demo seed) | `db/demo.db` (--demo: 15 products, 5 categories, 1 register, 1 closed shift, 33 sales) → standalone on :3419 → DOM probes (`audit-s18-withdata.mjs`, persisted outside the repo; expected values DERIVED FROM THE DB AT RUNTIME — the today-bucket is volatile: the seed's day-0 sales land 16-20h before seed time, so a morning-seeded db carries them on YESTERDAY's calendar bucket) | **ALL GREEN 16/16, no with-data defects**: StoreSettings — the header pair, the 6 sections with computed icon colors, the form materializing the settings row (store name "My Store", currency "USD - US Dollar" @ 36px/12px), the Branding pickers + hex inputs (#6366f1/#8b5cf6 — pickers and inputs agree), the Receipt footer textarea ("Thank you for your purchase!" @ rows=2/60px/12px), the Provider trigger "None", the fiscal switch checked=false + "Hidden on receipt" (the seeded hidden default), the 5 category chips with EXACT dot colors (Beverages rgb(139,92,246) · Groceries rgb(16,185,129) · Personal Care rgb(59,130,246) · Snacks rgb(245,158,11) · Electronics rgb(239,68,68)), Save Changes 54px; Dashboard — the 4 stats carry the db truth (**Today's Sales $0.00 / Transactions 0** — the honest calendar-bucket empty-today on a morning-seeded db — **Products 15 / Low Stock 3**), the stat family styles (labels 600/12px uppercase slate-500; values 700/24px white/90 **by ALPHA**), both h3s 16px, the with-data chart (2 paths, 13 grid lines, y ticks [0,20,40,60,80,100] + 7 weekday labels, **topTick 100 ≥ the $94.43 peak — the F-107 niceScale law re-proven on real data**), the category breakdown (5 rows, counts 3, bars 20%, exact dot colors) |
| V18 | The db truth (expected values) | runtime read-only queries (the audit's own truth step): settings row (My Store/USD/#6366f1/#8b5cf6/"Thank you for your purchase!"/none/hidden), 5 categories × colors, products 15, lowStockCount 3, today-bucket 0/$0.00, 7 day-buckets [3/$39.09, 6/$79.46, 4/$47.33, 6/$69.71, 6/$94.43, 3/$36.54, 0/$0] (sums to the $366.56/28 7-day window — the s17 calendar-bucket pin re-derived) | every page-side value in V17 matches this truth byte-for-byte |
| V19 | Coverage check (the F-111 pattern) | `surfaces.spec.ts` + `currency.test.ts`/`validation.test.ts` reads | the settings SAVE round-trip, the section headings (h3/16px), the form controls (12px radius/#262a36/transparent), and both listbox enumerations are e2e-pinned; the currency/provider labels + the Zod gate are unit-pinned; the empty-state stats + chart family + "No data yet" are e2e-pinned — **the live WITH-DATA rendering of both surfaces is covered by NO tier**: the empty-store e2e can never see it (the V24 doctrine), the s16 harness covers Registers/Sales/Cashiers, the s17 harness covers Inventory/Reports → **F-113** |
| V20 | Audit-infra lessons (three probe bugs, all in the audit script — zero checks weakened) | the 3 mid-run FAILs diagnosed at the DOM | (1) **the class-string trap** — the clone's icons render `h-5 w-5 text-indigo-500` (height-first) while the reference's measured string is `w-5 h-5` (width-first): IDENTICAL computed styles, so pin the computed color/size + the icon NAME, never the class-string order. (2) **the oklab-alpha SPACE** — v4 serializes white/90 as `oklab(0.999994 … / 0.9)` with a SPACE after the slash; the s17 either-form regex `/\/([\d.]+)\)$/` misses it — the generalized form is `/\/\s*([\d.]+)\)$/`. (3) **the mixed-tick array** — the Dashboard chart's tick texts mix numbers and weekday labels; `Math.max(...ticks.map(Number))` NaNs on "Wed" — filter to numeric ticks before reducing. All three are probe lessons; the clone code is correct |

---

## 1. Findings

### The with-data cluster (this cycle's NEW depth — session_29's named target)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-113** | **MEDIUM** (structural — the with-data regression harness) | `scripts/capture-s18-evidence.mjs` (new, the s16/s17-pattern successor) | This cycle's NEW-depth measurements (V17) exist only as one-off audit probes; the s15–s17 lesson is that the with-data class is invisible to the empty-store e2e by construction, and the evidence tier is the only place these contracts get re-proven per cycle. The s16 harness covers Registers/Sales/Cashiers, the s17 covers Inventory/Reports — NEITHER covers StoreSettings or the Dashboard with data. Cure: the Session-18 evidence script pins the measured with-data StoreSettings/Dashboard contracts on the demo-seeded db — the settings form census (the materialized row, the pickers + hex inputs, the footer textarea, the "None" provider trigger, the fiscal switch + label, the 5 category chips with exact dot colors, the 54px Save CTA) and the Dashboard family (the 4 db-truth stats, the stat family styles, the with-data chart + the niceScale top tick, the category breakdown rows/bars) — with the TODAY-bucket expectations DERIVED FROM THE DB AT RUNTIME (the volatility lesson: a morning-seeded demo db carries its day-0 sales on yesterday's bucket — a hardcoded "$X.NN today" pin would rot within hours of any re-seed), plus the standing F-76/drawer spot-checks; screenshots continue at 90. |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V10–V14): TWELFTH consecutive drift-free cycle. The
  reference is stable; the pin doctrine keeps proving it.
- **The "None" capitalization suspicion** (V16): the reference's provider listbox renders
  "None" — and the clone's `cardProviderLabel` already renders the identical display
  label while storing the code form "none". The s15 record's lowercase "none" was the
  STORED-VALUE list, not a display-label pin. No drift; nothing to change.
- **The reference's StoreSettings internals** (V15): full-structure parity — including
  the six section icons at their measured colors, the fiscal toggle-left posture, and
  both listbox enumerations (byte-identical to the s15 measurements). No change.
- **The clone's with-data StoreSettings/Dashboard surfaces** (V17): no defects found —
  16/16, including the honest $0.00/0 today pair (data exists in the 7-day chart while
  the today-bucket is empty — the calendar-bucket seam working exactly as unit-pinned).
- **The three audit-infra FAILs** (V20): all probe bugs in the audit script (the
  class-string order, the oklab-alpha space, the mixed-tick NaN), all fixed in the
  probe — the clone code is correct; the lessons get recorded.
- **The audit script's own unterminated string** (V0, pre-run): a `]')` typo for `]"])`
  in the grid-line selector — a plain authoring bug caught by `node --check` before any
  server ran; recorded only because the SyntaxError's caret position (pointing at `#`)
  was three tokens away from the actual missing quote — a reminder to hexdump the exact
  line when a caret makes no sense.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **F-113 is EVIDENCE-TIER ONLY** (the s15 V24 doctrine): the with-data contracts land
   in `scripts/capture-s18-evidence.mjs` — NOT in the unit or e2e suites. UNIT stays 149
   (14 files), E2E stays 104 (7 specs): **the count-lockstep constants DO NOT MOVE this
   cycle**, and the "Session-16 lock" literal stays (the lock names the cycle that last
   re-anchored the counts). No lockstep collateral anywhere.
2. **The evidence script mirrors the s16/s17 harness family**: the same server-lifecycle
   ownership (spawn → health → sign-in through the REAL UI → probe → kill), the same
   demo-db provisioning guard (db/demo.db, `--demo` seed), port **3419**, the same
   throwaway AUTH_SECRET pattern (localhost-only test server — the documented posture),
   and the standing race/posture lessons applied (settled-state waits, the 700ms
   animation settle before geometry reads, textContent pins, 3-arg waitForFunction,
   child-node row parsing, oklab-ALPHA pins). Screenshots continue the numbered record
   at **90**.
3. **The harness derives the volatile expectations from the db at run time** (this
   cycle's structural lesson): the today-bucket stat pair (Today's Sales / Transactions)
   is computed from the db's own Sale rows with the same calendar-bucket semantics the
   `summarize` seam uses — a read-only `bun -e` JSON dump parsed by the harness before
   the probes run. The deterministic pins (Products 15, Low Stock 3, the settings row,
   the 5 category chips, the chart's tick structure) may stay literal — they cannot rot.
4. **No production-code changes**: the audit found zero with-data defects (V17) and the
   reference sweep found zero drift (V10–V16). This cycle's deliverable is the harness +
   the docs lockstep + the session record.
5. **Docs lockstep** (counts unchanged — content only): AGENTS.md (the Session-18
   contracts section: the THREE-harness evidence tier, the db-derived-expectation law,
   the three V20 measurement lessons), CLAUDE.md (the tier-4 Evidence line extended to
   name all three harnesses), PAD **v1.16** (header + Last Updated + the v1.16 revision
   block), velox-pos_SKILL.md **v2.14.0** (the Session-18 addendum), README (no count
   changes — untouched), the repo worklog's Session-18 entry, `docs/session_31.md` (the
   narration), `.env.example` re-verified against `.env`.

### The RED posture (evidence-tier)

- The evidence script is not TDD-able in the unit sense (it pins LIVE rendering on a
  booted artifact); its "red" is the harness's own failure modes: every check must be
  honest-failing (the settled-state waits time out if the data never lands; the
  db-derived expectations are computed BEFORE the probes so a rotten pin is impossible
  by construction). The 16/16 audit run (V17) is the pre-harness proof that every pinned
  contract is reachable and correct; the harness then re-proves them standing, plus the
  F-76/drawer spot-checks.

---

## 3. Execution order

1. The with-data audit (done — V17, 16/16) → this plan → validation against the
   codebase (insertion points, ports, the screenshot numbering, the AGENTS/CLAUDE/PAD/
   SKILL anchors).
2. Build `scripts/capture-s18-evidence.mjs` (the s16/s17 pattern + the
   StoreSettings/Dashboard contracts + the db-derived today expectations + the
   F-76/drawer spot-checks) → run → **must pass 20/20** (the 16 with-data contracts +
   the F-76 + drawer standing spot-checks + the db-truth derivation checks) →
   screenshots 90–92 → docs/screenshots/.
3. The VLM cross-check on the evidence captures (the s16/s17 family pattern,
   `vlm-verify-s18.mjs` — 3 checks: the with-data StoreSettings, the with-data
   Dashboard stats+chart, the category chips).
4. The full gate on the final tree: lint 0 · tsc · unit **149/149** (14 files) · build ·
   smoke 13/13 · e2e **104/104** (the constants unmoved — the lockstep gate must stay
   green with zero re-anchoring).
5. Docs lockstep (§2.5) + `.env.example` verify.
6. Commit (`fix(session-18)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — `--remote git@github.com:nordeim/velox-pos-2.git`,
   dry-run first) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The with-data audit pre-proved every contract** (V17): 16/16 on the first
  complete run — after the three mid-run probe bugs were diagnosed and fixed in
  the audit script itself (V20: the class-string order, the oklab-alpha space,
  the mixed-tick NaN) plus one pre-run authoring bug (the unterminated selector
  string caught by `node --check` before any server ran). Zero clone code
  changed; zero checks weakened.
- **F-113 harness green on its first complete run**:
  `scripts/capture-s18-evidence.mjs` — **20/20 PASSED** (the 2 db-truth
  derivation checks + the 16 with-data StoreSettings/Dashboard contracts + the
  F-76 spot-check — which surfaced the oklab form `oklab(0.970522 … / 0.7)`
  live again, the either-form posture working as designed — + the mobile
  drawer). Screenshots **90–92** captured (90-settings-withdata,
  91-dashboard-withdata, 92-categories-withdata).
- **VLM cross-check: 3/3** on the evidence captures (the with-data StoreSettings
  full page, the with-data Dashboard stats+chart, the categories chips close-up).
- **Full gate on the final tree: GREEN** — lint 0 errors (1 documented warning) ·
  tsc clean · unit **149/149** (14 files) · build green · smoke **13/13** · e2e
  **104/104** (2.4m). The docs-counts lockstep gate stayed green with ZERO
  re-anchoring — the count constants unmoved, the "Session-16 lock" literal
  intact (§2.1's design held exactly).
- **`.env.example` verified identical to `.env`** (the V2 diff — byte-clean).
- **Docs lockstep**: this plan's record, AGENTS.md (the Session-18 contracts
  section: the three-harness evidence tier, the db-derived-expectation law, the
  three V20 measurement lessons), CLAUDE.md (the tier-4 Evidence line naming all
  three harnesses), PAD **v1.16** (header + Last Updated + the revision block),
  velox-pos_SKILL.md **v2.14.0** (the Session-18 addendum), the repo worklog's
  Session-18 entry, and `docs/session_31.md` (the narration). README untouched
  (no count changes — by design).

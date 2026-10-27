# VeloxPOS Remediation Plan — Session-15

**Date:** 2026-10-27 (Session-15 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-14 tree (HEAD `197443c`
= `5bb9785` + the operator's session-log commit). A full received-tree gate re-verification, a live
reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law — NINTH
consecutive cycle, zero drift on every standing pin), this cycle's NEW-depth audit — **the
StoreSettings dialog/select internals (measured live for the first time: the section/label/control
census, the New Category dialog, the two select listboxes) and the populated-data dashboard re-sweep
with the demo seed (the session_24 "Next" pointer's other half — the with-data state the empty-store
e2e can never see)** — plus the static sweep: a full zero-importer census (files AND dependencies).
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate), skills/agent-browser
(live computed-style measurement — computed styles are ground truth), skills/tdd (red → green,
vertical slices), the count-lockstep doctrine (docs-counts gate), VLM cross-verification for the
visually-loaded findings (with DOM probes as the authority — the S9 doctrine).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull` on the Session-14 workspace | clean tree @ `197443c`; fast-forward brings in the operator's `docs/session_24.md` (the raw log of the Session-14 conversation; its "Next" pointer names this cycle's NEW-depth targets: the populated-data dashboard re-sweep with the demo seed + the Settings dialog internals); environment intact (.env contract `DATABASE_URL="file:../db/custom.db"`, db/ at the root with custom/e2e/smoke dbs, .env.example mirrors .env, agent-browser 0.39.0) |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 138/138** (14 files) — the Session-14 lock holds |
| V3 | Standalone build | `bun run build` | green — the full route table renders |
| V4 | Smoke suite | `bun run smoke` | **13/13** — incl. the artifact-hygiene probe + the no-secret boot refusal |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **102/102** (2.3m) — the Session-14 lock holds (88 desktop + 13 mobile + 1 setup) |
| V6 | Zero-importer census — FILES | a single-pass Node sweep (`scripts/zero-importer-census.mjs`): every module specifier across src (incl. framework entries as importers) + tests resolved to absolute paths, diffed against the 45 non-framework src files | **ZERO dead files** — the Session-14 SD-1 purge holds; all 45 live |
| V7 | Zero-importer census — DEPENDENCIES | every package.json entry tested for a live import (exact or subpath) across src/tests/scripts/configs/CSS | **2 dead**: `@radix-ui/react-toast` (the toaster has been zustand-based since the scaffolding — `src/components/ui/toast.tsx` imports nothing Radix; **Session-14's V9 "react-…-toast are load-bearing" classification was WRONG**) and `axe-core` (Omni-Study-era, commit `4cde8db`; zero code references — the only "axe" hits in the tree are the chart word "axes"). Withdrawn: `react-dom` (no direct src import, but peer-coupled to next — the framework resolves it at runtime; removing it would be wrong), config/CSS-level entries (`@tailwindcss/postcss`+`tailwindcss` in postcss.config/globals.css `@import "tailwindcss"`, `tw-animate-css` via `@import` in globals.css — load-bearing per CLAUDE.md, `z-ai-web-dev-sdk` in the 4 vlm scripts, eslint/tsc/playwright/vitest as CLI tools) |
| V8 | Doc-claims map for the dead deps | `git grep` per name across AGENTS/CLAUDE/README/PAD/SKILL | `velox-pos_SKILL.md:43` "dialog, select, **toast**, alert-dialog are load-bearing" (Radix row) — **false for toast**; `README.md:114` "Dialogs, selects, **toasts**, switches" (Radix row) — false for the toaster; `PAD:42` "Accessible dialogs/selects/**toasts** — never hand-rolled" — the toaster IS hand-rolled zustand (by design, documented in its header). No doc claims axe-core |
| V9 | Dev-db credential state (the SD-2 doctrine) | read-only scrypt verify of db/custom.db's owner hash against both the documented `$Abcd1234` and the s13 drift value `Abcd1234!` (`scripts/check-owner-credential.mjs`, mirrors `src/lib/auth.ts`'s `scrypt$salt$key` format) | **the documented credential VERIFIES, the drift value fails** — the Session-14 restore held; no script has drifted it since |
| V10 | Secrets scan | `git grep` across the tracked tree (session logs + archive + lockfile excluded) | clean — only the operator's own DOCUMENTED demo credentials (README quick-start + prisma/seed.ts, by design) and the wrapper skill's own marker-check line |
| V11 | Session-14 code review (Mode C) | full reads of `chart-path.ts`, `shared.tsx`, `settings-view.tsx`, `dashboard-view.tsx` | clean contracts, inline-documented, degenerate-safe; **one stale comment** (`dashboard-view.tsx:6` still says "the violet dotted-grid line chart" — contradicts the Session-14 indigo/slate rewrite it lived through) → SD-3 |
| V12 | Live drift check — the login card | agent-browser on `veloxposen.base44.app/login`, computed styles | **HOLDS (9th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · the 4px slate-gradient strip · h1 30px/700/slate-900 · SSO 54px · inputs 48px/12px |
| V13 | Live drift check — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · 12px · red-50/0.7 · 1px red-200 · 16px · inner 14px red-700 |
| V14 | Live drift check — the sidebar + terminal gate | computed styles post-login | **HOLDS**: 220px nav · 8 links · the 42px violet-600/0.2 pill @14px + #c4b5fd · "No active shift" gate + CART |
| V15 | Live drift check — the Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers sweeps | **HOLDS**: the date line 14px slate-500; "Sales — Last 7 days" + "Products by Category" h3s; "Historial de Ventas"/"Sin ventas"/7 headers; "Cajeros"/"Turnos Recientes"/6 headers |
| V16 | Live drift check — the mobile defect | viewport 390×844 on /POS | **HOLDS**: the reference still ships NO hamburger and the 220px z-50 STATIC sidebar — its own defect, unchanged; the clone's drawer superset remains correct (13/13 mobile e2e green) |
| V17 | NEW depth — the StoreSettings structure census | computed styles + DOM on /StoreSettings | **PARITY**: "Store Settings"/"Customize your business" h1; the six h3 sections (16px/700/slate-700 — the clone keeps readable colors, the documented a11y posture); the 16-label census byte-identical to the clone's set; 1 textarea; 2 color wells; Add 34px (px-3 py-1.5 rounded-lg ✓ the clone's pinned values); Save Changes 54px (14px 24px, 16px/500 ✓ Session-6 pin); Upload logo 14px/500 h42 ✓ (F-66) |
| V18 | NEW depth — the fiscal toggle | the "Hidden on receipt" control | the reference's affordance is a PLAIN BUTTON: `flex items-center gap-2 text-sm font-medium text-slate-600` + a 24px `lucide-toggle-left` svg (text-slate-400) + inline text — NO role=switch, NO aria state. The clone's Radix Switch (role=switch, labeled) is the documented a11y superset — same posture as the drawer and the readable headings. **Withdrawn as a finding** (record the measurement) |
| V19 | NEW depth — the New Category dialog | header Add → dialog open, computed styles | **PARITY (byte-level)**: 384px · rgb(15,18,26) #0f121a · 1px rgb(38,42,54) · 8px radius · 24px padding · title "New Category" 18px/600/#e7e9ef · label "Name" · input h-9 (36px)/12px/placeholder "e.g. Beverages" · Cancel/Create 42px/12px — every value matches the clone's dialog family (Session-11 F-64/F-66 + the clone's h-9 Input) |
| V20 | NEW depth — the select listboxes | the Currency + Card Payment Provider comboboxes opened, options enumerated | panel family PARITY (#161922, 6px radius, 1px #262a36, p-0; trigger role=combobox h-9 shadcn lineage). **TWO parity deltas in the LIST CONTENTS** (F-108/F-109 below): currencies = **USD - US Dollar, EUR - Euro, GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso** (the clone ships 8: the same first four + CAD/AUD/PEN/COP — **ARS missing**, CAD/AUD/PEN invented); providers = **None, Stripe, PayPal, Clip, Mercado Pago** (the clone ships none/Stripe/SumUp/Square — **PayPal/Clip/Mercado Pago missing**, SumUp/Square invented). Root cause: Session-101 recorded "USD/EUR/MXN/GBP/…" (implementation-plan §0/§seam — an ELLIPSIS, never enumerated) — the same unmeasured-assumption class as Session-14's chart colors |
| V21 | List-delta history | `git log -S` on currency.ts + the implementation plan | the 8-currency list landed in the initial domain commit `677c386` and was never re-measured; the plan's §0 line says only "Currency 'USD - US Dollar'" (the trigger text); no session ever enumerated the listbox |
| V22 | List-delta blast radius | `rg` for CURRENCIES/CARD_PROVIDERS across src/tests/prisma | contained: `validation.ts` refines through `isSupportedCurrency`/`isCardProvider` (the lists ARE the gate — replacing them updates validation automatically); `prisma/seed.ts` defaults USD/none (unaffected); `tests/unit/currency.test.ts` pins the lists — incl. `isCardProvider("PayPal")).toBe(false)` (line 29) and `cardProviderLabel("SumUp")` (line 31), both of which FLIP under the measured lists (the natural RED) |
| V23 | NEW depth — the populated-data dashboard (demo seed) | `db/demo.db` provisioned + `--demo` seeded (15 products, 5 categories, 1 register, 33 sales) → standalone build on :3200 → agent-browser DOM probes | stats populate ($0.00/0/15/3); the chart renders the SMOOTH C-curve, gradient area `url("#vpx-dash-sales")` @0.6, ZERO dots, nice y-ticks (0/20/40/60/80), 7 weekday labels, 5 category rows — **BUT both charts' curve PEAK floats ABOVE the topmost gridline** (Dashboard peak y=6.85 vs top gridline y=36.30; Reports peak y=5.44 vs $80-gridline y=28.26 — DOM-measured, the authority; the VLM eyeball read the Dashboard as "below", the S9 doctrine applies). Root cause: the charts map the domain to `ceil(dataMax)` (92) while `niceTicks` stops at the largest step multiple BELOW it (80) — the curve overshoots the last gridline into ungridded space. Recharts (the reference's engine) rounds the domain top UP to the nice multiple ≥ max. → **F-107** |
| V24 | F-107 e2e feasibility | `tests/e2e/global-setup.ts` read | the e2e db is seeded WITHOUT --demo (empty store by contract — dozens of empty-state pins depend on it: "Sin ventas", "No data yet", the flat-chart pins). A with-data e2e pin would break the suite's contract. **The with-data pin lives in the unit tier (the seam) + the evidence script (the demo-db boot)** — zero e2e collateral by design |
| V25 | Empty-state contract preservation check | hand-computed `niceScale` cases against the measured reference values | `niceScale(4, 5)` = `{top: 4, ticks: [0,1,2,3,4]}` — **byte-identical** to today's `niceTicks(4,5)` output = the reference's measured empty-state ticks; the F-50 pin and all five Session-14 chart pins measure values that do NOT change under the cure. Zero e2e collateral confirmed at the value level |

---

## 1. Findings

### The with-data cluster — the session_24 "Next" pointer's first half

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-107** | **MEDIUM** (with-data visual correctness on both primary charts — invisible to the empty-store e2e, exactly the predicted class) | `src/components/pos/shared.tsx` (LineChart + AreaChart) + a new seam in `src/lib/reports.ts` | Both charts compute the domain as `ceil(dataMax)` but draw gridlines via `niceTicks(niceMax, 5)`, which stops at the largest step multiple ≤ niceMax. On real data (demo: a $92 day) the domain is 92 but the top gridline is 80 — the curve's peak rises ~23–29px ABOVE the topmost gridline into ungridded space (DOM-measured on the demo db: Dashboard peak 6.85 vs gridline 36.30; Reports 5.44 vs 28.26). Recharts — the reference's engine — scales the domain to the nice ceiling ≥ max, so the peak always sits at/below the top gridline. Cure: a `niceScale(max, count) → {top, ticks}` pure seam (the domain top = the smallest nice-step multiple ≥ max; ticks 0..top on the same step); both charts adopt it. **Contract preservation (V25): `niceScale(4,5) = {4, [0,1,2,3,4]}` — the measured reference empty-state and every existing pin unchanged.** |

### The list-parity cluster — the Settings NEW depth

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-108** | **MEDIUM** (list parity on a measured Settings surface) | `src/lib/currency.ts` CURRENCIES | The reference's Currency listbox ships exactly **[USD - US Dollar, EUR - Euro, GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso]** (measured live, V20). The clone ships [USD, EUR, GBP, MXN, CAD, AUD, PEN, COP]: **ARS - Argentine Peso is missing**; CAD/AUD/PEN are inventions that trace to Session-101's unenumerated "USD/EUR/MXN/GBP/…" note (V21) — the same unmeasured-assumption class as the Session-14 chart colors. The lists are also the Zod validation gate (V22). Cure: replace with the measured 6 in the measured order; unit pins (exact-array + ARS label); e2e list pin (open the combobox, enumerate). |
| **F-109** | **MEDIUM** (same class) | `src/lib/currency.ts` CARD_PROVIDERS | The reference's Card Payment Provider listbox ships exactly **[None, Stripe, PayPal, Clip, Mercado Pago]** (V20). The clone ships [none, Stripe, SumUp, Square]: **PayPal, Clip, and Mercado Pago are missing**; SumUp/Square are inventions. Cure: replace with the measured 5 (code value `none` for None, per the existing convention); unit pins (the flipped PayPal/SumUp assertions are the RED); e2e list pin. |

### The static cluster

| ID | Severity | Location | Description |
|---|---|---|---|
| **SD-1** | **LOW** (dead dependency + a false doc claim) | `package.json` `@radix-ui/react-toast` + `velox-pos_SKILL.md:43` + `README.md:114` + `PAD:42` | The toaster has been pure zustand since the scaffolding (`toast.tsx` imports nothing Radix); the package has zero importers anywhere (V7) — it survived Session-14's purge because that cycle's V9 census misclassified it as load-bearing (the parenthetical "(react-slot/alert-dialog/dialog/label/select/switch/toast are load-bearing)" in `remediation-plan-session-14.md` — history, corrected on the record here). The SKILL's §2 primitives row, README's primitives row, and PAD's "never hand-rolled" toasts claim all attribute the toaster to Radix — false. Cure: `bun remove @radix-ui/react-toast` (the package manager owns the manifests); the three doc rows corrected in the same commit. |
| **SD-2** | **LOW** (dead dev dependency) | `package.json` `axe-core` | Zero code references across src/tests/scripts/prisma (V7; the only "axe" hits are the chart word "axes"). Added in the Omni-Study era (`4cde8db`, the "Lighthouse-equivalent sweep" commit) and never carried over. Cure: `bun remove axe-core`. |
| **SD-3** | **LOW** (stale code comment — doc-truth) | `src/components/pos/views/dashboard-view.tsx:6` | The header comment still says "the violet dotted-grid line chart" — the Session-14 rewrite made it the indigo smooth line over the slate dashed grid. Cure: the comment corrected in the same commit as F-107 (both touch the chart story). |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **The fiscal toggle** (V18): the reference ships a `lucide-toggle-left` icon-button with no switch
  semantics and no aria state; the clone's labeled Radix Switch is the documented a11y superset
  (the same posture as the mobile drawer and the readable heading colors). No change.
- **The New Category dialog** (V19): byte-parity with the clone on every measured value. No change.
- **The select panel family** (V20): #161922/6px/1px #262a36 — matches the pinned popover contract.
- **The Settings section/label/control census** (V17): parity throughout (six h3 sections, 16 labels,
  Add 34px, Save 54px, Upload 42px/14px-500).
- **The reference's h1 color** (slate-800 on dark — its own near-invisible defect): the clone keeps
  readable colors per the documented superset posture.
- **`react-dom`** (V7): no direct src import but peer-coupled to next — framework-required, not dead.
- **The reference's mobile defect** (V16): persists (no hamburger, 220px static sidebar at 390×844);
  the clone's drawer superset remains correct — 13/13 mobile e2e green.
- **The dev-db credential** (V9): the documented `$Abcd1234` verifies — no drift since the restore.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The seam first (§14 tier 1): `niceScale(max, count)` in `src/lib/reports.ts`** —
   `niceTicks`' sibling, sharing its step math; returns `{ top, ticks }` where `top` is the
   smallest nice-step multiple ≥ ceil(max) and `ticks` runs 0..top on the step. Guards mirror
   niceTicks (`≤0 → {0, [0]}`, `1 → {1, [0,1]}`). Pinned by NEW unit tests in
   `tests/unit/reports.test.ts` (the seam's home file — no new file, the FILES constant stays 14):
   the empty contract `niceScale(4,5) = {4, [0,1,2,3,4]}` (the measured reference state,
   byte-preserved), the with-data cure `niceScale(92,5) = {100, [0,20,40,60,80,100]}`,
   `niceScale(100,5) = {100, [0,20,...,100]}`, the 2.5-step family (`12 → {12.5, [0,2.5,...,12.5]}`),
   the guards (0/1), and the top-multiple property (top ≥ max AND top % step ≈ 0 AND the peak
   never exceeds the top gridline: `y(max) ≥ y(top)` in chart terms — asserted as
   `top ≥ max` with `top` on the step lattice).
2. **Both charts adopt the seam** (`shared.tsx`): `const scale = niceScale(max, 5)` →
   `niceMax = scale.top`, `gridLines = scale.ticks` — the ONLY changes inside the chart bodies;
   every color/geometry value stays exactly as pinned (the SVG-attribute doctrine). On the empty
   store the computed values are IDENTICAL (V25) — zero e2e collateral, proven at the value level
   before the code moves.
3. **F-108/F-109: the measured lists replace the invented ones** in `src/lib/currency.ts` —
   CURRENCIES = the reference's six in the measured order; CARD_PROVIDERS =
   `["none", "Stripe", "PayPal", "Clip", "Mercado Pago"]`. No invented extras are kept: these
   weren't superset features, they were unmeasured guesses (the Session-14 violet→indigo precedent
   — the measurement REPLACES the assumption). Validation updates itself through the existing
   refines (V22); the seed's USD/none defaults stay valid; no stored rows reference the dropped
   values.
4. **SD-1/SD-2 via the package manager only**: `bun remove @radix-ui/react-toast axe-core` —
   never hand-editing package.json/bun.lock. Proof: the census re-run (zero importers for both,
   all remaining deps live), tsc/lint/build green, and the three doc rows corrected (SKILL §2,
   README §architecture primitives row, PAD §stack primitives row — plus this plan's V7 note that
   the session-14 V9 classification is corrected on the record).
5. **SD-3**: the `dashboard-view.tsx` header comment corrected in the F-107 slice (one chart story,
   one commit).
6. **Count-lockstep (mechanical)**: unit +6 tests (reports.test.ts) + the currency.test.ts rewrites
   (net +1 test: 2 describes → 4 tests) → UNIT 138→145, FILES stay 14; e2e +2 tests (the two
   list pins in surfaces.spec, appended after the select-trigger pin at line 432) → E2E 102→104,
   desktop 88→90. The constants AND every doc site riding them (README badges/tables, CLAUDE,
   AGENTS, PAD, SKILL §3/§12, vitest.config's header, the gate's own pinned literals
   "Session-14 lock" → "Session-15 lock", "88 desktop" → "90 desktop") re-anchor in the SAME commit.
7. **The evidence tier carries the with-data proof** (V24): `scripts/capture-s15-evidence.mjs` boots
   the standalone build on a demo-seeded scratch db (the V23 pattern) and DOM-pins the with-data
   contracts: the peak below the top gridline on BOTH charts, the full list parity of both
   select listboxes, the F-76 drift spot-check, the mobile drawer, plus the unit-tier census
   proofs. Screenshots continue at 77 (75/76 are this cycle's PRE-fix audit captures — kept as
   the finding's visual record, the 71-precedent).

### The RED pins

- **Unit (reports.test.ts, +6)**: the niceScale contract set above — RED at import (the seam
  does not exist).
- **Unit (currency.test.ts, rewritten)**: exact-array pins for both measured lists; the ARS label
  pin (`currencyLabel("ARS") === "ARS - Argentine Peso"`); the FLIPPED provider assertions
  (`isCardProvider("PayPal") === true`, `isCardProvider("SumUp") === false`,
  `cardProviderLabel("Clip") === "Clip"`) — RED against the current lists (the PayPal pin fails
  today, proving the measurement gap live).
- **E2E (surfaces.spec.ts, +2)**: (1) open the Currency combobox → the six options enumerate in
  the measured order; (2) open the Card Payment Provider combobox → the five options in the
  measured order. RED against the current build (ARS absent, PayPal absent).
- **The with-data scale pin is NOT e2e** (V24 — the empty-store contract stands); its proof is
  the unit tier + the evidence script's demo-db boot.

---

## 3. Execution order

1. RED: the unit pins (reports.test.ts + the currency.test.ts rewrite) → the 2 e2e list pins →
   the RED proof: exactly the targeted failures at both tiers, zero collateral (the s14 lesson:
   prove the unit RED first, hold the unit test aside for the e2e RED build if it blocks tsc).
2. GREEN in vertical slices (skills/tdd): `niceScale` + its pins → both charts adopt the seam →
   the currency.ts lists → the unit gate (the docs-counts gate fires → re-anchor in-commit) →
   SD-1/SD-2 (`bun remove` × 2) → SD-3 (the comment) → lint + tsc + build.
3. The full gate on the final tree: lint 0 · tsc · unit 145/145 (14 files) · build · smoke 13/13 ·
   e2e 104/104.
4. Evidence: `scripts/capture-s15-evidence.mjs` (the demo-db boot + the list parity + the drift
   spot-checks + the drawer) + screenshots 77+ → docs/screenshots/.
5. Docs lockstep: AGENTS.md (the Session-15 contract section), CLAUDE.md (the seam entry + the
   measured lists), PAD v1.13 (revision block), velox-pos_SKILL.md v2.11.0 (§2 rows corrected +
   the list row + the Session-15 addendum), README (counts + the primitives row), the
   implementation plan's §0/§seam list lines, the repo worklog's Session-15 entry,
   `docs/session_25.md` (the narration), `.env.example` re-verified against `.env`.
6. Commit (`fix(session-15)` + `update session log`) on main → push via the SSH wrapper
   (docs/ssh_git_wrapper_v3.py per its SKILL) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **RED proven at both tiers.** Unit: 10/10 targeted failures — the 6 niceScale pins
  at import (the seam absent) + 4 currency assertions (the exact-array pin, the ARS
  label, the flipped `isCardProvider("PayPal")`/`SumUp` pair — the flipped pin proving
  the measurement gap live). The s14 two-tier-RED lesson applied verbatim: the unit
  test was held aside (git stash) for the e2e RED build (a unit-tier import of a
  nonexistent export blocks `next build`'s tests/ type-check), restored for GREEN.
- **E2E RED: both list pins failed on their exact-enumeration assertions** (the only
  passes: the setup sign-ins) — zero collateral.
- **One blast-radius site the V22 census missed**: `validation.test.ts:114`'s
  `cardProvider: "PayPal"` REJECTED pin — the same unmeasured assumption baked into a
  test. Found by the unit gate itself on the first GREEN run; corrected with the
  measured contract (PayPal accepted; the invented SumUp is the rejection case). The
  lesson: when a list-valued seam changes, sweep the TEST files for the old values,
  not just the source.
- **GREEN landed in vertical slices**: the `niceScale` seam (+ its 6 pins, all green on
  first run — the math validated against the real seam before the code moved) → both
  charts adopted it (the only body changes: `niceMax = scale.top`, `gridLines =
  scale.ticks`) → the currency.ts measured lists → the count-lockstep gate fired
  exactly as designed (146/14/104 vs 138/14/102) → the constants + every live-tense
  doc site re-anchored (README badges/tables/testing block, CLAUDE baselines, PAD
  scale line + tiers, SKILL header/§3/§12, the gate's own "Session-15 lock"/"90
  desktop" literals) → SD-1/SD-2 via `bun remove` (both gone from the manifest, the
  ui census still 10) → SD-3 (the stale dashboard-view comment) + the stale
  README "dotted-grid parity" charts row found during the lockstep.
- **Full gate on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc
  clean · unit **146/146** (14 files) · build green · smoke **13/13** · e2e
  **104/104** (2.3m; the two list pins riding the 102 baseline, nothing weakened).
- **Live evidence (`scripts/capture-s15-evidence.mjs`): 14/14 PASSED** — the with-data
  scale contracts on the demo-seeded db (Dashboard peak y=25.9 BELOW the 100-gridline
  at y=5.0, ticks [0,20,40,60,80,100] covering the domain; Reports peak 20.2 below
  the $100-gridline at 4.0), both listboxes byte-exact in order, the dead-dep census
  (manifest clean, 10 ui files, the toaster zustand-only), the F-76 drift spot-check
  (the oklab-alpha posture, as documented), and the mobile drawer (dialog, 8 links,
  zero overflow). Two script-infrastructure fixes mid-run, zero checks weakened: (1)
  Playwright evaluate args are JSON-only — the shared probe inlined as a `new
  Function` body; (2) the F-76 wait re-scoped to `main.login-canvas [role=alert]`
  (trap #28: the unscoped FIRST alert is Next's route announcer).
- **VLM cross-check: 4/4** on the post-fix captures (both peaks within the grid, the
  currency listbox's six in order, the drawer). Screenshots **75–80**: 75/76 the
  pre-fix audit record (the finding's visual evidence), 77–80 the cured state.
- **Docs lockstep**: this plan's record, AGENTS.md (the with-data + list-parity
  contracts section), CLAUDE.md (the niceScale entry + the measured-lists entry),
  PAD v1.13 (revision block + scale line + the corrected primitives row),
  velox-pos_SKILL.md v2.11.0 (§2 rows, §seam rows, the Session-15 addendum), README
  (counts + the corrected primitives/charts rows), the implementation plan's §0
  StoreSettings row + §seam currency row (both now carry the measured lists), the
  repo worklog's Session-15 entry, and `docs/session_25.md` (the narration).

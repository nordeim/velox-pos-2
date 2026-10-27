# VeloxPOS Remediation Plan — Session-14

**Date:** 2026-10-27 (Session-14 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-13 tree (HEAD `fdd2704`
= `2c88a91` + the operator's session-log commit). A full received-tree gate re-verification, a live
reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law — EIGHTH
consecutive cycle, zero drift on every standing pin), this cycle's NEW-depth audit — **the chart
internals, never measured in any prior session: the Dashboard's "Sales — Last 7 days" chart and the
Reports "Daily Sales" chart, decoded live at the computed-style AND DOM-attribute layer (the
reference ships TWO distinct chart contracts, exactly as it ships two alert families)** — plus the
web-application §15 **fresh-clone pristine-path verification** (a periodic gate of its own, first
run on this repo), and the static sweep this cycle's zero-importer census surfaced: **12 dead
shadcn-style UI primitives + the 9 Radix packages that serve only them**.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate — the fresh-clone
doctrine lives there, §16 security), skills/agent-browser (live computed-style measurement —
computed styles are ground truth), skills/tdd (red → green, vertical slices), the
count-lockstep doctrine (docs-counts gate), VLM cross-verification for the visually-loaded
findings (the repo's own vlm-verify script lineage).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull` on the provisioned Session-13 workspace (fast-forward `2c88a91..fdd2704`, brings in the operator's `docs/session_22.md` — the raw log of the Session-13 conversation; its "Next" pointer names this cycle's NEW-depth targets) | clean tree @ `fdd2704`; environment intact (.env contract `DATABASE_URL="file:../db/custom.db"`, db/ at the root with custom/e2e/smoke dbs, 485 pkgs, agent-browser 0.39.0) |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning: `no-location-assign` in login-surface.tsx, the known cookie-commit race workaround) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Standalone build | `bun run build` | green — the full route table renders (all 8 views + auth surfaces; `/reset-password` Dynamic per its searchParams contract) |
| V4 | Smoke suite | `./scripts/smoke-test.sh` | **13/13** — incl. the hygiene probe (no .env/db/skills/docs/tests in the standalone artifact) and the no-secret boot refusal |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **97/97** (2.2m) — the Session-13 lock holds (83 desktop + 13 mobile + 1 setup) |
| V6 | Secrets scan | `rg` for credentials/keys across the tracked tree (docs session logs and lockfile excluded) | clean — the only hits are the operator's own DOCUMENTED demo credentials (README quick-start + prisma/seed.ts, by design since Session-101) and the ssh wrapper's `[REDACTED:ssh_private_key]` marker |
| V7 | Repo-hygiene census | `ls scripts/` + globals/tokens hex-pin count | 12 keepers (smoke + s7..s13 evidence + 4 vlm scripts — the Session-13 keep-list + that cycle's own capture script, consistent); 148 hex pins in globals.css; the red ramp incl. the Session-13 `red-800 #991b1b` pin |
| V8 | Zero-importer census (src) | a single-pass Node sweep (every module specifier across src + tests collected, diffed against the file census) + a per-primitive `rg` confirmation | **12 dead UI primitives**: avatar, badge, card, checkbox, dropdown-menu, popover, progress, separator, skeleton, slider, tabs, tooltip — zero importers in src/ AND tests/; the live set is exactly 10 (alert, alert-dialog, button, dialog, input, label, select, switch, textarea, toast). Framework entries (root layout/not-found/robots/sitemap/instrumentation) correctly excluded |
| V9 | Dead-dependency map | `rg '@radix-ui/react-'` across src/ diffed against package.json | **9 Radix packages serve ONLY the dead primitives**: react-avatar, react-checkbox, react-dropdown-menu, react-popover, react-progress, react-separator, react-slider, react-tabs, react-tooltip (react-slot/alert-dialog/dialog/label/select/switch/toast are load-bearing) |
| V10 | Docs-claims check for the dead set | `rg` per primitive name across AGENTS/CLAUDE/README/PAD/SKILL | ZERO primitive claims — the 88 "card"/7 "badge"/6 "popover"/2 "skeleton" doc mentions are all domain language ("the login card", "the sign-in skeleton"); the only `components/ui` cites are the LIVE alert primitive. The deletion has no docs blast radius beyond the PAD's component-tree ellipsis (already accurate) |
| V11 | Session-13 code review (Mode C) | full reads of `alert.tsx`, `reset-password-surface.tsx` | clean — the measured contracts are inline-documented with dates, the hydration gate matches the login surface's pattern, the tone families are separated exactly as measured; no quality findings |
| V12 | Live drift check — the login card | agent-browser on `veloxposen.base44.app/login` (logged out), computed styles | **HOLDS** (8th cycle): blur(4px) · bg rgba(255,255,255,0.95) · radius 16px · the 4px slate-gradient top strip (slate-200→slate-300) · h1 30px/700/slate-900 · SSO 54px · inputs 48px |
| V13 | Live drift check — the F-76 error alert | wrong-credentials submit on the reference login | **HOLDS byte-exact**: "Invalid email or password" · 12px radius · red-50/0.7 · 1px red-200 · 16px padding · inner 14px red-700 rgb(185,28,28) |
| V14 | Live drift check — the sidebar + terminal gate | computed styles post-login | **HOLDS**: 220px nav · 8 links · the 42px active pill violet-600/0.2 @12px · "No active shift" gate + CART + disabled CHARGE $0.00 |
| V15 | Live drift check — the Spanish families | Sales + Cashiers sweeps | **HOLDS**: "Historial de Ventas" / "0 ventas registradas" / the 7 table headers / "Sin ventas"; "Cajeros" / "0 usuarios registrados" / "No hay usuarios registrados" / "Turnos Recientes" / the 6 table headers |
| V16 | Live drift check — the Dashboard date line | computed styles on /Dashboard | **HOLDS**: "Tuesday, October 27, 2026" · 14px · slate-500 rgb(100,116,139) |
| V17 | Live drift check — the mobile defect | viewport 390×844 | **HOLDS**: the reference still ships NO hamburger and a 220px z-50 STATIC sidebar — its own defect, unchanged since first measurement; the clone's drawer superset remains the correct posture |
| V18 | NEW depth — the Dashboard chart, full decode | computed styles + DOM attributes on the "Sales — Last 7 days" SVG (empty-data state, the only measurable state on the write-gated reference) | the contract below (F-95..F-101): indigo-500 line, slate grid/axes, the gradient area, zero dots, plot geometry — **never measured in any prior session** (Session-6's F-50 measured only the tick count/fonts/weekday labels) |
| V19 | NEW depth — the Reports chart, full decode | same method on the "Daily Sales" SVG at 1440×900 | the contract below (F-102..F-106): a SECOND, distinct chart family — white/4% grid, white/30% 11px ticks, indigo 2px, gradient 0.35@5% |
| V20 | VLM cross-verification | `z-ai vision` on the reference Dashboard screenshot | confirms the visually-loaded claims: the line reads blue-INDIGO (not violet), the gridlines dotted-dim, the solid axis lines present, NO data dots — and notes the gradient area is invisible at zero data (a flat line has no area), so the area fill's VISUAL contract is a with-data behavior; its DOM contract (the gradient def + fill-opacity 0.6) is measured directly |
| V21 | Chart-card + layout parity | the reference's chart card + main widths at 1440×900 | the chart card is the SAME glass family (rgba(16,18,32,0.9) — the clone's glass-card matches byte-exactly); main 1220px; the reference's chart svg is container-responsive (viewBox width 731 at this state) with FIXED px paddings and flat 12px fonts — the clone's chart box computes to ~731px at the same state, so a 731-wide viewBox renders 1:1 at the e2e viewport |
| V22 | Fresh-clone pristine-path verification (web-application §15) | local clone of HEAD → `bun install` → `cp .env.example .env` → `db:push` → `db:seed` → `typecheck` → `build` → standalone boot + health + /login | **PASS end-to-end**: 485 pkgs from the lockfile · owner seeded · `db/custom.db` lands at the clone's root (the relative-URL contract verified on a pristine tree) · tsc clean · build green · standalone serves `{"status":"ok","db":"up"}` and /login 200 |
| V23 | The boot guard on the pristine path | the pristine first boot WITHOUT AUTH_SECRET | refuses with the documented fatal message (the §5 enforcement; smoke step 12's contract) — after setting the secret per the README quick-start, the boot succeeds. The pristine path works EXACTLY as documented |
| V24 | Clone-side delta map | full reads of `shared.tsx` (LineChart/AreaChart), dashboard-view, reports-view + the existing pins in terminal.spec/surfaces.spec | the findings' delta table (below); the existing pins are structural only (nice ticks, 7 weekday labels, 12px x-font, area-chart visibility) — no color/dash/line pin exists to break; the F-50 pin's `x < 34` y-label filter encodes the CLONE's own current padding and must be corrected to the measured plot edge (x < 65) in the same commit |

---

## 1. Findings

### The NEW-depth cluster — the chart internals (measured live 2026-10-27)

**The headline: the clone's two charts were never color-measured.** Session-6's F-50 decoded the
tick discipline (nice ticks, ~5 steps, 12px fonts, weekday x labels) and Session-101 implemented
"dotted grid + violet stroke" — an unmeasured assumption that survived 13 cycles because no session
ever swept the chart internals. The reference ships TWO distinct chart contracts (its own
pattern: two alert families, two stat families, two chart families), and BOTH differ from the
clone's single violet/dotted treatment.

**The reference's Dashboard chart ("Sales — Last 7 days"), measured at 1440×900 (empty-data state):**

| Aspect | Reference (measured) | Clone (current) | Finding |
|---|---|---|---|
| Line | **indigo-500 #6366f1** rgb(99,102,241), `stroke-width 2.5`, `fill none`, smooth monotone **C-curve** (`M65,245C95.833,245,…` — control points at 1/3·2/3 of each span) | `#8b5cf6` violet-500, 2.5, straight `L` segments | **F-95** |
| Gridlines | **slate-200 #e2e8f0**, 1px, `stroke-dasharray 3px 3px` — 12 total (5 horizontal at the y-ticks + 7 vertical at the day ticks) | `rgba(255,255,255,0.16)`, dash `2 4` (dotted) | **F-96** |
| Axes | **2 full-length slate-400 #94a3b8 axis lines** (x: 65,245→726,245; y: 65,5→65,245) + **12 slate-400 tick lines** (x-ticks 245→251, i.e. 6px below the axis; y-ticks mirrored left) | none (no axis lines, no tick lines) | **F-97** |
| Tick text | **12px slate-400 #94a3b8** — x labels middle-anchored ON the ticks (baseline y=253), y labels END-anchored at x=57 | 12px, `fill-white/40`(y)/`50`(x) utilities | **F-98** |
| Area | a gradient area path under the line: `url(#salesGrad)` — **indigo-500 0.3 @5% → 0 @95%**, path `fill-opacity 0.6` | none (line only) | **F-99** |
| Data dots | **ZERO circles** (no point markers) | r=3 violet dots with `<title>` tooltips | **F-100** |
| Plot geometry | viewBox **`0 0 731 280`** (container-responsive; 731 at the e2e-state viewport) · plot **x=65, y=5, w=661, h=240** · axis baseline y=245 · right pad 5 · bottom pad 35 | viewBox `0 0 720 260`, pads {14,14,28,34} | **F-101** |

**The reference's Reports chart ("Daily Sales"), measured at 1440×900:**

| Aspect | Reference (measured) | Clone (current) | Finding |
|---|---|---|---|
| Line | **indigo-500 #6366f1**, `stroke-width 2`, smooth C-curve | `#8b5cf6`, 2.5, straight | **F-102** |
| Gridlines | **`rgba(255,255,255,0.04)`** (white at 4%), 1px, dash `3px 3px`, 14 (5 horizontal + verticals at the labeled buckets) — NO slate axes here | `rgba(255,255,255,0.14)`, dash `2 4` | **F-103** |
| Tick text | **11px `rgba(255,255,255,0.3)`** (white/30) — y ticks `$0..$4` (the $ prefix ✓ already correct), x ticks `d MMM` dates ("28 Sep" ✓ already correct) thinned ~8 across the window | 11px, `fill-white/40`/`50` | **F-104** |
| Gradient | **indigo-500 0.35 @5% → 0 @95%**, area `fill-opacity 0.6` | violet 0.35 @0% → 0.02 @100% | **F-105** |
| Plot geometry | viewBox **`0 0 1130 220`** (responsive; 1130 at this viewport) · clip **x=60, y=4, w=1066, h=186** · baseline y=190 · right pad 4 · bottom pad 30 | viewBox `0 0 1080 280`, pads {16,16,30,44} | **F-106** |

Severity: **MEDIUM** across the cluster (visual parity on a primary surface — the Dashboard is the
post-login landing view and the Reports chart is that view's centerpiece; the divergence is
color-family-level, visible on every render, and the clone currently reads "violet" where the
reference reads "indigo").

**Method notes for the record:**
- The reference's charts are **container-responsive** (recharts-style: the viewBox width tracks the
  container; the paddings/fonts stay fixed px). The earlier 625-wide Dashboard snapshot and this
  cycle's 731-wide one are the same chart at different container states; the FIXED values are the
  paddings (65/5/245), the height (280), the fonts (12px), and the families (colors/dash).
- The odd "black 555×240 rect" in the Dashboard chart's DOM is the **clipPath def rect** (never
  painted) — the same element class the clone's plot box mirrors.
- The area gradient is invisible at zero data (a flat line bounds no area) — the DOM contract is
  measured directly; the visual claim is VLM-cross-checked (V20).

### The static finding

| ID | Severity | Location | Description |
|---|---|---|---|
| **SD-1** | **LOW** (dead code — the SD-2 doctrine applied to the primitive layer) | `src/components/ui/{avatar,badge,card,checkbox,dropdown-menu,popover,progress,separator,skeleton,slider,tabs,tooltip}.tsx` + 9 Radix deps | Twelve shadcn-style primitives with ZERO importers across src/ and tests/ — the Session-13 sweep (V18 there) swept `src/lib` + the pos components but the ui/ layer kept its scaffolding-era full set. tsc type-checks all twelve on every gate run; nine Radix packages exist in package.json/bun.lock solely to serve them. The live set is exactly 10 files (V8/V9); no doc claims the dead twelve (V10). Cure: delete the 12 files, `bun remove` the 9 packages (the package manager owns the manifests), full-gate proof. |
| **SD-2** (found mid-execution) | **LOW** (dev-db state drift — a documentation-truth defect) | `db/custom.db` (git-ignored dev state) + the Session-13 evidence script's record | The Session-13 evidence run's "full one-shot reset round-trip" typed its own form-fill constant **"Abcd1234!"** into the reset form — silently changing the dev db's owner password. The s13 plan's "the owner's password rewritten to its current value — no state change" claim was **wrong** (right intent, wrong constant): every cycle after Session-13 ran with credentials contradicting the README's documented `$Abcd1234` quick-start contract. Found this cycle when the evidence script's UI login 401'd; hash-verified live ("Abcd1234!" matched, "$Abcd1234" did not). Cure: `scripts/restore-owner-password.mjs` restores the documented credential through the repo's own hashPassword scheme, control-verifies the drifted state first, and end-to-end verifies the restore. Lesson recorded: evidence scripts that mutate auth state must assert the post-state against the DOCUMENTED credential, not just "done". |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **The reference's chart-card glass family** — matches the clone's glass-card byte-exactly
  (rgba(16,18,32,0.9), the white/7 border): no finding.
- **The stat-card widths** (241px on the reference at one state) — the cards are
  container-responsive and the clone's grid computes to the same family; the existing pins are
  family-level and hold. No width pin added (the §14 count/size-dependence rule).
- **The pristine path** — PASSES (V22/V23). The boot-guard refusal without AUTH_SECRET is the
  documented §5 enforcement, not a defect.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The pure seam first (§14 tier 1): a `smoothPath()` helper** in shared.tsx — a
   monotone-X cubic (the Fritsch-Carlson tangent family, the d3 curveMonotoneX lineage) that
   produces C-segment paths through the points. Pinned by NEW unit tests (tests/unit/
   chart-path.test.ts): flat data reproduces the reference's measured D shape exactly
   (controls at 1/3·2/3 spans — the `M65,245C95.833,245,126.667,245,157.5,245` pattern),
   monotone data never overshoots (the monotone property), and the 1-point/2-point edges stay
   degenerate-safe. RED at the unit tier: the tests import a module that does not exist yet.
2. **`LineChart` (Dashboard) rewrites to the measured contract**: viewBox `0 0 731 280`,
   plot x=65 y=5 w=661 h=240, axis baseline y=245, right pad 5; gridlines slate-200 `#e2e8f0`
   1px dash `3 3` (5 horizontal at the y-ticks + 7 vertical at the day ticks); 2 slate-400
   `#94a3b8` axis lines (x 65,245→726,245; y 65,5→65,245) + 12 tick lines (x-ticks 245→251,
   y-ticks mirrored); tick text 12px `#94a3b8` (x middle-anchored baseline 253, y end-anchored
   x=57); the line `#6366f1` 2.5 through `smoothPath()`; the gradient area
   (`vpx-dash-sales`: indigo 0.3@5% → 0@95%, path fill-opacity 0.6); **zero dots** — the
   svg keeps `role="img"` + `aria-label` (the a11y superset posture survives; the per-dot
   `<title>` tooltips go with the dots, exactly as the reference ships).
3. **`AreaChart` (Reports) rewrites to its own measured contract** (a different family, as
   measured): viewBox `0 0 1130 220`, clip x=60 y=4 w=1066 h=186, baseline y=190; gridlines
   `rgba(255,255,255,0.04)` 1px dash `3 3` (horizontal at the y-ticks + vertical at the
   labeled buckets); NO axis lines; ticks 11px `rgba(255,255,255,0.3)`; line `#6366f1` 2
   `smoothPath()`; gradient `vpx-reports-sales` indigo 0.35@5% → 0@95%, fill-opacity 0.6.
   The y `$`-prefix and the `d MMM` x labels stay (already correct).
4. **Colors are SVG attributes/inline stops, not Tailwind utilities** — `stroke="#6366f1"`,
   `fill="#94a3b8"`, literal gradient stops. No v4 oklch serialization touches the charts
   (the F-62 hex-pin doctrine applies to `@theme` tokens; the charts bypass the cascade
   entirely). The one utility that changes meaning: the tick `fill-white/40` classes become
   attribute fills with the measured literals.
5. **The existing F-50 pin's filter corrects** from `t.x < 34` to `t.x < 65` — the old value
   encoded the clone's own current padding; the measured plot edge is 65 (V24). The pin's
   REAL assertions (nice ticks <8, first label "0", 7 weekday labels, 12px) are untouched —
   no prior pin weakened.
6. **SD-1 execution order**: delete the 12 files, then `bun remove @radix-ui/react-avatar
   @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-popover
   @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slider
   @radix-ui/react-tabs @radix-ui/react-tooltip` — never hand-editing package.json/bun.lock.
   Proof: the zero-importer census re-run (exactly the 10 live files remain), tsc/lint/build
   green, and the docs-counts gate's constants unaffected (no route/model/view/spec counts
   change).
7. **Count-lockstep (mechanical)**: +U unit tests (chart-path, new file → UNIT_FILES 13→14),
   +5 e2e tests (4 Dashboard-chart pins in terminal.spec + 1 Reports-chart pin in
   surfaces.spec → E2E 97→102, desktop 83→88). The constants AND every doc site riding them
   (README, CLAUDE, AGENTS, PAD, SKILL §3/§12 + the gate's own pinned literals
   "Session-13 lock" → "Session-14 lock", "83 desktop" → "88 desktop") re-anchor in the SAME
   commit — the gate fires otherwise, by design.
8. **No mobile pin this cycle** (same posture as the rest of the chart pins): the mobile
   project runs mobile-navigation.spec only; the chart pins are desktop-project tests.

### The RED pins (5 new e2e tests + the unit tier)

- **dashboard-chart.spec pins (terminal.spec.ts, 4 tests):**
  1. the line family (F-95): the chart's line path computes `rgb(99, 102, 241)`, stroke-width
     `2.5`, fill `none`; the path's `d` carries C segments (smooth); **zero `circle` elements**
     (F-100 rides here).
  2. the grid + axes family (F-96/F-97): gridline census by computed stroke — exactly 12
     `rgb(226, 232, 240)` lines with dasharray `3px 3px`; exactly 14 `rgb(148, 163, 184)` lines
     (2 spanning >100px + 12 short ticks).
  3. the gradient area (F-99): an area path with `fill` `url(#…)` + `fill-opacity 0.6`; the
     linearGradient's stops measure stop-opacity 0.3 @5% and 0 @95%.
  4. the plot geometry + ticks (F-98/F-101): viewBox `0 0 731 280`; the "0" y-tick end-anchored
     at x=57; the "Wed"-family x labels 12px `rgb(148, 163, 184)`; the axis baseline at y=245.
- **reports-chart pin (surfaces.spec.ts, 1 test):** the line `rgb(99, 102, 241)` width 2;
  gridlines `rgba(255, 255, 255, 0.04)` dashed; ticks 11px `rgba(255, 255, 255, 0.3)`; the
  gradient stops 0.35@5% → 0@95% with area fill-opacity 0.6; viewBox `0 0 1130 220`.
- **unit tier:** tests/unit/chart-path.test.ts (RED: module absent) — flat-data D-shape,
  monotone no-overshoot, degenerate edges.

---

## 3. Execution order

1. RED: the unit pins (chart-path) → the 5 e2e pins + the F-50 filter correction →
   standalone build → RED proof: exactly the targeted failures, zero collateral.
2. GREEN in vertical slices (skills/tdd): `smoothPath()` + its unit pins → `LineChart` →
   `AreaChart` → lint + tsc + unit (the docs-counts gate fires → re-anchor in-commit) → build.
3. SD-1: the 12 deletions + `bun remove` the 9 packages → the census proof → build again.
4. The full gate on the final tree: lint 0 · tsc · unit (133+U)/(133+U) · build · smoke 13/13 ·
   e2e 102/102.
5. Evidence: `scripts/capture-s14-evidence.mjs` (the standing pattern — live checks against the
   remediated build: the two chart contracts computed end-to-end, the SD-1 census, the drift
   spot-checks) + screenshots → docs/screenshots/.
6. Docs lockstep: AGENTS.md + CLAUDE.md (the chart contracts + the primitive census), PAD v1.12
   (revision block + re-certification), velox-pos_SKILL.md v2.10.0 (§6 chart family rows, §12
   testing counts, the Session-14 addendum), README (the counts + the chart bullet), the repo
   worklog's Session-14 entry, `docs/session_23.md` (the narration), `.env.example` re-verified
   against `.env`.
7. Commit (`fix(session-14)` + `update session log`) on main → push via the SSH wrapper
   (docs/ssh_git_wrapper_v3.py per its SKILL) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **RED proven at both tiers.** Unit: the chart-path pins failed 5/5 at import (the
  `smoothPath` seam did not exist yet) — and surfaced a REAL infrastructure lesson: `next
  build` type-checks `tests/` too, so a unit-tier RED pin blocks the standalone build needed
  for the e2e RED; the unit test was held aside for the e2e RED proof and restored for GREEN
  (the order for any future two-tier RED: prove the unit RED first, then hold it while the
  e2e RED runs against the pre-fix build).
- **E2E RED: exactly the 5/5 targeted failures, zero collateral** — the Dashboard line-family
  test and the Reports family test failed in the combined run (serial mode then skipped the
  three later Dashboard siblings); each of the three was proven failing individually
  (grid/axes, gradient area, plot geometry) — every failure on its own targeted assertion,
  the only passes being the setup project's sign-in runs.
- **GREEN landed in vertical slices.** The `smoothPath` seam first (Fritsch-Carlson tangents
  + the limited-slope clamp), unit-pinned 5/5 — with one pin corrected DURING green-up: the
  extremum test's D-string regex pinned the float serializer (`10/3` ends in 5), not the
  property; rewritten as numeric assertions on the control points (the zero-tangent
  signature). Then `LineChart` and `AreaChart` rewritten to their measured contracts. Then a
  doctrine correction found in review: the seam initially lived in shared.tsx, but the unit
  tier's "nothing here imports React" claim (vitest.config's own header) demanded a pure
  `src/lib` home — `src/lib/chart-path.ts` created, shared.tsx imports it, the test import
  re-pointed.
- **SD-1 executed**: 12 primitives deleted, `bun remove` took the 9 exclusively-dead Radix
  packages — the census proof (exactly the 10 live files) rides the evidence script.
- **The count-lockstep gate fired exactly as designed** (138/14/102 against 133/13/97): the
  constants re-anchored together with EVERY live-tense site — the gate's own two literals
  ("Session-14 lock", "88 desktop"), vitest.config's header, the README badges/table/tree/
  quick-start, CLAUDE's two baselines, AGENTS' registry line, the PAD's scale line + testing
  tiers + file tree, and the SKILL's header/§3/§12. History blocks kept their numbers by
  design.
- **Two mid-GREEN pin fixes, both serialization postures, zero assertions weakened**: (1)
  Chromium computes SVG gradient fills as `url("#id")` — quoted; both area pins corrected to
  the quoted form (the reference's own computed fill measured identically). (2) The F-50
  pin's `x < 34` y-label filter corrected to the measured plot edge `x < 65` as planned.
- **SD-2 found and cured mid-evidence** (see the findings table): the evidence script's UI
  login 401'd → hash-verified the drifted credential → `scripts/restore-owner-password.mjs`
  restored `$Abcd1234` with a control test + end-to-end verification.
- **Full gate on the final tree: GREEN** — lint 0 errors (1 documented warning) · tsc clean ·
  unit **138/138** (14 files) · build green · smoke **13/13** · e2e **102/102** (97 + the 5
  chart pins; the serial-skip geometry test green on its individual run and in the full suite).
- **Live evidence (`scripts/capture-s14-evidence.mjs`): 14/14** — both charts' full contracts
  computed end-to-end (the indigo line families at 2.5/2px, the slate vs white/4% grids, the
  axes + tick stubs, the gradient areas at 0.3/0.35 @5% → 0 @95% under fill-opacity 0.6, the
  plot geometries, zero dots), the SD-1 census (10 files, 9 deps gone), the F-76 drift
  spot-check (the oklab-alpha posture, as documented), and the mobile drawer. Screenshots
  **71–74** (the reference measurement, the Dashboard chart, the Reports chart, the drawer).
- **VLM parity cross-check**: the clone's Dashboard chart matches the reference's on all four
  contract axes (line family, dashed grid, axis structure, no dots); the only visible delta
  is the container-responsive width at different capture viewports — the internal contract is
  the pinned part.
- **Docs lockstep**: this plan's record, AGENTS.md (the chart-contract section + the purge +
  the SD-2 lesson), CLAUDE.md (the chart seam entry), PAD v1.12 (revision block + the ui-tree
  line + the stale `date` seam entry cured), velox-pos_SKILL.md v2.10.0 (§6 chart rows, the
  Session-14 addendum), the repo worklog's Session-14 entry, and `docs/session_23.md`.

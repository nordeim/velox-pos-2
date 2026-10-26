# VeloxPOS Remediation Plan — Session-10

**Date:** 2026-10-27 (Session-10 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-9 tree (HEAD `daa74af`
= `9cc8b24` + the operator's session-log commit). A full received-tree gate re-verification,
a live reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law —
FOURTH consecutive cycle), a local-vs-reference parity audit that this cycle went deeper than
computed chrome (whole-DOM dumps of the stat-card families, the empty-state treatments, the
muted-tone substitution family), the static Tailwind-v4 trap sweep, the mobile-drawer live
contract check, a recent-changes audit (the Session-9 commits), and a security/invariant scan.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16 security),
skills/agent-browser (live computed-style measurement), skills/tdd (red → green),
skills/clone-app-pat-pro (computed styles as ground truth; the reference's own DOM/classes as
the contract at parity depth).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the workspace had been reset) + `cp .env.example .env` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"` per the contract) + `bun install` + `db:push` + `db:seed -- --demo` (15 products / 5 categories / 1 register / 33 sales) + `bunx playwright install chromium` (1243, per the lockfile's Playwright 1.63.0) | environment fully provisioned |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Build + smoke on the received tree | `bun run build` + `./scripts/smoke-test.sh` | build green (hygiene-clean artifact) · smoke **13/13** |
| V4 | E2E on the received tree | `CI=1 bun run test:e2e` (both projects) | **80/80** — the Session-9 baseline holds |
| V5 | Reference: sidebar nav | agent-browser computed styles @1440×900 | ✅ all pins hold: aside 220px rgb(13,15,26) + 1px rgb(30,34,53); nav `16px 8px`; items padding-driven 40px inactive / 42px active; active rgb(196,181,253) + rgba(124,58,237,0.2) + 1px border; inactive white/40; cursor pointer; wordmark 14px/700; 8 links; **the nav hrefs are the clone's exact 8 paths** (incl. Terminal → `/POS`) |
| V6 | Reference: POS gate + CHARGE + Reports glyph | computed | ✅ card/h2 20px mb-8/icon 64px rgba(167,139,250,0.3) sw-2/para white/35/STRONG white/60/700; CHARGE 70px 20px/900 `20px 32px` not-allowed(disabled) 135° emerald; **the Reports glyph class `lucide-file-chart-column-increasing` (the F-56 fix holds)** |
| V7 | Reference: Dashboard | computed + full-DOM dump | ✅ H1 24px; h3 sections 16px/700; weekday x-axis; **the stat-card DOM measured for the first time at full depth** (feeds F-61) |
| V8 | Reference: Reports | computed + full-DOM dump | ✅ h2s 14px uppercase white/60; pills 32px `8px 16px` 12px/700 pointer ×4 in the rgba(28,31,52,0.85)/16px/4px/white-7 container; **the Reports stat family measured** (feeds F-62); "No data for this period" = `h-40 flex items-center justify-center text-white/25 text-sm` |
| V9 | Reference: Settings + Spanish copy + Registers/Cashiers/Sales/Inventory empty states | computed + DOM dumps | ✅ fiscal labels; 6 section h3s; Save 54px; Add 34px; section icons 20px per-section colors; Spanish copy verbatim; **the empty-state + subtitle family censused** (feeds F-63) |
| V10 | Reference: mobile state @390×844 | viewport + geometry | ✅ the reference's OWN defect still present: the 220px z-50 sidebar overlays content, NO hamburger — the clone's drawer-superset posture remains correct |
| V11 | Reference: login internals | cookies cleared → computed + DOM | ✅ inputs 48px rgba(248,250,252,0.5) + rgb(226,232,240) + 12px radius + pl-40; logo 96px; SSO 54px `14px 20px` 16px pointer; sign-in 500 pointer; card white/95 + overflow hidden — **BUT the card computes `blur(4px)`** (feeds F-59); body white |
| V12 | Reference: post-login redirect | login through the real UI → URL | ⚠️ **F-60 (the evidence)**: the reference lands on `/` (the terminal at the root path); the clone lands on `/POS` |
| V13 | Local parity audit (production standalone :3400, script-owned lifecycle) | `node /home/z/my-project/scripts/audit-s10-local-parity.mjs` (repo-external, 35 checks) | ✅ 27 byte-parity incl. every Session-4/5/6/8/9 pin (sidebar, POS gate, CHARGE, h3s, FILE glyph, cursors, Reports pills/container, Settings, Spanish copy, login internals, the mobile drawer contract at 390×844: burger + dialog + 8 links + navigate-close + no overflow). ⚠️ 8 flags: 5 genuine (F-59/F-61/F-62/F-63 + F-60 via V12), 3 probe artifacts (the oklab serializations — violet-600/20, violet-400/30, white/60 — the documented doctrine; disproven by inspection) |
| V14 | The stat-card families (the cycle's deep dive) | full-DOM dumps + computed styles + VLM cross-check on the reference screenshot | ⚠️ **F-61 + F-62 (the evidence)**: the reference ships TWO stat families the clone never matched — Dashboard: 40px `p-2.5 rounded-xl` SOLID-GRADIENT chips (`from-green-400 to-emerald-500` etc.) with WHITE w-5 icons + gradient corner blobs (`-top-6 -right-6 w-20 h-20 … opacity-20`) + `font-semibold text-slate-500` labels + `font-bold … mt-1` values (value COLOR = the reference's near-invisible slate-800 — VLM-confirmed "dim and nearly invisible" — its own defect); Reports: 48px `w-12 h-12 rounded-2xl` flat `/15` + `/30`-border chips LEFT of `w-6 h-6` tone-400 icons + `text-xs text-white/35` labels (400) + `text-2xl font-black text-white` values, tones indigo/emerald/violet, NO blob. The clone renders ONE family (44px flat `/20` chips, colored icons, bold white/60 labels, extrabold white/90 values, flat `/25` blobs at -top-4 -right-4) in both views |
| V15 | The muted-tone/empty-state family | computed + DOM dumps across 7 views | ⚠️ **F-63 (the evidence)**: the reference's muted design language (slate-500 subtitles, slate-400 empty text, 64px slate-200 sw-2 empty icons, white/25 cart copy, `py-12` rhythms) systematically substituted with white/xx + 56px sw-1.5 + py-14/p-12/h-40 variants across: PageHeader subtitles (5 sites), Dashboard "No data yet", Registers + Cashiers empty cards, Sales "Sin ventas" td, Inventory "No products found" td, POS cart empty, Reports "No data for this period" |
| V16 | Static Tailwind-v4 trap sweep | rg across `src/app/*.css` + components | ✅ no `@layer utilities` custom classes; `@theme inline` in place (the plain `@theme` carries only literal hex pins — safe by design); `@custom-variant hover (&:hover)`; `tw-animate-css` imported; NO `tailwind.config.*`; no space-y in the nav chrome; the F-58 cursor base rule present — ⚠️ **trap #8 (the v4 blur-scale rename) is DOCUMENTED but was never applied to the login card** (`backdrop-blur-sm` = 8px in v4 vs the reference's v3-era 4px) — F-59 |
| V17 | Session-9 change audit | `git show 9cc8b24` review (the glyph swap, the cursor rule, the h2→h3 swaps) | ✅ all three Session-9 cures verified green on this tree (V13's live checks: the FILE glyph on desktop AND drawer, pointer on SSO/chevron/hamburger, the h3 censuses) |
| V18 | Security/invariant scan | rg: dangerouslySetInnerHTML, parseFloat in components, alert(, console.log | ✅ none found; money math stays in the seams |

**Baseline verdict:** the Session-9 tree is green end-to-end (V2–V4) and the reference has
NOT drifted for the FOURTH consecutive cycle — but this cycle's parity audit went to a NEW
depth (whole-DOM dumps of the stat-card families + the empty-state/subtitle census) and found
one systematic substitution family (the muted tones) plus the never-applied v4 blur trap, all
on the clone side. Five findings, all clone-side, none reference drift.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-59 | **MEDIUM** (visual parity — the login card's backdrop blur doubles) | `src/components/pos/login-surface.tsx:153` | The reference's login card class string is `… bg-white/95 backdrop-blur-sm …` — v3-era CSS, computing `blur(4px)`. The clone translated the class VERBATIM into Tailwind v4, where the blur scale was RENAMED: v4's `backdrop-blur-sm` = 8px (v3's `blur`), and v3's `backdrop-blur-sm` (4px) is v4's `backdrop-blur-xs`. The clone's card therefore computes `blur(8px)` — double the reference's blur. The trap is DOCUMENTED (globals.css header, trap #8: "BLUR scale shifted: v3 backdrop-blur-sm (4px) is v4 backdrop-blur-xs") and was correctly applied to the drawer backdrop (`backdrop-blur-xs`, app-shell.tsx:215) but missed on the login card. No e2e pin asserts the blur (auth.spec pins the shadow + the strip but not the filter). | V11 (reference: `blur(4px)`) vs V13 (clone: `blur(8px)`) + V16 (the class + the documented trap) | (1) `backdrop-blur-sm` → `backdrop-blur-xs` on the card. (2) Extend auth.spec with a `backdrop-filter: blur(4px)` pin so the rename trap cannot return. |
| F-61 | **MEDIUM** (visual parity — the Dashboard stat cards' chip treatment is visibly different) | `src/components/pos/shared.tsx` (StatCard) + `dashboard-view.tsx` | The reference's Dashboard stat cards (measured at full DOM depth for the first time): icon chips are **SOLID GRADIENTS** — `p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500` (40px, `from-X-400 to-Y-500` per tone) with **WHITE `w-5 h-5`** icons; corner blobs are `absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-X-400 to-Y-500 opacity-20` (gradient + 24px offsets + opacity-20); labels are `text-xs font-semibold text-slate-500 uppercase tracking-wider` (600); values are `text-2xl font-bold … mt-1` (700, mt-1). The clone renders: 44px `h-11 w-11` flat `bg-X-500/20` chips with X-400 icons; flat `bg-X-500/25` blobs at `-top-4 -right-4`; `font-bold text-white/60` labels (700); `font-extrabold … mt-2` values (800). The chip treatment (solid gradient vs faint flat) is visibly different on the Dashboard's most prominent surface. **Doctrine:** the reference's VALUE color (slate-800) is its own VLM-confirmed near-invisible defect → the clone keeps `text-white/90` (the documented a11y-superset posture); everything else matches verbatim (the reference's own utility classes, the Added-banner posture — v4's palette hexes are v3-identical, and the label `text-slate-500` is the reference's standard muted tone, matched verbatim like `text-slate-400` on "No categories"). | V14 (the DOM dumps + the VLM cross-check: "SOLID colored gradient squares with WHITE icons" + "values dim and nearly invisible") | (1) Restructure StatCard to the reference's Dashboard family: the four tone pairs (green-400→emerald-500 / indigo-400→purple-500 / blue-400→indigo-500 / amber-400→orange-500), `p-2.5 rounded-xl` gradient chips + white `h-5 w-5` icons, gradient `opacity-20` blobs at `-top-6 -right-6`, `font-semibold text-slate-500` labels, `font-bold mt-1` values (keep `text-white/90`). (2) E2E pins: chip 40px + a solid gradient backgroundImage + white icon color; label 600; value 700. |
| F-62 | **MEDIUM** (visual parity — the Reports stat cards are a different family on the reference) | `src/components/pos/views/reports-view.tsx` (uses the shared StatCard) | The reference's Reports stat cards are a DIFFERENT family from its Dashboard cards: horizontal layout — `rounded-2xl p-5 flex items-center gap-4` with the chip on the LEFT: `w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0` + `bg-X-500/15` + `border: 1px X-500/30` + `w-6 h-6 text-X-400` icons; labels `text-xs text-white/35 uppercase tracking-wider` (400); values `text-2xl font-black text-white` (900); NO corner blob; tones: **indigo** (Total Revenue, TrendingUp), **emerald** (Transactions, CalendarDays), **violet** (Avg. Ticket, CreditCard). The clone renders the Dashboard-style StatCard family (44px chips RIGHT, bold white/60 labels, extrabold values, corner blobs) with tones violet/green/violet — wrong family, wrong side, wrong tones. | V8 + V14 (the DOM dumps: `style="background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3)"` + `text-2xl font-black`) | (1) Add a Reports-specific stat row (the reference's family: chip LEFT, 48px rounded-2xl, /15 + /30 border, w-6 icons, 400 white/35 labels, font-black white values, indigo/emerald/violet tones); Reports stops using the Dashboard StatCard. (2) E2E pins: chip 48px + /15 bg + 24px icon; label 400 white/35; value 900. |
| F-63 | **LOW-MEDIUM** (the systematic muted-tone substitution family — subtle per site, broad across 7 views) | `shared.tsx` (PageHeader subtitle) + `dashboard-view.tsx` (No data yet) + `registers-view.tsx` / `cashiers-view.tsx` (empty cards) + `sales-view.tsx` / `inventory-view.tsx` (empty tds) + `terminal-view.tsx` (cart empty) + `reports-view.tsx` (No data for this period) | The reference's muted design language was systematically substituted with white/xx variants in the initial build, and no pin covers any of it (the copy is pinned; the treatments are not): subtitles `text-sm text-slate-500` (Dashboard date, Settings "Customize your business", Inventory/Sales/Registers/Cashiers counts — Reports is the reference's own exception at `text-white/35`) → clone `text-white/50`; "No data yet" `text-slate-400 text-sm text-center py-12` → clone `h-40 … text-white/40`; Registers/Cashiers empty cards `rounded-2xl p-5 col-span-full text-center py-12` + `w-16 h-16 text-slate-200 mx-auto mb-3` sw-2 icons + `text-slate-500` → clone `p-12` + `h-14 w-14 text-white/70` sw-1.5 + `mt-4 text-white/60`; Sales/Inventory empty tds `text-center py-12 text-slate-400` (+ `text-sm` on Inventory) → clone `px-5 py-14 … text-white/50`; POS cart empty `flex flex-col items-center justify-center h-full text-white/20 py-8` + `text-white/20` sw-1.5 icon + `text-sm mt-3 text-white/25` → clone `flex-1 gap-3 py-16 text-center` + `text-white/15` + `text-white/40`; Reports "No data for this period" `text-white/25` → clone `text-white/40`. | V9 + V15 (the census table) | Match the reference verbatim, site by site (the established posture — "No categories" `text-slate-400` was already matched verbatim): PageHeader subtitle → `text-slate-500` (Reports overrides `text-white/35`), the seven empty-state treatments to the measured classes. E2E pins on the representative surfaces (subtitle color, the Registers empty icon geometry, the cart-empty text). |
| F-60 | **LOW** (functional parity — the post-login URL) | `src/components/pos/login-surface.tsx` (fromUrl default + the signup redirect) | The reference lands on `/` after login (the terminal at the root path — measured live through the real UI); the clone lands on `/POS`. Both URLs render the terminal on both sites (the clone's router maps `/` → terminal; the reference's own nav Terminal href IS `/POS` — V5), so this is a URL-level nuance, not a surface gap — but the reference's landing URL is the measured contract. Two e2e sites wait for `**/POS` after LOGIN (auth.setup.ts:19, auth.spec.ts:64) and must ride the change (surfaces.spec.ts:81's `**/POS` wait is the 404-page LINK click — the href stays `/POS`; auth.spec.ts:82 is the from_url deep-link — unaffected). | V12 | (1) `fromUrl()` default + the registration redirect → `/`. (2) Update the two post-login e2e waits to accept the reference's landing (`/` or `/POS` — regex). (3) Pin the landing URL in auth.spec. |

**Explicitly NOT findings (verified — do not "fix"):**
- The oklab serializations in V13's flags (violet-600/20 active bg, violet-400/30 gate icon,
  white/60 emphasis) — the documented v4 serialization doctrine; same colors as the
  reference's rgba (disproven by inspection: v4's palette hexes are v3-identical).
- The Inventory chip's `py-0` + `h-9` (36px, centered) vs the reference's `py-2` (36px) —
  the documented "+2px button-base quirk — pinned via h-9" (AGENTS); the rendered geometry
  is identical.
- The H1 `text-slate-800` on the reference (Registers) — the reference's own near-invisible
  defect; the clone's `text-white/80` is the documented superset (AGENTS).
- The POS gate `strong` vs the clone's `a` — the documented functional-superset posture.
- The register/cashier card name `h2` styles — the reference shows no cards (write-restricted
  empty state), so no measurable contract exists (Session-9's documented non-finding).
- The Dashboard y-tick values (reference "0..3" vs clone "0,20,40,60") — data-dependent
  (the reference's sparse dataset vs the demo db's 33 sales); niceTicks works as designed.
- The `mt-5` vs `space-y-6` block-gap nuance (20px vs 24px between view blocks) — a 4px
  rhythm difference below the measurement noise floor of every prior session, consistent
  across all views; not worth the churn (documented here instead).
- The mobile scroll-lock "flag" in V13's raw read — a probe artifact (the lock is set on
  `document.body`, the probe read `documentElement`); the e2e pin (which polls body) passes.
- The Dashboard chart weekday labels "flag" — a probe artifact (the probe caught the y-tick
  texts of the first large svg); the e2e pin asserts the weekday axis and passes.

---

## 2. The ToDo list (execution order, TDD where behavioral)

- [x] **T-1** (RED, F-59) auth.spec: pin the login card's `backdrop-filter` = `blur(4px)`
       (the v3-era `backdrop-blur-sm` = v4 `backdrop-blur-xs`). RED proof: fails against the
       current tree (which computes `blur(8px)`).
- [x] **T-2** (GREEN, F-59) `login-surface.tsx:153`: `backdrop-blur-sm` → `backdrop-blur-xs`
       + the trap-#8 comment. Verify the disabled-state contract is untouched (no
       interaction).
- [x] **T-3** (RED, F-61) surfaces.spec: pin the Dashboard stat-card family — the chip
       computes 40px + a solid-gradient backgroundImage (the green pair's stops) + a WHITE
       icon; the label computes 600; the value computes 700. RED proof: all fail against
       the current tree (44px flat chips, 700/800).
- [x] **T-4** (GREEN, F-61) `shared.tsx` StatCard: the reference's Dashboard family — the
       four gradient tone pairs, `p-2.5 rounded-xl` chips + `h-5 w-5` white icons, the
       gradient `opacity-20` blobs at `-top-6 -right-6`, `font-semibold text-slate-500`
       labels, `font-bold mt-1` values (keep `text-white/90` — the reference's slate-800
       value is its VLM-confirmed near-invisible defect; the documented superset).
- [x] **T-5** (RED, F-62) surfaces.spec: pin the Reports stat family — the chip computes
       48px + a `/15` flat bg + a 24px icon; the label computes 400 white/35; the value
       computes 900. RED proof: fails against the current tree (the Dashboard family).
- [x] **T-6** (GREEN, F-62) `reports-view.tsx`: the Reports stat row (chip LEFT, the
       reference's classes, indigo/emerald/violet tones, TrendingUp/CalendarDays/CreditCard)
       — Reports stops using the Dashboard StatCard.
- [x] **T-7** (RED, F-63) surfaces.spec: pin the muted-tone family's representative
       surfaces — the PageHeader subtitle computes slate-500 (rgb(100,116,139)); "No data
       yet" computes slate-400; the Registers empty icon computes 64px + slate-200
       (rgb(226,232,240)) + stroke-2; the cart-empty copy computes white/25. RED proof:
       all fail against the current tree (white/50, white/40, 56px white/70 sw-1.5,
       white/40).
- [x] **T-8** (GREEN, F-63) the verbatim sweep: PageHeader subtitle → `text-slate-500` (+
       a Reports override `text-white/35`); Dashboard "No data yet" → the reference's
       classes; Registers + Cashiers empty cards → `p-5 py-12` + `w-16 h-16 text-slate-200
       mb-3` sw-2 + `text-slate-500`; Sales + Inventory tds → `py-12 text-slate-400`;
       terminal cart empty → the reference's wrap + `text-white/20` icon + `mt-3
       text-white/25` copy; Reports "No data for this period" → `text-white/25`.
- [x] **T-9** (RED+GREEN, F-60) auth.spec: pin the post-login landing URL = `/` (the
       reference's landing). Then `login-surface.tsx`: the fromUrl default + the signup
       redirect → `/`; update the three `**/POS` waits (auth.setup, surfaces.spec:81,
       auth.spec:64) to the regex landing.
- [x] **T-10** Docs-counts lockstep: e2e 80 → the new count (every live-tense count site
       in the SAME commit: README badge/rows, CLAUDE, AGENTS, PAD, the SKILL,
       vitest.config.ts's header, the gate's own pin strings).
- [x] **T-11** Full gate re-run: `lint 0 (1 documented warning) → tsc clean → unit
       133/133 → build green (hygiene-clean) → smoke 13/13 → e2e <new count>/<new count>`
       — no prior pin weakened.
- [x] **T-12** Live re-verification on the rebuilt standalone (the Session-10 evidence
       script): the five fixes measured live (the login card blur 4px, the stat families
       on Dashboard AND Reports, the empty-state census, the `/` landing), the checkout
       journey, the mobile drawer contract at 390×844. Fresh screenshots. VLM spot-check
       on the stat cards + the login card (settle-wait discipline).
- [x] **T-13** Docs lockstep: README (counts), AGENTS.md (the F-59/F-61/F-62/F-63 contract
       lines + the corrected stat-card doctrine), CLAUDE.md (the same), PAD v1.8 (the
       revision block + counts), velox-pos_SKILL.md v2.6.0 (the trap-#8 addendum + the
       stat-family contracts + the Session-10 addendum + counts), .env.example re-verified,
       this execution record, the worklog entry, `docs/session_15.md` (the narration,
       one-ahead numbering).
- [x] **T-14** Commit + push via the SSH wrapper (main only; the key deployed outside the
       repo, 0600, shredded after the push per the runbook).

---

## 3. Execution record

**RED (T-1/T-3/T-5/T-7/T-9):** the blur pin + the landing pin appended to
auth.spec, and the three family pins appended to surfaces.spec. All five RED
proofs observed against the pre-fix standalone: the blur test failed
(`blur(8px)` ≠ the pinned `blur(4px)`), the landing test failed (`/POS` ≠ `/`),
the Dashboard chip failed (44px ≠ 40px), the Reports chip failed (44px ≠ 48px),
the muted-tone subtitle failed (white/50 ≠ slate-500). One spec-authoring bug
fixed en route (a duplicate `label` binding — caught by the parser, not a
false RED).

**GREEN (T-2/T-4/T-6/T-8/T-9):** the class swap (`backdrop-blur-xs`), the
StatCard restructure (the four `.stat-grad-*` exact-rgb CSS classes after the
utility-gradient `lab()` serialization was caught live — the `.brand-chip`
doctrine applied), the ReportsStat component, the seven-view muted-tone sweep,
and the `/` landing (fromUrl default + the signup redirect + the new
`(app)/page.tsx` root page — the router already mapped `/` → terminal, but no
Next route existed; the build table now carries `ƒ /`). Two e2e-wait lessons
en route: `toHaveURL` regexes match the FULL url string (the first landing pin
used a `^\/` path regex and timed out on a page that HAD landed — the
predicate form `(url) => url.pathname === "/"` is the correct spelling), and
the auth.setup wait rides the same predicate.

**Order dependence (caught by the full-suite run):** the F-63 Registers
empty-card pins failed in the full run (registers-shifts.spec creates
Register 1 before surfaces.spec runs; the empty state stops rendering) while
passing isolated (each invocation re-provisions db/e2e.db). The pins moved to
registers-shifts.spec's first test — the natural home where the empty state is
guaranteed — and the surfaces F-63 test kept only the order-independent sites
(the subtitle, "No data yet", the cart copy).

**Lockstep (T-10):** E2E 80 → 84 (+4 tests: the blur pin, the two stat-family
pins, the muted-tone pin — the F-60 landing assertions EXTENDED the existing
sign-in test and the F-63 registers pins EXTENDED the registers-shifts first
test, so neither counts as a new test). Updated: the docs-counts constants
(E2E=84, "Session-10 lock", "70 desktop + 13 mobile + 1 setup"), README
(badge + commands + testing), CLAUDE (baseline), PAD (the scale line with the
9-route-spellings note), SKILL (header baselines + §3 + §12). Gate 133/133
green after the sweep.

**Final gate (T-11):** lint 0 errors (1 documented warning) · tsc clean ·
unit **133/133** (13 files) · build green (hygiene-clean; the root route
`ƒ /` in the table; smoke step 13 polices the artifact) · smoke **13/13** ·
e2e **84/84** — no prior pin weakened.

**Live evidence (T-12):** `scripts/capture-s10-evidence.mjs` **12/12** —
F-59 live (the card computes `blur(4px)`), F-60 live (the landing is `/`),
F-61 live (the 40px rgb-gradient chip + white icon + 0.2 blob + 600/700
weights), F-62 live (the 48px/16px /15 chip + 24px indigo icon + 400/900
weights, no blob), F-63 live (the slate-500 subtitle, the white/35 Reports
exception, the white/25 cart copy), the checkout journey (shift opened, gate
passed), and the mobile drawer contract (dialog + 8 links + no overflow at
390×844). Six fresh screenshots (49–54). VLM sweep: 6/6 effective — the one
initial flag ("no visible blur" on the login card) was the prompt's
expectation bug (the reference's canvas is a plain gradient with nothing
behind the card to blur; the 4px value is a computed contract, verified on
both sides by measurement).

**Docs lockstep (T-13):** README (the 84 sites), AGENTS.md (the corrected
login contract + the stat-card/muted-tone contracts section + the
unpinned-palette lesson), CLAUDE.md (the same), PAD v1.8 (the header bump +
the revision block + the 9-route-spellings scale line),
velox-pos_SKILL.md v2.6.0 (traps 19/20/21 + the Session-10 addendum + the
counts), .env.example re-verified (unchanged — no env changes this cycle),
this execution record, the worklog entry, `docs/session_15.md` (the
narration, one-ahead numbering). **T-14:** committed + pushed via the SSH
wrapper (main only; the key shredded after).

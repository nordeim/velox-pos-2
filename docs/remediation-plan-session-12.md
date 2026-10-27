# VeloxPOS Remediation Plan — Session-12

**Date:** 2026-10-27 (Session-12 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-11 tree (HEAD `336284e`
= `48ccbe2` + the operator's session-log commit). A full received-tree gate re-verification,
a live reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law —
SIXTH consecutive cycle, zero drift on every standing pin), and this cycle's NEW-depth audit:
**the four never-measured auth surfaces** — the failed-login error state, the forgot-password
view, the sign-up view, the authenticated 404 — plus a deeper structural pass on the sign-in
view itself (the content-block skeleton, the logo treatment, the OR divider, the links row).
Also the static Tailwind-v4 trap sweep, the mobile-drawer live contract check, and the
security/invariant scan.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16 security),
skills/agent-browser (live computed-style measurement — computed styles are ground truth),
skills/tdd (red → green), skills/clone-app-pat-pro (the reference's own DOM/computed styles as
the contract at parity depth).

> **Session-12 context:** the cycle ran twice — the first pass (workspace since reset) had
> completed the audit, the plan, and the RED pins but was lost with the workspace before any
> commit. This document is the cycle's authoritative re-run: every measurement below was
> re-taken live against `https://veloxposen.base44.app/` on 2026-10-27 (the second pass),
> and the NEW-depth finding set grew by two findings the first pass had not reached
> (F-83 the forgot-link contract, F-85 the sign-in content-block depth).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the workspace had been reset) + `cp .env.example .env` (`DATABASE_URL="file:../db/custom.db"` per the contract) + `bun install` (485 pkgs) + `db:generate` + `db:push` + `db:seed` (owner ready) + `bunx playwright install chromium` (1243) | environment fully provisioned |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning: `no-location-assign` in login-surface.tsx, the known `window.location.assign` cookie-commit race workaround) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Build + smoke on the received tree | `bun run build` + `./scripts/smoke-test.sh` | build green (hygiene-clean artifact; the full route table incl. `ƒ /`) · smoke **13/13** |
| V4 | E2E on the received tree | `CI=1 bun run test:e2e` (both projects) | **88/88** — the Session-11 baseline holds |
| V5 | Reference: standing login pins | agent-browser computed @1280: card `blur(4px)` (F-59) · typed text `rgb(9,9,11)` (F-70) · Sign-in button 48px/500 · signup link slate-500 · SSO 54px | ✅ all hold — SIXTH consecutive drift-free cycle |
| V6 | Reference: **NEW DEPTH — the failed-login error state** (never measured) | wrong credentials → capture the rendered error + computed styles | ⚠️ the reference renders an inline **Alert panel** (NOT a toast): `role=alert`, **bg rgba(254,242,242,0.7)** (red-50/70), **1px rgb(254,202,202)** border (red-200), **12px radius** (rounded-xl), **16px padding** (p-4), display block, **no icon** (0 svg), inner div **14px / rgb(185,28,28) / 400** (text-sm text-red-700); copy **"Invalid email or password"** (the clone's API copy already matches — `INVALID_CREDENTIALS` in login/route.ts) |
| V7 | Reference: **NEW DEPTH — the forgot-password view** (never measured) | click "Forgot password?" → full DOM + computed | ⚠️ a **complete card-content swap**: the logo, h1, sub, all four SSO buttons and the OR divider ALL disappear; a **"Back to sign in"** button (`flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2` + lucide-arrow-left h-4 w-4) becomes the **first child**; then a `text-center space-y-2` block (h2 `text-xl sm:text-2xl font-bold text-slate-900` "Reset your password" = 24px/700 at desktop + p `text-slate-600 text-sm sm:text-base` "Enter your email and we'll send you a link to reset your password" = 16px/slate-600); then the form `space-y-4 sm:space-y-5` with ONE field (label `text-sm font-medium text-slate-700`, input `pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400` = 44px desktop) and the **Send reset link** button (`px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl` = 44px, solid slate-900). Content spacing: `space-y-4 sm:space-y-6` (back -mb-2 → 16px to h2 at desktop, 24px h2→form) |
| V8 | Reference: **NEW DEPTH — the sign-up view** (never measured) | click "Need an account? Sign up" → full DOM + computed | ⚠️ the same card-content swap: back-first, h2 `text-xl sm:text-2xl font-bold text-slate-900` **"Create your account"** — **NO description paragraph** (unlike forgot), form `space-y-3 sm:space-y-4` with an inner `space-y-3` wrapper around **exactly three fields: Email / Password / Confirm Password** (**no Full name**, **no SSO block**); all inputs 44px (`pl-10 h-10 sm:h-11 ... placeholder:text-slate-400` + `text-sm sm:text-base`); confirm placeholder **"Re-enter password"**; labels `text-sm font-medium text-slate-700` (rgb(51,65,85)); **Create account** button `px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200` (44px); Lock icons 16px, no show/hide toggles |
| V9 | Reference: **NEW DEPTH — the authenticated 404** (never measured) | login (honors `from_url`) → bogus route → full DOM + computed | ⚠️ contract measured: wrapper `min-h-screen flex items-center justify-center pos-gradient-subtle p-6` (**solid rgb(8,10,20)** — the class carries NO background-image; identical to the clone's `--color-ink #080a14`); card `glass-card rounded-3xl p-12 text-center max-w-md` (48px padding, 24px radius, bg rgba(16,18,32,0.9) — the clone's `.glass-card` is byte-exact); numeral a **plain `<span class="text-3xl font-bold text-white">404</span>`** (30px/700/white — NOT a chip); h1 `text-2xl font-bold text-slate-800 mb-2` ("Página no encontrada", 24px/700/rgb(30,41,59)); p `text-slate-500 mb-8` (16px); link **"Ir al Terminal"** = `glass-button-primary rounded-xl px-6 py-3 inline-flex items-center gap-2 font-medium` (50px, **16px/500** — NOT text-sm font-bold) with a **lucide-arrow-left w-4 h-4** leading icon (not a "←" text glyph), href `/POS` |
| V10 | Reference: **NEW DEPTH — the logged-out bogus route** | cookies-free goto `/bogus-route-xyz` | ⚠️ the reference **auth-gates unknown routes for guests**: instant redirect to `/login?from_url=<original>` (the auth gate swallows unknown routes). The clone renders its 404 to logged-out visitors |
| V11 | Reference: **the sign-in content-block depth** (this cycle's second-pass discovery — the skeleton beneath the long-standing pins) | full card-content DOM capture + computed gaps @1280 and @390 | ⚠️ the sign-in content is NOT the clone's flat margin chain — it is one `flex flex-col items-center text-center space-y-6 sm:space-y-8` block: (a) the logo is a `relative group` — a **blur(24px) halo** (`absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30`) behind a **ring-4 ring-white/50 rounded-full shadow-lg span** (h-20 w-20 → 80px mobile / sm:h-24 96px desktop, radius 9999px) wrapping the img — the clone ships a bare img; (b) h1 `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight` (**24px mobile / 30px desktop, -0.75px**) — the clone ships a fixed `text-3xl` with tracking-normal; (c) sub `text-slate-500 text-sm sm:text-base font-medium` (**14px mobile / 16px desktop, weight 500**) — the clone ships 16px/400 fixed; (d) gaps: logo→h1-block **32px** desktop (24px mobile), h1→p 8px mobile/12px desktop, h1-block→SSO 32px; the clone ships mt-5 (20px) / mt-2 (8px); (e) SSO→OR and OR→form **24px** (`my-6`) — the clone ships 28px (`my-7`); (f) the OR divider is a **continuous absolute `h-[1px] w-full bg-slate-200` line** with a **`bg-white px-3` knockout label** — `text-xs uppercase font-medium tracking-wider text-slate-500` rendering lowercase "or" — the clone ships two flex `gap-4` line stubs + a slate-400 "OR" span; (g) the form is `space-y-4 sm:space-y-5` with a `space-y-3 sm:space-y-4` wrapper around `space-y-1.5` fields — the clone ships `space-y-5` with `space-y-2` fields; (h) the links live **INSIDE the form** in a `flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0` row — desktop: **Forgot left-aligned, signup right-aligned**; mobile 390px: column, 8px gap, centered — the clone ships a centered mt-6 stack below the form; (i) SSO buttons carry explicit `text-[16px]` + `transition-all duration-200` + `hover:shadow-sm` + a `group` icon wrapper (Google's icon wrapper adds `-ml-4`) — the clone ships 54px ✓ but `transition-colors` + `hover:shadow` and no icon-offset quirk |
| V12 | Reference: the links' text contracts | computed on both link buttons | ⚠️ **"Forgot password?"** = `text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors` (14px/**500**/slate-500, NO underline anywhere) — the clone ships 400 + `hover:text-slate-800 hover:underline`; **"Need an account? Sign up"** = the button is `text-sm text-slate-500 hover:text-slate-700 transition-colors` (**weight 400** — the Session-4 font-medium pin has DRIFTED on the reference) with **"Sign up" wrapped in `<span class="font-medium text-slate-700">`** (500/rgb(51,65,85)) — the clone ships the whole phrase font-medium slate-500 |
| V13 | Reference: mobile geometry @390×844 | viewport + computed | logo **80px** · h1 **24px** · sub **14px** · inputs **44px** (h-11) · Sign-in button **44px** (h-11) · SSO 54px/16px fixed · links row **column/8px/center** — the clone ships fixed 96px logo, 30px h1, 16px sub, 48px inputs/button at every width |
| V14 | Reference: the sign-in busy state | observed live during the V6 probe | the reference's submit button renders **"Signing in..."** mid-flight — the clone ships "Please wait…" (the signup/forgot busy copy remains unmeasured — the reference's writes are restricted) |
| V15 | Clone-side audit of the same surfaces | source read: `login-surface.tsx` (all 353 lines), `not-found.tsx`, `input.tsx`, `label.tsx`, `tokens.css`, `login/route.ts` | every V6–V13 delta confirmed against the clone's source: the error is a `<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">`; all three views share ONE card body (only the password field toggles); the signup view ships a Full name field + SSO chrome; the 404 ships the brand-chip numeral + white/60 h1 + text-sm font-bold link + a "←" glyph; the root 404 has no gate; the sign-in body is the flat margin chain; `.glass-card` + `--color-ink #080a14` are byte-exact vs the reference (no token work needed) |
| V16 | Static Tailwind-v4 trap sweep | the standing checks: `@theme inline` intact · `@custom-variant hover` · no `tailwind.config.*` · `tw-animate-css` imported · v3→v4 renamed-scale translations (the new work this cycle uses `blur-xl` on the halo — v4 kept the xl tier at 24px, verified vs the reference's blur(24px)) | ✅ clean |
| V17 | Security/invariant scan | rg: dangerouslySetInnerHTML, `alert(`, secrets, ownership scoping; the new client-side confirm check never weakens the server Zod (registerSchema.fullName already optional — the API keeps accepting it; the UI simply stops collecting it) | ✅ clean; no API contract changes |

**Baseline verdict:** the Session-11 tree is green end-to-end (V2–V4) and every standing pin
holds for the SIXTH consecutive cycle — but this cycle's NEW depth (the four never-measured
auth surfaces + the sign-in content-block skeleton) found **ten findings**, all clone-side,
all on the auth surface: the login card the guest actually meets diverges from the reference
in its error state, both sub-views, its internal rhythm, its logo treatment, its links row —
and the 404 the guest never sees (because the reference gates it). No reference drift; no
server defects; no security findings.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| **F-76** | **MEDIUM** (visual parity — the failed-login error state) | `login-surface.tsx` (the `{error && …}` render) | The clone renders the login error as a bare `<p role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">`. The reference renders a bordered **Alert panel**: `rounded-xl border border-red-200 bg-red-50/70 p-4` + inner `text-sm text-red-700`, no icon. Five computed deltas (radius 8→12px, border 0→1px red-200, padding 8/12→16px, text red-600→red-700, bg 1→0.7 alpha). | V6 vs V15 | Render both the error and the success notice through a new `src/components/ui/alert.tsx` primitive (error tone = the measured red contract; success tone = the symmetric emerald — the reference's success state is unmeasurable, documented superset). E2E: extend the existing wrong-credentials test with the full computed contract. |
| **F-77** | **MEDIUM** (visual parity — the forgot view) | `login-surface.tsx` (the `view === "forgot"` branches) | The clone renders the sign-in chrome for the forgot view (logo, h1, sub, SSO, OR all stay; only the password field hides). The reference **swaps the entire card content**: "Back to sign in" first child (ArrowLeft icon, `text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2`), a centered `space-y-2` block (h2 `text-xl sm:text-2xl font-bold text-slate-900` + desc `text-slate-600 text-sm sm:text-base`), a `space-y-4 sm:space-y-5` form with ONE 44px field (`h-10 sm:h-11`, `placeholder:text-slate-400`) and the 44px solid-slate-900 **Send reset link** button. Content spacing `space-y-4 sm:space-y-6`. | V7 vs V15 | Restructure the card body per view: `signin` keeps the measured sign-in block; `forgot` renders the subview skeleton. E2E: new test — back-first order, logo/h1/SSO/OR absent, h2/desc/input/button computed contract. |
| **F-78** | **MEDIUM** (visual parity — the sign-up view) | `login-surface.tsx` (the `view === "signup"` branches) | The clone's signup keeps the sign-in chrome + adds a **Full name** field; there is no Confirm Password. The reference: back-first, h2 **"Create your account"** (no desc), form `space-y-3 sm:space-y-4` with a `space-y-3` inner wrapper around **exactly Email / Password / Confirm Password** (44px, `text-sm sm:text-base`, confirm placeholder **"Re-enter password"**), **no SSO**, **no Full name**, Create account button (44px, `transition-all duration-200`). | V8 vs V15 | Restructure per view; drop the Full name field from the UI (the register API's `fullName` stays optional and accepted — no API change); add the Confirm Password field with a client-side equality check surfaced through the F-76 alert. E2E: new test — 3 fields, no Full name, no SSO, confirm placeholder, button contract, and the mismatch path (client-side only — never submits). |
| **F-79** | **MEDIUM** (visual parity — the authenticated 404) | `src/app/not-found.tsx` | Five deltas vs the measured reference: the numeral is a **brand-chip** (72px gradient square) vs a **plain `text-3xl font-bold text-white` span**; h1 `text-white/60` vs `text-slate-800 mb-2`; p `text-white/50` vs `text-slate-500 mb-8`; the link `text-sm font-bold` + a "←" text glyph vs **`font-medium` (16px/500) + a lucide ArrowLeft icon** at 50px; card `rounded-2xl p-10` vs **`rounded-3xl p-12`**, wrapper `min-h-dvh p-4` vs `min-h-screen p-6` (the bg already matches: `pos-gradient-subtle` computes solid rgb(8,10,20) = `--color-ink`). | V9 vs V15 | Rewrite `not-found.tsx` to the measured contract (keep `glass-card` + `glass-button-primary` — byte-exact vendors; swap the chip for the span, adopt the slate-800/slate-500 text family, the ArrowLeft icon, rounded-3xl p-12, min-h-screen p-6). E2E: extend the existing 404 test with the computed contract. |
| **F-82** | **MEDIUM** (functional parity — the logged-out 404 gate) | `src/app/not-found.tsx` | Logged-out visitors to unknown routes see the clone's public 404; the reference **auth-gates unknown routes** — the guest is redirected to `/login` (with `from_url`) before any 404 HTML ships. | V10 vs V15 | Make the root not-found an async server component mirroring the (app) layout's gate: `getCurrentUser()` → `redirect("/login")` (the clone's own gate convention; its `fromUrl()` keeps the open-redirect guard). E2E: new logged-out test — bogus route → `/login`. |
| **F-85** | **MEDIUM** (visual parity — the sign-in content-block depth) | `login-surface.tsx` (the card body) | Beneath the long-standing pins (card blur/shadow, 48px inputs, 54px SSO — all still byte-exact), the sign-in body's skeleton diverges: (a) bare img vs **ring-4 ring-white/50 rounded-full shadow-lg span + blur(24px) halo** (80px mobile/96px desktop); (b) h1 fixed `text-3xl` vs **`text-2xl sm:text-3xl tracking-tight`** (24px mobile); (c) sub 16px/400 vs **`text-sm sm:text-base font-medium`** (14px mobile/500); (d) logo→h1 gap 20px vs **24/32px**; (e) SSO→OR→form 28px vs **24px** (`my-6`); (f) two flex line stubs + slate-400 "OR" vs the **continuous h-[1px] line + bg-white px-3 knockout** rendering uppercase "or" (`tracking-wider` slate-500); (g) form `space-y-5`/`space-y-2` fields vs **`space-y-4 sm:space-y-5` → `space-y-3 sm:space-y-4` wrapper → `space-y-1.5` fields**; (h) links centered below the form vs **inside the form, `flex-col sm:flex-row justify-between`** (Forgot left / signup right at desktop; column/8px/center at 390px); (i) SSO `transition-colors hover:shadow` vs **`transition-all duration-200 hover:shadow-sm text-[16px]`** + the Google `-ml-4` icon quirk. | V11, V13 vs V15 | Restructure the sign-in body into the measured `flex flex-col items-center text-center space-y-6 sm:space-y-8` skeleton with per-view children (the shared wrapper serves F-77/F-78 too). E2E: two new tests — the logo/h1/sub/halo contract + the OR-divider/links-row contract (desktop + 390px). |
| **F-81** | **LOW-MEDIUM** (visual parity — the sign-in button) | `login-surface.tsx` (the submit button) | The reference's button: `px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200` — **text-sm (14px)**, `shadow-sm`, `transition-all duration-200`, 44px mobile/48px desktop. The clone: `px-4 py-3 font-medium` — **16px text**, no shadow, `transition-colors`, 48px at every width. | V5, V13 vs V15 | Adopt the measured class string (keeping `vpx-focus`, `data-testid`, the disabled state). E2E: extend the existing button test with `font-size: 14px`. |
| **F-80** | **LOW** (visual parity — the signup link) | `login-surface.tsx` (the "Need an account? Sign up" button) | The reference renders the phrase **mixed**: "Need an account? " at weight **400**/slate-500 + **"Sign up" in a `font-medium text-slate-700` span** (the Session-4 whole-phrase font-medium pin has drifted on the reference). The clone ships the whole phrase font-medium slate-500. | V12 vs V15 | Split the copy: base button `text-sm text-slate-500 hover:text-slate-700 transition-colors` + the `<span className="font-medium text-slate-700">Sign up</span>`. E2E: extend the existing signup-affordance test (button weight 400 + span 500/rgb(51,65,85)). |
| **F-83** | **LOW** (visual parity — the "Forgot password?" link) | `login-surface.tsx` (the forgot link) | The reference: `text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors` — **14px/500**, NO underline anywhere. The clone: inherited 14px but weight 400 + `hover:text-slate-800 hover:underline`. | V12 vs V15 | Adopt the measured classes verbatim. E2E: the links-row test pins its computed 14px/500/slate-500. |
| **F-84** | **LOW** (copy parity — the sign-in busy state) | `login-surface.tsx` (the busy label) | The reference's submit renders **"Signing in..."** mid-flight (observed live during the V6 probe); the clone ships "Please wait…". The signup/forgot busy copy remains unmeasured (the reference's writes are restricted) — the clone's stays. | V14 vs V15 | View-conditional busy copy: `signin → "Signing in…"`. No e2e pin (a transient state races the assertion); verified by inspection + the screenshots pass. |

**Explicitly NOT findings (verified — do not "fix"):**
- **The sign-in inputs** — byte-exact (`pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200
  focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600`); the
  sign-in password placeholder "••••••••" matches too.
- **The card itself** — `bg-white/95 shadow-2xl backdrop-blur-xs` + the 4px gradient strip +
  the `p-8 sm:p-10 md:px-10 md:pb-10 md:pt-12` padding wrapper: byte-exact (F-59/F-70-era
  pins; re-verified).
- **The login canvas** — the slate-50→slate-100 light gradient (Session-4 pin, re-verified).
- **`.glass-card` / `.glass-button-primary` / `--color-ink`** — byte-exact vs the reference's
  404 card/link/wrapper (no token work).
- **The register API** — `registerSchema.fullName` is already optional and the route already
  aliases `name`; dropping the UI field changes no contract.
- **The reference's mobile drawer** — still carries its own 220px-overlay defect; the clone's
  drawer-superset posture remains correct (re-verified by the 88-test green run, incl. the 13
  mobile pins).
- **The clone's SSO buttons' 54px height** — pinned and holding; only the transition/shadow
  treatment rides F-85(i).

---

## 2. The TDD task list

**RED first — every pin fails on the pre-fix tree, then GREEN:**

| # | Task | Type | Covers |
|---|------|------|--------|
| T-1 | Extend `tests/e2e/auth.spec.ts` "wrong credentials…" with the F-76 alert contract (bg rgba(254,242,242,0.7), border rgb(254,202,202), radius 12px, padding 16px, inner 14px/rgb(185,28,28), zero svg) | RED pin | F-76 |
| T-2 | Extend "the sign-in button is the reference's font-medium 48px" with `font-size: 14px` | RED pin | F-81 |
| T-3 | Extend "the signup affordance…" with button weight 400 + the span 500/rgb(51,65,85) | RED pin | F-80 |
| T-4 | NEW auth.spec test: the forgot view's full swap contract (back-first + ArrowLeft, logo/h1/sub/SSO/OR absent, h2 24px/700, desc 16px slate-600, input 44px + placeholder slate-400, Send 44px solid slate-900) | RED pin | F-77 |
| T-5 | NEW auth.spec test: the signup view's 3-field contract (no Full name, no SSO, 44px fields, "Re-enter password", Create 44px; the mismatch path errors client-side without submitting) | RED pin | F-78 |
| T-6 | NEW auth.spec test: the sign-in logo/h1/sub/halo depth (ring span 96px/9999px radius, halo blur(24px), h1 30px/-0.75px, sub 16px/500, logo→h1-block 32px) | RED pin | F-85(a-d) |
| T-7 | NEW auth.spec test: the OR divider + links row (continuous 1px line, knockout "or" uppercase/tracking-wider/slate-500/bg-white px-3, links row `row`+`space-between` at desktop with forgot 14px/500, `column`/8px at 390px) | RED pin | F-85(f,h) + F-83 |
| T-8 | NEW auth.spec test: bogus routes gate the guest (→ `/login`) | RED pin | F-82 |
| T-9 | Extend `tests/e2e/surfaces.spec.ts` "unknown routes render the reference's Spanish 404" with the F-79 contract (card 48px/24px radius, span numeral 30px/700/white with no chip bg, h1 rgb(30,41,59), p rgb(100,116,139) + 32px mb, link 50px/16px/500 + gradient + ArrowLeft svg) | RED pin | F-79 |
| T-10 | **RED proof**: run the extended suite against the pre-fix standalone build — expect exactly the 9 targeted failures, zero collateral | gate | all |
| T-11 | Create `src/components/ui/alert.tsx` (the measured Alert panel; error + success tones) | GREEN | F-76 |
| T-12 | Restructure `login-surface.tsx`: the shared `flex flex-col items-center text-center space-y-6 sm:space-y-8` skeleton; the sign-in body (logo group + halo, responsive h1/sub, SSO family, knockout OR, form wrapper chain, in-form justify-between links row, measured button + busy copy); the `forgot` subview; the `signup` subview (+confirm-password client check) | GREEN | F-76/77/78/80/81/83/84/85 |
| T-13 | Rewrite `src/app/not-found.tsx` (plain span numeral, slate-800/slate-500 text, ArrowLeft link, rounded-3xl p-12, min-h-screen p-6) + the async logged-out gate (`getCurrentUser()` → `redirect("/login")`) | GREEN | F-79/82 |
| T-14 | **GREEN proof + full gate**: lint 0 · tsc clean · unit 133/133 · build green · smoke 13/13 · e2e **93/93** (88 + 5 new) | gate | all |
| T-15 | Screenshots of the remediated surfaces → `docs/screenshots/` (sign-in desktop + mobile, error state, forgot, signup, 404 authenticated + the guest gate) | evidence | all |
| T-16 | Docs lockstep: README counts, AGENTS.md/CLAUDE.md contracts, PAD revision, velox-pos_SKILL.md traps, this plan's execution record, worklog.md, `docs/session_19.md` | docs | all |

**Risks & mitigations:**
- **The not-found gate vs the build's `/_not-found` prerender** — an async not-found that
  reads cookies may trip the static prerender; mitigation: try the plain async gate first,
  and if the build complains, add the dynamic escape (`export const dynamic = "force-dynamic"`).
- **The 404 e2e contexts** — surfaces.spec runs authenticated (the 404 must still render
  there after the gate) while auth.spec runs guest (the gate must redirect); the two new
  pins hold both behaviors.
- **The signup mismatch path** — the client-side equality check must run BEFORE any fetch;
  the e2e mismatch case must never hit `/api/auth/register` (no user pollution).
- **The `window.location.assign` lint warning** — the documented cookie-commit race
  workaround stays; the restructure must not add new violations.
- **No prior pin weakened** — the 88 baseline tests stay untouched except the three
  documented extensions (T-1/T-2/T-3/T-9 extend in place; no assertion removed).

---

## 3. Execution order

1. RED pins (T-1…T-9) → standalone build → RED proof (T-10): exactly 9 failures.
2. GREEN (T-11 → T-12 → T-13) → unit + lint + tsc → build → GREEN proof (T-14).
3. Smoke ladder (13/13) → full e2e (93/93) → screenshots (T-15).
4. Docs lockstep (T-16) → worklog → commit → push (main only, the SSH wrapper).

## 4. Execution record (filled in as the cycle runs)

- RED proof: **9/9 targeted failures, zero collateral** (84 passing of 93) — the 3
  extended auth tests (F-76 alert, F-80 link, F-81 button), the 5 new auth tests
  (F-77 forgot, F-78 signup, F-85 logo, F-85/F-83 OR+links, F-82 gate), and the
  extended 404 test (F-79). One locator hardening en route: the alert pins scope to
  `main.login-canvas [role='alert']` (Next's own route-announcer div also carries
  role="alert" at body level — strict mode caught both).
- GREEN: alert.tsx + the login-surface restructure + the not-found rewrite/gate landed
  in one pass. The build needed NO dynamic escape — Next 16 renders the root not-found
  `ƒ /_not-found` (Dynamic) within the request scope, the cookie gate intact.
- Three v3→v4 serialization traps caught by the GREEN run and cured per the standing
  doctrine (translate the class, pin the computed both ways): (1) `bg-red-50/70`
  computes `oklab(.../0.7)` (same color as the reference's rgba — the login-geometry
  regex posture); (2) v4's `rounded-full` = `calc(infinity * 1px)` → 33554400px (the
  pin accepts both serializations); (3) v4 RESCALED `tracking-wider` 0.1em→0.05em —
  the component ships `tracking-[0.1em]` (the F-59 translation genus) and the pin
  holds the computed 1.2px.
- Full gate: lint 0 errors (1 documented warning) · tsc clean · unit **133/133** ·
  build green · smoke **13/13** · e2e **93/93** (88 + 5 new: the failed-login alert
  panel, the forgot-view swap, the signup 3-field card, the logo/halo/h1 depth, the
  OR/links pair; the button, signup-link, wrong-creds and 404 contracts EXTENDED
  existing tests — no prior pin weakened, one parity correction: the divider label
  pin moved from the literal "OR" to the reference's lowercase "or" + CSS uppercase).
- Docs lockstep: the count constants re-anchored (E2E=93, "Session-12 lock",
  "79 desktop + 13 mobile + 1 setup") across the unit gate, README, CLAUDE, PAD and
  the SKILL's live-tense sites (the lockstep unit gate enforced the same-commit rule).
- Screenshots: 6 captured → `docs/screenshots/` (61–66).

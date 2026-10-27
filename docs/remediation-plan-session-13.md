# VeloxPOS Remediation Plan — Session-13

**Date:** 2026-10-27 (Session-13 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-12 tree (HEAD `9caacf0`
= `5d75a61` + the operator's session-log commit). A full received-tree gate re-verification, a live
reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law — SEVENTH
consecutive cycle, zero drift on every standing pin), this cycle's NEW-depth audit — **the
reset-password surface, never measured in any prior session, all three of its states decoded live**
— plus the repo-hygiene sweep of the standing static debt the first-pass Session-12 audit found but
never remediated (the redo cycle spent its budget on the lost auth-surface work): the dead
StudyFlow scripts, four dead src files, the root StudyFlow leftovers, and the health-route log typo.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16 security),
skills/agent-browser (live computed-style measurement — computed styles are ground truth),
skills/tdd (red → green), the count-lockstep doctrine (docs-counts gate).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | `git pull` on the provisioned Session-12 workspace (fast-forward `5d75a61..9caacf0`, brings in the operator's `docs/session_20.md` — the raw log of the Session-12 conversation) | clean tree @ `9caacf0`; environment intact (.env contract, db/, 485 pkgs, chromium 1243) |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning: `no-location-assign` in login-surface.tsx, the known cookie-commit race workaround) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Build + smoke on the received tree | `bun run build` + `./scripts/smoke-test.sh` | build green (full route table, `ƒ /_not-found` Dynamic) · smoke **13/13** (incl. the artifact-hygiene probe) |
| V4 | E2E on the received tree | `CI=1 bun run test:e2e` (both projects) | **93/93** — the Session-12 baseline holds |
| V5 | Reference: standing login pins (7th cycle) | agent-browser computed @1280 | ✅ all hold — card `blur(4px)` + `rgba(255,255,255,0.95)` + 16px radius, h1 30px/-0.75px, sub 16px/500/slate-500, SSO 54px/16px, inputs 48px, sign-in 48px/14px/500, halo `blur(24px)`, ring 9999px + white/50 |
| V6 | Reference: the failed-login alert (Session-12's F-76) | wrong credentials → computed | ✅ byte-exact hold: `rgba(254,242,242,0.7)` + 1px `rgb(254,202,202)` + 12px radius + 16px padding + inner 14px `rgb(185,28,28)`, no icon, copy "Invalid email or password" |
| V7 | Reference: the app-shell families | computed on /, /Sales, /Inventory, /Cashiers, /Dashboard | ✅ sidebar 219px + 8 items + 42px active violet pill `rgba(124,58,237,0.2)` · terminal shift gate "No active shift" + CART + disabled CHARGE · Spanish families ("Historial de Ventas"/"Sin ventas", "Cajeros"/"0 usuarios registrados"/"Turnos Recientes", "0 products") · Dashboard h1 + the live date line 14px/slate-500 — all hold |
| V8 | Reference: the write-gate verification (this cycle's functional probe) | New Register dialog: fill BOTH fields via CDP keyboard events + React-native setters → observe the Create button | ⚠️ **Create NEVER enables for the demo account** (both fields genuinely typed, button stays `disabled` opacity .5) — the client-side manifestation of the documented write restriction. Consequence: **the checkout→receipt chain, the Sales receipt viewer, and every toast contract are UNMEASURABLE on the reference** (no register → no shift → no charge → no receipt; 0 sales rows; no writable action ever fires a toast — armed MutationObserver caught nothing on a Settings save attempt). They remain documented SUPERSET surfaces. |
| V9 | Reference: mobile @390×844 (the user's called-out surface) | viewport set + computed | ✅ the reference's own defect persists: NO hamburger, the 219px sidebar renders static in the flow — the clone's a11y drawer superset remains the correct posture (7th consecutive verification) |
| V10 | Reference: **NEW DEPTH — /reset-password?token=… (never measured)** | full DOM tree + computed | ⚠️ a COMPLETELY different design family from the login card: canvas `min-h-screen flex items-center justify-center bg-gray-50 p-4` (**flat gray-50**, not the slate gradient); card = the stock shadcn Card `rounded-lg max-w-md w-full shadow-lg bg-white border-0` (**8px radius, no blur**) with a **2px `h-0.5 bg-gray-900` solid top strip** (not the login's 4px slate gradient); content `p-6 pt-12 pb-10 px-12 space-y-8`; heading block `text-center space-y-2` = h2 **"Set new password"** (`text-2xl font-bold text-gray-900` = 24px/700/rgb(17,24,39)) + p "Enter your new password for VeloxPOS (Point Of Sale)" (`text-gray-600`); **NO logo/icon block** |
| V11 | Reference: the reset form's fields | full class strings + computed | ⚠️ form `space-y-6` > `space-y-5`; labels **Title Case** "New Password" / "Confirm New Password" (`text-sm font-medium text-gray-700`); inputs = shadcn base + `pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-40` → **6px radius (rounded-md), gray family, 44px, Lock icon `text-gray-400` on BOTH fields**; helper **"Must be at least 8 characters"** (`text-xs text-gray-500`) inside the first field's `space-y-2`; **NO token field — the token lives in the URL only** |
| V12 | Reference: the reset buttons | full class + computed | ⚠️ wrapper `space-y-3`: **"Reset password"** `px-3 py-2 w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm` (44px/14px/6px) + **"Back to login"** `w-full text-sm text-gray-600 hover:text-gray-700` (a full-width text button — the form state HAS a back affordance) |
| V13 | Reference: the reset submit-error state | invalid token + matching passwords → submit | ⚠️ an shadcn Alert in the **reset family** — `rounded-lg` (**8px, not the login's 12px**) + `bg-red-50/50` (**0.5 alpha, not the login's 0.7**) + `border-red-200` + inner 14px **red-600** (`rgb(153,27,27)`, not the login's red-700), no icon, INSIDE the form's space-y-5; copy **"Invalid or expired reset token"** (the reference API's own error copy) |
| V14 | Reference: the reset mismatch state | different passwords → submit | ⚠️ the SAME reset alert family renders **"Passwords do not match"** (no trailing period) client-side — the request never fires |
| V15 | Reference: **the tokenless /reset-password dead-end** (never measured) | no token param → full DOM + computed | ⚠️ a distinct state: `text-center space-y-6` — an **80px `mx-auto w-20 h-20 bg-red-100 rounded-full` chip** wrapping a lucide **circle-alert `h-10 w-10 text-red-600`** + h2 **"Invalid Reset Link"** (text-2xl font-bold text-gray-900) + p **"This password reset link is invalid or has expired."** + **"Back to Login"** (the same 44px gray-900 shadcn button) — **ZERO inputs** |
| V16 | Clone-side audit of the reset surface | source read: `reset-password-surface.tsx` (all 173 lines), `reset-password/route.ts`, `validation.ts` resetPasswordSchema, `page.tsx` | every V10–V15 delta confirmed against the clone's source: the clone ships the login-canvas slate gradient + a rounded-2xl custom-shadow card + a 72px #1e1b3a Zap circle + h1 "Set a new password" + sentence-case labels + 12px slate-family inputs + an **editable token field** + "Update password" rounded-xl py-3 + no in-form back button + a bare red-50/red-600 error paragraph + the API copy "That reset link is invalid or has expired. Request a new one." + no tokenless dead-end (the form always renders). The schema's `password min 8` already matches the reference's helper copy |
| V17 | Clone-side static audit — the dead-script census (the standing first-pass Session-12 finding, re-verified) | git-history census: `git diff --name-only 8e05a75..HEAD -- scripts/` (the pivot commit) + grep cross-references (package.json, playwright.config, tests/, live docs, smoke-test.sh internals) | **254 tracked scripts; only 11 are velox-pos-era** (modified/added since the pivot): `smoke-test.sh` (gate-wired), `capture-s7..s12-evidence.mjs` (6 evidence scripts), `vlm-verify-s8/s9/s11.mjs`, `vlm-recheck-s9.mjs` → **243 dead StudyFlow-era scripts** (the sNN-suffixed families targeting omni-study1: ref-resweep-s66..s100, capture-s13..s99, accent sweeps, z-probes, cwv audits…). Zero references from any gate, test, or live doc |
| V18 | Clone-side static audit — dead src + root leftovers | zero-importer sweep across src/lib + src/components (grep); file-era reads | **4 dead src files**: `src/lib/date.ts` (TimetableClass/StudyFlow header, stale "unit-pinned by tests/date.test.ts" comment — no such test), `src/lib/dep-audit.ts`, `src/lib/dev-preflight.ts` (both zero-importer), `src/lib/server/ai.ts` (targets routes that don't exist). **Root leftovers**: `omni-study1_SKILL.md` (124KB, the StudyFlow skill — the project's own archive convention is docs/archive/omni-study1/), `Dockerfile` + `docker-compose.yml` + `.dockerignore` (the "studyflow" service; DEPLOYMENT.md has ZERO Docker references — the Dockerfile's §Docker pointer dangles). **next.config.ts carries 3 now-dead `outputFileTracingExcludes` entries** for the removed files |
| V19 | Clone-side static audit — the log "typo" + security + v4 posture | grep + raw-byte verification (sed/cat -A/Read tool + grep -c on both patterns) | **The first-pass Session-12 audit's "`[health` log typo" is a FALSE POSITIVE, withdrawn**: the file has always read `"[health] db probe failed:"` — the bash OUTPUT DISPLAY pipeline eats the literal two-byte sequence `[h` (control-proven: `echo "[health]"` renders as `ealth]"`), so every terminal-echoed grep line showed `"ealth]"`. The raw-byte layer (the Read tool, `grep -c "health\\] db probe"` → 1) proves the string correct. A verification-doctrine lesson for the record: never diagnose a source defect from a TERMINAL ECHO — confirm against raw bytes via a second tool. Security scan clean (no dangerouslySetInnerHTML, no alert(, no secrets); v4 posture clean (`@theme inline` + `@custom-variant hover` + `tw-animate-css` intact, no config file); the docs-counts gate pins no scripts/src-file counts (deletions can't trip it); the smoke hygiene block polices directories, not the deletion candidates by name |
| V20 | Recent-changes review (the Session-12 artifacts) | full reads: login-surface.tsx (531 lines), alert.tsx, not-found.tsx + the 93-test green run | ✅ clean — the shared skeleton/per-view swap structure is correct, busy-state try/finally holds, mutually-exclusive view ids never collide, the alert locator scoping follows trap #28. No new findings on the recent code |

**Baseline verdict:** the Session-12 tree is green end-to-end (V2–V4) and every standing pin holds
for the SEVENTH consecutive cycle — but the NEW depth found **nine findings on the reset-password
surface** (a design family no prior session ever opened: the gray-family shadcn card, the three
states), and the repo-hygiene sweep re-verified **four standing static-debt findings** the
first-pass Session-12 audit had already proven but which never landed in a plan (the redo cycle's
budget went to the lost auth work). No reference drift on any pinned surface; no server defects;
no security findings.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| **F-86** | **MEDIUM** (visual parity — the reset canvas) | `reset-password-surface.tsx` (the main) | The clone reuses the login canvas (`login-canvas` = the slate-50→slate-100 gradient). The reference's reset page is a DIFFERENT canvas: `min-h-screen flex items-center justify-center bg-gray-50 p-4` — flat **gray-50**, no gradient, and NOT theme-light-scoped. | V10 vs V16 | A dedicated reset canvas: the flat gray-50 wrapper (no `login-canvas`, no `.theme-light` — the gray family uses literal classes). E2E: pin the computed `rgb(249,250,251)` + `linear-gradient`-free background. |
| **F-87** | **MEDIUM** (visual parity — the reset card) | `reset-password-surface.tsx` (the card) | The clone ships `rounded-2xl bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)]`. The reference: the stock shadcn Card — `rounded-lg` (**8px**) + `shadow-lg` + `border-0` + `max-w-md w-full` — carrying a **2px solid `h-0.5 bg-gray-900` top strip** (NOT the login's 4px slate-200/300 gradient strip), content padding on an inner wrapper `p-6 pt-12 pb-10 px-12 space-y-8`. | V10 vs V16 | Rebuild the card to the measured contract (8px radius, shadow-lg, the 2px gray-900 strip, the pt-12/pb-10/px-12 padding rhythm). E2E: radius + strip height/color + computed shadow presence. |
| **F-88** | **MEDIUM** (visual parity — the heading block) | `reset-password-surface.tsx` (the h1 block) | The clone ships a 72px `#1e1b3a` Zap circle + h1 **"Set a new password"** + "Choose a strong password for your account." The reference: **NO icon block at all** — a `text-center space-y-2` with h2 **"Set new password"** (`text-2xl font-bold text-gray-900` = 24px/700/rgb(17,24,39)) + p **"Enter your new password for VeloxPOS (Point Of Sale)"** (`text-gray-600`). | V10 vs V16 | Drop the Zap circle; render the measured h2 (level 2, gray-900, the reference's exact copy — no "a") + the measured desc. E2E: h2 text/size/color, desc copy, zero img/circle on the card. |
| **F-89** | **MEDIUM** (visual parity — the form family) | `reset-password-surface.tsx` (the fields) | The clone ships sentence-case labels ("New password"/"Confirm password"), slate-family `rounded-xl` inputs (12px radius, slate-200 borders, `pl-9` Lock on one field), NO helper text, and an **editable "Reset token" field**. The reference: **Title Case** labels "New Password"/"Confirm New Password" (`text-sm font-medium text-gray-700`), inputs `pl-10 h-11 bg-gray-50/50 border-gray-200 rounded-md focus:border-gray-400 focus:ring-gray-400` (**6px radius, gray family, 44px fixed**), **Lock icons `text-gray-400` on BOTH fields**, the helper **"Must be at least 8 characters"** (`text-xs text-gray-500`) inside the first field's `space-y-2`, and **NO token field — the token lives in the URL only**. | V11 vs V16 | Rebuild the form: `space-y-6 > space-y-5`, the measured field wrappers (space-y-2, label, relative input + Lock, the helper under the first field), the token pulled from the URL only (no editable field). E2E: label text+color, input radius/border/bg/height, the helper's presence + 12px, zero token inputs. |
| **F-90** | **MEDIUM** (functional parity — no token field) | `reset-password-surface.tsx` (the token field) | The clone surfaces an editable "Reset token" input (a single-box convenience). The reference NEVER shows a token field — the token is URL-carried and invisible; validity is only checked server-side on submit. | V11, V15 vs V16 | Remove the token field (the useTokenFromUrl hook already reads the URL; the override setter goes). E2E: `getByLabel("Reset token")` count 0. |
| **F-91** | **MEDIUM** (visual + functional parity — the buttons) | `reset-password-surface.tsx` (the actions) | The clone ships "Update password" (`rounded-xl bg-slate-900 px-4 py-3 font-semibold` — 12px radius, 16px/600) and NO back affordance in the form state. The reference: **"Reset password"** (`px-3 py-2 w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm` — **6px radius, 14px/500, 44px**) AND a **"Back to login"** full-width text button (`w-full text-sm text-gray-600 hover:text-gray-700`) in a `space-y-3` wrapper. | V12 vs V16 | Render both measured actions; the back button routes to /login. E2E: button text/geometry/colors + the back link's presence and navigation. |
| **F-92** | **MEDIUM** (visual parity — the reset alert family) | `reset-password-surface.tsx` (the error block) + `alert.tsx` | The clone renders errors as a bare `rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600` paragraph. The reference's reset surface uses its OWN alert family — `rounded-lg` (8px) + **`bg-red-50/50`** (0.5 alpha) + `border-red-200` 1px + **p-4** + inner 14px **red-600** (rgb(153,27,27)), no icon — DIFFERENT from the login's F-76 panel (12px/0.7/red-700). The copy: API errors surface the reference's exact "Invalid or expired reset token"; the client-side mismatch renders "Passwords do not match" (no period). | V13, V14 vs V16 | Extend the Alert primitive with the reset family (`tone="error-soft"`: rounded-lg + red-50/50 + text-red-600) and render both error paths through it. E2E: the full computed alert contract on both paths. |
| **F-93** | **MEDIUM** (visual + functional parity — the tokenless dead-end) | `reset-password-surface.tsx` (the render states) | The clone renders the full form for EVERY visit (a tokenless URL shows the form with an empty token field). The reference renders a distinct dead-end when the token param is absent: `text-center space-y-6` — the **80px `mx-auto w-20 h-20 bg-red-100 rounded-full` chip** wrapping a lucide **circle-alert `h-10 w-10 text-red-600`**, h2 **"Invalid Reset Link"** (24px/700 gray-900), p **"This password reset link is invalid or has expired."**, and the 44px gray-900 **"Back to Login"** button. ZERO inputs. | V15 vs V16 | A 3-state surface: tokenless → the dead-end; token present → the form; post-success → the clone's own done card (the reference's success state is unmeasurable — documented superset, restyled onto the measured card family). E2E: the dead-end's full contract + zero inputs + the back-nav. |
| **F-94** | **LOW** (copy parity — the API error) | `src/app/api/auth/reset-password/route.ts:27` | The clone's API returns "That reset link is invalid or has expired. Request a new one."; the reference's alert carries its API's copy — "Invalid or expired reset token". The UI unwraps and renders the API copy, so the copy fix belongs to the route. | V13 vs V16 | One-line copy change (no schema/contract change; no other site references the old copy — swept). E2E: pinned end-to-end through F-92's submit test. |
| **SD-1** | **MEDIUM** (repo hygiene — the dead scripts) | `scripts/` | **243 of 254 tracked scripts are dead StudyFlow-era weight** (the sNN families targeting omni-study1.base44.app — never touched since the velox-pos pivot commit `8e05a75`). Every future session re-trips over them; the first-pass Session-12 audit already proved them dead but the finding never landed in a plan. The git-history census is the authoritative keep-list: exactly 11 velox-pos-era files. | V17 | Delete the 243 (keep `smoke-test.sh`, `capture-s7..s12-evidence.mjs`, `vlm-verify-s8/s9/s11.mjs`, `vlm-recheck-s9.mjs`). Proof: the full gate green on the cleaned tree (nothing gate-wired or doc-referenced is removed). |
| **SD-2** | **MEDIUM** (dead code — src) | `src/lib/date.ts`, `src/lib/dep-audit.ts`, `src/lib/dev-preflight.ts`, `src/lib/server/ai.ts` | Four zero-importer files left from the StudyFlow pivot (date.ts's own header cites a test file that doesn't exist; ai.ts targets routes that don't exist; dep-audit/dev-preflight were never imported by the velox-pos tree). tsc type-checks them on every gate run — pure dead weight. | V18 | Delete all four. Proof: zero-importer census (V18) + the full gate green (lint/tsc/build). |
| **SD-3** | **MEDIUM** (repo hygiene — root leftovers) | `omni-study1_SKILL.md`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `next.config.ts` | The StudyFlow skill (124KB) sits at the repo root beside the live `velox-pos_SKILL.md` — the project's own convention for retired StudyFlow material is `docs/archive/omni-study1/`. The Docker stack is StudyFlow-branded (service `studyflow`, image `studyflow:latest`) and its DEPLOYMENT.md §Docker pointer dangles (zero Docker references in the velox-pos docs — the deployment story is the standalone build). `next.config.ts` carries 3 excludes entries for files that will no longer exist. | V18 | `git mv omni-study1_SKILL.md docs/archive/omni-study1/` (preserved per the archive convention); delete the 3 Docker files; drop the 3 dead excludes entries. |
| **SD-4** | ~~LOW~~ **WITHDRAWN (false positive)** | `src/app/api/health/route.ts:21` | The first-pass Session-12 audit recorded a `[health` log typo (`"ealth] db probe failed:"`). Re-verified at the raw-byte layer this cycle: the line has ALWAYS read `"[health] db probe failed:"` — the apparent typo was the bash output display eating the literal `[h` sequence (control-proven: `echo "[health]"` renders `ealth]"`). **No fix; nothing to change.** The lesson is recorded in V19 and the SKILL's debugging guide: never diagnose a source defect from a terminal echo — confirm raw bytes via a second tool. | V19 | Withdrawn — no action. |

**Explicitly NOT findings (verified — do not "fix"):**
- **The checkout→receipt chain, the Sales receipt viewer, the toast contracts** — UNMEASURABLE on
  the reference (V8: the demo account is client-side write-gated — the New Register Create never
  enables; 0 registers/0 sales; no writable action fires a toast). Documented superset surfaces;
  the clone's own contracts own them.
- **The reference's mobile defect** (no hamburger, the static 219px sidebar at 390px) — persists,
  7th consecutive verification; the clone's drawer superset stays correct.
- **The Dashboard date line** — the clone's `todayLine()` renders the identical
  "Tuesday, October 27, 2026" at 14px/slate-500 through PageHeader. Matched.
- **The clone's post-reset SUCCESS card** — the reference's success state is unmeasurable (no
  valid token is obtainable); the clone's done card stays a documented superset, restyled onto the
  measured card family.
- **The clone's login-signup mismatch copy** ("Passwords do not match." WITH the period) — a
  different surface from the reset mismatch; the reference's signup path was not measured this
  cycle (its registration is a live write — probing it would create a real account on the
  reference); the reset surface adopts ITS measured copy exactly.
- **The New Register dialog's disabled Create** — the client-side write gate itself (V8's probe
  instrument), not a clone-side gap; the clone's Create-enables-when-valid is the functional
  superset by design.
- **`resetPasswordSchema`'s `password min 8`** — already matches the reference's
  "Must be at least 8 characters" helper. No schema change.

---

## 2. The TDD task list

**RED first — every pin fails on the pre-fix tree, then GREEN, then the static sweep:**

| # | Task | Type | Covers |
|---|------|------|--------|
| T-1 | NEW `tests/e2e/auth.spec.ts` test: the reset-password form card (with `?token=`) — the gray-family contract: canvas `rgb(249,250,251)` flat (no gradient), card 8px radius + shadow-lg + the 2px gray-900 strip, h2 "Set new password" 24px/700/rgb(17,24,39), desc copy, ZERO img/circle, Title Case labels rgb(55,65,81), inputs 6px radius + `rgb(229,231,235)` border + `rgba(249,250,251,0.5)` bg + 44px, the "Must be at least 8 characters" helper, ZERO token inputs, "Reset password" 44px/rgb(17,24,39), "Back to login" present | RED pin | F-86/87/88/89/90/91 |
| T-2 | NEW auth.spec test: the invalid-token submit → the reset alert family (8px radius + `rgba(254,242,242,0.5)` bg + `rgb(254,202,202)` border + inner 14px `rgb(153,27,27)`) carrying the API's copy "Invalid or expired reset token" end-to-end | RED pin | F-92 + F-94 |
| T-3 | NEW auth.spec test: the mismatch check is CLIENT-SIDE — route interception on `**/api/auth/reset-password` counts ZERO requests, the alert renders "Passwords do not match", the URL stays /reset-password | RED pin | F-92 |
| T-4 | NEW auth.spec test: the tokenless visit renders the dead-end — h2 "Invalid Reset Link", the 80px red-100 circle chip, the circle-alert svg, the copy, "Back to Login" 44px, ZERO inputs; clicking back lands on /login | RED pin | F-93 |
| T-5 | **RED proof**: run the extended suite against the pre-fix standalone build — expect exactly the 4 targeted failures, zero collateral | gate | all parity |
| T-6 | Extend `src/components/ui/alert.tsx` with the reset family: `tone="error-soft"` → `rounded-lg border-red-200 bg-red-50/50` + inner `text-red-600` (the login's `error` tone is untouched — its pins police the 12px/0.7/red-700 family) | GREEN | F-92 |
| T-7 | Rewrite `reset-password-surface.tsx` as the 3-state measured surface: the dead-end (F-93), the form state (F-86..F-91 — the flat gray-50 canvas, the shadcn card + 2px strip, the h2 block, the Title Case gray-family fields + helper, URL-only token, the measured buttons), the done state restyled onto the measured card (documented superset) | GREEN | F-86..F-93 |
| T-8 | The API copy: `errorResponse(400, "Invalid or expired reset token")` in reset-password/route.ts | GREEN | F-94 |
| T-9 | Delete the 243 dead StudyFlow scripts (the 11-file keep-list: smoke-test.sh, capture-s7..s12-evidence.mjs, vlm-verify-s8/s9/s11.mjs, vlm-recheck-s9.mjs) | cleanup | SD-1 |
| T-10 | Delete the 4 dead src files (`src/lib/date.ts`, `src/lib/dep-audit.ts`, `src/lib/dev-preflight.ts`, `src/lib/server/ai.ts`) | cleanup | SD-2 |
| T-11 | `git mv omni-study1_SKILL.md docs/archive/omni-study1/`; delete `Dockerfile`, `docker-compose.yml`, `.dockerignore`; drop the 3 dead `outputFileTracingExcludes` entries in next.config.ts | cleanup | SD-3 |
| T-12 | ~~Fix the health log typo~~ **WITHDRAWN** — SD-4 is a false positive (the display-pipeline artifact, V19); the source was verified correct at the raw-byte layer; nothing to change | cleanup | SD-4 (withdrawn) |
| T-13 | **GREEN proof + full gate**: lint 0 · tsc clean · unit **133/133** · build green (hygiene-clean) · smoke **13/13** · e2e **97/97** (93 + 4 new) | gate | all |
| T-14 | Docs lockstep: the counts re-anchored (E2E 93→**97**, "Session-13 lock", "83 desktop + 13 mobile + 1 setup") across docs-counts + README + CLAUDE + PAD + SKILL; the reset-surface contract entries in AGENTS/CLAUDE; the scripts keep-list + static-sweep record; PAD revision block v1.11; velox-pos_SKILL.md v2.9.0; worklog.md; this plan's execution record; `docs/session_21.md` | docs | all |
| T-15 | Evidence screenshots → `docs/screenshots/` (67–70: the reset form card, the error alert, the dead-end, the done-state/full-app sanity) via a persisted capture script | evidence | all |

**Risks & mitigations:**
- **The Alert primitive's new tone must not leak** — the login's `error` tone keeps
  rounded-xl/red-50/70/red-700; its existing e2e pins (the wrong-creds contract) police the
  boundary. The reset tests pin the NEW family's full computed contract.
- **The reset tests hit the real API** (T-2's 400 round-trip) — reset-password has NO rate
  limiter (verified: the route carries no limiter import; only login/register/forgot do), and no
  state pollutes (no valid token is ever created; the bogus token only reads).
- **The hydration gate** — the reset submit ships `disabled` until mounted (the login pattern);
  the tests wait for `toBeEnabled` before clicking (the established auth.spec idiom).
- **The v4 serialization traps may bite the new pins** (oklab alpha, rounded-full infinity) —
  the reference's `bg-red-50/50` will compute as `oklab(.../0.5)` in the clone; pin by regex
  accepting both serializations (the trap #27 posture), and pin alpha-modified backgrounds via
  `expect.poll` — never raw single-shot reads.
- **The deletions** — the proof is the full gate on the cleaned tree + the V17/V18 census that
  nothing references the removed files; the docs-counts gate pins no scripts/src counts; the smoke
  hygiene block polices directories (all still present or still excluded).
- **The px-12 fixed padding** — the reference's reset card keeps 48px sides at every width (no
  responsive tier); the mobile project doesn't run auth.spec, so desktop pins only — noted, no
  mobile pin this cycle (same posture as the rest of the auth surface's pins).
- **No prior pin weakened** — the 93 baseline tests stay untouched; the 4 new tests are pure
  additions.

---

## 3. Execution order

1. RED pins (T-1…T-4) → standalone build → RED proof (T-5): exactly 4 failures.
2. GREEN (T-6 → T-7 → T-8) → lint + tsc + unit → build.
3. The static sweep (T-9 → T-10 → T-11 → T-12) → the full gate (T-13):
   lint 0 · tsc · unit 133/133 · build · smoke 13/13 · e2e 97/97.
4. Evidence (T-15) → docs lockstep (T-14) → worklog → commit → push (main only, the SSH wrapper).

## 4. Execution record (filled in as the cycle runs)

- RED proof: **4/4 targeted failures, zero collateral** (the four new
  auth.spec pins — the form card, the invalid-token alert, the mismatch
  check, the tokenless dead-end; the setup project's sign-in passes
  alongside as a run dependency).
- GREEN landed in one pass: the `error-soft` Alert tone + the red-800 hex
  pin, the 3-state surface rewrite (the async server page passing the token
  from `searchParams` — `/reset-password` renders Dynamic, no hydration
  flip), and the API copy. No v4 serialization surprises in the GREEN run —
  the regex postures and hex pins were applied up front from the standing
  trap catalog; the clone's alert bg computes `oklab(.../0.5)` exactly as
  the trap #27 posture anticipates (the e2e regex + the evidence script's
  check both accept it).
- The count-lockstep gate fired mid-cycle exactly as designed (the live e2e
  census read 97 against the constant's 93): the constants re-anchored
  (E2E=97, "Session-13 lock", "83 desktop + 13 mobile + 1 setup") together
  with README, CLAUDE, PAD and the SKILL's live-tense sites — including the
  two literal strings pinned inside the gate itself ("Session-13 lock",
  "83 desktop").
- The static sweep: **243 scripts deleted** (exactly the 11-file keep-list
  remains), **4 dead src files deleted**, `omni-study1_SKILL.md` archived,
  the Docker trio deleted, the 3 dead excludes entries dropped.
- **SD-4 withdrawn mid-execution** — the T-12 "typo fix" was about to run
  when the raw-byte verification proved the source correct (the `[h`
  display-eating artifact; V19's control test). The plan was corrected in
  place; no source change was made.
- Full gate on the final cleaned tree: lint 0 errors (1 documented warning)
  · tsc clean · unit **133/133** (13 files) · build green (hygiene-clean;
  `/reset-password` Dynamic) · smoke **13/13** (the artifact-hygiene probe
  passes with the cleaned excludes) · e2e **97/97** (93 + 4 new).
- Live evidence (`scripts/capture-s13-evidence.mjs`): **10/10** — the
  canvas/card/strip/h2/labels/fields/buttons contract, the client-side
  mismatch (ZERO requests), the FULL one-shot reset round-trip
  (forgot-password → resetUrl → reset → done; the owner's password
  rewritten to its current value, the dev db's credentials unchanged), the
  invalid-token alert family + API copy, the tokenless dead-end (80px chip,
  40px icon, ZERO inputs), and the login-surface sanity sweep (the slate
  gradient untouched). Screenshots **67–70**.
- Docs lockstep: AGENTS.md (the reset-password contracts section + the
  write-gate + display-artifact lessons), CLAUDE.md (the same contracts),
  PAD v1.11 (the revision block + the title/last-updated bumps + the
  Session-13 re-certification note), velox-pos_SKILL.md v2.9.0 (the §6
  theme-light scope update, the §14 debugging row, the Session-13
  addendum), the worklog's Session-13 entry, and `docs/session_21.md`.

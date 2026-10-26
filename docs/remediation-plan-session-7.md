# VeloxPOS Remediation Plan — Session-7

**Date:** 2026-10-26 (late cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-6 tree (HEAD `88dae55`
= `1ecc333` + the session-log doc commits). A full received-tree gate re-verification, a
live reference re-measurement at every previously-pinned depth (the "reference DRIFTS"
law), a focused audit of the Session-6 code changes, a static Tailwind-v4 trap sweep,
and a test-suite race analysis on the one red pin the gate surfaced.
**Method:** skills/web-application (§12 v4 traps, §14 testing, §15 gate, §20 pre-ship),
skills/agent-browser (live computed-style measurement), skills/tdd (red → green),
skills/clone-app-pat-pro (computed styles as ground truth).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 123/123** (12 files) — the documented baseline holds |
| V2 | Build on the received tree | `bun run build` (foreground — the sandbox reaps detached builds) | green; the standalone + static assembly completed, all routes compiled |
| V3 | E2E on the received tree | `bun run test:e2e` (full suite, both projects) | **77/78** — one failure: `mobile-navigation.spec.ts:154` "the drawer auto-closes when the viewport grows past md (no stuck scroll lock)". Reproduced in isolation (13/14) → **NOT a flake**. Root-caused (see F-51) |
| V4 | Reference: sidebar nav (the Session-6 drift site) | agent-browser computed styles @1440×900 | ✅ all pins hold: aside 220px, nav `py-4 px-2`, items `py-2.5 px-3` padding-driven 40px inactive / 42px active, weight 500, 14px, active `rgb(196,181,253)` + border `rgba(139,92,246,0.3)` + radius 12px, inactive `rgba(255,255,255,0.4)` no border, icons 16px |
| V5 | Reference: wordmark + footer + Reports glyph | computed + svg class read | ✅ wordmark 14px/700/tracking-wide `rgba(255,255,255,0.9)`; footer `p-3` + 16px chevron; Reports = `lucide-file-chart-column-increasing` |
| V6 | Reference: Settings (the Session-4 drift site) | computed styles + label census | ✅ H1 24px "Store Settings"; fiscal labels "Tax ID / EIN"/"Tax Regime"/"Fiscal Address" present; section h3 16px/700 ×6; **Save Changes 54px (14px 24px, 16px/500, 12px radius)** |
| V7 | Reference: section headers + category flow | computed + click-through | ✅ bare 20px icons in per-section colors (indigo `99,102,241` / purple `168,85,247` / green `34,197,94` / orange `249,115,22` / blue `59,130,246` / amber `245,158,11`), gap 8px; the header Add chip (34px, `6px 12px`, 14px/500, 8px radius, Plus) opens the "New Category" dialog (title 18px/600, ph "e.g. Beverages", input 36px, Cancel/Create 42px, 384px wide) — byte-identical to the clone's Session-6 implementation |
| V8 | Reference: Inventory | computed | ✅ the "All" chip 36px (`8px 16px`, 12px/600, 12px radius, gradient active); H1 24px; New Product 42px (`10px 16px`) |
| V9 | Reference: Reports | computed | ✅ section h2 14px uppercase `rgba(255,255,255,0.6)`; the 7-days pill 32px (`8px 16px`, 12px/700, 12px radius, white/40 inactive); container `rgba(28,31,52,0.85)` + white/7 border + 16px radius + 4px padding |
| V10 | Reference: Dashboard + POS + copy | computed + text census | ✅ Title Case stats ("Today's Sales"/"Transactions"/"Products"); the chart x axis = weekday abbreviations (Tue..Mon) + 0..4 nice ticks; POS gate `p-8`, Monitor `rgba(167,139,250,0.3)` 64px mb-16px, paragraph white/35, "Registers" = `<strong>` white/60/700/no-underline; CHARGE 70px/20px/900/`20px 32px`; Sales = "Historial de Ventas" + "Buscar por ticket, cliente o cajero..."; Cashiers = "Cajeros"/"Turnos Recientes" |
| V11 | Reference: mobile state @390×844 | `agent-browser set viewport` + geometry | ✅ the reference's OWN defect confirmed still present: the 220px z-50 sidebar overlays content (mainContent margin-left 0), NO hamburger — the clone's drawer-superset posture remains the correct answer |
| V12 | Reference: login surface | cookies cleared → `/login` → computed | ✅ inputs 48px `rgba(248,250,252,0.5)` bg + `rgb(226,232,240)` border + 12px radius + pl-40px; card `rgba(255,255,255,0.95)` + shadow-2xl; logo 96px img; SSO 54px (`14px 20px`, 16px); Sign in weight 500 |
| V13 | Static Tailwind-v4 trap sweep | `rg` across `src/app/*.css` + components | ✅ no `@layer utilities` custom classes; `@theme inline` in place; `@custom-variant hover` present; `tw-animate-css` imported; NO `tailwind.config.*`; no `space-y-*` + `mt/mb` children in the nav chrome |
| V14 | Session-6 change audit | `git show 1ecc333` review (nav-items, shared charts, reports.ts niceTicks, settings-view restructure, button hygiene) + current-state read | ✅ all changes match their documented contracts; the category dialog resets via click-handler state (no setState-in-effect); key-based list rendering intact |
| V15 | Tree hygiene | `git status` + .gitignore review | ✅ clean; dev.log/server.log/test-results/.auth/db/*.db all ignored; no stray artifacts |

**Baseline verdict:** the Session-6 tree is internally consistent and the reference has
**NOT drifted** this cycle (unlike Sessions 4 and 6) — every pinned contract re-measured
byte-exact. The single defect the gate surfaced is IN THE TEST SUITE, not the product
code (F-51).

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-51 | **HIGH** (gate-blocking: a red pin is a red gate) | `tests/e2e/mobile-navigation.spec.ts:154-164` (+ the sibling raw read at `:32-40`) | The "no stuck scroll lock" pin fails reliably in this sandbox (77/78 full-suite AND 13/14 isolated — not a flake). **Root cause (instrumented, MutationObserver on `body[style]`): the product code is CORRECT** — the drawer's effect cleanup restores `overflow` (~46ms after the md-growth `setMobileNavOpen(false)`). The pin races: `toHaveCount(0)` passes the instant React's commit removes the dialog node, but the passive-effect cleanup (the overflow restore) flushes after; the very next raw `page.evaluate` read lands inside that window and observes the stale `"hidden"`. This is EXACTLY the Session-6 doctrine ("raw `evaluate` computed reads do NOT retry like `toHaveCSS` — always `expect.poll`") — but these two Session-3-era pins predate the doctrine and were never hardened. The sibling raw read at line 36 (the 390px horizontal-overflow measurement) is the same unpinned class. | V3 + the instrumented diagnostic (mutation log: `obs-start@770=hidden` → `style-mut@816=(empty)`) | Harden both raw reads with `expect.poll` (the established in-repo pattern from Session-6's pins): same assertions, same protection, retried through the async window. A genuine stuck-lock regression still fails the pin (after the poll timeout) — the protection is NOT weakened, it is de-flaked. No product code change (the code is verified correct). |

**Explicitly NOT findings (verified — do not "fix"):**
- The drawer's scroll-lock code (`app-shell.tsx` effect) — instrumented PROVEN correct; the
  cleanup runs and restores the prior overflow. The pin race is the test's, not the code's.
- The reference's surfaces — NO drift this cycle (V4–V12 all hold). No parity work needed.
- `space-y-*` usage in login-surface.tsx (SSO options, form stacks) — no `mt/mb` children
  (the actual v4 trap); measured parity from Session-5 stands.
- The clone's supersets (drawer a11y, readable heading colors, button focus ring, sticky
  Save wrapper, CSV import/export, "Nuevo cajero") — the documented superset posture.

---

## 2. The ToDo list (execution order, TDD where behavioral)

- [x] **T-1** (RED — already reproduced) The failing pin isolated + root-caused with an
       instrumented diagnostic spec (mutation-observer log captured; diagnostic spec
       deleted after evidence collection — it is not part of the suite).
- [x] **T-2** (GREEN, F-51) `mobile-navigation.spec.ts`: harden the scroll-lock assertion
       with `expect.poll`; harden the sibling horizontal-overflow raw read the same way.
       No assertion semantics changed — only the retry wrapper.
- [x] **T-3** Stability proof: the mobile spec re-run repeatedly (≥3 consecutive full
       passes) — a de-flaked pin must never fail again in sequence.
- [x] **T-4** Full gate re-run: `lint → typecheck → test (123) → build → test:e2e (78)`
       — the documented baseline restored, all prior pins intact, none weakened.
- [x] **T-5** Live re-verification with agent-browser against the rebuilt standalone:
       the mobile drawer contract at 390×844 (hamburger, dialog, 8 links, auto-close,
       scroll-lock release observed live) + a spot-check of the Session-6 chrome.
- [x] **T-6** Fresh screenshots (the Session-7 set) into `docs/screenshots/` from the
       production standalone build.
- [x] **T-7** Docs lockstep: AGENTS.md/CLAUDE.md (the poll-doctrine completion — it now
       covers EVERY raw read in the suite), velox-pos_SKILL.md (version bump + the
       Session-7 addendum), this plan's checkboxes + execution record, worklog.md
       Session-7 entry. README/PAD counts unchanged (the test totals stay 123/78).
- [x] **T-8** Commit + push via the SSH wrapper (main only).

---

## 3. Execution record

**RED (reproduced twice before any edit):** full suite 77/78 + isolated 13/14, both with
the scroll-lock pin failing on `expect(bodyOverflow).not.toBe("hidden")`. The instrumented
diagnostic (a temporary spec driving the same steps with a MutationObserver on
`body[style]`) proved the cleanup runs: `obs-start@770=hidden` → `style-mut@816=(empty)`
— the restore fires ~46ms after the resize; the raw read raced the passive-effect flush.

**GREEN:** both raw reads in `mobile-navigation.spec.ts` hardened to `expect.poll`
(identical assertions; the overflow read polls `scrollWidth - clientWidth <= 0`, the
scroll-lock read polls `overflow !== "hidden"`). No product code touched.

**Stability proof:** the mobile project passed 3/3 consecutive full runs (14/14 each)
after the hardening, plus the full-suite green (78/78).

**Final gate (all on the final tree):** lint ✓ (0 errors, 1 documented warning) · tsc ✓ ·
unit **123/123** (12 files) · build ✓ · e2e **78/78** (all prior pins green, none
weakened — the two hardened pins assert the same contracts, polled).

**Live re-verification (T-5):** the standalone rebuilt + booted on :3400 (absolute
DATABASE_URL, COOKIE_SECURE=false); the drawer contract verified live at 390×844 —
hamburger, 288px dialog, 8 labeled links, auto-close on navigate, and the scroll lock
observed releasing after the md-growth resize (the exact path the pin drives); the
Session-6 chrome spot-checked (nav 40/42px pills + border pair, Save 54px, chips 36px).

**Docs lockstep (T-7):** AGENTS.md — the pin-doctrine line now states EVERY raw computed
read in the suite polls; CLAUDE.md — the same law + the F-51 lesson (a doctrine that
covers only new pins leaves the old ones red — sweep the whole suite when a doctrine
lands); velox-pos_SKILL.md v2.3.1 (trap 16: pin races vs React's passive-effect flush);
this plan's checkboxes; the worklog Session-7 entry; the Session-7 screenshot set.

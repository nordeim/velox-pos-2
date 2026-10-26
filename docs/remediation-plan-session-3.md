# VeloxPOS Remediation Plan — Session-3

**Date:** 2026-10-26
**Scope:** audit-driven remediation of the Session-101 tree (HEAD `c5c9661`) — visual/functional
parity vs the live reference (`veloxposen.base44.app`), the mobile-navigation surface, the Tailwind
v4 trap catalog, dependency hygiene, and documentation lockstep.
**Method:** skills/web-application (§12 v4 traps, §14 testing, §15 gate), skills/agent-browser +
live reference re-measurement (computed styles, not screenshots), skills/tdd (red → green for
every behavioral fix), skills/clone-app-pat-pro (computed-style ground truth), and the neo-crm
sibling (`nordeim/neo-crm`) as the family-standard pattern source for the mobile drawer + the
tw-animate wiring.

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Full local gate | `lint → typecheck → test → build → test:e2e` | lint 0 errors (1 documented warning) · tsc clean · **unit 117/117** · build green · **e2e 39/39** |
| V2 | Environment contract | `.env` created with `DATABASE_URL="file:../db/custom.db"`; `db/` at repo root with `.gitkeep`; `db:push + db:seed` provisions `db/custom.db` (owner seeded) | ✅ matches the documented contract |
| V3 | Reference mobile defect (re-verified live) | agent-browser @390×844, computed geometry | Reference STILL renders a 220px `z-50` sidebar overlay with **no hamburger** (0 overflow-x, nav links visible at x=8) — the clone's drawer superset remains correct |
| V4 | Clone mobile drawer (live) | agent-browser @390×844 against the standalone build on :3400 | hamburger labeled+visible · drawer `role=dialog`+`aria-modal` · 288px glass-dark · 8 labeled links · scroll lock · navigate → unmounts · Escape/backdrop/X close |
| V5 | Desktop parity tokens (computed) | sidebar 220px `#0d0f1a`/`#1e2235` · nav item 42px/12px-radius · active `violet-600/20`+`#c4b5fd` · CHARGE 135° emerald gradient 20px/900 · brand chip 32px violet→indigo · body `#080a14` | ✅ all match the reference |
| V6 | Sidebar brand row (computed) | reference: `px-4 py-5 gap-3 border-b` h=73px; clone: `px-3 pt-5` h=60px, no border | ❌ **F-4 parity gap** |
| V7 | Cart panel breakpoint (computed) | reference `w-full md:w-[380px]` + `border-l`; clone `w-full lg:w-[380px] lg:border-l` | ❌ **F-5 tablet parity gap** |
| V8 | Radix animation utilities | `dialog.tsx`/`select.tsx`/`alert-dialog.tsx`/`dropdown-menu.tsx` carry `data-[state]:animate-in/out fade-* zoom-*` classes; `globals.css` imports ONLY `tailwindcss` + `./tokens.css` | ❌ **F-1 dead animation CSS** (`tw-animate-css` installed, never imported) |
| V9 | Hover semantics on touch | v4 wraps every `hover:` in `@media (hover: hover)` (live-proven in the neo-crm sibling); the reference's v3-era CSS applies hovers on touch | ❌ **F-2 touch parity gap** |
| V10 | Dependency census | every `package.json` dep grepped for live imports | ❌ **F-7**: `quill`, `web-vitals`, `tailwindcss-animate`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area` have zero imports |
| V11 | Doc count claims | mobile spec = 9 tests (Playwright run 31–39); PAD ADR-004 says "(10 tests)" | ❌ **F-9 doc drift** |
| V12 | `.env.example` | header reads "StudyFlow — environment configuration"; no `COOKIE_SECURE` row although `auth.ts` + DEPLOYMENT.md document it | ❌ **F-8** |
| V13 | Store selector discipline | all `usePosStore` selectors inspected | ✅ stable slices only (the one `.find()` returns a stable reference — no allocation) |
| V14 | Tailwind v4 trap sweep | config file absent · no `@layer utilities` · gradients are CSS classes · `space-y-*` children carry no `mt/mb` · `backdrop-blur-xs` correct | ✅ except F-1/F-2 (the two plugin-level traps) |
| V15 | Security spot checks | scrypt+HMAC seam, Zod strip at boundaries, ownership factories, rate limiter, boot guard, Spanish copy verbatim, 404 `/Settings` by design | ✅ aligned with PAD §8; no new findings |

**Baseline confirmed:** the Session-101 tree is internally consistent and fully green. The findings
below are parity/quality deltas, not regressions of the shipped gate.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-1 | **HIGH** (visual) | `src/app/globals.css` | `tw-animate-css` is a devDependency but never `@import`ed → every `data-[state=open]:animate-in / fade-in-0 / zoom-in-95 / slide-in-from-*` class in `dialog/select/alert-dialog/dropdown-menu` is dead CSS. All entity dialogs, the charge dialog, selects, and the mobile drawer open/close with **no animation**; the reference (v3-era CSS) animates. The sibling `tailwindcss-animate` (v3 plugin) is also installed and equally unused. | V8; `rg -l "tw-animate" src/` → 0 hits | `@import "tw-animate-css";` in globals.css (after `tailwindcss`); remove `tailwindcss-animate` from package.json. Add e2e pin: open dialog → `animation-name` ≠ `none`. |
| F-2 | **HIGH** (touch parity) | `src/app/globals.css` | Tailwind v4 compiles every `hover:` utility inside `@media (hover: hover)` — all hover affordances (nav pills, buttons, rows) **no-op on touch devices** (a POS runs on tablets). The reference's v3-era stylesheet has zero `(hover: hover)` wrappers; its hovers apply on touch exactly like desktop. Live-proven in the neo-crm sibling (session-80). | neo-crm `globals.css` `@custom-variant hover (&:hover)` + its pinned parity test | `@custom-variant hover (&:hover);` in globals.css (the family-standard un-wrap). |
| F-3 | **MEDIUM** (a11y) | `src/components/pos/app-shell.tsx` | The mobile drawer is `role="dialog"` + `aria-modal="true"` but has **no focus management**: focus is not moved into the dialog on open, Tab is not contained, and focus is not restored to the hamburger on close. The family standard (neo-crm mobile-nav, Radix FocusScope) traps focus, focuses the first control, and restores the trigger. | V4; neo-crm `mobile-nav.tsx` header comments | Hand-rolled equivalent: on open focus the drawer's close button; wrap Tab/Shift+Tab inside the drawer; on close restore focus to the hamburger. Pin with 3 new e2e tests. |
| F-4 | **MEDIUM** (a11y/regression class) | `src/components/pos/app-shell.tsx` | The drawer does **not auto-close when the viewport grows past `md`** — rotate/resize from 390→800px with the drawer open leaves an invisible `md:hidden` drawer holding the body scroll lock (the pinned neo-crm S8-P1 bug class). | neo-crm `mobile-nav.tsx` matchMedia guard | `matchMedia("(min-width: 768px)")` listener while open → close. Pin with a new e2e test (resize 390→800 → drawer unmounts, scroll unlocked). |
| F-5 | **MEDIUM** (parity) | `src/components/pos/views/terminal-view.tsx` (cart panel) | Cart side-panel activates at `lg` (1024px); the reference activates at **`md`** (768px): `w-full md:w-[380px] … border-l`. At 768–1023px the reference shows the 380px side cart; the clone stacks it under the grid. | V7 computed classes, both sides | Retarget the clone's panel to `md:w-[380px] md:border-l md:border-t-0` (keep `border-t` stacking below md). Pin with an e2e geometry test at 800px. |
| F-6 | **MEDIUM** (parity) | `src/components/pos/app-shell.tsx` (brand row) | The sidebar brand row is `px-3 pt-5` (60px, no separator); the reference is `px-4 py-5 gap-3` **with `border-b border-[#1e2235]`** (73px, separated from the nav). Both expanded and collapsed states measured. | V6 | `px-4 pb-5 pt-5 border-b border-edge` on the brand container (both states); `BrandRow` inner padding cleaned to match. |
| F-7 | **MEDIUM** (hygiene) | `package.json` | Dead dependencies with zero imports anywhere in `src/`: `quill` (study-app rich-text remnant), `web-vitals` (study RUM remnant), `tailwindcss-animate` (v3 plugin; superseded by F-1's `tw-animate-css` import), `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area` (no component exists for either). The skill's dependency discipline (§2): "every dependency must have a live import." | V10 | `bun remove quill web-vitals tailwindcss-animate @radix-ui/react-radio-group @radix-ui/react-scroll-area`; gate re-run proves nothing imported them. |
| F-8 | **LOW** (docs) | `.env.example` | Header still says "StudyFlow — environment configuration" (the previous domain); the `COOKIE_SECURE` escape hatch (used by `auth.ts` and the e2e server, documented in DEPLOYMENT.md §"Environment") is absent from the example file. | V12 | Rewrite the header for VeloxPOS; add the `COOKIE_SECURE` row (commented, default unset). |
| F-9 | **LOW** (docs) | `Project_Architecture_Document.md` ADR-004 | Claims the mobile spec pins "(10 tests)" — the spec has **9**. | V11 | Correct the count; sweep all count claims in the same commit (39 e2e total is correct). |
| F-10 | **LOW** (parity) | `src/components/pos/app-shell.tsx` (nav container) | Nav list is `mt-6 px-3`; the reference nav is `py-4 px-2` (16px top pad, 8px sides). | reference computed `padding: 16px 8px` | Retarget to `py-4 px-2` (visual rhythm identical; the flex `gap-1` item spacing is unchanged). |
| F-11 | **LOW** (cosmetic) | `src/app/globals.css` | The pinned-palette comments still narrate Omni-Study surfaces ("S92/AS1 assignments dark blue due pill", "GradeTracker", "flashcards", "study-mode Exit/Wrong"). Stale comments are doc debt. | read of globals.css | Neutralize the comments (keep the pin rationale, drop the study-domain references). |
| F-12 | **LOW** (docs) | `veloxpos_SKILL.md` (repo root) | The recovered parallel-session skill is stale relative to the implementation of record: it names a `vx_session` cookie (code: `sf_session`), `server/pos.ts` (code: `server/entities.ts` + workflow routes), a "real Settings" superset (code: `/Settings` 404s by design), and wrong store/test baselines. Two conflicting skills confuse future agents. | read + code cross-check | Create the fresh, code-accurate **`velox-pos_SKILL.md`** per skills/distill-codebase-skill + skills/to-distill-project-into-skill (user-mandated), and remove the stale `veloxpos_SKILL.md` (history preserves it; the doc chain points at the new file). |
| F-13 | **MEDIUM** (visual, bundled with F-1) | `src/components/pos/app-shell.tsx` (drawer) | The drawer mounts with no entrance animation. The implementation plan §3.4 specified "slide-in glass-dark drawer"; the family standard is a slide-in-from-left (`neo-crm` sheet: `animate-in slide-in-from-left duration-~300-500` + faded backdrop). | visual inspection | With `tw-animate-css` active: backdrop `animate-in fade-in-0`, panel `animate-in slide-in-from-left` (entrance only — the conditional mount keeps exit instant so the e2e UNMOUNT pins stay deterministic). |
| F-14 | **LOW** (parity) | `src/components/pos/views/terminal-view.tsx` (CART heading) | The CART heading is `tracking-wider` (0.05em); the reference heading is `tracking-wide` (0.025em). | computed styles both sides | Align to `tracking-wide`. |

**Explicitly NOT findings (verified intentional):** `/Settings` 404 (reference parity — the sidebar
href is `/StoreSettings`), mixed EN/ES copy (verbatim by design), the reference's own broken mobile
nav (we ship the superset), sidebar `z-40` vs the reference's `z-50` (ours is not an overlay below
`md`; the drawer owns z-50), in-memory rate limiter + global cashier rows + refunds-not-restocking
(documented known issues in the PAD).

---

## 2. The ToDo list (execution order, TDD where behavioral)

Each behavioral item is red → green: the failing e2e pin FIRST, then the fix. CSS-only items ride
the same pins. The unit suite covers the pure seams — none of these fixes touch a seam, so the unit
count stays 117 and only e2e counts move (documented in the same commit per the count-lockstep rule).

- [ ] **T-1** (F-1) Add `@import "tw-animate-css";` to `src/app/globals.css`.
- [ ] **T-2** (F-1 red) New e2e pin: opening the charge dialog computes a running `animation-name`
      (not `none`) — proves the Radix animation family is live.
- [ ] **T-3** (F-2) Add `@custom-variant hover (&:hover);` to globals.css (touch parity un-wrap).
- [ ] **T-4** (F-3 red) New e2e pins: (a) drawer open → focus lands inside the dialog;
      (b) Tab from the last focusable wraps to the first (and Shift+Tab wraps back);
      (c) Escape-close → focus returns to the hamburger trigger.
- [ ] **T-5** (F-3 green) Implement the focus trap + restore in `app-shell.tsx`.
- [ ] **T-6** (F-4 red) New e2e pin: open drawer at 390px → viewport 800px → drawer unmounts and
      the body scroll lock is released.
- [ ] **T-7** (F-4 green) matchMedia auto-close guard in `app-shell.tsx`.
- [ ] **T-8** (F-5 red) New e2e pin: at 800×900 the cart panel computes width 380px with
      left border (reference `md:` geometry).
- [ ] **T-9** (F-5 green) Retarget the cart panel to `md:`.
- [ ] **T-10** (F-6, F-10) Sidebar geometry: brand row `px-4 py-5 border-b border-edge`;
       nav container `py-4 px-2` (keep `gap-1`); e2e navigation pin already covers structure —
       update the geometry assertions if they encode the old paddings (they encode widths only).
- [ ] **T-11** (F-13) Drawer entrance animation classes (with T-1's import in place).
- [ ] **T-12** (F-14) CART heading `tracking-wide`.
- [ ] **T-13** (F-7) Remove the five dead dependencies; re-run the full gate to prove zero imports.
- [ ] **T-14** (F-11) Neutralize the stale study-domain comments in globals.css.
- [ ] **T-15** (F-8) `.env.example`: VeloxPOS header + the `COOKIE_SECURE` documented row.
- [ ] **T-16** (F-9, count-lockstep) PAD ADR-004 "(10 tests)" → the real count; sweep `rg` for
       every e2e/mobile count claim across the doc set with the new totals.
- [ ] **T-17** (F-12) Author `velox-pos_SKILL.md` (distill per the two skills); remove the stale
       `veloxpos_SKILL.md`; update the doc-chain references.
- [ ] **T-18** Screenshots: fresh dev-server captures for the remediated surfaces into
       `docs/screenshots/` (desktop views, mobile terminal, mobile drawer open).
- [ ] **T-19** Worklog Session-3 entry; README/PAD/AGENTS/CLAUDE alignment pass (counts, commands).
- [ ] **T-20** Full gate re-run (`lint → typecheck → test → build → test:e2e`), then commit + push
       via `docs/ssh_git_wrapper_v3.py` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).

## 3. Gate & acceptance

1. All existing tests stay green (117 unit; 39 e2e) — no pin weakened, no guard loosened.
2. The new e2e pins land (6 additions → e2e total 45) and pass against the production build.
3. `bun run lint` 0 errors; `tsc --noEmit` clean; `bun run build` green; standalone boots + `/api/health` ok.
4. Live re-measurement: drawer focus/animation verified with agent-browser against :3400.
5. Doc counts lockstep in the same commit; worklog + remediation notes updated.

## 4. Residual risks

- `@custom-variant hover` changes hover behavior for REAL mouse users in no way (`:hover` still
  applies) and for touch users restores the reference's v3 semantics — the one deliberate behavior
  delta, documented here and in the PAD revision block.
- The drawer keeps an instant exit (unmount) rather than an exit animation, BY DESIGN: the e2e pins
  assert the unmount immediately after close actions, and the family doctrine ("exit animations
  keep nodes mounted ~300ms — settle-wait before asserting closed") would force weakening those
  pins. Entrance animation is the visible 90% of the effect.
- Removing the stale `veloxpos_SKILL.md` is safe: git history preserves it, and the reconciliation
  note already declares "where this file and the code disagree, the code wins."

---

## 5. Addendum — findings during execution (F-15)

| ID | Sev | Location | Finding | Resolution |
|----|-----|----------|---------|------------|
| F-15 | MEDIUM (hygiene) | `package-lock.json` (repo root) | A stale npm-era lockfile coexisted with `bun.lock` (the lockfile of record) and did NOT match `package.json` (it pinned `@playwright/test` 1.64.1 while bun resolved 1.63.0; it predated the POS domain). The family skill's rule: "Two lockfiles in one repo is a reproducibility bug — one package manager, one lockfile." | Removed `package-lock.json`; `bun.lock` is the single lockfile (AGENTS.md already documents "bun for everything"). |
| F-16 | LOW (build hygiene) | repo root | `build.log` (a Session-3 scratch artifact) was created by the audit's background build — must never reach the tree. | Deleted before commit (untracked scratch). |

Executed T-list status: T-1..T-12, T-14..T-17 complete; T-13 (dead deps) extended to include
`package-lock.json` (F-15). All six new e2e pins verified RED before the fixes and GREEN after
(45/45). Remaining: T-18 screenshots, T-19 worklog + final doc sweep, T-20 the full gate + push.

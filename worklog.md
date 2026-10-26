# VeloxPOS — Worklog

> The running work journal for `nordeim/velox-pos`. Newest sessions at the
> bottom. The pre-pivot history (the Omni-Study1/StudyFlow clone, sessions
> 1–100) is preserved in git history and summarized in
> `docs/archive/omni-study1/` — this journal covers the VeloxPOS phase.

---

## Session 1 — the pivot: VeloxPOS (veloxposen.base44.app) clone

**Context.** The repo was re-targeted by the user's `prompt-to-create.md`
directive: clone `https://veloxposen.base44.app/` (login
`sepnetflix2023@outlook.com`) using the existing codebase as scaffolding.
The prior tenant was the Omni-Study1 (StudyFlow) clone — a mature, 100-session
codebase with 936 unit + 298 e2e checks — for a DIFFERENT app. Exploration
with agent-browser confirmed the reference is now "VeloxPOS (Point Of Sale)"
(a dark POS workspace), while `omni-study1.base44.app` still serves the
study app as "AcademiaFlow (Copy)" — two different apps; the GitHub repo
itself was already renamed `velox-pos`.

**Work log.**

1. **Reference deep-dive (agent-browser, logged-in, desktop + 390×844).**
   All 8 sections surveyed and screenshots captured; computed styles
   extracted (canvas #080a14, surface #0d0f1a, violet gradients
   135° #7c3aed→#6366f1, emerald CHARGE #059669→#10b981, active nav
   rgba(124,58,237,.2)/violet-300, chart violet-400, 16px cards,
   12px buttons, 220px/68px sidebar). Findings ledger F1–F21 written into
   `docs/veloxpos-implementation-plan.md` §0 — including the three big ones:
   **F10** the reference's write flows are broken (Create buttons stay
   disabled with valid input; product creation never lands), **F11** its
   Settings link renders a 404 ("Página no encontrada"), **F13** it has NO
   mobile navigation (the desktop layout crushes at 390px — no hamburger,
   no drawer).
2. **Plan** saved to `docs/veloxpos-implementation-plan.md` (§1 decisions:
   working CRUD as superset over F10, real Settings over F11, a compliant
   mobile drawer over F13, reference-verbatim copy incl. the Spanish
   surfaces, integer-cents money, dark-only theme, empty demo seed for
   parity).
3. **Domain rebuild on the kept scaffolding.** Kept: db-path/db seam, auth
   (scrypt+HMAC+rate limit; cookie renamed `vx_session`), HTTP seam
   (wrappers, error contract), Radix UI kit, api client, toast,
   connectivity banner, Playwright config, Docker assets, SSH-push docs.
   New: POS Prisma schema (User/Category/Product/Register/Shift/Sale/
   SaleItem/StoreSetting + auth token models), seeds (`db:seed` empty-parity
   + `db:seed:sample`), Zod validation, server delegates + transactional
   POS seam (`pos.ts`: one-transaction checkout with conditional stock
   decrement, shift open/close with expected-cash math, refunds restoring
   stock), 16 API route files, the 8 views, the shell (sidebar/drawer/nav),
   the auth surface (login/register/verify/forgot + reset page), the
   measured 404 page, dark POS globals.css, next.config rewrites for the 8
   paths. Study-era views/routes/tests/scripts removed; docs archived under
   `docs/archive/omni-study1/`.
4. **Mobile navigation (the mandated focus).** `mobile-chrome.tsx`
   implements the repo Tailwind v4 skill's §9 contract: real button trigger
   with `aria-expanded`/`aria-controls`, `role=dialog`+`aria-modal`, focus
   in on open / back to trigger on close, Tab trap, Esc + backdrop close,
   body scroll lock, close-on-lg-crossing, `prefers-reduced-motion` honored.
   v4 traps respected (gap-based nav list, `backdrop-blur-xs`, CSS-class
   gradients). Pinned by `tests/e2e/mobile-navigation.spec.ts` (11 checks
   across 390×844 / 768×1024 / 1280×800).
5. **Test suites.** Vitest config rewritten clean (65 checks: money, cart,
   reports, router, validation, db-path, auth). Playwright suite rebuilt
   (44 checks: auth, navigation, mobile-navigation, terminal incl. a full
   cash sale with change math, inventory CRUD, registers+shift lifecycle,
   data-views incl. refund + cashier admin, settings persistence). Both
   configs modified per the prompt instruction; `.env` set to
   `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root
   (contract unchanged, re-pinned by tests).
6. **Debugging highlights** (root causes, not symptoms):
   - product create 500 → the Zod schema emitted `price` while the column
     is `priceCents`; fixed with a `mapData` boundary hook on the delegate
     (one seam, not per-route fixes).
   - the reference-parity always-rendered tables (headers + empty row)
     restored after the first e2e run showed my empty-state swap diverged
     from the reference's measured DOM.
   - `react-hooks/set-state-in-effect` (React 19 lint) → views restructured
     to async-IIFE effects with `cancelled` flags, setState only after
     await boundaries — the rule's own recommended shape.
   - Playwright `chrome-headless-shell` binary missing in the sandbox →
     `bunx playwright install chromium`.
7. **Gates (all REAL_EXIT green):** lint ✓ · tsc --noEmit ✓ · vitest 65/65 ✓
   · standalone build ✓ · playwright 44/44 ✓ (44 = 4 auth + 6 navigation +
   11 mobile-nav + 3 terminal + 4 inventory + 4 registers + 12 data-views
   + 3 settings, minus none — counts as run).
8. **Screenshots** (dev server, agent-browser): login, terminal no-shift +
   active + cart + checkout + receipt, dashboard, populated inventory +
   dialog, registers + open-shift dialog, sales, reports, settings,
   cashiers, 404, collapsed rail, and the mobile set (app bar, drawer open,
   per-view) → `docs/screenshots/`.
9. **Docs** rewritten for the POS: README, AGENTS, CLAUDE, PAD, DEPLOYMENT
   rebrand, this worklog; `docs/veloxpos-implementation-plan.md` as the
   evidence/decision record.

**Stage summary.**

- The repo is now a complete, working VeloxPOS clone: 8 views, 16 API
  routes, transactional checkout, shift lifecycle, cashier admin, reports,
  settings — all flows verified e2e against the production build.
- The three reference defects (broken writes, Settings 404, no mobile nav)
  are shipped as working supersets; visual parity is measured and
  screenshot-evidenced.
- Deferred (PAD §10): camera-based barcode scanning, shared-store rate
  limiter for multi-instance, hosted CI, a possible i18n layer.

---

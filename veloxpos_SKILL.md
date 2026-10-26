---
name: veloxpos
description: >
  VeloxPOS — the production-grade, self-hosted clone of the reference
  Base44 POS workspace (veloxposen.base44.app) on Next.js 16 App Router +
  React 19 + Prisma/SQLite + Tailwind CSS v4. Covers the measured design
  system, the view/API map, the money and checkout seams, the mobile
  drawer contract, auth, the testing strategy, the reference-defect
  supersets, and the debugging playbook. Use it to extend, debug, onboard,
  or replicate this architecture.
version: 1.0.0
last_updated: 2026-10-26
---

# VeloxPOS — Project Skill

## What this project is

A self-hosted point of sale cloning `veloxposen.base44.app` as a functional
superset. One Next.js page + 8 rewritten view paths; Zustand view state;
Prisma/SQLite at `<repo>/db/custom.db`; scrypt+HMAC auth (`vx_session`
cookie). The reference was measured live 2026-10-26 — findings F1–F21 in
`docs/veloxpos-implementation-plan.md` §0 are the parity ground truth.

## The three reference defects shipped as supersets

1. **F10** — the reference's create flows never complete (buttons stay
   disabled, writes never land). The clone's CRUD works: inventory,
   registers, cashiers, categories, checkout, refunds — all e2e-verified.
2. **F11** — the reference's Settings link 404s. The clone ships a real
   Settings (store profile / categories manager / account + password).
3. **F13** — the reference has NO mobile nav (crushed desktop at 390px).
   The clone ships a compliant drawer (focus trap, Esc/backdrop, scroll
   lock, aria-expanded, reduced-motion) pinned at three viewports.

## Architecture in 60 seconds

- `src/app/page.tsx` — auth gate → shell → view switcher; 8 views in
  `src/components/views/`; shared primitives in `src/components/pos/`.
- Routes are 3-line shells over the delegates (`server/entities.ts`);
  transactional flows in `server/pos.ts` (checkout = ONE transaction:
  conditional stock decrement + ticket + items; close-shift computes
  expected cash; refund restores stock).
- Money is integer cents end-to-end; dollars enter through Zod
  `moneyInput`; `mapProductData` maps price/cost → *Cents columns.
- Pure seams (unit-tested): `money.ts`, `cart.ts`, `reports.ts`,
  `router.ts`, `validation.ts`, `db-path.ts`, `auth.ts`.

## Commands

```bash
bun run dev            # :3000
bun run lint && bun run typecheck && bun run test   # unit (65)
bun run build && bun run test:e2e                   # e2e (44) — needs the build
bun run db:push && bun run db:seed                  # empty demo (parity)
bun run db:seed:sample                              # populated demo
```

Gate order before push: lint → typecheck → test → build → test:e2e.

## Hard-won lessons (do not re-learn these)

- **Tailwind v4 traps** (`docs/Tailwind-V4-Validation-Report.md`): gap-based
  lists (never `space-y-*` + margin children — the `:where()` rewrite flips
  specificity), `backdrop-blur-xs` (renamed), CSS-class gradients
  (`.vx-gradient`) because v4 interpolates utility gradients in oklab.
- **The dark-on-dark page titles** (slate-700 on #080a14) are reference
  parity — do not "fix" the contrast without a parity decision.
- **Copy is verbatim**: Sales/Cashiers are Spanish ("Historial de Ventas",
  "Sin ventas", "Turnos Recientes"); the 404 is "Página no encontrada".
- **Auth surfaces**: the four social buttons toast "SSO is not configured"
  — never fake working SSO.
- **e2e**: single worker + shared `db/e2e.db`; storageState login ONCE
  (the limiter allows 10 logins/15 min); specs self-clean with
  `${Date.now()}` names; rebuild before e2e or you test stale code.
- **Playwright in sandboxes**: `bunx playwright install chromium` (the
  headless-shell binary is not preinstalled).

## Data model snapshot

User (role admin|cashier) · Category (userId+name unique) · Product
(userId+barcode unique, priceCents/costCents/stock/minStock/taxRate/unit/
active) · Register · Shift (open/close, float vs counted cash) · Sale
(ticketNo `#T{n6}`, method cash|card|transfer|other, status
completed|refunded, all-cents totals) · SaleItem (line snapshots) ·
StoreSetting (singleton) · VerificationToken / PasswordResetToken.

## Doc chain

`README.md` (what/features) · `AGENTS.md` (the agent contract) ·
`CLAUDE.md` (boot + debugging) · `Project_Architecture_Document.md` (layers,
data, ADRs) · `docs/veloxpos-implementation-plan.md` (evidence + decisions) ·
`worklog.md` (journal) · `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`
(push runbook).

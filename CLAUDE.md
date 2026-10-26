# CLAUDE.md — VeloxPOS (Point Of Sale)

Project instructions for Claude Code. Companion to `AGENTS.md` (commands + invariants — read that
first) and `Project_Architecture_Document.md` (the full engineering reference). This file adds the
working conventions and the seams that matter most when writing code here.

## Project identity

A production Point-of-Sale web app — a functional superset of `veloxposen.base44.app` with
measured visual parity. Next.js 16 App Router (standalone output) · React 19 · TypeScript strict ·
Tailwind v4 CSS-first · Radix/shadcn primitives · ONE Zustand store · Zod 4 · Prisma 6 / SQLite
(`db/custom.db` at the repo root). Owner account: `sepnetflix2023@outlook.com` / `$Abcd1234`.

## The 30-second command map

```bash
bun run dev                    # :3000
bun run lint                   # eslint flat config — 0 errors expected
bun run typecheck              # tsc --noEmit — strict
bun run test                   # vitest — tests/unit/** (the pure seams)
bun run build                  # standalone build; doubles as the type gate
bun run test:e2e               # playwright — needs the build; desktop + mobile projects
bun run db:push && bun run db:seed   # provision db/custom.db
```

The push gate order: `lint → typecheck → test → build → e2e`. No hosted CI exists; the local gate
is the only gate.

## Architecture seams (where code lives and why)

| Concern | Seam | Rule |
|---|---|---|
| Money | `src/lib/money.ts` | All amounts: integer cents internally, `round2`/`formatMoney` at the edge. Unit-pinned. |
| Cart | `src/lib/cart.ts` | Immutable reducer (`addToCart/setQty/...`), `cartTotals`, the CHARGE gate, `ticketLabel`. |
| Shifts | `src/lib/shift.ts` | `canOpenShift` (one ACTIVE shift per register), `expectedCash`, `shiftVariance`. |
| Reports | `src/lib/reports.ts` | Period windows (7/14/30/90), `dailySeries`, `byMethod`, `categorySlices`. |
| Inventory | `src/lib/inventory-status.ts` | `stockStatus`, `lowStockCount`, the CSV round-trip. |
| Routes | `src/lib/router.ts` | The 8 reference paths + `viewFromPath` (unknown → null → the Spanish 404). |
| Validation | `src/lib/validation.ts` | Every Zod contract (products, categories, registers, shifts, sales, settings, cashiers, auth). Strip mode; `"" → null` transforms for cleared relations. |
| Store | `src/lib/store.ts` | THE Zustand store: collections + cart + chrome. Cart mutations delegate to the cart seam. |
| API plumbing | `src/lib/server/http.ts` | `withUser`/`withUserParams` wrappers, the error→status mapper, `makeCollectionRoutes`/`makeItemRoutes` factories. Route files stay 3-line shells. |
| Entities | `src/lib/server/entities.ts` | Delegates per model — every query `where: { userId }`, ownership verified before mutation. |
| Auth | `src/lib/auth.ts` (pure) + `src/lib/server/auth.ts` (cookies) | scrypt hashes, HMAC tokens (`sf_session`), rate limiting, `cookieSecureDefault()`. |
| DB path | `src/lib/db-path.ts` | The `DATABASE_URL` resolution contract (schema-anchored relative form; absolute for standalone). |
| Chrome | `src/components/pos/app-shell.tsx` | Desktop sidebar (220/68px, chevron) + the mobile drawer (a11y superset). |
| Views | `src/components/pos/views/*.tsx` | One file per reference view; the mixed EN/ES copy is verbatim from the reference. |

## Patterns that are law here

- **Server-gated pages, client views.** The `(app)` layout calls `getCurrentUser()`; the guest
  never receives app HTML. Views hydrate through `usePosBootstrap` (session + collections in
  parallel; 401 → full reload to `/login?from_url=…`).
- **Server-authoritative checkout.** `/api/sales` POST recomputes totals from stored prices,
  verifies stock, allocates the ticket (`T-000001`), pins the active shift, and decrements stock
  inside one transaction. Client numbers are display-only.
- **Zod strip mode at every boundary.** Payloads never reach Prisma unvalidated; unknown keys are
  dropped by contract.
- **Plain-CSS custom classes** (`glass-*`, `brand-chip`, `vpx-focus` in `src/app/tokens.css`) —
  never `@layer utilities` (Tailwind v4 cascade trap), never `tailwind.config.js`, exact
  gradients as classes (oklab drift trap).
- **`tw-animate-css` is imported in `globals.css`** — the Radix `data-[state]` animation family
  depends on it (e2e pins a live `animation-name` on open dialogs). Removing the import silently
  kills every dialog/select/toast animation (the Session-3 F-1 bug).
- **`@custom-variant hover (&:hover)`** un-wraps v4's `@media (hover: hover)` — without it every
  hover affordance no-ops on touch devices (a POS runs on tablets; the reference's v3-era CSS
  applies hovers on touch).
- **The drawer focus contract** (app-shell): focus → close button on open, Tab wraps inside the
  drawer, Escape restores the hamburger's focus, viewport growth past `md` auto-closes — all
  e2e-pinned in `tests/e2e/mobile-navigation.spec.ts`.
- **Key-based modal resets** (`key={editing?.id ?? "new"}`) — no setState-in-effect dialog resets
  (React 19 lint rule `react-hooks/set-state-in-effect`).
- **Toasts via `useToast()`** → `toast.success/error/info(message)` — never `alert()`.
- **The 10 documented v4 traps** live in the `globals.css` header; the mobile-nav-critical ones
  are repeated in `AGENTS.md`.

## Testing conventions

- **Unit** (`tests/unit/**`, vitest): only the pure seams. If you add a `src/lib` seam, add its
  file here — red → green (TDD) for new logic, regression tests for fixes. Expected baseline:
  117 tests / 12 files.
- **E2E** (`tests/e2e/**`, Playwright, production standalone on :3100): user journeys through the
  real UI. Two projects — `chromium` (1440×900) and `mobile` (390×844; runs only
  `mobile-navigation.spec.ts`). Auth once via `auth.setup.ts` + storageState (the rate limiter is
  10/IP/15 min). The scratch db (`db/e2e.db`) is provisioned by the webServer command
  (kill-port → provision → boot) and never replaced while the server lives — replacing it after
  boot desynchronizes the login and page-render clients (field-tested failure).
- Parity assertions use computed styles/geometry (`toHaveCSS`, `boundingBox` semantics) and
  visibility (`not.toBeVisible` for `hidden md:*` elements — they stay in the DOM), never class
  lists.

## Git discipline

- Conventional Commits, atomic units, main-only (no feature branches).
- Never commit secrets: `.env`, `*.key`, `ssh-key.txt` are git-ignored; rotate any key that lands
  in the tree. The SSH push path is `docs/ssh_git_wrapper_v3.py` (runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` — keys live outside the repo, 0600, shredded
  after push).
- `worklog.md` records each working session (append-only, newest last) — keep it current.

## Known sharp edges

- The e2e suite needs `bun run build` first; it boots `.next/standalone` on :3100 with
  `COOKIE_SECURE=false` and an **absolute** `DATABASE_URL` (see `playwright.config.ts`).
- The login form is inert until hydration (the submit button ships `disabled`) — tests wait for
  `toBeEnabled()` before filling; the pre-hydration native GET would leak the password into the URL.
- `/Settings` 404s **by design** (reference parity — the sidebar href is `/StoreSettings`).
- The reference mixes English and Spanish copy — preserve it verbatim (Sales/Cashiers/404 are
  Spanish).

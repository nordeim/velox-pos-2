# AGENTS.md — VeloxPOS

> Instructions for AI coding agents working in this repository. Read this
> fully before writing code. Companion docs: `CLAUDE.md` (same contract),
> `Project_Architecture_Document.md` (the deep dive), `worklog.md` (the
> journal — append, never overwrite).

## What this repo is

**VeloxPOS** — a self-hosted point-of-sale clone (functional superset) of
`veloxposen.base44.app`, on Next.js 16 (App Router) + React 19 + TypeScript
strict + Tailwind v4 + Prisma/SQLite + Bun. One page (`src/app/page.tsx`)
hosts the whole app; the 8 view paths are URL rewrites and the view state
lives in a Zustand store synced with `location.pathname`.

The reference was measured live (2026-10-26). Every visual token and the
findings ledger (what is parity, what is a superset, what is broken in the
reference) live in **`docs/veloxpos-implementation-plan.md`** — the §0
evidence table is the ground truth for any "is this supposed to look like
that?" question (e.g. the dark-on-dark slate-700 page titles are reference
parity, NOT a bug).

## Commands (bun — not npm/pnpm)

```bash
bun run dev            # dev server :3000 (Turbopack)
bun run lint           # eslint .
bun run typecheck      # tsc --noEmit
bun run test           # vitest (unit layer only — tests/**/*.test.ts)
bun run build          # next build + copies static into .next/standalone
bun run test:e2e       # playwright — REQUIRES `bun run build` first (boots the standalone server on :3100)
bunx playwright test tests/e2e/<file>.spec.ts   # single e2e file
bunx vitest run tests/cart.test.ts              # single unit file
bun run db:push        # prisma db push (schema-anchored DATABASE_URL, set inline by the script)
bun run db:seed        # demo account (EMPTY store — parity states)
bun run db:seed:sample # + sample catalog/register/closed-shift
```

**Gate order before any push:** `lint && typecheck && test && build &&
test:e2e`. All five, every time. There is no hosted CI — the local gate is
the only gate. e2e needs the production build (it runs
`.next/standalone/server.js`); run `bun run build` again after ANY src change
or you will test stale code.

## Non-obvious things that will bite you

### Database path contract
`.env` carries `DATABASE_URL="file:../db/custom.db"`. Relative `file:` URLs
resolve against the anchor that owns `prisma/schema.prisma` → the DB always
lands at `<repo>/db/custom.db` (CLI, dev, build, standalone — same file).
The rule is `src/lib/db-path.ts`, pinned by `tests/db-path.test.ts`. The
`db:*` package scripts set the env var INLINE (shell-provided URLs are
schema-anchored; .env-loaded ones are CWD-anchored — Prisma CLI quirk).
`db/` is gitignored.

### Tailwind v4 traps (docs/Tailwind-V4-Validation-Report.md — the repo codes against these)
1. **Never** put margin utilities on children of `space-y-*` containers —
   v4's `:where()` rewrite flips specificity. Use `flex flex-col gap-*`.
   The mobile drawer nav is the canonical example.
2. Exact-sRGB gradients (brand violet→indigo, the emerald CHARGE) are CSS
   classes (`.vx-gradient`, `.vx-charge-gradient` in globals.css) — never
   utility gradients (v4 interpolates in oklab).
3. v4 renamed the 4px blur stop: `backdrop-blur-xs` (not `-sm`).
4. Design tokens live in `globals.css` `@theme` as literal hexes; the
   measured values (canvas #080a14, surface #0d0f1a, violet #7c3aed, the
   135° gradients, glow shadow) came from the live reference — change them
   only with a re-measurement.

### Money is integer cents
Every monetary column is `*Cents` (Int). Dollar strings convert at the Zod
boundary (`moneyInput` in `src/lib/validation.ts`); formatting via
`src/lib/money.ts`. Never floats. The product API emits `price`/`cost`
(dollars in) — `mapProductData` in `src/lib/server/entities.ts` maps them to
`priceCents`/`costCents` columns. If a product create lands with the wrong
column names, that mapping is why.

### The API seams
- Route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes`
  (`src/lib/server/http.ts`) — delegates live in `src/lib/server/entities.ts`.
- Everything is ownership-scoped `where: { userId }` by construction.
- Error contract: Zod → 400, P2002 → 409, P2025 → 404, unauthed → 401,
  unknown → 500 (detail logged server-side only).
- Transactional flows (checkout, close-shift, refund) live in
  `src/lib/server/pos.ts` — one `$transaction`, stock guarded by
  conditional `updateMany` (count !== 1 → insufficient stock).
- The session cookie is `vx_session` (renamed from the study-era `sf_session`).

### Testing conventions
- Unit (Vitest): pure seams only — no DB, no React. Files: `tests/*.test.ts`.
- E2E (Playwright): `tests/e2e/*.spec.ts`, single worker, shared seeded
  `db/e2e.db`. The "setup" project signs the demo user in once →
  storageState (auth routes are rate-limited: 10 attempts/15 min — keep real
  logins per run well under that). Specs needing the logged-out surface opt
  out with `test.use({ storageState: { cookies: [], origins: [] } })`.
- Specs create their own data with unique names (`${Date.now()}` suffixes)
  and clean up after themselves; the terminal spec closes foreign open
  shifts before asserting the gate.
- Mobile nav regression specs run at 390×844 — the drawer contract
  (focus trap, Esc, backdrop, scroll lock, aria-expanded) is pinned there.

### Copy is reference-verbatim
The Sales and Cashiers surfaces are in Spanish on purpose ("Historial de
Ventas", "Sin ventas", "Turnos Recientes", "Cajeros", the 404's "Página no
encontrada") — that is reference parity, not an i18n bug. The auth card's
social buttons render for parity and toast "SSO is not configured on this
deployment" when pressed — do not fake working SSO.

## Conventions

- TypeScript strict; `unknown` over `any`; interfaces for object shapes.
- One component per file in `src/components/views/` (8 views) +
  `src/components/pos/` (shared primitives, charts) +
  `src/components/auth/` + `src/components/layout/` + `src/components/ui/`.
- Client API access ONLY through `src/lib/api.ts` (`apiGet/apiPost/apiPatch/
  apiPut/apiDelete`) — never bare fetch.
- State: Zustand stores (`src/lib/store.ts` — view + sidebar + drawer;
  toast store in `src/components/ui/toast.tsx`). No React Context.
- Effects: setState only after await boundaries (the
  `react-hooks/set-state-in-effect` gate is active — async IIFE with a
  `cancelled` flag is the house pattern).
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, …), atomic,
  main-branch only (no feature branches).
- `skills/` is reference material shipped with the repo — EXCLUDED from
  lint/type/tests; do not modify it.
- The push path is `docs/ssh_git_wrapper_v3.py` (see
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`) — keys never live in
  the repo.

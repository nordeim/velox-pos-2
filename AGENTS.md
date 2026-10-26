# AGENTS.md — VeloxPOS (Point Of Sale)

Agent instructions for this repository. Every line answers "would an agent miss this without
help?" — anything else lives in `README.md` (tour) or `Project_Architecture_Document.md` (deep
reference). **Stack:** Next.js 16 (App Router, standalone) · React 19 · TypeScript strict ·
Tailwind v4 (CSS-first) · ONE Zustand store · Zod 4 · Prisma 6 / SQLite.

## Commands

| Command | Notes |
|---|---|
| `bun run dev` | Dev server :3000 — the ONLY sanctioned dev entrypoint |
| `bun run lint && bun run typecheck && bun run test` | The fast gate, in this order |
| `bun run build` | Standalone build — also the type gate (`ignoreBuildErrors` is OFF) |
| `bun run test:e2e` | Playwright — **requires `bun run build` first** (boots the standalone build on :3100) |
| `bun run db:push` / `db:seed` | Provision `db/custom.db` (scripts pin `DATABASE_URL` inline — schema-anchored) |
| `bun run db:seed -- --demo` | Adds the showcase dataset (categories/products/register/shift/sales) |
| `bunx prisma studio` | DB inspection |

Run a single unit file: `bunx vitest run tests/unit/cart.test.ts`.
Run one e2e spec: `bunx playwright test tests/e2e/mobile-navigation.spec.ts --project=mobile`.

## Non-negotiable invariants

1. **The local gate is the only gate.** `lint → typecheck → test → build → e2e` must be green
   before any push. There is no hosted CI.
2. **Money math ONLY through `src/lib/money.ts`** (integer cents in the middle, 2dp dollars at the
   edges). Never `parseFloat` arithmetic in components; never trust client totals — checkout
   recomputes totals from stored prices server-side.
3. **Every API boundary is Zod-validated** (`src/lib/validation.ts`) in strip mode. Unknown keys
   are dropped by contract; partial PATCHes filter to sent keys.
4. **Ownership scoping is by construction**: every query carries `where: { userId }` and
   updates/removes verify ownership BEFORE mutating (`src/lib/server/entities.ts` +
   `makeCollectionRoutes`/`makeItemRoutes` factories in `src/lib/server/http.ts`).
5. **ONE Zustand store** (`usePosStore` in `src/lib/store.ts`). No React Context. Views subscribe
   with selectors; the store holds state, the pure seams own the math.
6. **The route↔nav map is `src/lib/router.ts`** — the 8 reference paths (`/POS /Dashboard
   /Inventory /Sales /Registers /Cashiers /Reports /StoreSettings`) are real routes under
   `src/app/(app)/`, server-gated by the group layout. `/Settings` 404s by design (the reference's
   own href is `/StoreSettings`).

## The documented Tailwind v4 traps (the mobile-nav bug class)

Full list in `src/app/globals.css` header + `docs/Tailwind-V4-Validation-Report.md`. The ones that
bite hardest here:

- **Custom classes are PLAIN CSS** in `src/app/tokens.css` (`glass-*`, `brand-chip`,
  `vpx-focus`). NEVER put them in `@layer utilities` — v4 emits those after generated utilities
  and they silently lose the cascade (this is the drawer-styling killer).
- **NO `tailwind.config.js`** — CSS-first `@theme` only. Reintroducing it is the documented
  "#1 cause of the flat look".
- **Exact gradients are CSS classes** (`.brand-chip`, `.glass-button-*`) — utility gradients
  interpolate in oklab and drift from the measured 135° stops.
- **Nav lists are `flex flex-col gap-*`** — never `space-y-*` with `mt-*`/`mb-*` children (v4's
  `:where()` rewrite flips specificity).
- Shadcn tokens are raw HSL triplets in `:root` routed through `hsl(var(--x))` inside `@theme`;
  `.theme-light` re-points them for the login card only. The app shell is permanently dark.

## The mobile drawer contract (e2e-pinned — do not regress)

`src/components/pos/app-shell.tsx` ships the a11y SUPERSET (the reference overlays a 220px
sidebar on phones with no hamburger). The pins in `tests/e2e/mobile-navigation.spec.ts`:
labeled hamburger ("Open navigation menu"), drawer `role="dialog"` with 8 labeled links,
navigate ⇒ drawer UNMOUNTS, Escape closes, backdrop tap closes (click x>288 — the drawer is
w-72), no horizontal overflow at 390px, icon-rail links KEEP accessible names when collapsed.
`hidden md:flex` elements stay in the DOM below `md` — assert VISIBILITY, not count.

## Environment & database contract

- `.env`: `DATABASE_URL="file:../db/custom.db"` (relative dev form) — `src/lib/db-path.ts`
  resolves it against the schema-anchored repo root for dev AND standalone. **Absolute `file:`
  URLs for production/standalone** — relative URLs are bundle-anchor-dependent under the
  standalone server (documented trap; see `.env.example`).
- `db/` lives at the repo root; its `*.db` files are git-ignored (`.gitkeep` is committed).
- `AUTH_SECRET` is fatal at boot in production (`src/instrumentation.ts`); dev falls back with a
  warning. `COOKIE_SECURE=false` is the only sanctioned way to run a plain-HTTP production-style
  server (the e2e suite uses it — headless browsers drop Secure cookies on http://localhost).

## Testing rules

- Unit tests live at the pure seams (`tests/unit/**`, vitest, node env). The existing 12 files are
  the seam registry — new `src/lib` seams get a file; UI components don't get unit tests.
- E2E (`tests/e2e/**`) runs against the PRODUCTION standalone build with its own scratch db
  (`db/e2e.db`, provisioned by the webServer command: kill-port → provision → boot — the db is
  NEVER replaced while the server lives; the login and page render must agree on the same inode).
- Auth is established ONCE (`auth.setup.ts`, storageState) — the rate limiter allows 10
  attempts/IP/15 min; per-test logins exhaust it mid-suite. `auth.spec.ts` opts out with an empty
  storageState.
- Never weaken a guardrail to pass a gate; never delete a pin without replacing its protection.

## Conventions that differ from defaults

- **`bun` for everything** (dev, test runner, scripts). `npm`/`pnpm` are not configured here.
- **Route handlers are 3-line shells** over the delegate factories — real logic goes in
  `src/lib/server/entities.ts` delegates or dedicated workflow routes (shifts, sales).
- Error responses are `{ error: string }` — the client `api.ts` seam unwraps and throws
  `ApiError`; views toast via `useToast()` (`toast.success/error/info`), never `alert()`.
- Client redirects after auth use `window.location.assign/replace` (a FULL reload — intentional,
  lint-warned once and documented), because the app state must re-resolve from the cookie.
- Dialogs/menus that must reset per-open are keyed by the open/editing identity
  (`key={editing?.id ?? "new"}`) — no setState-in-effect resets (React 19 lint rule).
- Spanish copy is preserved verbatim where the reference uses it (Sales = "Historial de Ventas",
  Cashiers = "Cajeros"/"Turnos Recientes", the 404 page) — do not "fix" the mix.

## Reference parity

`docs/veloxpos-implementation-plan.md` §0 holds the measured reference spec (tokens, copy, routes,
data model, the reference's own mobile defect). When a parity question arises, measure the live
reference with `agent-browser` — computed styles beat screenshots — and record the measurement.

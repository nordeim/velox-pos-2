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
  interpolate in oklab and drift from the measured 135° stops. (Exception: the cart's "Added"
  banner uses the reference's OWN utility classes verbatim — `from-emerald-600/80
  to-teal-600/70` — reproducing its implementation, not a brand surface.)
- **Nav lists are `flex flex-col gap-*`** — never `space-y-*` with `mt-*`/`mb-*` children (v4's
  `:where()` rewrite flips specificity).
- Shadcn tokens are raw HSL triplets in `:root` routed through `hsl(var(--x))` inside
  **`@theme inline`**; `.theme-light` re-points them for the login card only. The app shell is
  permanently dark.
- **`@theme` MUST stay `inline`** (Session-5, the F-28 bug): non-inline `@theme` bakes
  `hsl(var(--input))` into `--color-input` AT `:root`, so scoped re-pointing (`.theme-light`)
  can never reach the utilities — the login inputs rendered dark borders on the light card for
  four sessions before anyone measured it. Inline emits `hsl(var(--input))` directly in each
  utility rule (verified in the built CSS: `.border-input{border-color:hsl(var(--input))}`).
- **The reference DRIFTS — re-measure before trusting the spec docs.** Session-4 caught the live
  reference having renamed its fiscal field labels since Session-101's measurement (RUC/NIT →
  "Tax ID / EIN", etc.). The measured spec in `docs/veloxpos-implementation-plan.md` §0 is a
  snapshot, not a contract; computed styles on the live site are the contract.

## Heading sizes + the fiscal toggle contract (Session-4 pins)

- **Page H1s are `text-2xl` (24px), section headings `text-base` (16px), Reports section
  headings `text-sm` (14px) uppercase** — measured on the reference; e2e-pinned. The reference
  renders its headings in slate-700/800 on dark glass (near-invisible — its own defect); the
  clone keeps readable white/violet colors (the a11y-superset doctrine, same posture as the
  mobile drawer).
- **The fiscal card**: labels "Tax ID / EIN" / "Tax Regime" / "Fiscal Address" / "CFDI Use
  (default)" (the reference's CURRENT labels), the toggle lives in the SectionCard header row,
  default = fiscal HIDDEN on receipts. The Prisma column is `hideFiscalOnReceipt @default(true)`
  but the UI switch is wired INVERTED (`checked={!hideFiscalOnReceipt}` — switch ON = visible,
  matching the reference's toggle direction); its label pair is "Hidden on receipt" ⇄
  "Visible on receipt" (not "Shown"). E2E-pinned in `tests/e2e/surfaces.spec.ts`.
- **The cart "Added" banner** (`tests/e2e/terminal.spec.ts`): a collapsed `max-h-0 opacity-0`
  strip in the cart panel that expands on add (emerald chip, circle-check, "ADDED" + product
  name, `transition-all duration-300`) and auto-collapses after ~2.5s. The timer state lives in
  the click handler (no setState-in-effect); the ref only carries unmount cleanup.

## The form-control + button parity contracts (Session-5 pins)

- **Every Input/Select/Textarea computes 12px radius (`rounded-xl`), `border-input` = `#262a36`,
  transparent bg, `#707a8f` placeholders, ring-1 focus** — measured on the reference across
  settings/dialogs/search. The base components own this; do NOT add per-field `border-edge
  bg-white/5` overrides (Session-5 stripped 34 of them). The token contract: `:root`
  `--input`/`--border` = `225 18% 18%` (#262a36), `--muted-foreground` = `220 12% 50%`,
  `--ring` = `252 87% 67%`.
- **Standard buttons are `px-4 py-2.5` (padding-driven 42px)** — the Button default size has NO
  fixed height. The CHARGE button is `py-5` (70px). The Reports period pills are `px-4 py-2
  rounded-xl text-xs font-bold` (inactive white/40, active violet-600 + shadow-lg) in a
  `rounded-2xl` white/7-bordered `rgba(28,31,52,0.85)` container.
- **The receipt footer is a TEXTAREA** (`rows=2`, min-h 60px, resize vertical).
- **The login surface**: inputs are `h-11 sm:h-12 bg-slate-50/50 border-slate-200 rounded-xl
  placeholder:text-slate-600 pl-10` (DIRECT slate classes — never themed utilities); the card is
  `bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden` with a 4px top gradient strip
  (slate-200→300→200) and the content padding on an inner wrapper (`p-8 sm:p-10 md:pt-12
  md:pb-10 md:px-10`); the logo is the vendored `public/veloxpos-logo.png` (96×96 img); SSO
  buttons are `px-5 py-3.5` (54px, text-base); sign-in is `font-medium`. E2E-pinned in
  `tests/e2e/auth.spec.ts`.

## The chrome + chart contracts (Session-6 pins)

- **Nav items are `px-3 py-2.5` PADDING-DRIVEN** (40px inactive; the reference dropped its
  fixed height) + `font-medium` + 16px icons (`w-4 h-4`) + inactive `text-white/40
  hover:text-white/80` + `transition-all duration-150`. The ACTIVE pill ADDS
  `border border-violet-500/30 shadow-sm shadow-violet-500/10` (→ 42px with the border).
  The Reports nav glyph is `ChartColumnIncreasing` (the reference swapped it live —
  Session-101's FileText reading is stale). The wordmark is `text-sm font-bold
  tracking-wide text-white/90` (14px); the chip Zap + footer chevron are `w-4 h-4` in a
  `p-3` cell.
- **Settings section headers**: BARE `w-5 h-5` icons in per-section colors — Store
  indigo-500, Palette purple-500, FileText green-500 (Receipt section), Receipt orange-500
  (Fiscal), CreditCard blue-500, Tag amber-500 (Categories) — no chip wrapper, `gap-2`.
  The heading KEEPS the readable white/violet color (the reference's `text-slate-700` is
  its own near-invisible defect).
- **The category flow is a DIALOG**: the section header's Add chip (`glass-button px-3
  py-1.5 text-sm rounded-lg font-medium` + Plus w-4, 34px) opens the "New Category"
  dialog (title 18px/600, `Name` + ph "e.g. Beverages", Cancel/Create = the standard 42px
  glass buttons). Empty state: "No categories" (`text-slate-400`).
- **Save Changes is the LARGER primary CTA**: `glass-button-primary px-6 py-3.5 text-base
  font-medium` — 54px (bigger than the standard 42px action buttons).
- **Inventory category chips**: `px-4 rounded-xl text-xs font-semibold whitespace-nowrap`
  computing 36px (the reference's own +2px button-base quirk — pinned via `h-9`), active =
  `glass-button-primary`, container `flex gap-2 overflow-x-auto`.
- **The POS shift gate**: card `p-8` (not p-10), Monitor `text-violet-400/30 mb-4`
  (stroke 2), h2 `mb-2`, paragraph `text-white/35` with the "Registers" emphasis styled
  `font-bold text-white/60` NO underline (the clone keeps the working href — a functional
  superset styled to the reference's computed rendering).
- **Chart axes use `niceTicks`** (`src/lib/reports.ts`): ~5 nice 1/2/2.5/5×10^k steps —
  NEVER one grid line per unit of the domain (the Session-101 per-dollar grid rendered
  hundreds of stacked labels on any real dataset — the F-50 bug, caught by the VLM on the
  live dashboard, invisible to the empty-store e2e). The Dashboard chart labels its 7-day
  axis with WEEKDAY abbreviations at 12px; the Reports chart uses date labels at 11px
  with `$`-prefixed y ticks.
- **v4 oklab serialization in pins**: fractional-alpha utilities (white/40, violet-500/30,
  …) serialize as `oklab(… / 0.4)` while the reference (Base44) emits `rgba(…, 0.4)` —
  same color. Pin the ALPHA (the `/0.4)`) via `expect.poll` + regex; raw `evaluate` reads
  do NOT retry like `toHaveCSS` (a mid-load style race flaked a pin once — always
  `expect.poll` raw computed reads).

## The mobile drawer contract (e2e-pinned — do not regress)

`src/components/pos/app-shell.tsx` ships the a11y SUPERSET (the reference overlays a 220px
sidebar on phones with no hamburger). The pins in `tests/e2e/mobile-navigation.spec.ts`:
labeled hamburger ("Open navigation menu"), drawer `role="dialog"` with 8 labeled links,
navigate ⇒ drawer UNMOUNTS, Escape closes, backdrop tap closes (click x>288 — the drawer is
w-72), no horizontal overflow at 390px, icon-rail links KEEP accessible names when collapsed.
`hidden md:flex` elements stay in the DOM below `md` — assert VISIBILITY, not count. Session-3
additions: focus moves to the close button on open, Tab WRAPS inside the drawer, Escape restores
focus to the hamburger, the drawer auto-closes when the viewport grows past `md` (768px), the
drawer + backdrop `animate-in` (tw-animate-css), and Radix dialogs compute a live
`animation-name` — every one of these is e2e-pinned.

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

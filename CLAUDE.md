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
bun run test                   # vitest — tests/unit/** (the pure seams + the docs-counts gate)
bun run build                  # standalone build; doubles as the type gate
bun run test:e2e               # playwright — needs the build; desktop + mobile projects
bun run smoke                  # the 13-step API smoke ladder — needs the build (own db/smoke.db)
bun run gate                   # the one-command pre-push gate: lint → typecheck → test → build → smoke → e2e
bun run db:push && bun run db:seed   # provision db/custom.db
```

The push gate order: `lint → typecheck → test → build → smoke → e2e` (`bun run gate` wires it).
No hosted CI exists; the local gate is the only gate.

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
- **`@theme inline` is LOAD-BEARING** (Session-5, F-28): non-inline `@theme` bakes
  `hsl(var(--x))` into `--color-x` AT `:root`, so the `.theme-light` scope's triplet re-pointing
  never reaches themed utilities (the login inputs rendered dark borders on the light card for
  four sessions). Inline emits `hsl(var(--x))` directly in each utility — verified in the built
  CSS (`.border-input{border-color:hsl(var(--input))}`).
- **`tw-animate-css` is imported in `globals.css`** — the Radix `data-[state]` animation family
  depends on it (e2e pins a live `animation-name` on open dialogs). Removing the import silently
  kills every dialog/select/toast animation (the Session-3 F-1 bug).
- **`@custom-variant hover (&:hover)`** un-wraps v4's `@media (hover: hover)` — without it every
  hover affordance no-ops on touch devices (a POS runs on tablets; the reference's v3-era CSS
  applies hovers on touch).
- **The drawer focus contract** (app-shell): focus → close button on open, Tab wraps inside the
  drawer, Escape restores the hamburger's focus, viewport growth past `md` auto-closes — all
  e2e-pinned in `tests/e2e/mobile-navigation.spec.ts`.
- **Heading sizes are parity-pinned**: H1 `text-2xl` (24px), sections `text-base` (16px) as
  **`<h3>`** (Session-9, F-57 — the reference's measured tag, level-pinned), Reports sections
  `text-sm` (14px) as `<h2>` — the reference's computed sizes (its own headings render in
  near-invisible slate on dark; we keep readable colors — the superset posture).
- **The fiscal toggle is wired INVERTED on purpose**: the column is `hideFiscalOnReceipt`
  (`@default(true)` — hidden, per the reference's default) but the switch renders
  `checked={!hideFiscalOnReceipt}` so switch ON = "Visible on receipt" (the reference's toggle
  direction). Label pair: "Hidden on receipt" ⇄ "Visible on receipt" — never "Shown".
- **The cart "Added" banner** auto-collapses via a timer set in the click handler (no
  setState-in-effect); the e2e pin asserts visible → collapsed, not the duration.
- **Form controls own their parity in the base components** (Session-5): Input/Select/Textarea
  compute `rounded-xl` (12px) + `border-input` (#262a36) + transparent bg + `#707a8f`
  placeholders + ring-1 focus; the Button default size is `px-4 py-2.5` (42px, no fixed h-9);
  CHARGE is `py-5` (70px). NEVER add per-field `border-edge bg-white/5` overrides — the token
  contract (`--input`/`--border` `225 18% 18%`, `--muted-foreground` `220 12% 50%`, `--ring`
  `252 87% 67%`) computes the reference values.
- **The login surface uses DIRECT slate classes** (`h-11 sm:h-12 bg-slate-50/50
  border-slate-200 rounded-xl pl-10`), never themed utilities — the reference's login form has
  its own base; the card is `bg-white/95 shadow-2xl` + `backdrop-blur-xs` (Session-10, F-59:
  the reference's v3 `backdrop-blur-sm` = 4px = v4's `-xs` after the blur-scale rename, trap
  #8) + a 4px top gradient strip + the vendored logo `public/veloxpos-logo.png`. The
  post-login landing is `/` (F-60 — the reference's root-path landing; the root page serves
  the same terminal as `/POS`).
- **The TWO stat families are never shared** (Session-10, F-61/F-62): Dashboard =
  solid-gradient chips (the `.stat-grad-*` exact-rgb CSS classes — the `.brand-chip` oklab
  doctrine) with white icons + gradient opacity-20 corner blobs + `font-semibold
  text-slate-500` labels + `font-bold mt-1` values (value COLOR keeps the readable
  `text-white/90` — the reference's slate-800 values are its VLM-confirmed near-invisible
  defect); Reports = horizontal cards with 48px `rounded-2xl` `/15`+`/30`-border chips on the
  LEFT, `h-6 w-6` tone-400 icons, 400 white/35 labels, `font-black` white values, no blob
  (`ReportsStat` in reports-view.tsx). The muted tones are VERBATIM (subtitles
  `text-slate-500` — Reports' own subtitle is its `text-white/35` exception; empty states
  slate-400/500 + `w-16 text-slate-200` stroke-2 icons + `py-12` rhythms; the cart copy
  `text-white/25`) — never substitute white/xx for the reference's slate design language.
- **The dialog family is SOLID (Session-11, F-64)**: every reference dialog
  computes `rgb(15,18,26)` (#0f121a) + 1px `rgb(38,42,54)` + NO blur +
  rounded-lg + p-6 (`--card: 224 27% 8%`; the primitive's `bg-card
  border-border` owns it — NEVER `glass-dark border-edge`, the companion
  utility is inert per trap #15). Widths: Register/Product 512
  (`sm:max-w-lg`), Category 384 (`sm:max-w-sm`). Close X: 36px hit area.
  The select dropdown is a different panel (`--popover: 225 21% 11%` =
  #161922, rounded-md). The mobile drawer keeps glass-dark by design.
- **The form-text family is #e7e9ef via `text-foreground` (Session-11,
  F-66)**: labels 14px/500, dialog titles 18px/600, input text — all compute
  `rgb(231,233,239)` (`--foreground: 225 20% 92%` EXACTLY; the old
  `221 28% 93%` computed #e8ebf2 — a rounding drift). The base
  Input/Textarea/Label carry `text-foreground`; per-field
  `text-white`/`text-white/70` form-control overrides are BANNED.
- **`text-foreground` on the base inputs is LOAD-BEARING (Session-11,
  F-70)**: without it the login inputs inherit the dark-theme body color —
  TYPED credentials rendered near-white on the near-white card (invisible
  since Session-101; e2e fills never read rendered text, screenshots showed
  the empty form). `.theme-light --foreground` = `240 10% 4%` (zinc-950,
  byte-exact); pinned on the typed text.
- **Dialog Cancel = the gray glass-button; Create/Save =
  `glass-button-primary`** — the gradient lives in `background-image`
  (`background-color` reads transparent — measure BOTH before concluding
  "outline"). Disabled: opacity .5 + not-allowed (byte-matched).
- **Unpinned palette values serialize as `lab(...)`** (F-62): v4's defaults are oklab-defined —
  pin the hex in `globals.css`'s `@theme` when a computed pin expects the reference's
  `rgb(...)` (indigo-400 `#818cf8` was the Session-10 catch).
- **The auth surface (Session-12)**: the login error renders the bordered
  Alert panel (`rounded-xl border-red-200 bg-red-50/70 p-4` + inner
  `text-sm text-red-700`, no icon — `src/components/ui/alert.tsx`; scope
  alert locators to `main.login-canvas [role='alert']`, trap #28); the
  forgot/sign-up views SWAP the whole card (back-first ArrowLeft link, h2,
  `h-10 sm:h-11` fields with slate-400 placeholders, 44px solid buttons —
  sign-up is exactly Email/Password/Confirm Password with a client-side
  equality check, NO Full name, NO SSO); the sign-in body is ONE centered
  `space-y-6 sm:space-y-8` flex column (halo+ring logo group, responsive
  `text-2xl sm:text-3xl tracking-tight` h1, knockout OR divider at
  `tracking-[0.1em]` — v4 rescaled tracking-wider, trap #25; in-form
  justify-between links row; `text-sm h-11 sm:h-12` button, busy copy
  "Signing in…"). The 404: plain white span numeral + slate-800/slate-500
  text + the 50px ArrowLeft gradient link on `rounded-3xl p-12`; the root
  not-found auth-gates guests server-side (`getCurrentUser()` →
  `redirect("/login")`, F-82).
- **Key-based modal resets** (`key={editing?.id ?? "new"}`) — no setState-in-effect dialog resets
  (React 19 lint rule `react-hooks/set-state-in-effect`).
- **Toasts via `useToast()`** → `toast.success/error/info(message)` — never `alert()`.
- **Chart axes render `niceTicks`** (`src/lib/reports.ts`, unit-pinned): ~5 nice
  1/2/2.5/5×10^k steps, NEVER one grid line per unit of the domain — the
  Session-101 per-dollar grid stacked hundreds of labels on real data (F-50,
  invisible to the empty-store e2e; caught by a VLM eyeball of the live
  dashboard). The Dashboard x axis = weekday abbreviations (12px); Reports =
  dates (11px) + `$` y ticks.
- **The Session-6 chrome contracts are e2e-pinned**: padding-driven 40px nav
  items (active pill + violet border/shadow → 42px, 16px icons,
  FileChartColumnIncreasing for Reports — Session-9/F-56 corrected the glyph to the
  FILE variant the reference's class string actually names, 14px wordmark);
  buttons compute `cursor: pointer` (Session-9/F-58 — the v4-preflight cure in
  `tokens.css`); bare per-section-colored
  section-header icons; the category DIALOG flow (header Add → New Category →
  Cancel/Create 42px); Save Changes py-3.5 (54px); the 36px Inventory chips
  (glass-button-primary active); the POS gate p-8 + /30 icon + white/35 copy.
- **oklab/alpha pin rule**: fractional-alpha utilities serialize as `oklab(…
  / 0.4)` (the reference emits rgba — same color). Pin the ALPHA with
  `expect.poll` + regex; raw `evaluate` computed reads do NOT retry (a mid-load
  race flaked a pin once). **Session-7 closed the doctrine's blind spot
  (F-51):** the two Session-3-era raw reads in `mobile-navigation.spec.ts`
  (scroll-lock release, 390px horizontal overflow) raced React's
  passive-effect flush after `toHaveCount(0)` and failed the gate reliably —
  both now poll. When a pin doctrine lands, sweep the ENTIRE suite for the
  old pattern; covering only new pins leaves the old ones red.
- **The 10 documented v4 traps** live in the `globals.css` header; the mobile-nav-critical ones
  are repeated in `AGENTS.md`.

## Testing conventions

- **Unit** (`tests/unit/**`, vitest): only the pure seams. If you add a `src/lib` seam, add its
  file here — red → green (TDD) for new logic, regression tests for fixes. Expected baseline:
  133 tests / 13 files. **`docs-counts.test.ts` is the lockstep gate** (Session-8, F-52): it
  LIVE-censuses the test/source tree and pins every live-tense count site in the docs to the
  constants — when a suite grows, update the constants AND every doc site in the SAME commit
  (the gate fails until you do; history blocks keep their historical numbers by design).
- **E2E** (`tests/e2e/**`, Playwright, production standalone on :3100): user journeys through the
  real UI. Two projects — `chromium` (1440×900) and `mobile` (390×844; runs only
  `mobile-navigation.spec.ts`). **Baseline: 93 tests.** Auth once via `auth.setup.ts` +
  storageState (the rate limiter is 10/IP/15 min). The scratch db (`db/e2e.db`) is provisioned
  by the webServer command (kill-port → provision → boot) and never replaced while the server
  lives — replacing it after boot desynchronizes the login and page-render clients
  (field-tested failure).
- **Smoke** (`scripts/smoke-test.sh`, tier 3): boots the standalone artifact on :3210 with a
  FRESH `db/smoke.db` + a throwaway AUTH_SECRET, walks the 13-step API ladder (health, the 401
  wall, the SSR shell, the login cookie round-trip, the Zod 400, a CRUD create/DELETE, the
  logout teardown, the rate-limit 429, sitemap/robots, the no-secret boot refusal, the
  ARTIFACT-HYGIENE checks), and counts executed vs passed. Cookie round-trips on plain HTTP
  need `COOKIE_SECURE=false` (curl will not replay a Secure cookie over http).
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
- The reference site DRIFTS between sessions (Session-4 caught its fiscal labels being
  renamed live). `docs/veloxpos-implementation-plan.md` §0 is a SNAPSHOT — re-measure the live
  site with agent-browser before acting on a parity question.
- The login form is inert until hydration (the submit button ships `disabled`) — tests wait for
  `toBeEnabled()` before filling; the pre-hydration native GET would leak the password into the URL.
- `/Settings` 404s **by design** (reference parity — the sidebar href is `/StoreSettings`).
- The reference mixes English and Spanish copy — preserve it verbatim (Sales/Cashiers/404 are
  Spanish).

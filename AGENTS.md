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
| `bun run smoke` | The 13-step API smoke ladder — **requires the build** (boots the artifact on :3210 with `db/smoke.db`; ends with the boot-gate + artifact-hygiene probes) |
| `bun run gate` | The one-command pre-push gate: `lint → typecheck → test → build → smoke → e2e` |
| `bun run db:push` / `db:seed` | Provision `db/custom.db` (scripts pin `DATABASE_URL` inline — schema-anchored) |
| `bun run db:seed -- --demo` | Adds the showcase dataset (categories/products/register/shift/sales) |
| `bunx prisma studio` | DB inspection |

Run a single unit file: `bunx vitest run tests/unit/cart.test.ts`.
Run one e2e spec: `bunx playwright test tests/e2e/mobile-navigation.spec.ts --project=mobile`.

## Non-negotiable invariants

1. **The local gate is the only gate.** `lint → typecheck → test → build → smoke → e2e`
   must be green before any push (`bun run gate` wires the chain). There is no hosted CI.
2. **Test counts are documentation claims under the unit gate** (`tests/unit/docs-counts.test.ts`,
   Session-8's F-52): every live-tense count site (README badges/rows, CLAUDE, AGENTS,
   PAD, the SKILL, vitest.config.ts's header) is pinned to constants that are verified
   against the LIVE test/source tree. When a suite grows, the constants AND every doc
   site riding them change in the SAME commit — a stale count anywhere fails
   `bun run test`. History blocks (session logs, revision blocks, the worklog) keep their
   historical numbers by design.
3. **Money math ONLY through `src/lib/money.ts`** (integer cents in the middle, 2dp dollars at the
   edges). Never `parseFloat` arithmetic in components; never trust client totals — checkout
   recomputes totals from stored prices server-side.
4. **Every API boundary is Zod-validated** (`src/lib/validation.ts`) in strip mode. Unknown keys
   are dropped by contract; partial PATCHes filter to sent keys.
5. **Ownership scoping is by construction**: every query carries `where: { userId }` and
   updates/removes verify ownership BEFORE mutating (`src/lib/server/entities.ts` +
   `makeCollectionRoutes`/`makeItemRoutes` factories in `src/lib/server/http.ts`).
6. **ONE Zustand store** (`usePosStore` in `src/lib/store.ts`). No React Context. Views subscribe
   with selectors; the store holds state, the pure seams own the math.
7. **The route↔nav map is `src/lib/router.ts`** — the 8 reference paths (`/POS /Dashboard
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
  headings `text-sm` (14px) uppercase** — measured on the reference; e2e-pinned. The section
  headings are `<h3>` elements (Session-9, F-57 — the reference's measured tag; the clone's
  h2s had identical computed styles but a different document outline; level-pinned). Reports
  section headings stay `<h2>` (the reference's own choice). The reference
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
  `bg-white/95 shadow-2xl overflow-hidden` with a 4px top gradient strip
  (slate-200→300→200) and the content padding on an inner wrapper (`p-8 sm:p-10 md:pt-12
  md:pb-10 md:px-10`); the logo is the vendored `public/veloxpos-logo.png` (96×96 img); SSO
  buttons are `px-5 py-3.5` (54px, text-base); sign-in is `font-medium`. **The card's blur is
  `backdrop-blur-xs`** (Session-10, F-59 — the reference's v3-era `backdrop-blur-sm` computes
  4px, which is v4's `backdrop-blur-xs` after the documented scale rename, trap #8; v4's
  blur-sm would double it to 8px); e2e-pinned on the computed `blur(4px)`. The post-login
  landing is `/` (Session-10, F-60 — the reference lands on the root path; `/POS` stays the
  canonical nav href, and the root page serves the same terminal). E2E-pinned in
  `tests/e2e/auth.spec.ts`.

## The stat-card + muted-tone contracts (Session-10 pins)

- **The reference ships TWO stat families — never share them** (Session-10, F-61/F-62):
  - **Dashboard**: SOLID-GRADIENT icon chips (`p-2.5 rounded-xl` + the `.stat-grad-*` CSS
    classes in `tokens.css` — green-400→emerald-500 / indigo-400→purple-500 /
    blue-400→indigo-500 / amber-400→orange-500; the EXACT rgb stops are CSS classes because
    v4's utility gradients interpolate in oklab and serialize `lab()` stops — the
    `.brand-chip` doctrine) with WHITE `h-5 w-5` icons; corner blobs
    `absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20` on the same gradients;
    labels `text-xs font-semibold text-slate-500 uppercase tracking-wider` (600); values
    `text-2xl font-bold mt-1` (700). The VALUE COLOR stays `text-white/90` — the reference's
    slate-800 values are its VLM-confirmed near-invisible defect (the headings doctrine).
  - **Reports**: horizontal cards (`glass-card rounded-2xl p-5 flex items-center gap-4`),
    chip on the LEFT (`w-12 h-12 rounded-2xl` + `bg-{tone}-500/15` + 1px
    `{tone}-500/30` border + `h-6 w-6` `{tone}-400` icons), labels `text-xs text-white/35
    uppercase tracking-wider` (400), values `text-2xl font-black text-white` (900), NO
    corner blob; tones indigo/emerald/violet. `ReportsStat` lives in reports-view.tsx.
- **The muted-tone design language is matched VERBATIM** (Session-10, F-63): PageHeader
  subtitles are `text-slate-500` (the ONE exception: Reports' own "Sales & revenue
  analytics" is `text-white/35` — the reference's own choice, via the `subtitleClassName`
  prop); "No data yet" is `text-slate-400 text-sm text-center py-12`; the Registers/Cashiers
  empty cards are `p-5 py-12` + `w-16 h-16 text-slate-200` stroke-2 icons (mb-3) +
  `text-slate-500` copy; the Sales/Inventory empty tds are `py-12 text-slate-400`
  (Inventory adds `text-sm`); the POS cart empty copy is `text-sm mt-3 text-white/25`; the
  Reports "No data for this period" is `text-white/25`. Never substitute white/xx for the
  reference's slate tones — slate-400/500 are its design language (the readable-superset
  doctrine is reserved for the near-invisible slate-700/800 defects).
- **The unpinned-palette lesson** (F-62): v4's default palette defines colors in oklab —
  any ramp value NOT hex-pinned in `globals.css`'s `@theme` serializes as `lab(…)` instead
  of the reference's `rgb(…)`. `--color-indigo-400: #818cf8` was added in Session-10;
  when a pin expects `rgb(...)` and reads `lab(...)`, pin the hex.

## The dialog + form-text contracts (Session-11 pins)

- **The reference's dialog family is SOLID, never glass**: every dialog
  computes `rgb(15,18,26)` (#0f121a via `--card` `224 27% 8%`) + 1px
  `rgb(38,42,54)` (#262a36) + **NO backdrop-filter** + rounded-lg (8px) +
  p-6 + shadow-lg + the reference's widths (`New Register`/`New Product`
  512px `sm:max-w-lg`; `New Category` 384px `sm:max-w-sm`). NEVER put
  `glass-dark` (or its inert `border-edge` companion — trap #15) on a
  `*DialogContent`; the primitive's `bg-card border-border` owns the surface.
  The dialog Close X computes a 36px hit area (`flex h-9 w-9 …`). The mobile
  drawer keeps glass-dark BY DESIGN (the clone's own superset — no reference
  contract). The select dropdown is a DIFFERENT elevated panel: `--popover`
  computes `#161922` (rgb(22,25,34)) + rounded-md (6px).
- **The form-text family is ONE color — `#e7e9ef` via `text-foreground`**:
  the reference's labels (14px/500), dialog titles (18px/600), and input text
  ALL compute `rgb(231,233,239)`. The `--foreground` triplet is
  **`225 20% 92%`** — the old `221 28% 93%` computed #e8ebf2 (a 1-off
  rounding drift caught by the label pin). The base Input/Textarea/Label
  carry `text-foreground` (SelectTrigger already did); NEVER re-introduce
  per-field `text-white`/`text-white/70` overrides on form controls.
- **`text-foreground` on the base inputs is LOAD-BEARING (Session-11, F-70)**:
  without it the inputs inherit the dark-theme BODY color, so the
  `.theme-light` scope's `--foreground` re-point never reached the login
  fields — TYPED credentials rendered near-white on the near-white card
  (invisible since Session-101; invisible to e2e because fills don't read
  rendered text, and to screenshots because they showed the EMPTY form).
  `.theme-light --foreground` = `240 10% 4%` (zinc-950 — byte-exact vs the
  reference's measured rgb(9,9,11)); e2e-pinned on the TYPED text.
- **Dialog buttons**: Cancel = the gray `glass-button` (rgba(28,31,52,0.85) +
  white/9 + rgba(200,210,255,0.8) + 42px + rounded-xl); Create/Save =
  `glass-button-primary` (the 135° gradient lives in `background-image` —
  `background-color` reads transparent; measure BOTH before concluding
  "outline"); disabled = opacity .5 + not-allowed.

## The auth-surface contracts (Session-12 pins)

- **The login card's error state is a bordered Alert PANEL, never a bare
  paragraph**: `rounded-xl border-red-200 bg-red-50/70 p-4` + an inner
  `text-sm text-red-700` block, NO icon (the measured reference contract;
  copy "Invalid email or password"). Both error and success render through
  `src/components/ui/alert.tsx` — the emerald success tone is the documented
  superset. Locator trap #28: Next's own `#__next-route-announcer__` carries
  `role="alert"` at body level — scope alert locators to
  `main.login-canvas [role='alert']`.
- **The forgot and sign-up views SWAP the whole card content**: the sign-in
  chrome (logo, h1, sub, SSO, OR divider) unmounts; a "Back to sign in"
  ArrowLeft link (`text-sm font-medium text-slate-500 … -mb-2`) is the first
  child; the subviews' fields are `h-10 sm:h-11` (44px) with
  `placeholder:text-slate-400` (NOT the sign-in view's `h-11 sm:h-12` /
  slate-600 placeholders — the reference itself differs per view); the
  buttons are `h-10 sm:h-11` solid slate-900 + `shadow-sm` +
  `transition-all duration-200`. Sign-up carries exactly Email / Password /
  **Confirm Password** (client-side equality check BEFORE any fetch) and NO
  Full name (the register API's optional `fullName` is simply not sent).
- **The sign-in body is ONE `flex flex-col items-center text-center
  space-y-6 sm:space-y-8` block** — NOT a flat margin chain: the logo is a
  `relative group` (a `blur-xl` slate halo behind a `ring-4 ring-white/50
  rounded-full shadow-lg` span, `h-20 w-20 sm:h-24 sm:w-24`); the h1 is
  `text-2xl sm:text-3xl font-bold tracking-tight`; the sub is
  `text-sm sm:text-base font-medium`; the OR divider is a CONTINUOUS
  absolute `h-[1px]` line + a `bg-white px-3` knockout rendering uppercase
  "or" at `tracking-[0.1em]` (v4 rescaled `tracking-wider` — trap #25); the
  links live INSIDE the form in a `flex-col sm:flex-row justify-between`
  row (Forgot left / signup right at desktop; column/8px/center at 390px);
  the "Sign up" phrase is MIXED (400/slate-500 base + a `font-medium
  text-slate-700` span); the sign-in button is `text-sm h-11 sm:h-12
  shadow-sm transition-all duration-200` with the busy copy "Signing in…".
- **The 404 (authenticated) + the guest gate**: `glass-card rounded-3xl
  p-12` + a PLAIN `text-3xl font-bold text-white` span numeral (never the
  brand chip) + `text-slate-800` h1 / `text-slate-500` p + the 50px
  `font-medium` gradient link with a lucide ArrowLeft icon, on
  `min-h-screen p-6` + `bg-ink` (the reference's `pos-gradient-subtle`
  computes the same solid rgb(8,10,20)). The root not-found is an async
  server gate (`getCurrentUser()` → `redirect("/login")`, mirroring the
  (app) layout) — guests never see the 404 (F-82, the reference's
  behavior); Next renders `/_not-found` Dynamic within the request scope.

## The reset-password contracts (Session-13 pins)

- **The reset surface is the GRAY family, never the login's slate family**: a
  flat `bg-gray-50` canvas (`main.reset-canvas` + `.theme-light` — the scope
  still owns the zinc-950 typed text), the stock shadcn Card `rounded-lg` (8px)
  + `shadow-lg` + a **2px SOLID `h-0.5 bg-gray-900` top strip** (not the
  login's 4px slate gradient), content padding `p-6 pt-12 pb-10 px-12`,
  Title Case gray-700 labels, `rounded-md` (6px!) `border-gray-200
  bg-gray-50/50` inputs (44px, Lock icons on BOTH fields,
  `placeholder:text-zinc-500`), the "Must be at least 8 characters"
  `text-xs text-gray-500` helper, and NO token field — the token arrives as a
  PROP from the page's server-rendered `searchParams` (never a client URL
  read — no hydration flip).
- **Three server-rendered states**: tokenless → the "Invalid Reset Link"
  dead-end (the 80px `bg-red-100` circle chip + `CircleAlert` 40px red-600 +
  ZERO inputs — the reference never renders the form without a token); token
  → the form; done → the clone's own "Password Updated" card (the reference's
  success state is unmeasurable — documented superset on the measured card).
- **The reset alert family is its own tone** (`Alert tone="error-soft"`:
  `rounded-lg` + `bg-red-50/50` + inner `text-red-800` #991b1b — measured
  rgb(153,27,27); hex-pinned in `@theme`), DIFFERENT from the login's
  `error` panel (rounded-xl/0.7/red-700). The reference itself ships two
  alert treatments on its two auth surfaces. Copy: the API's "Invalid or
  expired reset token"; the client mismatch "Passwords do not match" (no
  period) — checked BEFORE any fetch.
- **The reference's demo account is CLIENT-SIDE write-gated** (Session-13,
  live-proven): the New Register Create never enables even with both fields
  genuinely typed; Settings Save never fires a toast (an armed
  MutationObserver caught nothing). The checkout→receipt chain, the Sales
  receipt viewer, and every toast contract are UNMEASURABLE on the reference
  — documented superset surfaces; the clone's working flows own them.
- **Never diagnose a source defect from a terminal echo** (Session-13, the
  withdrawn SD-4): this sandbox's bash OUTPUT DISPLAY eats the literal
  two-byte sequence `[h` — `echo "[health]"` renders as `ealth]"`, and the
  first-pass Session-12 audit recorded a phantom "log typo" from exactly that
  artifact. Confirm raw bytes via a second tool (the Read tool, or
  `grep -c "health]"` counts) before "fixing" any string a terminal showed
  you.

## The chrome + chart contracts (Session-6 pins)

- **Nav items are `px-3 py-2.5` PADDING-DRIVEN** (40px inactive; the reference dropped its
  fixed height) + `font-medium` + 16px icons (`w-4 h-4`) + inactive `text-white/40
  hover:text-white/80` + `transition-all duration-150`. The ACTIVE pill ADDS
  `border border-violet-500/30 shadow-sm shadow-violet-500/10` (→ 42px with the border).
  The Reports nav glyph is **`FileChartColumnIncreasing`** — the reference's measured class
  is `lucide-file-chart-column-increasing`, the FILE variant (a document with increasing
  bars). Session-9 (F-56) corrected Session-6's misreading of that class as
  "ChartColumnIncreasing" (the bare-bars export — a visibly different glyph); e2e-pinned.
  Buttons compute `cursor: pointer` (Session-9, F-58 — v4's preflight dropped v3's
  button-cursor rule; the base-layer cure lives in `tokens.css`, `:not([disabled])` keeps
  the disabled `not-allowed` contract); e2e-pinned on the chevron.
  The wordmark is `text-sm font-bold
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
  `expect.poll` raw computed reads). **Session-7 (F-51) completed the doctrine**: every
  raw computed read in the suite now polls — the two Session-3-era unpinned reads
  (`mobile-navigation.spec.ts`'s scroll-lock + horizontal-overflow checks) raced React's
  passive-effect flush and failed the gate reliably. The lesson: when a pin doctrine
  lands, SWEEP the whole suite for the old pattern, not just the new pins.

## The chart-internal contracts (Session-14 pins — F-95..F-106)

- **The reference ships TWO distinct chart contracts** (its own pattern: two alert
  families, two stat families, two chart families). The earlier "dotted grid + violet
  stroke" was an unmeasured Session-101 assumption that survived 13 cycles because no
  session had swept the chart internals; Session-14 decoded both live (computed styles +
  DOM attributes, 1440×900).
- **The Dashboard chart ("Sales — Last 7 days")**: an **indigo-500 `#6366f1` 2.5px SMOOTH
  monotone line** (C segments — the `smoothPath` seam in `src/lib/chart-path.ts`,
  Fritsch-Carlson tangents, unit-pinned) over a **slate-200 `#e2e8f0` 1px dashed `3 3`
  grid** (5 horizontal at the nice ticks + one vertical per day bucket), **two full-length
  slate-400 `#94a3b8` axis lines** (baseline y=245 + left x=65) + tick stubs (x-ticks run
  245→251 below the baseline), **12px slate-400 ticks** (x middle-anchored baseline 253,
  y end-anchored x=57), a **gradient area** (indigo 0.3 @5% → 0 @95%, path fill-opacity
  0.6), and **ZERO data dots**. Plot: viewBox `0 0 731 280`, plot x=65 y=5 661×240 — the
  reference's chart is container-responsive; the paddings/fonts/height are the fixed
  measured values (the clone's fixed-viewBox `w-full` SVG renders 1:1 at the e2e
  viewport).
- **The Reports chart ("Daily Sales") is its OWN family**: **indigo at 2px** (not the
  Dashboard's 2.5), gridlines **`rgba(255,255,255,0.04)` dashed `3 3` with NO slate
  axes**, ticks **11px `rgba(255,255,255,0.3)`**, the gradient at **0.35** @5% (not 0.3)
  under fill-opacity 0.6, `$`-prefixed y ticks, "d MMM" date labels thinned. Plot:
  viewBox `0 0 1130 220`, clip x=60 y=4 1066×186, baseline y=190.
- **The charts' colors are SVG ATTRIBUTES (literal hex)** — the Tailwind cascade and its
  v4 oklch serialization never touch the charts. Chromium computes gradient fills
  **quoted** (`url("#id")`) — the reference's own computed fill measures identically;
  pin the quoted form.
- **The ui primitive layer is EXACTLY the 10 live files** (alert, alert-dialog, button,
  dialog, input, label, select, switch, textarea, toast) — Session-14 (SD-1) deleted the
  12 zero-importer scaffolding primitives and `bun remove`d the 9 Radix packages that
  served only them. A new view needing a primitive imports from this set or adds it
  deliberately (and the docs-counts census re-anchors if suites grow).
- **Evidence scripts that mutate auth state must verify the DOCUMENTED credential
  after** (Session-14, SD-2): the Session-13 reset round-trip typed its own form-fill
  constant "Abcd1234!" and silently changed the dev db's owner password — the "no state
  change" claim in the s13 plan was wrong, found only when the next cycle's UI login
  401'd. `scripts/restore-owner-password.mjs` restored `$Abcd1234` (control-verified the
  drifted hash first, end-to-end verified the restore). Any script that exercises a
  password-changing flow ends by proving the documented login works.

## The with-data + list-parity contracts (Session-15 pins — F-107..F-109)

- **The chart SCALE is `niceScale`** (`src/lib/reports.ts`, unit-pinned): the domain top is
  the smallest nice-step multiple ≥ the data max and the ticks run 0..top on the same
  step — the curve's peak never overshoots the topmost gridline (the recharts behavior;
  the pre-fix `ceil(max)` domain floated a $92-day peak ~29px above the 80-gridline,
  DOM-measured on the demo-seeded dashboard — the exact with-data class the empty-store
  e2e cannot see). `niceScale(4,5)` = `{4, [0,1,2,3,4]}` — byte-identical to the measured
  empty-state contract; no empty-store pin moved.
- **The two Settings listboxes are MEASURED — never restyle or extend from memory**
  (F-108/F-109, e2e-pinned by exact enumeration): Currency = [USD - US Dollar, EUR - Euro,
  GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso];
  Card Payment Provider = [none, Stripe, PayPal, Clip, Mercado Pago]. The lists ARE the
  Zod gate (`isSupportedCurrency`/`isCardProvider` in `validation.ts`). Session-101's
  "USD/EUR/MXN/GBP/…" was an unenumerated ellipsis; the invented extras (CAD/AUD/PEN,
  SumUp/Square) left the tree the same way every unmeasured assumption does.
- **The reference's fiscal toggle is a `lucide-toggle-left` icon-button** (24px icon +
  inline text, NO role=switch, NO aria state — measured live): the clone's labeled Radix
  Switch is the documented a11y superset (the drawer/readable-headings posture). Do not
  "fix" it back to an icon-button.
- **The toaster is zustand-based — `@radix-ui/react-toast` was a zero-importer dead dep**
  (Session-15 SD-1; the s14 V9 "toast is load-bearing" classification was wrong —
  corrected on the record). `axe-core` left with it (SD-2, an Omni-Study-era remnant).
  The ui primitive set remains EXACTLY the 10 live files; the Radix set is
  slot/alert-dialog/dialog/label/select/switch only.

## The with-data + receipt contracts (Session-16 pins — F-110/F-111)

- **Receipt timestamps are `saleTimestamp` — NEVER bare `toLocaleString()`**
  (`src/lib/reports.ts`, unit-pinned; Session-16, F-110): both receipt headers (the
  post-checkout dialog in `terminal-view.tsx` and the receipt viewer in
  `sales-view.tsx`) render the byte-stable es-convention `DD/MM/YYYY HH:MM` — manual
  padStart mirroring `shiftTime`, zero Intl dependence. The bare `toLocaleString()`
  they shipped was client-locale-dependent: en-US on the audit browser, ar-SA digits
  on an ar-SA device — a printed receipt must render identically on every device, and
  the same surface's own ledger cell already used es-MX. The e2e pin rides the
  checkout receipt (a regex on `T-000001 · DD/MM/YYYY HH:MM`).
- **The with-data evidence tier is `scripts/capture-s16-evidence.mjs`** (F-111): the
  demo-seeded Registers/Sales/Cashiers contracts are pinned live each cycle — the
  with-data class is invisible to the empty-store e2e by construction (the s15 V24
  doctrine). Run it before pushing when a with-data surface changes.
- **Two measurement lessons from this cycle's evidence infra** (both fixed without
  weakening a check): (1) **`visible` ≠ animation-settled** — Radix dialogs animate
  via tw-animate-css zoom-in, and a geometry read mid-flight measures 384×0.95 ≈ 365;
  wait ~700ms after the dialog-visible wait before any width read. (2) **Bootstrap
  races** — `goto` with default "load" + a fixed sleep loses to the shifts fetch on a
  cold route; wait for the SETTLED state (a `waitForFunction` on the ledger's row or
  empty copy), not a timer.
- **Leaf-element measurement** (the reference-side lesson): probe the TEXT NODE's
  `parentElement` (a TreeWalker), never the first ancestor matching the copy — a
  wrapper div's inherited `color` misread the reference's "Sin ventas" as #e7e9ef
  until the leaf TD showed its own `text-slate-400` (byte-identical to the clone).

## The with-data evidence + measurement contracts (Session-17 pins — F-112)

- **The with-data evidence tier is TWO harnesses now**: `scripts/capture-s16-evidence.mjs`
  (Registers/Sales/Cashiers) + `scripts/capture-s17-evidence.mjs` (**Inventory/Reports** —
  F-112). The s17 harness pins the demo-seeded Inventory table census (15 rows, the
  7-column header set, the stock-chip census out=1/low=2/ok=12, the category dots, the
  search filter) and the Reports family (the 4 pills with 30 days active, the stat
  labels/values, the 30-day db truth $410.64/33/$12.44, the glass-card surface, the
  three h2s, the method rows + shares + bars, the 7-day window narrowing to
  $366.56/28), plus the standing F-76/drawer spot-checks — 19/19, screenshots 87–89.
  Run BOTH before pushing when any with-data surface changes.
- **The Reports window semantics are calendar-bucket** (`summarize`/`dailySeries`,
  unit-pinned): N day-buckets INCLUDING today — the 7-day window excludes sales older
  than the 7th calendar-day-back even when every sale is <7×24h old. The page's
  $366.56/28 (not 33/$410.64) is CORRECT; never "fix" the seam to a rolling
  168-hours window without re-measuring the reference.
- **Four measurement postures for live probes** (this cycle's lessons — all were
  probe bugs, the clone code was correct every time): (1) **textContent vs innerText
  case** — CSS-uppercased labels (`text-transform: uppercase`) read "TOTAL REVENUE"
  in innerText but "Total Revenue" in textContent: PIN textContent, and match
  innerText case-insensitively in settled-state waits (a case-sensitive innerText
  wait hangs to its timeout). (2) **`waitForFunction` arity** — options is the THIRD
  parameter: `waitForFunction(fn, null, { timeout })`; passing `{ timeout }` as the
  second arg passes it as the function ARG and silently falls back to the 30s
  default. (3) **DOM rows parse child nodes** — the MethodTable's method name is a
  bare TEXT NODE (not a span) and the share `<span>` NESTS inside the font-bold
  money span: span-index probes read `""` and `"$246.7460%"`. (4) **Pin the ALPHA,
  never the oklab serialization** — v4 renders white/α as
  `oklab(0.999994 0.0000… / 0.4)`: extract the trailing alpha
  (`/([\d.]+)\)$/`), never pin the full computed string (the F-76 either-form regex
  posture, generalized).

## The with-data evidence + measurement contracts (Session-18 pins — F-113)

- **The with-data evidence tier is THREE harnesses now**: `scripts/capture-s16-evidence.mjs`
  (Registers/Sales/Cashiers) + `scripts/capture-s17-evidence.mjs` (Inventory/Reports) +
  **`scripts/capture-s18-evidence.mjs` (StoreSettings/Dashboard — F-113)**. The s18
  harness pins the demo-seeded Settings form census (the materialized settings row —
  store name, currency trigger, the Branding pickers + hex inputs, the Receipt footer
  textarea, the "None" provider trigger, the fiscal switch + its label pair, the 5
  category chips with exact dot colors, the 54px Save CTA) and the Dashboard family
  (the 4 db-truth stats, the stat-family styles, both h3s, the with-data chart + the
  niceScale top tick on real data, the category-breakdown rows/bars), plus the
  db-truth derivation checks and the standing F-76/drawer spot-checks — **20/20,
  screenshots 90–92**. Run ALL THREE before pushing when any with-data surface changes.
- **Volatile with-data expectations are DERIVED FROM THE DB AT RUNTIME** (the s18
  structural law): the Dashboard's today-bucket pair (Today's Sales / Transactions)
  is computed from the db's own Sale rows with the seam's calendar-bucket semantics —
  a morning-seeded demo db carries its day-0 sales on YESTERDAY's bucket, so a
  hardcoded "$X.NN today" pin rots within hours of any re-seed. The re-seed-stable
  constants (Products 15, Low Stock 3, the settings row, the 5 category colors) may
  stay literal. The harness derives via a read-only `bun -e` JSON dump BEFORE the
  probes run.
- **Three more measurement postures** (all audit-probe bugs — the clone code was
  correct every time): (1) **Pin COMPUTED styles, never class-string order** — the
  clone's section icons render `h-5 w-5 text-indigo-500` (height-first) while the
  reference's measured string is `w-5 h-5` (width-first); identical computed styles;
  pin the computed color/size + the icon NAME. (2) **The oklab-alpha SPACE** — v4
  serializes white/90 as `oklab(0.999994 … / 0.9)` WITH a space after the slash; the
  generalized either-form regex is `/\/\s*([\d.]+)\)$/` (the no-space form NaNs/nulls).
  (3) **Mixed tick arrays** — the Dashboard chart's tick texts mix numbers and weekday
  labels; filter to numeric before reducing (`Math.max(...["0","Wed"].map(Number))`
  is NaN). Plus the authoring lesson: when a SyntaxError caret makes no sense
  (pointing at `#`), hexdump the exact line — an unterminated string can point three
  tokens away.

## The receipt print-path contracts (Session-19 pins)

- **The print canvas is WHITE — every receipt line must compute BLACK under print
  emulation** (F-114): the `@media print` block in `tokens.css` sets `color: #000`
  on `.receipt-print, .receipt-print *` — NOT just the container. A container-only
  color loses to the receipt's explicit white text utilities (`text-white/60`,
  `/80`, `text-white` — utilities beat INHERITANCE); the pre-fix receipt printed
  only "My Store" (the Total row computed rgb(255,255,255) on rgb(255,255,255)).
  The rule is unlayered plain CSS, so it beats Tailwind v4's `@layer utilities`
  (the glass-* cascade law) — no `!important` needed. Any new white-text utility
  inside a `.receipt-print` surface is covered by the same rule automatically.
- **Every printable receipt surface wraps its content in `.receipt-print`**
  (F-115): the terminal receipt dialog (terminal-view.tsx) AND the Sales receipt
  viewer (sales-view.tsx). Without the wrapper, `body * { visibility: hidden }`
  hides the whole dialog — the Sales viewer's Imprimir printed a BLANK page
  until Session-19. The footer buttons (Close/Cerrar, Print/Imprimir) stay
  OUTSIDE the wrapper — buttons must not print.
- **The pins live in `tests/e2e/terminal.spec.ts` as print-media emulation**
  (`page.emulateMedia({ media: "print" })` + `expect.poll` computed-color reads —
  the F-76 posture): the F-114 pins ride the cash-checkout test (the Total row +
  a line item compute rgb(0,0,0) under print); the F-115 pin is its own test
  (the wrapper exists, computes fixed/white/black, the Total row black, the
  footer outside). The whole print class is testable WITHOUT a print preview —
  emulate the media, read the computed styles.
- **`Bun.password.verify` REJECTS the app's `scrypt$salt$hash` shape**
  (`PASSWORD_UNSUPPORTED_ALGORITHM`): credential-checker scripts must MIRROR
  `src/lib/auth.ts` (`scryptSync` + `timingSafeEqual`), never Bun's password API.
- **The SD-4 display artifact strikes in the Read tool too** (Session-19, the
  second save): `const [method` renders as `const ethod` — the display eats the
  two-byte `[m` sequence. tsc/build/e2e green is the counter-proof; hexdump or
  grep-count before "fixing" any bracket-adjacent string a display showed you.

## The four-width drift-sweep contracts (Session-20 pins — F-116)

- **The responsive frame is e2e-pinned at ALL FOUR audit widths** (390/768/1024/1440 —
  `tests/e2e/viewport-drift-sweep.spec.ts`, the session_33 "Next" pointer landed): every
  route computes doc/main `scrollWidth ≤ clientWidth` at every width (zero horizontal
  overflow — the battery), and the chrome switches exactly at md: the hamburger owns the
  sub-md chrome, the sidebar the md+ chrome. VISIBILITY pins (`toBeVisible`/
  `not.toBeVisible`), never count — `hidden md:flex` elements stay in the DOM below md
  (the standing law). The reference itself ships the regression class (its own static
  220px sidebar on phones — Session-21 caught the reference's layout drift: the document no
  longer scrolls to 1280px; main is now SQUEEZED to 170px beside the static sidebar, still
  with no hamburger — the defect class persists, the observable changed).
- **The with-data ledger containment is FUNCTIONALLY pinned at 390 on ALL THREE ledger
  surfaces** (the M-109c1 guard, extended Session-21/F-117): with one self-provisioned chain
  (category → product → register → shift → sale), the walk visits Inventory, Sales, and
  Cashiers at 390 — each keeps main contained, the ledger container (`.vpx-scroll`) is a
  FUNCTIONAL scroll region, and each table keeps its `min-w-*` floor (760/720/640 — the
  container contains, the table never shrinks). The spec CLOSES its shift before the walk
  (the self-clean law — an ACTIVE shift would leak into the downstream specs' POS gate; a
  closed shift still renders the Cashiers ledger row, "Cerrado").
- **The containment pin's observable is the `scrollLeft` READ-BACK** (the cycle's
  mutation proof): a frame-level pin alone cannot catch the inner-container break (the
  outer `glass-card overflow-hidden` absorbs the spill — measured live); Chromium reports
  `scrollWidth > clientWidth` even for `overflow-x: visible` (a scrollWidth census cannot
  distinguish the two — measured live); the `scrollLeft = 50` read-back CAN (under the
  injected mutation the assignment no-ops). Never weaken the functional probe to a
  structural one.
- **The ledger-container lookup is `table.closest(".vpx-scroll")`** — NEVER a
  document-order `.find(c => c.querySelector("table"))`: `main` ITSELF carries
  `.vpx-scroll` (the app-shell's overflow-y-auto) and contains every table, so the find
  picks MAIN, which is not a horizontal scroll container — the assignment no-ops and the
  pin fails falsely (the first run's lesson, fixed in the same cycle).
- **A characterization spec's red is the mutation proof**: when the finding is a
  protection gap (the code currently correct), the pins land and must PASS on the
  standing build, and the regression-class evidence is the injected-mutation probe
  (recorded in the plan's ledger) — not a contrived failing assertion.

## The store-writer contracts (Session-21 pins — F-118)

- **The store's `shifts` collection has ONE writer per refresh**: `loadAll` owns it (the
  FULL ledger list — the Cashiers "Turnos Recientes" and Registers history invariant);
  `loadCore` refreshes settings ONLY. The pre-fix `loadCore` fetched
  `/api/shifts?status=active` and wrote the active-only list into the SAME key while the
  bootstrap hook ran both actions in one `Promise.all` — a last-writer race: when
  loadCore's write landed last, the ledgers lost their closed-shift history ("Sin turnos
  registrados" with three closed shifts in the db). Unit-pinned by
  `tests/unit/store.test.ts` (the deterministic interleaving: the active-only fetch
  resolves LAST). No consumer needs the active-only value — the terminal gate finds its
  active shift by FILTERING the collection (`shifts.find(sh => sh.status === "active")`).
- **A new with-data e2e surface can EXPOSE latent empty-store-invisible races** (the s15
  V24 doctrine, now proven twice): the three-ledger walk caught the F-118 race live —
  flaky twice in four full-suite runs — while 20 sessions of empty-store e2e never saw
  it. When a with-data pin flakes, suspect the PRODUCTION code first, reproduce with a
  deterministic seam test, then fix the root cause (never re-roll the suite).
- **A spec that opens a shift CLOSES it** (the self-clean law, now written down): an
  ACTIVE shift leaks into every downstream spec's POS gate (the mobile project runs
  after chromium). terminal.spec has always done this; the drift-sweep walk now does
  too (a closed shift still renders the Cashiers ledger row).

## The with-data computed-surface contracts (Session-22 pins — F-119)

- **The Reports surface is pinned WITH DATA end-to-end**
  (`tests/e2e/with-data-reports-walk.spec.ts`): the walk provisions a cash AND a card
  sale (the byMethod two-row shape) and asserts the three stat testids, BOTH method
  tables (counts, shares, bar widths), and the chart's topmost y-tick EXACTLY against
  values DERIVED FROM THE API's own `/api/sales` response at runtime — never hardcoded
  (the volatile-expectation lesson: a hardcoded "$9.75" rots the moment the fixture or
  the db changes). The chart-domain pin (topmost tick ≥ the today-bucket revenue) is the
  live form of the F-107 niceScale contract.
- **A spec that PERSISTS data sorts AFTER every spec that pins the empty state of what
  it creates** — the file name is LOAD-BEARING: `with-data-reports-walk.spec.ts` sorts
  LAST in the chromium project (after surfaces.spec's "No data for this period"
  empty-Reports pin and after every other empty-state assertion). Renaming it into an
  earlier alphabetical position breaks the suite on the NEXT run.
- **The exact-value pin derives, never hardcodes**: filter `status === "completed"`,
  round2 the sums, revenue-desc, share = method/total — mirroring the view's own
  `summarize`/`byMethod` math (both unit-pinned at the seam; the e2e tier pins the
  WIRING). The scratch db is fresh per run (global-setup deletes + re-provisions before
  boot), so every sale is created TODAY — inside every period window deterministically.
- **The method-name span CONTAINS the count span as a child** (the first run's lesson):
  the li's `span.capitalize` textContent is the composite `"cash(1)"` — the method name
  is a bare text node between the dot and the count, so pin the composite, not the name
  alone.
- **Every provisioning POST ASSERTS its response** (the F-120 lesson, Session-22): the
  Session-21 drift-sweep walk's fixture sale POST silently 400'd for two sessions — its
  payload carried the PRE-contract `quantity` field instead of the `saleCreateSchema` line
  shape (`name`/`price`/`qty`/`taxRate`), `sale.ticket` stayed `undefined`, and the Sales
  leg's settled wait (`filter({ hasText: undefined })` — NO filter applied) matched ANY
  row (terminal.spec's sale; the empty-state td row on a colder db). The walk passed
  107/107 twice with ZERO fixture sales in the db. An unasserted provisioning POST makes
  every downstream wait vacuous — `expect(resp.ok(), ...)` on every create, and when a
  fixture value feeds a locator filter, assert it is truthy FIRST.

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
- **The standalone artifact is hygiene-clean BY CONSTRUCTION** (Session-8, F-54):
  `outputFileTracingExcludes` in `next.config.ts` keeps `.env`/`db/`/`skills/`/`docs/`/`tests/`
  out of `.next/standalone/`, and the build script's trailing `rm -f .next/standalone/.env`
  removes the copy Next's writeStandaloneDirectory makes explicitly (immune to the excludes —
  the double-cure). `prisma/schema.prisma` STAYS traced (the db-path anchor). The smoke
  ladder's step 13 polices this on every run — never add repo-root files back to the artifact.
- `db/` lives at the repo root; its `*.db` files are git-ignored (`.gitkeep` is committed).
- `AUTH_SECRET` is fatal at boot in production (`src/instrumentation.ts`); dev falls back with a
  warning. `COOKIE_SECURE=false` is the only sanctioned way to run a plain-HTTP production-style
  server (the e2e suite uses it — headless browsers drop Secure cookies on http://localhost).

## Testing rules

- Unit tests live at the pure seams (`tests/unit/**`, vitest, node env). The 15 existing files are
  the seam registry + the docs-counts lockstep gate — new `src/lib` seams get a file; UI
  components don't get unit tests.
- E2E (`tests/e2e/**`) runs against the PRODUCTION standalone build with its own scratch db
  (`db/e2e.db`, provisioned by the webServer command: kill-port → provision → boot — the db is
  NEVER replaced while the server lives; the login and page render must agree on the same inode).
- The API smoke ladder (`scripts/smoke-test.sh`, tier 3) boots the SAME standalone artifact on
  :3210 with a FRESH `db/smoke.db` each run and walks 13 assertions: health, the 401 wall, the
  SSR login shell, the owner login (sf_session cookie), the sessioned list, the Zod 400, a
  category create/DELETE round-trip, the logout teardown, the rate-limit 429 (LAST — it
  exhausts the bucket), sitemap/robots, the no-AUTH_SECRET boot refusal, and the
  ARTIFACT-HYGIENE checks (no `.env`/`db`/`skills`/`docs`/`tests` inside `.next/standalone`;
  `prisma/schema.prisma` + `public/` present). It counts executed vs passed — failure is loud.
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

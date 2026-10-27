---
name: velox-pos
description: >
  VeloxPOS — the production-grade, self-hosted clone (functional superset with
  measured visual parity) of the reference Base44 POS workspace
  (veloxposen.base44.app) on Next.js 16 App Router + React 19 + Prisma/SQLite
  + Tailwind CSS v4 CSS-first. Covers the measured design system, the seam
  architecture, the money/checkout invariants, the mobile drawer contract,
  the Tailwind v4 trap catalog, auth, the testing strategy, and the debugging
  playbook. Use it to extend, debug, onboard, or replicate this architecture.
version: 2.11.0
last_updated: 2026-10-27
---

# VeloxPOS — Project Skill

## 1. Project identity

A production Point-of-Sale web app cloning `veloxposen.base44.app` as a **functional
superset** with **measured visual parity**: the same 8 routes, the same dark glass
design system, the same mixed EN/ES copy — plus working CRUD everywhere the
reference's demo account 403s, a server-authoritative checkout, shift lifecycle
with cash variance, CSV import/export, and a real mobile navigation drawer (the
reference keeps a broken 220px overlay on phones — re-verified live 2026-10-26:
no hamburger, sidebar at z-50 over the content).

**The engineering thesis:** pure, unit-pinned domain seams under thin server-gated
routes, ONE Zustand store, a factory-based ownership-scoped API layer, and a local
gate (`lint → typecheck → unit → build → e2e`) that is the ONLY gate (no hosted CI).

Baselines at Session-15 lock: unit **146/146** (14 files) · e2e **104/104**
(90 desktop + 13 mobile + 1 setup) · lint 0 errors (1 documented
warning) · standalone build green.

## 2. Tech stack (version-pinned)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js ^16.4.2 (App Router, `output: "standalone"`) | The build IS the type gate (`ignoreBuildErrors` OFF) |
| UI runtime | React ^19 | No `forwardRef` era patterns; `set-state-in-effect` is a lint ERROR |
| Language | TypeScript ^5 strict | `tsc --noEmit` is the fast gate |
| Styling | Tailwind CSS ^4 (CSS-first) | **NO `tailwind.config.js`** — `@theme` pins only; `tw-animate-css` imported for the Radix animation family; `@custom-variant hover (&:hover)` un-wraps the `(hover: hover)` media for touch parity |
| Primitives | Radix UI (shadcn-style, `src/components/ui`) | dialog, select, alert-dialog are load-bearing Radix; the toaster is a tiny zustand store + stack (Session-15 SD-1: `@radix-ui/react-toast` had zero importers since the scaffolding — removed); switch, input, label, button |
| State | Zustand ^5 | ONE store (`usePosStore`, `src/lib/store.ts`); no React Context |
| ORM | Prisma ^6 / SQLite | `db/custom.db` at the repo root; `src/lib/db-path.ts` owns the URL contract |
| Validation | Zod ^4.6 | Strip mode at EVERY API boundary (`src/lib/validation.ts`) |
| Auth | scrypt + HMAC `sf_session` cookie (`node:crypto`) | Hand-rolled by design (PAD ADR-002); boot-guarded secret |
| Charts | Hand-rolled SVG (`src/components/pos/shared.tsx` + the `smoothPath` seam in `src/lib/chart-path.ts`) | Zero chart dependencies; TWO measured contracts — Dashboard: indigo #6366f1 2.5px smooth + slate-200 dashed grid + slate-400 axes + gradient area 0.3@5%, no dots; Reports: indigo 2px + white/4% grid, no axes, 0.35@5% (Session-14, F-95..F-106 — do not restyle from memory) |
| Unit tests | Vitest ^5 (node env) | `tests/unit/**` — the pure seams only |
| E2E | Playwright ^1.63 | Against the PRODUCTION standalone build on :3100, own scratch db |
| Runtime | Bun ≥ 1.1 | Everything: dev, scripts, seed, tests |

**Environment contract** (`.env.example` mirrors exactly): `DATABASE_URL="file:../db/custom.db"`
(the relative dev form — `db-path.ts` anchors it to the repo root for the CLI AND the runtime;
**absolute `file:` URLs for production/standalone**), `AUTH_SECRET` (fatal at boot in production,
warned fallback in dev), `NEXT_PUBLIC_SITE_URL` (metadata origin), `COOKIE_SECURE=false`
(the ONLY sanctioned plain-HTTP production escape hatch — the e2e server uses it).

**Dead-dependency discipline:** every `package.json` entry must have a live import. Session-3
removed `quill`, `web-vitals`, `tailwindcss-animate`, `@radix-ui/react-radio-group`,
`@radix-ui/react-scroll-area` (all zero-import remnants of the study-app era).

## 3. Commands

```bash
bun run dev                    # :3000 (output teed to dev.log)
bun run lint                   # eslint flat config — 0 errors, 1 documented warning
bun run typecheck              # tsc --noEmit — strict
bun run test                   # vitest — tests/unit/** (146)
bun run build                  # standalone build + static/public copy
bun run test:e2e               playwright (104) — NEEDS the build first (:3100)
bun run db:push && bun run db:seed    # provision db/custom.db (owner + settings)
bun run db:seed -- --demo      # + showcase dataset
bun run smoke                  # the 13-step API smoke ladder (needs the build; db/smoke.db)
bun run gate                   # the one-command pre-push gate: lint → typecheck → test →
                               # build → smoke → e2e
bunx vitest run tests/unit/cart.test.ts          # one unit file
bunx playwright test tests/e2e/mobile-navigation.spec.ts --project=mobile   # one spec
```

Gate order before any push: `lint → typecheck → test → build → smoke → e2e`
(`bun run gate`). There is no hosted CI; the local gate is the only gate.
Count sites in the docs live under the unit gate (`tests/unit/docs-counts.test.ts`) —
when a suite grows, the constants and every doc site riding them change in the SAME
commit.

## 4. Architecture in 60 seconds

```
Browser ──► /POS /Dashboard /Inventory /Sales /Registers /Cashiers /Reports /StoreSettings
              │ (app)/layout.tsx — SERVER gate: getCurrentUser() or redirect /login
              ▼
        AppShell (sidebar + mobile drawer) + client views (usePosStore)
              │ api.ts seam (fetch + { error } envelope + ApiError)
              ▼
        /api/* — 3-line route shells over:
           · CRUD factories (makeCollectionRoutes/makeItemRoutes, server/http.ts)
           · delegates per model (server/entities.ts — every query where: { userId })
           · workflow routes: /api/shifts (open/close), /api/sales (checkout),
             /api/store-settings (lazy singleton); /api/auth/* (rate-limited)
              ▼
        Prisma 6 / SQLite — db/custom.db (9 models, user-scoped, cascade deletes)
```

**Layer rule:** arrows point DOWN only. `src/lib` pure seams never import React or
Prisma; `src/lib/server/**` may import both; views import client seams only.

### The seam registry (each with its unit file)

| Seam | Owns | Law |
|---|---|---|
| `money.ts` | integer-cents math, `formatMoney`, `round2` | The ONLY place amounts are computed; never `parseFloat` arithmetic in components |
| `cart.ts` | immutable reducer, `cartTotals`, the CHARGE gate, `ticketLabel` | Client totals are display-only; checkout recomputes server-side |
| `shift.ts` | `canOpenShift` (one ACTIVE per register), `expectedCash`, `shiftVariance` | Open/close state machine |
| `reports.ts` | 7/14/30/90 period windows, `dailySeries`, `byMethod`, `categorySlices`, `niceScale` (F-107: domain top = the nice multiple ≥ max — the peak never overshoots the top gridline; `niceScale(4,5)` = the measured empty contract) | Feeds Dashboard + Reports |
| `inventory-status.ts` | `stockStatus` (ok/low/out), `lowStockCount`, the CSV round-trip | Low = ≤ minStock |
| `currency.ts` | the MEASURED lists + guards (F-108/F-109, Session-15) | Currency = [USD - US Dollar, EUR - Euro, GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso]; Provider = [none, Stripe, PayPal, Clip, Mercado Pago] — the lists ARE the Zod gate; e2e-pinned by exact enumeration |
| `router.ts` | the 8 reference paths + `viewFromPath` (unknown → null → Spanish 404) | `/Settings` 404s BY DESIGN (the sidebar href is `/StoreSettings`) |
| `validation.ts` | every Zod contract (strip mode; `"" → null` transforms) | Nothing reaches Prisma unvalidated |
| `auth.ts` (pure) | scrypt hash/verify, HMAC token mint/verify, rate limiter | Cookie layer is `server/auth.ts` |
| `db-path.ts` | the `DATABASE_URL` resolution contract (standalone-dir detector → module anchor → CWD guard) | `db.ts` never reads `process.env.DATABASE_URL` directly |
| `store.ts` | THE Zustand store: collections + cart + chrome (`sidebarCollapsed`, `mobileNavOpen`, `activeView`) | One store; selectors are stable slices |

### Data model (9 models, all `userId`-owned with `onDelete: Cascade`)

`User` (role owner|cashier, emailVerified) · `StoreSettings` (1:1 lazy singleton:
storeName, branding colors, receipt footer, fiscal fields, cardProvider) ·
`Category` (unique per user+name; products SetNull) · `Product` (barcode indexed,
price/cost as 2dp dollars — cents math at the seams, stock, minStock, taxRate,
unit, image data-URL ≤2MB) · `Register` (delete refused with shift history) ·
`CashierShift` (openingFloat, countedCash?, expectedCash?, variance?, status —
expected/variance computed server-side at close) · `Sale` (ticket `T-000001`
sequential, items JSON read-model blob, subtotal/taxTotal/total, method
cash|card, amountPaid?/changeDue?, status — refund = status flip, no restock) ·
`VerificationToken` (6-digit OTP, 15-min window) + `PasswordResetToken`
(48-hex one-shot, 30-min window) — the auth-support pair.

## 5. The checkout invariant (ADR-003 — the money law)

`POST /api/sales` re-prices every line from stored product data, verifies stock,
allocates the sequential ticket, pins the register's active shift, and decrements
stock inside ONE transaction. Client totals are display-only by construction.
Money crosses the wire as 2dp dollars and is computed in integer cents
(`toCents`/`fromCents`/`round2` in `money.ts`). A POS that trusts client totals
is a loss machine.

## 6. Design system (measured — computed styles, never eyeballed)

| Token | Value | Usage |
|---|---|---|
| Canvas | `#080a14` | body (`--color-ink`) |
| Panel | `#0d0f1a` | sidebar + cart (`--color-panel`) |
| Panel raised | `rgba(16,18,32,0.9)` | `.glass-card` |
| Edge | `#1e2235` | all borders (`--color-edge`) |
| Active nav | `rgba(124,58,237,0.2)` + `#c4b5fd` | the violet pill (violet-600/20 + violet-300) |
| Charge gradient | 135° `#059669 → #10b981` | `.glass-button-success` (exact CSS class) |
| Brand gradient | to bottom right `#8b5cf6 → #4f46e5` | `.brand-chip` |
| Font | `ui-sans-serif, system-ui` literal stack | No webfonts, no `var()` chains |

- The `glass-*` family (`glass`, `glass-dark`, `glass-button`, `-primary`,
  `-success`, `-danger`, `glass-card`) is **plain CSS in `src/app/tokens.css`** —
  class names verbatim from the reference stylesheet.
- Shadcn tokens are raw HSL triplets in `:root`, consumed as `hsl(var(--x))`
  inside **`@theme inline`** (the trap-1 routing); `.theme-light` re-points them
  for the light auth surfaces — the login card AND the reset-password page
  (Session-13: the reset surface keeps the scope for its zinc-950 typed text
  but is NOT the slate design — it is the stock shadcn GRAY family: flat
  `bg-gray-50` canvas, 8px `rounded-lg` card + the 2px gray-900 strip, 6px
  `rounded-md` gray-200 inputs, its own `error-soft` alert family). The app
  shell is permanently dark. **The `inline`
  keyword is load-bearing** (Session-5 trap 13): non-inline `@theme` bakes the
  var substitution at `:root` and scoped re-pointing never reaches utilities.
- Sidebar geometry (measured): brand row `px-4 py-5 border-b` (73px), logo chip
  32×32 radius 12, nav `px-2 py-4` with 42px items (radius 12, 14px/500),
  collapse chevron at the bottom (220px ⇄ 68px, persisted in the store).
- Cart rail: `w-full md:w-[380px]` + `border-l` from `md` (the reference's own
  tablet breakpoint), stacked with `border-t` below.
- Heading scale (Session-4, e2e-pinned): page H1s `text-2xl` (24px), section
  headings `text-base` (16px), Reports section headings `text-sm` (14px)
  uppercase — the reference's computed sizes. The reference's own headings
  render in near-invisible slate-700/800 on dark glass (its defect — pixel-
  verified); the clone keeps readable white/violet (superset posture).
- Fiscal card (Session-4): labels "Tax ID / EIN" / "Tax Regime" / "Fiscal
  Address" / "CFDI Use (default)" (the reference's CURRENT labels — it renamed
  them live after Session-101); the toggle mounts in the card header row,
  default = hidden (`hideFiscalOnReceipt @default(true)`), switch wired
  INVERTED (`checked={!hide}` — ON = "Visible on receipt").
- The cart "Added" banner: collapsed `max-h-0 opacity-0` strip that expands on
  add (emerald chip, circle-check, "ADDED" + product name) and auto-collapses
  (~2.5s; timer in the click handler — no setState-in-effect).
- **Form controls (Session-5, e2e-pinned)**: Input/Select/Textarea compute
  `rounded-xl` (12px) + `border-input` (#262a36) + transparent bg + `#707a8f`
  placeholders + ring-1 focus — the BASE components own this (never per-field
  `border-edge bg-white/5` overrides). Token contract: `--input`/`--border`
  `225 18% 18%`, `--muted-foreground` `220 12% 50%`, `--ring` `252 87% 67%`.
- **Buttons (Session-5)**: default size `px-4 py-2.5` (padding-driven 42px, no
  fixed h-9); CHARGE `py-5` (70px); Reports period pills `px-4 py-2 rounded-xl
  text-xs font-bold` in a `rounded-2xl` `rgba(28,31,52,0.85)` white/7-bordered
  container (inactive white/40, active violet-600 + shadow-lg).
- **The receipt footer is a TEXTAREA** (`rows=2`, min-h 60px — multi-line).
- Login (Session-5): the reference's card `bg-white/95 backdrop-blur-sm
  shadow-2xl overflow-hidden` + a 4px top gradient strip (slate-200→300→200) +
  the content padding on an inner wrapper (`p-8 sm:p-10 md:pt-12 md:pb-10
  md:px-10`); inputs `h-11 sm:h-12 bg-slate-50/50 border-slate-200 rounded-xl
  placeholder:text-slate-600 pl-10` (DIRECT slate classes — the reference's
  login form has its own base, never themed utilities); the logo is the
  vendored `public/veloxpos-logo.png` (96×96 img); SSO buttons `px-5 py-3.5`
  (54px, text-base).
- Login canvas: `to right bottom #f8fafc → #f1f5f9` gradient (`.login-canvas`),
  single-phrase slate-500 "Need an account? Sign up" button.
- **The reference DRIFTS between sessions** — live computed styles are the
  contract, the Session-101 spec §0 is a snapshot. Re-measure before any
  parity decision.
- Print: `@media print` reveals only `.receipt-print`.

## 7. The Tailwind v4 trap catalog (all pinned — see `globals.css` header)

1. **Bare HSL triplets in `@theme` resolve to transparent** — shadcn triplets
   stay raw in `:root`, routed as `hsl(var(--x))`.
2. **v4's default palette is oklch and drifts** — the full v3-era palette is
   pinned as literal hexes in `globals.css`.
3. **The shadow scale shifted** — `--shadow-sm` is pinned to v3's value.
4. **`space-y-*` + `mt/mb` children is forbidden** — v4's `:where()` rewrite
   flips specificity. Convention: flex `gap-*` only (the mobile-nav rule).
5. **Utility gradients interpolate in oklab** — exact sRGB gradients are CSS
   classes (`.glass-button-*`, `.brand-chip`).
6. **`rounded-sm` changed** — `--radius-sm` pinned to v3's 2px.
7. **Opacity utilities serialize as oklab** — e2e accepts both serializations.
8. **Blur renamed** — v3 `backdrop-blur-sm` is v4 `backdrop-blur-xs` (used on
   the drawer backdrop).
9. **Custom classes NEVER in `@layer utilities`** — v4 emits those AFTER
   generated utilities and they silently lose the cascade (the
   drawer-styling killer). `glass-*` lives in plain CSS.
10. **NO `tailwind.config.js`** — the "#1 cause of the flat look".
11. **(Session-3) The Radix animation family needs `@import "tw-animate-css"`**
    — without it every `data-[state]:animate-in/out/fade-*/zoom-*` class is dead
    CSS and dialogs pop with no motion. E2E pins a live `animation-name`.
12. **(Session-3) v4 wraps `hover:` in `@media (hover: hover)`** — every hover
    affordance no-ops on touch devices. `@custom-variant hover (&:hover);`
    restores the reference's v3 semantics (hovers apply on touch).
13. **(Session-5) Non-inline `@theme` bakes `hsl(var(--x))` into `--color-x` AT
    `:root`** — scoped triplet re-pointing (`.theme-light`) can never reach the
    utilities; the login inputs rendered dark borders on the light card for four
    sessions. `@theme inline` emits `hsl(var(--x))` directly in each utility
    rule (per-element resolution — verified in the built CSS).
14. **(Session-6) Fractional-alpha utilities serialize as oklab** (`text-white/40` →
    `oklab(… / 0.4)`) while the reference (Base44) emits `rgba(…, 0.4)` — the same
    color. E2e pins match the ALPHA (`/0.4)`) with `expect.poll` + regex; raw
    `evaluate` computed reads do NOT retry like `toHaveCSS` (a mid-load style
    race flaked a pin once before the poll hardening).
15. **(Session-6) Unlayered plain CSS beats utilities both ways** — a `glass-*` class's
    `border`/`color`/`background` always win over same-element utilities, so
    `border-0`/`text-*` on a glass button compute NOTHING (the reference ships such
    inert classes verbatim). Never "fix" what the glass class already owns.
16. **(Session-7) Pin races vs React's passive-effect flush (F-51)** — `toHaveCount(0)`
    passes the instant the commit removes a node, but the `useEffect` cleanup that
    restores side-effects (e.g. the drawer's `body.style.overflow` scroll lock)
    flushes AFTER it; an unpollled raw `evaluate` read lands in that window and fails
    reliably. Every raw computed read in the suite now polls (`expect.poll`). The
    meta-lesson: when a doctrine lands, SWEEP the suite for the old pattern — the
    Session-6 poll hardening covered only the new pins and left two Session-3-era
    reads to fail a later gate. Related capture discipline: settle-wait ~600ms before
    screenshotting animated surfaces (a mid-slide drawer frame reads as a clipped
    drawer to a VLM — the Session-7 screenshot catch).
17. **(Session-9) v4's preflight sets NO `cursor: pointer` on buttons (F-58)** — v3's
    preflight carried `button, [role="button"] { cursor: pointer }`; v4 dropped it, so
    every button computes `cursor: default` while the reference (v3-era CSS) measures
    `pointer`. The cure is the base-layer rule in `tokens.css`
    (`button:not([disabled]), [role="button"]:not([disabled]) { cursor: pointer }` —
    the `:not([disabled])` guard keeps the `.glass-button*:disabled` not-allowed
    contract winning). E2e-pinned on the sidebar chevron.
18. **(Session-9) A measured CSS class string is not an icon name (F-56)** — the
    reference's Reports glyph class `lucide-file-chart-column-increasing` names the
    lucide export `FileChartColumnIncreasing` (the FILE variant), but Session-6 read
    it as "ChartColumnIncreasing" (the bare-bars export — a visibly different glyph
    that survived three sessions because nothing pinned the class). Lesson: when a
    measurement produces a class string, map it through the library's actual export
    table, and PIN the class (`toHaveClass(/lucide-file-chart-column-increasing/)`) so
    the mapping cannot silently rot.
19. **(Session-10) A documented trap can land and still be missed elsewhere (F-59)** —
    the v4 blur-scale rename (v3 `backdrop-blur-sm` 4px = v4 `backdrop-blur-xs`) was
    documented as trap #8 and correctly applied to the drawer backdrop, but the login
    card carried the verbatim v3 class and computed double the reference's blur for
    nine sessions — nothing pinned the computed `backdrop-filter`. Lesson: when a scale-
    rename trap is documented, grep EVERY use of the renamed utility family
    (`backdrop-blur-*`, `shadow-*`, `rounded-*`), and pin at least one computed value
    per family.
20. **(Session-10) v4's default palette is oklab-defined (F-62)** — any ramp value NOT
    hex-pinned in the `@theme` block serializes as `lab(...)` instead of the reference's
    `rgb(...)`. `text-indigo-400` computed `lab(59.866 22.4834 -64.4485)` until
    `--color-indigo-400: #818cf8` was pinned. Lesson: when a computed pin expects
    `rgb(...)` and reads `lab(...)`, the color is the same — pin the HEX in `@theme`
    and the serialization follows.
21. **(Session-10) Copy pins are not style pins (F-61/F-62/F-63)** — the stat cards'
    labels and every empty state's copy were pinned as visible text while their
    TREATMENTS (chip gradients, icon colors, weights, muted tones, padding rhythms)
    drifted freely for nine sessions. Lesson: a surface is not pinned until its
    computed geometry/colors are asserted, not just its copy; and when a component is
    shared between two reference views, verify BOTH views' reference DOMs first — the
    reference itself ships TWO different stat-card families (Dashboard gradients vs
    Reports flat chips) that the clone had collapsed into one.
22. **(Session-11) A scoped theme needs a carrier (F-70)** — the `.theme-light`
    scope's `--foreground` re-point is inert until a utility APPLIES it: the base
    Input/Textarea carried no text color, so they inherited the dark-theme BODY
    color and the login's TYPED credentials rendered near-white on the near-white
    card — invisible since Session-101, invisible to e2e (fills don't read rendered
    text) and to screenshots (they showed the empty form). Lesson: scoped token
    re-points are only half the fix — the base component must route the utility
    (`text-foreground`) for the scope to reach the element; and pin the TYPED-state
    color, not the empty-state screenshot.
23. **(Session-11) Gradient buttons live in background-IMAGE (the retracted F-65)** —
    the first measurement of the reference's dialog Create read
    `background-color: transparent` and concluded "outline button"; the
    re-measurement captured `background-image: linear-gradient(135deg, rgb(124,58,237),
    rgb(99,102,241))` — the same `glass-button-primary` the clone already shipped.
    Lesson: `background-color` and `background-image` are DIFFERENT layers — measure
    BOTH before concluding a button's treatment; a retraction caught by
    re-measurement is the audit discipline working, not a wasted step.
24. **(Session-11) The dialog family is SOLID, not glass (F-64)** — the reference's
    dialogs compute `rgb(15,18,26)` + `#262a36` + NO backdrop-filter, and the
    `glass-dark border-edge` pair on every `*DialogContent` was doubly wrong: the
    glass values (translucent + blur(20px) + white/6) mismatched the measured
    surface AND the `border-edge` utility was inert (trap #15 — unlayered glass
    beats utilities). Lesson: when an inert override ships next to a plain-CSS
    class, ask what the author INTENDED — the intent (a #262a36 border) was the
    reference contract all along. The primitive's `bg-card border-border` IS the
    mechanism; re-point the token, strip the override. (And sweep ALL `*Content`
    primitives — four SelectContent sites carried the same inert pair.)
25. **(Session-12) v4 RESCALED the tracking family (F-85f)** — v3's `tracking-wider`
    is 0.1em; v4's is 0.05em. The reference's OR divider computes 0.1em; the copied
    class computed HALF of it. Lesson: the F-59 genus extends beyond renames — v4
    also RESCAALED utilities; any letter-spacing contract from a v3-era reference
    needs the arbitrary-value spelling (`tracking-[0.1em]`) and a computed-px pin
    (0.1em at 12px = 1.2px — computed styles resolve em to px).
26. **(Session-12) v4's rounded-full is calc(infinity * 1px) (F-85a)** — the
    reference's v3-era 9999px vs the clone's computed 33554400px (Chrome serializes
    `3.35544e+07px`) — the same visual, different serializations. Lesson: pin the
    CLASS SEMANTICS ("fully rounded"), not one serialization — accept both forms in
    the assertion.
27. **(Session-12) Alpha-modified utilities serialize as oklab(.../α) (F-76)** —
    `bg-red-50/70` computes `oklab(0.970522 0.0123999 0.00388682 / 0.7)` in v4 while
    the reference's v3-era CSS computes `rgba(254, 242, 242, 0.7)` — the SAME color.
    Trap 20's hex-pin cure does NOT apply (the /70 forces color-mix serialization);
    the login-geometry regex posture is the cure: pin the alpha either way
    (`/rgba\(...\)|oklab\(...\/\s*α\)/`).
28. **(Session-12) Next's route announcer carries role="alert" (F-76's e2e
    hardening)** — `#__next-route-announcer__` (aria-live, role=alert) exists at
    body level on every page; a page-level `getByRole("alert")` in strict mode
    matches BOTH the app alert and the announcer. Lesson: scope role-based
    locators to the surface container (`main.login-canvas [role='alert']`).

## 8. Component architecture & the React patterns that are law

- **Server-gated pages, client views.** The `(app)` layout calls `getCurrentUser()`;
  the guest never receives app HTML. Views hydrate via `usePosBootstrap`
  (session + collections in parallel; 401 → full reload to `/login?from_url=…`).
- **Client redirects after auth use `window.location.assign/replace`** — a FULL
  reload (intentional, lint-warned once, documented): the app state must
  re-resolve from the cookie.
- **Key-based modal resets** — `key={editing?.id ?? "new"}`; never
  `useEffect(() => setState(...))` (React 19's `set-state-in-effect` is an ERROR
  rule here; Session-101 replaced every dialog-reset effect).
- **The login submit button ships `disabled` in SSR HTML** and unlocks via a
  `setTimeout(0)` callback (the pre-hydration native GET would leak the
  password into the URL; e2e waits for `toBeEnabled()` before filling).
- **Toasts via `useToast()`** → `toast.success/error/info(message)` — never
  `alert()`. Errors unwrap through the `api.ts` seam as `ApiError`.
- **`<div onClick>` banned** — real buttons with `aria-label` when icon-only.
- **Views are render-only** — state from `usePosStore` selectors; no derived
  store copies. `.find()` selectors are safe (stable reference); ANY selector
  that allocates (`.filter().map()`) must be `useShallow`-wrapped (the infinite
  re-render law — none exist today, keep it that way).

## 9. The mobile drawer contract (e2e-pinned — `tests/e2e/mobile-navigation.spec.ts`, 13 tests)

The reference's OWN mobile defect (measured live twice): a 220px z-50 sidebar
overlaying phone content with NO hamburger. The clone ships the documented a11y
SUPERSET instead:

- Labeled hamburger (`aria-label="Open navigation menu"`, `aria-expanded`,
  `aria-controls`) in a `md:hidden` top app bar; the desktop chevron is
  desktop-only (no dead controls).
- Drawer: conditional mount (`mobileNavOpen &&`), `role="dialog"` +
  `aria-modal` + `aria-label="Navigation menu"`, 288px (`w-72`) `.glass-dark`
  panel, 8 labeled links, backdrop + Escape + route-change close.
- **Focus management (Session-3, F-3):** focus moves to the close button on
  open; Tab/Shift+Tab WRAP inside the drawer (`trapDrawerTab` in
  `app-shell.tsx`); focus restores to the hamburger on close.
- **md-growth auto-close (Session-3, F-4):** a `matchMedia("(min-width: 768px)")`
  listener closes the drawer when the viewport grows past md — otherwise the
  `md:hidden` drawer would keep the body scroll lock with no way to release it
  (the neo-crm S8-P1 pinned bug class).
- Entrance animation: `animate-in slide-in-from-left duration-300` (panel) +
  `animate-in fade-in-0` (backdrop); **exit is the instant unmount** — the e2e
  pins assert `toHaveCount(0)` immediately, so exit animations are deliberately
  NOT shipped (settle-wait doctrine would otherwise be forced into the pins).
- Body scroll lock while open; no horizontal overflow at 390×844 (pinned).
- `hidden md:flex` sidebar stays IN THE DOM below md — e2e asserts VISIBILITY,
  never DOM count.

## 10. Auth architecture

- scrypt (16-byte salt, 64-byte key, `timingSafeEqual`); wrong-password burns
  the same scrypt work (no timing oracle).
- HMAC-SHA256 session tokens over `{uid, iat, exp}` (base64url), httpOnly +
  SameSite Lax `sf_session` cookie, 7-day TTL, `secure` in production unless
  `COOKIE_SECURE=false` (the documented plain-HTTP escape hatch).
- `AUTH_SECRET` boot guard (`src/instrumentation.ts`, `NEXT_RUNTIME === "nodejs"`
  guard — the Edge-runtime `process.exit` warning in the build is BENIGN):
  production exits on missing/weak secrets; dev falls back with a warning.
- Fixed-window rate limiting: 10 attempts/IP/15 min on login/register/forgot
  (in-memory, single-instance posture — documented). The e2e suite logs in ONCE
  via `auth.setup.ts` + storageState because of this.
- Full family: register/login/logout/me/forgot/reset/change-password/
  change-email/verify-email/resend-verification/delete-account.

## 11. API layer idioms

- Route files are 3-line shells over `makeCollectionRoutes`/`makeItemRoutes`
  (`src/lib/server/http.ts`): `withUser` → Zod (strip) → delegate → Prisma.
- Delegates (`src/lib/server/entities.ts`): every query `where: { userId }`;
  updates/removes verify ownership BEFORE mutating.
- Error envelope: `{ error: string }` with the status mapper (Zod → 400,
  P2002 → 409, P2025 → 404, unauthed → 401, rate → 429). Unknown errors log
  server-side only.
- Cashier routes are owner-only; cashier rows with shift history are never
  hard-deleted.
- Store settings lazily materialize on first GET (the reference's defaults).

## 12. Testing strategy (three tiers)

1. **Unit (Vitest, 146/146, 14 files)** — the pure seams only (plus the docs-counts
   lockstep gate). New `src/lib` seam ⇒ new `tests/unit` file (red → green). UI
   components get no unit tests.
2. **E2E (Playwright, 104/104)** — against the PRODUCTION standalone build on :3100
   with its own scratch db (`db/e2e.db`, ABSOLUTE path — see db-path ADR), booted
   by the webServer command (kill-port → provision → boot; the db is NEVER
   replaced while the server lives). Projects: `chromium` (1440×900, channel
   `chromium` — the full browser; chrome-headless-shell has a cookie quirk on
   plain-HTTP localhost) and `mobile` (390×844, runs only the drawer spec).
   Auth once via storageState (the rate limiter); `auth.spec.ts` opts out.
3. **Live re-measurement (agent-browser)** — computed styles beat screenshots;
   re-measure the reference before any design-system change and record the
   measurement in the plan doc.

Field-tested doctrine: the login form is inert until hydration (`toBeEnabled`
first); visibility assertions for `hidden md:*`; specs self-clean with
`${Date.now()}` names; the terminal spec closes its shift so the mobile
gate-parity pin sees "No active shift"; `bunx playwright install chromium` in
sandboxes.

## 13. Responsive & z-index maps

| Breakpoint | What flips |
|---|---|
| `<768px` | top app bar + hamburger; drawer nav; cart stacked under the catalog (`border-t`); no sidebar |
| `≥768px (md)` | desktop sidebar (220⇄68); cart becomes the 380px side rail; drawer/hamburger unmount (auto-close on growth) |
| (no lg-specific shell behavior) | terminal content padding md:p-6 |

Z-index scale (flat, documented): aside `z-40` · app bar `z-40` · drawer +
backdrop `z-50` · Radix overlays (dialog/select) `z-50` (primitive default) ·
toasts above (viewport primitive). No `z-[9999]`.

## 14. Debugging guide (symptom → root cause → fix)

| Symptom | Cause | Fix |
|---|---|---|
| `Error code 14: Unable to open the database file` | Wrong anchor / shell-env override | Run via npm scripts from repo root; check `env \| rg DATABASE`; absolute URL for standalone |
| e2e login bounces to /login | Stale server squatting :3100 with a deleted db inode | The webServer command kills the port first; never replace `db/e2e.db` while the server lives |
| Login loops after restart | `AUTH_SECRET` changed between restarts | Keep the secret stable (prod boot guard surfaces it) |
| Sudden 429s | The fixed-window limiter (10/15min) | Wait `Retry-After`; restart clears in-memory buckets |
| Dialogs/selects pop with no animation | `tw-animate-css` import removed from globals.css | Restore the import (e2e animation pin catches it) |
| Hovers dead on tablets | The v4 `(hover: hover)` wrap | `@custom-variant hover (&:hover)` must stay |
| Drawer keeps the page scroll-locked after rotating to tablet | md-growth guard removed | The matchMedia auto-close is load-bearing (pinned) |
| Hydration mismatch / lint error `set-state-in-effect` | Effect copying props into state | Remount-via-key or adjust-during-render |
| Strict-mode "2 elements found" | `hidden md:*` duplicate subtrees | Scope locators or `.filter({ visible: true })` |
| `next build` warns `process.exit` in instrumentation.ts | Statically analyzed for the Edge runtime | BENIGN — the `NEXT_RUNTIME === "nodejs"` guard owns it |
| A grep hit shows a "typo" like `"ealth]…"` in a `[health]`-style string | The bash OUTPUT DISPLAY eats the literal `[h` sequence — the SOURCE is fine | Never diagnose from a terminal echo: confirm raw bytes via a second tool (the Read tool, or `grep -c "health\]"`) before editing (Session-13's withdrawn SD-4) |

## 15. Anti-patterns (each traces to a real bug)

- Custom classes in `@layer utilities` (cascade killer) or a `tailwind.config.js`.
- `space-y-*` with `mt/mb` children.
- Utility gradients for the measured brand blends (oklab drift).
- `parseFloat` arithmetic in components; trusting client totals.
- Effects that setState from props (React 19 lint error here).
- Per-test logins in e2e (the rate limiter — storageState instead).
- Replacing `db/e2e.db` while the e2e server lives (inode desync).
- Deleting a db file under a running server (it serves the deleted inode).
- `alert()` instead of toasts; `<div onClick>`; icon-only buttons without labels.
- "Fixing" the mixed EN/ES copy — Sales = "Historial de Ventas", Cashiers =
  "Cajeros"/"Turnos Recientes", the 404 = "Página no encontrada" — all VERBATIM
  reference parity. Do not touch.
- Making `/Settings` resolve — it 404s BY DESIGN (the reference's own href is
  `/StoreSettings`).

## 16. Coding patterns (copy these shapes)

- New entity: schema row → Zod contract in `validation.ts` → delegate in
  `server/entities.ts` → 3-line route over the factory → store collection +
  action → view table + `key={editing?.id ?? "new"}` dialog → e2e journey.
- New pure logic: the seam + its `tests/unit` file FIRST (red), then wire.
- Design-system change: measure the reference (computed styles) → record in
  the plan doc → move the token → pin with an e2e assertion.
- Docs: five surfaces in the same commit (README/AGENTS/CLAUDE/PAD/this skill)
  — count changes trigger `rg "<old number>"` across the doc set.

## 17. Key interfaces (daily drivers)

```ts
// money.ts — the only place amounts are computed
toCents(dollars: number): number; fromCents(c: number): number;
round2(n: number): number; formatMoney(amount: number, currency: string): string;

// cart.ts
type CartLine = { productId: string; name: string; price: number; qty: number; taxRate: number };
cartTotals(lines: CartLine[]): { subtotal: number; taxTotal: number; total: number };
canCharge(lines: CartLine[]): boolean;           // the CHARGE gate
changeDue(total: number, paid: number): number;

// shift.ts
canOpenShift(shifts: Shift[], registerId: string): boolean;   // one ACTIVE per register
expectedCash(openingFloat: number, sales: Sale[]): number;
shiftVariation(counted: number, expected: number): { delta: number; label: "Over"|"Short"|"Exact" };

// store.ts — THE Zustand store (create<PosStore>)
products/categories/registers/shifts/sales/cashiers: T[]; settings: StoreSettingsRow | null;
user: AppUser | null; hydrated: boolean; dataReady: boolean; cart: CartLine[];
sidebarCollapsed: boolean; mobileNavOpen: boolean; activeView: ViewId;
// actions: loadAll/loadCore, setUser, toggleSidebar, setMobileNavOpen,
//          addSale, addProduct/…, changeQty/removeLine/resetCart, hydrateFromPath

// api.ts seam
apiGet<T>(path): Promise<T>; apiSend<T>(method, path, body): Promise<T>;  // throws ApiError
```

## 18. Doc chain

`README.md` (tour) · `AGENTS.md` (agent contract: commands, invariants, traps) ·
`CLAUDE.md` (conventions + the law list) · `Project_Architecture_Document.md`
(ADRs 001–008, security, testing doctrine) · this skill ·
`docs/veloxpos-implementation-plan.md` (the measured reference spec §0 — the
parity ground truth) · `docs/remediation-plan-session-3.md` (the audit ledger) ·
`docs/Tailwind-V4-Validation-Report.md` (the trap evidence) ·
`docs/DEPLOYMENT.md` (standalone runbook) · `worklog.md` (session journal) ·
`docs/how-to-git-push-using-ssh-wrapper_SKILL.md` (the push runbook:
`docs/ssh_git_wrapper_v3.py`, key outside the repo, 0600, dry-run → push →
verify → shred).

## 19. Session history (what shaped this skill)

- **Session-101** (worklog): the Omni-Study → VeloxPOS domain replacement; the
  reference measured live (F1–F21 in the plan doc); 117 unit + 39 e2e; the five
  field-tested e2e failures (Edge-runtime instrumentation, pre-hydration GET,
  Secure cookies on http, the relative-URL inode desync, the stale-port squatter).
- **Session-3**: the audit-driven parity pass — `tw-animate-css`
  wired (the dead animation family), the hover un-wrap, the drawer focus
  superset + md-growth auto-close, the cart `md:` breakpoint, the brand-row
  border frame, five dead deps removed, docs lockstep. Ledger:
  `docs/remediation-plan-session-3.md`. The recovered parallel-session
  `veloxpos_SKILL.md` (stale: `vx_session` cookie, `server/pos.ts`, the
  "/Settings superset" claim) was replaced by this code-accurate skill — the
  code wins; where any doc disagrees, fix the doc in the same commit.
- **Session-4** (this version): the reference-drift parity pass — the live
  reference had renamed its fiscal labels (Session-101's RUC/NIT spec was a
  snapshot); heading scale pinned at the reference's computed 24/16/14px with
  readable colors kept; the fiscal toggle contract (header row, inverted
  wiring, hidden default); the cart "Added" banner; the login gradient +
  single-phrase signup button; Title Case copy pins (`exact: true` —
  Playwright's substring match is case-INsensitive). 10 new e2e pins,
  45→55. Ledger: `docs/remediation-plan-session-4.md`.

## Session history addendum — Session-5

**The form-control parity pass + the @theme inline bug.** A computed-style census
at the depth earlier sessions never measured (inputs, buttons, pills, the login
form internals) found 13 deltas — the headline being the **Tailwind v4
theme-switching bug**: non-inline `@theme` baked `hsl(var(--input))` at `:root`,
so `.theme-light`'s re-pointing never reached the utilities (the login inputs
rendered dark borders on the light card since Session-101 — visible in the old
screenshots, never measured until now). Fixed at the root (`@theme inline`) AND
at the surface (the reference's direct slate classes). The systematic sweep:
every form control to 12px radius + #262a36 border-input + transparent bg; the
Button default to py-2.5 (42px); CHARGE to py-5 (70px); the receipt footer to a
TEXTAREA; the Reports pills to the reference's geometry; the login card frame
(shadow-2xl + the 4px strip + the vendored logo + 54px SSO buttons). 13 new
e2e pins, red → green; unit untouched at 117/117.

## Session history addendum — Session-6

**The chrome-depth parity pass + the chart-axis bug.** The standing audit cycle re-measured
the live reference at a depth earlier sessions never pinned — the SIDEBAR CHROME (which had
drifted under our feet: the reference's nav items are now padding-driven 40px py-2.5 pills
with `font-medium` 16px icons and an active `border-violet-500/30 + shadow-violet-500/10`
pair; its Reports glyph is now `ChartColumnIncreasing`), the SETTINGS section headers
(bare per-section-colored 20px icons — indigo/purple/green/orange/blue/amber — no chip
wrapper), the CATEGORY flow (a header Add chip opening a "New Category" dialog — not an
inline input row), the 54px py-3.5 Save Changes CTA, the 36px Inventory chip family, and
the POS gate (p-8 card, /30 icon, white/35 copy with a <strong>-styled emphasis). Ten
findings, all TDD red → green: 9 new e2e pins + the inventory category pin rewritten to
drive the reference's dialog flow (protection preserved) + a button.tsx scaffold cleanup
(the dead sf-* variants).

**The headline catch — F-50, the chart-axis bug — came from the VLM, not the calipers:**
the visual sweep of the live dashboard flagged "a dense vertical block of white pixels" on
the Sales chart. Both hand-rolled charts drew ONE grid line + label per unit of the y
domain — for dollar revenue that is hundreds of labels stacked fractions of a pixel apart
(the demo week rendered 108). Shipped in Session-101; invisible to every audit because the
e2e store is EMPTY (max=4 → five tidy labels). The fix is a pure `niceTicks` seam
(`src/lib/reports.ts`, 6 unit pins: 4→[0..4], 17→[0,5,10,15], 470→[0,100..400], count ≤ 6)
+ both charts render from it + the Dashboard x axis now labels weekdays at 12px (measured:
the reference's Recharts convention). The regression pin drives a REAL checkout first, so
the chart is finally asserted at data scale. Lesson codified in ADR-011: **a "correct at
demo scale" implementation is a latent production bug — the e2e oracle must exercise the
data state, not only the empty state.**

Two pin-doctrine additions: (1) v4's fractional-alpha utilities serialize as oklab while
Base44 emits rgba — pin the ALPHA (`/0.4)`), never the string; (2) raw `evaluate` computed
reads do not retry — one mid-load style race flaked a passing pin before everything moved
to `expect.poll`. Unit 117→123 (the niceTicks seam), e2e 68→78, all prior pins intact.

## Session history addendum — Session-7

The standing audit→remediate→push cycle on the Session-6 tree (HEAD `88dae55`). The
fresh-clone gate re-verification surfaced ONE red pin: the mobile spec's "no stuck scroll
lock" failed reliably (77/78 full suite AND isolated — not a flake). Root cause was IN
THE PIN, not the product: instrumented proof (a MutationObserver on `body[style]`) showed
the drawer's effect cleanup restoring overflow ~46ms after the md-growth close — the pin's
raw `evaluate` read raced React's passive-effect flush between the DOM commit
(`toHaveCount(0)` passing) and the cleanup. **F-51**: the two Session-3-era raw reads in
`mobile-navigation.spec.ts` predated the Session-6 poll doctrine; both hardened to
`expect.poll` (same assertions, same protection, retried). No product code touched.

The full reference re-measurement (nav, settings, category dialog, inventory chips,
reports, dashboard chart, POS gate, copy, login internals, mobile state) found **NO drift
this cycle** — every Session-4/5/6 pin re-measured byte-exact on the live site. The
Session-6 chrome audit re-verified clean (the category dialog restructure, the niceTicks
seam, the nav chrome). The VLM sweep re-caught a capture-discipline gap: a screenshot
taken mid-entrance-animation reads as a broken drawer — settle-wait ~600ms before
capturing animated surfaces (now part of trap 16).

Gate: lint 0 errors (1 documented warning) · tsc clean · unit **123/123** · build green ·
e2e **78/78** (the mobile spec re-proven stable across 3 consecutive full runs). The F-51
path verified LIVE (lock engages → releases on growth) plus the Session-6 chrome
spot-checked on the rebuilt standalone. Five fresh screenshots (32–36). Skill v2.3.1.

## Session history addendum — Session-8

The standing audit→remediate→push cycle on the Session-7 tree (HEAD `16d4736`). The
received-tree gate came back GREEN on first run (78/78 — the F-51 hardening held), and
the full reference re-measurement found **NO drift for the second consecutive cycle**
(every Session-4/5/6 pin byte-exact; the reference's own mobile defect still present at
390×844). All four findings were codebase-side:

- **F-52 (the docs-counts genus)**: this skill's OWN live-tense sites had re-staled
  (§3 said unit (117)/playwright (55); §12 said 117/117 + 68/68) while the headline docs
  rode the per-session re-anchor — plus the PAD's scale line said 7 models · 22 routes
  against a live 9 · 26, its file tree said 8 spec files against a live 7, and
  vitest.config.ts's header said 12 files against a live 13. **The neo-crm docs-counts
  mechanism is now adopted** (`tests/unit/docs-counts.test.ts`): live censuses of the
  test/source tree + every live-tense doc site pinned + the retired forms banned
  (scoped — history blocks keep their numbers). 17 stale sites corrected; the gate's
  maiden run even caught 3 README sites the manual sweep missed.
- **F-53 (the missing tier 3)**: `scripts/smoke-test.sh` — the 13-step API ladder
  against the standalone artifact (own `db/smoke.db`, throwaway AUTH_SECRET, fresh db
  each run): health, the 401 wall, the SSR shell, the login cookie round-trip, the Zod
  400, a CRUD create/DELETE, the logout teardown, the rate-limit 429, sitemap/robots,
  the no-secret boot refusal, and the artifact-hygiene checks. `bun run smoke` +
  `bun run gate` wire it into the gate chain.
- **F-54 (the artifact shipped secrets)**: `.next/standalone/` carried `.env` (the live
  AUTH_SECRET) + `db/custom.db` (dev user rows with scrypt hashes) on every build. The
  double-cure: `outputFileTracingExcludes` + the build script's
  `rm -f .next/standalone/.env` (Next's writeStandaloneDirectory copies .env explicitly,
  immune to the excludes). `prisma/schema.prisma` stays traced (the db-path anchor);
  policed by smoke step 13 every run. ADR-012 records the contract.
- **F-55 (comment/code mismatch)**: the checkout's ticket-count + active-shift reads
  moved inside the `$transaction` (the comment always claimed they were; two concurrent
  checkouts could previously allocate the same ticket). Verified live through the real
  UI: the journey allocated T-000035, pinned the shift, and the ledger row landed.

Gate: lint 0 errors (1 documented warning) · tsc clean · unit **133/133** (13 files,
+10 the docs-counts gate) · build green (hygiene-clean) · e2e **78/78** · smoke
**13/13**. Live evidence 8/8 (the cleaned artifact serves login, checkout, every view,
and the mobile drawer contract) + a 6/6 VLM sweep of screenshots 37–42. Skill v2.4.0.

## Session history addendum — Session-9

**The third consecutive drift-free reference cycle; the audit went one layer
deeper (tag census + cursor semantics) and found three chrome-level gaps.**

The received tree gated green on first run (133/133 · 78/78 · 13/13 — after
provisioning the environment's chromium-1243 for the lockfile's Playwright
1.63.0). The live reference re-measured byte-exact at every pinned depth for
the THIRD consecutive cycle (sidebar, POS gate, Dashboard, Inventory, Reports,
Settings, Spanish copy, login internals, the mobile defect) — and this cycle's
parity audit extended beyond computed styles to the DOM tag census and button
cursor semantics, which surfaced what the style-only audits had missed:

- **F-56 (MEDIUM)**: the Reports nav glyph — the reference's measured class
  `lucide-file-chart-column-increasing` names the export
  `FileChartColumnIncreasing` (a document with increasing bars); Session-6's
  F-47 fix had misread the class string as "ChartColumnIncreasing" (bare bars)
  and codified the misreading into the AGENTS/CLAUDE/SKILL chrome contracts.
  It survived three sessions because NO pin asserted the glyph class. Fixed
  (the import swap + the corrected contracts) and pinned
  (`toHaveClass(/lucide-file-chart-column-increasing/)`). Trap 18.
- **F-58 (MEDIUM)**: buttons computed `cursor: default` (v4's preflight
  dropped v3's `cursor: pointer`) while the reference measures `pointer` —
  the family skill's §12 trap, never swept here. The base-layer cure landed
  in `tokens.css` with the `:not([disabled])` guard (the disabled
  `not-allowed` contract keeps winning). Pinned on the chevron. Trap 17.
- **F-57 (LOW)**: the reference renders its section headings as `<h3>`
  (Dashboard ×2, Settings ×6, Cashiers "Turnos Recientes") — the clone's h2s
  had identical computed styles (16px/700) but a different document outline.
  Nine tags swapped; the heading pins extended with `level: 3`.

TDD: all three fixes went red-first (the new glyph + cursor pins and the
level-extended heading pins failed against the pre-fix tree), then green. One
existing locator rode the intentional h3 change (`section.locator("h2 svg")`
→ `"h3 svg"` in the section-icon census — assertion strength unchanged; the
Session-7 sweep lesson found no other tag-specific locators).

Gate: lint 0 errors (1 documented warning) · tsc clean · unit **133/133**
(13 files) · build green (hygiene-clean) · e2e **80/80** (+2: the glyph +
cursor pins) · smoke **13/13**. Live evidence on the standalone
(`scripts/capture-s9-evidence.mjs`): **14/14** — the three fixes measured
live (the FILE glyph on desktop + in the drawer, pointer on SSO/chevron/
hamburger, the h3 censuses), the checkout journey (ticket T-000035), the
shift lifecycle, and the drawer contract at 390×844. VLM sweep of screenshots
43–48: 6/6 effective (three initial flags were prompt-expectation bugs — the
login canvas IS light per Session-4's measured gradient; Dashboard was the
legitimately active pill; a 900px viewport shows the first three Settings
sections). Skill v2.5.0.

## Session history addendum — Session-10

**The cycle:** received-tree gate green on first run (133/133 · 84/84 target pending ·
13/13 smoke) — wait: the received tree measured **80/80** e2e (the Session-9 baseline);
the reference stayed drift-free for the FOURTH consecutive cycle. With the style surface
stable, this cycle's audit went to a NEW depth — whole-DOM dumps of the stat-card
families + the empty-state census + the muted-tone sweep — and found five clone-side
gaps the copy-only pins had never covered:

- **F-59**: the login card's `backdrop-blur-sm` (v4 = 8px) vs the reference's v3-era
  4px — the documented trap #8 applied to the drawer but missed on the card; cured with
  `backdrop-blur-xs` + a computed `blur(4px)` pin (trap 19).
- **F-60**: the post-login landing `/POS` vs the reference's `/` — the redirect now
  defaults to `/`, a new `(app)/page.tsx` serves the terminal at the root, and the
  landing is pinned (pathname predicates — `toHaveURL` regexes match the FULL url
  string, not the path; the first RED run tripped on exactly that).
- **F-61**: the Dashboard stat family — solid-gradient 40px chips with white icons +
  gradient opacity-20 corner blobs + semibold slate-500 labels + bold mt-1 values
  (value color keeps the readable superset; the reference's slate-800 values are its
  VLM-confirmed near-invisible defect). The exact gradients live as `.stat-grad-*` CSS
  classes — v4's utility gradients serialize `lab()` stops (the `.brand-chip` doctrine).
- **F-62**: the Reports stat family — a DIFFERENT reference family (horizontal cards,
  48px rounded-2xl /15+/30 chips LEFT, w-6 tone-400 icons, 400 white/35 labels,
  font-black white values, no blob, indigo/emerald/violet tones); the dedicated
  `ReportsStat` component replaces the shared StatCard there. Surfaced trap 20 (the
  unpinned indigo-400 lab() serialization).
- **F-63**: the systematic muted-tone substitution — the reference's slate-500
  subtitles / slate-400 empty copy / 64px slate-200 stroke-2 empty icons / white-25
  cart copy / py-12 rhythms had all been substituted with white/xx variants in the
  initial build; matched verbatim across seven views (the `subtitleClassName` prop
  carries Reports' own white/35 exception). The Registers empty-card pins live in
  registers-shifts.spec's first test — the empty state only renders before Register 1
  exists (an order-dependence the full-suite run caught; the isolated run passed).

**TDD:** all five fixes red-first (the blur 8px≠4px, the landing /POS≠/, the chips
44px≠40px/48px, the subtitle white/50≠slate-500), then green. The lockstep: e2e 80 → 84
(+4 tests; the F-60 landing assertions EXTENDED the existing sign-in test, and the
F-63 registers pins EXTENDED the registers-shifts first test).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **133/133** (13
files) · build green (hygiene-clean; the root route `ƒ /` in the table) · smoke
**13/13** · e2e **84/84**. Live evidence (`scripts/capture-s10-evidence.mjs`):
**12/12** — all five fixes measured live, the checkout journey, and the drawer
contract at 390×844. VLM sweep of screenshots 49–54: 6/6 effective (the one initial
flag — "no visible blur" on the login card — was the prompt's expectation bug: the
reference's canvas is a plain gradient with nothing behind the card to blur; the 4px
value is a computed contract, verified on both sides). Skill v2.6.0.

## Session history addendum — Session-11

**The fifth consecutive drift-free reference cycle; the audit went to the
dialog/form-text depth and found the oldest live defect in the codebase.**

The received tree gated green on first run (133/133 · 84/84 · 13/13). The live
reference re-measured byte-exact at every pinned depth for the FIFTH
consecutive cycle — so this cycle's audit opened the DIALOGS (client-side,
no writes needed) and measured, for the first time, the container/title/
label/input/button family and the select dropdown:

- **F-70 (HIGH)**: the login's TYPED credentials computed rgb(231,233,239) —
  near-white on the near-white card, INVISIBLE since Session-101. The base
  inputs carried no text color, so the `.theme-light` scope's foreground
  re-point never reached the fields. Cured at the root: `text-foreground`
  on the base Input/Textarea + the scoped foreground to zinc-950
  (`240 10% 4%`); pinned on the typed text. Trap 22.
- **F-64 (MEDIUM)**: the reference's dialogs are SOLID `rgb(15,18,26)`
  (#0f121a via `--card: 224 27% 8%`) + 1px #262a36 + NO blur — the clone's
  `glass-dark border-edge` pair was doubly wrong (translucent+blur+white/6
  values, and the border-edge utility was INERT per trap #15). Stripped
  from every `*DialogContent`/`AlertDialogContent` AND four `SelectContent`
  sites that would have defeated the popover re-point; the Close hit-area
  extended to the measured 36px. Trap 24.
- **F-66 (MEDIUM)**: the reference's form text is ONE family — every label
  (14px/500), dialog title (18px/600), and input text computes
  `rgb(231,233,239)` #e7e9ef. The clone shipped 35 `text-white/70` Label
  overrides + 11 `text-white` titles + ~30 per-field input overrides that
  bypassed the token. The base components own the color now. En-route
  catch: the `--foreground` triplet `221 28% 93%` computed #e8ebf2 — its
  "#e7e9ef" comment was a rounding approximation; all five
  foreground-family triplets re-pointed to the exact `225 20% 92%`.
- **F-67 (MEDIUM)**: six dialog Cancellations + two AlertDialogCancels + the
  receipt "Cerrar" were bare ghosts (transparent, white/70) — the
  reference's Cancel is the gray `glass-button` family; the clone's own
  category-dialog pattern applied everywhere.
- **F-68 (LOW)**: the New Register dialog 448 → 512px (`sm:max-w-lg`).
- **F-69 (LOW-MEDIUM)**: the select dropdown surface — `--popover` to
  `225 21% 11%` (#161922, the measured listbox).
- **F-65 (RETRACTED)**: the "outline Create button" reading missed the
  `background-image` gradient layer — the clone's `glass-button-primary`
  was byte-exact all along. Trap 23 records the two-layer lesson.

**TDD:** all pins red-first (rgb(231,233,239)≠rgb(9,9,11), glass-dark≠solid,
white/70≠#e7e9ef, transparent≠gray, 448≠512), then green. En-route: the raw
dialog-width reads raced the zoom-in-95 entrance (511.58 mid-zoom) — all
three hardened to `expect.poll` (the F-51 doctrine, third strike).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **133/133**
(13 files) · build green (hygiene-clean) · smoke **13/13** · e2e **88/88**
(+4: the typed-text pin, the register-dialog contract, the product dialog +
select, the Settings label family; the category-dialog pins EXTENDED an
existing test). Live evidence (`scripts/capture-s11-evidence.mjs`): **12/12**
— all six fixes measured live, the checkout journey (T-000039), and the
mobile drawer contract at 390×844. VLM sweep of screenshots 55–60: **6/6
effective** (including the typed-text legibility check on the login card).
Skill v2.7.0.

## Session history addendum — Session-12

**The sixth consecutive drift-free reference cycle; the audit opened the four
never-measured auth surfaces and found the sign-in card's own skeleton.**

The received tree gated green on first run (133/133 · 88/88 · 13/13). The live
re-measurement held EVERY standing pin byte-exact for the sixth cycle — and the
NEW depth (the failed-login error state, the forgot view, the sign-up view, the
authenticated 404, the logged-out bogus route) found ten findings, all
clone-side, all on the auth surface. A second-pass structural capture of the
sign-in card went further than any prior session: beneath the byte-exact pins
(card blur/shadow, 48px inputs, 54px SSO), the reference's body is ONE
`flex flex-col items-center text-center space-y-6 sm:space-y-8` block — the
flat margin chain the clone shipped was never visible to size-only pins.

- **F-76 (MEDIUM)**: the error state — a bare red `<p>` → the reference's
  bordered Alert PANEL (`rounded-xl border-red-200 bg-red-50/70 p-4` + inner
  14px red-700, no icon); both error and success now render through the new
  `src/components/ui/alert.tsx` primitive (the emerald success tone is the
  documented superset — the reference's success state is unmeasurable).
- **F-77 (MEDIUM)**: the forgot view — the reference SWAPS the whole card
  content (logo/h1/sub/SSO/OR all gone; a "Back to sign in" ArrowLeft link
  first; the centered h2 + slate-600 desc; one 44px field with
  `placeholder:text-slate-400`; the 44px solid-slate-900 Send button).
- **F-78 (MEDIUM)**: the sign-up view — back-first + "Create your account" +
  exactly Email/Password/Confirm Password at 44px, NO SSO, NO Full name (the
  register API's optional fullName is simply not sent); the equality check
  runs client-side BEFORE any fetch.
- **F-79 (MEDIUM)**: the 404 — chip numeral → plain `text-3xl font-bold
  text-white` span; slate-800 h1 / slate-500 p; the 50px `font-medium` gradient
  link with the lucide ArrowLeft icon; `rounded-3xl p-12` card, `min-h-screen
  p-6` wrapper (the reference's pos-gradient-subtle computes solid rgb(8,10,20)
  = the clone's `--color-ink` — no token work).
- **F-82 (MEDIUM)**: the guest gate — the reference auth-gates unknown routes;
  the root not-found is now an async server component mirroring the (app)
  layout's gate. Next 16 renders `/_not-found` Dynamic within the request
  scope — NO build escape was needed.
- **F-85 (MEDIUM, the content-block depth)**: the halo+ring logo group, the
  responsive h1 (`text-2xl sm:text-3xl tracking-tight`) and sub
  (`text-sm sm:text-base font-medium`), the knockout OR divider (continuous
  absolute `h-[1px]` line + `bg-white px-3` uppercase "or"), the
  `space-y-4/5 → 3/4 → 1.5` form chain, the IN-FORM `flex-col sm:flex-row
  justify-between` links row (Forgot left / signup right at desktop;
  column/8px/center at 390px), and the SSO family's `text-[16px]` +
  `transition-all duration-200 hover:shadow-sm` with Google's `-ml-4` quirk.
- **F-80 (LOW)**: the signup phrase is MIXED — "Need an account? " 400/slate-500
  + "Sign up" in a font-medium slate-700 span (the Session-4 whole-phrase pin
  had drifted on the reference).
- **F-81 (LOW-MEDIUM)**: the sign-in button — `text-sm h-11 sm:h-12 shadow-sm
  transition-all duration-200` (14px/500).
- **F-83 (LOW)**: "Forgot password?" — `text-sm font-medium` slate-500 →
  slate-700 hover, NO underline anywhere.
- **F-84 (LOW)**: the busy copy — "Signing in…" (observed mid-flight on the
  reference; the other views' busy copy is unmeasured and stays).

**TDD:** all pins red-first — RED proof 9/9 targeted failures, zero collateral
(84 passing of 93). Three v3→v4 serialization traps surfaced in the GREEN run
and were cured per the standing doctrine (traps 25–27: the tracking rescale,
the rounded-full infinity, the oklab alpha) plus the route-announcer locator
trap (28). One parity correction on a prior pin: the divider label moved from
the literal "OR" to the reference's lowercase "or" + CSS uppercase transform.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **133/133**
(13 files) · build green (hygiene-clean; `/_not-found` Dynamic) · smoke
**13/13** · e2e **93/93** (+5 new tests; four contracts EXTENDED existing
tests — no prior pin weakened). Live evidence
(`scripts/capture-s12-evidence.mjs`): **8/8** — the sign-in block, the alert
panel, the busy copy (held mid-flight via route interception), the forgot
swap, the signup card, the 404, the guest gate, and the mobile 390px sign-in
(80px logo, 24px h1, 44px inputs, links column, no horizontal overflow).
Screenshots 61–66. The count constants re-anchored (E2E=93, "Session-12
lock", "79 desktop + 13 mobile + 1 setup"). Skill v2.8.0.

## Session history addendum — Session-13

**The seventh consecutive drift-free reference cycle; the audit opened the
last unmeasured auth surface (the reset-password page, all three states) and
cured the standing StudyFlow static debt; one audit finding withdrawn as a
display artifact.**

The received tree gated green on first run (133/133 · 93/93 · 13/13). The
live re-measurement held EVERY standing pin byte-exact for the seventh cycle.
The NEW depth — the reset-password surface no prior session had ever opened —
revealed a COMPLETELY different design family from the login card: the
reference's reset page is the stock shadcn GRAY family (the base44 default),
measured live in all three states.

- **F-86..F-91 (MEDIUM)**: the form state — a flat `bg-gray-50` canvas (never
  the login's slate gradient), the 8px `rounded-lg` shadow-lg card with a 2px
  SOLID gray-900 top strip (not the login's 4px slate gradient), the
  `text-center space-y-2` h2 block ("Set new password", 24px/700 gray-900,
  NO logo circle), Title Case gray-700 labels ("New Password"/"Confirm New
  Password"), 6px `rounded-md` gray-200 `bg-gray-50/50` inputs (44px, Lock
  icons on BOTH fields, zinc-500 placeholders, the "Must be at least 8
  characters" helper), NO token field (the URL carries it), the 44px gray-900
  "Reset password" + the full-width "Back to login" text link.
- **F-92 (MEDIUM)**: the reset surface's OWN alert family — `rounded-lg` (8px)
  + `bg-red-50/50` (0.5 alpha) + inner 14px **red-800 #991b1b** (measured
  rgb(153,27,27); hex-pinned in `@theme` per the F-62 doctrine) — distinct
  from the login's F-76 panel (12px/0.7/red-700); the reference itself ships
  two alert treatments on its two auth surfaces. The Alert primitive gained
  `tone="error-soft"`.
- **F-93 (MEDIUM)**: the tokenless dead-end — the reference NEVER renders the
  form without a token: an 80px `bg-red-100` circle chip + the 40px lucide
  CircleAlert (red-600) + h2 "Invalid Reset Link" + "This password reset link
  is invalid or has expired." + the 44px gray-900 "Back to Login" button,
  ZERO inputs. The clone now ships three SERVER-RENDERED states (the token
  arrives as a prop from the async page's `searchParams` — no client URL
  read, no hydration flip; `/reset-password` renders Dynamic).
- **F-94 (LOW)**: the reset API's error copy moved to the reference's own
  "Invalid or expired reset token"; the client mismatch copy is the measured
  "Passwords do not match" (no period) — checked BEFORE any fetch (the e2e
  intercepts the route and asserts ZERO requests).
- **SD-1..SD-3 (the standing static debt, cured)**: 243 of 254 tracked
  scripts deleted (the git-history census since the StudyFlow pivot is the
  keep-list: `smoke-test.sh` + `capture-s7..s12-evidence.mjs` +
  `vlm-verify-s8/s9/s11.mjs` + `vlm-recheck-s9.mjs` = exactly 11 velox-pos-era
  files); 4 dead src files deleted (`src/lib/date.ts`, `dep-audit.ts`,
  `dev-preflight.ts`, `server/ai.ts` — zero-importer StudyFlow remnants);
  `omni-study1_SKILL.md` archived to `docs/archive/omni-study1/`; the
  `studyflow`-branded Docker trio deleted (zero Docker references in the
  velox-pos docs — the deployment story is the standalone build); 3 dead
  `outputFileTracingExcludes` entries dropped.
- **SD-4 WITHDRAWN (the display-artifact lesson)**: the first-pass Session-12
  audit's "`[health` log typo" was a FALSE POSITIVE — this sandbox's bash
  OUTPUT DISPLAY eats the literal two-byte sequence `[h` (`echo "[health]"`
  renders `ealth]"`). The source was always correct; control-proven and
  withdrawn. The debugging guide now carries the rule: never diagnose a
  source defect from a terminal echo — confirm raw bytes via a second tool.
- **The write-gate verification (live-proven)**: the reference's demo account
  is CLIENT-SIDE write-gated — the New Register Create never enables (both
  fields genuinely typed via CDP keyboard events), and no writable action
  fires a toast. The checkout→receipt chain, the Sales receipt viewer, and
  every toast contract are UNMEASURABLE on the reference — documented
  superset surfaces the clone's own flows own.

**TDD:** all pins red-first — RED proof 4/4 targeted failures, zero
collateral (the setup project's sign-in passes alongside). No v4
serialization surprises this time — the regex postures (trap #27) and the
hex pins (the F-62 doctrine, incl. the new `--color-red-800: #991b1b`) were
applied UP FRONT from the standing trap catalog.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **133/133**
(13 files) · build green (hygiene-clean; `/reset-password` Dynamic) · smoke
**13/13** · e2e **97/97** (+4 new tests, all NEW — no prior pin weakened).
Live evidence (`scripts/capture-s13-evidence.mjs`): **10/10** — including the
FULL one-shot reset round-trip (forgot-password → resetUrl → reset → done,
the owner's password rewritten to its current value — the dev db's
credentials unchanged) and the login-surface sanity sweep. Screenshots
67–70. The count constants re-anchored (E2E=97, "Session-13 lock", "83
desktop + 13 mobile + 1 setup"). Skill v2.9.0.

## Session history addendum — Session-14

**The cycle:** received-tree gate green on first run at `fdd2704` (the operator's
session_22.md raw log — its "Next" pointer named this cycle's targets: the chart
internals + the fresh-clone pristine path). The EIGHTH consecutive drift-free reference
cycle (every standing pin byte-exact: the login card, the F-76 alert, the sidebar, the
terminal gate, the Spanish families, the Dashboard date line, the reference's own mobile
defect at 390×844).

**The NEW depth — the chart internals, never measured in any prior session**
(F-95..F-106): the reference ships TWO distinct chart contracts. The Dashboard chart:
an **indigo-500 #6366f1 2.5px SMOOTH monotone line** over a **slate-200 #e2e8f0 1px
dashed-3-3 grid** (5h+7v), **two full-length slate-400 axes** + 12 tick stubs (x-ticks
245→251), **12px slate-400 ticks** (x middle-anchored baseline 253, y end-anchored x=57),
a **gradient area** (indigo 0.3 @5% → 0 @95% under fill-opacity 0.6), **ZERO data
dots**, plot viewBox `0 0 731 280` (baseline y=245, edge x=65 — container-responsive
width, FIXED paddings). The Reports chart: its OWN family — **indigo at 2px**,
**white/4% dashed grid with NO axes**, **11px white/30 ticks**, gradient **0.35** @5%,
plot `0 0 1130 220` (baseline y=190). The earlier "dotted grid + violet stroke" was an
unmeasured Session-101 assumption that survived 13 cycles because no session had swept
the chart internals — F-50 pinned only the tick discipline.

**The cure:** the new pure seam `src/lib/chart-path.ts` (`smoothPath` — a
Fritsch-Carlson monotone-X cubic Hermite; flat data reproduces the reference's measured
D shape with controls at 1/3·2/3 spans; unit-pinned 5/5) + both chart rewrites in
`shared.tsx`. Colors are SVG ATTRIBUTES (literal hex) — the Tailwind cascade and its v4
oklch serialization never touch the charts.

**The static sweep (SD-1):** 12 zero-importer ui primitives deleted (avatar, badge,
card, checkbox, dropdown-menu, popover, progress, separator, skeleton, slider, tabs,
tooltip) + the 9 Radix packages serving only them removed via `bun remove` — the ui
layer is exactly the 10 live files, census-proven in the evidence script. The
Session-13 sweep cleared `src/lib` + the pos components; the ui/ layer had kept its
scaffolding-era full set.

**SD-2 — the Session-13 evidence claim CORRECTED:** the s13 round-trip's "the owner's
password rewritten to its current value — the dev db's credentials unchanged" (this
skill's Session-13 addendum, above) was **wrong** — the script typed its own form-fill
constant "Abcd1234!" into the reset form and silently changed `db/custom.db`'s owner
password. Found when this cycle's evidence login 401'd; hash-verified ("Abcd1234!"
matched, "$Abcd1234" did not); restored via `scripts/restore-owner-password.mjs`
(control-verified the drifted hash, end-to-end verified the restore to the
README-documented `$Abcd1234`). **The doctrine: any script that exercises a
password-changing flow ends by proving the DOCUMENTED login works.**

**The fresh-clone pristine-path verification (web-application §15's periodic gate, first
run on this repo):** clone of HEAD → `bun install` (485 pkgs from the lockfile) → `cp
.env.example .env` → `db:push` → `db:seed` → `typecheck` → `build` → standalone boot →
health `db:up` + /login 200. The no-AUTH_SECRET boot refusal fires first exactly as
documented — the pristine path works as the README quick-start says, verbatim.

**TDD:** all pins red-first. Unit RED 5/5 (the seam absent) — with an infrastructure
lesson: `next build` type-checks `tests/` too, so a unit-tier RED pin BLOCKS the
standalone build the e2e RED needs; the order for a two-tier RED is: prove the unit
RED, hold the unit test aside, prove the e2e RED against the pre-fix build, restore for
GREEN. E2E RED: exactly 5/5 targeted failures (the serial-mode siblings proven failing
individually), zero collateral. Two serialization postures learned mid-GREEN (no
assertions weakened): Chromium computes gradient fills QUOTED (`url("#id")` — the
reference's own computed fill measures identically), and the F-50 pin's `x < 34`
y-label filter (the clone's own old padding) was corrected to the measured plot edge
`x < 65`.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **138/138** (14 files,
+5 the chart-path seam) · build green (hygiene-clean) · smoke **13/13** · e2e
**102/102** (+5 chart pins — all NEW; the F-50 filter corrected, no prior pin
weakened). Live evidence (`scripts/capture-s14-evidence.mjs`): **14/14** — both
charts' contracts end-to-end, the SD-1 census, the F-76 drift spot-check (oklab-alpha
posture), the mobile drawer. VLM parity: the clone's chart matches the reference's on
all four contract axes. Screenshots 71–74. The count constants re-anchored (E2E=102,
"Session-14 lock", "88 desktop + 13 mobile + 1 setup"). Skill v2.10.0.

### Session-15 addendum (2026-10-27) — the with-data scale + the measured lists

The NINTH consecutive drift-free reference cycle (every standing pin byte-exact, and the
reference's own mobile defect persists — no hamburger at 390×844). Both session_24
"Next" pointers taken: **the StoreSettings dialog/select internals measured for the
first time** (the six h3 sections, the 16-label census, the New Category dialog at
byte-parity, the select panel family, the fiscal toggle decoded as the reference's
`lucide-toggle-left` icon-button — the clone's labeled Radix Switch stays the a11y
superset), and **the populated-data dashboard re-sweep with the demo seed**.

Three findings cured (F-107/F-108/F-109): (1) both charts' domains were `ceil(dataMax)`
while the gridlines stopped at the nice multiple below — a $92-day peak floated ~29px
above the top gridline (DOM-measured on the demo db; invisible to the empty-store e2e
by construction); the `niceScale` seam now rounds the domain top UP to the nice multiple
≥ max with `niceScale(4,5)` byte-identical to the measured empty contract. (2/3) both
Settings listboxes were never enumerated — Session-101 recorded "USD/EUR/MXN/GBP/…"
and the clone shipped invented extras (CAD/AUD/PEN; SumUp/Square) while MISSING the
reference's own entries (**ARS - Argentine Peso**; **PayPal/Clip/Mercado Pago**). The
measured lists replace the inventions; the lists ARE the Zod gate; both are e2e-pinned
by exact enumeration. The dependency census also caught `@radix-ui/react-toast` (the
toaster is zustand-based; the s14 V9 "toast is load-bearing" classification was WRONG —
corrected on the record) and `axe-core` — both removed; the primitives rows corrected.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **146/146** (14 files;
+6 the niceScale seam, +2 the measured-list pins) · build green · smoke **13/13** · e2e
**104/104** (+2 list pins — all NEW, no prior pin weakened; the validation pin that
encoded the same unmeasured assumption flipped with the measurement). Live evidence
(`scripts/capture-s15-evidence.mjs`, the demo-db boot): **14/14** — both charts'
with-data scale contracts (peaks BELOW their top gridlines, ticks covering the domain),
both listboxes byte-exact, the dead-dep census, the F-76 spot-check (oklab posture),
the mobile drawer. VLM cross-check **4/4**. Screenshots 75–80 (75/76 the pre-fix audit
record). The count constants re-anchored (UNIT=146, E2E=104, "Session-15 lock",
"90 desktop + 13 mobile + 1 setup"). Skill v2.11.0.

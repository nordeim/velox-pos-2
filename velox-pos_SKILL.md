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
version: 2.25.0
last_updated: 2026-10-29
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

Baselines at Session-29 lock: unit **157/157** (16 files) · e2e **124/124**
(110 desktop + 13 mobile + 1 setup) · lint 0 errors (1 documented
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
bun run test                   # vitest — tests/unit/** (157)
bun run build                  # standalone build + static/public copy
bun run test:e2e               playwright (124) — NEEDS the build first (:3100)
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
| `reports.ts` | 7/14/30/90 period windows, `dailySeries`, `byMethod`, `categorySlices`, `niceScale` (F-107: domain top = the nice multiple ≥ max — the peak never overshoots the top gridline; `niceScale(4,5)` = the measured empty contract), `saleTimestamp` (F-110: the byte-stable `DD/MM/YYYY HH:MM` receipt stamp — never bare `toLocaleString()`) | Feeds Dashboard + Reports + both receipt headers |
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

1. **Unit (Vitest, 157/157, 16 files)** — the pure seams only (plus the docs-counts
   lockstep gate; store.test.ts pins the F-118 shifts-race at the store seam). New
   `src/lib` seam ⇒ new `tests/unit` file (red → green). UI
   components get no unit tests.
2. **E2E (Playwright, 124/124)** — against the PRODUCTION standalone build on :3100
   with its own scratch db (`db/e2e.db`, ABSOLUTE path — see db-path ADR), booted
   by the webServer command (kill-port → provision → boot; the db is NEVER
   replaced while the server lives). Projects: `chromium` (1440×900, channel
   `chromium` — the full browser; chrome-headless-shell has a cookie quirk on
   plain-HTTP localhost) and `mobile` (390×844, runs only the drawer spec).
   Auth once via storageState (the rate limiter); `auth.spec.ts` opts out.
   The Session-20 drift-sweep tier (`viewport-drift-sweep.spec.ts`, extended
   Session-21): the 8 routes × 4 widths (390/768/1024/1440) zero-overflow
   battery + the chrome-switch contract + the with-data functional-scroll
   containment guard on ALL THREE ledger surfaces (Inventory/Sales/Cashiers
   at 390 — the F-117 three-ledger walk) — the standing visual-regression
   tier (the master skill §15 gate:full doctrine). The Session-22 with-data
   Reports walk (`with-data-reports-walk.spec.ts`): the exact wiring pin —
   the stats/methods/chart-domain asserted against values DERIVED FROM THE
   API at runtime — plus the with-data containment at 390; the file sorts
   LAST in the chromium project because it persists sales (the empty-store
   specs must run before its data exists). The Session-23 with-data
   Dashboard walk (`with-data-dashboard-walk.spec.ts`): the landing view's
   exact wiring pin — the today/stats testids, the category-breakdown rows
   and share bars, and the chart's niceScale domain, all derived from the
   sales/products/categories APIs at runtime — plus the with-data
   containment at the remaining widths (768/1024/390, the chrome switch
   with data). The Session-24 with-data Inventory CSV round-trip walk
   (`with-data-inventory-csv.spec.ts`): the superset feature's full chain —
   the import (setInputFiles with an in-spec buffer → the per-row POSTs →
   the store upserts → the ledger re-render → the "Import complete"
   toast), the export (the download's `products.csv` content: the header
   byte-exact, the fixture lines byte-exact with the category-NAME
   resolution both ways, the line count = 1 + the API-derived total), and
   the error path (a blank-name row → "Import failed: name is required",
   zero rows imported) — THREE specs now persist data; the CSV walk sorts
   between the dashboard and reports walks (d < i < r). The Session-25
   with-data fiscal receipt round-trip walk
   (`with-data-fiscal-receipt-walk.spec.ts`): the deepest StoreSettings
   chain — the fiscal switch flip (the inverted wiring) → the RUC/regime
   fills → Save → the API-persisted state → a REAL terminal checkout →
   the receipt's fiscal line asserted by its EXACT template text
   (RUC · business type) in the visible state, and gated to render NOTHING
   in the hidden-polarity state (the RUC still set, the flag off) — with
   the settings restored to seed defaults at the end; FOUR specs now
   persist data (d < f < i < r), the fiscal walk extending the self-clean
   law to the settings surface. The Session-26 password-reset round-trip (2
   tests appended to `auth.spec.ts`, guest-tier): the REAL one-shot chain the
   fabricated-token Session-13 pins could never see — register → verify-email
   → forgot → the 48-hex `resetPath` format → the reset page's done state →
   the NEW password signing in through the real UI (landing on the shift
   gate), plus the one-shot semantics (the consumed token rejecting replays,
   the old password dead at 401). The throwaway accounts are role=owner by
   the register default and the Cashiers roster filters role=cashier — no
   downstream pin perturbed; the API legs ride the ISOLATED `request`
   fixture so the verify-email session never leaks into the page context.
   The Session-27 Cashiers shift-ledger walk
   (`with-data-cashiers-ledger-walk.spec.ts`): the "Turnos Recientes"
   four-way join pinned WITH DATA — the closed row's six cells (the cashier
   identity from the ledger's own /api/shifts payload, the register, the
   mirrored shiftTime·shiftDuration math, the FIN close time, the
   join-derived `$total (n)` cell, the Cerrado chip) + the six Spanish
   headers, and the active polarity (Fin —, `$0.00 (0)`, the Abierto chip)
   flipping to closed on the exact-variance close. The Session-28 Sales
   receipt-viewer walk (`with-data-sales-receipt-viewer-walk.spec.ts`): the
   clone's own working Sales surface pinned end-to-end — the ledger row's
   derived cells (the es-MX Fecha, the Cajero cell from the sale's own
   /api/sales payload, the chip families, the money cell), the viewer's
   content exact (the item-line math, the saleTimestamp description, the
   Método row, the footer outside .receipt-print), the search's three arms
   (ticket || customer || cashier + the no-match "Sin ventas" row), and the
   refund round-trip (the one-way 400 guard, the idempotent same-status
   re-PATCH, the Reembolsada chip flip, the viewer opening on the refunded
   sale) — extended in Session-29 with the receipt-PDF leg (the API leg:
   200 application/pdf + the Content-Disposition filename + the %PDF magic
   + the latin-1 content family + the bogus-id 404 wall; the UI leg: the
   "Descargar PDF" anchor → the download event → the byte-identical file).
   SIX specs now persist data — the ledger walk sorts FIRST, the sales
   walk LAST (c < d < f < i < r < s).
3. **Live re-measurement (agent-browser)** — computed styles beat screenshots;
   re-measure the reference before any design-system change and record the
   measurement in the plan doc.

Field-tested doctrine: the login form is inert until hydration (`toBeEnabled`
first); visibility assertions for `hidden md:*`; specs self-clean with
`${Date.now()}` names; the terminal spec closes its shift so the mobile
gate-parity pin sees "No active shift"; `bunx playwright install chromium` in
sandboxes; the post-reset sandbox KILLS background processes between tool
calls — dev-server-dependent probes must be SELF-CONTAINED per call
(boot → wait-for-ready → probe → shutdown, the `with-dev-server.sh` bundle);
agent-browser's daemon state SURVIVES across calls (a named session per task
avoids hijacking other agents' pages).

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

## Session history addendum — Session-16

**The with-data Registers/Sales pass + the receipt-stamp cure (F-110) + the evidence
harness (F-111).** The workspace was RESET — a fresh clone re-established the tree at
`3a0594c`, and the fresh sandbox needed `bunx playwright install chromium`
(environment-only; recorded so the next fresh-clone cycle runs it before the gate).
The received-tree gate came up green on the first run (lint 0 · tsc · unit 146/146 ·
build · smoke 13/13 · e2e 104/104 — the Session-15 lock held).

**The drift sweep** (agent-browser): every standing pin byte-exact for the TENTH
consecutive cycle — the login card, the F-76 alert, the sidebar/pill, the terminal
gate, the Dashboard date line, the Spanish families, and the reference's own mobile
defect (no hamburger at 390×844; the clone's drawer superset stays correct).

**The NEW depth (the session_26 "Next" pointer's target)**: the reference-side
Registers/Sales internals measured at LEAF precision — the New Register dialog at
byte parity (panel `max-w-lg` = 512px — the 462 first-read was the content-box
artifact; #0f121a/8px/p-6/h-9/42px buttons; the reference literally ships the clone's
vendored `glass-*` class strings), the Sales search input (the "Buscar por ticket,
cliente o cajero..." placeholder byte-exact), and the empty cell
(`text-slate-400` at the leaf TD — a wrapper-div probe first misread #e7e9ef; the
TreeWalker leaf technique is the recorded measurement lesson). Then the WITH-DATA
audit on the demo seed: the Registers cards + Open-shift dialog, the Sales ledger
(33 rows) + ticket search + receipt viewer, the Cashiers shift ledger, the POS gate,
the Dashboard stats — **all green, no with-data defects**, the s15 F-107 peak
re-proven.

**The one real find — F-110**: both receipt headers shipped bare
`toLocaleString()` — client-locale-dependent (en-US on the audit browser, ar-SA
digits on an ar-SA device) inside the Spanish-mixed surface whose ledger cell is
es-MX. Cured with the `saleTimestamp` pure seam (byte-stable `DD/MM/YYYY HH:MM`,
manual padStart — the `shiftTime` precedent), unit-pinned ×3 (the no-Z ISO pin is
tz-safe), adopted at both sites, e2e-pinned as an ADDED assertion on the existing
checkout receipt (the count stays 104). **F-111**: the with-data contracts pinned in
the evidence tier (`scripts/capture-s16-evidence.mjs`) — the empty-store e2e can
never see this class (the s15 V24 doctrine); future cycles inherit the harness.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **149/149** (14
files; +3 saleTimestamp pins) · build green · smoke **13/13** · e2e **104/104** (the
F-110 regex riding the existing checkout test — zero collateral). Live evidence
(`scripts/capture-s16-evidence.mjs`, the demo-db boot): **13/13** — the with-data
Registers card census + Open-shift dialog family, the Sales ledger + search +
receipt (the F-110 stamp "26/10/2026 14:41" live), the Cashiers shift ledger, the
POS gate, the Dashboard stat family + the re-proven F-107 peak, the F-76 spot-check
(oklab posture), the mobile drawer. VLM cross-check **5/5**. Screenshots 81–86. Two
evidence-infra lessons recorded in AGENTS.md: `visible` ≠ animation-settled (Radix
zoom-in reads 384×0.95 ≈ 365 mid-flight), and bootstrap races on cold routes (wait
for the SETTLED state, not a timer) — both fixed without weakening a check. The
count constants re-anchored (UNIT=149, E2E=104, "Session-16 lock"). Skill v2.12.0.

## Session history addendum — Session-17

**The with-data Inventory/Reports evidence pass (F-112) + the measurement
postures.** The workspace was RESET TWICE — the second reset took the prior
Session-17 attempt's uncommitted work with it (never pushed), so this cycle redid
the depth end-to-end from the received tree at `ceb4530`. Environment-only blip:
the sandbox's cached Playwright browsers (build 1200) didn't match 1.63 (needs
1243) — `bunx playwright install chromium`. The received-tree gate came up green
(lint 0 · tsc · unit 149/149 · build · smoke 13/13 · e2e 104/104 — the Session-16
lock held).

**The drift sweep** (agent-browser): every standing pin byte-exact for the
ELEVENTH consecutive cycle — the login card (blur(4px) · white/95 · 16px · h1
30px/700 · inputs 48px/12px · SSO 54px), the F-76 alert, the 220px sidebar + the
42px violet-600/0.2 Terminal pill (the nav content reads 219px — flex-1, the
s16-recorded note), the terminal gate, the Dashboard date line, the Spanish
families, and the reference's own mobile defect (no hamburger at 390×844).

**The NEW depth (the session_28 "Next" pointer's target)**: the reference-side
Inventory/Reports internals — the Inventory empty state (the byte-exact "Search
by name or code..." placeholder, the "No products found" `text-center py-12
text-slate-400 text-sm` cell) and the Reports surface at BYTE PARITY (the 4 pills
with **"30 days" ACTIVE** — the clone's `days = 30` default matches; the three
14px/700 CSS-uppercased h2s; the stat cards' surface rgba(16,18,32,0.9) + 1px
white/0.07 — the clone's `glass-card` computes the byte-identical surface; the
labels incl. **"Avg. Ticket"** byte-identical; the values `<p>` 24px/900). Then
the WITH-DATA audit on the demo seed: **17/17, no defects** — the Inventory table
census (15 rows, the stock chips out=1/low=2/ok=12, the category dots, the search
filter) and the Reports family ($410.64/33/$12.44 at 30 days; card $246.74 (16)
60% / cash $163.90 (17) 40%; the 7-day window narrowing to $366.56/28). The
mid-audit "7-day discrepancy" was WITHDRAWN — the seam's calendar-bucket
semantics (N day-buckets including today) are correct by design and unit-pinned.

**F-112 — the evidence tier extended**: `scripts/capture-s17-evidence.mjs` (the
s16-pattern successor, port 3418) pins the with-data Inventory/Reports contracts +
the standing F-76/drawer spot-checks — **19/19**, screenshots 87–89. The tier is
now TWO harnesses (s16 Registers/Sales/Cashiers + s17 Inventory/Reports).

**Four measurement postures recorded** (all audit-probe bugs — the clone code was
correct every time): (1) textContent vs innerText case — CSS-uppercased labels
read "TOTAL REVENUE" in innerText but "Total Revenue" in textContent; pin
textContent, match innerText case-insensitively in settled-state waits (a
case-sensitive innerText wait hangs to its timeout). (2) `waitForFunction` arity —
options is the THIRD argument (`fn, null, {timeout}`); a `{timeout}` passed as the
second arg silently becomes the 30s default. (3) DOM rows parse child nodes — the
MethodTable's method name is a bare TEXT node and the share span nests inside the
font-bold money span; span-index probes read "" and "$246.7460%". (4) The
generalized oklab-alpha posture — v4 renders white/α as `oklab(0.99999… / 0.4)`:
extract the trailing alpha, never pin the full serialization.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **149/149** (14
files) · build green · smoke **13/13** · e2e **104/104** — the count constants
UNMOVED (the evidence tier rides outside the unit/e2e counts per the V24
doctrine; the "Session-16 lock" literal stays by design — zero lockstep
collateral). Live evidence **19/19**; VLM cross-check **3/3**. Screenshots 87–89.
Docs lockstep: AGENTS (the Session-17 contracts + the four postures), CLAUDE (the
tier-4 evidence line), PAD v1.15, this addendum, the worklog entry,
`docs/remediation-plan-session-17.md`, `docs/session_29.md`. Skill v2.13.0.

## Session-18 addendum (the with-data StoreSettings/Dashboard cycle)

The TWELFTH consecutive drift-free reference cycle (every standing pin byte-exact,
including the reference's own mobile defect). The NEW depth (the session_29 "Next"
pointer's target): the reference-side StoreSettings internals measured at FULL
structure for the first time since the s15 listbox enumerations — the six H3/16px
sections with their bare 20px icons at the measured colors (store/indigo ·
palette/purple · file-text/green · receipt/orange · credit-card/blue · tag/amber),
labels 14px/500 #e7e9ef, inputs 36px/12px, the Business Information card carrying
Store name ("My Store") + Logo + Address/Phone/Email + Tax ID / EIN + Currency, the
Branding color pickers, the Receipt footer textarea (rows=2/60px/12px), the Fiscal
card's four pinned labels + the `lucide-toggle-left` icon-button posture, the
Provider "None" trigger, Categories (Add 34px/8px + "No categories" slate-400),
Save Changes 54px — parity everywhere; both listbox enumerations re-verified
byte-exact; the "None" capitalization suspicion WITHDRAWN (the clone's
`cardProviderLabel` already renders the identical display label while storing the
code form "none").

Then the WITH-DATA audit on the demo seed: **16/16, no defects** — the Settings
form census (the materialized settings row: store name, currency "USD - US Dollar"
@ 36px/12px, the Branding pickers + hex inputs #6366f1/#8b5cf6, the Receipt footer
"Thank you for your purchase!", the "None" provider trigger, the fiscal switch
checked=false + "Hidden on receipt", the 5 category chips with EXACT dot colors,
the 54px Save CTA) and the Dashboard family (the 4 stats carrying the db truth —
**Today's Sales $0.00 / Transactions 0** (the HONEST calendar-bucket empty-today on
a morning-seeded db), Products 15, Low Stock 3 — the stat-family styles, both h3s,
the with-data chart (13 grid lines, y ticks 0..100, the niceScale **topTick 100 ≥
the $94.43 peak** — the F-107 law re-proven on real data), the 5 category-breakdown
rows at 3/20% each).

**F-113 — the evidence tier extended to THREE harnesses**:
`scripts/capture-s18-evidence.mjs` (port 3419) pins the with-data
StoreSettings/Dashboard contracts + the db-truth derivation checks + the standing
F-76/drawer spot-checks — **20/20**, screenshots 90–92. **The structural law**:
volatile with-data expectations (the Dashboard's today-bucket pair) are DERIVED
FROM THE DB AT RUNTIME via a read-only `bun -e` JSON dump BEFORE the probes — a
hardcoded "$X.NN today" pin rots within hours of any re-seed (the seed's day-0
sales land 16–20h before seed time, so a morning-seeded db carries them on
YESTERDAY's calendar bucket). Re-seed-stable constants (Products 15, Low Stock 3,
the settings row, the 5 category colors) stay literal.

**Three more measurement postures recorded** (all audit-probe bugs — the clone code
was correct every time): (1) pin COMPUTED styles, never class-string order — the
clone's icons render `h-5 w-5` (height-first) while the reference's measured string
is `w-5 h-5`; identical computed styles. (2) The oklab-alpha SPACE — v4 serializes
white/90 as `oklab(0.999994 … / 0.9)` WITH a space after the slash; the generalized
either-form regex is `/\/\s*([\d.]+)\)$/`. (3) Mixed tick arrays (numbers + weekday
labels) filter to numeric before reducing — `Math.max` over `Number("Wed")` is
NaN. Plus the authoring lesson: when a SyntaxError caret makes no sense, hexdump
the exact line — an unterminated string points three tokens away.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **149/149** (14
files) · build green · smoke **13/13** · e2e **104/104** — the count constants
UNMOVED (the evidence tier rides outside the unit/e2e counts per the V24 doctrine;
zero lockstep collateral). Live evidence **20/20**; VLM cross-check **3/3**.
Screenshots 90–92. Docs lockstep: AGENTS (the Session-18 contracts + the three
postures + the db-derived-expectation law), CLAUDE (the tier-4 evidence line
naming all three harnesses), PAD v1.16, this addendum, the worklog entry,
`docs/remediation-plan-session-18.md`, `docs/session_31.md`. Skill v2.14.0.

### Session-19 addendum (v2.15.0) — the receipt print-path pass

**The cycle's target** (the session_31 "Next" pointer): the receipt print-path —
the last unmeasured leg of the checkout→receipt chain. The reference's demo
account is client-side write-gated (its checkout/receipt surfaces are
unmeasurable), so the print path is the clone's OWN documented superset — and it
was broken twice.

**F-114 — the terminal receipt printed invisible text**: the `@media print`
block set `color: #000` only on the `.receipt-print` CONTAINER; the receipt's
explicit white text utilities (`text-white/60`, `/80`, `text-white`) beat the
INHERITED color — under `page.emulateMedia({ media: "print" })` the census
showed the ticket line at oklab-white/0.6, the items at white/0.8, and the
**Total row at pure rgb(255,255,255)** on the white print canvas. Only "My
Store" (the DialogTitle — no explicit color utility) printed black. **The
print-path law**: the print canvas is WHITE — every receipt line must compute
BLACK under print emulation; a container-only color can never deliver that
(explicit utilities beat inheritance). The cure rides the cascade law the
glass-* family already uses: tokens.css is UNLAYERED plain CSS, which beats
Tailwind v4's `@layer utilities` — the `.receipt-print, .receipt-print *` rule
gained `color: #000` with NO `!important`.

**F-115 — the Sales receipt viewer's Imprimir printed a BLANK page**: its
`SaleDetailDialog` carried NO `.receipt-print` wrapper, so under the print
block's `body * { visibility: hidden }` nothing re-became visible (the emulation
census: the dialog itself hidden, exactly ONE painted element). Cure: wrap the
viewer's receipt content in `.receipt-print` (the terminal receipt's own
structure); the Cerrar/Imprimir footer stays outside (buttons must not print).

**The pins land in the e2e tier as print-media emulation** (the F-76 posture —
computed styles are the ground truth): the F-114 pins ride the EXISTING
cash-checkout test (emulate print → the Total row + a line item compute
rgb(0,0,0) → emulate back — no count change, no shared-data-order risk); the
F-115 pin is the one NEW test (e2e 104 → **105**, 90 → **91 desktop**; the
"Session-16 lock" literal moves to the **Session-19 lock** — the cycle that
re-anchors the count owns the lock name). `page.emulateMedia({ media: "print" })`
is the honest harness for the whole print class — no print-preview dependency,
assertable computed styles.

**The probe lessons**: (1) the `Bun.password.verify` API rejects the app's own
`scrypt$salt$hash` shape (`PASSWORD_UNSUPPORTED_ALGORITHM`) — the credential
checker must MIRROR `src/lib/auth.ts`'s `scryptSync` + `timingSafeEqual`, not
call Bun's password API. (2) The SD-4 display artifact struck again in the Read
tool: `const [method` rendered as `const ethod` (the display eats the two-byte
`[m` sequence) — withdrawn before any "fix", the second time the lesson has
saved a false finding. (3) A print-path probe needs the full UI checkout first
(the receipt dialog only exists post-checkout) — the amount-received gate is
part of the fixture (the Complete button stays disabled until the amount covers
the total).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **149/149**
(14 files — UNMOVED) · build green · smoke **13/13** · e2e **105/105** (91
desktop + 13 mobile + 1 setup). Screenshots 93–95. Docs lockstep: AGENTS (the
Session-19 contracts + the print-path law), CLAUDE (the baseline + the
print-path line), PAD v1.17, README (badge + scripts + testing), the worklog
entry, `docs/remediation-plan-session-19.md`, `docs/session_33.md`.
Skill v2.15.0.

## Session history addendum — Session-20 (v2.16.0) — the four-width drift-sweep tier

**The finding (F-116) was a protection gap, not a live defect:** the four-width
responsive frame had ZERO standing e2e protection — the suite pinned 390 (the
drawer spec, /POS-centered) and 1440 (the desktop specs), the intermediate
widths 768/1024 had no coverage at all, the route-battery overflow contract
existed for /POS@390 only, and the with-data ledger containment (the neo-crm
M-109c1 genus — a seeded row's min-content overflowing the phone frame) had no
guard anywhere. The live ANALYZE proved the frame currently correct at 8 routes
× 4 widths, empty AND demo-seeded — and the reference itself ships the
class (its own static 220px sidebar scrolls the 390px document to 1280px).

**The tier (`tests/e2e/viewport-drift-sweep.spec.ts`, 2 tests — e2e 105 →
107, 91 → 93 desktop):** (1) the route battery — every route at every audit
width computes doc/main scrollWidth ≤ clientWidth, plus the chrome-switch
contract (the hamburger owns the sub-md chrome, the sidebar the md+ chrome —
VISIBILITY pins; `hidden md:flex` elements stay in the DOM below md); (2) the
with-data guard — a self-provisioned product, Inventory at 390: main stays
contained, the ledger container is a FUNCTIONAL scroll region, and the table
keeps its min-w-[760px] floor (the container contains — the table never
shrinks).

**The containment pin's observable is FUNCTIONAL, not structural (the cycle's
probe law):** a frame-level pin alone cannot catch the inner-container break
(the outer `glass-card overflow-hidden` absorbs the spill — measured live);
Chromium reports `scrollWidth > clientWidth` even for `overflow-x: visible`
(a scrollWidth census cannot distinguish — measured live); the `scrollLeft =
50` read-back DOES distinguish (under the injected mutation the assignment
no-ops — the honest mutation-proof red for a characterization spec). And the
container lookup is `table.closest(".vpx-scroll")` — NEVER a document-order
`.find(c => c.querySelector("table"))`: `main` ITSELF carries `.vpx-scroll`
(the app-shell's overflow-y-auto) and contains every table, so the find picks
MAIN, which is not a horizontal scroll container (the first run's lesson).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **149/149**
(14 files — UNMOVED) · build green · smoke **13/13** · e2e **107/107** (93
desktop + 13 mobile + 1 setup). Screenshots 96–98. Docs lockstep: AGENTS (the
Session-20 contracts), CLAUDE (the baseline + the drift-sweep line), PAD
v1.18, README (badge + scripts + testing), the worklog entry,
`docs/remediation-plan-session-20.md`, `docs/session_35.md`.
Skill v2.16.0.

### Session-21 addendum (v2.17.0) — the three-ledger walk + the store race it caught

**The with-data walk of the remaining ledger surfaces (the session_35 "Next"
pointer)**: the s20 guard visited Inventory only; Sales (`min-w-[720px]`) and
Cashiers (`min-w-[640px]`) were covered only by the frame battery — which the
V18 mutation proof had already established is blind to the inner-container
break. The extension restructures the guard's second test into the
THREE-ledger walk: ONE provisioning chain (category → product → register →
shift → sale — the shift's `cashierId` is the owner, so it renders the
Cashiers "Turnos Recientes" row) visits /Inventory, /Sales, /Cashiers at
390×844, each with the settled row wait, the frame pair, the functional-scroll
probe, and the per-route floor (760/720/640). The spec CLOSES its shift before
the walk (the self-clean law — an ACTIVE shift leaks into the downstream
specs' POS gate; a closed shift still renders the ledger row, "Cerrado").

**The walk caught a real production race (F-118) — the s15 V24 doctrine
proven twice.** The Cashiers leg flaked twice in four full-suite runs: "Sin
turnos registrados" with three closed shifts in the db. Root cause: the
store's `shifts` collection had TWO writers — `loadAll` (the full ledger
list) and `loadCore` (the active-only list) — racing inside the bootstrap
hook's `Promise.all([loadAll(), loadCore()])`; the last writer won, and the
ledgers intermittently lost their closed-shift history. Twenty sessions of
empty-store e2e never saw it (no closed shifts exist to lose). The mutation
ANALYZE had measured the surfaces correct — the race only manifests under
the full suite's sustained-load interleaving. THE LESSON: a with-data pin
that flakes is a PRODUCTION suspect first — reproduce deterministically at
the seam (the path-dispatched transport mock, the active-only fetch
resolving LAST), fix the root cause, never re-roll the suite.

**The cure:** `tests/unit/store.test.ts` (2 its — RED on the pre-fix store)
→ `loadCore` refreshes settings ONLY (no consumer reads the active-only
value; the terminal gate filters the collection itself:
`shifts.find(sh => sh.status === "active")`) → GREEN. UNIT 149 → 151, files
14 → 15 (the store seam joins the registry); E2E stays 107 (the walk
restructures the existing test).

**The reference's own mobile defect DRIFTED (D-1, the 15th sweep):** the
document no longer scrolls to 1280px at 390 — main is now SQUEEZED to 170px
beside the static 220px sidebar (no hamburger still). The defect class
persists, the observable changed; the clone's drawer superset remains
strictly better. Every live-tense doc site stating the old observable was
refreshed; history blocks keep their historical statements.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files) · build green · smoke **13/13** · e2e **107/107** (93 desktop +
13 mobile + 1 setup — the walk green across repeated full runs). Screenshots
99–101. Docs lockstep: the count constants + every live-tense site (the
"Session-20 lock" literal becomes the **Session-21 lock**), PAD v1.19, AGENTS
(the Session-21 store-writer contracts), CLAUDE (the store law + the
drift-sweep extension), README, the worklog entry,
`docs/remediation-plan-session-21.md`, `docs/session_37.md`.
Skill v2.17.0.

### Session-22 addendum (v2.18.0) — the with-data Reports walk

The session_37 "Next" pointer landed: the Reports surface — the only view
whose entire value is COMPUTED from the sales ledger — got its with-data
tier (`tests/e2e/with-data-reports-walk.spec.ts`, F-119). Before it, every
Reports pin was empty-state; the CHAIN (API → store → memoized
summarize/dailySeries/byMethod → DOM) was e2e-invisible — a store-wiring
regression of the F-118 genus, a lost data-testid, a MethodTable that stops
rendering when data exists, a chart domain that stops covering its data (the
F-107 class), or a with-data containment break at 390 would ALL have passed.

The walk provisions a cash AND a card sale (the byMethod two-row shape) and
asserts the stats/methods/chart EXACTLY against values DERIVED FROM THE
API's own response at runtime (never hardcoded — the s18 harness's
volatile-expectation lesson): the three stat testids, both method tables
with counts/shares/bars, the topmost chart tick ≥ the today-bucket revenue,
the 7-day pill switch keeping the data, and the containment at 390. The
reference cannot produce this state (write-gated, measured live: $0.00
stats, 2× "No data for this period") — the tier is a functional superset,
the s20/s21 lineage.

The ordering lesson: the spec file name is LOAD-BEARING — it sorts LAST in
the chromium project (after surfaces.spec) because it PERSISTS sales;
surfaces.spec's empty-Reports pin ("No data for this period" visible) must
run BEFORE the walk's data exists. A spec that persists data must sort
after every spec that pins the empty state of what it creates, and it must
self-clean its shift (the standing law — the mobile POS gate).

The sixteenth reference sweep: every standing pin HOLDS (login card,
F-76, sidebar, Dashboard date line, Spanish families) and the reference's
mobile defect is STABLE at its Session-21 D-1 shape (no hamburger, the
static 220px sidebar, main crushed to 170px, the document contained at 390).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **109/109** (95
desktop + 13 mobile + 1 setup). Screenshots 102–104. Docs lockstep: the
count constants + every live-tense site (the "Session-21 lock" literal
becomes the **Session-22 lock**), PAD v1.20, AGENTS (the Session-22
with-data contracts), CLAUDE, README, the worklog entry,
`docs/remediation-plan-session-22.md`, `docs/session_39.md`.
Skill v2.18.0.

### Session-23 addendum (v2.19.0) — the with-data Dashboard walk

The session_39 "Next" pointer landed: the Dashboard — the app's landing
view, and the only major surface whose value is computed from BOTH the
sales ledger AND the product/category collections — got its with-data tier
(`tests/e2e/with-data-dashboard-walk.spec.ts`, F-121). Before it, every
Dashboard pin was empty-state (surfaces.spec's styles, the drift-sweep's
data-agnostic containment) or evidence-tier-only (the s18 harness pins the
with-data shape at 1440 on the demo db, OUTSIDE the suite); the CHAIN —
the API sales list → the store's `sales` collection → `summarize(sales, 1)`
→ the stat testids; the products/categories APIs → `products.length`/
`lowStockCount`/the category rows and share bars; `dailySeries(sales, 7)`
→ the chart's weekday labels + the niceScale domain — was e2e-invisible,
and NOTHING pinned the with-data shape at 390/768/1024 anywhere.

The walk provisions its own idempotent chain (category → product with an
"ok" stock status → register → shift → one cash sale → shift CLOSED, the
self-clean law) and asserts the four stats, the category rows + bar
widths, the chart's topmost numeric tick ≥ the API-derived today revenue,
and the last x-label = today's weekday — all EXACTLY against values
DERIVED FROM THE APIs at runtime (the s18/s22 volatile-expectation law:
the today pair mirrors `inPeriod(sale, 1, now)`'s calendar-bucket
semantics, the Low Stock mirror inverts `stockStatus`'s "ok" condition,
the rows mirror the view's count-desc + "Uncategorized" derivation). The
second test pins the with-data containment at the REMAINING widths
(768/1024: the md+ chrome + the frame; 390: the sub-md chrome + the chart
and category surfaces inside the viewport) — the drift-sweep battery
visited those widths EMPTY only.

The ordering law, extended: TWO specs now persist sales — the dashboard
walk (d) sorts before the reports walk (r), both after every empty-state
pin of what they create; between the two, the relative order is flexible
(each derives from the API at runtime) but the names keep the reports walk
last by convention. The session_39 third candidate (the store's bootstrap
pair) was probed and found CLEAN — `loadCore` is settings-only (the F-118
cure closed the genus); recorded as the audit's negative result.

The seventeenth reference sweep: every standing pin HOLDS (login card,
F-76, sidebar, landing, Dashboard date line + chart h3s, Spanish families)
and the reference's mobile defect is STABLE at its Session-21 D-1 shape
(no hamburger, the static 220px sidebar, main crushed to 170px, the
document contained at 390); the reference's Reports surface is still EMPTY
($0.00, 2× "No data for this period") — the with-data tiers remain a
functional superset.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **111/111** (97
desktop + 13 mobile + 1 setup). Screenshots 105–107. Docs lockstep: the
count constants + every live-tense site (the "Session-22 lock" literal
becomes the **Session-23 lock**), PAD v1.21, AGENTS (the Session-23
with-data Dashboard contracts), CLAUDE, README, the worklog entry,
`docs/remediation-plan-session-23.md`, `docs/session_41.md`.
Skill v2.19.0.

### Session-24 addendum (v2.20.0) — the with-data Inventory CSV round-trip walk

The session_41 "Next" pointer landed: **the Inventory CSV round-trip e2e
walk** (F-122) — a README-advertised superset feature ("CSV export +
import") whose full UI chain had ZERO e2e protection. The unit tier pins
the pure seam (`parseCsv`/`parseCsvRow`/`productsToCsv`), but the WIRING
was e2e-invisible: the import chain (the hidden file input → the parse →
the per-row POSTs → `upsertProduct` → the ledger re-render → the "Import
complete" toast), the export chain (the store → `productsToCsv` with its
category-NAME resolution — a store-dependent derivation the unit tier
cannot test → the Blob → the `a.download="products.csv"` trigger → the
file content), and the error path (a blank-name row → "Import failed:
name is required", zero rows imported). The ANALYZE (V16) measured every
leg CORRECT live on the dev server (import 3→5 with both rows + the
toast; the export's header + rows byte-exact with `String(number)`
semantics; the error toast + unchanged count) — the finding is the
missing tier, not a live defect.

The cure (`tests/e2e/with-data-inventory-csv.spec.ts`, 2 tests): the
round-trip wiring pin — a "CSV Walk" category provisioned through the API
(POST asserted, the F-120 law), a two-row import CSV built IN-SPEC as a
buffer (`setInputFiles({ name, mimeType, buffer })` — no temp files, the
rows chosen to serialize byte-stably: cost `1.5` never `1.50`, the empty
category/cost columns as empty strings), then the import leg (the toast,
the API-derived count +2, both Product cells, the API verify — row 1's
`categoryId` resolved by NAME, row 2 null), then the export leg
(`waitForEvent("download")` → `suggestedFilename()` = `products.csv` →
the content: the header byte-exact, both fixture lines BYTE-EXACT, the
line count = 1 + the API-derived total — `toContain` per line, NEVER
full-file equality, the export is the FULL ledger). The second test pins
the error path: the blank-name buffer → the exact toast → the count
UNCHANGED → the barcode absent from the API.

The ordering law, extended again: THREE specs now persist data — the CSV
walk (i) sorts between the dashboard walk (d) and the reports walk (r);
its products perturb NO sale-derived pin (the reports walk derives from
sales; the dashboard walk runs before it), and inventory.spec's
"No products found"/"1 products registered" pins run before its imports
exist (i < w, workers: 1). A fourth persisting spec must be checked
against ALL THREE before it lands.

The eighteenth reference sweep: every standing pin HOLDS and the
reference's mobile defect is STABLE at its D-1 shape; the reference's
Reports surface is still EMPTY — the with-data tiers remain a functional
superset. The clone's mobile drawer re-verified live (the operator's
priority) with a probe-methodology lesson recorded (the V14 law, now in
AGENTS: a synthetic `el.click()` inside `page.evaluate` does NOT move
focus — the drawer's Escape-restore pin needs a REAL click probe).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **113/113** (99
desktop + 13 mobile + 1 setup). Screenshots 108–110. Docs lockstep: the
count constants + every live-tense site (the "Session-23 lock" literal
becomes the **Session-24 lock**), PAD v1.22, AGENTS (the Session-24 CSV
round-trip contracts + the probe-methodology law), CLAUDE, README, the
worklog entry, `docs/remediation-plan-session-24.md`, `docs/session_43.md`.
Skill v2.20.0.

### Session-25 addendum (v2.21.0) — the fiscal receipt round-trip walk

The session_43 "Next" pointer landed: **the with-data fiscal receipt
round-trip walk** (F-123) — the "StoreSettings save→toast" candidate taken
to its deepest unpinned chain. The StoreSettings surface was style-heavy in
the suite (surfaces.spec pins the toggle's DEFAULT state, the static fiscal
labels, the listboxes, the basic store-name save) and terminal.spec pins
the receipt's ticket/timestamp/footer/print-path — but NOTHING pinned the
receipt's fiscal conditional
`!settings?.hideFiscalOnReceipt && (settings?.fiscalRuc || settings?.taxId)`
in EITHER render state. The full chain was e2e-invisible: the INVERTED
switch flip (`checked={!form.hideFiscalOnReceipt}` — switch ON = "Visible
on receipt") → the RUC/regime fills → Save Changes → the PATCH payload →
`setSettings(row)` (the store refresh) → the toast → a real terminal
checkout → the receipt's dashed-border fiscal line. A polarity flip in the
conditional, a lost `fiscalRuc` in the save payload, a broken store
refresh, or the fiscal `<p>` stopping rendering would ALL have passed the
entire suite. The ANALYZE (V16) measured every leg CORRECT live (the
visible state renders the exact RUC text; the gated polarity — the RUC set,
the flag off — renders nothing; the restore returns the seed defaults) —
the finding is the missing tier, not a live defect; the reference cannot
produce this state (write-gated; its fiscal toggle is an icon-button with
no switch semantics — the labeled Radix Switch is the documented a11y
superset).

The cure (`tests/e2e/with-data-fiscal-receipt-walk.spec.ts`, 2 tests): the
visible state — flip + fill RUC/regime + save + toast + the API-persisted
state (`hideFiscalOnReceipt: false` + the RUC) + a REAL checkout journey
(open shift → add → CHARGE → cash) + the receipt's fiscal line asserted by
its EXACT template text (`FWALK-RUC-001 · S-Corp Test` — the U+00B7
template) inside `.receipt-print` + the shift closed (counted = float +
sale, exact variance); then the gated polarity — flip OFF with the RUC
STILL SET (the strongest hidden condition) + save + the API verify (the
flag true AND the RUC persisted) + the second checkout rendering NO fiscal
line (the `!hideFiscalOnReceipt` guard, proven — not just empty-field
absence) + the full restore (the RUC cleared + save → the seed defaults).
One probe fix during authoring: TWO inputs carry the "Tax ID / EIN" label
(Business Information's `taxId` and the fiscal card's `fiscalRuc`) — fiscal
locators must scope to the `region "Fiscal / Tax Data"` (the unscoped
`getByLabel` is a strict-mode violation).

The ordering law, extended again: FOUR specs now persist data — the fiscal
walk (f) sorts between the dashboard walk (d) and the inventory CSV walk
(i), all before the reports walk (r): d < f < i < r. Its sales/products
perturb no product- or sale-derived pin (every downstream walk derives from
the API at runtime — verified before the spec landed), and the self-clean
law is EXTENDED to the settings surface: both shifts closed, the settings
restored to seed defaults; even a mid-test failure leaves a safe state (the
downstream walks are settings-independent by construction).

The nineteenth reference sweep: every standing pin HOLDS and the reference's
mobile defect is STABLE at its D-1 shape; the reference's Reports surface
is still EMPTY — the with-data tiers remain a functional superset. The
clone's mobile drawer re-verified live (the operator's priority, REAL
clicks throughout — the V14 law).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **115/115** (101
desktop + 13 mobile + 1 setup). Screenshots 111–113. Docs lockstep: the
count constants + every live-tense site (the "Session-24 lock" literal
becomes the **Session-25 lock**), PAD v1.23, AGENTS (the Session-25 fiscal
round-trip contracts + the two-fields-one-label scoping law), CLAUDE, README,
the worklog entry, `docs/remediation-plan-session-25.md`, `docs/session_45.md`.
Skill v2.21.0.

### Session-26 addendum (v2.22.0) — the password-reset round-trip

The session_45 "Next" pointer landed: **the password-reset round-trip**
(F-124) — the auth surface's deepest UNPINNED chain, with ZERO suite
references before this session (`rg "resetPath|resetUrl|PasswordResetToken"
tests/` returned nothing). The Session-13 pins (F-86..F-94) drive FABRICATED
tokens ("a".repeat(48), "f".repeat(48)) into the failure branches — the form
card, the invalid-token alert, the client-side mismatch, the tokenless
dead-end — and the forgot view's STATIC contract; the happy path (a REAL
one-shot token changing a password) was e2e-invisible: a regression in
`generateResetToken`, the `PasswordResetToken` creation, the one-shot
transaction (the `usedAt` write riding the SAME transaction as the password
write), or the hash rotation would ALL have passed the entire suite green.

The ANALYZE measured every leg CORRECT live (the pattern): register answers
201 + a 6-digit code; verify-email answers 200 AND signs the account in (the
login gate 403s unverified accounts); forgot answers 200 with `resetPath`
carrying a REAL 48-hex token (TTL 30 min, no SMTP — the URL in the response
IS the delivery); the reset page renders the measured form from the URL
token; the submit renders the "Password Updated" done state (the clone's
documented-superset notice — the reference's success state is unmeasurable,
its emails unreachable); the new password signs in (200) while the old one
401s; a replay of the consumed token 400s with "Invalid or expired reset
token". The cure — 2 tests appended to `auth.spec.ts` (guest-tier, the
file-level empty-storageState opt-out): the full round-trip (the forgot
view's anti-enumeration notice pinned for the first time + the 48-hex
`resetPath` format + the done state + the new password signing in through
the REAL form, landing on the shift gate) and the one-shot semantics (the
replay rejected + the old password dead at 401 + the new one signing in).
E2E 115 → 117 (desktop 101 → 103); specs stay 12; unit stays 151/15.

The ordering analysis is part of the record: the throwaway accounts are
role=owner by the register default (register never sets a role) and the
Cashiers roster API filters `role: "cashier"` — surfaces.spec's
"0 usuarios registrados" empty-roster pin is unperturbed; the e2e db is
provisioned fresh by global-setup each run so the fixtures never cross runs;
the rate limiters are per-process in-memory and namespaced (register:ip /
forgot:ip / login:ip, a SUCCESSFUL login resetting the login bucket) — the
two tests consume 2 register + 2 forgot + a handful of logins. The API legs
ride Playwright's ISOLATED `request` fixture (not `page.request`) so the
verify-email session cookie never leaks into the page context before the UI
legs — the coupling trap this cycle's law records in AGENTS. The reference
sweep #20 held every pin byte-exact (the login card, the F-76 alert, the
landing/sidebar, the Dashboard h3s, the Spanish families, the empty Reports,
the D-1 mobile defect); the clone's mobile drawer re-verified live (REAL
clicks, the V14 law — 288px dialog, 8 links, focus management, scroll-lock,
Escape restore, route-close, zero overflow): NO Tailwind v4 regression.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **117/117** (103
desktop + 13 mobile + 1 setup). Screenshots 114–116. Docs lockstep: the
count constants + every live-tense site (the "Session-25 lock" literal
becomes the **Session-26 lock**), PAD v1.24, AGENTS (the Session-26
reset-round-trip contracts + the isolated-request-fixture law), CLAUDE,
README, the worklog entry, `docs/remediation-plan-session-26.md`,
`docs/session_47.md`. Skill v2.22.0.

### Session-27 addendum (v2.23.0) — the Cashiers shift-ledger walk

The session_47 "Next" pointer's LEADING candidate landed: **the Cashiers
shift-ledger with-data walk** (F-125) — the "Turnos Recientes" table's
DERIVATION, with zero with-data protection before this session. The drift
sweep's F-117 containment test provisions a shift and asserts only that its
ROW IS VISIBLE at 390; surfaces.spec pins the EMPTY states + the roster
flow; registers-shifts.spec pins the shift DIALOGS on another surface.
NOTHING pinned the join: a sale landing on the wrong shift's row, a count
drifting from its total, a polarity flip in the FIN ternary, or a
mis-ordered list would ALL have passed the entire suite green. The
reference's OWN ledger is permanently empty (write-gated — "Sin turnos
registrados"), so this tier is a functional-SUPERSET pin.

The ledger row is a FOUR-WAY JOIN rendered client-side (cashiers-view.tsx):
the store's shifts (bootstrapped from /api/shifts, openedAt desc, register +
cashier included) × the store's sales — per row the cashier cell (the shifts
POST pins cashierId to the OWNER, so the seed's "Store Owner" renders; no
cashier users are ever created, keeping the roster's role=cashier
empty-state pins safe), the register cell, the INICIO cell
(shiftTime·shiftDuration — local HH:MM + rounded minutes, MIRRORED
in-spec), the FIN polarity fork (shiftTime(closedAt) | "—"), the VENTAS
join cell (formatMoney(sum of the shift's sales) + the count), and the
Abierto (emerald-500/15) / Cerrado (white/5 + white/50) chips.

The ANALYZE measured every leg CORRECT live on the dev server (the active
row `["Store Owner", "Ledger Walk Register", "00:19 · 0m", "—", "$9.00 (1)",
"Abierto"]`; after the exact-variance close the closed row
`["Store Owner", "Ledger Walk Register", "00:19 · 1m", "00:20", "$9.00 (1)",
"Cerrado"]`). The cure — `tests/e2e/with-data-cashiers-ledger-walk.spec.ts`
(2 tests): the closed row (the fixture chain: shift → TWO sales pinned by
shiftId → the exact-variance close → all SIX cells exact against
API-derived expectations + the six Spanish headers Cajero/Caja/Inicio/Fin/
Ventas/Estado in the SOURCE case), and the active polarity (the zero state
— Fin "—", "$0.00 (0)", Abierto → the live join after a sale → the flip to
Cerrado with the FIN cell filled). ONE authoring iteration: the first run's
identity-cell expectation derived from /api/auth/me — whose publicUser
OMITS fullName (the row renders "Store Owner" from the shift's own cashier
include) — fixed by deriving from the ledger's OWN /api/shifts payload (the
view's exact input, the true "fix the MIRROR" rule).

E2E 117 → 119 (desktop 103 → 105) · specs 12 → 13 · unit stays 151/15.
FIVE specs now persist data — the ledger walk sorts FIRST among the walks
(c < d < f < i < r): the four existing walks derive their expectations from
the APIs at runtime, so the walk's extra product/sale/shift perturbs none
of them; the walk SELF-CLEANS both its shifts (closed with exact-variance
counts), keeping "No active shift" true for the mobile project. The
reference sweep #21 held every pin byte-exact (the login card, the F-76
alert, the landing/sidebar, the Dashboard h3s, the Spanish families, the
empty Reports, the D-1 mobile defect); the clone's mobile drawer
re-verified live (REAL clicks, the V14 law): NO Tailwind v4 regression.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **119/119** (105
desktop + 13 mobile + 1 setup). Screenshots 117–119. Docs lockstep: the
count constants + every live-tense site (the "Session-26 lock" literal
becomes the **Session-27 lock**), PAD v1.25, AGENTS (the Session-27
ledger-derivation contracts + the five-specs ordering law), CLAUDE, README,
the worklog entry, `docs/remediation-plan-session-27.md`,
`docs/session_49.md`. Skill v2.23.0.
\n
### Session-28 addendum (v2.24.0) — the Sales receipt-viewer walk + the empty-Turnos parity cure

The session_49 "Next" pointer's candidates landed as a TWO-part cure. **F-126-b,
the Sales receipt-viewer with-data walk**: the reference's write-gating means its
own Sales ledger renders "Sin ventas" forever — the viewer, the search, and the
refund are the clone's documented superset surfaces, and NOTHING pinned their
derivation with data (F-110's saleTimestamp was pinned on the CHECKOUT receipt
only; terminal.spec pinned the checkout-derived ROW visibility + the F-115
print wrapper; the s16 harness the demo-seeded family). The ANALYZE measured
every leg CORRECT live on the dev server: the ledger row
`["T-000001", "29 oct 2026", "Store Owner", "cash", "$9.00", "Completada"]`
(the es-MX Fecha, the Cajero cell from the sale's own cashier include, the
capitalize "cash" chip on emerald, the money cell), the viewer's content (the
ticket title, the DD/MM/YYYY HH:MM description, "2 × Viewer Walk Coffee" +
"$9.00", the dashed Total row, the "Método"/"cash" row, the footer outside
.receipt-print), the search's arms, and the refund round-trip (the one-way
guard: the same-status re-PATCH idempotent 200, the un-refund 400 "A refunded
sale cannot be un-refunded.", the Reembolsada flip on the re-mounted ledger).

The cure — `with-data-sales-receipt-viewer-walk.spec.ts` (3 tests): the row +
viewer content exact (all API-derived — the identity cells from the sale's own
/api/sales payload, the S27 mirror law extended), the search journeys (byTicket,
byCustomer, byCashier with the count derived at runtime + the no-match "Sin
ventas" row), and the refund round-trip (the guard trio + the orange chip flip +
the viewer opening on the refunded sale). ONE authoring iteration: a
text-filtered locator on an unqualified `div` matched the ANCESTOR container —
scope to the LEAF row class (`div.flex.justify-between`); the lesson is in
AGENTS. SIX specs now persist data — c < d < f < i < r < s, the sales walk
LAST; its shift self-closes at exact variance.

**F-126-a, the empty-Turnos parity cure** (the cycle's first `src/` change
since Session-21): sweep #22 re-measured the reference's EMPTY Cashiers ledger
— the BARE table (six headers over ZERO tbody rows, NO "Sin turnos
registrados" row; its Sales/Inventory ledgers DO carry in-table empty rows —
the convention is PER-SURFACE). The clone's row was an unmeasured Session-2-era
convention the record had conflated with a reference measurement — removed
from `cashiers-view.tsx` for parity, surfaces.spec pinning the bare shape
first (RED on the standing tree → GREEN after the fix). The trade-off is
recorded in AGENTS: the empty ledger loses its only post-bootstrap DOM
observable; the s16 harness's wait arm now rides the demo db's "Cerrado" chip.

E2E 119 → 123 (desktop 105 → 109) · specs 13 → 14 · unit stays 151/15. The
bare-ledger pin lives in navigation.spec (n < r by the ordering law's
inverse — registers-shifts' closed shift would render a row forever after). The
cycle rebuilt the workspace from a THIRD full sandbox reset (the audit scripts
reconstructed from the plan corpus; a NEW sandbox kills background processes
between tool calls — the dev-server posture moved to per-call
`with-dev-server.sh` bundles). The reference sweep #22 (the twenty-second
consecutive): every standing pin held byte-exact, the mobile D-1 stable; the
clone's mobile drawer re-verified live (REAL clicks, the V14 law — the
animation-name `enter` pin reads on the `[role=dialog]` element itself): NO
Tailwind v4 regression.

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **151/151**
(15 files — UNMOVED) · build green · smoke **13/13** · e2e **123/123** (109
desktop + 13 mobile + 1 setup). Screenshots 120–122 + the D-1-shape reference
capture (`ref-mobile-pos-390-s28.png`). Docs lockstep: the count constants +
every live-tense site (the "Session-27 lock" literal becomes the **Session-28
lock**), PAD v1.26, AGENTS (the Session-28 Sales contracts + the six-specs
ordering law), CLAUDE, README, the worklog entry,
`docs/remediation-plan-session-28.md`, `docs/session_51.md`. Skill v2.24.0.


### Session-29 addendum (v2.25.0) — the receipt PDF superset build (F-127)

The LAST standing session_47 candidate landed (deferred three times): the
receipts existed only on-screen and in the browser's print dialog — no
server-side artifact. The build follows the codebase's own doctrines: a
HAND-ROLLED PDF 1.4 renderer at a new pure seam (`src/lib/receipt-pdf.ts`)
— ZERO PDF dependencies (the charts' hand-rolled-SVG precedent extended),
WinAnsi latin-1 text (× 0xD7, · 0xB7, the Spanish diacritics single-byte;
outside-latin-1 mangled to '?', never a crash — a documented limitation),
and DETERMINISM as law (no CreationDate: same input, identical bytes).
Formatting stays at the edge — the `/api/sales/[id]/receipt` route composes
`formatMoney`/`saleTimestamp` and passes PRE-FORMATTED strings; the seam is
pure bytes. The unit contract (TDD, `tests/unit/receipt-pdf.test.ts`, 6
tests): the %PDF magic, the xref byte-math (every offset points EXACTLY at
its `N 0 obj`; startxref at the xref itself), the latin-1 content family,
the PDF string escaping, the conditionals, determinism.

The live verification: curl + PYPDF authoritative extraction (the full
receipt content parses in a real PDF reader) + the 404/401 walls + the
self-clean. The e2e leg (the F-122 download-event pattern, a 4th test in
the Session-28 sales walk, placed before the refund test): the
"Descargar PDF" anchor → `waitForEvent("download")` → the suggested
filename `T-000001.pdf` → the downloaded bytes BYTE-IDENTICAL to the
API's — first-run green.

The "email" question decided (the no-SMTP posture): the PDF endpoint IS
the receipt's delivery — never stub a send. Now law in AGENTS.

UNIT 151 → 157 (files 15 → 16) · E2E 123 → 124 (desktop 109 → 110) ·
ROUTE_FILES 26 → 27 — every live-tense site in the same commit (the
SKILL header baselines, commands, §12 tiers; README's badges + the API
table + the architecture table's PDF row; CLAUDE's baseline + the seam
table; AGENTS' registry line + the Session-29 contracts; PAD v1.27;
vitest.config.ts's header).

**Gate:** lint 0 errors (1 documented warning) · tsc clean · unit **157/157**
(16 files) · build green · smoke **13/13** · e2e **124/124** (110 desktop +
13 mobile + 1 setup). Screenshots 123–125. Docs lockstep: the worklog entry,
`docs/remediation-plan-session-29.md`, `docs/session_53.md`. Skill v2.25.0.

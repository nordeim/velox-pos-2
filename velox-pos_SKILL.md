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
version: 2.4.0
last_updated: 2026-10-26
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

Baselines at Session-8 lock: unit **133/133** (13 files) · e2e **78/78**
(64 desktop + 13 mobile + 1 setup) · lint 0 errors (1 documented
warning) · standalone build green.

## 2. Tech stack (version-pinned)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js ^16.4.2 (App Router, `output: "standalone"`) | The build IS the type gate (`ignoreBuildErrors` OFF) |
| UI runtime | React ^19 | No `forwardRef` era patterns; `set-state-in-effect` is a lint ERROR |
| Language | TypeScript ^5 strict | `tsc --noEmit` is the fast gate |
| Styling | Tailwind CSS ^4 (CSS-first) | **NO `tailwind.config.js`** — `@theme` pins only; `tw-animate-css` imported for the Radix animation family; `@custom-variant hover (&:hover)` un-wraps the `(hover: hover)` media for touch parity |
| Primitives | Radix UI (shadcn-style, `src/components/ui`) | dialog, select, toast, alert-dialog are load-bearing; switch, input, label, button |
| State | Zustand ^5 | ONE store (`usePosStore`, `src/lib/store.ts`); no React Context |
| ORM | Prisma ^6 / SQLite | `db/custom.db` at the repo root; `src/lib/db-path.ts` owns the URL contract |
| Validation | Zod ^4.6 | Strip mode at EVERY API boundary (`src/lib/validation.ts`) |
| Auth | scrypt + HMAC `sf_session` cookie (`node:crypto`) | Hand-rolled by design (PAD ADR-002); boot-guarded secret |
| Charts | Hand-rolled SVG (`src/components/pos/shared.tsx`) | Zero chart dependencies |
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
bun run test                   # vitest — tests/unit/** (133)
bun run build                  # standalone build + static/public copy
bun run test:e2e               # playwright (78) — NEEDS the build first (:3100)
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
| `reports.ts` | 7/14/30/90 period windows, `dailySeries`, `byMethod`, `categorySlices` | Feeds Dashboard + Reports |
| `inventory-status.ts` | `stockStatus` (ok/low/out), `lowStockCount`, the CSV round-trip | Low = ≤ minStock |
| `currency.ts` | currency list + symbol map | Settings-driven |
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
  for the login card only. The app shell is permanently dark. **The `inline`
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

1. **Unit (Vitest, 133/133, 13 files)** — the pure seams only (plus the docs-counts
   lockstep gate). New `src/lib` seam ⇒ new `tests/unit` file (red → green). UI
   components get no unit tests.
2. **E2E (Playwright, 78/78)** — against the PRODUCTION standalone build on :3100
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

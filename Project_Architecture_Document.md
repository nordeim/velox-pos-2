# VeloxPOS — Master Project Architecture Document (PAD) v1.1

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION BLUEPRINT
**Companion documents:** `README.md` (tour) · `AGENTS.md` (agent invariants) · `CLAUDE.md` (Claude conventions) · `docs/veloxpos-implementation-plan.md` (the measured reference spec)
**Last Updated:** 2026-10-26
**Audience:** Senior engineers, tech leads, DevOps, onboarding engineers, and AI coding agents
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

---

## 1. Executive Summary

VeloxPOS is a production-grade Point of Sale web application delivering the complete counter
workflow — cash registers with shift management, a barcode-first selling terminal, inventory with
low-stock tracking, cashier accounts, and period-filtered sales analytics. It is a functional
**superset** of the reference deployment at `veloxposen.base44.app` (a base44-hosted app whose
demo account is read-only) with **measured visual parity**: routes, tokens, copy, and empty states
were extracted from the live reference via browser automation (computed styles, not screenshots)
and re-implemented on an owned stack.

The engineering thesis: a small set of **pure, unit-pinned domain seams** (money, cart, shift,
reports, validation) underneath **server-gated thin routes**, a **single Zustand store**, and a
**factory-based API layer** with ownership scoping by construction. The local gate
(lint → typecheck → unit → build → e2e) is the only gate — there is no hosted CI — so every
guardrail is enforced by tooling that runs in this checkout.

**Scale & baselines (verified 2026-10-26, Session-6 re-certification):** 7 Prisma models · 22 API
route files · 8 gated views
+ login/reset/404 · 123 unit tests (12 files) · 78 e2e tests (2 browser projects) · standalone
production build.

## 2. Tech Stack (version-pinned)

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js (App Router, `output: "standalone"`) | ^16.4.2 | Server Components gate sessions; standalone traces a minimal deployable server |
| UI runtime | React | ^19 | The platform's current runtime; no `forwardRef` era patterns |
| Language | TypeScript (strict) | ^5 | `tsc --noEmit` is the fast gate; the build enforces (`ignoreBuildErrors: false`) |
| Styling | Tailwind CSS (CSS-first) | ^4 | No config file — tokens in `@theme`; the ten v3→v4 traps are pinned in code |
| Primitives | Radix UI (shadcn-style, `src/components/ui`) | latest | Accessible dialogs/selects/toasts — never hand-rolled |
| State | Zustand | ^5.0.15 | ONE store (`usePosStore`); selectors with `useShallow` semantics |
| ORM | Prisma / SQLite | ^6.19.3 | 7 models; ownership scoping by construction; `db-path.ts` anchors the file |
| Validation | Zod | ^4.6.5 | Strip mode at every API boundary |
| Auth | scrypt + HMAC (hand-rolled, `node:crypto`) | — | Minimalist by design (ADR-002); no auth library |
| Charts | Hand-rolled SVG components | — | Zero dependencies; pixel-controlled parity (ADR-006) |
| Unit tests | Vitest | ^5 | Pure-seam coverage (`tests/unit/**`) |
| E2E | Playwright | ^1.63 | Production-standalone journeys; desktop + mobile projects |
| Runtime | Bun | ≥1.1 | Dev, scripts, and test execution throughout |

## 3. System Topology

```mermaid
flowchart TB
    subgraph Client["Browser (dark canvas #080a14)"]
        V["8 gated views + login/reset/404"]
        S["usePosStore (ONE Zustand store)"]
        V <--> S
    end
    subgraph Server["Next.js 16 standalone server"]
        L["(app)/layout — server gate\ngetCurrentUser() or redirect /login"]
        R["Route handlers\n/api/* — Zod strip mode"]
        W["Workflow routes\n/api/shifts, /api/sales"]
        F["CRUD factories\nmakeCollectionRoutes / makeItemRoutes"]
        L --> V
        S -->|api.ts seam| R
        R --> F
        R --> W
    end
    subgraph Data["Prisma 6 / SQLite"]
        DB[("db/custom.db\n7 models, user-scoped")]
    end
    F --> DB
    W --> DB
```

Request flow for the hottest path (checkout): cart (client, pure seam) → `POST /api/sales`
(Zod validates → products re-read and re-priced server-side → totals recomputed in integer cents →
stock decremented + sale written + ticket allocated in one transaction → shift pinned) → receipt
dialog renders the persisted row. Client totals are display-only by construction.

## 4. Architecture Decision Records (condensed)

### ADR-001 — Real routes instead of a view-switcher SPA
**Decision:** The 8 views live at their reference paths (`/POS`, `/Dashboard`, …) as genuine
routes under `src/app/(app)/`. **Rationale:** the reference itself navigates real paths (measured:
the sidebar links carry hrefs; deep links like `/Registers` resolve directly); real routes make
the server gate enforceable per navigation and the URLs shareable. The previous scaffolding
generation used one page + rewrites — abandoned because the reference contract outranks it.

### ADR-002 — Hand-rolled auth (scrypt + HMAC cookie)
**Decision:** Minimalist auth on `node:crypto` — scrypt password hashes (`scrypt$salt$key`),
HMAC-signed stateless session tokens in an httpOnly cookie (`sf_session`, 7-day TTL, SameSite
Lax). **Rationale:** the surface (owner + cashiers, email/password) does not justify a library;
the boot guard (`instrumentation.ts` exits production without a real `AUTH_SECRET`) and the
rate limiter (10 attempts/IP/15 min on public endpoints) cover the risk. `COOKIE_SECURE=false`
is the single documented escape hatch for plain-HTTP production-style servers.

### ADR-003 — Server-authoritative checkout
**Decision:** `POST /api/sales` re-prices every line from stored product data, verifies stock,
allocates the sequential ticket, pins the register's active shift, and decrements stock in one
transaction. **Rationale:** a POS that trusts client totals is a loss machine; the reference's
demo cannot express this constraint at all (its writes 403), so the superset defines the honest
implementation.

### ADR-004 — The mobile drawer a11y superset
**Decision:** Below `md`, navigation is a labeled hamburger → slide-in `role="dialog"` drawer
(glass-dark, backdrop, Escape, route-change unmount, scroll lock). **Rationale:** the reference
keeps a 220px sidebar overlaying phone content with no dismissal — a genuine defect (measured at
390×844: no hamburger, content clipped behind the cart panel). The clone keeps desktop parity
pixel-faithful and replaces the broken mobile experience with the documented accessible pattern;
the contract is pinned by `tests/e2e/mobile-navigation.spec.ts` (13 tests).

### ADR-005 — Plain-CSS custom classes (the Tailwind v4 cascade rule)
**Decision:** The measured `glass-*` system, `brand-chip`, and focus utilities are plain CSS in
`src/app/tokens.css`; gradients exist only as classes. **Rationale:** in Tailwind v4, custom
classes inside `@layer utilities` emit after generated utilities and silently lose the cascade to
arbitrary utilities on the same element — the documented drawer-styling killer. Utility gradients
were additionally ruled out because v4 interpolates in oklab and drifts from the measured 135°
sRGB stops.

### ADR-006 — Hand-rolled SVG charts
**Decision:** The dashboard line chart and reports area chart are small React SVG components
(dotted grid, violet stroke) fed by pure seams. **Rationale:** zero new dependencies, exact
control over the measured visual (grid dashes, tick labels, stroke), and the data transforms
(bucketing, shares) are unit-pinned pure functions — chart libraries would add bundle weight for
two plots and blur the parity contract.

### ADR-010 — The Session-5 parity pins (the @theme inline fix + the form-control/button contracts)
**Decision:** (1) `tokens.css` switches `@theme` → **`@theme inline`**: the non-inline form bakes
`hsl(var(--input))` into `--color-input` AT `:root`, so the `.theme-light` login scope's triplet
re-pointing could never reach themed utilities (live-proven: `--color-input` read the dark
value inside the light wrapper; the login inputs rendered dark borders on the light card).
Inline emits `hsl(var(--input))` directly in each utility rule (verified in the built CSS:
`.border-input{border-color:hsl(var(--input))}`). (2) The form-control contract moves into the
base components: Input/Select/Textarea compute `rounded-xl` (12px) + `border-input` (#262a36) +
transparent bg + `#707a8f` placeholders + ring-1 focus — 34 per-field `border-edge bg-white/5`
compensating overrides were stripped; the `:root` tokens adopt the reference's app-scoped
values (`--input`/`--border` `225 18% 18%`, `--muted-foreground` `220 12% 50%`, `--ring`
`252 87% 67%`). (3) The Button default size is `px-4 py-2.5` (padding-driven 42px — no fixed
h-9); CHARGE is `py-5` (70px). (4) The receipt footer is a TEXTAREA (rows=2, multi-line
footers — a functional superset of the single-line input it replaces). (5) The login surface
adopts the reference's form internals: 48px slate-filled inputs (DIRECT slate classes, not
themed utilities), the bg-white/95 + shadow-2xl card with the 4px top gradient strip, the
vendored logo image (`public/veloxpos-logo.png`, 96×96), 54px SSO buttons, font-medium
sign-in. (6) The Reports period pills adopt the reference's geometry (rounded-2xl container,
rgba(28,31,52,0.85) fill, text-xs bold pills, shadow-lg active state).
**Rationale:** a computed-style census at the form-control depth the earlier sessions never
measured (the full ledger is `docs/remediation-plan-session-5.md`). Every item is
user-visible parity; each is e2e-pinned (13 new pins: settings/dialog/search input geometry,
textarea, pills, buttons ×2, select trigger, login inputs/card strip/logo/sign-in/SSO). The
login inputs use direct slate classes AND the theme mechanism was fixed at the root — the
symptom fix and the mechanism fix are both shipped (skill doctrine: fix the cause, not the
symptom).

### ADR-009 — The Session-4 parity pins (heading scale, fiscal rename + inverted toggle, Added banner)
**Decision:** (1) Heading sizes align to the reference's computed styles: page H1s `text-2xl`
(24px), section headings `text-base` (16px), Reports section headings `text-sm` (14px)
uppercase — while KEEPING the clone's readable white/violet colors (the reference renders its
headings in near-invisible slate-700/800 on dark glass; pixel-verified as its own defect — the
same a11y-superset posture as the mobile drawer). (2) The fiscal card follows the reference's
CURRENT labels (it renamed them live after Session-101: RUC/NIT → "Tax ID / EIN", business
type → "Tax Regime", expense account → "CFDI Use (default)") and its toggle contract: mounted
in the SectionCard header row, default = fiscal hidden on receipts (`hideFiscalOnReceipt
@default(true)`), the UI switch wired INVERTED (`checked={!hideFiscalOnReceipt}` — ON =
"Visible on receipt"), plus the reference's help paragraph. (3) The cart gains the reference's
"Added" auto-collapsing banner (emerald chip, product name, `transition-all duration-300`,
~2.5s hold; timer state in the click handler — no setState-in-effect). (4) The login canvas
matches the reference's slate gradient and its single-phrase "Need an account? Sign up"
slate-500 button.
**Rationale:** every item is a computed-style/drift measurement against the live reference
(the full ledger is `docs/remediation-plan-session-4.md`); the reference DRIFTS between
sessions, so its live computed styles — not the Session-101 snapshot — are the parity contract.
Each behavioral item is e2e-pinned (10 new pins: heading sizes ×3, copy casing ×2, fiscal
labels, fiscal toggle default + copy, Added banner, login gradient, signup button).

### ADR-008 — The Session-3 parity pins (tw-animate, hover unwrap, drawer focus superset)
**Decision:** `globals.css` imports `tw-animate-css` (restoring the Radix `data-[state]`
animation family — dialogs/selects/toasts animate like the reference's v3-era CSS) and declares
`@custom-variant hover (&:hover);` (un-wrapping v4's `@media (hover: hover)` so hovers apply on
touch devices, matching the reference — a POS runs on tablets). The mobile drawer gains the
focus-management superset (focus moves to the close button on open, Tab wraps, focus restores to
the hamburger on close, and the drawer auto-closes when the viewport grows past `md` — the
neo-crm S8-P1 bug class). The cart side panel activates at `md` (the reference's own breakpoint).
**Rationale:** all four are measured-parity deltas against the live reference or family-standard
bug classes; each is e2e-pinned (the dialog animation-name pin, the three drawer focus pins, the
md-growth pin, the cart-md geometry pin). The drawer keeps its instant exit (conditional unmount)
so the e2e UNMOUNT pins stay deterministic.

### ADR-007 — The db-path resolution contract
**Decision:** `src/lib/db-path.ts` resolves relative `file:` DATABASE_URLs against the first
anchor owning `prisma/schema.prisma` (standalone-dir detector → module anchor → CWD), exactly
like the Prisma CLI. **Rationale:** the standalone server chdirs into `.next/standalone`, so a
naive CWD rule would point production at the build output. Absolute `file:` URLs pass through —
and are the documented production form, because per-bundle anchors under standalone are a
field-tested desynchronization source (e2e evidence in §9).

## 5. Layer Model

```
┌──────────────────────────────────────────────────────────────────┐
│ Views (client) — src/components/pos/views/*.tsx                  │
│   render-only; state from usePosStore; toasts on failures        │
├──────────────────────────────────────────────────────────────────┤
│ Client seams — src/lib/{api,store,router,cart,money,...}.ts      │
│   api.ts (fetch + envelope + offline classification)             │
│   pure domain math — unit-pinned, framework-free                 │
├──────────────────────────────────────────────────────────────────┤
│ HTTP boundary — src/app/api/**/route.ts                          │
│   3-line shells over factories; Zod at the door; error mapper    │
├──────────────────────────────────────────────────────────────────┤
│ Domain services — src/lib/server/{entities,auth}.ts              │
│   delegates (ownership-scoped) · workflows (shifts, checkout)    │
├──────────────────────────────────────────────────────────────────┤
│ Persistence — Prisma client (src/lib/db.ts) → SQLite file        │
│   7 models; user-owned rows; cascade deletes; JSON columns only  │
│   for sale items (read-model blobs)                              │
└──────────────────────────────────────────────────────────────────┘
```

Dependency rule: arrows point downward only. `src/lib` pure seams never import React or Prisma;
`src/lib/server/**` may import both; views import client seams, never the server layer.

## 6. Directory Structure (annotated)

```
📂 velox-pos
 ├ 📂 src/app
 │  ├ 📂 (app)/            — POS · Dashboard · Inventory · Sales · Registers · Cashiers ·
 │  │                        Reports · StoreSettings (each: server page → client view) + layout.tsx gate
 │  ├ 📂 api/auth/         — login · register · logout · me · forgot/reset/change-password ·
 │  │                        change-email · verify-email · resend-verification · delete-account
 │  ├ 📂 api/{products,categories,registers,cashiers}/[id] — CRUD shells over the factories
 │  ├ 📂 api/{shifts,sales}/[id] — workflows (open/close shift; checkout/receipt/refund)
 │  ├ 📂 api/{store-settings,health} — settings singleton · liveness
 │  ├ 📄 login/page.tsx    — the light reference card (public)
 │  ├ 📄 reset-password/page.tsx — token consumption (public)
 │  ├ 📄 not-found.tsx     — Spanish 404 ("Página no encontrada / Ir al Terminal")
 │  └ 🎨 globals.css + tokens.css — @theme pins; glass system; login light scope
 ├ 📂 src/components/pos   — app-shell (sidebar+drawer) · nav-items · shared (PageHeader,
 │                           StatCard, SVG charts) · pages.tsx · login/reset surfaces ·
 │                           use-pos-bootstrap.ts · views/ (8 view files)
 ├ 📂 src/components/ui    — shadcn-style Radix primitives (dialog, select, toast, …)
 ├ 📂 src/lib              — pure seams (money, cart, shift, reports, inventory-status,
 │                           currency, router, validation, auth, date, site, env-check,
 │                           db-path, db, store, api, utils) + server/ (http, auth, entities)
 ├ 📂 prisma               — schema.prisma (7 models) · seed.ts (owner + settings; --demo dataset)
 ├ 📂 tests/unit           — 12 vitest files (the seam registry)
 ├ 📂 tests/e2e            — 8 spec files + auth.setup + kill-port + provisioning
 ├ 📂 docs                 — implementation plan, runbooks, Tailwind report, screenshots/
 └ ⚙️ next.config.ts · playwright.config.ts · vitest.config.ts · package.json · .env.example
```

## 7. Data Model (Prisma/SQLite)

| Model | Key fields | Relations & rules |
|---|---|---|
| `User` | email (unique), passwordHash, fullName, **role** (`owner`\|`cashier`), active, emailVerified | Owner of everything; named back-relations `ShiftCashier`/`SaleCashier` |
| `StoreSettings` | storeName, logoDataUrl, contact fields, currency, primary/secondaryColor, receiptFooter, hideFiscalOnReceipt, fiscal* fields, cardProvider | 1:1 per owner (userId unique); lazily materialized on first GET |
| `Category` | name, color | unique per (userId, name); products SetNull on delete |
| `Product` | name, barcode, price, cost?, stock, minStock, taxRate, unit, image?, active | categoryId nullable (SetNull); barcode indexed for terminal search |
| `Register` | name, location, status (`closed`\|`open`) | status mirrors its shift lifecycle; delete refused with shift history |
| `CashierShift` | registerId, cashierId, openedAt/closedAt, openingFloat, countedCash?, expectedCash?, variance?, status | One ACTIVE shift per register (workflow-enforced); expected/variance computed server-side at close |
| `Sale` | ticket (`T-000001`), items (JSON lines), subtotal/taxTotal/total, paymentMethod (`cash`\|`card`), amountPaid?, changeDue?, customer?, status | Pinned to register + shift; refund = status flip; ticket allocated from the store's sale count |

**Invariants (pinned by tests + workflows):** every user-owned row carries `userId` with
`onDelete: Cascade`; money crosses the seam as 2dp dollars and is computed in integer cents;
the only JSON column is `Sale.items` (a read-model blob of the priced lines).

## 8. Security Architecture

| Control | Implementation |
|---|---|
| Password storage | scrypt (16-byte salt, 64-byte key, `timingSafeEqual` verify) |
| Sessions | HMAC-SHA256 over `{uid, iat, exp}` (base64url), httpOnly + SameSite Lax cookie, 7-day TTL |
| Secret governance | Production boot guard exits loudly on missing/weak `AUTH_SECRET`; dev fallback constant is public and warn-tagged |
| Rate limiting | Fixed-window in-memory (10/IP/15 min) on login/register/forgot — the e2e suite's storageState reuse exists because of this |
| Input validation | Zod strip mode at every boundary; length caps; enum membership; hex-color and data-URL refinements; `"" → null` transforms |
| Ownership | Every query scoped by `userId`; mutations verify ownership before acting; cashiers additionally role-guarded (owner-only management, cashier rows never hard-deleted while shifts exist) |
| Error surface | Uniform `{ error }` JSON; Zod → 400, unique → 409, missing → 404, unauthed → 401; unknown errors log server-side only (never the body) |
| Uploads | Product images and the store logo are client-downscaled data URLs (≤2 MB), validated by prefix — no filesystem writes |

## 9. Testing Strategy & the Local Gate

```
lint → typecheck → unit → build → (smoke) → e2e
```

1. **Unit (Vitest, 123/123):** the pure seams — money (cents math, formatting), cart (reducer,
   totals, charge gate), shift (state machine, variance), reports (bucketing, shares),
   inventory-status + CSV round-trip, currency, router (the route map), validation (accept/reject
   matrix), auth (hash/token/rate-limit), db-path (the resolution contract), env-check, site.
   Baseline: 12 files. New seams arrive with their file; fixes arrive with regression tests.
2. **E2E (Playwright, 78/78):** production standalone on :3100, scratch db (`db/e2e.db`)
   provisioned by the webServer command (kill-port → provision → boot — never touched while the
   server lives). Projects: `chromium` (1440×900; journeys) and `mobile` (390×844; the drawer
   suite). Auth once via storageState. The spec map: `auth` (the light card + gating + from_url),
   `navigation` (sidebar order/activation/collapse/persistence), `mobile-navigation` (the 13
   drawer pins — including the Session-3 focus-trap/restore and md-growth auto-close),
   `inventory` (CRUD + search + CSV-adjacent flows), `registers-shifts` (the
   lifecycle), `terminal` (cart math, cash checkout + change, ticket, receipt, stock decrement),
   `surfaces` (Sales/Cashiers/Reports/Settings/404/health + the dialog-animation and
   cart-md-geometry parity pins).
3. **Field-tested e2e doctrine:** auth waits for the hydration-gated submit button (`toBeEnabled`)
   before filling; assertions use visibility (not DOM count) for `hidden md:*` elements; the
   scratch db is never replaced while the server lives (clients bind the inode; field-tested
   desynchronization); the port is freed before boot (`tests/e2e/kill-port.ts`).

## 10. Build & Deployment

- `bun run build` → standalone output at `.next/standalone` (static + public copied in).
- Production boot: `DATABASE_URL="file:<ABSOLUTE>" AUTH_SECRET=<64-hex> PORT=3000 bun
  .next/standalone/server.js` — the boot guard fails fast on secret problems; relative URLs are a
  dev convention (ADR-007).
- `COOKIE_SECURE=false` only for plain-HTTP production-style deployments (documented in
  `.env.example`; the e2e server uses it).
- Push path: commits on `main`, then `docs/ssh_git_wrapper_v3.py` with an operator-supplied key
  (0600 temp file outside the repo, dry-run → push → remote ref verified → shredded). Runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

## 11. Developer Handbook (the 20-minute onboarding)

1. Read `README.md` (tour) → this §5/§6 (layers + map) → `AGENTS.md` (invariants).
2. Provision: `cp .env.example .env` → set `AUTH_SECRET` → `bun run db:push && bun run db:seed`
   → `bun run dev`. Verify `/api/health` → `{"status":"ok","db":"up","app":"veloxpos"}`.
3. Sign in (`sepnetflix2023@outlook.com` / `$Abcd1234`), walk the 8 views, then run the gates.
4. To add a feature: write the seam + its unit test first (red), wire the Zod contract, extend the
   delegate or workflow route, then the view; update the e2e journey if the flow is user-visible.
5. To change the design system: measure the live reference first (agent-browser, computed
   styles), record the measurement in the plan doc, then move the token — never eyeball.

## 12. Known Issues & Deliberate Simplifications

| Item | Status | Note |
|---|---|---|
| `/Settings` route 404s | By design | Reference parity — the sidebar href is `/StoreSettings`; pinned by e2e |
| Mixed EN/ES copy | By design | The reference's own quirk (Sales/Cashiers/404 are Spanish); preserved verbatim |
| Rate limiter is in-memory | Documented | Single-instance deployment contract; horizontal scaling needs a shared store |
| Cashier accounts are global | Documented | Cashier users are role-scoped rows, not per-owner rows — acceptable for the single-store deployment this targets |
| Refunds do not restock | Documented | Refund flips the status; stock restoration is a manual Inventory action |
| CSV import trusts category names | Guarded | Unknown categories fall back to null (Uncategorized); rows validate through the product schema |
| e2e requires the production build | Documented | `bun run test:e2e` boots the standalone output; dev-server e2e is intentionally not supported |

## Revision Block — v1.0 (2026-10-26)

- Initial VeloxPOS PAD: the domain replacement of the previous (Omni-Study) generation of this
  repository. ADR-001…007 record the load-bearing decisions; §9's doctrine entries are
  field-tested (each traces to a live failure observed and fixed during Session-101 — see
  `worklog.md`).
- Baselines at lock: lint 0 errors (1 documented warning) · typecheck clean · unit 117/117 ·
  e2e 45/45 · standalone build green.

## Revision Block — v1.1 (2026-10-26, Session-3)

- **The audit-driven parity pass** (the full findings ledger lives in
  `docs/remediation-plan-session-3.md`): ADR-008 records the four measured-parity decisions —
  the `tw-animate-css` import (the Radix animation family was dead CSS), the `@custom-variant
  hover (&:hover)` un-wrap (touch devices regained the reference's hover semantics), the drawer
  focus-management superset (initial focus + Tab wrap + trigger restore + md-growth auto-close),
  and the cart panel's `md:` breakpoint (the reference's own tablet geometry) + the brand row's
  measured `px-4 py-5 border-b` frame.
- Hygiene: five dead dependencies removed (`quill`, `web-vitals`, `tailwindcss-animate`,
  `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area` — zero live imports); the
  stale study-era palette comments in `globals.css` neutralized; `.env.example` rebranded from
  StudyFlow and given the documented `COOKIE_SECURE` row; the stale recovered
  `veloxpos_SKILL.md` replaced by the code-accurate `velox-pos_SKILL.md`.
- Test baselines: unit **117/117** (unchanged — no pure seam was touched) · e2e **45/45**
  (+6 Session-3 pins: dialog animation, cart-md geometry, drawer focus-in, Tab wrap, focus
  restore, md-growth auto-close). No prior pin weakened; no guardrail loosened.
- Baselines at lock: lint 0 errors (1 documented warning) · typecheck clean · unit 117/117 ·
  e2e 45/45 · standalone build green.

## Revision Block — v1.2 (2026-10-26, Session-4)

- **The reference-drift parity pass** (the full findings ledger lives in
  `docs/remediation-plan-session-4.md`): the live reference had RENAMED its fiscal field labels
  since the Session-101 measurement (RUC/NIT → "Tax ID / EIN", business type → "Tax Regime",
  expense account → "CFDI Use (default)" — placeholders unchanged), and a computed-style sweep
  surfaced a heading-scale delta the earlier specs never pinned (reference H1 24px / sections
  16px / Reports sections 14px vs the clone's 30/18/16px). ADR-009 records the decisions.
- **Fiscal contract** (breaking for new rows): `hideFiscalOnReceipt @default(true)` — fiscal
  data is hidden on receipts by default, matching the reference's toggle-off default; the UI
  switch is wired inverted (ON = "Visible on receipt") and mounted in the SectionCard header
  row with the reference's help paragraph. Existing rows keep their stored value
  (re-provision or UPDATE to adopt the new default).
- **Cart "Added" banner**: the reference's auto-collapsing confirmation chip (emerald gradient,
  circle-check, "ADDED" + product name) now ships in the clone's cart panel.
- **Login canvas**: the reference's `to right bottom #f8fafc → #f1f5f9` gradient replaces the
  flat `#f1f2f6` fill; the signup affordance is the reference's single-phrase slate-500 button.
- **Copy casing**: the DOM text aligns to the reference's Title Case ("Total Revenue",
  "Avg. Ticket", "Daily Sales", "Revenue by Payment Method", "Breakdown by Method",
  "Today's Sales", "Low Stock") — copy-verbatim discipline, pinned with `exact: true`.
- Test baselines: unit **117/117** (unchanged — no pure seam was touched) · e2e **55/55**
  (+10 Session-4 pins: H1 size, section sizes, Reports sizes, Reports Title Case, Dashboard
  Title Case, fiscal labels, fiscal toggle default/copy/help, Added banner, login gradient,
  signup button). No prior pin weakened; no guardrail loosened.
- Baselines at lock: lint 0 errors (1 documented warning) · typecheck clean · unit 117/117 ·
  e2e 55/55 · standalone build green.

## Revision Block — v1.3 (2026-10-26, Session-5)

**Scope:** the form-control/button/login-form parity pass + the Tailwind v4 theme-switching
bug (the audit ledger is `docs/remediation-plan-session-5.md`). Thirteen findings, all
e2e-pinned red → green (13 new pins; e2e 55→68, unit 117/117 unchanged).

- **The F-28 mechanism fix (`@theme inline`)**: non-inline `@theme` baked `hsl(var(--input))`
  into `--color-input` at `:root`, so the `.theme-light` scope never reached themed utilities.
  The login inputs now render light (48px, slate-200 borders, slate-50/50 fill) via the
  reference's direct slate classes, AND the theme mechanism resolves per-element for any
  future scoped usage.
- **The form-control contract**: Input/Select/Textarea compute 12px radius + #262a36
  border-input + transparent bg + #707a8f placeholders + ring-1 focus (34 per-field overrides
  stripped); `:root` tokens adopt the reference's app-scoped values.
- **Buttons**: default size `px-4 py-2.5` (42px, padding-driven); CHARGE `py-5` (70px);
  Reports period pills (rounded-2xl container + text-xs bold pills + shadow-lg active).
- **The receipt footer is a TEXTAREA** (rows=2 — multi-line footers, a functional superset).
- **The login surface**: the reference's card frame (bg-white/95 + backdrop-blur + shadow-2xl
  + the 4px top gradient strip + inner content paddings), the vendored logo image, 54px SSO
  buttons, font-medium sign-in.
- Test baselines: unit **117/117** (no pure seam touched) · e2e **68/68** (+13 Session-5
  pins). No prior pin weakened; no guardrail loosened.
- Baselines at lock: lint 0 errors (1 documented warning) · typecheck clean · unit 117/117 ·
  e2e 68/68 · standalone build green.

## Revision Block — v1.4 (2026-10-26, Session-6)

**Scope:** the chrome-depth parity pass (sidebar nav, section headers, the category flow,
the Settings CTAs, the Inventory chips, the POS gate) + the chart-axis readability bug
(the audit ledger is `docs/remediation-plan-session-6.md`). Ten findings, TDD red → green
(9 parity pins + 1 pin rewritten to the reference's flow + 6 unit pins for the new
`niceTicks` seam; e2e 68→78, unit 117→123).

- **The reference's nav chrome re-measured live (it drifted)**: nav items are
  padding-driven `px-3 py-2.5` (40px inactive), `font-medium`, 16px icons, white/40
  inactive; the ACTIVE pill adds `border border-violet-500/30 shadow-sm
  shadow-violet-500/10` (42px with the border). The Reports glyph is
  `ChartColumnIncreasing` (the reference swapped it live). The wordmark is 14px
  white/90 tracking-wide; the footer chevron 16px in a p-3 cell.
- **Section-card headers**: bare `w-5 h-5` icons in per-section colors (indigo/purple/
  green/orange/blue/amber-500) — the 36px chip wrapper and the all-violet icons removed;
  the readable heading colors stay (the documented a11y superset).
- **The category flow is now the reference's own**: header Add chip → "New Category"
  dialog (Name + Cancel/Create 42px); the inline input row is gone; the empty state reads
  "No categories". The inventory.spec pin was REWRITTEN to drive the new flow (its
  protection preserved and strengthened).
- **Save Changes is a larger primary CTA**: py-3.5/text-base/font-medium (54px). The
  Inventory category chips adopt the 36px pill family (glass-button-primary active). The
  POS gate renders the reference's p-8 card + /30 icon + white/35 copy with the
  <strong>-styled, non-underlined "Registers" emphasis (the working href is the superset).
- **ADR-011 (the chart-axis contract)**: both hand-rolled charts render ~5 NICE ticks via
  the `niceTicks` seam (`src/lib/reports.ts`, unit-pinned) — the Session-101 per-unit
  grid stacked one label per DOLLAR of revenue (an unreadable block on any real dataset;
  invisible to the empty-store e2e, caught by a VLM eyeball of the live dashboard). The
  Dashboard x axis renders weekday abbreviations at 12px (the reference's measured form);
  Reports keeps date labels at 11px with `$` ticks.
- **Testing doctrine addition (the oklab/alpha pin rule)**: v4 serializes fractional-alpha
  utilities as `oklab(… / 0.4)` while the reference emits `rgba(…, 0.4)` (same color) —
  pin the ALPHA via `expect.poll` + regex; raw `evaluate` computed reads do not retry
  (a mid-load style race flaked a pin once before the poll hardening).
- Scaffold hygiene: the dead Omni-Study-era Button variants (sf-* classes that exist
  nowhere in this codebase) replaced with the measured neutral (`glass-button`); the
  factually-wrong comment blocks removed. The Button focus ring stays (a11y superset — the
  reference ships no button focus ring).
- Test baselines: unit **123/123** (+6 niceTicks pins, still 12 files) · e2e **78/78**
  (+9 Session-6 pins +1 chart pin, all prior pins intact). No pin weakened; no guardrail
  loosened.
- Baselines at lock: lint 0 errors (1 documented warning) · typecheck clean · unit 123/123 ·
  e2e 78/78 · standalone build green.

### ADR-011 — The chart-axis contract (niceTicks, never per-unit grids)

**Context.** The two hand-rolled SVG charts (Dashboard line, Reports area) drew one grid
line + one axis label per unit of the y domain (`Array.from({length: niceMax + 1})`). For
count-based series that reads fine; for DOLLAR revenue (the only thing these charts plot)
a $470 day rendered 471 labels stacked ~0.46px apart — a solid unreadable band. The defect
shipped in Session-101 and survived four audit sessions because the e2e store is empty
(max = 4 → 5 tidy labels) and nobody measured the chart at data scale until the Session-6
VLM sweep flagged the live dashboard's "dense vertical block of white pixels."

**Decision.** (1) A pure `niceTicks(max, count=5)` seam in `src/lib/reports.ts` computes
nice 1/2/2.5/5×10^k steps (unit-pinned: 4 → [0..4], 17 → [0,5,10,15], 470 →
[0,100,200,300,400], tick count ≤ 6 always). (2) Both charts render their grid/labels from
`niceTicks`. (3) The Dashboard's 7-day x axis renders weekday abbreviations at 12px and
the Reports chart date labels at 11px with `$`-prefixed y ticks — both measured on the live
reference (Recharts-style axes). (4) An e2e regression pin drives a real checkout then
asserts the rendered y-label count < 8 and the weekday x labels — the pin that could never
exist while the suite's store was the only oracle.

**Consequences.** Chart axes stay readable at any revenue scale; the axis math is a pure,
documented, unit-tested seam; the empty-store e2e blind spot is now covered by a data-state
pin. The per-unit grid pattern is recorded as a trap in the skill (v2.3.0) — a "correct at
demo scale" implementation is a latent bug at production scale.

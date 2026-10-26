# VeloxPOS — Master Project Architecture Document (PAD) v1.0

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

**Scale & baselines (verified 2026-10-26):** 7 Prisma models · 22 API route files · 8 gated views
+ login/reset/404 · 117 unit tests (12 files) · 39 e2e tests (2 browser projects) · standalone
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
the contract is pinned by `tests/e2e/mobile-navigation.spec.ts` (10 tests).

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

1. **Unit (Vitest, 117/117):** the pure seams — money (cents math, formatting), cart (reducer,
   totals, charge gate), shift (state machine, variance), reports (bucketing, shares),
   inventory-status + CSV round-trip, currency, router (the route map), validation (accept/reject
   matrix), auth (hash/token/rate-limit), db-path (the resolution contract), env-check, site.
   Baseline: 12 files. New seams arrive with their file; fixes arrive with regression tests.
2. **E2E (Playwright, 39/39):** production standalone on :3100, scratch db (`db/e2e.db`)
   provisioned by the webServer command (kill-port → provision → boot — never touched while the
   server lives). Projects: `chromium` (1440×900; journeys) and `mobile` (390×844; the drawer
   suite). Auth once via storageState. The spec map: `auth` (the light card + gating + from_url),
   `navigation` (sidebar order/activation/collapse/persistence), `mobile-navigation` (the 10
   drawer pins), `inventory` (CRUD + search + CSV-adjacent flows), `registers-shifts` (the
   lifecycle), `terminal` (cart math, cash checkout + change, ticket, receipt, stock decrement),
   `surfaces` (Sales/Cashiers/Reports/Settings/404/health).
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
  e2e 39/39 · standalone build green.

# VeloxPOS — Implementation Plan (the veloxposen.base44.app clone)

> Session date: 2026-10-26 · Status: **the pivot session** — the repository
> `nordeim/velox-pos` is repurposed from the Omni-Study1 (StudyFlow) clone to
> the **VeloxPOS (Point Of Sale)** clone, per the current `prompt-to-create.md`
> directive: clone `https://veloxposen.base44.app/` using the cloned repo as
> scaffolding ("customize and extend it as necessary").

## 0. Evidence base (all measured live, 2026-10-26, agent-browser)

The reference was explored logged-in as `sepnetflix2023@outlook.com` at
1280×800 (desktop) and 390×844 (mobile). Key findings, each verified on the
live app:

| # | Finding | Evidence |
|---|---------|----------|
| F1 | The reference is a dark-themed POS app titled "VeloxPOS (Point Of Sale)" | page title + screenshots |
| F2 | Eight nav sections: Terminal, Dashboard, Inventory, Sales, Registers, Cashiers, Reports, Settings | sidebar links |
| F3 | Sidebar: 220 px (bg `rgb(13,15,26)`), collapses to a 68 px icon rail via a bottom chevron | measured + collapsed screenshot |
| F4 | Active nav item: violet wash `rgba(124,58,237,0.2)`, text `rgb(196,181,253)` (violet-300), radius 12 px, 14 px/500, h-42 px | computed styles |
| F5 | Page background `rgb(8,10,20)`; cards `rgba(16,18,32,0.9)`, border `rgba(255,255,255,0.07)`, radius 16 px | computed styles |
| F6 | Primary action gradient: `linear-gradient(135deg, #7C3AED, #6366F1)`, radius 12 px, glow `rgba(124,58,237,0.4) 0 4px 20px` | "New Product" button |
| F7 | CHARGE button: `linear-gradient(135deg, #059669, #10B981)` (emerald-600→500), h-70 px, radius 16 px, 20 px/900 | Terminal cart |
| F8 | Chart accent violet-400 `rgb(167,139,250)`, 2 px; dashed grid `rgba(255,255,255,0.4)` | Dashboard/Reports SVGs |
| F9 | Headings: h1 24 px/700 in `rgb(30,41,59)` (slate-700 — the reference's dark-on-dark title look, kept for parity); stat values 24 px/700 same color; stat labels small uppercase | computed styles |
| F10 | **The reference's write flows are broken**: "Create" buttons on New Product and New Register stay disabled with valid input; product creation never lands ("0 products registered" after submit) | live repro, twice |
| F11 | **The reference's Settings link renders a 404 page** ("Página no encontrada", violet gradient 404 badge, "Ir al Terminal" button) | live navigation |
| F12 | Sales + Cashiers pages carry Spanish copy ("Historial de Ventas", "0 ventas registradas", "Cajeros", "Turnos Recientes") | screenshots |
| F13 | **The reference has NO mobile navigation** — at 390×844 the desktop layout simply crushes (icon rail + squeezed content + cart panel). No hamburger, no drawer | mobile screenshots |
| F14 | Dashboard: 4 stat cards (TODAY'S SALES, TRANSACTIONS, PRODUCTS, LOW STOCK) with right-aligned icon blocks (emerald $, violet cart, blue package, amber alert), "Sales — Last 7 days" area chart (Tue→Mon), "Products by Category" panel | screenshots |
| F15 | Reports: period chips 7/14/30/90 days, 3 stat cards (TOTAL REVENUE, TRANSACTIONS, AVG. TICKET — icon left), DAILY SALES chart, REVENUE BY PAYMENT METHOD + BREAKDOWN BY METHOD panels | screenshots |
| F16 | Terminal: left stage with "No active shift" empty card (monitor icon), right CART rail ("CART" header, cart icon, "Scan or select products", CHARGE $0.00, transient "ADDED" marker) | screenshots + a11y tree |
| F17 | Inventory table columns: PRODUCT/CODE/PRICE/STOCK/CATEGORY/STATUS/ACTIONS; search "Search by name or code..." + category chip | screenshot |
| F18 | New Product dialog fields: Name*, Barcode*, Category (select), Selling price*, Cost, Current stock (0), Min. stock (5), Tax rate % (16), Unit (Piece), Product image (file), Active product (switch) | dialog a11y tree |
| F19 | New Register dialog fields: Name* ("e.g. Register 1"), Location ("e.g. Main entrance") | dialog a11y tree |
| F20 | Cashiers: empty-state users icon + "Turnos Recientes" table CAJERO/CAJA/INICIO/FIN/VENTAS/ESTADO | screenshot |
| F21 | The auth surface is Base44-hosted: "Welcome to VeloxPOS (Point Of Sale)" / "Sign in to continue", Google/Microsoft/Facebook/Apple buttons, email+password, Forgot password?, Sign up | login a11y tree |

## 1. Product decisions (open questions resolved by recommendation)

| Question | Decision | Rationale |
|---|---|---|
| What happens to the existing Omni-Study codebase? | **Scaffolding reuse**: infra layer kept (auth, db seam, HTTP seam, UI kit, configs, testing stack); the study domain (views, APIs, schema, study tests, probe scripts) is removed. Study-era worklog + docs archived under `docs/archive/omni-study1/` (git history also preserves everything). | The prompt names `veloxposen` as THE clone target and the repo as scaffolding. A production-ready POS cannot carry a dead study app. |
| The reference's broken Create buttons (F10) | Clone implements **working CRUD** (create/edit/delete products, registers, categories) | "Production-ready functional superset" is the stated goal; replicating a broken button is a defect. |
| The reference's Settings 404 (F11) | Clone ships a **real Settings page** (store profile, categories manager, receipt header, tax default, account/password) | Same superset rationale. The reference's 404 design is replicated on the true not-found route. |
| The reference's missing mobile nav (F13) | Clone ships a **working mobile drawer** (hamburger app bar < lg, 288 px drawer, Esc/backdrop close, scroll lock, focus management) using the repo Tailwind v4 skill's mobile-nav patterns (§9 failure taxonomy; the `flex flex-col gap-*` — never `space-y-*` — v4 `:where()` specificity trap) | Explicit user instruction: "Pay particular attention to compare the mobile navigation menu to ensure that the mobile menu is working as expected." |
| Mixed EN/ES copy (F12) | Replicate the reference copy **verbatim** (Sales/Cashiers pages in Spanish, others in English) | Visual parity is the stated goal. |
| Social login buttons on the auth card (F21) | Rendered for visual parity; activation surfaces an honest "Single sign-on is not configured on this deployment." toast instead of pretending to work | No fake UI (anti-slop rule); parity kept. |
| Seeding | Demo account seeded **empty** (parity with the reference's zero states) + `db:seed:sample` script for an populated demo | Screenshot parity + demo-ability. |
| Money | Integer cents in SQLite; USD formatting helper; tax per product %, default 16 | Matches F18 defaults; integer math avoids float bugs (the reference itself showed a 1.7999999523162842 artifact). |
| Dark/light theme | **Dark-only** (single-theme app) — the measured design IS dark; theme-store machinery removed | The reference has no theme toggle. |
| Study-era extras (RUM panel, /export, AI assistant, files upload) | Removed with the study domain | They belong to the old product; the POS superset is defined against the reference (F1–F21). |

## 2. Architecture (what stays / what changes)

**Kept as-is (the scaffolding's proven seams):**

- Next.js 16 App Router + React 19 + TS strict + Tailwind v4 (CSS-first) + Radix/shadcn kit + lucide-react
- `src/lib/db-path.ts` + `src/lib/db.ts` — the `DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db` contract (unit-pinned); the `db/` folder lives at the repo root as required
- `src/lib/auth.ts` + `src/lib/server/auth.ts` — scrypt hashing, HMAC cookie sessions, rate limiting, `requireUser`
- `src/lib/server/http.ts` — error contract (Zod→400, P2002→409, P2025→404, 401/500), `withUser`/`withUserParams` wrappers, CRUD factories, download headers
- `src/lib/api.ts` (typed fetch client + offline toast), `connectivity-banner`, toast stack, Radix `ui/*` primitives
- Playwright config (standalone production server on `:3100`, isolated `db/e2e.db`, storageState auth project)
- Prisma workflow (`db:push`, `db:generate`, `db:seed`), Docker assets, SSH-push docs

**New domain layer (the POS clone):**

- **Prisma schema**: `User` (role ADMIN|CASHIER, active, phone, kept auth fields) · `Category` (name, color) · `Product` (name, barcode unique, categoryId, priceCents, costCents, stock, minStock, taxRate, unit, imageUrl, active) · `Register` (name, location, status) · `Shift` (registerId, userId, openedAt, closedAt, openingFloatCents, closingCashCents, expectedCashCents, status OPEN|CLOSED) · `Sale` (ticketNo, registerId, userId, shiftId, subtotalCents, taxCents, discountCents, totalCents, method CASH|CARD|TRANSFER|OTHER, status COMPLETED|REFUNDED, customerName, note, paidCents, changeCents) · `SaleItem` (saleId, productId, name, priceCents, qty, taxRate, lineTotalCents) · `StoreSetting` (singleton: storeName, address, phone, currency, receiptFooter, defaultTaxRate)
- **API routes**: `/api/products[/id]`, `/api/categories[/id]`, `/api/registers[/id]`, `/api/shifts` (+`/open`,`/[id]/close`), `/api/sales` (+`/[id]`, refund via PATCH), `/api/reports/summary?days=`, `/api/dashboard/summary`, `/api/settings`, `/api/cashiers[/id]`, `/api/health` (kept), auth routes (kept)
- **Views (8)**: terminal (product grid + cart + checkout dialog + receipt), dashboard, inventory, sales, registers, cashiers, reports, settings — plus the shared shell (sidebar + mobile drawer + app bar) and auth pages (login/register/forgot/reset restyled dark), and the measured 404 page
- **Pure seams (unit-tested)**: `money.ts` (cents math, USD format), `cart.ts` (line totals, tax, totals, change, receipt line building), `reports.ts` (daily aggregation, payment-method breakdown, period filtering, low-stock rule), `router.ts` (8-view ↔ path map), schemas (Zod)

**Mobile navigation (the F13 fix):** `<lg` shows an app bar (hamburger + brand), the drawer is a `fixed inset-0 z-50` dialog with backdrop button (mirroring the proven study-app drawer geometry, re-measured against the POS theme), focus-trapped, Esc/backdrop close, body scroll lock, close-on-lg-crossing. Regression-pinned by `tests/e2e/mobile-navigation.spec.ts` at 390×844.

## 3. Verification gates (all must be green before push)

1. `bun run lint` · `bun run typecheck`
2. `bun run test` — Vitest unit layer (money, cart, reports, router, schemas, db-path, auth)
3. `bun run build` — production standalone build (REAL_EXIT)
4. `bun run test:e2e` — Playwright against the standalone server + `db/e2e.db`: auth, navigation, **mobile drawer at 390×844**, terminal sale flow, inventory CRUD, registers + shift lifecycle, reports
5. Visual check vs reference at 1280×800 and 390×844 (screenshots into `docs/screenshots/`)

## 4. Deliverables checklist

- [x] This plan (`docs/veloxpos-implementation-plan.md`)
- [ ] Working POS clone (schema + seed + API + 8 views + shell + auth surfaces)
- [ ] Working mobile navigation drawer (Tailwind v4-safe) + regression spec
- [ ] `.env` with `DATABASE_URL="file:../db/custom.db"`, `db/` at repo root (gitignored)
- [ ] Vitest + Playwright suites (configs modified per instruction)
- [ ] Screenshots: `docs/screenshots/` (desktop + mobile + drawer)
- [ ] `README.md`, `AGENTS.md`, `CLAUDE.md`, `Project_Architecture_Document.md` (rewritten for VeloxPOS, following the repo's doc skills)
- [ ] `worklog.md` — fresh VeloxPOS journal, session 1 entry
- [ ] Study-era records archived under `docs/archive/omni-study1/`
- [ ] Single `main`-branch history; push via `docs/ssh_git_wrapper_v3.py` (paramiko shim, key outside the repo)

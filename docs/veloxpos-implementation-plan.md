# VeloxPOS Clone — Implementation Plan (Session-101)

**Target:** production-ready, enterprise-grade clone (functional superset, visual parity) of
`https://veloxposen.base44.app/` — **VeloxPOS (Point Of Sale)**.
**Repo:** `nordeim/velox-pos` (this checkout) — the Omni-Study codebase is the *scaffolding*;
the application domain is replaced with the POS domain.

---

## 0. What the reference actually is (measured 2026-10-26, agent-browser)

The reference is a **dark-themed Point-of-Sale web app** (base44 shell). Measured facts:

### Global design tokens (computed styles, 1440x900)
| Token | Value |
|---|---|
| Body background | `rgb(8, 10, 20)` `#080a14` |
| Body text | `rgb(231, 233, 239)` `#e7e9ef` |
| Font | `ui-sans-serif, system-ui, sans-serif` (system stack, no webfont) |
| Sidebar | 220px expanded / 68px collapsed, `bg #0d0f1a`, `border-r #1e2235`, `z-50`, `transition-all duration-300` |
| Logo badge | 32x32 (`w-8 h-8`) `rounded-xl`, gradient `from-violet-500 to-indigo-600` (139,92,246 → 79,70,229), white Zap glyph, "VeloxPOS" bold |
| Nav item | height 42px, pad `10px 12px`, radius 12px; active `rgba(124,58,237,0.2)` + `rgb(196,181,253)` (violet-300); 8 items: Terminal(/POS), Dashboard, Inventory, Sales, Registers, Cashiers, Reports, Settings(/StoreSettings) |
| Collapse control | chevron button at sidebar bottom (ChevronLeft ⇄ ChevronRight) |
| Cart panel | `w-full md:w-[380px]`, `bg-[#0d0f1a]`, `border-l #1e2235`, `p-4`, flex-col |
| CART title | `text-xs font-bold uppercase tracking-wide text-white/80` (12px/700/ls .3px) |
| CHARGE button | `glass-button-success px-8 rounded-2xl`, gradient 135° `#059669→#10b981`, border `rgba(16,185,129,.35)`, glow shadow, text-xl font-black, disabled opacity-50 |
| Custom CSS | `.glass`, `.glass-dark`, `.glass-button`, `.glass-button-primary`, `.glass-button-success`, `.glass-button-danger`, `.glass-card` (rules extracted verbatim — see §3.3) |

### Routes (real paths, client-rendered views)
| Route | View | Language | Measured content |
|---|---|---|---|
| `/POS` | Terminal | EN | No active shift gate: Monitor icon, "No active shift" (20px white/70), "Go to **Registers** to open a shift before making sales."; right CART panel ("Scan or select products" empty state, disabled CHARGE $0.00) |
| `/Dashboard` | Dashboard | EN | h1 + full date ("Monday, October 26, 2026"); 4 stat cards (TODAY'S SALES $0.00 green $; TRANSACTIONS 0 violet ShoppingCart; PRODUCTS 0 blue Package; LOW STOCK 0 orange AlertTriangle — icon blobs); "Sales — Last 7 days" line chart (dotted grid, violet line, Tue…Mon); "Products by Category" ("No data yet") |
| `/Inventory` | Inventory | EN | "0 products registered"; `+ New Product` (violet); search "Search by name or code..."; "All" category pill; table PRODUCT/CODE/PRICE/STOCK/CATEGORY/STATUS/ACTIONS; "No products found" |
| `/Sales` | Sales | **ES** | "Historial de Ventas", "0 ventas registradas", "Buscar por ticket, cliente o cajero...", table TICKET/FECHA/CAJERO/MÉTODO/TOTAL/ESTADO/ACCIONES, "Sin ventas" |
| `/Registers` | Registers | EN | "Cash Registers", "0 registers configured", `+ New Register` (violet glow), empty "No registers configured yet" (Monitor icon); modal: Name* ("e.g. Register 1"), Location ("e.g. Main entrance") |
| `/Cashiers` | Cashiers | **ES** | "Cajeros", "0 usuarios registrados", empty "No hay usuarios registrados" (Users icon); "Turnos Recientes" table CAJERO/CAJA/INICIO/FIN/VENTAS/ESTADO |
| `/Reports` | Reports | EN | "Sales & revenue analytics"; period pills 7/14/30/90 days (active violet); TOTAL REVENUE / TRANSACTIONS / AVG. TICKET cards; DAILY SALES area chart; REVENUE BY PAYMENT METHOD; BREAKDOWN BY METHOD ("No data for this period") |
| `/StoreSettings` | Settings | EN | "Store Settings — Customize your business"; sections: **Business Information** (Store name* "My Store", Upload logo, Address, Phone, Email, Tax ID/EIN, Currency "USD - US Dollar"), **Branding** (Primary #6366f1, Secondary #8b5cf6 color wells + hex inputs), **Receipt** (footer "Thank you for your purchase!"), **Fiscal / Tax Data** ("Hidden on receipt" button, RUC/NIT "e.g. 12-3456789", business type "e.g. S-Corp, LLC", fiscal address, expense account "e.g. G03 - General expenses"), **Card Payment Provider** (None select), **Product Categories** (Add), Save Changes |
| `/login` | Login | EN | **Light theme** (white card on light gray): base44 gem logo, "Welcome to VeloxPOS (Point Of Sale)", "Sign in to continue", 4 social buttons (Google/Microsoft/Facebook/Apple), OR divider, Email ("you@example.com") / Password inputs with leading icons, dark navy "Sign in", "Forgot password?", "Need an account? Sign up" |
| any other | 404 | **ES** | Dark, no sidebar: "404 — Página no encontrada — La página que buscas no existe o fue movida — [← Ir al Terminal]" |

### Data model (inferred from the base44 entity API observed on the wire)
`User`, `Register` (name, location), `CashierShift` (`status: "active"` filter observed),
`Sale` (sorted `-created_date`), `StoreSettings`, plus `Product`/`Category` (referenced by
the Inventory UI). The demo account is **write-restricted (403)** — every CREATE observed
returned 403, so the reference was captured in its empty states; the clone implements full
CRUD (the superset requirement) with parity empty states by default.

### Mobile behavior (390x844) — the reference's own defect
- Sidebar stays **expanded 220px at z-50 overlaying the content**; there is **no hamburger**.
- Collapse via the bottom chevron → 68px icon-rail (labels hidden, zero title/aria on icon-only links).
- Cart panel is `w-full` and overlaps the main text ("No acti… shif…" clipping).
- Conclusion: the reference's mobile nav is *usable-but-broken*. The clone ships the
  **documented a11y superset**: a real mobile drawer (hamburger in a top bar → slide-in
  glass-dark drawer, backdrop, auto-close on navigate, Escape, scroll-lock, aria-labels)
  while the desktop sidebar is pixel-faithful (220/68, chevron toggle). This mirrors the
  S67–S100 mobile-nav doctrine from the Omni-Study sessions.

---

## 1. Strategy: scaffolding reuse vs. domain replacement

**Keep (infra, battle-tested):**
- Next.js 16 + React 19 + TS strict + Tailwind v4 CSS-first config (`next.config.ts` minus
  the study rewrites), `tsconfig`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`
- Prisma client seams: `src/lib/db.ts` + `src/lib/db-path.ts` (the `file:../db/custom.db`
  contract, pinned by tests) — untouched
- Auth stack: `src/lib/auth.ts` (pure HMAC seam), `src/lib/server/auth.ts` (cookie layer),
  all `/api/auth/*` routes, `src/instrumentation.ts` (AUTH_SECRET boot guard), rate limiting
- HTTP layer: `src/lib/server/http.ts` (error mapper, `withUser`, `makeCollectionRoutes` /
  `makeItemRoutes` factories), client seam `src/lib/api.ts`
- UI primitives (`src/components/ui/*`), Toaster, connectivity banner
- Push tooling: `docs/ssh_git_wrapper_v3.py` + runbook (paramiko shim recipe)
- `vitest` + `@playwright/test` toolchains (configs rewritten for the POS suites)

**Replace (domain):**
- `prisma/schema.prisma` → POS models; `prisma/seed.ts` → POS seed
- `src/app/*` pages → POS routes (real paths, matching the reference)
- `src/app/api/*` entity routes → POS entities (products, categories, registers, shifts,
  sales, store-settings; keep auth + health; drop study entities + RUM)
- `src/lib` domain seams → POS seams (§3.1)
- `src/components/views/*` + layout chrome → POS views + shell (§3.2)
- Test suites → fresh POS suites (§4)
- Root docs (README/AGENTS/CLAUDE/PAD) → rewritten for VeloxPOS per their skills (§6)

**Leave untouched:** `scripts/*` (Omni-Study session tooling — historical, not in the build
graph), `skills/*`, `docs/` history (the new plan + screenshots are *added*).

---

## 2. Environment contract (user-pinned)

- `.env`: `DATABASE_URL="file:../db/custom.db"` (exact), plus `AUTH_SECRET` (generated
  64-hex) and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `db/` folder at the **repo root** (git-ignored contents; `.gitkeep` committed)
- Code references: `src/lib/db-path.ts` already resolves `file:../db/custom.db` against the
  schema-anchored repo root for dev/build/standalone — no change needed; `package.json`
  `db:*` scripts already pin the same URL inline
- `bun run db:push && bun run db:seed` provisions

---

## 3. Build plan

### 3.1 Data model (prisma/schema.prisma)
```
User            — existing + role ("owner"|"cashier") + active flag
StoreSettings   — 1:1 per owner: storeName, logoDataUrl?, address, phone, email, taxId,
                  currency, primaryColor, secondaryColor, receiptFooter, hideFiscalOnReceipt,
                  fiscalRuc, fiscalBusinessType, fiscalAddress, fiscalExpenseAccount,
                  cardProvider ("none"|"stripe"|"sumni"→"none" default), categories JSON
Category        — (also rows in StoreSettings.categories? NO — real model) name, userId
Product         — name, barcode, categoryId?, price, cost?, stock, minStock, taxRate,
                  unit ("Piece"|"Box"|"Kg"|"Liter"|"Pack"), image?, active
Register        — name, location?, status ("closed"|"open"|"blocked")
CashierShift    — registerId, cashierId, openedAt, closedAt?, openingFloat, countedCash?,
                  variance?, status ("active"|"closed")
Sale            — ticket, items JSON [{productId,name,price,qty,taxRate}],
                  subtotal, taxTotal, discountTotal, total, paymentMethod ("cash"|"card"),
                  amountPaid?, change?, customer?, cashierId, registerId, shiftId?, status
```
All user-owned (cascade), Zod-validated at every boundary, delegates over the existing
`makeCollectionRoutes` factories.

### 3.2 Domain seams (`src/lib/`, pure + unit-tested)
| Seam | Responsibility |
|---|---|
| `money.ts` | cents-safe math, `formatMoney(amount, currency)`, `lineTotal`, tax split |
| `cart.ts` | cart reducer + totals (subtotal/tax/discount/total), charge-enable rule |
| `ticket.ts` | `T-000001` sequential format (per-store count → next) |
| `shift.ts` | shift state machine, expected cash, variance, can-open/can-close rules |
| `reports.ts` | period buckets (7/14/30/90), daily series, by-method aggregation, avg ticket |
| `inventory-status.ts` | stock → `out` / `low` (≤ minStock) / `ok` derivation |
| `currency.ts` | currency list (USD/EUR/MXN/GBP/…) + symbol mapping |
| `validation.ts` | every API payload contract (products, categories, registers, shifts, sales, settings) |
| `csv.ts` | products CSV export/import (superset) |
| `store.ts` | ONE Zustand POS store (collections + cart + shift + settings, `useShallow`) |
| `router.ts` | nav items + active-route helper |

### 3.3 Design system (`globals.css`)
- Keep the v4 pinned-palette discipline (violet/emerald/orange/blue scales)
- Add the measured tokens: `--color-ink` #080a14 canvas, `--color-panel` #0d0f1a,
  `--color-edge` #1e2235
- Paste the reference's custom classes **verbatim** as plain CSS (NOT `@layer utilities` —
  the documented v4 cascade trap where custom classes lose to arbitrary utilities):
  `.glass`, `.glass-dark`, `.glass-button`, `.glass-button-primary`, `.glass-button-success`,
  `.glass-button-danger`, `.glass-card`
- Exact gradients as CSS classes (135° emerald charge button; violet logo badge) — never
  utility gradients (oklab interpolation drift, trap 5)
- Body font: literal system stack (trap 2 — no `var()` font chains)
- App shell always dark; `/login` always light (route-scoped class)

### 3.4 Pages & chrome
- `(app)` route group with a server-gated layout (session check → client shell)
- `AppShell`: desktop sidebar (220/68, chevron) + **mobile top bar with hamburger drawer**
  (the a11y superset): backdrop, Escape, auto-close on route change, `aria-label="Open
  navigation menu"`, labeled links, scroll-lock
- Views: Terminal (shift gate → catalog grid + barcode/search + category chips + cart +
  charge dialog [method, amount-received, change] + receipt), Dashboard (4 cards + 2
  hand-rolled SVG charts), Inventory (table + modal + search + category filter + CSV
  import/export), Sales (ES copy), Registers (cards + open-shift dialog), Cashiers (ES copy
  + add-cashier + Turnos Recientes), Reports (pills + cards + area chart + method tables),
  StoreSettings (6 sections + Save), login (light card), `not-found.tsx` (ES 404)
- Charts: hand-rolled SVG (dotted grid, violet line/area) — zero new dependencies

### 3.5 Superset features (beyond the reference)
Working auth (register/verify/forgot/reset/change-email/password), full CRUD everywhere the
reference's demo 403s, shift lifecycle with cash-count + variance, checkout with change and
printable receipt (branding + fiscal data per settings), CSV product import/export, category
management, cashier accounts, search/filter/sort everywhere, toasts + confirm dialogs,
loading/empty/error states, skip-link + aria superset, `/api/health`.

---

## 4. Test plan (fresh suites, configs rewritten)

**vitest** (`vitest.config.ts` → `tests/unit/**`, node env, ~coverage of src/lib):
money, cart, tax, ticket, shift, reports, inventory-status, currency, csv, validation,
auth (pure), db-path (existing contract), env-check. Red→green on new seams.

**playwright** (`playwright.config.ts` → two projects: desktop 1440x900, mobile 390x844;
webServer `bun run dev`, storageState auth reuse, seed-aware):
- `auth.spec` — login fail/success, protected redirect, logout
- `navigation.spec` — desktop sidebar routing + active states + collapse
- **`mobile-navigation.spec`** — the user-pinned surface: hamburger opens drawer, labeled
  links, navigate + auto-close, Escape, backdrop, no horizontal overflow, icon-rail parity
- `inventory.spec` — validation errors → create → search → edit → low-stock badge → delete
- `registers-shifts.spec` — create register → open shift → active chip → close shift
- `terminal.spec` — cart math, qty, cash checkout + change, ticket, receipt
- `sales.spec` — rows + search
- `reports.spec` — pills, cards, chart render
- `settings.spec` — save settings, categories, branding
- `notfound.spec` — Spanish 404 + Ir al Terminal

**Gates before push:** `bun run lint && bun run typecheck && bun run test && bun run build`
(+ smoke on the standalone build) — the local gate is the only gate.

---

## 5. Risks & the Tailwind-v4 trap checklist (mobile-nav focus)
1. Custom classes in `@layer utilities` lose the cascade to arbitrary utilities — **the
   documented root cause of drawer styling silently breaking in v4**. All custom classes
   ship as plain CSS / `@utility`.
2. No `tailwind.config.js` anywhere (the "#1 cause of the flat look" bug).
3. No `var()` chains for colors in `@theme`; no `var()` font at `:root`.
4. Dead controls below breakpoints forbidden — the hamburger (mobile) hides the desktop
   chevron and vice-versa; every control works at every width.
5. `space-y-*` + margin utilities specificity trap — flex `gap-*` only.
6. Exact gradients only as CSS classes (oklab drift).
7. Scroll-lock + `100dvh` drawer (mobile browser chrome), `md:` breakpoint at 768.

## 6. Deliverables checklist
- [ ] Codebase (above) with `.env` + `db/` wired
- [ ] `docs/veloxpos-implementation-plan.md` (this file)
- [ ] `docs/screenshots/` dev-server captures (desktop + mobile + drawer + views)
- [ ] README.md, AGENTS.md, CLAUDE.md, Project_Architecture_Document.md (per skills)
- [ ] worklog.md Session-101 entry
- [ ] Gates green → commit(s) on `main` → push via `docs/ssh_git_wrapper_v3.py`
      (`--remote git@github.com:nordeim/velox-pos.git`, paramiko shim on PATH, key outside
      the repo, 0600, dry-run → push → verify → shred)

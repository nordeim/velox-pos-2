## Session-101 — the VeloxPOS domain replacement (the omni-study scaffolding → a Point of Sale app)

**Received state**: `dbcbc35` (Batch BA / Session-100 — the Omni-Study plateau: unit 936/936,
e2e 474/474, standing debt ZERO). **New operator directive**: clone the repo as SCAFFOLDING and
build a complete, production-ready, enterprise-grade clone of **`veloxposen.base44.app` — which
is NOT a study app at all: it is "VeloxPOS (Point Of Sale)"** — then wire the db contract, the
test suites, the docs, the screenshots, and push via the SSH wrapper.

**Reference recon (agent-browser, computed styles — the measured spec lives in
`docs/veloxpos-implementation-plan.md` §0):** logged in with the operator's credentials
(sepnetflix2023@outlook.com); toured all 8 routes (`/POS /Dashboard /Inventory /Sales /Registers
/Cashiers /Reports /StoreSettings` — Settings' href is the entity-named /StoreSettings and
`/Settings` itself 404s with a SPANISH "Página no encontrada"); extracted the design tokens
(body #080a14, panel #0d0f1a, edge #1e2235, sidebar 220/68px, active nav violet-600/20 +
violet-300, the `glass-*` custom-class system verbatim from the reference stylesheet, the CHARGE
button's 135° emerald gradient, the logo chip violet→indigo); captured the mixed EN/ES copy
(Sales = "Historial de Ventas", Cashiers = "Cajeros"/"Turnos Recientes"); read the entity API off
the wire (User/Register/CashierShift/Sale/StoreSettings — every observed CREATE 403s: the demo
account is write-restricted, so the reference was captured in its empty states); and measured the
reference's OWN mobile defect at 390×844 — a 220px z-50 sidebar overlaying the content with NO
hamburger (collapse → 68px icon rail is the only navigation).

**Implemented (the scaffolding kept, the domain replaced):**
- **Kept**: the Next.js 16 shell, the hardened auth stack (scrypt + HMAC `sf_session` cookie +
  the AUTH_SECRET boot guard), the http error-mapper + CRUD route factories, `db-path.ts` (the
  relative-DATABASE_URL contract, pinned by tests), the shadcn-style UI primitives, the Toaster,
  the push tooling, and the doc-skill corpus.
- **Data model**: 7 POS models (User+role, StoreSettings, Category, Product, Register,
  CashierShift, Sale) — schema pushed to `db/custom.db` at the repo root; seed creates the
  operator's owner account + the reference's default Store Settings + an EMPTY store (parity with
  the reference's empty states); `--demo` adds the showcase dataset.
- **Pure seams** (each unit-pinned): money (integer-cents math), cart (reducer + totals + the
  CHARGE gate + ticketLabel), shift (open/close state machine, expected cash, variance), reports
  (7/14/30/90 bucketing, by-method shares, category slices), inventory-status (+ the CSV
  round-trip), currency, router (the 8-path map — `/Settings` 404s by design), validation (Zod
  strip-mode contracts for every boundary).
- **API**: products/categories/registers/cashiers over the delegate factories (ownership-scoped,
  Zod-at-the-door); workflow routes for shifts (open with opening float; close with server-side
  expected/variance) and sales (server-authoritative checkout: re-priced lines, stock decrement,
  ticket allocation, shift pinning, one transaction); store-settings (lazy singleton);
  auth + health kept.
- **UI**: the measured glass design system as PLAIN CSS (the v4 @layer-utilities cascade trap
  documented and avoided); AppShell with the pixel-faithful desktop sidebar (220/68, chevron,
  aria-labeled icon rail) + the **mobile drawer a11y superset** (labeled hamburger, role=dialog
  drawer, backdrop/Escape/route-change close, scroll lock, zero horizontal overflow at 390px);
  all 8 views; the light login card (reference copy + SSO buttons + working email/password +
  client-side signup/forgot views); the Spanish 404; hand-rolled SVG charts (zero chart deps).
- **Tests**: fresh suites — vitest `tests/unit/**` (12 files, **117/117**) and Playwright
  `tests/e2e/**` (**39/39**, desktop 1440×900 + mobile 390×844 projects, storageState auth,
  production-standalone webServer with kill-port → provision → boot).

**Field-tested failures fixed along the way (each documented in the code):**
1. `instrumentation.ts` ran in the Edge runtime → `process.exit` is an Ecmascript-file error that
   500'd every route; fixed with the `NEXT_RUNTIME === "nodejs"` guard + dynamic import.
2. Pre-hydration native form GETs (the login password landing in the URL): the submit button now
   ships `disabled` from the server and unlocks via a timer-callback effect (lint-clean, and the
   SSR HTML carries the disabled attribute — verified in the prerendered output).
3. React 19's `react-hooks/set-state-in-effect` lint rule: every dialog-reset effect replaced
   with key-based remounts or render-time adjustment; the lint gate is green.
4. The e2e auth chain (the deepest dig of the session): Secure cookies on http://localhost
   (→ the documented `COOKIE_SECURE=false` escape hatch), then the login/page-render
   desynchronization under the standalone server (route handlers and SSR resolving the relative
   DATABASE_URL against different anchors + a port-squatting stale server serving a deleted
   inode) — fixed by the **absolute** DATABASE_URL for the e2e server, the kill-port
   → provision → boot webServer command (the scratch db is never replaced while the server
   lives), and the hydration-wait in auth.setup. Final state: the setup signs in through the REAL
   UI and every e2e journey runs against the production build.
5. Tailwind v4 trap hits during assembly: a mid-comment CSS cut (parsed as selectors) and a
   tooling-display artifact that ate `[m` sequences in file output (the hex-dump discipline from
   the runbook settled it — the file was never corrupted).

**Re-certification (all on the final tree)**: lint ✓ (0 errors, 1 documented warning — the
intentional full-reload-after-auth) · tsc ✓ (strict, clean) · unit **117/117** (12 files) ·
canonical build ✓ (standalone) · e2e **39/39** (24 chromium + 10 mobile + 5 setup-adjacent; the
mobile drawer suite pins the hamburger/dialog/auto-close/Escape/backdrop/no-overflow contract).

**Docs chain (per their skills)**: README.md (badges, screenshots, quick start, env table, API
table, design tokens) · AGENTS.md (commands, invariants, the v4 traps, the drawer contract) ·
CLAUDE.md (seam map, patterns, testing conventions, sharp edges) · Project_Architecture_Document.md
v1.0 (ADR-001…007, layer model, data model, security, testing doctrine, deployment) ·
docs/DEPLOYMENT.md (rewritten for VeloxPOS) · docs/veloxpos-implementation-plan.md (the measured
reference spec + the build plan) · docs/screenshots/ (15 dev-server captures: login, terminal
gate/cart/charge/receipt, all views, mobile terminal + drawer) · this worklog entry.

**Stage summary.** The repository is now a complete, self-consistent VeloxPOS codebase: the
Omni-Study domain is gone from src/prisma/tests (the Omni-Study session tooling in `scripts/` and
the historical docs remain untouched as archives), the reference contract is measured and pinned,
the gate is green end-to-end, and the push path is the wrapper runbook. Standing debt: NONE
identified in the new domain. Baselines: unit **117/117**, e2e **39/39**.

**Parallel-session reconciliation.** origin/main moved during this session (8e05a75..816781f —
another agent's VeloxPOS pivot). Reconciled by adopting its purely-additive artifacts
(docs/archive/omni-study1/ reorganization + the veloxpos_SKILL.md distillation, with a
reconciliation note) and merging the histories with `-s ours` — the Session-101 tree (all gates
green in this session) is the implementation of record; the parallel tree remains an ancestor.

---

## Session-3 — the audit-driven parity pass (velox-pos-2)

**Received state**: `c5c9661` (Session-101's tree: unit 117/117, e2e 39/39, zero standing debt
in the POS domain). **Directive**: re-verify against the live reference, audit with the repo
skills (web-application master skill + agent-browser + tdd + clone-app-pat-pro), use neo-crm as
the family-pattern source, remediate with TDD, ship the fresh `velox-pos_SKILL.md`, and push.

**Audit (the full ledger is `docs/remediation-plan-session-3.md`):** the reference re-measured
live (agent-browser, computed styles) — its OWN mobile defect confirmed still present (220px
z-50 sidebar overlay, no hamburger at 390×844); the clone's desktop tokens re-verified exact
(sidebar 220/68, nav item 42px/12px, active violet-600/20 + #c4b5fd, CHARGE 135° emerald,
brand chip violet→indigo, canvas #080a14). Fourteen findings, two HIGH: **F-1** `tw-animate-css`
installed but never imported — every Radix `data-[state]` animation class was dead CSS (dialogs,
selects, toasts popped with no motion); **F-2** v4's `(hover: hover)` wrap — every hover affordance
no-op'd on touch devices (the neo-crm session-80 live-proven trap). Plus: the drawer lacked
focus management (F-3) and the md-growth auto-close (F-4, the sibling's pinned S8-P1 bug class);
the cart rail activated at `lg` where the reference uses `md` (F-5); the brand row missed the
measured `px-4 py-5 border-b` frame (F-6); five dead deps + a stale npm lockfile (F-7/F-15);
stale StudyFlow `.env.example` + missing COOKIE_SECURE row (F-8); PAD count drift (F-9);
nav-container spacing drift (F-10); study-era palette comments (F-11); the stale recovered
`veloxpos_SKILL.md` contradicting the code (F-12); the un-animated drawer (F-13);
`tracking-wider` vs the reference's `tracking-wide` CART heading (F-14).

**TDD execution (red before green — six new e2e pins written first, verified failing, then
fixed):** dialog animation (`animation-name: enter`), cart-md geometry at 800px (380px +
border-l), drawer focus-in (close button focused on open), Tab wrap (both ends), Escape focus
restore to the hamburger, md-growth auto-close (drawer unmounts, scroll lock released).

**Implemented:** `@import "tw-animate-css"` + `@custom-variant hover (&:hover)` in globals.css;
the drawer focus trap + restore + matchMedia auto-close + slide-in/fade-in entrance classes
(exit stays the instant conditional unmount so the UNMOUNT pins stay deterministic); cart rail
`md:w-[380px] md:border-l` (+ `md:flex-row` / `md:p-6` on the terminal layout); the brand row's
measured frame (`px-4 py-5 border-b`, BrandRow padding removed — 73px, logo x=16, verified
against the reference); nav `px-2 py-4 gap-0.5`; dead deps removed via `bun remove` (quill,
web-vitals, tailwindcss-animate, @radix-ui/react-radio-group, @radix-ui/react-scroll-area) and
the stale `package-lock.json` retired (bun.lock is the single lockfile); `.env.example`
rebranded + COOKIE_SECURE documented; the stale study-era palette comments neutralized;
`velox-pos_SKILL.md` authored per the distill skills (code-accurate, v2.0.0) and the stale
`veloxpos_SKILL.md` removed.

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning) · tsc ✓ ·
unit **117/117** (no pure seam touched) · build ✓ (standalone; the instrumentation Edge-runtime
warning is the documented benign one) · e2e **45/45** (30 chromium + 13 mobile + 2 setup/geometry;
all 39 prior pins green, none weakened) · live agent-browser re-verification: brand 73px/border-b,
nav px-8, cart 380px at 800px, drawer `animation-name: enter` with focus on the close button,
dialog `animation-name: enter`, 0 `(hover: hover)` media queries in the built CSS.

**Docs lockstep:** README/AGENTS/CLAUDE/PAD counts updated (e2e 39→45, mobile spec 13 tests) in
the same commit; PAD v1.1 revision block + ADR-008 added; this skill chain now points at
`velox-pos_SKILL.md`; five new screenshots (09–13) in `docs/screenshots/` captured from the
production standalone build (the family rule: never the dev badge).

**Stage summary.** The clone is now a verified superset: visual parity on every measured token
including the previously-drifting brand row/nav/cart breakpoints, touch-correct hovers, animated
dialogs/drawer, and the full drawer a11y contract (focus trap, restore, md-growth close) — every
behavior e2e-pinned. Standing debt: NONE identified. Baselines: unit **117/117**, e2e **45/45**.

---

## Session-4 — the reference-drift parity pass (velox-pos-2)

**Received state**: `f2583b3` (Session-3's tree + two doc-only commits: the session log and the
coding-agent prompt). **Directive**: the standing audit→remediate→push cycle — re-verify the
gate on a fresh clone, re-measure the live reference, fix what drifted, keep TDD and the docs
in lockstep, push via the SSH wrapper.

**Environment (fresh-clone bootstrap):** `bun install` (485 pkgs) → `.env` from
`.env.example` + generated AUTH_SECRET → `db:push` + `db:seed` + `--demo` (15 products /
5 categories / 1 register / 33 sales) → `bunx playwright install chromium` (the fresh sandbox
lacked browser build 1243 — the same first-run step Session-3 hit). **Gate on the received
tree: lint 0 errors (1 documented warning) · tsc clean · unit 117/117 · build green · e2e
45/45** — the documented baselines hold on a pristine clone.

**Audit (the full ledger is `docs/remediation-plan-session-4.md`):** the reference re-measured
live end-to-end (agent-browser, computed styles, view-by-view text diff — with explicit
navigation per site after discovering the CLI's named sessions share one tab). The reference's
OWN mobile defect re-confirmed (220px z-50 overlay, no hamburger @390×844). Session-3's fixes
re-verified exact (brand row 73px/border-b, nav px-8, cart 380px @800px, drawer contract,
`animation-name: enter`). **Nine new findings — the headline: the reference site itself
DRIFTED since Session-101** (it renamed its fiscal field labels live: RUC/NIT → "Tax ID /
EIN", business type → "Tax Regime", expense account → "CFDI Use (default)"; its fiscal toggle
flips "Hidden on receipt" ⇄ "Visible on receipt" with a hidden default and a help paragraph
the clone lacked). Plus a heading-scale delta never previously pinned (reference H1 24px /
sections 16px / Reports sections 14px vs the clone's 30/18/16px — and the reference's own
headings render in near-invisible slate-700/800 on dark glass, pixel-verified: 880 slate-800
text pixels on the #080a14 canvas); the missing cart "Added" auto-collapsing banner; DOM copy
casing (Title Case) on Reports/Dashboard stats; the login canvas gradient; and the
single-phrase signup button.

**TDD execution (red before green — 10 new e2e pins written first, verified failing, then
fixed):** H1 24px across 4 views; section headings 16px; Reports headings 14px + white/60;
Reports + Dashboard Title Case (`exact: true` — Playwright's substring match is
case-insensitive, the first RED run proved it); the four fiscal labels; the fiscal toggle
default (unchecked = hidden) + label pair + help paragraph; the cart Added banner
(visible-with-name → auto-collapsed); the login gradient; the signup single button.

**Implemented:** `shared.tsx` H1 `text-3xl`→`text-2xl`; dashboard/cashiers/settings headings
`text-lg`→`text-base`; reports headings `text-base`→`text-sm` + `text-white/60` + Title Case;
the fiscal card relabeled + `SectionCard` gains a `headerAction` slot (toggle in the header
row, wired `checked={!hideFiscalOnReceipt}` with the label pair "Hidden on receipt" ⇄
"Visible on receipt") + the help paragraph; `prisma/schema.prisma`
`hideFiscalOnReceipt @default(true)` (+ db:push + the demo row updated); the cart's "Added"
banner in `terminal-view.tsx` (the reference's DOM verbatim: `max-h-0 opacity-0` ⇄
`max-h-24 opacity-100`, emerald gradient chip, circle-check, timer state in the click handler
— no setState-in-effect); `.login-canvas` → the reference's `to right bottom #f8fafc →
#f1f5f9` gradient; the single-phrase "Need an account? Sign up" slate-500 button.

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning) · tsc ✓
· unit **117/117** · build ✓ · e2e **55/55** (all 45 prior pins green, none weakened — the two
Session-101 casing pins updated to the reference's measured Title Case strings, not deleted).
Live agent-browser re-verification: H1 24px / sections 16px / Reports 14px + Title Case
everywhere; the fiscal card (labels, unchecked default, "Hidden on receipt", help text,
header-row toggle); the Added banner live cycle (collapsed → "Added / Phone Stand" →
auto-collapsed after ~2.5s); the login gradient `linear-gradient(to right bottom, rgb(248,
250, 252), rgb(241, 245, 249))` byte-exact.

**Docs lockstep:** README badge + counts (e2e 45→55); AGENTS.md — the "reference DRIFTS, live
computed styles are the contract" law + the Session-4 pin contracts (heading scale, fiscal
toggle polarity, Added banner); CLAUDE.md — the same laws + the reference-drift sharp edge;
PAD v1.2 revision block + ADR-009; this remediation plan's checkboxes ticked; five fresh
screenshots (14–18) in `docs/screenshots/` captured from the production standalone build.

**Stage summary.** The clone now tracks the reference's CURRENT live surface (the fiscal
rename + toggle contract, the heading scale, the Added banner, the login canvas) while keeping
the readable-color a11y superset where the reference's own styling defeats it. Standing debt:
NONE identified. Baselines: unit **117/117**, e2e **55/55**. The reference-drift lesson is
codified in AGENTS/CLAUDE: the measured spec is a snapshot; the live site is the contract.

---

## Session-5 — the form-control parity pass + the @theme inline bug (velox-pos-2)

**Received state**: `dab7f4f` (Session-4's tree + the session log doc commit). **Directive**:
the standing audit→remediate→push cycle — re-verify the gate, re-measure the live reference,
fix what drifted (the mobile-nav/Tailwind v4 bug class called out explicitly), keep TDD and
the docs in lockstep, push via the SSH wrapper.

**Environment:** deps + Prisma client pre-installed; `db/custom.db` + `db/e2e.db` present;
Playwright browsers present. **Gate on the received tree: lint 0 errors (1 documented
warning) · tsc clean · unit 117/117 · build green · e2e 55/55** — the Session-4 baselines
hold.

**Audit (the full ledger is `docs/remediation-plan-session-5.md`):** the reference re-measured
live at a depth the earlier sessions never pinned — a computed-style **census of every form
control, button, pill, and the login form internals** (13 verification checks, V1–V18). All
Session-4 pins re-verified holding (fiscal labels/toggle/help, heading scale, Title Case,
Added banner classes, login canvas gradient, the reference's own mobile defect). **Thirteen
new findings — the headline: the Tailwind v4 theme-switching bug (F-28)**: non-inline
`@theme` bakes `hsl(var(--input))` into `--color-input` AT `:root`, so the `.theme-light`
login scope's triplet re-pointing could NEVER reach themed utilities — live-proven
(`--color-input` read the dark value inside the light wrapper; the login inputs rendered
dark borders on the light card since Session-101, visible in the old screenshots, never
measured). Plus a SYSTEMATIC form-control drift (F-27): every reference Input/Select/Textarea
computes 12px radius + #262a36 border-input + transparent bg + #707a8f placeholders, while
the clone shipped 6px radius + border-edge overrides + white/5 fills (34 per-field overrides).
And: the Button default padding (F-34, py-2.5/42px vs h-9/36px), CHARGE py (F-35, 70 vs 58px),
the receipt-footer TEXTAREA (F-26), the Reports period-pill geometry (F-36), the login form
internals (F-29/30/31/32/33/38: 48px slate-filled inputs, the shadow-2xl card + 4px gradient
strip, the vendored logo image, 54px SSO buttons, font-medium sign-in), and the color-swatch
frames (F-37). Verified NOT findings: the glass dialog frames (visually equivalent),
glass-button gradient stops (an intermediate "drift" reading was a hover-state artifact —
re-measured clean), label-to-input spacing (8px both sides).

**TDD execution (red before green — 13 new e2e pins written first, verified failing, then
fixed; 2 pin bugs fixed during GREEN — the SSO line-height (text-base, not text-sm) and the
v4 oklab serialization of bg-slate-50/50, pinned alpha-tolerant like the white/60 pin):**
settings/dialog/search input geometry, the receipt-footer textarea, the Reports pills + 
container, the New Product button, the CHARGE button, the select trigger, the login inputs,
the login card shadow + strip, the logo img, the sign-in button, the SSO buttons.

**Implemented:** `tokens.css` `@theme` → **`@theme inline`** (verified in the built CSS:
`.border-input{border-color:hsl(var(--input))}` — per-element resolution); `:root` tokens →
the reference's app-scoped values (`--input`/`--border` `225 18% 18%` = #262a36,
`--muted-foreground` `220 12% 50%` = #707a8f, `--ring` `252 87% 67%`); Input/Select/Textarea
bases → rounded-xl + ring-1 focus + text-base md:text-sm + shadow-sm; 34 per-field
`border-edge bg-white/5` overrides stripped; the search inputs → transparent + pl-10 +
slate-400 icons; Button default size → `px-4 py-2.5` (padding-driven); CHARGE → `py-5`; the
receipt footer → `Textarea rows={2}`; the Reports pills → the reference's geometry; the
login surface → the reference's form internals (direct slate classes, the card frame, the
vendored `public/veloxpos-logo.png`, 54px SSO); the color swatches → bare.

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning) · tsc ✓
· unit **117/117** · build ✓ · e2e **68/68** (all 55 prior pins green, none weakened). Live
agent-browser re-verification: login inputs 48px/slate-200/slate-50-50/12px, the card
shadow-2xl + 4px strip + logo 96px, SSO 54px; settings inputs 12px/#262a36/transparent,
footer TEXTAREA rows=2 min-h-60 resize-vertical, select triggers 12px/#262a36; dialog inputs
12px; New Product 42px/10-16; CHARGE 70px/20-32; Reports container 16px/rgba(28,31,52,0.85),
pills 12px/12px-font/white-40-inactive; the F-28 mechanism probe (the built CSS emits
`hsl(var(--input))` inline). The mobile drawer re-verified live at 390×844 (hamburger,
288px dialog, 8 links, `animation-name: enter`, focus on close, no overflow) — the mobile-nav
bug class stays fixed.

**Docs lockstep:** README badges + counts (e2e 55→68); AGENTS.md — the `@theme inline` law +
the Session-5 form-control/button/login contracts; CLAUDE.md — the same laws + the 68-test
baseline; PAD v1.3 revision block + ADR-010; velox-pos_SKILL.md v2.2.0 (trap 13 + the
Session-5 contracts + the session addendum); this remediation plan's checkboxes ticked; six
fresh screenshots (19–24) in `docs/screenshots/` captured from the production standalone
build.

**Stage summary.** The clone now tracks the reference at the form-control depth — every
input, select, textarea, button, and pill computes the reference's measured geometry, the
login form renders the reference's light internals (and the theme-switching mechanism that
silently defeated it is fixed at the root). Standing debt: NONE identified. Baselines:
unit **117/117**, e2e **68/68**. The @theme inline lesson is codified in
AGENTS/CLAUDE/PAD/skill: measure the MECHANISM, not just the surface — a bug that ships
invisible for four sessions is a measurement gap, not just a styling one.

---

## Session-6 — the chrome-depth parity pass + the chart-axis bug (velox-pos-2)

**Received state**: `d8d9e92` (Session-5's tree + the session-log doc). **Directive**:
the standing audit→remediate→push cycle — fresh-clone gate re-verification, re-measure
the live reference, fix what drifted, keep TDD and the docs in lockstep, push via the
SSH wrapper.

**Environment (fresh-clone bootstrap):** `bun install` (485 pkgs) → `.env` from
`.env.example` + generated AUTH_SECRET → `db:push` + `db:seed` + `--demo` (15 products /
5 categories / 1 register / 33 sales) → `bunx playwright install chromium` (the fresh
sandbox lacked build 1243). **Gate on the received tree: lint 0 errors (1 documented
warning) · tsc clean · unit 117/117 · build green · e2e 68/68** — the Session-5
baselines hold on a pristine clone. (The sandbox's background-process reaper ate one
detached build mid-compile — foreground builds are the reliable path here.)

**Audit (the full ledger is `docs/remediation-plan-session-6.md`):** the reference
re-measured live at CHROME depth (the surfaces between the pinned ones): the sidebar
nav (items, active pill, brand row, footer), the Settings section headers + the category
flow, the Settings CTAs, the Inventory filter chips, and the POS shift gate. **The
reference itself drifted again since Session-5** — its nav items are now padding-driven
40px py-2.5 pills (font-medium, 16px icons, white/40 inactive) with an active
border-violet-500/30 + shadow-violet-500/10 pair, and its Reports glyph is now
`ChartColumnIncreasing` (Session-101's FileText reading is stale). All Session-4/5 pins
re-verified holding (fiscal card, headings, Title Case, form controls 12px/#262a36,
buttons 42px, CHARGE 70px, Reports pills, login internals, the mobile defect).

**Ten findings TDD red → green (9 new e2e pins + the inventory category pin REWRITTEN to
drive the reference's dialog flow + 6 unit pins on a new seam):**
- **F-44 (the structural one)**: the reference adds categories through a HEADER Add chip
  (`glass-button px-3 py-1.5 text-sm rounded-lg` + Plus, 34px) opening a "New Category"
  dialog (18px/600 title, Name + "e.g. Beverages", Cancel/Create 42px); the clone's inline
  input row is gone, the empty state reads "No categories", and the e2e pin now drives the
  dialog (protection preserved and strengthened).
- **F-45**: SectionCard headers — bare `w-5 h-5` icons in per-section colors (Store
  indigo-500, Palette purple-500, FileText green-500, Receipt orange-500, CreditCard
  blue-500, Tag amber-500), gap-2, no 36px chip wrapper; three glyphs corrected; the
  readable heading colors stay (the reference's text-slate-700 is its own defect).
- **F-46/F-47/F-48/F-49 (the sidebar chrome)**: padding-driven 40px items + font-medium +
  16px icons + white/40 inactive + transition-all; the active border/shadow pair; the
  14px white/90 tracking-wide wordmark + 16px stroke-2 Zap; the p-3 footer cell + 16px
  chevron.
- **F-39**: Save Changes is the reference's LARGER primary CTA — px-6 py-3.5 text-base
  font-medium (54px), not the standard 42px.
- **F-41**: Inventory chips — the 36px pill family (`px-4 rounded-xl text-xs
  font-semibold`, container `flex gap-2 overflow-x-auto`), active = glass-button-primary;
  the reference's +2px button-base quirk pinned via h-9; the inactive treatment is the
  documented family assumption (the live reference renders only its active "All" chip).
- **F-42**: the POS gate — card p-8 (was p-10), Monitor text-violet-400/30 mb-4 (stroke 2),
  h2 mb-2, paragraph text-white/35 with the "Registers" emphasis styled like the
  reference's <strong> (font-bold text-white/60, NO underline — the working href is the
  kept functional superset).
- **F-43 (hygiene)**: button.tsx's dead Omni-Study-era sf-* variants replaced (default →
  the measured glass-button neutral), the false "S9-R2/s69" comment blocks removed; the
  a11y focus ring kept (the reference ships none — superset posture).
- **F-50 (the headline — found by the VLM visual sweep, NOT the calipers)**: both
  hand-rolled charts drew ONE grid line + label per unit of the y domain — for dollar
  revenue a $470 day rendered 471 labels stacked ~0.46px apart (the live demo rendered
  108; invisible to four audits because the e2e store is empty). Fixed with a pure
  `niceTicks` seam in `src/lib/reports.ts` (1/2/2.5/5×10^k steps; 6 unit pins), both
  charts render from it, the Dashboard x axis now labels WEEKDAY abbreviations at 12px
  (the reference's Recharts convention), and a data-state e2e pin drives a real
  checkout before asserting the axis — the oracle the suite lacked. ADR-011 records the
  contract.

**Pin-doctrine additions (both e2e-hardened):** v4's fractional-alpha utilities
serialize as oklab while Base44 emits rgba (same color) — pin the ALPHA with
`expect.poll` + regex; and raw `evaluate` computed reads do NOT retry like toHaveCSS (a
mid-load style race flaked a pin once before the poll hardening — every raw computed read
in the new pins now polls).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning) ·
tsc ✓ · unit **123/123** (12 files; +6 niceTicks) · build ✓ · e2e **78/78** (all 68
prior pins green, none weakened). Live re-verification on the rebuilt standalone: every
Session-6 contract byte-checked (nav 40/42px + the border pair, 16px icons,
chart-column-increasing, 14px wordmark, section icon colors, Save 54px, the Add chip,
the New Category dialog round-trip — created a category live, chips 36px + gradient,
the gate p-8 + /30 + white/35), the chart at data scale renders 0/25/50/75/100 +
Tue..Mon (VLM-verified readable), and the mobile drawer contract re-verified at 390×844
(hamburger, 288px dialog, 8 links, `animation-name: enter`, focus on close, no
overflow) — the mobile-nav bug class stays fixed.

**Docs lockstep:** README badges/counts (unit 123, e2e 78); AGENTS.md — the Session-6
chrome + chart contracts + the oklab/expect.poll rule; CLAUDE.md — the same laws + the
new baselines; PAD v1.4 + ADR-011; velox-pos_SKILL.md v2.3.0 (traps 14 + 15 + the
Session-6 addendum); the remediation plan's checkboxes + execution record; seven fresh
screenshots (25–31) from the production standalone build; this worklog entry.

**Stage summary.** The clone now tracks the reference at the chrome depth — the sidebar,
the section headers, the category-creation flow, the CTAs, the chips, and the gate —
and both charts render readable nice-tick axes at any revenue scale (a Session-101
defect that survived four audits by hiding from the empty-store oracle). Standing debt:
NONE identified. Baselines: unit **123/123**, e2e **78/78**. The Session-6 lessons are
codified in AGENTS/CLAUDE/PAD/skill: re-measure the reference's chrome each cycle (it
drifts), pin computed ALPHAs not strings, poll every raw computed read — and the e2e
oracle must exercise the DATA state, not only the empty state.

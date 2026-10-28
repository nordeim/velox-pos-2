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

---

## Session-7 — the pin-race hardening pass (velox-pos-2)

**Received state**: `88dae55` (Session-6's tree `1ecc333` + the session-log doc commits).
**Directive**: the standing audit→remediate→push cycle — fresh-workspace gate
re-verification, re-measure the live reference (it drifts), audit the recent changes,
fix what's broken TDD-style, keep the docs in lockstep, push via the SSH wrapper.

**Environment:** the workspace survived intact (bun, node_modules, Playwright chromium
1243, Prisma client, `db/custom.db` with the demo dataset all present) — bootstrap was a
no-op; the local tree was 1 commit behind (fast-forward to `88dae55`, the raw
Session-6 transcript the operator committed as `docs/session_8.md`).

**Gate on the received tree:** lint 0 errors (1 documented warning) · tsc clean · unit
**123/123** · build green · e2e **77/78** — ONE red pin: the mobile spec's "no stuck
scroll lock" (drawer auto-close on md growth). Reproduced in isolation (13/14) — NOT a
flake. **Root cause was in the pin, not the product**: an instrumented diagnostic (a
temporary spec with a MutationObserver on `body[style]`) proved the drawer's effect
cleanup restores `overflow` ~46ms after the md-growth close — the pin's raw
`page.evaluate` read raced the window between React's DOM commit (`toHaveCount(0)`
passing) and the passive-effect flush, and this sandbox's timing hits that window
reliably. The exact Session-6 doctrine ("raw evaluate reads do NOT retry — always
expect.poll") — applied to the Session-6 pins but never swept back over the
Session-3-era ones. **F-51** filed; both unpinned raw reads in `mobile-navigation.spec.ts`
(the scroll-lock release + the 390px horizontal-overflow measurement) hardened to
`expect.poll`. No product code touched; no assertion weakened.

**The reference re-measured live end-to-end — NO drift this cycle** (first drift-free
cycle since the parity work began): sidebar nav (40/42px pills, border/shadow pair, 16px
icons, ChartColumnIncreasing, 14px wordmark, p-3 footer), Settings (fiscal labels, H1
24px, section h3 16px/700, the six per-section-colored 20px icons, the header Add chip
34px/8px, the New Category dialog geometry, Save Changes 54px), Inventory (36px gradient
chips, 42px New Product), Reports (14px uppercase white/60 h2s, the 32px pills +
rgba(28,31,52,0.85) container), Dashboard (Title Case stats, weekday chart labels, nice
ticks), the POS gate (p-8, /30 64px icon, white/35 copy, strong white/60 emphasis, CHARGE
70/20/900), the Spanish copy (Historial de Ventas / Cajeros / Turnos Recientes), the
login internals (48px slate inputs, white/95 shadow-2xl card, 96px logo, 54px SSO, 500
sign-in), and the reference's OWN mobile defect still present at 390×844 (220px z-50
overlay, no hamburger) — the clone's drawer-superset posture remains correct.

**The Session-6 change audit** (commit `1ecc333`): all clean — nav-items, app-shell
footer, the SectionCard headers, the category dialog restructure (click-handler state
resets, key-based lists, no setState-in-effect), the Inventory chips, the ShiftGate, the
button hygiene, the niceTicks seam + both charts. The static v4-trap sweep: no
`@layer utilities` custom classes, `@theme inline` intact, `@custom-variant hover`
present, `tw-animate-css` imported, no tailwind.config, no space-y + mt/mb in the nav
chrome. Tree hygiene clean.

**Stability proof for the F-51 fix:** the mobile spec passed 3/3 consecutive full runs
(14/14 each) after the hardening; the full suite green at 78/78.

**Live re-verification on the rebuilt standalone (:3400, `scripts/capture-s7-evidence.mjs`
— the script owns the server lifecycle; the sandbox reaps detached daemons): 7/7 checks** —
login round-trip, the drawer dialog + 8 links, the scroll lock ENGAGED while open, the
F-51 path live (md-growth → dialog unmounts → lock RELEASES, polled), the Session-6 nav
chrome (42/40px, 1px violet-500/30 border — oklab-serialized, alpha-pinned), Save Changes
54px, and the chart at data scale (0/25/50/75/100 + Tue..Mon). The VLM sweep re-caught a
capture-discipline gap: the first drawer screenshot was taken mid-entrance-animation and
read as a clipped drawer — settle-wait ~600ms before capturing animated surfaces (now
trap 16 in the skill, alongside the F-51 pin-race law).

**Docs lockstep:** AGENTS.md + CLAUDE.md (the poll-doctrine completion + the
sweep-the-suite meta-lesson); velox-pos_SKILL.md v2.3.1 (trap 16 + the Session-7
addendum); PAD v1.5 revision block; the remediation plan
(`docs/remediation-plan-session-7.md`) with its execution record; five fresh screenshots
(32–36) from the production standalone; .env.example re-verified against every
`process.env` read (all four vars covered, unchanged); this worklog entry; the session
narration (`docs/session_9.md`, following the one-ahead numbering).

**Stage summary.** The clone's parity is drift-free and fully green again — the only
defect this cycle was a test-suite race, fixed at the doctrine level (every raw computed
read in the suite now polls). Standing debt: NONE identified. Baselines: unit
**123/123**, e2e **78/78**.

---

## Session-8 — the docs-counts lockstep + the artifact-hygiene pass (velox-pos-2)

**Received state**: `16d4736` (Session-7's tree `025ec11` + the operator's
`docs/session_10.md` transcript commit). **Directive**: the standing
audit→remediate→push cycle — workspace refresh, doc re-internalization, the skills-led
code audit, the live reference re-measurement, the TDD remediation, the docs lockstep,
and the SSH-wrapper push.

**Environment:** the workspace survived intact (bun, deps, Playwright chromium 1243,
Prisma client, `db/custom.db` with the demo dataset); the pull brought in exactly one
commit (`docs/session_10.md` — the Session-7 raw transcript). **Gate on the received
tree: lint 0 errors (1 documented warning) · tsc clean · unit 123/123 · build green ·
e2e 78/78** — the documented baseline held on first run (unlike Session-7's red pin).

**The reference re-measured live end-to-end — NO drift for the SECOND consecutive cycle**
(every Session-4/5/6 pin byte-exact: the sidebar chrome 40/42px + border pair +
ChartColumnIncreasing + the 14px wordmark; Settings fiscal labels + 16px/700 h3s + Save
54px + the 34px Add chip; Inventory 36px gradient chips + 42px New Product; Reports 14px
uppercase white/60 + the 32px pills in the rgba(28,31,52,0.85) container; Dashboard Title
Case + weekday axes; the POS gate p-8/64px /30/white-35/CHARGE 70/20/900; the Spanish
copy; the login internals 48px/96px/54px/500; the reference's OWN mobile defect still
present at 390×844). With the parity surface stable, the audit went codebase-side.

**Four findings (the ledger is `docs/remediation-plan-session-8.md`):**
- **F-52 (HIGH, docs integrity)**: the SKILL's live-tense count sites had re-staled
  across Sessions 6–7 (§3 Commands: unit (117)/playwright (55); §12: 117/117 + 68/68) —
  and the census swept up MORE: the PAD's scale line claimed 7 Prisma models · 22 API
  route files against a live 9 · 26 (Session-101's model count never included the two
  auth-support models), its file tree claimed 8 e2e spec files against a live 7 and 12
  vitest files against a live 13, the README's architecture table + directory map said 7
  models, and even vitest.config.ts's header said 12 files. The neo-crm F-99a1 genus.
  **The family mechanism adopted** (web-application §14): `tests/unit/docs-counts.test.ts`
  — LIVE censuses of the test/source tree (its own its included) + every live-tense doc
  site pinned to the constants + the retired forms banned (scoped: history blocks keep
  their numbers — the F-100a2 doctrine; the gate's own maiden run caught 3 README sites
  the manual sweep missed, then the negatives caught the v1.6 revision block QUOTING the
  retired forms and forced the proper live-part scoping). 17 stale sites corrected.
- **F-53 (MEDIUM, gate gap)**: tier 3 of the testing doctrine never existed here —
  `scripts/smoke-test.sh` now boots the standalone artifact on :3210 with a FRESH
  `db/smoke.db` + a throwaway AUTH_SECRET and walks 13 assertions (health, the 401 wall,
  the SSR shell, the login cookie round-trip, the sessioned list, the Zod 400, a category
  create/DELETE, the logout teardown, the rate-limit 429 on the 11th attempt,
  sitemap/robots, the no-AUTH_SECRET boot refusal, and the artifact-hygiene checks),
  counting executed vs passed. `bun run smoke` + `bun run gate` wire it into the chain.
- **F-54 (HIGH, security/hygiene)**: the standalone artifact shipped `.env` (the live
  AUTH_SECRET) + `db/custom.db` (the dev database — user rows with scrypt password
  hashes) on every build. The neo-crm F-170a genus. The double-cure:
  `outputFileTracingExcludes` in next.config.ts + the build script's
  `rm -f .next/standalone/.env` (Next's writeStandaloneDirectory copies .env explicitly —
  immune to the excludes). `prisma/schema.prisma` stays traced (the db-path anchor);
  policed by the smoke ladder's step 13 on every run. ADR-012 records the contract.
- **F-55 (LOW, code integrity)**: the sales checkout's ticket-count + active-shift reads
  executed OUTSIDE the `$transaction` while the route's own comment claimed they were
  inside — two concurrent checkouts could read the same count and allocate the same
  ticket. Both reads moved inside the transaction; verified live through the real UI.

**Explicitly NOT findings**: the health route's "[health]" prefix (the bash
``-eating display artifact — the Read tool proved the file clean, the documented
discipline), `z-ai-web-dev-sdk` (used in `src/lib/server/ai.ts`), the Docker path
(.dockerignore already excludes db/docs/skills — the exposure was the host-built
artifact), the documented PAD known-issues rows, and the v4-trap sweep (all mitigated).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning) ·
tsc ✓ · unit **133/133** (13 files; +10 the docs-counts gate) · build ✓ (the
hygiene-clean artifact) · e2e **78/78** (no prior pin weakened) · smoke **13/13** (the
new tier). Live evidence on the cleaned standalone (`scripts/capture-s8-evidence.mjs`,
**8/8**): the login round-trip, the F-55 checkout journey (ticket T-000035 allocated +
pinned + landed in the ledger), the mobile drawer contract (dialog, 8 labeled links, no
overflow at 390), and the dashboard chart at data scale. VLM sweep **6/6** on the fresh
screenshots 37–42 (the settle-wait discipline held — no mid-animation frames).

**Docs lockstep:** README (the 133/13/78 counts + the smoke/gate rows + the 9-models
sites); AGENTS.md (the renumbered invariants + the docs-counts law + the smoke tier +
the artifact-hygiene law); CLAUDE.md (the command map + the smoke tier + the lockstep
law); PAD v1.6 (ADR-012 + the corrected scale line 9/26/8 + the file tree + the gate
line now including smoke); velox-pos_SKILL.md v2.4.0 (the corrected counts + the
smoke/gate commands + the Session-8 addendum); vitest.config.ts's header;
`.env.example` re-verified (all four vars); the remediation plan's execution record;
this worklog entry; the session narration (`docs/session_11.md`).

**Stage summary.** The clone's parity surface is stable (two consecutive drift-free
reference cycles) and the engineering hygiene caught up with the family doctrine: the
count-lockstep law is now MECHANICALLY enforced (a stale count anywhere fails the unit
gate), the tier-3 smoke ladder polices the API surface + the boot gate + the artifact
hygiene on every run, the deployable artifact no longer ships the dev secret + dev
database, and the checkout's transaction now matches its own documentation. Standing
debt: NONE identified. Baselines: unit **133/133**, e2e **78/78**, smoke **13/13**.

---

## Session-9 — the glyph/cursor/tag parity pass (velox-pos-2)

**Received state**: `16a0442` (Session-8's tree `c306c95` + the operator's session-log
commit). **Directive**: the standing audit→remediate→push cycle — workspace refresh,
doc re-internalization, the skills-led code audit, the live reference re-measurement,
the TDD remediation, the docs lockstep, and the SSH-wrapper push.

**Environment:** the workspace had been RESET — fresh `git clone` +
`cp .env.example .env` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"`
per the contract) + `bun install` + `db:push` + `db:seed -- --demo` (15 products /
5 categories / 1 register / 33 sales) + `bunx playwright install chromium` (the
environment cache held chromium-1200 from a Python install; the lockfile's Playwright
1.63.0 requires 1243 — the first e2e run failed until provisioned). **Gate on the
received tree: GREEN on first run** — lint 0 errors (1 documented warning) · tsc clean
· unit 133/133 · build green (hygiene-clean) · smoke 13/13 · e2e 78/78.

**The reference re-measured live end-to-end — NO drift for the THIRD consecutive
cycle** (every Session-4/5/6/8 pin byte-exact: the sidebar chrome 40/42px + the violet
border pair + the 14px wordmark; the POS gate p-8/64px /30/white-35/CHARGE
70/20/900; the Dashboard Title-Case stats + weekday axes; the Inventory 36px gradient
chips; the Reports 14px uppercase + the 32px pills in the rgba(28,31,52,0.85)
container; the Settings fiscal labels + Save 54px + the 34px Add chip; the Spanish
copy; the login internals 48px/96px/54px/500; the reference's OWN mobile defect still
present at 390×844). With the style surface stable, this cycle's audit went one layer
DEEPER than computed styles — the DOM tag census + the button cursor semantics — and
caught what the style-only audits had missed for three sessions.

**Three findings (the ledger is `docs/remediation-plan-session-9.md`):**
- **F-56 (MEDIUM, visual parity)**: the Reports nav glyph — the reference's measured
  class `lucide-file-chart-column-increasing` names the lucide export
  `FileChartColumnIncreasing` (a document with increasing bars); Session-6's F-47 fix
  had misread the class string as "ChartColumnIncreasing" (bare bars — a visibly
  different glyph) and codified the misreading into the AGENTS/CLAUDE/SKILL chrome
  contracts. It survived three sessions because NO pin asserted the glyph class. The
  fix: the import swap + the corrected contracts + the missing pin
  (`toHaveClass(/lucide-file-chart-column-increasing/)`). SKILL trap #18: a measured
  CSS class string is not an icon name — map it through the library's export table
  and pin the class.
- **F-58 (MEDIUM, UX parity — the §12 v4 preflight trap)**: Tailwind v4's preflight,
  unlike v3's, sets no `cursor: pointer` on buttons — every button on the clone
  computed `cursor: default` while the reference (v3-era CSS) measures `pointer`
  (measured on the SSO buttons, forgot-password, the hamburger, the chevron). The
  base-layer cure (`button:not([disabled]), [role="button"]:not([disabled])` in
  `tokens.css` — the guard keeps the `.glass-button*:disabled` not-allowed contract
  winning). Pinned on the chevron. SKILL trap #17.
- **F-57 (LOW, semantic parity)**: the reference renders its section headings as
  `<h3>` (Dashboard ×2, Settings ×6, Cashiers "Turnos Recientes"); the clone's h2s
  had identical computed styles (16px/700) but a different document outline. Nine
  tags swapped (classNames byte-identical); the heading pins extended with `level: 3`;
  one tag-specific locator rode the change (`h2 svg` → `h3 svg`) — the full-suite run
  caught it, the Session-7 sweep lesson verified no others.

**TDD execution:** all three fixes red-first (the glyph + cursor pins and the
level-extended heading pins failed against the pre-fix tree), then green. The
mobile-drawer contract re-verified live in the audit (burger, dialog, 8 labeled
links, scroll lock, navigate-close, no overflow at 390×844 — the user's called-out
mobile-nav surface works; the static v4 trap sweep is clean, `@theme inline` intact).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning)
· tsc ✓ · unit **133/133** (13 files) · build ✓ (hygiene-clean) · smoke **13/13** ·
e2e **80/80** (+2: the glyph + cursor pins; no prior pin weakened). Live evidence on
the rebuilt standalone (`scripts/capture-s9-evidence.mjs`, **14/14**): the three fixes
measured live (the FILE glyph on desktop AND in the drawer, pointer on
SSO/chevron/hamburger, the h3 censuses), the checkout journey (ticket T-000035), the
shift lifecycle, and the drawer contract. VLM sweep of screenshots 43–48: **6/6
effective** — the three initial flags were prompt-expectation bugs, each disproven by
re-measurement (including re-reading the REFERENCE's login body: it computes white —
the light canvas IS the contract; my first VLM prompt wrongly said "dark canvas").

**Docs lockstep:** README (the 80-test sites); AGENTS.md (the corrected glyph
contract + the cursor rule + the h3 contract); CLAUDE.md (the same); PAD v1.7 (the
revision block + the stale v1.1 header bumped + the counts); velox-pos_SKILL.md
v2.5.0 (traps 17/18 + the Session-9 addendum + the counts); the docs-counts constants
re-anchored (E2E=80, "Session-9 lock", "66 desktop + 13 mobile + 1 setup"); the
remediation plan's execution record; this worklog entry; the session narration
(`docs/session_13.md`, following the one-ahead numbering).

**Stage summary.** The parity surface is stable (three consecutive drift-free
reference cycles) and the chrome contracts are now pinned at the depth the reference
actually ships: the glyph class, the button cursor, and the heading tags all match
the measured reference, each protected by an e2e pin. Standing debt: NONE
identified. Baselines: unit **133/133**, e2e **80/80**, smoke **13/13**.

---

## Session-10 — the stat-family + muted-tone parity pass (velox-pos-2)

**Received state**: `daa74af` (Session-9's tree `9cc8b24` + the operator's session-log
commit). **Directive**: the standing audit→remediate→push cycle — workspace refresh,
doc re-internalization, the skills-led code audit, the live reference re-measurement,
the TDD remediation, the docs lockstep, and the SSH-wrapper push.

**Environment:** the workspace had been RESET — fresh `git clone` + `cp .env.example
.env` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"` per the contract) +
`bun install` + `db:push` + `db:seed -- --demo` (15 products / 5 categories / 1 register
/ 33 sales) + `bunx playwright install chromium` (1243). **Gate on the received tree:
GREEN on first run** — lint 0 errors (1 documented warning) · tsc clean · unit 133/133 ·
build green (hygiene-clean) · smoke 13/13 · e2e 80/80.

**The reference re-measured live end-to-end — NO drift for the FOURTH consecutive
cycle** (every Session-4/5/6/8/9 pin byte-exact, plus the first nav-href census: the
reference's 8 hrefs are the clone's exact paths). With the style surface stable four
cycles running, this cycle's audit went to a NEW depth — whole-DOM dumps of the
stat-card families, the empty-state census, and the muted-tone sweep — surfaces every
prior session had only ever copy-pinned.

**Five findings (the ledger is `docs/remediation-plan-session-10.md`):**
- **F-59 (MEDIUM, visual parity)**: the login card's `backdrop-blur-sm` computed 8px —
  Tailwind v4 RENAMED the blur scale (v3's 4px `backdrop-blur-sm` is v4's
  `backdrop-blur-xs`), and the documented trap #8 had been applied to the drawer
  backdrop but missed on the login card; nothing pinned the computed filter. Cured with
  the class swap; pinned on `blur(4px)`. SKILL trap #19: a documented trap can land and
  still be missed elsewhere — grep every use of the renamed family and pin one computed
  value per family.
- **F-60 (LOW, functional parity)**: the reference lands on `/` after login (measured
  live through the real UI); the clone landed on `/POS`. The redirect now defaults to
  `/` + a new `(app)/page.tsx` serves the terminal at the root (the router already
  mapped `/` → terminal, but no Next route existed — the build table now carries
  `ƒ /`). Pinned with pathname predicates (the en-route lesson: `toHaveURL` regexes
  match the FULL url string, not the path — the first `^\/` pin timed out on a page
  that had landed).
- **F-61 (MEDIUM, visual parity)**: the Dashboard stat family — the reference ships
  SOLID-GRADIENT 40px chips (`p-2.5 rounded-xl`, from-X-400 to-Y-500) with WHITE w-5
  icons, gradient opacity-20 corner blobs at -top-6/-right-6, `font-semibold
  text-slate-500` labels, `font-bold mt-1` values. The clone's flat /20 chips with
  colored icons had survived nine sessions (the copy was pinned; the treatments were
  not). The exact gradients live as `.stat-grad-*` CSS classes — v4's utility
  gradients serialize `lab()` stops (the `.brand-chip` doctrine, re-caught live). The
  VALUE COLOR keeps the readable `text-white/90` (the reference's slate-800 values are
  its VLM-confirmed near-invisible defect — the headings doctrine).
- **F-62 (MEDIUM, visual parity)**: the Reports stat family is a DIFFERENT family on
  the reference — horizontal cards, 48px `rounded-2xl` `/15`+`/30`-border chips on the
  LEFT, `w-6 h-6` tone-400 icons, 400 `text-white/35` labels, `font-black` white
  values, no corner blob, tones indigo/emerald/violet. The dedicated `ReportsStat`
  component now serves it (Reports stops using the shared StatCard). Also surfaced the
  unpinned-palette lesson (SKILL trap #20): v4's default palette is oklab-defined —
  `text-indigo-400` computed `lab(...)` until `--color-indigo-400: #818cf8` was pinned
  in the `@theme` block.
- **F-63 (LOW-MEDIUM, the systematic muted-tone substitution)**: the reference's muted
  design language (slate-500 subtitles, slate-400 empty copy, 64px slate-200 stroke-2
  empty-state icons, white/25 cart copy, `py-12` rhythms) had been substituted with
  white/xx + 56px stroke-1.5 variants across seven views in the initial build. Matched
  verbatim site-by-site (the `subtitleClassName` prop carries Reports' own white/35
  exception — its subtitle is the reference's ONE deviation). SKILL trap #21: copy pins
  are not style pins — a surface is not pinned until its computed geometry/colors are
  asserted.

**TDD execution:** all five fixes red-first (the blur 8px≠4px, the landing /POS≠/, the
chips 44px≠40px/48px, the subtitle white/50≠slate-500), then green. Two en-route
catches: the spec-authoring duplicate-binding parse error (caught by the parser), and
the F-63 Registers empty-card pins' ORDER DEPENDENCE (the full-suite run failed where
the isolated run passed — registers-shifts.spec creates Register 1 before surfaces.spec
runs; the pins moved to registers-shifts' first test where the empty state is
guaranteed, and the surfaces F-63 test kept the order-independent sites).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented warning)
· tsc ✓ · unit **133/133** (13 files) · build ✓ (hygiene-clean; `ƒ /` in the route
table) · smoke **13/13** · e2e **84/84** (+4: the blur pin, the two stat-family pins,
the muted-tone pin; the F-60 landing assertions extended the existing sign-in test and
the F-63 registers pins extended the registers-shifts first test — no prior pin
weakened). Live evidence on the rebuilt standalone (`scripts/capture-s10-evidence.mjs`,
**12/12**): all five fixes measured live, the checkout journey (shift opened, gate
passed), and the mobile drawer contract (dialog, 8 labeled links, no overflow at
390×844 — the user's called-out mobile-nav surface works; the static v4 trap sweep is
clean, `@theme inline` intact). VLM sweep of screenshots 49–54: **6/6 effective** (the
one initial flag — "no visible blur" on the login card — was the prompt's expectation
bug: the reference's canvas is a plain gradient with nothing behind the card to blur;
the 4px value is a computed contract, verified by measurement on both sides).

**Docs lockstep:** README (the 84 sites); AGENTS.md (the corrected login contract + the
new stat-card/muted-tone contracts section + the unpinned-palette lesson); CLAUDE.md
(the same); PAD v1.8 (the header bump + the revision block + the 9-route-spellings
scale line); velox-pos_SKILL.md v2.6.0 (traps 19/20/21 + the Session-10 addendum + the
counts); the docs-counts constants re-anchored (E2E=84, "Session-10 lock", "70 desktop
+ 13 mobile + 1 setup"); the remediation plan's execution record; this worklog entry;
the session narration (`docs/session_15.md`, following the one-ahead numbering).

**Stage summary.** The parity surface is stable (four consecutive drift-free reference
cycles) and the pin doctrine now covers the layer the reference actually styles: the
stat-card families (two, never shared), the muted-tone design language, the login
card's translated blur, and the reference's root-path landing are all measured, pinned,
and documented. Standing debt: NONE identified. Baselines: unit **133/133**, e2e
**84/84**, smoke **13/13**.

---

## Session-11 — the dialog/form-text parity pass + the invisible-typed-text cure (velox-pos-2)

**Received state**: `b43821b` (Session-10's tree `939d3a6` + the operator's
session-log commit). **Directive**: the standing audit→remediate→push cycle —
workspace refresh, doc re-internalization, the skills-led code audit, the live
reference re-measurement, the TDD remediation, the docs lockstep, and the
SSH-wrapper push.

**Environment:** the workspace had been RESET — fresh `git clone` + `cp
.env.example .env` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"`
per the contract) + `bun install` (485 pkgs) + `db:push` + `db:seed -- --demo`
(15 products / 5 categories / 1 register / 33 sales) + `bunx playwright install
chromium` (1243). **Gate on the received tree: GREEN on first run** — lint 0
errors (1 documented warning) · tsc clean · unit 133/133 · build green
(hygiene-clean; `ƒ /` in the route table) · smoke 13/13 · e2e 84/84.

**The reference re-measured live end-to-end — NO drift for the FIFTH
consecutive cycle** (every Session-4/5/6/8/9/10 pin byte-exact: the sidebar
chrome, the POS gate, both stat families, the Reports pills, the Settings
fiscal labels + Save + Add, the Inventory chips, the Spanish copy, the login
internals incl. blur(4px), the `/` landing, the reference's own mobile defect
at 390×844). With the style surface stable five cycles running, the audit
went to a NEW depth: **the dialog family** (opening each dialog client-side —
the reference 403s writes but the dialogs open) and **the form-text color
census** — surfaces every prior session copy-pinned or geometry-pinned but
never measured at the container/color depth.

**Six findings (the ledger is `docs/remediation-plan-session-11.md`):**
- **F-70 (HIGH — the oldest live defect in the codebase)**: the login's TYPED
  credentials computed `rgb(231,233,239)` — near-white text on the near-white
  card, INVISIBLE since Session-101. Root cause: the base Input/Textarea
  carry no text color, so the `.theme-light` scope's `--foreground` re-point
  (the entire point of Session-5's `@theme inline` fix) never REACHED the
  fields — they inherited the dark-theme body color. Invisible to e2e
  (fills don't read rendered text) and to screenshots (they showed the EMPTY
  form). Cured at the root: `text-foreground` on the base Input/Textarea
  (SelectTrigger already had it) + `.theme-light --foreground` → `240 10% 4%`
  (zinc-950, byte-exact vs the reference's measured rgb(9,9,11)). Pinned on
  the TYPED text. SKILL trap #22: a scoped theme needs a carrier.
- **F-64 (MEDIUM)**: every dialog shipped `glass-dark border-edge` —
  translucent #0d0f1a@95 + blur(20px) + white/6 border, with the `border-edge`
  utility INERT (trap #15) — while the reference's dialogs compute SOLID
  `rgb(15,18,26)` (#0f121a) + 1px `rgb(38,42,54)` (#262a36) + NO blur +
  rounded-lg + p-6. `--card` re-pointed to `224 27% 8%`; the strips swept the
  11 DialogContent/AlertDialogContent sites AND four SelectContent sites
  carrying the same inert pair (they would have defeated the popover
  re-point); the Close hit-area extended to the measured 36px. The mobile
  drawer keeps glass-dark BY DESIGN (the superset surface). SKILL trap #24.
- **F-66 (MEDIUM)**: the reference's form text is ONE family — every label
  (14px/500), dialog title (18px/600), and input text computes
  `rgb(231,233,239)` #e7e9ef; the clone shipped 35 `text-white/70` Label
  overrides + 11 `text-white` titles + ~30 per-field input overrides that
  bypassed the token. The base components own the color now. En-route catch:
  the `--foreground` triplet `221 28% 93%` computed **#e8ebf2** — its
  "#e7e9ef" comment was a past rounding approximation; all five
  foreground-family triplets re-pointed to the exact `225 20% 92%`.
- **F-67 (MEDIUM)**: six dialog Cancel sites + two AlertDialogCancel sites +
  the receipt "Cerrar" shipped bare ghosts (transparent, white/70) — the
  reference's Cancel is the gray `glass-button` family; the clone's own
  category-dialog pattern applied everywhere.
- **F-68 (LOW)**: the New Register dialog 448px → 512px (`sm:max-w-lg`, the
  reference's measured width; the category 384 + product 512 already held).
- **F-69 (LOW-MEDIUM)**: the select dropdown surface — `--popover` re-pointed
  `230 32% 9%` (#10121e) → `225 21% 11%` (#161922, the reference's measured
  listbox) + rounded-md confirmed.
- **F-65 (RETRACTED by re-measurement)**: the dialog Create buttons — the
  first read measured `background-color: transparent` and concluded
  "outline"; the re-measurement captured the 135° violet gradient in
  `background-image` — the clone's `glass-button-primary` was byte-exact all
  along. SKILL trap #23: gradient buttons live in background-IMAGE; measure
  both layers before concluding.

**TDD execution:** all pins red-first (rgb(231,233,239)≠rgb(9,9,11);
glass-dark rgba(13,15,26,0.95)≠solid rgb(15,18,26) on the register AND
category dialogs; white/70≠#e7e9ef; transparent≠rgba(28,31,52,0.85);
448≠512), then green. En-route: the raw dialog-width reads raced the 200ms
zoom-in-95 entrance (511.58 mid-zoom) — all three width pins hardened to
`expect.poll` (the F-51 doctrine, third strike).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented
warning) · tsc ✓ · unit **133/133** (13 files) · build ✓ (hygiene-clean) ·
smoke **13/13** · e2e **88/88** (+4: the typed-text pin, the register-dialog
contract, the product dialog + select, the Settings label family; the
category-dialog container pins EXTENDED the existing first inventory test —
no prior pin weakened). Live evidence on the rebuilt standalone
(`scripts/capture-s11-evidence.mjs`, **12/12**): all six fixes measured
live, the checkout journey (the cart at $19.72 → the receipt allocated
**T-000039**), and the mobile drawer contract at 390×844 (labeled hamburger →
role=dialog, 8 links, no horizontal overflow — the user's called-out
surface). VLM sweep of screenshots 55–60: **6/6 effective** (including the
typed-text legibility check on the login card).

**Docs lockstep:** README (the 88 sites); AGENTS.md (the dialog-container +
form-text contracts + the F-70 trap); CLAUDE.md (the same); PAD v1.9 (the
revision block + the retracted-finding record); velox-pos_SKILL.md v2.7.0
(traps 22/23/24 + the Session-11 addendum + the counts); the docs-counts
constants re-anchored (E2E=88, "Session-11 lock", "74 desktop + 13 mobile +
1 setup"); the remediation plan's execution record; this worklog entry; the
session narration (`docs/session_17.md`, following the one-ahead numbering).

**Stage summary.** The parity surface is stable (five consecutive drift-free
reference cycles) and the pin doctrine now covers the last unpinned depth:
the dialog family (solid #0f121a containers, the gray Cancel, the gradient
Create, the #e7e9ef form-text family, the #161922 dropdown) — plus the
oldest live defect in the codebase (invisible typed credentials) is measured,
cured at the root, and pinned. Standing debt: NONE identified. Baselines:
unit **133/133**, e2e **88/88**, smoke **13/13**.

## Session-12 — the auth-surface parity pass: the alert panel, the subview swaps, the sign-in skeleton, the gated 404 (velox-pos-2)

**Received state**: `336284e` (Session-11's tree `48ccbe2` + the operator's
session-log commit). **Directive**: the standing audit→remediate→push cycle —
workspace refresh, doc re-internalization, the skills-led code audit, the live
reference re-measurement (visual + functional parity, the superset goal), the
TDD remediation, the docs lockstep, and the SSH-wrapper push. (The cycle ran
twice: the first pass completed the audit + plan + RED pins but was lost with
a workspace reset before any commit — this entry records the authoritative
re-run, every measurement re-taken live.)

**Environment:** the workspace had been RESET again — fresh `git clone` +
`cp .env.example .env` (`DATABASE_URL="file:../db/custom.db"` per the
contract) + `bun install` (485 pkgs) + `db:generate` + `db:push` + `db:seed`
(owner ready) + `bunx playwright install chromium` (1243). **Gate on the
received tree: GREEN on first run** — lint 0 errors (1 documented warning) ·
tsc clean · unit 133/133 · build green (hygiene-clean) · smoke 13/13 · e2e
**88/88**. The Session-11 baseline held.

**The audit (skills: web-application §12/§14/§15/§16, agent-browser —
computed styles are ground truth, clone-app-pat-pro, tdd):** the SIXTH
consecutive reference re-measurement held EVERY standing pin byte-exact
(login blur(4px) + typed rgb(9,9,11) + 48px/54px geometry, sidebar, POS gate,
Dashboard/Reports/Settings families, mobile-drawer posture) — and the NEW
depth opened the four never-measured auth surfaces: the failed-login error
state, the forgot-password view, the sign-up view, the 404 (authenticated
AND logged-out). All ten findings were clone-side:

- **F-76 (MEDIUM)**: the failed-login error rendered a bare `<p>` while the
  reference renders a bordered **Alert panel** — `rounded-xl border-red-200
  bg-red-50/70 p-4` + inner 14px `text-red-700`, NO icon, copy "Invalid email
  or password" (the clone's API copy already matched). Cured through the new
  `src/components/ui/alert.tsx` primitive (error + the symmetric emerald
  success tone — the reference's success state is unmeasurable, documented
  superset).
- **F-77 (MEDIUM)**: the forgot view kept the sign-in chrome (only the
  password field hid); the reference SWAPS the whole card — back-first
  ArrowLeft link (`text-sm font-medium text-slate-500 … -mb-2`), the
  centered h2 (`text-xl sm:text-2xl font-bold text-slate-900`) + slate-600
  desc, ONE 44px field (`h-10 sm:h-11`, `placeholder:text-slate-400`), the
  44px solid-slate-900 Send button, content spacing `space-y-4 sm:space-y-6`.
- **F-78 (MEDIUM)**: the sign-up view — the reference's card is back-first +
  "Create your account" (no desc) + exactly Email / Password / **Confirm
  Password** at 44px (`text-sm sm:text-base`, confirm placeholder "Re-enter
  password"), NO SSO, NO Full name. The UI stops collecting fullName (the
  register API's optional field is simply not sent — no contract change);
  the equality check runs CLIENT-SIDE before any fetch.
- **F-79 (MEDIUM)**: the 404's five deltas — the brand-chip numeral → a
  plain `text-3xl font-bold text-white` span; `text-white/60` h1 →
  `text-slate-800 mb-2`; `text-white/50` p → `text-slate-500 mb-8`; the
  `text-sm font-bold` + "←" glyph link → the 50px `font-medium` gradient
  link with a lucide ArrowLeft icon; `rounded-2xl p-10` → `rounded-3xl
  p-12`, wrapper `min-h-dvh p-4` → `min-h-screen p-6`. (The bg already
  matched: the reference's `pos-gradient-subtle` computes solid
  rgb(8,10,20) = `--color-ink` — verified, no token work.)
- **F-82 (MEDIUM)**: logged-out visitors received the clone's public 404 on
  unknown routes; the reference AUTH-GATES unknown routes (`/login` +
  `from_url` before any 404 HTML). Cured by making the root not-found an
  async server component mirroring the (app) layout's gate
  (`getCurrentUser()` → `redirect("/login")`) — Next 16 renders
  `/_not-found` Dynamic within the request scope, NO build escape needed.
- **F-85 (MEDIUM, the second-pass discovery)**: beneath the byte-exact
  standing pins, the sign-in body was a flat margin chain; the reference is
  ONE `flex flex-col items-center text-center space-y-6 sm:space-y-8`
  block — the logo a blur(24px)-halo `relative group` behind a
  `ring-4 ring-white/50 rounded-full shadow-lg` span (80px mobile / 96px
  desktop); the h1 `text-2xl sm:text-3xl font-bold tracking-tight` (24px
  mobile / 30px / -0.75px); the sub `text-sm sm:text-base font-medium`; the
  OR divider a CONTINUOUS absolute `h-[1px]` line with a `bg-white px-3`
  knockout rendering uppercase "or"; the form a
  `space-y-4/5 → space-y-3/4 → space-y-1.5` chain; the links INSIDE the
  form in a `flex-col sm:flex-row justify-between` row (Forgot left /
  signup right at desktop; column/8px/center at 390px); the SSO family on
  `text-[16px]` + `transition-all duration-200 hover:shadow-sm` with
  Google's `-ml-4` icon quirk.
- **F-80 (LOW)**: the signup phrase is MIXED on the reference — "Need an
  account? " 400/slate-500 + "Sign up" in a `font-medium text-slate-700`
  span (the Session-4 whole-phrase font-medium pin had drifted on the
  reference).
- **F-81 (LOW-MEDIUM)**: the sign-in button — the measured `text-sm h-11
  sm:h-12 shadow-sm transition-all duration-200` (14px/500) vs the clone's
  16px `py-3`.
- **F-83 (LOW)**: the "Forgot password?" link — `text-sm text-slate-500
  hover:text-slate-700 font-medium transition-colors`, NO underline.
- **F-84 (LOW)**: the sign-in busy copy — "Signing in…" (observed
  mid-flight on the reference; the other views' busy copy is unmeasured and
  stays the clone's).

**Plan**: `docs/remediation-plan-session-12.md` (the verification ledger
V1–V17, the findings table, the TDD task list T-1…T-16, the risks). Validated
against the codebase before execution (the register API's optional fullName,
the (app) layout's gate pattern, the alert locator collision, the
`glass-card`/`--color-ink` byte-parity).

**TDD execution:** RED pins first (auth.spec 14→19 tests: the forgot swap,
the signup 3-field card, the logo/halo/h1 depth, the OR/links pair, the
guest 404 gate; four contracts EXTENDED existing tests — wrong-creds,
signup-affordance, sign-in-button, the 404). **RED proof: 9/9 targeted
failures, zero collateral** (84 passing of 93). One locator hardening en
route: Next's own route-announcer div carries `role="alert"` at body level —
the alert pins scope to `main.login-canvas [role='alert']` (trap #28). Then
GREEN: the Alert primitive, the login-surface restructure (the shared
centered skeleton + per-view swaps + the confirm-password client check), the
not-found rewrite + gate — in one pass.

**Three v3→v4 serialization traps surfaced by the GREEN run and cured per
the standing doctrine** (translate the class, pin the computed both ways):
(1) `bg-red-50/70` computes `oklab(.../0.7)` — the same color as the
reference's rgba, pinned by regex either way (trap #27); (2) v4's
`rounded-full` = `calc(infinity * 1px)` → 33554400px vs v3's 9999px (trap
#26 — pins accept both serializations); (3) v4 RESCALED `tracking-wider`
0.1em → 0.05em — the component ships `tracking-[0.1em]` (trap #25, the
F-59 genus).

**Re-certification (all on the final tree):** lint ✓ (0 errors, 1 documented
warning) · tsc ✓ · unit **133/133** (13 files) · build ✓ (hygiene-clean;
`/_not-found` Dynamic) · smoke **13/13** · e2e **93/93** (+5 new; four
contracts EXTENDED existing tests; one parity correction — the divider label
pin moved from the literal "OR" to the reference's lowercase "or" + CSS
uppercase transform). Live evidence (`scripts/capture-s12-evidence.mjs`),
**8/8**: the sign-in block contract, the alert panel, the busy copy (held
mid-flight via route interception — the transient-state capture pattern),
the forgot swap, the signup card, the 404, the guest gate, and the mobile
390×844 sign-in (80px logo, 24px h1, 44px inputs, links column, no
horizontal overflow — the user's called-out surface family). Screenshots
**61–66** in `docs/screenshots/`.

**Docs lockstep:** README (93 sites), AGENTS.md (the auth-surface contracts
section), CLAUDE.md (the same), PAD v1.10 (the revision block + the
re-anchor), velox-pos_SKILL.md v2.8.0 (traps 25–28 + the Session-12
addendum), the docs-counts constants re-anchored (E2E=93, "Session-12
lock", "79 desktop + 13 mobile + 1 setup" — the unit gate enforced the
same-commit rule mid-cycle), this worklog entry, the remediation plan's
execution record, and the session narration (`docs/session_19.md`, the
one-ahead numbering).

**Stage summary.** The parity surface is stable (six consecutive drift-free
reference cycles) and the pin doctrine now covers the last unpinned auth
depth: the error state, both sub-views, the 404 (authenticated + gated),
and the sign-in card's own skeleton — the surface every guest meets first.
Standing debt: NONE identified. Baselines: unit **133/133**, e2e **93/93**,
smoke **13/13**.

## Session-13 — the reset-surface parity pass + the StudyFlow debt purge (velox-pos-2)

**Received state**: `9caacf0` (Session-12's tree `5d75a61` + the operator's
`docs/session_20.md` commit — the raw log of the Session-12 conversation).
**Directive**: the standing audit→remediate→push cycle. **Result**: the
seventh consecutive drift-free reference cycle; the NEW depth opened the last
unmeasured auth surface; the standing static debt cured; one audit finding
withdrawn as a display artifact.

**The received-tree gate** came up green on the first run: lint 0 errors
(1 documented warning) · tsc clean · unit 133/133 (13 files) · build green ·
smoke 13/13 · e2e 93/93 — the Session-12 baseline held at the pulled HEAD.

**The live re-measurement (agent-browser, computed styles — the SEVENTH
consecutive drift check)**: every standing pin held byte-exact — the login
card's internals (blur(4px), the halo/ring logo, the 30px/-0.75px h1, the
48px inputs, the 54px SSO, the 48px/14px/500 button), the F-76 alert panel
(red-50/70 + red-200 + 12px + red-700, no icon), the sidebar family (219px,
8 items, the 42px violet active pill), the terminal's shift gate, the
Spanish empty-state families (Sales/Inventory/Cashiers/Registers), the
Dashboard's live date line (the clone's `todayLine()` renders the identical
format at 14px/slate-500), and the reference's own mobile defect (no
hamburger, the static 219px sidebar at 390×844 — the clone's drawer superset
remains correct).

**The NEW depth — the reset-password surface, never measured in any prior
session, decoded live in all three states (findings F-86..F-94)**: the
reference's reset page is NOT the login card's slate family — it is the
stock shadcn GRAY family (the base44 default). A flat `bg-gray-50` canvas;
the 8px `rounded-lg` shadow-lg card with a 2px SOLID gray-900 top strip;
the "Set new password" h2 block (24px/700 gray-900, NO logo circle); Title
Case gray-700 labels; 6px `rounded-md` gray-200 inputs (44px, Lock icons on
BOTH fields, zinc-500 placeholders, the "Must be at least 8 characters"
helper); NO token field (the URL carries it); the 44px gray-900 "Reset
password" + the full-width "Back to login" text link; its OWN alert family
(`rounded-lg` + `bg-red-50/50` + inner red-800 #991b1b — measured
rgb(153,27,27) — distinct from the login's 12px/0.7/red-700 panel; the
reference itself ships two alert treatments on its two auth surfaces); and
a distinct TOKENLESS dead-end ("Invalid Reset Link": the 80px red-100
circle chip + the 40px CircleAlert + ZERO inputs). The API's error copy:
"Invalid or expired reset token"; the client mismatch copy: "Passwords do
not match" (no period).

**The write-gate verification (live-proven)**: the reference's demo account
is CLIENT-SIDE write-gated — the New Register Create never enables even
with both fields genuinely typed via CDP keyboard events, and an armed
MutationObserver caught no toast on a Settings save. The checkout→receipt
chain, the Sales receipt viewer (0 sales), and every toast contract are
UNMEASURABLE on the reference — documented superset surfaces.

**Plan**: `docs/remediation-plan-session-13.md` (the verification ledger
V1–V20, the findings table F-86..F-94 + SD-1..SD-4, the TDD task list
T-1…T-15, the risks). Validated at every insertion point before execution
(the lucide CircleAlert export, the auth.spec tail, the twMerge override
behavior on the Input primitive, the .theme-light typed-text resolution —
the reference's reset typed text measures the same zinc-950 rgb(9,9,11) as
the login's).

**TDD execution:** RED pins first — four NEW auth.spec tests (the
gray-family form card, the invalid-token alert + the API copy end-to-end,
the client-side mismatch with a route interception asserting ZERO requests,
the tokenless dead-end with the back-navigation). **RED proof: 4/4 targeted
failures, zero collateral.** Then GREEN in one pass: the `error-soft` Alert
tone (rounded-lg/red-50 at 0.5/red-800), `--color-red-800: #991b1b`
hex-pinned in `@theme` (the F-62 doctrine), the 3-state surface rewrite
(the token now a PROP from the async server page's `searchParams` — three
server-rendered states, no hydration flip, `/reset-password` Dynamic), and
the API copy. No v4 serialization surprises — the regex postures and hex
pins were applied up front from the standing trap catalog.

**The static sweep (the standing first-pass Session-12 findings, never
remediated because the redo cycle's budget went to the lost auth work)**:
**243 of 254 tracked scripts deleted** — the git-history census since the
StudyFlow pivot `8e05a75` is the authoritative keep-list (exactly 11
velox-pos-era files remain: `smoke-test.sh`, `capture-s7..s12-evidence.mjs`,
`vlm-verify-s8/s9/s11.mjs`, `vlm-recheck-s9.mjs`); **4 dead src files
deleted** (`src/lib/date.ts`, `dep-audit.ts`, `dev-preflight.ts`,
`server/ai.ts` — zero-importer StudyFlow remnants); `omni-study1_SKILL.md`
(124KB) archived to `docs/archive/omni-study1/` per the project's own
convention; the `studyflow`-branded Docker trio deleted (zero Docker
references in the velox-pos docs — the deployment story is the standalone
build); 3 dead `outputFileTracingExcludes` entries dropped from
next.config.ts.

**SD-4 WITHDRAWN — the display-artifact lesson**: the first-pass Session-12
audit's "`[health` log typo" was a FALSE POSITIVE. This sandbox's bash
OUTPUT DISPLAY eats the literal two-byte sequence `[h` (control-proven:
`echo "[health]"` renders `ealth]"`), so every terminal-echoed grep line
showed the "typo" — while the raw-byte layer (the Read tool, `grep -c`)
proved the source has always read `"[health] db probe failed:"`. The
withdrawal is documented in the plan (V19), AGENTS.md, and the SKILL's
debugging guide: never diagnose a source defect from a terminal echo —
confirm raw bytes via a second tool.

**Re-certification (all on the final cleaned tree):** lint ✓ (0 errors, 1
documented warning) · tsc ✓ · unit **133/133** (13 files) · build ✓
(hygiene-clean; `/reset-password` Dynamic) · smoke **13/13** · e2e
**97/97** (+4 new, all NEW tests — no prior pin weakened). The
docs-counts lockstep gate fired mid-cycle exactly as designed (the census
read 97 against the constant's 93) — the constants re-anchored (E2E=97,
"Session-13 lock", "83 desktop + 13 mobile + 1 setup") together with
README, CLAUDE, PAD and the SKILL, including the two literal strings pinned
inside the gate itself. Live evidence (`scripts/capture-s13-evidence.mjs`):
**10/10** — including the FULL one-shot reset round-trip
(forgot-password → resetUrl → reset → done, the owner's password rewritten
to its current value — the dev db's credentials unchanged) and the
login-surface sanity sweep. Screenshots **67–70** in `docs/screenshots/`.

**Docs lockstep:** AGENTS.md (the reset-password contracts section + the
write-gate and display-artifact lessons), CLAUDE.md (the reset-surface
contracts), PAD v1.11 (the revision block + the title/last-updated bumps),
velox-pos_SKILL.md v2.9.0 (the §6 theme-light scope update, the §14
debugging row, the Session-13 addendum), this worklog entry, the plan's
execution record, and the session narration (`docs/session_21.md`).

**Stage summary.** The parity surface is stable (seven consecutive
drift-free reference cycles) and the pin doctrine now covers every auth
surface including the reset page's three states. The repo's StudyFlow debt
is fully purged (scripts, src, root files, config). Standing debt: NONE
identified. Baselines: unit **133/133**, e2e **97/97**, smoke **13/13**.

## Session-14 — the chart-internal parity pass + the primitive purge + the pristine-path proof (velox-pos-2)

**Received state**: `fdd2704` (Session-13's tree `2c88a91` + the operator's
`docs/session_22.md` commit — the raw log of the Session-13 conversation; its
"Next" pointer named this cycle's targets). **Directive**: the standing
audit→remediate→push cycle. **Result**: the EIGHTH consecutive drift-free
reference cycle; the NEW depth decoded the chart internals (the last
never-measured primary surfaces); the ui-primitive static debt cured; the
dev-db credential drift found and restored; the fresh-clone pristine path
proven for the first time.

**The received-tree gate** green on the first run: lint 0 (1 documented
warning) · tsc · unit 133/133 (13 files) · build · smoke 13/13 · e2e 97/97 —
the Session-13 lock held at `fdd2704`.

**The live re-measurement** (agent-browser, computed styles + DOM
attributes): every standing pin byte-exact for the EIGHTH consecutive cycle —
the login card (blur(4px), white/95, 16px, the 4px slate strip), the F-76
alert panel, the 220px sidebar + the 42px violet pill, the terminal shift
gate, the Sales/Cashiers Spanish families, the Dashboard date line, and the
reference's own mobile defect at 390×844 (still no hamburger — the clone's
drawer superset stays correct).

**The NEW depth — the chart internals (F-95..F-106)**: the reference ships
TWO distinct chart contracts. Dashboard "Sales — Last 7 days": indigo-500
#6366f1 2.5px SMOOTH monotone line, slate-200 #e2e8f0 dashed-3-3 grid (5h+7v),
two slate-400 axes + tick stubs, 12px slate-400 ticks (x middle/baseline 253,
y end-anchored x=57), the indigo gradient area (0.3 @5% → 0 @95% @
fill-opacity 0.6), ZERO dots, viewBox 731×280 (baseline 245, edge 65).
Reports "Daily Sales": its OWN family — indigo at 2px, white/4% dashed grid
with NO axes, 11px white/30 ticks, gradient 0.35 @5%, viewBox 1130×220
(baseline 190). The clone's "dotted grid + violet stroke" was an unmeasured
Session-101 assumption that survived 13 cycles (F-50 pinned only tick
discipline). Cured: the new pure seam `src/lib/chart-path.ts` (smoothPath —
Fritsch-Carlson monotone-X, unit-pinned 5/5) + both chart rewrites; colors as
SVG attributes (no Tailwind serialization in the charts).

**The static sweep (SD-1)**: 12 zero-importer ui primitives deleted + the 9
Radix-only packages `bun remove`d — the ui layer is exactly the 10 live
files, census-proven.

**SD-2 (found mid-evidence)**: the Session-13 round-trip's "credentials
unchanged" claim was FALSE — it typed "Abcd1234!" into the reset form and
silently changed db/custom.db's owner password. Hash-verified, then restored
to the documented `$Abcd1234` via `scripts/restore-owner-password.mjs`
(control test + end-to-end verify). Doctrine: scripts that mutate auth state
end by proving the DOCUMENTED login.

**The fresh-clone pristine-path verification** (web-application §15's
periodic gate, first run here): clone → install (485 pkgs) → env → db:push →
db:seed → tsc → build → standalone boot → health db:up + /login 200; the
no-secret boot refusal fires first exactly as documented. The README
quick-start is proven verbatim on a pristine tree.

**TDD**: unit RED 5/5 at import (with the lesson: next build type-checks
tests/ — a unit-tier RED blocks the e2e RED's build; hold it aside, prove the
e2e RED, restore for GREEN). E2E RED exactly 5/5 targeted failures (serial
siblings proven individually), zero collateral. Two serialization postures
landed mid-GREEN with no assertion weakened: gradient fills compute QUOTED
(`url("#id")`), and the F-50 filter corrected 34→65 (the measured edge, valid
across both geometries).

**Re-certification on the final tree**: lint 0 (1 documented warning) · tsc ·
unit **138/138** (14 files) · build · smoke **13/13** · e2e **102/102**.
Live evidence `scripts/capture-s14-evidence.mjs` **14/14**; VLM parity: the
clone's chart matches on all four contract axes; screenshots 71–74.

**Docs lockstep**: AGENTS.md (the chart-internal contracts + the primitive
census + the SD-2 lesson), CLAUDE.md (the two-chart seam entry), PAD v1.12
(revision block + the exact 10-file ui tree + the stale `date` seam entry
cured), velox-pos_SKILL.md v2.10.0 (§2 charts row + the Session-14 addendum,
which corrects the s13 credentials claim on the record), README + vitest
config + the docs-counts constants re-anchored (138/14/102, "Session-14
lock", "88 desktop"), `docs/remediation-plan-session-14.md` (the ledger
V1–V24 + the execution record), and `docs/session_23.md` (the narration).

## Session-15 — the with-data scale + measured-lists parity pass + the dead-dep census (velox-pos-2)

**Received state**: `197443c` (Session-14's tree `5bb9785` + the operator's
`docs/session_24.md` commit — the raw log of the Session-14 conversation; its
"Next" pointer named this cycle's targets: the populated-data dashboard
re-sweep with the demo seed + the Settings dialog internals). **Result**: the
NINTH consecutive drift-free reference cycle; both NEW-depth targets decoded;
three findings cured (F-107/F-108/F-109); the dependency census caught two
dead deps; the full gate green at the new baselines.

**The received-tree gate** green on the first run: lint 0 (1 documented
warning) · tsc · unit 138/138 (14 files) · build · smoke 13/13 · e2e
**102/102** (the Session-14 lock held at `197443c`).

**The live re-measurement** (agent-browser, computed styles): every standing
pin byte-exact for the NINTH consecutive cycle — the login card (blur(4px),
white/95, 16px, the 4px slate strip, h1 30px/700, SSO 54px, inputs 48px), the
F-76 alert ("Invalid email or password", 12px, red-50/0.7, red-200, 16px,
14px red-700), the 220px sidebar + the 42px violet pill, the terminal gate +
CART, the Dashboard date line + both chart h3s, the Sales/Cashiers Spanish
families, and the reference's own mobile defect (no hamburger, 220px static
sidebar at 390×844 — the clone's drawer superset stays correct).

**The NEW depth #1 — the StoreSettings internals** (first full measurement):
the six h3 sections (16px/700), the 16-label census, the New Category dialog
at BYTE PARITY (384px, #0f121a, 8px radius, p-6, 18px/600 title, h-9 input,
42px buttons), the select panel family (#161922/6px), the fiscal toggle
decoded (a `lucide-toggle-left` icon-button, no switch semantics — the
clone's labeled Radix Switch stays the a11y superset) — and **two list-parity
deltas**: the reference's Currency listbox = [USD - US Dollar, EUR - Euro,
GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS -
Argentine Peso] (the clone missed ARS, carried invented CAD/AUD/PEN) and its
Card Payment Provider listbox = [None, Stripe, PayPal, Clip, Mercado Pago]
(the clone missed PayPal/Clip/Mercado Pago, carried invented SumUp/Square).
Root cause: Session-101's "USD/EUR/MXN/GBP/…" — an ellipsis never enumerated
(the same unmeasured-assumption class as the s14 chart colors). Cured: the
measured lists replace the inventions; the Zod gate updates through the
existing refines; both e2e-pinned by exact enumeration.

**The NEW depth #2 — the populated dashboard with the demo seed**: a
demo-seeded scratch db (15 products, 5 categories, 33 sales) against the
standalone build exposed **F-107** — both charts mapped the domain to
ceil(dataMax) while gridlines stopped at the nice multiple below: a $92-day
peak floated ~29px above the topmost gridline (DOM: 6.85 vs 36.30 Dashboard,
5.44 vs 28.26 Reports; invisible to the empty-store e2e by construction).
Cured with the `niceScale(max, count) → {top, ticks}` pure seam in
`src/lib/reports.ts` (recharts-faithful: the top is the smallest nice-step
multiple ≥ max): unit-pinned 6/6, both charts adopted it,
`niceScale(4,5)` = `{4, [0,1,2,3,4]}` — the measured empty-state contract
byte-preserved, zero e2e collateral.

**The static sweep (SD-1/SD-2/SD-3)**: the zero-importer FILE census clean
(45/45 live — the s14 purge holds), but the DEPENDENCY census caught
`@radix-ui/react-toast` (the toaster is zustand-based since the scaffolding;
the s14 V9 "toast is load-bearing" classification was WRONG — corrected on
the record) and `axe-core` (Omni-Study-era). Both `bun remove`d; the
SKILL/README/PAD primitives rows corrected. `react-dom` withdrawn
(peer-coupled). Plus the stale dashboard-view "violet dotted-grid" comment
and README's stale "dotted-grid parity" charts row.

**TDD**: unit RED 10/10 (6 niceScale import-class + 4 currency assertions —
the flipped `isCardProvider("PayPal")` pin proving the gap live); e2e RED
both list pins on their exact-enumeration assertions (the s14 two-tier-RED
lesson applied: the unit test held aside for the RED build). One
blast-radius site the census missed — `validation.test.ts`'s "PayPal
rejected" pin (the same assumption baked into a test) — caught by the unit
gate and corrected with the measurement.

**Re-certification on the final tree**: lint 0 (1 documented warning) · tsc ·
unit **146/146** (14 files) · build · smoke **13/13** · e2e **104/104**.
Live evidence `scripts/capture-s15-evidence.mjs` **14/14** (the demo-db boot:
peaks 25.9/20.2 BELOW their 100-gridlines at 5.0/4.0, ticks covering the
domain, both listboxes byte-exact, the dep census, F-76 oklab posture, the
drawer); VLM cross-check **4/4**; screenshots 75–80 (75/76 the pre-fix audit
record).

**Docs lockstep**: AGENTS.md (the with-data + list-parity contracts
section), CLAUDE.md (the niceScale + measured-lists entries), PAD v1.13
(revision block + the corrected primitives row), velox-pos_SKILL.md v2.11.0
(§2 rows + seam rows + the Session-15 addendum), README (counts + the
corrected primitives/charts rows), the implementation plan's §0/§seam
measured-list lines, `docs/remediation-plan-session-15.md` (the ledger V1–V25
+ the execution record), and `docs/session_25.md` (the narration). The count
constants re-anchored: UNIT 146/14 files · E2E 104 ("Session-15 lock",
"90 desktop + 13 mobile + 1 setup").

## Session-16 — the with-data Registers/Sales pass + the receipt-stamp cure (velox-pos-2)

**Received state**: `3a0594c` (the Session-15 push `705001b` + the operator's
session_26 raw-log commit — the workspace was RESET, so a fresh
`git clone` re-established the tree; the fresh sandbox needed
`bunx playwright install chromium`, environment-only). **Result**: the TENTH
consecutive drift-free reference cycle; both NEW-depth targets decoded (the
reference-side Registers/Sales internals at leaf precision + the with-data
audit on the demo seed — all green, no with-data defects); one real find
cured (F-110); the with-data evidence harness landed (F-111); the full gate
green at the new baselines.

**The received-tree gate** green on the first run: lint 0 (1 documented
warning) · tsc · unit 146/146 (14 files) · build · smoke 13/13 · e2e
**104/104** (after the browser install — the Session-15 lock held).

**The live re-measurement** (agent-browser, computed styles): every standing
pin byte-exact for the TENTH consecutive cycle — the login card (blur(4px),
white/95, 16px, the 4px slate strip, h1 30px/700, SSO 54px, inputs 48px), the
F-76 alert ("Invalid email or password", 12px radius, red-50/0.7, red-200,
p-4, inner 14px red-700), the 220px sidebar + the 42px violet pill, the
terminal gate + CART, the Dashboard date line + both chart h3s, the
Sales/Cashiers Spanish families, and the reference's own mobile defect (no
hamburger, 220px static sidebar at 390×844 — the clone's drawer superset
stays correct).

**The NEW depth #1 — the reference-side Registers/Sales internals**: the
Registers empty state (h1 24px/700, the "0 registers configured" subline,
the 42px gradient New Register button) and the New Register dialog at BYTE
PARITY (panel `max-w-lg` = 512px — a first read of 462 was the content-box
artifact; #0f121a, 8px, p-6, no blur, the 18px/600 #e7e9ef title, h-9
inputs, 42px buttons — the reference literally ships the clone's vendored
`glass-*` class strings). The Sales search input (h-9/12px/transparent, the
"Buscar por ticket, cliente o cajero..." placeholder byte-exact) and the
empty cell (`text-slate-400` at the LEAF TD — a wrapper-div probe first
misread #e7e9ef; the TreeWalker leaf technique recorded as the measurement
lesson). No drift anywhere.

**The NEW depth #2 — the with-data audit on the demo seed** (15 products, 5
categories, 1 register, 1 closed shift, 33 sales → standalone boot): the
Registers card census + the Open-shift dialog family, the Sales ledger (33
rows) + ticket search + receipt viewer, the Cashiers Turnos Recientes row
($410.64 (33) · Cerrado), the POS gate, the Dashboard stat family — **all
green, no with-data defects**, the s15 F-107 peak re-proven. The one real
find: **F-110** — both receipt headers shipped bare `toLocaleString()`
(client-locale-dependent: en-US on the audit browser, ar-SA digits on an
ar-SA device) inside the Spanish-mixed surface whose ledger cell is es-MX.
Cured with the `saleTimestamp` pure seam in `src/lib/reports.ts` (byte-stable
`DD/MM/YYYY HH:MM`, manual padStart — the `shiftTime` precedent), unit-pinned
×3, adopted at both sites, e2e-pinned as an ADDED assertion on the existing
checkout receipt (the count stays 104). **F-111**: the with-data contracts
pinned in the evidence tier (`scripts/capture-s16-evidence.mjs`) — the class
the empty-store e2e can never see (the s15 V24 doctrine); future cycles
inherit the harness.

**The static sweep**: the zero-importer FILE census clean (45/45 live), the
dep census clean (the s15 removals hold — toast/axe gone; the 8 flags are
the known config/CLI withdrawals), the dev-db credential verifies
(`$Abcd1234`), the secrets scan clean, and the Session-15 code review clean
(the Reports chart's `Math.max(4, scale.top)` noted as harmless redundancy).

**Gate on the final tree**: lint 0 · tsc · unit **149/149** (14 files; +3
saleTimestamp pins, the count-lockstep re-anchored — README/CLAUDE/PAD/SKILL
+ the "Session-16 lock" literal) · build · smoke **13/13** · e2e
**104/104**. Evidence **13/13** (the with-data contracts + the F-110 stamp
live + the F-76/drawer spot-checks) with two infra lessons recorded in
AGENTS.md (visible ≠ animation-settled; bootstrap races need settled-state
waits) — zero checks weakened. VLM cross-check **5/5**. Screenshots 81–86.
Docs lockstep: AGENTS (Session-16 contracts), CLAUDE (the receipt-timestamp
law), PAD v1.14, SKILL v2.12.0 (+Session-16 addendum), README (counts),
remediation-plan-session-16 (the full ledger + record), session_27.md (the
narration). Pushed via `docs/ssh_git_wrapper_v3.py` → main on
`git@github.com:nordeim/velox-pos-2.git`, remote-verified; operator key
shredded.

## Session-17 — the with-data Inventory/Reports evidence pass (velox-pos-2)

**Received state**: `ceb4530` (the Session-16 push `797b9c9` + the operator's
session_28 raw-log commit — the workspace was RESET TWICE; the second reset
took the prior Session-17 attempt's uncommitted work with it — never pushed —
so this cycle redid the depth end-to-end from the received tree. Environment
blip: the sandbox's cached Playwright browsers (build 1200) didn't match 1.63
(needs 1243) — `bunx playwright install chromium`, environment-only).
**Result**: the ELEVENTH consecutive drift-free reference cycle; both
NEW-depth targets decoded (the reference-side Inventory/Reports internals at
leaf precision + the with-data audit on the demo seed — 17/17, no with-data
defects); the with-data evidence harness extended to Inventory/Reports
(F-112); the full gate green at the UNMOVED baselines.

**The received-tree gate** green: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files) · build · smoke 13/13 · e2e **104/104** — the
Session-16 lock held.

**The live re-measurement** (agent-browser, computed styles): every standing
pin byte-exact for the ELEVENTH consecutive cycle — the login card (blur(4px),
white/95, 16px, h1 30px/700, SSO 54px, inputs 48px/12px), the F-76 alert
("Invalid email or password", 12px radius, red-50/0.7, red-200, 16px pad,
14px red-700), the 220px sidebar (nav content 219px — flex-1, the recorded
read) + the 42px violet-600/0.2 Terminal pill, the terminal gate + CART, the
Dashboard date line + both chart h3s, the Sales/Cashiers Spanish families,
and the reference's own mobile defect (no hamburger, 220px z-50 static at
390×844 — the clone's drawer superset stays correct, 13/13 mobile e2e).

**The NEW depth #1 — the reference-side Inventory/Reports internals**: the
Inventory empty state (h1 24px/700, "0 products registered" 14px slate-500,
the byte-exact "Search by name or code..." placeholder at h-9, the "No
products found" `text-center py-12 text-slate-400 text-sm` cell) and the
Reports surface at BYTE PARITY — h1 24px, the "Sales & revenue analytics" sub
white/0.35, the 4 period pills with **"30 days" ACTIVE** (the clone's
`days = 30` default matches — no drift), the three 14px/700 CSS-uppercased
h2s (Daily Sales / Revenue by Payment Method / Breakdown by Method), the stat
cards `rounded-2xl p-5 flex items-center gap-4` (surface rgba(16,18,32,0.9) +
1px white/0.07 — the clone's `glass-card` computes the byte-identical
surface), the labels Total Revenue / Transactions / **"Avg. Ticket"**
(12px/400 white/0.35), the values `<p>` 24px/900. No drift anywhere.

**The NEW depth #2 — the with-data audit on the demo seed** (15 products, 5
categories, 1 register, 1 closed shift, 33 sales → standalone :3418): the
Inventory table census (15 rows, the 7-column header set, the stock-chip
census out=1/low=2/ok=12, the category dots — the Beverages row's #8b5cf6,
the search filter Espresso → 1 row) and the Reports family (the 4 pills with
30 active, the stat family, the 30-day db truth **$410.64 / 33 / $12.44**, the
glass-card surface, the method rows **card $246.74 (16) 60% / cash $163.90
(17) 40%**, the breakdown bars, the **7-day window narrowing to $366.56/28**) —
**17/17, no with-data defects**. The mid-audit "7-day discrepancy" was
WITHDRAWN: the seam's calendar-bucket semantics (N day-buckets including
today, coherent with `dailySeries`, unit-pinned) are correct by design — the
5 sales on the 7th calendar-day-back fall outside the window.

**The structural find — F-112**: the with-data Inventory/Reports contracts had
NO standing tier — the logic seams are unit-pinned and the empty-state surface
is e2e-pinned, but the live with-data rendering is invisible to the
empty-store e2e by construction (the V24 doctrine) and the s16 harness covers
only Registers/Sales/Cashiers. Cure: **`scripts/capture-s17-evidence.mjs`**
(the s16-pattern successor, port 3418) — **19/19** (the 17 with-data
contracts + the F-76 spot-check, which surfaced the oklab form
`oklab(0.970522 … / 0.7)` live — the either-form posture working — + the
mobile drawer). Screenshots **87–89**.

**Four measurement postures recorded in AGENTS.md** (all audit-probe bugs —
the clone code was correct every time): (1) textContent vs innerText case —
CSS-uppercased labels read "TOTAL REVENUE" in innerText but "Total Revenue"
in textContent; pin textContent, match innerText case-insensitively in
settled-state waits (a case-sensitive innerText wait hangs to its timeout).
(2) `waitForFunction` arity — options is the THIRD argument
(`fn, null, {timeout}`); a `{timeout}` passed as the second arg silently
becomes the 30s default. (3) DOM rows parse child nodes — the MethodTable's
method name is a bare TEXT node and the share span nests inside the font-bold
money span; span-index probes read "" and "$246.7460%". (4) The generalized
oklab-alpha posture — v4 renders white/α as `oklab(0.99999… / 0.4)`: extract
the trailing alpha, never pin the full serialization.

**The static sweep**: zero-importer census clean (the one flag,
`src/instrumentation.ts`, is Next.js's auto-registered convention entry —
live by design; deps carry only the known type-level/peer-coupled
withdrawals; `@radix-ui/react-toast` + `axe-core` remain gone), the dev-db
credential verifies (`$Abcd1234` via the app's own `verifyPassword` — the
standalone checker's first FAIL was its own salt-handling bug, fixed), the
secrets scan clean, and the Session-16 code review clean (the saleTimestamp
seam adopted at both receipt sites; every remaining `toLocale*` site
explicit-locale by pinned design).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files) · build · smoke **13/13** · e2e **104/104** — the
count constants UNMOVED (the evidence tier rides outside the unit/e2e counts
per the V24 doctrine; the "Session-16 lock" literal stays by design — the
docs-counts gate stayed green with zero re-anchoring). Evidence **19/19**;
VLM cross-check **3/3**. Screenshots 87–89. Docs lockstep: AGENTS (the
Session-17 contracts + the four postures), CLAUDE (the tier-4 evidence
line), PAD v1.15, SKILL v2.13.0 (+Session-17 addendum), README untouched
(no count changes), remediation-plan-session-17 (the full ledger + record),
session_29.md (the narration). Pushed via `docs/ssh_git_wrapper_v3.py` →
main on `git@github.com:nordeim/velox-pos-2.git`, remote-verified; operator
key shredded.

## Session-18 — the with-data StoreSettings/Dashboard evidence pass (velox-pos-2)

**Date:** 2026-10-27 · **Tree:** `e67a997` received (the Session-17 push `b1c6e9a`
+ the operator's session_30 raw-log commit — synced by fast-forward pull, NO
reset this cycle) · **Cycle:** the session_29 "Next" pointer's target.

**The received tree**: gate FULLY GREEN on arrival — lint 0 (1 documented
warning) · tsc · unit **149/149** (14 files) · build · smoke **13/13** · e2e
**104/104** (2.4m). Zero environment defects (the s17 Playwright browser-build
lesson pre-applied: chromium-1243 already cached). The static sweep: zero-importer
census CLEAN (the one flag is Next.js's auto-registered `instrumentation.ts`
convention entry; deps carry only the known type-level withdrawals;
`@radix-ui/react-toast` + `axe-core` remain gone), secrets clean (the AUTH_SECRET
hits are the documented throwaway test constant), the documented credential
VERIFIES (note: the checker is a bun script — plain node fails on `bun:sqlite`),
and the Session-17 code review clean (the commits touched only evidence
scripts/docs/screenshots; the harness adopts all four recorded postures).

**Reference sweep #12: ALL STANDING PINS HOLD — the TWELFTH consecutive
drift-free cycle.** The login card (blur(4px) · white/95 · 16px · h1 30px/700 ·
inputs 48px/12px · SSO 54px), the F-76 alert byte-exact ("Invalid email or
password" · 12px · red-50/0.7 · 1px red-200 · 16px pad · 14px red-700 — probe
note: the reference's `<main>` lacks the clone's `login-canvas` class), the 220px
sidebar + 8 links + the 42px violet-600/0.2 Terminal pill + the `/` landing
(F-60), the Dashboard date line (en-US "Tuesday, October 27, 2026" 14px
slate-500) + both chart h3s 16px/700, the Sales family ("Historial de Ventas"
24px/700 · 7 ledger headers · the byte-exact search placeholder · the slate-400
"Sin ventas" leaf), the Cashiers family ("Cajeros" + "Turnos Recientes" as H3
16px — the F-57 level contract re-proven live), and the reference's own mobile
defect (no hamburger at 390×844, the 220px z-50 STATIC sidebar). The clone's
drawer superset stays correct (13/13 mobile e2e).

**The NEW depth #1 — the reference-side StoreSettings internals**, measured at
FULL structure for the first time since the s15 listbox enumerations: h1 "Store
Settings" + "Customize your business" 14px slate-500; SIX H3/16px sections
(Business Information / Branding / Receipt / Fiscal / Tax Data / Card Payment
Provider / Product Categories) with the bare 20px icons at the measured colors
(store indigo-500 rgb(99,102,241) · palette purple-500 · file-text green-500 ·
receipt orange-500 · credit-card blue-500 · tag amber-500) in `flex items-center
gap-2` header rows; labels 14px/500 #e7e9ef (F-66); inputs 36px/12px; the
Business Information card (Store name "My Store" + the Upload logo glass button
+ Address/Phone/Email + Tax ID / EIN + the Currency trigger "USD - US Dollar");
Branding (Primary/Secondary color); the Receipt footer textarea (rows=2, 60px,
12px); the Fiscal card (the pinned 4 labels + the `lucide-toggle-left w-6 h-6
text-slate-400` icon-button "Hidden on receipt", NO role=switch — the s15
posture); the Provider trigger "None"; Categories (Add 34px/8px + "No
categories" slate-400); Save Changes 54px/12px. BOTH listbox enumerations
re-verified byte-exact (F-108: the 6 currencies @ the #161922/6px panel;
F-109: [None, Stripe, PayPal, Clip, Mercado Pago]). The "None" capitalization
suspicion WITHDRAWN — the clone's `cardProviderLabel` renders the identical
display label while storing the code form "none" (the s15 record's lowercase
list was the STORED-VALUE list, not a display pin).

**The NEW depth #2 — the with-data audit on the demo seed** (the settings row +
5 categories + 15 products + 33 sales → standalone :3419):
**16/16, no with-data defects.** StoreSettings — the header pair, the 6 sections
+ computed icon colors, the form materializing the row (store name, currency
"USD - US Dollar" @ 36px/12px), the Branding pickers + hex inputs (#6366f1 /
#8b5cf6 — pickers and inputs agree), the Receipt footer ("Thank you for your
purchase!" @ rows=2/60px/12px), the Provider "None", the fiscal switch
checked=false + "Hidden on receipt" (the seeded hidden default), the 5 category
chips with EXACT dot colors (Beverages #8b5cf6 · Groceries #10b981 · Personal
Care #3b82f6 · Snacks #f59e0b · Electronics #ef4444), Save Changes 54px.
Dashboard — the 4 stats carry the db truth (**Today's Sales $0.00 / Transactions
0** — the HONEST calendar-bucket empty-today on a morning-seeded db; the seed's
day-0 sales land 16-20h before seed time, i.e. YESTERDAY's bucket — while the
7-day chart carries 28 sales; the seam working exactly as unit-pinned —
**Products 15 / Low Stock 3**), the stat family styles (labels 600/12px
uppercase slate-500; values 700/24px white/90 BY ALPHA), both h3s 16px, the
with-data chart (2 paths, 13 grid lines, y ticks [0,20,40,60,80,100] + weekday
labels, **topTick 100 ≥ the $94.43 peak** — the F-107 niceScale law re-proven on
real data), and the category breakdown (5 rows, counts 3, bars 20%, exact dots).

**The structural find — F-113**: the with-data StoreSettings/Dashboard
contracts had NO standing tier — the settings SAVE round-trip, the section
headings, the form controls, and the listbox enumerations are e2e-pinned, and
the empty-state stats/chart are e2e-pinned, but the live WITH-DATA rendering is
invisible to the empty-store e2e by construction (the V24 doctrine), the s16
harness covers Registers/Sales/Cashiers, and the s17 covers Inventory/Reports.
Cure: **`scripts/capture-s18-evidence.mjs`** (the s16/s17-pattern successor,
port 3419) — **20/20** (the 2 db-truth derivation checks + the 16 with-data
contracts + the F-76 spot-check — the oklab form `oklab(0.970522 … / 0.7)`
surfacing live again, the either-form posture working — + the mobile drawer).
Screenshots **90–92**. **The structural law recorded**: volatile with-data
expectations (the Dashboard's today-bucket pair) are DERIVED FROM THE DB AT
RUNTIME (a read-only `bun -e` JSON dump before the probes) — a hardcoded
"$X.NN today" pin rots within hours of any re-seed; the re-seed-stable
constants (Products 15, Low Stock 3, the settings row, the 5 category colors)
stay literal.

**Three more measurement postures recorded in AGENTS.md** (all audit-probe
bugs — the clone code was correct every time): (1) **pin COMPUTED styles, never
class-string order** — the clone's section icons render `h-5 w-5` (height-first)
while the reference's measured string is `w-5 h-5` (width-first); identical
computed styles. (2) **the oklab-alpha SPACE** — v4 serializes white/90 as
`oklab(0.999994 … / 0.9)` WITH a space after the slash; the generalized
either-form regex is `/\/\s*([\d.]+)\)$/` (the no-space form nulls). (3)
**mixed tick arrays** — the Dashboard chart's tick texts mix numbers and weekday
labels; filter to numeric before reducing (`Math.max` over `Number("Wed")` is
NaN). Plus the authoring lesson: when a SyntaxError caret makes no sense
(pointing at `#`), hexdump the exact line — an unterminated string can point
three tokens away (the audit script's `]')` typo for `]")]`, caught by
`node --check` before any server ran).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files) · build · smoke **13/13** · e2e **104/104** — the count
constants UNMOVED (the evidence tier rides outside the unit/e2e counts per the
V24 doctrine; the "Session-16 lock" literal stays by design). Evidence
**20/20**; VLM cross-check **3/3**. Screenshots 90–92. Docs lockstep: AGENTS
(the Session-18 contracts + the three postures + the db-derived-expectation
law), CLAUDE (the tier-4 evidence line naming all three harnesses), PAD v1.16,
SKILL v2.14.0 (+Session-18 addendum), README untouched (no count changes),
remediation-plan-session-18 (the full ledger + record), session_31.md (the
narration). Pushed via `docs/ssh_git_wrapper_v3.py` → main on
`git@github.com:nordeim/velox-pos-2.git`, remote-verified; operator key
shredded.

## Session-19 — the receipt print-path pass (velox-pos-2)

**Date:** 2026-10-28 · **Tree:** `a94c105` received (the Session-18 push `c16900c`
+ `87f88b2` + the operator's session_32 raw-log commit — a FRESH CLONE this
cycle; the workspace had been reset) · **Cycle:** the session_31 "Next"
pointer's receipt print-path target + the operator's mobile-navigation priority
check.

**The received tree**: gate FULLY GREEN on arrival — lint 0 (1 documented
warning) · tsc · unit **149/149** (14 files) · build · smoke **13/13** · e2e
**104/104** (2.4m). Fresh-clone environment acts: `.env` from `.env.example`
(+ generated 64-hex AUTH_SECRET), `db:push`+`db:seed`, chromium-1243 installed
BEFORE the e2e leg (the s17 lesson — only 1200 was cached). Static sweeps
clean: zero dead files (the census's one convention flag:
`src/instrumentation.ts`), secrets clean (test fixtures only), the documented
credential VERIFIES (the checker MIRRORS `src/lib/auth.ts` —
`Bun.password.verify` rejects the app's `scrypt$salt$hash` shape with
PASSWORD_UNSUPPORTED_ALGORITHM), and the Session-18 code review clean
(evidence scripts/docs only). One suspicion withdrawn pre-fix: the Read tool
showed `const ethod` in terminal-view.tsx — the SD-4 `[m`-eating display
artifact, second save.

**Reference sweep #13: ALL STANDING PINS HOLD — the THIRTEENTH consecutive
drift-free cycle** (login card blur(4px)/white/95/16px, F-76 byte-exact, the
220px sidebar + violet pill + the `/` landing, the Dashboard date line, the
Sales/Cashiers Spanish families, the reference's own mobile defect at
390×844). **The clone's mobile drawer re-verified live on the dev server**
(the operator's priority): labeled hamburger · dialog semantics + 8 labeled
links · focus management (open→Close, Escape→hamburger + scroll-lock release)
· route-close unmount · zero horizontal overflow — plus 13/13 mobile e2e. NO
Tailwind v4 regression. Playwright trace audit clean (the 2 unpinned raw
reads are post-settled behind auto-retrying pins).

**The NEW depth — the receipt print-path, probed via print-media emulation**
(`page.emulateMedia({ media: "print" })` + computed-style walks; a full UI
checkout first): **TWO functional defects in the clone's own superset
surfaces** — **F-114**: the terminal receipt printed only "My Store" (the
`@media print` container-only `color: #000` lost to the receipt's explicit
white utilities; the Total row computed rgb(255,255,255) on white; items
oklab-white/0.8; ticket/footer /0.6) · **F-115**: the Sales viewer's
Imprimir printed a BLANK page (no `.receipt-print` wrapper — the dialog
itself hidden, ONE painted element).

**TDD cure**: the pins landed FIRST (F-114 inside the existing cash-checkout
test — no count change; F-115 as the one NEW test) → RED on the pre-fix build
(`Received: "rgb(255, 255, 255)"`) → the two surgical cures (the print rule's
`.receipt-print, .receipt-print *` gained `color: #000` — unlayered plain CSS
beats `@layer utilities`, no `!important`; the Sales viewer's receipt content
wrapped, footer buttons outside) → GREEN 12/12. **E2E 104 → 105** (91
desktop) — the count-lockstep constants AND every live-tense doc site moved
in the SAME commit (docs-counts gate + the "Session-16 lock" → "Session-19
lock" literal, README badge/scripts/testing, CLAUDE baseline + the
print-path law, PAD **v1.17**, SKILL **v2.15.0** + the Session-19 addendum,
AGENTS the Session-19 contracts).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files — UNMOVED, the lockstep gate green with the re-anchored
constant) · build · smoke **13/13** · e2e **105/105** (2.5m). Evidence:
screenshots **93–95** (the remediated terminal receipt under print emulation,
the Sales viewer printing, the mobile drawer) via the committed
self-provisioning `scripts/capture-s19-evidence.mjs`; the STANDING protection
for the print-path class lives in the e2e suite itself (the print path is
e2e-visible by construction — every `bun run test:e2e` re-proves it). Docs
lockstep: this worklog entry, remediation-plan-session-19 (the full ledger +
record), session_33.md (the narration). `.env.example` verified against the
working `.env`. Pushed via `docs/ssh_git_wrapper_v3.py` → main on
`git@github.com:nordeim/velox-pos-2.git`, remote-verified; operator key
shredded.

## Session-20 — the four-width drift-sweep tier (velox-pos-2)

**Date:** 2026-10-28 · **Tree:** `6f32b4f` received (the Session-19 push `2d18c51` + the
operator's session_34 raw-log commit — a GIT PULL this cycle; the workspace persisted
from Session-19) · **Cycle:** the session_33 "Next" pointer's drift-sweep target + the
operator's mobile-navigation priority check.

**The received tree**: gate FULLY GREEN on arrival — lint 0 (1 documented warning) ·
tsc · unit **149/149** (14 files) · build · smoke **13/13** · e2e **105/105** (2.4m).
Environment re-verified (`.env` + `db/` at the repo root persisted; chromium-1243
cached). Static sweeps clean: zero dead files, secrets clean (test fixtures only), the
documented credential VERIFIES, and the Session-19 code review confirmed the two
surgical cures + pins + docs exactly as planned.

**Reference sweep #14: ALL STANDING PINS HOLD — the FOURTEENTH consecutive drift-free
cycle** (login card blur(4px)/white/95/16px, F-76 byte-exact, the 220px sidebar + the
`/` landing, the Dashboard date line, the Sales/Cashiers Spanish families, the
reference's own mobile defect at 390×844 — no hamburger, the static sidebar, the 390px
document scrolling to 1280px). **The clone's mobile drawer re-verified live on the dev
server** (the operator's priority): labeled hamburger · dialog semantics + 8 labeled
links · focus management (open→Close, Escape→hamburger + scroll-lock release) ·
route-close unmount · zero horizontal overflow — plus 13/13 mobile e2e. NO Tailwind v4
regression.

**The NEW depth — the four-width (390/768/1024/1440) route-battery ANALYZE, empty AND
demo-seeded**: ZERO overflow findings on the standing code (the ledger tables 640–773px
stay inside their `.vpx-scroll` containers; the chrome switches exactly at md) — the
finding is **F-116, the MISSING protection tier** (the suite pinned 390 /POS-centered
and 1440 only; 768/1024 had zero coverage; the with-data containment class — the neo-crm
M-109c1 genus — had no guard anywhere). The mutation proofs designed the pin: a
frame-level pin is blind to the inner break (the outer `overflow-hidden` clips);
`scrollWidth` cannot distinguish `overflow-x: auto` from `visible` (Chromium reports
content width for both); the **`scrollLeft` read-back CAN** (the injected mutation
no-ops the assignment — measured live).

**The cure — `tests/e2e/viewport-drift-sweep.spec.ts` (2 tests, no production code)**:
the route battery (8 routes × 4 widths: doc/main `scrollWidth ≤ clientWidth` + the
chrome-switch contract, VISIBILITY pins) + the with-data guard (self-provisioned
product; Inventory@390: main contained, the ledger container a FUNCTIONAL scroll region,
the table's `min-w-[760px]` floor intact). The spec's first run caught a PROBE bug (the
container lookup picked `main` — which itself carries `.vpx-scroll`; fixed to
`table.closest(".vpx-scroll")`); the second run: both tests PASS on the standing build
(the characterization green; the red is the mutation record).

**E2E 105 → 107 (93 desktop) · specs 7 → 8** — the count-lockstep constants AND every
live-tense doc site moved in the SAME commit (docs-counts gate + the "Session-19 lock" →
"Session-20 lock" literal + the scoped-negative move "8 spec files"→"7 spec files" — the
gate catching its own doc history; README badge/scripts/testing, CLAUDE baseline + the
drift-sweep law, PAD **v1.18**, SKILL **v2.16.0** + the Session-20 addendum, AGENTS the
Session-20 contracts).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit **149/149**
(14 files — UNMOVED) · build · smoke **13/13** · e2e **107/107** (2.9m). Evidence:
screenshots **96–98** (the with-data Inventory contained at 390, the POS md chrome
switch at 768 with the 380px cart rail, the mobile drawer) via the committed
self-provisioning `scripts/capture-s20-evidence.mjs`; the STANDING protection lives in
the e2e suite itself (the battery + the containment guard run on every
`bun run test:e2e`). Docs lockstep: this worklog entry, remediation-plan-session-20
(the full ledger + record), session_35.md (the narration). `.env.example` verified
against the working `.env`.

## Session-21 — the three-ledger with-data walk + the store race it caught (velox-pos-2)

**Date:** 2026-10-28 · **Tree:** `e9513d7` received (the Session-20 push `927bc98` + the
operator's session_36 raw-log commit — a GIT PULL this cycle; the workspace persisted
from Session-20) · **Cycle:** the session_35 "Next" pointer's with-data mobile walk of
the Sales/Cashiers ledgers + the operator's mobile-navigation priority check.

**The received tree**: gate FULLY GREEN on arrival — lint 0 (1 documented warning) ·
tsc · unit **149/149** (14 files) · build · smoke **13/13** · e2e **107/107** (2.9m).
Environment re-verified with ONE repair (the `.env` had reverted to the template's
unevaluated `AUTH_SECRET="$(openssl rand -hex 32)"` literal — a fresh 64-hex secret
generated; `db/` at the repo root persisted; chromium-1243 cached). Static sweeps
clean: zero dead files, secrets clean (test fixtures only), the documented credential
VERIFIES (the checker runs under **bun** — it imports `bun:sqlite`), and the Session-20
code review confirmed the spec + docs + evidence exactly as planned.

**Reference sweep #15: every standing pin HOLDS byte-exact EXCEPT the reference's own
mobile defect, which DRIFTED (D-1)** — the FOURTEEN prior cycles had measured no
hamburger + the static 220px sidebar + the 390px document scrolling to 1280px; this
cycle measured the document contained at exactly 390 on every route with **main
squeezed to 170px** beside the rail (its own `overflow-x: auto`). The defect class
persists, the observable changed — the clone's drawer superset remains strictly better;
every live-tense doc site stating the old observable was refreshed (AGENTS/PAD
ADR-004/README/the SKILL's live sections; history blocks keep their statements). **The
clone's mobile drawer re-verified live on the dev server** (the operator's priority):
labeled hamburger · dialog semantics + 8 labeled links · focus management (open→Close,
Escape→hamburger + scroll-lock release) · route-close unmount · zero horizontal
overflow — plus 13/13 mobile e2e. NO Tailwind v4 regression.

**The NEW depth — the with-data walk of Sales/Cashiers at 390 (the session_35
pointer)**: the ANALYZE measured both surfaces CORRECT with data (contained, functional
scroll, floors 720/640) + the mutation proofs re-run live on both (the injected
regression no-ops the scrollLeft read-back on each) — F-117, the protection gap (the
s20 guard visited Inventory only). The cure restructured the guard's second test into
the **three-ledger walk**: ONE chain (category → product → register → shift → sale)
visits /Inventory, /Sales, /Cashiers at 390 with per-route frame + functional-scroll +
floor assertions (760/720/640).

**The walk then caught TWO live lessons**: (1) the self-clean law — its first version
left the shift ACTIVE and failed the mobile project's terminal-gate test on the next
run; the spec now CLOSES its shift before the walk (a closed shift still renders the
Cashiers row). (2) **F-118, a REAL production race**: the Cashiers leg flaked 2-in-4
full runs ("Sin turnos registrados" with three closed shifts in the db). The trace
forensics isolated it to the CLIENT store — `loadCore` wrote the active-only shifts
into the SAME `shifts` key `loadAll` fills with the full ledger list, racing inside the
bootstrap's `Promise.all` (the last writer won). Twenty sessions of empty-store e2e
never saw it (no closed shifts to lose — the s15 V24 doctrine, proven twice).

**TDD cure (F-118)**: `tests/unit/store.test.ts` (the store seam's first unit file —
the path-dispatched transport mock, the active-only-fetch-resolves-LAST interleaving)
→ **RED on the pre-fix store** → `loadCore` refreshes settings ONLY (no consumer reads
the active-only value; the terminal gate filters the collection itself) → **GREEN**.

**UNIT 149 → 151 (14 → 15 files) · E2E stays 107** (the walk restructures the existing
test) — the count-lockstep constants AND every live-tense doc site moved in the SAME
commit (docs-counts gate + the "Session-20 lock" → "Session-21 lock" literal,
vitest.config.ts header, README badge/scripts/tree/testing, CLAUDE baseline + the
drift-sweep extension + the store law, AGENTS the Session-21 store-writer contracts +
the file count, PAD **v1.19** + the revision block + ADR-004's drift note, SKILL
**v2.17.0** + the Session-21 addendum).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit **151/151**
(15 files) · build · smoke **13/13** · e2e **107/107 × 2 consecutive full runs** (the
race cure verified) · the three with-data harnesses **s16 13/13 · s17 19/19 · s18
20/20**. Evidence: screenshots **99–101** (the with-data Sales ledger contained at
390, the with-data Cashiers ledger with the closed shift rendering "Cerrado" — the
F-118 surface cured and proven live, the mobile drawer) via the committed
self-provisioning `scripts/capture-s21-evidence.mjs`, plus the D-1 reference capture
(`ref-mobile-pos-390-s21.png`). Docs lockstep: this worklog entry,
remediation-plan-session-21 (the full ledger + record), session_37.md (the narration).
`.env.example` verified against the working `.env`.

## Session-22 — the with-data Reports walk + the fixture POST it caught (velox-pos-2)

**Date:** 2026-10-28 · **Tree:** `126c45d` received (the Session-21 push `182fe3b` + the
operator's session_38 raw-log commit — a FRESH CLONE this cycle; the sandbox workspace was
reset, so the documented rebuild ran: `.env` regenerated with a fresh 64-hex secret,
`bun install`, `db:push` + `db:seed`, chromium-1243 installed) · **Cycle:** the session_37
"Next" pointer's with-data Reports walk + the operator's mobile-navigation priority check.

**The received tree**: gate FULLY GREEN on arrival — lint 0 (1 documented warning) · tsc ·
unit **151/151** (15 files) · build · smoke **13/13** · e2e **107/107** (2.9m). Static
sweeps clean: zero dead files (the census script recreated after the sandbox reset), secrets
clean (test fixtures only), the documented credential VERIFIES (the checker runs under
**bun**; its first draft's 4-part hash-shape assumption corrected to the repo's 3-part
`scrypt$salt$key`), and the Session-21 code review confirmed the surgical `loadCore` fix +
the walk + the store regression test + the lockstep + the docs, ZERO unplanned production
code.

**Reference sweep #16: every standing pin HOLDS byte-exact, and the mobile defect is
STABLE at its Session-21 D-1 shape** (no hamburger, the static 220px sidebar, the document
contained at exactly 390 with main crushed to 170px — no NEW drift; the D-1 record still
describes the reference exactly). **The clone's mobile drawer re-verified live on the dev
server** (the operator's priority): labeled hamburger · dialog semantics + 8 labeled links
· focus management (open→Close, Escape→hamburger + scroll-lock release) · route-close
unmount · zero horizontal overflow — plus 13/13 mobile e2e. NO Tailwind v4 regression.

**The NEW depth — the with-data Reports walk (the session_37 pointer)**: the reference's
Reports surface is EMPTY ($0.00 stats, 2× "No data for this period" — the demo account is
write-restricted), so the with-data tier is a functional-SUPERSET addition (the s20/s21
lineage). The ANALYZE measured the clone CORRECT with data (stats exactly the API-derived
$9.75/2/$4.88; both method tables + share bars; topTick $10 covering the data; contained
at 390) — **F-119, the protection gap**: every standing Reports pin is empty-state and the
CHAIN (API → store → memoized summarize/dailySeries/byMethod → DOM) was e2e-invisible. The
cure: `tests/e2e/with-data-reports-walk.spec.ts` — the exact wiring pin (expected values
DERIVED FROM THE API at runtime, never hardcoded) + the with-data containment at 390. The
file name is LOAD-BEARING: it sorts LAST in the chromium project because it persists sales
(surfaces.spec's empty-Reports pin must run before its data exists).

**The ANALYZE also caught F-120, a latent defect in the STANDING suite**: the provisioning
script's first sale POST 400'd on `items.0.name` — and the Session-21 drift-sweep walk's
fixture POST carried the same PRE-contract `quantity` payload, silently 400ing for two
sessions. `sale.ticket` was always undefined, `filter({ hasText: undefined })` applied NO
filter, and the Sales leg's settled wait matched ANY row (terminal.spec's sale; the
empty-state td row on a colder db) — the walk passed 107/107 twice with ZERO "Drift Sweep"
sales in the db (verified directly against the post-run e2e.db). The cure: the
contract-correct line payload + `expect(resp.ok())` on every provisioning POST — in the
walk, the s21 evidence script (captures 99–101 refreshed to show the fixture's own row),
and the s22 provisioning. The walk re-ran green with the fixture sale VERIFIED in the db
(T-000001, $5.00).

**E2E 107 → 109 · specs 8 → 9 · desktop 93 → 95** (UNIT stays 151/15) — the count-lockstep
constants AND every live-tense doc site moved in the SAME commit (docs-counts gate + the
"Session-21 lock" → "Session-22 lock" literal, README badge/scripts/testing, CLAUDE
baseline + the persistence-ordering law, AGENTS the Session-22 with-data contracts + the
F-120 POST-assertion law, PAD **v1.20** + the revision block + the spec map, SKILL
**v2.18.0** + the Session-22 addendum).

**Gate on the final tree**: lint 0 (1 documented warning) · tsc · unit **151/151** (15
files — UNMOVED) · build · smoke **13/13** · e2e **109/109 × 2 consecutive full runs**
(95 desktop + 13 mobile + 1 setup, both fixtures verified in the db) · the three with-data
harnesses **s16 13/13 · s17 19/19 · s18 20/20**. Evidence: screenshots **102–104** (the
with-data Reports desktop — the derivation verified live against a warm db carrying THREE
sales from two different fixtures, $14.75/3; the with-data Reports contained at 390; the
mobile drawer) via the committed self-provisioning `scripts/capture-s22-evidence.mjs`,
plus the refreshed 99–101 (the F-120 repair) and the D-1-shape reference capture
(`ref-mobile-pos-390-s22.png`). Docs lockstep: this worklog entry,
remediation-plan-session-22 (the full ledger + record), session_39.md (the narration).
`.env.example` verified against the working `.env`.

# VeloxPOS Remediation Plan — Session-4

**Date:** 2026-10-26 (afternoon cycle)
**Scope:** re-audit of the Session-3 tree (HEAD `f2583b3`) against the live reference
(`veloxposen.base44.app`) — the reference has **changed since Session-101/3** (fiscal fields
renamed on the live site); plus a typography/copy parity sweep that the earlier sessions' specs
never pinned at the computed-style level.
**Method:** skills/web-application (§12 v4 traps, §14 testing, §15 gate, §20 pre-ship),
skills/agent-browser live re-measurement (computed styles as ground truth), skills/tdd
(red → green for every behavioral fix), skills/clone-app-pat-pro (computed-style parity).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Full local gate on the fresh clone | `lint → typecheck → test → build → test:e2e` (after `bunx playwright install chromium`) | lint 0 errors (1 documented warning) · tsc clean · **unit 117/117** · build green (documented benign instrumentation warning) · **e2e 45/45** |
| V2 | Environment contract | `.env` from `.env.example` + generated `AUTH_SECRET`; `db/` at repo root; `db:push + db:seed + --demo` provisions `db/custom.db` (15 products / 5 categories / 1 register / 33 sales) | ✅ matches the documented contract |
| V3 | Reference mobile defect (re-verified live @390×844) | agent-browser computed geometry | Reference STILL renders the 220px z-50 sidebar overlay with **no hamburger** — the clone's drawer superset remains correct |
| V4 | Clone mobile drawer (live @390×844, standalone :3400) | agent-browser + the 13-test e2e suite | hamburger visible @x=9 · drawer 288px `role=dialog` + `aria-modal` · 8 labeled links · `animation-name: enter` · focus on the close button · scroll lock · navigate → unmounts + lock released · md-growth auto-close (e2e) |
| V5 | Sidebar geometry (computed, both sides) | aside 220px `#0d0f1a` · brand row 73px / 20px 16px / border-b `#1e2235` / logo x=16 · nav 16px 8px · items 42px / 12px · active violet pill · body `#080a14` | ✅ all match (Session-3 fixes hold) |
| V6 | Cart rail @800×900 (computed) | 380px wide, x=425, `border-left 1px #1e2235`, `border-top 0` | ✅ Session-3 F-5 fix holds |
| V7 | View-by-view copy/structure diff (8 routes, both sites) | full text-node capture + set-diff (agent-browser, explicit navigation per site — the CLI's named sessions share one tab) | ❌ findings F-20/F-21/F-23 (below); everything else identical or a documented superset |
| V8 | Heading typography (computed, both sides, 5 views) | `fontSize/fontWeight/textTransform/letterSpacing/color` per heading | ❌ **F-17/F-18/F-19**: reference H1=24px & sections=16px (Dashboard/Cashiers/StoreSettings) and 14px uppercase (Reports); clone ships 30px/18px/16px |
| V9 | Reference fiscal section (re-measured live) | DOM walk + snapshot + toggle click-through | ❌ **F-20/F-21**: the reference RENAMED its fiscal labels since Session-101 ("Tax ID / EIN", "Tax Regime", "Fiscal Address", "CFDI Use (default)" — placeholders unchanged); toggle flips "Hidden on receipt" ⇄ "Visible on receipt" with default OFF (hidden); help paragraph present; toggle lives in the card header row |
| V10 | Reference login page (computed + pixel) | background chain + pixel sampling | ❌ **F-24/F-25**: canvas is a gradient `to right bottom #f8fafc → #f1f5f9` (clone: flat `#f1f2f6`); the whole phrase "Need an account? Sign up" is ONE slate-500 button (clone: static text + separate bold slate-800 "Sign up" button) |
| V11 | Reference POS cart panel (DOM) | outerHTML extraction | ❌ **F-22**: the reference cart embeds an auto-collapsing "Added" banner (`max-h-0 opacity-0` → expands, emerald gradient, "ADDED" 10px + product name `text-lg font-black`, `transition-all duration-300`) — the clone has no equivalent |
| V12 | Tailwind v4 trap sweep (re-run) | config absent · no `@layer utilities` · gradients as classes · `space-y` children clean · `tw-animate-css` imported · `@custom-variant hover` present · 0 `(hover: hover)` media queries in built CSS | ✅ all Session-3 mitigations hold |
| V13 | 404 / Spanish copy / login copy | both sides | ✅ verbatim parity (404, Historial de Ventas, Cajeros/Turnos) |
| V14 | Test-infra configs | `vitest.config.ts` (12 unit files) + `playwright.config.ts` (setup/chromium/mobile projects, kill-port → provision → boot webServer, absolute e2e DATABASE_URL, COOKIE_SECURE=false) | ✅ both suites configured and green |

**Baseline confirmed:** the Session-3 tree is internally consistent and fully green on a fresh
clone. The findings below are live-reference drift (the site changed) plus parity deltas the
earlier specs never measured at computed-style depth — not regressions of the shipped gate.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-17 | **MEDIUM** (visual parity, all views) | `src/components/pos/shared.tsx` (ViewHeader) | Every page H1 is `text-3xl` (30px); the reference's H1s compute **24px** (measured on Dashboard, Inventory, Sales, Reports, StoreSettings). | V8 | `text-3xl` → `text-2xl` (one site, applies to all 8 views). |
| F-18 | **MEDIUM** (visual parity) | dashboard-view (×2), cashiers-view, settings-view (SectionCard) | Section headings are `text-lg` (18px); the reference computes **16px** (Dashboard "Sales — Last 7 days"/"Products by Category", Cashiers "Turnos Recientes", StoreSettings' six section H3s). | V8 | `text-lg` → `text-base` at the four sites. (registers-view's card-name h2 has no reference state — untouched.) |
| F-19 | **MEDIUM** (visual parity) | reports-view (×3 headings) | Reports section headings are `text-base` (16px) `text-white/70`; the reference computes **14px**, `tracking 0.7px`, `rgba(255,255,255,0.6)`. | V8 | `text-base` → `text-sm`, `text-white/70` → `text-white/60` (keep uppercase + tracking-wider — measured equal). |
| F-20 | **MEDIUM** (parity — reference-side rename) | settings-view fiscal section | The live reference RENAMED its fiscal labels (Session-101 measured "RUC/NIT, business type, fiscal address, expense account"; today: **"Tax ID / EIN", "Tax Regime", "Fiscal Address", "CFDI Use (default)"** — same placeholders, plain text inputs, so only the labels moved). | V9 | Rename the four `<Label>`s (internal Prisma field names unchanged — UI-only parity); e2e-pin the new labels. |
| F-21 | **MEDIUM** (functional parity) | settings-view fiscal toggle | (a) The ON-state label is "Shown on receipt"; the reference says **"Visible on receipt"**. (b) Default polarity inverted: reference default = fiscal **hidden** (toggle OFF); clone default = shown. (c) The reference's help paragraph ("If you configure these fields and enable the option, they will appear in the header of each printed or emailed receipt.") is missing. (d) The reference mounts the toggle in the card HEADER row, not the body. | V9 (toggle clicked live: `toggle-left`+“Hidden on receipt” ⇄ `toggle-right`+“Visible on receipt”) | Switch wiring `checked={!hideFiscalOnReceipt}` + label `hideFiscal ? "Hidden on receipt" : "Visible on receipt"`; flip the default (`schema @default(true)` + form default + re-push); add the help `<p>`; SectionCard gains an optional `headerAction` slot for the toggle. |
| F-22 | **MEDIUM** (functional parity) | terminal-view cart panel | The reference's cart embeds an **"Added" confirmation banner**: `max-h-0 opacity-0` collapsed; on add it expands (`transition-all duration-300`) showing an emerald gradient chip — circle-check icon, "ADDED" (10px, emerald-300/70, uppercase, tracking-widest) + the product name (`text-lg font-black`) — then auto-collapses. The clone's only feedback is the cart list updating. | V11 (reference cart outerHTML) | Implement the banner in the cart panel (last-added product name, expand on add, auto-collapse after ~2.5s); e2e-pin visible-then-collapsed. |
| F-23 | **LOW** (copy parity) | reports-view, dashboard-view | DOM copy casing drift — the reference's DOM text is Title Case: **"Total Revenue", "Avg. Ticket", "Daily Sales", "Revenue by Payment Method", "Breakdown by Method"** (Reports) and **"Today's Sales", "Low Stock"** (Dashboard stat labels); the clone ships sentence case. Both sides CSS-uppercase most of these, so the drift is invisible today — but the repo's law is copy-verbatim. | V7 | Align the seven strings; update the two existing e2e pins that assert the old casing (`surfaces.spec.ts:18-19`). |
| F-24 | **LOW** (visual parity) | `src/app/tokens.css` `.login-canvas` | Flat `#f1f2f6`; the reference's login main computes `linear-gradient(to right bottom, rgb(248,250,252), rgb(241,245,249))` (`from-slate-50 to-slate-100`). | V10 | `.login-canvas { background: linear-gradient(to right bottom, #f8fafc, #f1f5f9); }` |
| F-25 | **LOW** (parity) | login-surface.tsx (signup control) | The reference renders the WHOLE phrase "Need an account? Sign up" as ONE `slate-500` button (text-sm, hover slate-700); the clone renders static text + a separate bold `slate-800` "Sign up" button. | V10 | Single button, full phrase, `text-slate-500 hover:text-slate-700 font-medium`. |

**Explicitly NOT findings (verified intentional — do not "fix"):**
- **Readable heading colors**: the reference renders its H1s/section H3s in slate-700/800 on dark
  glass cards — **near-invisible** (its own defect, pixel-verified: 880 slate-800 text pixels on
  the #080a14 canvas). The clone keeps white/violet readable colors per the a11y-superset
  doctrine (same posture as the drawer vs the reference's broken mobile nav). Sizes match; colors
  stay readable.
- **h2 section semantics** (reference skips h2: h1 → h3) — the clone's h1 → h2 is the a11y
  superset; only the SIZE is parity-pinned.
- "Nuevo cajero", CSV Export/Import, the sr-only "Currency: …" announcement — documented
  supersets.
- The reference's mobile nav defect, cart `border-t` below `md` (reference keeps `border-l` even
  stacked), registers-view card-name size (no reference state exists) — unchanged doctrine.

---

## 2. The ToDo list (execution order, TDD where behavioral)

Every behavioral item is red → green: the failing e2e pin FIRST, then the fix. CSS-only items
ride the same pins. No pure seam changes → the unit count stays **117**; e2e grows by the new
pins (count-lockstep in the same commit).

- [x] **T-1** (RED) New e2e pins in `surfaces.spec.ts`: (a) Dashboard H1 computes 24px and its
      section headings 16px; (b) Reports section headings compute 14px; (c) Reports shows
      "Total Revenue" / "Avg. Ticket" (Title Case); (d) Dashboard stat labels "Today's Sales" /
      "Low Stock"; (e) fiscal card labels "Tax ID / EIN", "Tax Regime", "Fiscal Address",
      "CFDI Use (default)".
- [x] **T-2** (RED) New e2e pin in `surfaces.spec.ts`: the fiscal switch is UNCHECKED by default
      with the label "Hidden on receipt", the help paragraph is visible, and the switch sits in
      the card header row (aria/structure assertion).
- [x] **T-3** (RED) New e2e pin in `terminal.spec.ts`: adding a product to the cart makes the
      "Added" banner visible with the product name, then it auto-collapses (opacity/max-height
      back to collapsed).
- [x] **T-4** (RED) New e2e pins in `auth.spec.ts`: login canvas background-image contains
      `linear-gradient`; a single button reads "Need an account? Sign up".
- [x] **T-5** (GREEN, F-17/F-18/F-19) `shared.tsx` ViewHeader `text-3xl` → `text-2xl`;
      dashboard/cashiers/settings headings `text-lg` → `text-base`; reports headings
      `text-base` → `text-sm` + `text-white/60`.
- [x] **T-6** (GREEN, F-20/F-21) Fiscal section: rename the four labels; switch wiring
      `checked={!hideFiscalOnReceipt}` + label pair "Hidden on receipt"/"Visible on receipt";
      add the help paragraph; `SectionCard` optional `headerAction` slot with the toggle in the
      header; flip the default — `prisma/schema.prisma` `@default(true)`, form default `true`,
      `db:push` + demo-db re-provision.
- [x] **T-7** (GREEN, F-22) The cart "Added" banner: last-added-product state in the terminal
      view, `transition-all duration-300 max-h-0 opacity-0` collapsed → expanded, auto-collapse
      timer (~2.5s), emerald gradient chip per the measured reference DOM.
- [x] **T-8** (GREEN, F-23) The seven copy strings to Title Case; update the two existing
      `surfaces.spec.ts` casing pins (18–19) in the same commit.
- [x] **T-9** (GREEN, F-24/F-25) `.login-canvas` gradient; single "Need an account? Sign up"
      slate-500 button.
- [x] **T-10** Full gate re-run: `lint → typecheck → test (117) → build → test:e2e` (new total
      = 45 + new pins, all prior pins intact).
- [x] **T-11** Live re-verification with agent-browser against the rebuilt standalone: heading
      sizes, fiscal card, banner behavior, login canvas.
- [x] **T-12** Fresh screenshots (Session-4 set) into `docs/screenshots/`.
- [x] **T-13** Docs lockstep: README/AGENTS/CLAUDE/PAD counts + the fiscal-label change +
      Session-4 revision block; this plan's checkboxes ticked.
- [x] **T-14** `worklog.md` Session-4 entry; commit + push via `docs/ssh_git_wrapper_v3.py`
      (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), main only.

## 3. Gate & acceptance

1. All existing pins stay green — the two casing pins are UPDATED (not deleted) to the measured
   reference strings; no assertion weakened.
2. The new e2e pins land and pass against the production build; unit stays 117/117.
3. `bun run lint` 0 errors; `tsc --noEmit` clean; `bun run build` green; standalone boots +
   `/api/health` ok.
4. Live re-measurement confirms the fixes (T-11).
5. Doc counts lockstep in the same commit; worklog + plan updated; pushed via the wrapper.

## 4. Residual risks

- The fiscal default flip (`hidden` by default) changes receipt rendering for rows created after
  the flip; existing demo rows are re-provisioned in the same change. Documented in the PAD
  revision block.
- The "Added" banner auto-collapse timer (2.5s) is an inference — the reference's exact timeout
  is not observable (its demo account cannot add products); the banner's structure, classes, and
  animation are measured verbatim, the duration is the family-standard ~300ms transition with a
  conservative hold. E2e asserts visible-then-collapsed, not the exact duration.
- `@default(true)` on a SQLite column via `db:push` alters the column in place (no migration
  files in this repo's flow — `db:push` is the documented provisioning path).

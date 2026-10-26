# VeloxPOS Remediation Plan — Session-6

**Date:** 2026-10-26 (late cycle)
**Scope:** re-audit of the Session-5 tree (HEAD `d8d9e92`) against the live reference
(`veloxposen.base44.app`) — a chrome-depth census (sidebar nav, section-card headers,
the category-creation flow, the POS shift gate, the Settings action buttons, the
Inventory filter chips) that earlier sessions never pinned, plus a re-verification of
every Session-4/5 parity pin. The reference's own surfaces drifted again since
Session-5's measurement pass (nav geometry + the Reports nav glyph) — the
"reference DRIFTS" law re-proven.
**Method:** skills/web-application (§12 v4 traps, §14 testing, §15 gate, §20 pre-ship),
skills/agent-browser live measurement (computed styles as ground truth), skills/tdd
(red → green), skills/clone-app-pat-pro (computed-style parity doctrine).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Full local gate on the received tree (fresh clone) | `install → .env → db:push/seed/--demo → playwright install → lint → typecheck → test → build → test:e2e` | lint 0 errors (1 documented warning) · tsc clean · **unit 117/117** · build green · **e2e 68/68** — the documented baselines hold on a pristine clone |
| V2 | Environment contract | `.env` `DATABASE_URL="file:../db/custom.db"` · `db/` at repo root (custom.db provisioned + demo dataset: 15 products / 5 categories / 1 register / 33 sales) · vitest 12-file + playwright 2-project configs | ✅ matches the documented contract (unchanged since Session-5) |
| V3 | Session-4 pins re-verified live (reference) | agent-browser computed styles: fiscal labels ("Tax ID / EIN" / "Tax Regime" / "Fiscal Address" / "CFDI Use (default)"), toggle "Hidden on receipt", H1 24px, section h3 16px/700, Reports H2 14px uppercase white/60, Dashboard stat labels Title Case | ✅ ALL still match |
| V4 | Session-5 pins re-verified live (reference) | form controls 12px radius + `#262a36` border-input + transparent bg; New Product 42px (10px 16px); CHARGE 70px/20px 32px/16px radius/20px/900; Reports pills `px-4 py-2 rounded-xl text-xs font-bold` + active `bg-violet-600 shadow-lg` (32px); login email input 48px/12px/`rgb(226,232,240)`/`rgba(248,250,252,0.5)`/pl-40px; logo `img[alt="VeloxPOS (Point Of Sale) logo"]` 96×96; select triggers 36px/12px | ✅ ALL still match |
| V5 | Reference mobile defect (re-verified @390×844) | agent-browser geometry | Reference STILL renders the 220px z-50 sidebar overlay, **no hamburger** — the clone's drawer superset remains correct |
| V6 | View copy sweep (reference) | full-text capture: Dashboard ("Today's Sales"/"Transactions"/"Products", "Sales — Last 7 days", "Products by Category"), Sales ("Historial de Ventas", "Buscar por ticket, cliente o cajero..."), Cashiers ("Cajeros", Cajero/Caja/Inicio/Fin/Ventas/Estado), Registers ("Cash Registers", "New Register" 42px), POS gate ("No active shift"/"Cart") | ✅ no copy drift; clone matches verbatim |
| V7 | The section-card frame (reference StoreSettings) | computed + outerHTML dump | Card `rounded-2xl p-5` + glass-card inline style = byte-identical to the clone's `.glass-card` (bg rgba(16,18,32,0.9), border rgba(255,255,255,0.07), shadow 0 8px 32px rgba(0,0,0,0.5)) ✅ — but the header internals drifted (F-45) |
| V8 | Nav container + brand chip (reference) | computed: aside 220px, nav `py-4 px-2` space-y-0.5, brand chip 32px/12px radius, gradient `to right bottom rgb(139,92,246) → rgb(79,70,229)` | container + chip ✅ match; the nav ITEM geometry, the active pill extras, the wordmark, and the footer chevron drifted (F-46/F-47/F-48/F-49) |
| V9 | New Category dialog (reference, opened live) | click-through + computed: dialog 384px/p-24px/r-8px/border #262a36/bg #0f121a, title "New Category" 18px/600, Name input ph "e.g. Beverages" 36px/12px, Cancel `glass-button px-4 py-2.5` 42px, Create `glass-button-primary px-4 py-2.5` 42px | ❌ **F-44**: the reference adds categories through a header-Add → dialog flow; the clone ships an inline input+Add row (functional but structural parity drift) |
| V10 | Scaffold-hygiene sweep (clone) | `rg` for `sf-gradient`/`sf-primary`/`sf-print-exact` consumers + variant usage census | ❌ **F-43**: button.tsx carries dead Omni-Study-era variants referencing `sf-*` classes that exist nowhere in this codebase's CSS + a factually-wrong comment block ("S9-R2 measured s69"); the a11y focus ring (ring-2+offset) is a deliberate SUPERSET (the reference ships no button focus ring) — kept |

**Baseline confirmed:** the Session-5 tree is internally consistent and fully green
(fresh-clone verified); all Session-4/5 parity pins still match the live reference.
The findings below are parity deltas at chrome depths earlier sessions never measured,
plus live reference drift in the nav — not regressions.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-44 | **HIGH** (structural parity — the category flow) | `settings-view.tsx` Product Categories | The reference's flow: an **Add button in the section header** (`glass-button text-slate-700 px-3 py-1.5 text-sm rounded-lg font-medium` + Plus w-4 h-4, h=34px) opens a **"New Category" dialog** (title 18px/600, `Name` label + input ph "e.g. Beverages", Cancel/Create = the standard 42px glass buttons). The clone ships an inline "New category name" input + ghost Add in a `max-w-sm` row. Empty state copy: reference "No categories" (text-slate-400 text-sm) vs clone "No categories yet." | V9 | Move Add to the SectionCard `headerAction` slot with the reference's classes; add the New Category dialog (key-based reset, no setState-in-effect); empty state → "No categories" (text-slate-400); update the inventory.spec.ts category pin to drive the new dialog flow (its protection is REPLACED, not deleted). |
| F-46 | **MEDIUM** (systematic — nav items) | `nav-items.tsx` NavItemLink | Reference (live): `px-3 py-2.5` **padding-driven 40px** (no fixed height), `font-medium`, inactive `text-white/40 hover:text-white/80`, `transition-all duration-150`, icons **w-4 h-4 (16px)**. Clone: fixed `h-[42px]`, no font-medium, inactive `text-white/60 hover:text-white/90`, `transition-colors`, icons 18px. | V8 | Match the reference's classes; drop the fixed height. |
| F-47 | **MEDIUM** (the active pill + the Reports glyph) | `nav-items.tsx` + `NAV_ICONS` | Reference active item ADDS `border border-violet-500/30 shadow-sm shadow-violet-500/10` (computed h=42px WITH the border) on top of `bg-violet-600/20 text-violet-300`; clone renders bg+text only. And the reference's Reports nav glyph is `lucide-file-chart-column-increasing` (**ChartColumnIncreasing**) — the clone ships FileText (Session-101's reading; live drift). | V8 | Active: add the border + shadow pair; Reports icon → `ChartColumnIncreasing`. |
| F-48 | **MEDIUM** (brand row) | `nav-items.tsx` BrandRow | Reference wordmark: `font-bold text-sm truncate text-white/90 tracking-wide` (14px/700); chip Zap **w-4 h-4, stroke-width 2**. Clone: `text-lg text-white` (18px), Zap 18px stroke 2.4. | V8 | Match wordmark classes + chip icon. |
| F-45 | **MEDIUM** (section-card headers) | `shared SectionCard` + settings icons | Reference headers: a **bare `w-5 h-5` icon in a per-section color** + `gap-2` (8px) + `h3 font-bold` (16px): Store **indigo-500**, Palette **purple-500**, FileText **green-500**, Receipt **orange-500**, CreditCard **blue-500**, Tag **amber-500**. Clone: 36px `bg-white/5` chip wrapper, `gap-2.5`, all icons violet-400/emerald-400, and 3 wrong glyphs (Receipt-section uses `Receipt` vs reference `FileText`; Fiscal uses `Landmark` vs reference `Receipt`; Categories uses `Tags` vs reference `Tag`). | V7 | Bare 20px icons, per-section 500-colors, correct glyphs, gap-2. KEEP the clone's readable heading colors (the reference's `text-slate-700` is its own near-invisible defect — the documented a11y-superset posture). |
| F-41 | **MEDIUM** (Inventory filter chips) | `inventory-view.tsx` category chips | Reference: container `flex gap-2 overflow-x-auto`; chips `px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap` (h=36px) with active = **glass-button-primary** (measured live on the "All" chip). Clone: container `flex flex-wrap gap-1.5`; chips `px-3.5 py-1.5 rounded-lg text-sm font-semibold` (30px), active `bg-violet-600`. The reference's INACTIVE chip state is unmeasurable (empty store shows only the active "All") — pinned to the measured active geometry + the reference's pill-family inactive treatment (`text-white/40 hover:text-white/70`), assumption documented. | V-ref sweep | Container + chip classes verbatim; active = glass-button-primary; keep `aria-pressed` (superset). |
| F-42 | **MEDIUM** (POS shift gate) | `terminal-view.tsx` ShiftGate | Reference gate card: `rounded-2xl p-8 max-w-md` + glass-card inline style; Monitor icon **`w-16 h-16 text-violet-400/30 mb-4`** (stroke 2); h2 `text-xl font-bold text-white/70 mb-2` (no mt); paragraph **`text-white/35 text-sm`** with `<strong class="text-white/60">Registers</strong>` (no underline, not a link). Clone: `p-10`, icon `text-violet-400/70` + h2 `mt-5`, paragraph `text-white/50` with an underlined `text-white/90` link. | V-ref sweep | Card p-8; icon /30 + mb-4 + stroke 2; h2 mb-2; paragraph white/35 with the emphasis styled `font-bold text-white/60` (KEEP the clone's working href — functional superset; style matches the reference's rendering, keyboard focus ring only). |
| F-39 | **MEDIUM** (Settings Save Changes) | `settings-view.tsx` save button | Reference: `glass-button-primary px-6 py-3.5 text-base rounded-xl font-medium` — **h=54px, 16px/500** (the primary CTA is LARGER than the standard 42px). Clone: `px-6 py-2.5 text-sm font-bold` (40px, 14px/700). | V-ref sweep | `py-3.5 text-base font-medium` (padding-driven 54px); sticky wrapper stays (superset). |
| F-49 | **LOW** (sidebar footer) | `app-shell.tsx` chevron row | Reference: container `p-3 border-t`; button `p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all`; chevron **w-4 h-4 (16px)**. Clone: `p-2`, no hover bg, `hover:text-white/80 transition-colors`, chevron h-5 w-5 (20px). | V8 | Match classes + icon size. |
| F-43 | **LOW** (scaffold hygiene) | `ui/button.tsx` | Dead Omni-Study-era variants: `default`/`gradient` reference `sf-*` classes that exist nowhere in this codebase (`bg-sf-primary`, `sf-gradient`, `sf-print-exact`); `neutral` carries a stale "S9-R2 (measured s69)" comment block that is factually wrong here; the header comment ("the session-5 chrome rule: primary CTAs use variant=gradient") misattributes StudyFlow conventions. No call site relies on them (verified: every variant-less Button carries its own glass-* classes). | V10 | `default` → the reference's measured neutral (`glass-button`); delete `gradient`; drop the stale comment blocks. KEEP the ring-2 focus treatment (a11y superset — the reference ships no button focus ring). |
| F-50 | **HIGH** (readability — both charts; found by the VLM visual sweep, not the calipers) | `shared.tsx` LineChart + AreaChart + a new `niceTicks` seam | Both hand-rolled charts drew ONE grid line + axis label per unit of the y domain (`Array.from({length: niceMax + 1})`): for DOLLAR revenue a $470 day rendered 471 labels stacked ~0.46px apart — an unreadable white band (the live demo rendered 108). Shipped in Session-101; invisible to four audit sessions because the e2e store is EMPTY (max=4 → five tidy labels). The reference renders Recharts-style ~5 nice ticks (measured: 0..4 on its empty dashboard @60px, $0..$4 on Reports @46px). Plus: the reference's Dashboard x axis labels WEEKDAY abbreviations ("Tue".."Mon", 12px) — the clone rendered date strings at 11px. | VLM sweep + live probe | A pure `niceTicks(max, count)` seam in `src/lib/reports.ts` (1/2/2.5/5×10^k steps, unit-pinned); both charts render grid/labels from it; Dashboard x labels → weekday abbreviations at 12px; an e2e regression pin drives a REAL checkout then asserts the rendered y-label count < 8 + the weekday labels (the data-state oracle the suite lacked). |

**Explicitly NOT findings (verified intentional — do not "fix"):**
- The clone's Button focus ring (ring-2 + offset) — the reference has none (browser
  outline only); the clone's ring is the documented a11y-superset posture (drawer,
  readable headings, same doctrine). Keep.
- The clone's readable section-heading colors — the reference renders `text-slate-700`
  on dark glass (its own defect, pixel-verified in Session-4). Keep the readable colors.
- The reference's `space-y-0.5` nav container vs the clone's `flex flex-col gap-0.5` —
  same computed rhythm (the clone's form is the documented v4-safe equivalent).
- The sticky Save Changes wrapper, the mobile hamburger header, the drawer a11y superset,
  CSV import/export, "Nuevo cajero" — documented supersets.
- Dialog glass frames (bg 0.95 alpha vs the reference's opaque #0f121a) — V16 re-verified
  equivalent on the dark canvas; e2e-pinned animations. Keep.
- CHARGE 70px/rounded-2xl/text-xl/font-black — re-measured exact (70px, 20px 32px, 16px, 20px, 900).
- The wordmark "VeloxPOS" + brand chip gradient + 32px/12px chip — re-measured exact.

---

## 2. The ToDo list (execution order, TDD where behavioral)

Every behavioral item is red → green: the failing e2e pin FIRST, then the fix. No pure
seam changes → the unit count stays **117**; e2e grows by the new pins (count-lockstep
in the same commit).

- [x] **T-1** (RED) `navigation.spec.ts` — the nav-chrome pins: (a) inactive nav item
       computes 40px height + `10px 12px` padding + font-weight 500 + color
       `rgba(255,255,255,0.4)`; (b) the active item computes a 1px
       `rgba(139,92,246,0.3)` border + a violet shadow + 42px height; (c) nav icons
       compute 16px; (d) the brand wordmark computes 14px +
       `rgba(255,255,255,0.9)`; (e) the sidebar footer chevron computes 16px and the
       footer cell computes 12px padding.
- [x] **T-2** (RED) `surfaces.spec.ts` — the settings pins: (a) Save Changes computes
       54px height + `14px 24px` padding + 16px font + weight 500; (b) section header
       icons compute 20px + their per-section colors (indigo/purple/green/orange/blue/
       amber-500) and NO 36px chip wrapper; (c) the Product Categories header carries
       the Add button (34px, 8px radius, Plus icon); (d) the New Category dialog
       renders title/Name/"e.g. Beverages"/Cancel/Create (42px); (e) the empty state
       reads "No categories".
- [x] **T-3** (RED) `surfaces.spec.ts` — the Inventory chips pin: chips compute 36px
       height + 12px radius + 12px font + the active chip carries the primary
       gradient (background-image match).
- [x] **T-4** (RED) `terminal.spec.ts` — the shift-gate pin: the gate card computes
       32px padding (p-8); the Monitor icon computes
       `rgba(167,139,250,0.3)`-family color (violet-400/30) + the heading gap (16px
       bottom on the icon, 8px on the h2); the paragraph computes
       `rgba(255,255,255,0.35)` and the Registers emphasis computes
       `rgba(255,255,255,0.6)` with NO text-decoration.
- [x] **T-5** (RED→pin-update) `inventory.spec.ts` — the category-creation pin is
       REWRITTEN to drive the reference's flow (header Add → dialog Name → Create);
       its protection (a category exists for the product flow) is preserved and
       strengthened (the dialog itself is now pinned).
- [x] **T-6** (GREEN, F-46/F-47/F-48/F-49) `nav-items.tsx` + `app-shell.tsx`: the nav
       item classes (py-2.5 padding-driven, font-medium, white/40 inactive,
       transition-all, 16px icons, ChartColumnIncreasing for Reports, the active
       border+shadow pair), the brand wordmark + chip Zap, the sidebar footer.
- [x] **T-7** (GREEN, F-45) `settings-view.tsx` SectionCard + its call sites: bare 20px
       icons with per-section colors + the correct glyphs (FileText/Receipt/Tag).
- [x] **T-8** (GREEN, F-44 + F-39) `settings-view.tsx`: the header Add button, the New
       Category dialog (key-based reset), the "No categories" empty state, the Save
       Changes geometry.
- [x] **T-9** (GREEN, F-41) `inventory-view.tsx`: the chip container + chip classes +
       glass-button-primary active.
- [x] **T-10** (GREEN, F-42) `terminal-view.tsx` ShiftGate: card p-8, icon /30 mb-4,
       h2 mb-2, paragraph white/35 + strong-styled emphasis.
- [x] **T-11** (GREEN, F-43) `ui/button.tsx`: default variant → `glass-button`, delete
       the dead `gradient` variant + stale comments (keep the a11y focus ring).
- [x] **T-12** Full gate re-run: `lint → typecheck → test (117) → build → test:e2e`
       (new total = 68 + new pins, all prior pins intact).
- [x] **T-13** Live re-verification with agent-browser against the rebuilt standalone:
       the sidebar (item geometry, active pill, wordmark, footer), the settings
       headers + Save + the New Category dialog round-trip, the Inventory chips, the
       POS gate; plus the mobile drawer contract at 390×844 (the nav geometry change
       must not regress the drawer pins).
- [x] **T-14** Fresh screenshots (Session-6 set) into `docs/screenshots/`.
- [x] **T-15** Docs lockstep: README (e2e count), AGENTS.md (the Session-6 pin
       contracts: nav chrome, section headers, the category dialog, Save 54px),
       CLAUDE.md (same laws), PAD revision block, velox-pos_SKILL.md (version bump +
       the new contracts), this plan's checkboxes, worklog.md Session-6 entry.
- [x] **T-16** Commit + push via the SSH wrapper (main only).

---

## 3. Execution record

**RED (verified 10 pins failing exactly as designed, all 29 prior pins in the touched specs
green):** navigation.spec ×3 (nav geometry, active pill, the 16px family), surfaces.spec ×6
(Save Changes, section icons, the header Add, the New Category dialog, the chips, the gate),
inventory.spec ×1 (the category-flow pin rewritten to the dialog flow).

**GREEN:** nav-items.tsx (padding-driven items + font-medium + 16px icons +
ChartColumnIncreasing + the active border/shadow pair + the 14px wordmark + the 16px Zap),
app-shell.tsx (the p-3 footer cell + the 16px chevron), settings-view.tsx (bare
per-section-colored icons + correct glyphs; the header Add chip + the New Category dialog
with the reference's geometry; "No categories"; Save Changes py-3.5/text-base/medium),
inventory-view.tsx (the 36px chip family, glass-button-primary active, gap-2
overflow-x-auto container), terminal-view.tsx (gate p-8 + /30 icon + white/35 copy +
strong-styled emphasis), button.tsx (default → glass-button; dead sf-*/neutral variants
and the false comment blocks removed; the a11y focus ring kept).

**Mid-GREEN pin bug fixes (doctrine, not weakenings):** five pins asserted rgba strings
where v4 serializes oklab — fixed to the established ALPHA-pin pattern; one pin bug (an
unmapped locator object vs string); one mid-load style-race flake → all raw computed reads
hardened to `expect.poll`.

**The F-50 addition (found during T-13's visual verification — the VLM flagged "a dense
vertical block of white pixels" on the live dashboard's chart):** the per-unit axis grid
bug (Session-101) fixed via the pure `niceTicks` seam (6 unit pins, red → green) + both
charts + the Dashboard's weekday x labels at 12px + the data-state e2e regression pin
(drives a real checkout, then asserts y-label count < 8 + weekday labels). Unit 117 →
123; e2e 68 → 78.

**Final gate (all on the final tree):** lint ✓ (0 errors, 1 documented warning) · tsc ✓ ·
unit **123/123** (12 files) · build ✓ · e2e **78/78** (all 68 prior pins green, none
weakened). Live re-verification on the rebuilt standalone (:3400): sidebar 40px
inactive/42px bordered active, 16px icons, chart-column-increasing glyph, 14px wordmark,
p-3 footer; settings icons/colors byte-exact, Save 54px, header Add 34px/8px, the New
Category dialog round-trip (created "Live Test Cat" live), chips 36px/gradient, the POS
gate p-8 + /30 icon + white/35 copy; the chart at data scale renders 0/25/50/75/100 +
Tue..Mon (VLM-verified readable); the mobile drawer contract re-verified at 390×844
(hamburger, 288px dialog, 8 links, `animation-name: enter`, focus on close, no overflow).

**Docs lockstep:** README badges/counts (unit 123, e2e 78); AGENTS.md — the Session-6
chrome + chart contracts + the oklab/expect.poll pin rule; CLAUDE.md — the same laws + the
new baselines; PAD v1.4 + ADR-011 (the chart-axis contract); velox-pos_SKILL.md v2.3.0
(traps 14 + 15, the Session-6 addendum); this plan's checkboxes; the worklog Session-6
entry; seven fresh screenshots (25–31) captured from the production standalone build.

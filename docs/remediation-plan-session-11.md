# VeloxPOS Remediation Plan — Session-11

**Date:** 2026-10-27 (Session-11 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-10 tree (HEAD `b43821b`
= `939d3a6` + the operator's session-log commit). A full received-tree gate re-verification,
a live reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law —
FIFTH consecutive cycle), and this cycle's NEW-depth audit: **the dialog family** (containers,
titles, labels, inputs, buttons, widths, the select dropdown surface) and **the form-text color
family** — surfaces every prior session copy-pinned or geometry-pinned but never measured at
the color/container depth inside dialogs. Also the static Tailwind-v4 trap sweep, the
mobile-drawer live contract check, a recent-changes audit (the Session-10 commits), and a
security/invariant scan.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16 security),
skills/agent-browser (live computed-style measurement — computed styles are ground truth),
skills/tdd (red → green), skills/clone-app-pat-pro (the reference's own DOM/computed styles as
the contract at parity depth).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the workspace had been reset) + `cp .env.example .env` (AUTH_SECRET generated; `DATABASE_URL="file:../db/custom.db"` per the contract) + `bun install` (485 pkgs) + `db:push` + `db:seed` + `--demo` (15 products / 5 categories / 1 register / 33 sales) + `bunx playwright install chromium` (1243, per the lockfile's Playwright 1.63.0) | environment fully provisioned |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Build + smoke on the received tree | `bun run build` + `./scripts/smoke-test.sh` | build green (hygiene-clean artifact; `ƒ /` in the route table) · smoke **13/13** |
| V4 | E2E on the received tree | `CI=1 bun run test:e2e` (both projects) | **84/84** — the Session-10 baseline holds |
| V5 | Reference: sidebar nav | agent-browser computed styles @1440×900 | ✅ all pins hold: aside 220px rgb(13,15,26) + 1px rgb(30,34,53); nav `16px 8px`; items padding-driven 40px inactive / 42px active; active rgb(196,181,253) + rgba(124,58,237,0.2) + 1px border + shadow; inactive white/40; cursor pointer; wordmark 14px/700/0.35px; 8 links; hrefs = the clone's exact 8 paths |
| V6 | Reference: POS gate + CHARGE + glyph | computed | ✅ card p-8/h2 20px mb-8 (white/70)/icon 64px rgba(167,139,250,0.3) sw-2/para white/35/STRONG white/60/700 no underline; `lucide-file-chart-column-increasing` (the FILE variant); gate h2 color white/70 (the clone MATCHES — not a finding) |
| V7 | Reference: Dashboard + Reports | computed | ✅ H1 24px/700; 2 h3s 16px/700; the stat families byte-exact (Dashboard: 40px solid-gradient chips + white icons + `font-semibold text-slate-500` labels + `font-bold mt-1` values + `-top-6 -right-6 w-20 h-20 opacity-20` gradient blobs; Reports: 48px `rounded-2xl` `/15`+`/30` chips LEFT, 24px tone-400 icons, 400 white/35 labels, 900 white values); pills 32px `8px 16px` 12px/700 in the rgba(28,31,52,0.85) container; section h2s 14px uppercase white/60 |
| V8 | Reference: Settings + Spanish copy + Cashiers | computed | ✅ fiscal labels ("Tax ID / EIN"/"Tax Regime"/"Fiscal Address"/"CFDI Use (default)"); 6 section h3s; Save 54px gradient; Add chip 34px `6px 12px` 14px/500 glass-button-gray; section icons indigo/purple/green/orange/blue/amber-500; "Historial de Ventas"/"Cajeros"/"Turnos Recientes" verbatim |
| V9 | Reference: mobile state @390×844 | viewport + geometry | ✅ the reference's OWN defect still present: the 220px z-50 sidebar overlays content, NO hamburger — the clone's drawer-superset posture remains correct (the clone's 13 mobile e2e pins green on the received tree) |
| V10 | Reference: login internals | cookies cleared → computed | ✅ card `blur(4px)` (F-59 holds) + white/95 + overflow hidden; inputs 48px rgba(248,250,252,0.5) + rgb(226,232,240) + 12px radius; **input TYPED-text color rgb(9,9,11)** (zinc-950 — feeds F-70); logo 96px; SSO 54px 16px/500 pointer |
| V11 | **NEW DEPTH — the reference's dialog family** (never measured before) | open each dialog (client-side; the reference 403s writes) → computed styles + DOM | ⚠️ **The contract measured**: container = **solid rgb(15,18,26) #0f121a** bg + **1px rgb(38,42,54) #262a36** border + **NO backdrop-filter** + shadow-lg(v3 values) + rounded-lg 8px + p-6; New Register w **512px** (max-w-lg); New Category w **384px** (max-w-sm); New Product w **512px** (max-w-lg); titles `<h2>` 18px/600 **rgb(231,233,239) #e7e9ef** tracking -0.45px; labels 14px/500 **#e7e9ef**; inputs **36px** (h-9) 12px radius #262a36 transparent bg **text #e7e9ef**; Cancel = **the gray glass-button** (rgba(28,31,52,0.85) + white/9 + rgba(200,210,255,0.8) + 42px + 12px radius + pointer); Create = **the 135° violet gradient** + violet/45 border + white + 42px, disabled = opacity .5 + not-allowed; close X hit-area 36px |
| V12 | **NEW DEPTH — the reference's select dropdown** | open the Category select inside the New Product dialog → computed | ⚠️ listbox = **rgb(22,25,34) #161922** bg + 1px #262a36 border + **6px radius** (rounded-md) + p-0 + no blur |
| V13 | **NEW DEPTH — the reference's form-label census** (Settings + dialogs) | computed across all `label` elements | ⚠️ **every label computes rgb(231,233,239) #e7e9ef at 14px/500** (the same value as the clone's `--foreground` token — the clone ships 35 `<Label className="text-white/70">` overrides + `text-white` input/title overrides that bypass it) |
| V14 | Local parity audit (production standalone :3400, script-owned lifecycle) | agent-browser computed styles against the local build | ⚠️ dialogs compute rgba(13,15,26,0.95) + **blur(20px)** + **white/0.06 border** (the `glass-dark` class) — the per-usage `border-edge` override is INERT (trap #15); register dialog w **448px**; Cancel computes **transparent/0-border/white-70** (bare ghost) at 6 dialog sites; labels compute oklab-white/0.7; titles/input text compute **rgb(255,255,255)**; select content computes **#10121e** (--popover token) |
| V15 | **The login typed-text probe** (the F-70 evidence) | fill the local clone's login email input → `getComputedStyle().color` | ⚠️ **the clone's login inputs compute rgb(231,233,239) for TYPED text — near-white on the near-white card (contrast ≈ 1.1:1, effectively INVISIBLE credentials)**. The `.theme-light` scope re-points `--foreground`, but nothing APPLIES it to the inputs — they inherit the dark-theme body color. The reference computes rgb(9,9,11). Every e2e passed because Playwright fills don't read rendered text; every prior login screenshot showed the EMPTY form |
| V16 | Static Tailwind-v4 trap sweep | rg across `src/app/*.css` + components | ✅ no `@layer utilities` custom classes (the 3 hits are documentation comments); `@theme inline` in place; `@custom-variant hover (&:hover)`; `tw-animate-css` imported; NO `tailwind.config.*`; `backdrop-blur-xs` correctly on both the drawer backdrop AND the login card (F-59 held); **--shadow-lg unpinned but v4's value = v3's (only sm/md shifted — verified against the reference's computed dialog shadow)** |
| V17 | Session-10 change audit | `git show 939d3a6` review (the blur swap, the root page, the stat families, the muted tones) | ✅ all five Session-10 cures verified live on the local build (blur(4px) on the card, `/` landing, both stat families, the slate tones) |
| V18 | Security/invariant scan | rg: dangerouslySetInnerHTML, parseFloat in components, alert(, console.log | ✅ none found; money math stays in the seams; ownership scoping intact (10 userId sites in entities.ts); Zod strip present |
| V19 | bg-card / bg-popover blast-radius (before re-pointing tokens) | rg usages | ✅ Tabs component: NOT USED; Button outline variant: NOT USED; popover.tsx / dropdown-menu.tsx: NOT USED — `bg-card` lives only on dialog + alert-dialog primitives; `bg-popover` only on SelectContent → both token re-points are surgical |

**Baseline verdict:** the Session-10 tree is green end-to-end (V2–V4) and the reference has
NOT drifted for the FIFTH consecutive cycle — but this cycle's NEW depth (the dialog family +
the form-text census + the typed-state login probe) found **one HIGH functional-visual defect
(invisible typed credentials on the login card) and five container/color-family gaps**, all
clone-side. One candidate finding (the dialog Create as an outline button) was **RETRACTED by
re-measurement** — the first read captured `background-color: transparent` and missed the
135° gradient in `background-image`; the clone's `.glass-button-primary` matches the reference
exactly (the re-verify-before-acting discipline in practice).

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| **F-70** | **HIGH** (functional-visual defect — typed credentials are invisible on the login card) | `src/components/ui/input.tsx` (base) + `src/app/tokens.css` (.theme-light) + `textarea.tsx`/`select.tsx` | The login/reset inputs compute **rgb(231,233,239) for TYPED text** — near-white on the rgba(248,250,252,0.5) filled card (contrast ≈ 1.1:1). Root cause: the base Input/Textarea/SelectTrigger ship NO text color, and the `.theme-light` scope's `--foreground` re-point (the whole point of the Session-5 `@theme inline` fix) never REACHES them — they inherit the dark-theme body color. The reference computes **rgb(9,9,11)** (zinc-950). Shipped since Session-101; invisible to every e2e (fills don't read rendered text) and every screenshot (empty forms). | V10 (ref rgb(9,9,11)) vs V15 (clone rgb(231,233,239)) | (1) The base components own the color (the Session-5 doctrine): `text-foreground` on Input, Textarea, SelectTrigger — app scope resolves #e7e9ef, `.theme-light` resolves dark. (2) Re-point `.theme-light --foreground` `222 47% 11%` → `240 10% 4%` (zinc-950, byte-exact vs the measured rgb(9,9,11)). (3) E2E pin: fill the login email → assert the computed color `rgb(9, 9, 11)`. |
| **F-64** | **MEDIUM** (visual parity — the dialog container family) | all 9 `DialogContent`/`AlertDialogContent` sites (registers ×3 + alert, inventory + alert, cashiers, terminal ×2, sales, settings) + `tokens.css --card` | The reference's dialogs compute a **SOLID rgb(15,18,26) #0f121a** panel + **1px rgb(38,42,54) #262a36** border + **NO backdrop-filter** + shadow-lg + rounded-lg + p-6. The clone ships `glass-dark border-edge` on every dialog: rgba(13,15,26,0.95) + **blur(20px)** + **white/0.06 border** — and the `border-edge` utility is INERT (trap #15: unlayered glass wins), so a past attempt to fix the border computed nothing. The primitive's own `bg-card border-border` is the right mechanism, but `--card` = #0d0f1a ≠ the measured #0f121a. | V11 (ref) vs V14 (clone) | (1) Strip `glass-dark border-edge` from all 9 sites — the primitive owns the surface. (2) Re-point `--card: 229 33% 10%` → `224 27% 8%` (computes #0f121a exactly; Tabs/outline/popover confirmed unused — V19). (3) Extend the primitive's Close hit-area to the reference's 36px (`flex h-9 w-9 items-center justify-center`). (4) E2E pins: the register dialog computes bg rgb(15,18,26) + border rgb(38,42,54) + `backdrop-filter: none` + width 512px; the category dialog width 384px. (5) The mobile drawer KEEPS glass-dark (the clone's own superset — no reference contract). |
| **F-66** | **MEDIUM** (visual parity — the #e7e9ef form-text family) | 35 `<Label className="text-white/70">` sites (settings 16, inventory 10, registers 4, cashiers 3, terminal 2) + 11 `DialogTitle className="text-white"` + ~14 per-field `text-white` Input/SelectTrigger overrides | The reference's form text is ONE family: **every label computes rgb(231,233,239) #e7e9ef at 14px/500; dialog titles #e7e9ef at 18px/600; input text #e7e9ef**. The clone's `--foreground` token is ALREADY `221 28% 93%` (#e7e9ef) — but 60+ per-field overrides (white/70 labels, text-white titles/inputs) bypass it with values the reference never ships. The same substitution genus as Session-10's F-63 (copy pinned, treatments not). | V13 (ref) vs V14 (clone) + the token audit | (1) The base owns it (the Session-5 doctrine): `text-foreground` on the Label primitive. (2) Strip the 35 `text-white/70` Label overrides, the 11 `text-white` DialogTitle overrides, and the per-field `text-white` Input/SelectTrigger overrides (they fall to foreground = #e7e9ef). (3) The "Upload logo" label rides to font-medium (ref 500). (4) E2E pins: a Settings label + the register dialog's title/input text compute rgb(231,233,239). |
| **F-67** | **MEDIUM** (visual parity — the dialog Cancel family) | 6 dialog Cancel sites (registers-view ×3, inventory-view ×1, cashiers-view ×1, terminal-view ×1) + 2 AlertDialogCancel sites | The reference's dialog Cancel = **the gray glass-button** (rgba(28,31,52,0.85) + 1px white/0.09 + rgba(200,210,255,0.8) + 42px + 12px radius + pointer). The clone ships a bare `variant="ghost" className="text-white/70"` at 6 sites → computes TRANSPARENT bg, 0 border — a visibly different (unstyled-looking) button. The clone's own category-dialog Cancel already matches (glass-button) — the family is internally inconsistent. | V11 (ref) vs V14 (clone: transparent/0/white-70) | Apply the category-dialog's own pattern at all 8 sites: `glass-button rounded-xl border-0`. E2E pin: the register dialog's Cancel computes the rgba(28,31,52,0.85) gray. |
| **F-69** | **LOW-MEDIUM** (visual parity — the select dropdown surface) | `tokens.css --popover` (`230 32% 9%` → #10121e) | The reference's select dropdown (listbox) computes **rgb(22,25,34) #161922** + 1px #262a36 + 6px radius. The clone's `--popover` computes **#10121e** — a visibly darker dropdown. Radius/border already match (rounded-md + border-border); only the bg hex drifts. | V12 (ref) vs V14 (clone) | Re-point `--popover: 230 32% 9%` → `225 21% 11%` (computes #161922 exactly). E2E pin: the opened Category select's listbox computes rgb(22,25,34). |
| **F-68** | **LOW** (visual parity — the register dialog width) | `registers-view.tsx:86` | The reference's New Register dialog is **512px** (max-w-lg); the clone ships `sm:max-w-md` (448px) — 64px narrower. (The category 384 and product 512 dialogs already match.) | V11 vs V14 | `sm:max-w-md` → `sm:max-w-lg`. Rides F-64's width pin. |

**Explicitly NOT findings (verified — do not "fix"):**
- **F-65 (RETRACTED)**: the dialog Create buttons — the first read measured
  `background-color: transparent` and concluded "outline button"; the re-measurement captured
  `background-image: linear-gradient(135deg, rgb(124,58,237), rgb(99,102,241))` — the reference's
  Create IS the 135° violet gradient + violet/45 border, i.e. the clone's `.glass-button-primary`
  byte-exact (plus disabled opacity .5 + not-allowed — also byte-exact). Lesson recorded in
  §3: gradient buttons live in `background-image`, NOT `background-color` — always measure both.
- The POS gate h2 `text-white/70` — measured rgb(255,255,255,0.7) on the reference; the clone
  matches (the earlier suspicion was disproven by measurement).
- The oklab serialization of `text-white/70` — the color equals rgba(255,255,255,0.7); the
  FINDING is the value family (F-66), not the serialization.
- The dialog Close button's `aria-label` — the reference ships none; the clone's sr-only
  "Close" is the documented a11y superset (kept; the 36px hit-area is the only measured delta).
- The `--shadow-lg` unpinned state — v4's lg value is v3's lg value (only xs/sm/md shifted);
  the reference's computed dialog shadow matches the clone's primitive.
- The chevron/drawer icon-button tones (white/30, white/70) — measured matching on the
  reference (V6).
- The cashier dialog's Spanish "Cancelar" — the reference's Cashiers view ships NO
  New-Cashier button (0 usuarios, demo-restricted) — no contract exists; the mixed-copy
  doctrine keeps it.

---

## 2. The ToDo list (execution order, TDD where behavioral)

- [x] **T-1** (RED, F-70) auth.spec: fill the login email input → assert the computed
       `color` = `rgb(9, 9, 11)` (zinc-950 — the reference's TYPED-text color). RED proof:
       the current tree computes `rgb(231, 233, 239)` (invisible-on-white).
- [x] **T-2** (RED, F-64+F-68) registers-shifts.spec (new test): open the New Register
       dialog → assert the container computes `background-color: rgb(15, 18, 26)`,
       `border: 1px solid rgb(38, 42, 54)` (via border-color), `backdrop-filter: none`,
       and `width: 512px`. RED proof: the current tree computes rgba(13,15,26,0.95) +
       white/6 + blur(20px) + 448px.
- [x] **T-3** (RED, F-67) same test: the dialog's Cancel computes
       `background-color: rgba(28, 31, 52, 0.85)` (the gray glass family). RED proof:
       the current tree computes transparent.
- [x] **T-4** (RED, F-66) same test: the dialog's title (`h2`) and its "Name *" label and
       the name input's typed text all compute `rgb(231, 233, 239)`. RED proof: the
       current tree computes rgb(255,255,255) / oklab-white-0.7.
- [x] **T-5** (RED, F-64) inventory.spec: the New Category dialog computes the solid
       `rgb(15,18,26)` + `rgb(38,42,54)` border + `backdrop-filter: none` + width 384px.
       RED proof: glass-dark values.
- [x] **T-6** (RED, F-69) inventory.spec (new test): in the New Product dialog, open the
       Category select → the listbox computes `background-color: rgb(22, 25, 34)` +
       `border-radius: 6px`. RED proof: the current tree computes rgb(16,18,30).
- [x] **T-7** (RED, F-66) surfaces.spec (new test): the Settings form labels ("Store name *",
       "Address", …) compute `color: rgb(231, 233, 239)` at 14px/500. RED proof:
       oklab-white-0.7.
- [x] **T-8** (GREEN, F-70) `input.tsx` + `textarea.tsx` + `select.tsx` (trigger): add
       `text-foreground` to the base classes; `tokens.css` `.theme-light --foreground` →
       `240 10% 4%` (zinc-950). Verify the app-scope inputs still resolve #e7e9ef
       (foreground unchanged there).
- [x] **T-9** (GREEN, F-64) strip `glass-dark border-edge` from the 9 dialog sites;
       `tokens.css --card` → `224 27% 8%`; extend the dialog Close hit-area
       (`flex h-9 w-9 items-center justify-center`); `registers-view.tsx:86` →
       `sm:max-w-lg` (F-68 rides).
- [x] **T-10** (GREEN, F-66) `label.tsx` base += `text-foreground`; strip the 35 Label
       `text-white/70` overrides, the 11 DialogTitle `text-white` overrides, and the
       per-field `text-white` Input/SelectTrigger overrides (the base now owns the color);
       the "Upload logo" label → `font-medium`.
- [x] **T-11** (GREEN, F-67) the 6 dialog Cancel sites + 2 AlertDialogCancel sites →
       `glass-button rounded-xl border-0` (the category dialog's own pattern).
- [x] **T-12** (GREEN, F-69) `tokens.css --popover` → `225 21% 11%`.
- [x] **T-13** Docs-counts lockstep: e2e 84 → the new count (every live-tense count site
       in the SAME commit: README badge/rows, CLAUDE, AGENTS, PAD, the SKILL,
       vitest.config.ts's header, the docs-counts constants).
- [x] **T-14** Full gate re-run: `lint 0 (1 documented warning) → tsc clean → unit 133/133
       → build green (hygiene-clean) → smoke 13/13 → e2e <new>/<new>` — no prior pin
       weakened.
- [x] **T-15** Live re-verification on the rebuilt standalone (the Session-11 evidence
       script): the six fixes measured live (the typed-text color, the dialog container
       family on register + category + product dialogs, the Cancel family, the #e7e9ef
       family, the select surface), the checkout journey, the mobile drawer contract at
       390×844. Fresh screenshots (55–60). VLM spot-check (settle-wait discipline).
- [x] **T-16** Docs lockstep: README (counts), AGENTS.md (the dialog-container contract +
       the form-text family + the F-70 trap), CLAUDE.md (the same), PAD v1.9 (the revision
       block + counts), velox-pos_SKILL.md v2.7.0 (the new traps + the Session-11
       addendum + counts), this execution record, the worklog entry,
       `docs/session_17.md` (the narration, one-ahead numbering).
- [x] **T-17** Commit + push via the SSH wrapper (main only; the key deployed outside the
       repo, 0600, shredded after the push per the runbook).

---

## 3. Execution record

**RED (T-1–T-7):** the four new tests + the extended first inventory test,
all proven RED against the pre-fix standalone. Observed diffs:
`rgb(231, 233, 239) ≠ rgb(9, 9, 11)` (F-70 — the invisible typed text),
`rgba(13, 15, 26, 0.95) ≠ rgb(15, 18, 26)` (F-64 — the glass-dark container,
register AND category dialogs), the product-dialog + listbox containers
(F-64/F-69), and the Settings label family (F-66 — oklab white/0.7 ≠
#e7e9ef). The F-67/F-68 pins ride the register-dialog test (it failed at the
container assertions first; both were proven in the GREEN run).

**GREEN (T-8–T-12):**
- **F-70**: `text-foreground` added to the base Input + Textarea
  (SelectTrigger already carried it); `.theme-light --foreground` re-pointed
  `222 47% 11%` → `240 10% 4%` (zinc-950 — byte-exact vs the measured
  rgb(9,9,11)).
- **F-64**: `glass-dark border-edge` stripped from the 11
  DialogContent/AlertDialogContent sites (the sweep also caught **4
  SelectContent sites** carrying the same inert glass-dark override — they
  would have defeated the --popover re-point per trap #15); `--card`
  re-pointed `229 33% 10%` → `224 27% 8%` (computes #0f121a exactly); the
  primitive's Close hit-area extended to the reference's 36px
  (`flex h-9 w-9 items-center justify-center`). The mobile drawer KEEPS
  glass-dark (the clone's own superset surface — no reference contract).
- **F-66**: `text-foreground` added to the base Label; the 35
  `text-white/70` Label overrides, the 11 `text-white` DialogTitle
  overrides, ~26 standalone `className="text-white"` Input lines, and the 4
  `SelectTrigger className="text-white"` overrides stripped; the two native
  switch-row labels (`Active product`) → `text-foreground` (the reference's
  own "Active product" label measured #e7e9ef); the "Upload logo" label →
  `font-medium` (the reference's 500). En-route catch: the re-pointed
  `--foreground` triplet `221 28% 93%` actually computed **#e8ebf2**
  (rgb(232,235,242)) — its "#e7e9ef" comment was a past rounding
  approximation, caught by the label pin reading rgb(232,235,242). All five
  foreground-family triplets re-pointed to the exact `225 20% 92%`
  (computes rgb(231,233,239) — verified live).
- **F-67**: the 6 ghost Cancel sites + 2 AlertDialogCancel sites + the
  receipt dialog's "Cerrar" → `glass-button rounded-xl border-0` (the
  category dialog's own measured pattern).
- **F-68**: `sm:max-w-md` → `sm:max-w-lg` (512px).
- **F-69**: `--popover` re-pointed `230 32% 9%` → `225 21% 11%` (computes
  #161922 exactly).

**En-route test-doctrine catch (the poll rule strikes again):** the raw
dialog-width reads raced the 200ms `zoom-in-95` entrance (the register
dialog read 511.58 mid-zoom) — all three width pins hardened to
`expect.poll`, per the F-51 doctrine (every raw computed read polls).

**Lockstep (T-13):** E2E 84 → 88 (+4 tests: the typed-text pin, the
register-dialog contract, the product-dialog + select, the Settings label
family — the category-dialog container pins EXTENDED the existing first
inventory test, not a new one). Updated: the docs-counts constants (E2E=88,
"Session-11 lock", "74 desktop + 13 mobile + 1 setup"), README (badge +
commands + testing), CLAUDE (baseline), PAD (the scale line + §9), the
SKILL (header baselines + §3 + §12). Gate 133/133 green after the sweep.

**Final gate (T-14):** `bun run gate` end-to-end — lint 0 errors (1 documented
warning) · tsc clean · unit **133/133** (13 files) · build green
(hygiene-clean; `ƒ /` in the table) · smoke **13/13** · e2e **88/88** — no
prior pin weakened.

**Live evidence (T-15):** `scripts/capture-s11-evidence.mjs` **12/12** —
F-70 live (the TYPED text computes rgb(9, 9, 11) — visible credentials),
F-64 live (all three dialogs: solid #0f121a + #262a36 + NO blur, at 512 /
384 / 512px), F-67 live (the Cancel gray rgba(28,31,52,0.85)), F-66 live
(the dialog title/label/input + four Settings labels at #e7e9ef), F-69
live (the listbox #161922 + 6px), the checkout journey (the cart accumulated
$19.72 → the receipt allocated **T-000039**), and the mobile drawer
contract (hamburger → role=dialog, 8 links, no overflow at 390×844). Six
fresh screenshots (55–60). VLM sweep: **6/6 effective** — including the
typed-text legibility check (55) and the drawer (60).

**Docs lockstep (T-16):** README (the 88 sites), AGENTS.md (the
dialog-container contract + the form-text family + the F-70 trap), CLAUDE.md
(the same), PAD v1.9 (the revision block), velox-pos_SKILL.md v2.7.0 (traps
22/23/24 + the Session-11 addendum), this execution record, the worklog
entry, `docs/session_17.md` (the narration, one-ahead numbering).
`.env.example` re-verified (unchanged — no env contract changed this cycle).

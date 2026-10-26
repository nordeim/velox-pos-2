# VeloxPOS Remediation Plan — Session-5

**Date:** 2026-10-26 (evening cycle)
**Scope:** re-audit of the Session-4 tree (HEAD `dab7f4f`) against the live reference
(`veloxposen.base44.app`) — a computed-style sweep at the form-control / button /
login-surface depth that earlier sessions never pinned, which surfaced **the
Tailwind v4 `@theme` non-inline theme-switching bug** (the login card's light scope
never reaching themed utilities) plus a systematic input-radius/border drift.
**Method:** skills/web-application (§12 v4 traps — the `@theme inline` law, §14
testing, §15 gate), skills/agent-browser live measurement (computed styles as
ground truth), skills/tdd (red → green), skills/clone-app-pat-pro
(computed-style parity).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Full local gate on the received tree | `lint → typecheck → test → build → test:e2e` (deps + Prisma client pre-installed; browsers present) | lint 0 errors (1 documented warning) · tsc clean · **unit 117/117** · build green · **e2e 55/55** |
| V2 | Environment contract | `.env` `DATABASE_URL="file:../db/custom.db"` · `db/` at repo root (custom.db + e2e.db) · vitest 12-file + playwright 2-project configs | ✅ matches the documented contract (unchanged since Session-4) |
| V3 | Session-4 pins re-verified live (reference) | agent-browser computed styles: StoreSettings fiscal labels ("Tax ID / EIN" / "Tax Regime" / "Fiscal Address" / "CFDI Use (default)"), toggle `toggle-left` + "Hidden on receipt", help paragraph, H1 24px / sections 16px / Reports H2 14px uppercase, Title Case stat labels, login canvas gradient `to right bottom #f8fafc→#f1f5f9`, cart "Added" banner classes `transition-all duration-300 overflow-hidden max-h-0 opacity-0` | ✅ ALL Session-4 pins still match the live reference |
| V4 | Reference mobile defect (re-verified @390×844) | agent-browser geometry | Reference STILL renders the 220px z-50 sidebar overlay, **no hamburger** — the clone's drawer superset remains correct |
| V5 | Clone mobile drawer (live @390×844, standalone :3400) | agent-browser | hamburger visible · sidebar `display:none` · drawer 288px `role=dialog` · 8 links · `animation-name: enter` · focus on close button · no horizontal overflow — **the mobile-nav bug class stays fixed** (13 e2e pins green) |
| V6 | View-by-view text drift sweep (8 routes, both sites) | full text-node capture + set-diff (explicit navigation per site; the CLI sessions share one tab) | Only data-driven diffs (the reference is in empty states) + Next.js runtime noise — **no copy drift**; Reports pills confirmed identical text |
| V7 | **Form-control geometry census (both sides, all surfaces)** | computed `borderRadius`/`border`/`backgroundColor` on every input/textarea/select — StoreSettings (13 controls), New Product dialog (8), Inventory search, login (2) | ❌ **F-27**: EVERY reference control computes radius **12px** + border `#262a36` (`border-input`) + bg transparent; the clone computes 6px + `#1e2235` (border-edge) + white/5 |
| V8 | **The theme-switching mechanism (live probe)** | `getComputedStyle` on `main.theme-light` vs `:root` | ❌ **F-28**: `--input` re-points to `214 32% 91%` on the wrapper, but `--color-input` reads the **:root-baked** `hsl(231 27% 22%)` — non-inline `@theme` bakes `hsl(var(--input))` at `:root`; scoped re-pointing can never reach the utilities (the login inputs render dark borders on the light card) |
| V9 | Reference token set (app shell vs :root) | `getComputedStyle` var walk (the reference re-points tokens on its app wrapper: `--input/--border 225 18% 18%`, `--muted-foreground 220 12% 50%`, `--ring 252 87% 67%`, …) | The clone's `:root` equals the reference's `:root` base; the reference's rendered app uses the scoped dark set — the clone's tokens need the scoped values baked into `:root` (the app is permanently dark) |
| V10 | Reference login surface (computed + full class capture) | input classes, card frame, logo, SSO buttons, sign-in button, top strip | ❌ **F-29/F-30/F-31/F-32/F-33/F-38**: inputs `h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600 pl-10` (48px, light); card `bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden` + content wrapper `p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10` + a 4px top gradient strip (`from-slate-200 via-slate-300 to-slate-200`); the logo is a 96×96 `<img>` (hexagonal crystal asset); SSO buttons `px-5 py-3.5` (h=54); sign-in `font-medium` |
| V11 | Reference buttons (action + CHARGE + dialog footers) | computed padding/height + full classes | ❌ **F-34/F-35**: standard buttons `px-4 py-2.5 text-sm rounded-xl font-medium` (h=42 — New Product, dialog Cancel/Create); CHARGE `px-8 py-5` (h=70) — the clone ships h=36 / h=58. The gradient stops themselves MATCH (an earlier "drift" reading was a hover-state artifact — verified both normal and hover) |
| V12 | Receipt footer field (DOM type) | reference: `<textarea rows="2" min-h-[60px] rounded-xl border-input bg-transparent px-3 py-2 resize:vertical>`; clone: single-line Input | ❌ **F-26** |
| V13 | Reports period pills (container + pills, both sides) | computed classes/colors | ❌ **F-36**: reference container `flex gap-2 p-1 rounded-2xl` + border `rgba(255,255,255,0.07)` + bg `rgba(28,31,52,0.85)`; pills `px-4 py-2 rounded-xl text-xs font-bold` (inactive `text-white/40`, hover `white/70`, active `bg-violet-600` + `shadow-lg`). Clone: container `rounded-xl border-edge bg-panel`; pills `rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white/60` |
| V14 | Color-picker rows (both sides) | reference color input `w-10 h-10 rounded-lg cursor-pointer` bare, wrapper `flex items-center gap-3 mt-1`; clone frames it `h-10 w-12 border border-edge bg-panel p-1`, wrapper `gap-2` | ❌ **F-37** (LOW) |
| V15 | Search inputs (Inventory, both sides) | reference: base Input + `pl-10 rounded-xl`, icon `text-slate-400`, placeholder `rgb(112,122,143)`; clone: `border-edge bg-panel pl-9`, icon `text-white/30`, placeholder `white/30` | ❌ folded into F-27 |
| V16 | Dialog frames (both sides) | reference: radius 8px, border `#262a36`, bg `#0f121a` opaque, w=512, p=24; clone: radius 8px, glass-dark (bg 0.95 alpha, white/6 border), w=512, p=24 | ✅ verified equivalent — the documented glass system stays (e2e-pinned animations; visually indistinguishable on the dark canvas) |
| V17 | Label-to-input spacing (both sides) | computed gaps | ✅ 8px both sides — no drift |
| V18 | Tailwind v4 trap sweep (re-run) | no tailwind.config · custom classes plain CSS · `tw-animate-css` imported · `@custom-variant hover` present · `space-y` children clean | ✅ all prior mitigations hold (F-28 adds the missing one: `@theme inline`) |

**Baseline confirmed:** the Session-4 tree is internally consistent and fully green; all
Session-4 parity pins still match the live reference. The findings below are parity
deltas at a depth earlier sessions never measured (form controls, buttons, the login
form internals) plus one latent Tailwind v4 mechanism bug — not regressions.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-28 | **HIGH** (latent v4 bug — the theme mechanism) | `src/app/tokens.css` `@theme` | Non-inline `@theme` defines `--color-input: hsl(var(--input))` — the var substitution is **baked at `:root`**, so the `.theme-light` login scope's re-pointing (`--input: 214 32% 91%`) never reaches any themed utility. Live-proven: inside `main.theme-light`, `--color-input` still reads `hsl(231 27% 22%)` (dark) and the login inputs render dark borders on the light card. This is the exact bug class the web-application skill §12 prescribes against (`@theme inline`). | V8 | `@theme` → `@theme inline` (one line). Utilities then emit `hsl(var(--input))` directly and resolve per-element against the cascaded triplet. No direct `var(--color-*)` consumers exist (verified) — the switch is safe. |
| F-27 | **MEDIUM-HIGH** (systematic parity — every form control) | `src/components/ui/{input,select,textarea}.tsx` + `:root` tokens + 35 per-field overrides | Every reference Input/Select/Textarea computes **12px radius, `#262a36` border (border-input), transparent bg, `#707a8f` placeholder (muted-foreground), ring-1 focus**; the clone ships 6px radius, `#1e2235` border (border-edge overrides), white/5 bg, white/30 placeholders, ring-2+offset focus. | V7/V9/V15 | (a) the three primitives' base: `rounded-md`→`rounded-xl`, focus `ring-2 + ring-offset-2`→`ring-1` (no offset), font `text-sm`→`text-base md:text-sm`, add `shadow-sm`; (b) `:root` `--input`/`--border` → `225 18% 18%`, `--muted-foreground` → `220 12% 50%`, `--ring` → `252 87% 67%`; (c) strip the per-field `border-edge bg-white/5` overrides (the base now computes the reference values); (d) search inputs: `bg-panel`→transparent, `pl-9`→`pl-10`, icon `text-white/30`→`text-slate-400`, drop `placeholder:text-white/30`. |
| F-29 | **MEDIUM-HIGH** (parity — login inputs) | `src/components/pos/login-surface.tsx` (4 inputs) | The reference's login inputs: `h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600 pl-10` (48px, light, filled). The clone renders the dark-themed 36px base inputs — dark borders on the light card (pixel-verified in the Session-4 screenshot too; the bug predates this session). | V10 | Apply the reference's class set to the email/password/full-name/forgot-email inputs. |
| F-34 | **MEDIUM** (parity — buttons) | `src/components/ui/button.tsx` default size | The reference's standard buttons are `px-4 py-2.5 text-sm rounded-xl font-medium` (h=42: New Product, dialog Cancel/Create, …). The clone's Button default `h-9 px-4 py-2` (h=36). | V11 | Default size `h-9 px-4 py-2` → `px-4 py-2.5` (padding-driven height, like the reference). sm/lg/icon sizes unchanged. |
| F-35 | **MEDIUM** (parity — CHARGE) | `terminal-view.tsx` charge button | Reference CHARGE: `px-8 py-5` (h=70, pad 20px 32px). Clone: `py-3.5` (h=58). Gradient/radius/font already exact. | V11 | `py-3.5` → `py-5`. |
| F-26 | **MEDIUM** (functional parity) | `settings-view.tsx` receipt footer | The reference renders a `<textarea rows="2">` (min-h 60px, resize vertical — multi-line footers); the clone uses a single-line Input. | V12 | Swap to the (now-styled) `Textarea` with `rows={2}`. |
| F-36 | **MEDIUM** (parity — Reports pills) | `reports-view.tsx` period selector | Container + pill class drift (radius 16 vs 12, bg `rgba(28,31,52,0.85)` vs `bg-panel`, border white/7 vs edge, pill radius 12 vs 8, text-xs bold vs text-sm semibold, inactive white/40 vs white/60, active lacks shadow-lg). | V13 | Apply the measured classes verbatim. |
| F-30 | **LOW** (parity) | `login-surface.tsx` SSO buttons | Reference `px-5 py-3.5` (h=54); clone `px-4 py-3` (h=46). | V10 | Update padding. |
| F-31 | **LOW** (parity — login card frame) | `login-surface.tsx` card | Reference: `bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border-0` + a content wrapper `p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10`; clone: solid `bg-white px-8 py-10` + a soft custom shadow. | V10 | Match the card frame + inner content wrapper. |
| F-32 | **LOW** (parity) | login card top strip | The reference has a 4px top gradient strip (`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200`); the clone lacks it. | V10 | Add the strip (needs the F-31 `overflow-hidden` + relative card). |
| F-33 | **MEDIUM** (parity — login logo) | `login-surface.tsx` logo block | The reference renders its logo image (`<img>` 96×96, alt "VeloxPOS (Point Of Sale) logo" — the hexagonal crystal asset); the clone renders a Zap-icon chip. | V10 | Download the reference's logo asset → `public/veloxpos-logo.png`; render the `<img>` (96×96, rounded? none — verbatim). The sidebar's gradient chip stays (it is what the reference's sidebar uses). |
| F-37 | **LOW** (parity) | `settings-view.tsx` color inputs | Reference color swatch: bare `w-10 h-10 rounded-lg cursor-pointer` in a `flex items-center gap-3` row; clone frames it (`w-12 border-edge bg-panel p-1`, `gap-2`). | V14 | Match the bare swatch + `gap-3`. |
| F-38 | **LOW** (parity) | sign-in button | Reference `font-medium` (500); clone `font-semibold` (600). | V10 | `font-semibold` → `font-medium`. |

**Explicitly NOT findings (verified intentional — do not "fix"):**
- **Dialog glass frames** (V16): the reference's dialogs are opaque `#0f121a` + `#262a36`
  border; the clone's glass-dark (0.95 alpha + white/6 border) is visually equivalent on
  the dark canvas and e2e-pinned (`animation-name: enter`) — the documented glass system.
- **glass-button-primary gradient stops** — normal AND hover match the reference exactly
  (an intermediate "drift" reading was a hover-state measurement artifact; re-measured clean).
- The reference's mobile nav defect, the drawer superset, heading scale, fiscal card,
  Added banner, Title Case copy, login canvas gradient — all re-verified holding.
- Label-to-input spacing (8px both sides), dialog geometry (512px/24px/radius 8px).
- "Nuevo cajero", CSV Import/Export, the sr-only currency announcement — documented supersets.

---

## 2. The ToDo list (execution order, TDD where behavioral)

Every behavioral item is red → green: the failing e2e pin FIRST, then the fix. No pure
seam changes → the unit count stays **117**; e2e grows by the new pins (count-lockstep
in the same commit).

- [x] **T-1** (RED) `surfaces.spec.ts`: (a) StoreSettings "Store name" input computes
      `border-radius: 12px`, `border-color: rgb(38, 42, 54)`, `background-color:
      rgba(0, 0, 0, 0)`; (b) a dialog input (Inventory New Product) computes 12px radius;
      (c) the Inventory search input computes 12px radius + transparent bg + placeholder
      color `rgb(112, 122, 143)`; (d) the receipt-footer field is a TEXTAREA with
      `rows=2` and min-height 60px; (e) the period-pill container computes 16px radius
      and the active pill carries a shadow; (f) the New Product button computes 42px
      height (10px 16px padding); (g) the CHARGE button computes 70px height.
- [x] **T-2** (RED) `auth.spec.ts`: login email/password inputs compute `height: 48px`,
      `border-color: rgb(226, 232, 240)`, `background-color: rgba(248, 250, 252, 0.5)`,
      `border-radius: 12px`; the card has a visible box-shadow (shadow-2xl class) and a
      4px top strip child; the logo renders as an `img[alt="VeloxPOS (Point Of Sale) logo"]`.
- [x] **T-3** (GREEN, F-28) `tokens.css`: `@theme` → `@theme inline` (one line; no
      `var(--color-*)` consumers exist — verified).
- [x] **T-4** (GREEN, F-27) The form-control sweep: `input.tsx`/`select.tsx`/
      `textarea.tsx` base classes (rounded-xl, ring-1 no offset, text-base md:text-sm,
      shadow-sm); `:root` `--input`/`--border` → `225 18% 18%`, `--muted-foreground` →
      `220 12% 50%`, `--ring` → `252 87% 67%`; strip the per-field `border-edge
      bg-white/5` overrides across views; search inputs (Inventory/Sales/Terminal) →
      transparent bg + pl-10 + slate-400 icons + base placeholder.
- [x] **T-5** (GREEN, F-29/F-30/F-31/F-32/F-33/F-38) The login surface: the reference's
      input class set, SSO `px-5 py-3.5`, card `bg-white/95 backdrop-blur-sm shadow-2xl
      overflow-hidden` + content wrapper paddings, the 4px top strip, the logo `<img>`
      (asset downloaded to `public/`), sign-in `font-medium`.
- [x] **T-6** (GREEN, F-34/F-35) `button.tsx` default size → `px-4 py-2.5`; CHARGE
      `py-3.5` → `py-5`.
- [x] **T-7** (GREEN, F-26) Receipt footer → `Textarea rows={2}`.
- [x] **T-8** (GREEN, F-36) Reports period pills + container classes.
- [x] **T-9** (GREEN, F-37) Color inputs: bare swatch `w-10 h-10`, wrapper `gap-3`.
- [x] **T-10** Full gate re-run: `lint → typecheck → test (117) → build → test:e2e`
      (new total = 55 + new pins, all prior pins intact).
- [x] **T-11** Live re-verification with agent-browser against the rebuilt standalone:
      settings inputs, dialog inputs, login surface (inputs/card/strip/logo), buttons,
      pills; plus the F-28 mechanism probe (`--color-input` no longer a defined var;
      border-input resolves per-element).
- [x] **T-12** Fresh screenshots (Session-5 set) into `docs/screenshots/`.
- [x] **T-13** Docs lockstep: README (badges/counts if changed), AGENTS.md (the
      `@theme inline` law + the form-control parity contracts), CLAUDE.md (same),
      PAD v1.3 revision block + ADR-010; `velox-pos_SKILL.md` version bump; this plan's
      checkboxes ticked.
- [x] **T-14** `worklog.md` Session-5 entry; commit + push via `docs/ssh_git_wrapper_v3.py`
      (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`), main only.

## 3. Gate & acceptance

1. All existing pins stay green — none weakened; the two Session-4 casing pins remain.
2. The new e2e pins land and pass against the production build; unit stays 117/117.
3. `bun run lint` 0 errors; `tsc --noEmit` clean; `bun run build` green; standalone boots
   + `/api/health` ok.
4. Live re-measurement confirms every fix (T-11) — computed styles match the reference.
5. Doc counts lockstep in the same commit; worklog + plan updated; pushed via the wrapper.

## 4. Residual risks

- The Button default-size change (h-9 → padding-driven) affects every default-size
  Button; the reference renders ALL of them at py-2.5/h-42, but any clone-only button
  relying on the fixed 36px height changes size. Audited: the glass-button sites are
  action/dialog buttons the reference renders at 42px; icon buttons keep their size
  variants. E2e will catch geometry regressions on pinned surfaces.
- The `@theme inline` switch changes how EVERY themed utility emits (inline values
  instead of var indirection). Verified: no direct `var(--color-*)` consumers; the
  computed values in the dark app are unchanged (the triplets resolve identically);
  the full e2e suite re-runs against the production build as the safety net.
- The `--muted-foreground` change (62%→50% lightness) darkens placeholder/description
  text app-wide — that is the reference's measured value; visually verified on the
  search placeholder (rgb(112,122,143)).
- The login logo asset is the reference's own hosted image, vendored into `public/` —
  same posture as the measured glass system (verbatim parity).

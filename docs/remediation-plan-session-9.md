# VeloxPOS Remediation Plan — Session-9

**Date:** 2026-10-26 (Session-9 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-8 tree (HEAD `16a0442`
= `c306c95` + the operator's session-log commit). A full received-tree gate re-verification,
a live reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law —
third consecutive cycle), a local-vs-reference computed-style parity audit on the production
standalone build, the static Tailwind-v4 trap sweep, the mobile-drawer live contract check
(the user's called-out surface), a recent-changes audit (the Session-8 commits), and a
security/invariant scan.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16 security),
skills/agent-browser (live computed-style measurement), skills/tdd (red → green),
skills/clone-app-pat-pro (computed styles as ground truth).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the workspace had been reset) + `cp .env.example .env` (AUTH_SECRET set) + `bun install` + `db:push` + `db:seed -- --demo` + `bunx playwright install chromium` (the environment cache had chromium-1200; the lockfile's Playwright 1.63.0 requires 1243) | environment fully provisioned (15 products / 5 categories / 1 register / 33 sales) |
| V2 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 133/133** (13 files) — the documented baseline holds |
| V3 | Build + smoke on the received tree | `bun run build` + `./scripts/smoke-test.sh` | build green (hygiene-clean artifact) · smoke **13/13** |
| V4 | E2E on the received tree | `CI=1 bun run test:e2e` (both projects) | **78/78** — the Session-8 baseline holds (after the chromium-1243 install) |
| V5 | Reference: sidebar nav | agent-browser computed styles @1440×900 | ✅ all pins hold: aside 220px rgb(13,15,26) + 1px rgb(30,34,53) border, nav `16px 8px`, items `10px 12px` padding-driven 40px inactive / 42px active, active rgb(196,181,253) + 1px rgba(139,92,246,0.3) + 12px radius, inactive white/40 no border, icons 16px, wordmark 14px/700/white-0.9/0.35px, 8 links — BUT the Reports glyph class reads `lucide-file-chart-column-increasing` (see F-56) |
| V6 | Reference: POS gate + CHARGE | computed | ✅ card 32px/16px/rgba(16,18,32,0.9); h2 20px mb-8px; icon 64px rgba(167,139,250,0.3) stroke-2 mb-16px; para white/35; "Registers" emphasis white/60/700/no-underline; CHARGE 70px/20px/900/`20px 32px`/135° emerald gradient |
| V7 | Reference: Dashboard + heading census | computed + tag census | ✅ H1 24px; Title-Case stats 12px/600; weekday x-axis + nice y ticks; section headings **H3** 16px/700 ("Sales — Last 7 days" + "Products by Category") — the h3 tag feeds F-57 |
| V8 | Reference: Inventory + Reports | computed | ✅ "All" chip 36px (`8px 16px`, 12px/600, 12px radius, violet→indigo 135° gradient); New Product 42px; Reports h2s 14px uppercase white/60; "7 days" pill 32px inactive white/40; container rgba(28,31,52,0.85)/16px/4px/1px white-7 |
| V9 | Reference: Settings + Spanish copy + Registers | computed + text census | ✅ H1 24px; fiscal labels "Tax ID / EIN"/"Tax Regime"/"Fiscal Address"/"CFDI Use (default)"; **6 section H3s** 16px/700; Save 54px (`14px 24px`, 16px/500); Add chip 34px; Sales = "Historial de Ventas" + "Buscar por ticket, cliente o cajero..."; Cashiers = "Cajeros" + "Turnos Recientes" **H3**; Registers = "Cash Registers" 24px |
| V10 | Reference: mobile state @390×844 | viewport + geometry | ✅ the reference's OWN defect still present: the 220px z-50 sidebar overlays content (main margin-left 0), NO hamburger — the clone's drawer-superset posture remains correct |
| V11 | Reference: login internals | cookies cleared → computed | ✅ inputs 48px rgba(248,250,252,0.5) + rgb(226,232,240) border + 12px radius + pl-40px; logo 96px; SSO 54px (`14px 20px`, 16px); sign-in 500; card white/95 + blur(4px) |
| V12 | Reference: button cursors | computed | ⚠️ **F-58 (the evidence)**: buttons compute `cursor: pointer` (v3-era preflight), nav links pointer; the disabled CHARGE = not-allowed |
| V13 | Local parity audit (production standalone :3400, script-owned lifecycle) | `node scripts/audit-local-parity.mjs` + `audit-mobile-login.mjs` (repo-external, under /home/z/my-project/scripts/) | ✅ every measured surface byte-parity with the reference (oklab serialization equivalences per the documented doctrine): sidebar, POS gate, Dashboard stats + weekday axes, Inventory chips, Reports pills + container, Settings fiscal + Save + Add, Spanish copy, login internals. ⚠️ the Reports glyph reads `lucide-chart-column-increasing` (F-56) |
| V14 | Local mobile drawer contract (logged-in 390×844) | audit-mobile-login.mjs (storageState-sharing context) | ✅ hamburger "Open navigation menu"; aside hidden below md; drawer role=dialog + "Navigation menu" label + 8 links; scroll lock engaged; navigate → drawer unmounts → /Inventory; no horizontal overflow — **the mobile menu works as expected; no v4 mobile-nav bug** |
| V15 | Local button cursors | audit-cursor.mjs | ⚠️ **F-58 confirmed on the clone**: SSO/forgot/hamburger/chevron compute `cursor: default` (v4 preflight dropped v3's pointer rule); nav links pointer (native); disabled states not-allowed (the .glass-button:disabled rules) |
| V16 | Static Tailwind-v4 trap sweep | rg across `src/app/*.css` + components | ✅ no `@layer utilities` custom classes; `@theme inline` in place for the shadcn tokens (the F-28 contract holds — the plain `@theme` in globals.css carries ONLY literal hex pins, safe by design); `@custom-variant hover (&:hover)` present; `tw-animate-css` imported; NO `tailwind.config.*`; no space-y in the nav chrome; ⚠️ no `cursor: pointer` base rule (F-58, the §12 trap) |
| V17 | Session-8 change audit | `git show c306c95` review (docs-counts gate, tracing excludes + build-script rm, smoke ladder, the F-55 transaction fix) | ✅ all four Session-8 cures verified green on this tree: the sales reads are inside the `$transaction` (code re-read), the artifact is hygiene-clean (smoke step 13), the docs-counts gate holds (unit 133/133), the smoke ladder 13/13 |
| V18 | Security/invariant scan | rg: dangerouslySetInnerHTML, parseFloat in components, alert(, console.log, store selector allocation patterns | ✅ none found; the `shifts.find()` selector returns existing references (no allocation — safe); money math stays in the seams |

**Baseline verdict:** the Session-8 tree is green end-to-end (V2–V4) and the reference has
NOT drifted for the THIRD consecutive cycle — but this cycle's parity audit went one layer
deeper than computed styles (tag census + cursor semantics) and found three genuine gaps,
all on the clone side. The reference's glyph/cursor/tag contracts now have measured values
that differ from the clone at three points.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-56 | **MEDIUM** (visual parity — a wrong glyph rendered in the nav) | `src/components/pos/nav-items.tsx:37` + the AGENTS/CLAUDE/SKILL chrome-contract lines | The reference's Reports nav glyph is the lucide class `lucide-file-chart-column-increasing` — the lucide-react export **`FileChartColumnIncreasing`** (a document with increasing bars). The clone renders `ChartColumnIncreasing` (bars only, no document) — a visibly different glyph. **Root cause:** Session-6's F-47 fix misread the class→export mapping — it recorded "the reference's Reports nav glyph is `lucide-file-chart-column-increasing` (**ChartColumnIncreasing**)", conflating the CSS class string with the export name; the correct export for that class is `FileChartColumnIncreasing`. The misreading was then codified into the AGENTS/CLAUDE/SKILL chrome contracts ("the Reports nav glyph is ChartColumnIncreasing"), so every later re-measurement (V4 in Session-8's ledger recorded the class correctly!) failed to trigger the comparison. No e2e pin exists on the glyph class — that is why it survived three sessions. | V5 + V13 (the class strings differ: `lucide-file-chart-column-increasing` vs `lucide-chart-column-increasing`); lucide-react 0.525.0 exports both (verified) | (1) Swap the import + the `reports` mapping to `FileChartColumnIncreasing`. (2) Add an e2e pin on the glyph class (the missing protection). (3) Correct the AGENTS/CLAUDE/SKILL chrome-contract lines (the code-wins rule). |
| F-58 | **MEDIUM** (UX parity — the documented §12 v4 preflight trap, never swept here) | `src/app/tokens.css` (no base cursor rule) | Tailwind v4's preflight (unlike v3's) sets **no `cursor: pointer`** on buttons — every plain button on the clone computes `cursor: default` while the reference (v3-era CSS) computes `pointer`. Measured on both sides: the SSO buttons, forgot-password, the mobile hamburger, the sidebar chevron. The family skill §12 documents exactly this trap and its cure ("add the base-layer rule `button, [role="button"] { cursor: pointer }`"). The clone's disabled states are already correct (`.glass-button:disabled { cursor: not-allowed }` — class+:disabled beats the element selector, so the base rule cannot break them). | V12 (reference: pointer) + V15 (clone: default) + V16 (no base rule) | (1) Add the base-layer rule to tokens.css: `button, [role="button"] { cursor: pointer }` + `:disabled` re-asserts not-allowed where needed (verify the existing class-based disabled rules keep winning). (2) Add an e2e computed-style pin (chevron = pointer) so the trap cannot return. |
| F-57 | **LOW** (semantic parity — the document outline differs; computed styles identical) | `dashboard-view.tsx:84,93` (h2), `settings-view.tsx:57` (SectionCard h2, 6 sites), `cashiers-view.tsx:213` (h2) | The reference renders its section headings as `<h3>` (16px/700): Dashboard's "Sales — Last 7 days" + "Products by Category", Settings' six section cards, Cashiers' "Turnos Recientes". The clone renders `<h2>` at all nine sites with IDENTICAL computed styles (text-base font-bold = 16px/700) — zero visual delta, but the document outline (and the a11y tree's heading levels) differs from the reference. The reference's own DOM is the structural contract; matching it costs nothing (no e2e pin uses heading LEVELS except the H1 census in surfaces.spec:127). | V7 + V9 (reference tag census) vs V13 (the clone's tag census: h3 lists empty, h2s present) | Swap the nine h2s → h3 (the classNames stay byte-identical). Extend the existing heading pins with `level: 3` so the tag choice is pinned too. |

**Explicitly NOT findings (verified — do not "fix"):**
- The login-card audit heuristic failures (rgba-walk + logo-walk both "found: false") — the
  card is `bg-white/95` (oklab-serialized; the heuristic matched rgba only); the card IS
  e2e-pinned (auth.spec:111-124 shadow + 4px strip) and all its internals measured parity.
- The Dashboard y-axis tick difference (reference "0..4" vs clone "0,20,40,60,80") —
  data-dependent (the reference's own sparse dataset vs the demo db's 33 sales); niceTicks
  is working as designed on both.
- The POS gate `strong: null` — the clone renders the "Registers" emphasis as a working
  `<a>` styled to the reference's computed strong (the documented functional-superset
  posture; AGENTS records it).
- The reference's Registers/Inventory/Sales empty states (no register cards / product rows
  to compare) — the reference's write-restricted demo data, not a parity surface.
- The register card name h2 (registers-view:412) — the reference shows no cards (empty
  state), so no measurable contract exists; the clone's choice stands.
- The `@theme` (non-inline) block in globals.css — it carries ONLY literal hex pins (no
  var() indirection, no re-pointing); the F-28 inline contract applies to the shadcn token
  block in tokens.css, which IS inline. Verified load-bearing-safe.
- The e2e suite's chromium-1243 requirement — an environment provisioning step (V1), not a
  repo defect; the lockfile is correct.

---

## 2. The ToDo list (execution order, TDD where behavioral)

- [x] **T-1** (RED, F-56) Add the e2e pin: the Reports nav link's svg carries the class
       `lucide-file-chart-column-increasing` (navigation.spec.ts, the desktop sidebar
       suite). RED proof: it fails against the current tree (which renders
       `lucide-chart-column-increasing`).
- [x] **T-2** (GREEN, F-56) `nav-items.tsx`: import `FileChartColumnIncreasing`, map
       `reports` to it, correct the header comment. Correct the AGENTS/CLAUDE/SKILL
       chrome-contract lines in the same commit (the code-wins rule).
- [x] **T-3** (RED, F-58) Add the e2e pin: the sidebar chevron computes `cursor: pointer`
       (navigation.spec.ts). RED proof: fails against the current tree (default).
- [x] **T-4** (GREEN, F-58) `tokens.css`: the base-layer rule
       `button:not([disabled]), [role="button"]:not([disabled]) { cursor: pointer }`
       (+ the disabled re-assert note). Verified the disabled CHARGE keeps not-allowed.
- [x] **T-5** (RED, F-57) Extend the surfaces.spec heading pins with `level: 3`:
       "Sales — Last 7 days", "Products by Category", "Business Information",
       "Turnos Recientes". RED proof: the level-3 lookups fail against the current h2s.
- [x] **T-6** (GREEN, F-57) Swap the nine h2s → h3 (dashboard ×2, settings SectionCard,
       cashiers turnos). The classNames stay byte-identical (16px/700 unchanged). One
       existing locator rode the intentional change (`section.locator("h2 svg")` →
       `"h3 svg"` in the section-icon census — assertion strength unchanged); the
       Session-7 sweep lesson found no other tag-specific locators.
- [x] **T-7** Docs-counts lockstep: e2e 78 → 80 (+2: the glyph + cursor pins; T-5
       modified existing assertions without adding tests). Updated the constants AND
       every live-tense count site in the same commit (README badge + commands row +
       testing section, CLAUDE baseline, PAD scale line + tier line + re-certification
       stamp, SKILL header baselines + §3 + §12, the gate's own pin strings). The gate
       ran 10/10 green.
- [x] **T-8** Full gate re-run: `lint 0 (1 documented warning) → tsc clean → unit
       133/133 → build green (hygiene-clean) → smoke 13/13 → e2e 80/80` — all green,
       no prior pin weakened.
- [x] **T-9** Live re-verification on the rebuilt standalone
       (`scripts/capture-s9-evidence.mjs`, **14/14**): the three fixes measured live
       (the FILE glyph on desktop + in the drawer, pointer on SSO/chevron/hamburger,
       the h3 censuses), the checkout journey (ticket T-000035), the shift lifecycle,
       the drawer contract at 390×844. Six fresh screenshots (43–48). The VLM sweep's
       three initial flags were all prompt-expectation bugs (the login canvas IS light
       per Session-4's measured gradient; Dashboard was the legitimately active pill;
       a 900px viewport shows the first three Settings sections) — each disproven by
       re-measurement: **6/6 effective**.
- [x] **T-10** Docs lockstep: README (counts), AGENTS.md (the corrected glyph contract
       + the cursor rule + the h3 contract), CLAUDE.md (the same), PAD v1.7 (revision
       block + the header version bumped from the stale v1.1 + counts), velox-pos_SKILL.md
       v2.5.0 (traps 17/18 + the Session-9 addendum + counts), .env.example re-verified
       (unchanged — no env changes this cycle), this execution record, the worklog
       entry, `docs/session_13.md` (the narration, one-ahead numbering).
- [x] **T-11** Commit + push via the SSH wrapper (main only; the key deployed outside
       the repo, 0600, shredded after the push per the runbook).

---

## 3. Execution record

**RED (T-1/T-3/T-5):** the glyph pin + the cursor pin appended to navigation.spec.ts
(the Session-9 chrome-census section) and the surfaces.spec heading pins extended with
`level: 3`. All three RED proofs observed against the pre-fix standalone: the glyph test
failed (`lucide-chart-column-increasing` ≠ the pinned FILE class), the cursor test failed
(`default` ≠ `pointer`), the level-3 lookups failed (h2s).

**GREEN (T-2/T-4/T-6):** the import swap (`FileChartColumnIncreasing`), the base-layer
cursor rule (with the `:not([disabled])` guard), and the nine h2→h3 tag swaps
(classNames byte-identical). One existing locator updated to ride the intentional DOM
change (`section.locator("h3 svg")` in the section-icon census) — the full-suite run
caught it (the only red in the first post-fix run), and the Session-7 sweep lesson
verified no other tag-specific locators exist.

**Lockstep (T-7):** E2E 78 → 80 across the docs-counts constants, the gate's own SKILL
pin strings ("Session-9 lock", "66 desktop + 13 mobile + 1 setup"), README (badge +
commands + testing), CLAUDE (baseline), PAD (scale line + tier + re-certification
stamp), SKILL (header baselines + §3 + §12). Gate 10/10.

**Final gate (T-8):** lint 0 errors (1 documented warning) · tsc clean · unit
**133/133** (13 files) · build green (hygiene-clean; smoke step 13 polices it) · smoke
**13/13** · e2e **80/80** — no prior pin weakened.

**Live evidence (T-9):** `scripts/capture-s9-evidence.mjs` **14/14** — login round-trip,
F-56 live (the FILE glyph on desktop AND in the drawer), F-58 live (pointer on
SSO/chevron/hamburger), F-57 live (the h3 censuses on Dashboard/Settings/Cashiers), the
checkout journey (ticket **T-000035** through the real UI), the shift closed tidy, and
the mobile drawer contract (dialog, 8 labeled links, no overflow at 390). VLM sweep of
screenshots 43–48: 6/6 effective (the three initial flags were prompt-expectation bugs,
each disproven by re-measurement — including re-checking the REFERENCE's login body,
which computes white: the light canvas is the contract).

**Docs lockstep (T-10):** README/AGENTS/CLAUDE/PAD v1.7 (+ the stale v1.1 header
bumped)/SKILL v2.5.0 (traps 17/18 + the Session-9 addendum)/.env.example re-verified
(unchanged)/this execution record/the worklog entry/`docs/session_13.md`. **T-11:**
committed + pushed via the SSH wrapper (main only; the key shredded after).

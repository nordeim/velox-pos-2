# VeloxPOS Remediation Plan — Session-16

**Date:** 2026-10-27 (Session-16 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-15 tree (HEAD `3a0594c` =
`705001b` + the operator's session_26 raw-log commit; the workspace was RESET — a fresh
`git clone https://github.com/nordeim/velox-pos-2.git` re-established it). A full
received-tree gate re-verification, a live reference re-measurement at every previously-pinned
depth (the "reference DRIFTS" law — TENTH consecutive cycle, zero drift on every standing pin),
this cycle's NEW-depth audit — **the Registers/Sales with-data states under the demo seed (the
session_26 "Next" pointer's named target: the with-data surfaces the empty-store e2e can never
see) plus the reference-side Registers/Sales empty-state internals measured at leaf precision**
— and the static sweep (zero-importer file + dependency censuses, secrets, credential,
Session-15 code review). **Method:** skills/web-application (§12 v4 traps, §14 testing tiers,
§15 gate), skills/agent-browser (computed styles are ground truth; **leaf-element measurement**
— the new lesson this cycle), skills/tdd (red → green, vertical slices), the count-lockstep
doctrine (docs-counts gate), VLM cross-verification for the visually-loaded findings (DOM probes
are the authority — the S9 doctrine).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | workspace reset → fresh `git clone` | clean tree @ `3a0594c` (= the Session-15 push `705001b` + the operator's session_26 commit); fast-forward-equivalent |
| V2 | Environment contract | `.env` from `.env.example` (+ real AUTH_SECRET), `bun install`, `db:push` + `db:seed` | `.env` carries `DATABASE_URL="file:../db/custom.db"` ✓; `db/` at the root (custom/e2e/smoke/demo dbs) ✓; `.env.example` matches `.env` ✓; bun 1.3.14; agent-browser 0.39.0; **one env-only defect: the fresh sandbox lacked the Playwright browsers — `bunx playwright install chromium` (no code change)** |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 146/146** (14 files) — the Session-15 lock holds |
| V4 | Standalone build | `bun run build` | green — the full route table renders |
| V5 | Smoke suite | `bun run smoke` | **13/13** — incl. the artifact-hygiene probe + the no-secret boot refusal |
| V6 | Full e2e on the received tree | `CI=1 bun run test:e2e` (after the browser install) | **104/104** (2.3m) — the Session-15 lock holds (90 desktop + 13 mobile + 1 setup) |
| V7 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`scripts/zero-importer-census.mjs`, outside the repo) | **ZERO dead files** (45/45 live — the s14 purge holds); deps: the 8 flags are all the KNOWN config/CLI-level withdrawals (react-dom peer-coupled; z-ai-web-dev-sdk in the vlm scripts; @tailwindcss/postcss+tailwindcss+tw-animate-css via CSS imports; eslint/eslint-config-next/typescript as CLI tools) — **`@radix-ui/react-toast` and `axe-core` remain gone** (the s15 removals hold) |
| V8 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify (`scripts/check-owner-credential.mjs`) | **the documented `$Abcd1234` VERIFIES, the s13 drift value fails** — no drift since the restore |
| V9 | Secrets scan | `git grep` across the tracked tree (session logs + archive + lockfile excluded) | clean — only the wrapper skill's own marker-check lines and the `skills/` folder's copies (excluded from checking by contract) |
| V10 | Session-15 code review (Mode C) | full reads of `reports.ts` (niceScale), `currency.ts` (the measured lists), `shared.tsx` (both charts' seam adoption), `dashboard-view.tsx` (the corrected comment), the s15 test deltas | clean: the seam mirrors niceTicks' step math with `top = ceil(safeMax/step)*step`; guards mirror; the measured lists documented; both charts adopt with the empty-state contract preserved (`niceScale(4,5)` = `{4,[0,1,2,3,4]}`); the Reports chart's `Math.max(4, scale.top)` is harmless redundancy (top ≥ rawMax ≥ 4 always) — noted, not changed (the no-speculative-change rule) |
| V11 | Live drift — the login card | agent-browser computed styles on `/login` | **HOLDS (10th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · the 4px slate-gradient strip · h1 30px/700/slate-900 · SSO 54px · inputs 48px/12px |
| V12 | Live drift — the F-76 error alert | wrong-credentials submit | **HOLDS byte-exact**: "Invalid email or password" · 12px radius · red-50/0.7 · 1px red-200 · p-4 (16px) · inner 14px red-700 |
| V13 | Live drift — the sidebar + terminal gate | computed styles post-login | **HOLDS**: 220px nav · 8 links · the violet-600/0.2 pill @42px on Terminal; the gate + CART |
| V14 | Live drift — the Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: the date line 14px slate-500 ("Tuesday, October 27, 2026"); both chart h3s 16px/700; "Historial de Ventas" + "Sin ventas" + the 7 ledger headers (Ticket/Fecha/Cajero/Método/Total/Estado/Acciones); "Cajeros"/"Turnos Recientes" |
| V15 | Live drift — the mobile defect | viewport 390×844 on /POS | **HOLDS**: still NO hamburger, the 220px z-50 static sidebar — the reference's own defect, unchanged; the clone's drawer superset stays correct (13/13 mobile e2e green in V6) |
| V16 | NEW depth — the reference Registers surface | computed styles + DOM census on /Registers (empty — the demo account is write-gated) | **PARITY**: h1 "Cash Registers" 24px/700; "0 registers configured" 14px slate-500; "No registers configured yet" 16px slate-500; New Register = the 42px gradient button (violet→indigo in background-image, px-4 py-2.5) |
| V17 | NEW depth — the reference New Register dialog | open + full DOM walk | **PARITY byte-level**: panel `w-full max-w-lg` = **512px** (the V17 note: a first read of 462 was the CONTENT-box artifact — 512 − 2×24 padding − 2×1 border; the panel width is the contract) · rgb(15,18,26) #0f121a · 1px rgb(38,42,54) · 8px radius · 24px padding · NO blur · title 18px/600/#e7e9ef · labels ["Name *","Location"] · inputs h-9/12px · Cancel/Create 42px — and the reference literally ships the clone's vendored class strings (`glass-button`/`glass-button-primary`, `left-[50%] top-[50%] z-50 grid w-full max-w-lg`) |
| V18 | NEW depth — the reference Sales surface | /Sales leaf-element census | **PARITY**: h1 "Historial de Ventas" 24px; the search input h-9 (36px)/12px/transparent, placeholder **"Buscar por ticket, cliente o cajero..."** byte-exact; the empty cell **`text-center py-12 text-slate-400`** — measured at the LEAF `TD` (rgb(148,163,184)/16px/400/48px-1px pad) — **a wrapper-div probe first misread #e7e9ef; the TreeWalker leaf technique is the new measurement lesson** (recorded: probe the text node's parentElement, never the first ancestor matching the copy) |
| V19 | NEW depth — the with-data audit (demo seed) | `db/demo.db` (--demo: 15 products, 5 categories, 1 register, 1 closed shift, 33 sales) → standalone on :3416 → DOM probes (2 audit scripts, persisted outside the repo) | **ALL GREEN, no with-data defects**: Registers — 1 card (name 18px bold, location white/50, "Available" chip white/5/white-50 12px, Open shift 32px / Go to Terminal 38px / edit+delete 38px icon buttons); the Open-shift dialog (384px #0f121a 8px p-6, "Opening float" label, h-9 input — the dialog family holds on a superset surface); Sales — 33 rows, cells 14px/`14px 20px` pad, "Completada" chips, ticket search T-000033 → 1 row; the receipt viewer (384px family, ticket + item lines + total + "Método" + Cerrar/Imprimir); Cashiers — the Turnos Recientes row ("Store Owner", "Register 1", "00:41 · 24h 0m", "$410.64 (33)", "Cerrado" chip); POS — gated with the closed register ("No active shift"); Dashboard — the 12px/600 slate-500 stat labels + 24px/700 values ($0.00/0/15/3 — the demo sales land on prior calendar days, the s15-recorded state); Reports — $410.64/33/$12.44, topGridlineY=4 (the s15 cure holds under load) |
| V20 | F-110 root-cause sweep | `rg` for bare `toLocaleString()`/`toLocaleDateString()`/`toLocaleTimeString()` across src | **2 sites of the bare-locale class**: `terminal-view.tsx:218` (the post-checkout receipt header `{sale.ticket} · {new Date(sale.createdAt).toLocaleString()}`) and `sales-view.tsx:44` (the receipt viewer's DialogDescription). Both render **client-locale-dependent** output — en-US on the audit browser ("10/26/2026, 2:41:33 PM"), and ar-SA digits/hijri dates on an ar-SA device: a receipt must render identically on every device. Both sit inside the Spanish-mixed Sales surface whose own ledger cell uses es-MX ("26 oct 2026") — and the deterministic precedent exists (`shiftTime` in `src/lib/shift.ts:67` formats manual `HH:MM` precisely to avoid locale dependence). The e2e never caught it: the empty-store suite's checkout journey asserts the receipt's ticket/footer but not the timestamp's FORMAT → **F-110** |
| V21 | F-110 e2e feasibility | `tests/e2e/terminal.spec.ts` read | the serial checkout journey OPENS the receipt dialog (T-000001 + footer asserted at lines 139-143) — the format pin slots as an added assertion inside the EXISTING test → e2e count stays 104, zero lockstep collateral on the e2e constants |
| V22 | F-110 blast radius | `rg toLocale` + receipt-flow reads | contained: the 2 sites + their tests; the ledger's `saleDate` (es-MX) is correct and untouched; `dashboard-view`'s `formatToday` is en-US by pinned design (the reference's own date line — F-55, not this class) |
| V23 | F-111 design basis | the s15 evidence-script pattern (`scripts/capture-s15-evidence.mjs`) | the with-data class is invisible to the empty-store e2e BY CONSTRUCTION (the s15 V24 doctrine) — this cycle measured the with-data Registers/Sales/Cashiers contracts (V19) and the evidence tier is where they get pinned so future cycles inherit a standing harness → **F-111**: `scripts/capture-s16-evidence.mjs` |

---

## 1. Findings

### The with-data cluster (this cycle's NEW depth — session_26's named target)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-110** | **LOW** (superset-surface determinism — invisible to the empty-store e2e's format-blind assertions; the exact with-data class this cycle hunts) | `src/components/pos/views/terminal-view.tsx:218` + `src/components/pos/views/sales-view.tsx:44` | Both receipt headers render `{new Date(sale.createdAt).toLocaleString()}` — **locale-nondeterministic**: en-US on the audit browser ("10/26/2026, 2:41:33 PM"), ar-SA digits on an ar-SA device, and inconsistent with the same surface's own es-MX ledger cell ("26 oct 2026"). A POS receipt is a printed customer artifact — it must render byte-identically on every device (the `shiftTime` precedent exists precisely for this). Cure: a `saleTimestamp(at: string \| Date)` pure seam in `src/lib/reports.ts` (the sale/date formatting family — no new file, FILES stays 14): byte-stable `DD/MM/YYYY HH:MM` via manual padStart (mirrors `shiftTime`), unit-pinned ×3 (format bytes, zero-padding, the ISO-string runtime path — the no-Z form parses local, so the pin is tz-safe), adopted at both sites, e2e-pinned as an added assertion in the existing checkout test (V21 — the count stays 104). |
| **F-111** | **MEDIUM** (structural — the with-data regression harness) | `scripts/capture-s16-evidence.mjs` (new, the s15-pattern successor) | This cycle's NEW-depth measurements (V19) exist only as one-off audit probes; the s15 lesson is that the with-data class is invisible to the empty-store e2e by construction, and the evidence tier is the only place these contracts get re-proven per cycle. Cure: the Session-16 evidence script pins the measured with-data contracts on the demo-seeded db: the Registers card census + the Open-shift dialog family, the Sales ledger census + ticket search + the receipt viewer (incl. the F-110 format), the Cashiers shift-ledger row, the POS gate, the Dashboard stat family + the s15 peak-below-gridline contract, the F-76 drift spot-check, and the mobile drawer — screenshots continue at 81. |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V11–V15): TENTH consecutive drift-free cycle. The
  reference is stable; the pin doctrine keeps proving it.
- **The reference's New Register dialog** (V17): byte-parity INCLUDING the panel width
  (512px `max-w-lg` — the 462 first-read was the content-box artifact, V17's note) and the
  literal `glass-*` class strings. No change.
- **The clone's with-data surfaces** (V19): no defects found — the Registers cards, the
  Open-shift dialog, the Sales ledger/search/receipt, the Cashiers shift ledger, the POS gate,
  and the Dashboard stats all render correct, contract-consistent values on the demo seed.
- **The leaf-vs-wrapper measurement artifact** (V18): the reference's "Sin ventas" IS
  slate-400 at the leaf TD (the clone's `text-slate-400` is byte-identical); the first #e7e9ef
  read was a wrapper div's inherited color. Measurement lesson recorded (V18), no code change.
- **The demo seed's "Today's Sales $0.00"**: honest — the seeded sales land on prior calendar
  days (the s15-recorded state); not a defect, not "fixed" (dates are real).
- **The Reports chart's `Math.max(4, scale.top)`** (V10): redundant but harmless; left alone
  per the no-speculative-change rule.
- **The reference's mobile defect** (V15): persists; the clone's drawer superset remains
  correct — 13/13 mobile e2e green.
- **The e2e setup failure on the first run** (V2): the fresh sandbox lacked the Playwright
  browsers — `bunx playwright install chromium`, environment-only, no code change, recorded
  so the next fresh-clone cycle runs it before the gate.

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The seam first (§14 tier 1): `saleTimestamp(at: string | Date)` in `src/lib/reports.ts`**
   — appended after `niceScale` (the sale/date family; `dailySeries`' label logic lives
   nearby). Byte-stable `DD/MM/YYYY HH:MM` (the es-convention day-first order matching the
   ledger's es-MX cell), manual padStart mirroring `shiftTime` (`src/lib/shift.ts:67`) —
   zero Intl dependence, zero locale drift, identical bytes on every device. Unit-pinned in
   `tests/unit/reports.test.ts` (the seam's home file — FILES stays 14) with 3 its:
   the format bytes (`new Date(2026, 9, 26, 14, 41)` → `"26/10/2026 14:41"` — the
   audit-measured sale moment), the zero-padding (`new Date(2026, 2, 5, 3, 7)` →
   `"05/03/2026 03:07"`), and the runtime string path (`"2020-05-17T09:15:00"` →
   `"17/05/2020 09:15"` — no-Z ISO parses LOCAL per spec, so the pin is tz-safe everywhere).
2. **Both receipt sites adopt the seam** — `terminal-view.tsx:218`
   (`{sale.ticket} · {saleTimestamp(sale.createdAt)}`) and `sales-view.tsx:44`
   (`{saleTimestamp(sale.createdAt)}`); the ledger's `saleDate` (es-MX) is untouched (V22).
3. **The e2e pin rides the EXISTING checkout test** (V21): after the T-000001 receipt
   assertion, `await expect(receipt.getByText(/T-000001 · \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/))
   .toBeVisible()` — an added assertion, NOT a new test: E2E stays 104, zero e2e lockstep
   collateral.
4. **F-111 — the evidence extension**: `scripts/capture-s16-evidence.mjs` (the s15 script's
   server-lifecycle pattern, port 3417, the same demo-db provisioning guard): pins V19's
   with-data contracts + the F-110 receipt format + the standing F-76/drawer spot-checks;
   screenshots 81+ → docs/screenshots/ (the audit-s16-* captures are folded into the numbered
   record or superseded by the evidence captures — the evidence run owns the final numbering).
5. **Count-lockstep (mechanical)**: unit +3 its → UNIT 146→149, FILES stay 14, E2E stays 104.
   The constants AND every doc site riding them re-anchor in the SAME commit: the gate's
   UNIT literal + its explanatory comment, the "Session-15 lock" literal → "Session-16 lock"
   (the gate pins it), README (badge, commands table, quick-start), CLAUDE (baseline),
   PAD (scale line, tiers line), SKILL (header baselines, §3, §12). The gate's failure
   output enumerates the sites mechanically — fix exactly what it lists.
6. **Docs lockstep**: AGENTS.md (the Session-16 contract section: the saleTimestamp law, the
   leaf-measurement lesson, the with-data evidence tier), CLAUDE.md (the receipt-timestamp
   contract line), PAD v1.14 (revision block + counts), velox-pos_SKILL.md v2.12.0 (the seam
   row + the Session-16 addendum + counts), README (counts), the repo worklog's Session-16
   entry, `docs/session_27.md` (the narration), `.env.example` re-verified against `.env`.

### The RED pins

- **Unit (reports.test.ts, +3 its)**: the `saleTimestamp` contract set — RED at import
  (the seam does not exist). Proven alone first (the s14/s15 two-tier lesson: hold the unit
  test aside — a unit-tier import of a nonexistent export blocks `next build`'s tests/
  type-check — while proving the e2e RED build).
- **E2E (terminal.spec.ts, +1 assertion)**: the receipt-format regex — RED against the
  current build (the bare toLocaleString renders "10/26/2026, 2:41:33 PM"-style, which the
  `\d{2}/\d{2}/\d{4} \d{2}:\d{2}` regex never matches).
- **The with-data evidence contracts (F-111)** are the evidence tier by design (V23/the s15
  V24 doctrine) — NOT e2e pins; the empty-store e2e contract stands.

---

## 3. Execution order

1. RED: the 3 unit pins in reports.test.ts → the unit RED proof (import-class failures) →
   hold the unit test aside (git stash) → the e2e assertion → the e2e RED proof (the one
   targeted failure) → restore the unit test.
2. GREEN in vertical slices (skills/tdd): the `saleTimestamp` seam + its 3 pins → both
   receipt sites adopt → the e2e assertion goes green → the unit gate (the docs-counts gate
   fires → re-anchor UNIT=149 + the "Session-16 lock" literal + every enumerated doc site
   in-commit) → lint + tsc + build.
3. The full gate on the final tree: lint 0 · tsc · unit **149/149** (14 files) · build ·
   smoke 13/13 · e2e **104/104**.
4. Evidence: `scripts/capture-s16-evidence.mjs` (the demo-db boot + the with-data contracts +
   the F-110 format + the F-76/drawer spot-checks) + screenshots 81+ → docs/screenshots/.
5. Docs lockstep (§2.6) + the VLM cross-check on the evidence captures.
6. Commit (`fix(session-16)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — `--remote git@github.com:nordeim/velox-pos-2.git`,
   dry-run first) → remote verification → operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **RED proven at both tiers.** Unit: 3/3 targeted failures (the saleTimestamp pins
  against the absent seam), 24 pre-existing passes intact. The s14/s15 two-tier
  lesson applied verbatim: the unit test was held aside (git stash) while the e2e
  RED build ran (a unit-tier import of a nonexistent export blocks `next build`'s
  tests/ type-check), restored for GREEN.
- **E2E RED: exactly 1 targeted failure** — the checkout test's new receipt-format
  assertion against the pre-fix build (the bare toLocaleString never matches
  `\d{2}/\d{2}/\d{4} \d{2}:\d{2}`); the only passes were the setup sign-in + the 3
  pre-existing tests. Zero collateral.
- **GREEN landed in vertical slices**: the `saleTimestamp` seam in `reports.ts`
  (3/3 pins green on first run) → both receipt sites adopted → the e2e assertion
  green → the docs-counts gate fired exactly as designed (149 vs 146) → the
  constants re-anchored (UNIT=149, the "Session-16 lock" literal) + every
  enumerated doc site (README badge/table/quick-start, CLAUDE baseline, PAD scale
  line + tiers line + the re-certification label, SKILL header/§3/§12) in-commit.
- **Full gate on the final tree: GREEN** — lint 0 errors (1 documented warning) ·
  tsc clean · unit **149/149** (14 files) · build green · smoke **13/13** · e2e
  **104/104** (2.3m; the F-110 pin riding the existing checkout test, nothing
  weakened).
- **Live evidence (`scripts/capture-s16-evidence.mjs`): 13/13 PASSED** — the
  with-data Registers card census (1 card, 18px h2, Available chip) + the
  Open-shift dialog family (384px #0f121a 8px p-6 h-9), the Sales ledger (33 rows,
  the "33 ventas registradas" subline, Completada chips) + the ticket search
  (T-000033 → 1 row) + the receipt viewer (384px family, the F-110 stamp
  "26/10/2026 14:41" live), the Cashiers Turnos Recientes row ($410.64 (33) ·
  Cerrado), the POS gate, the Dashboard stat family (12px/600 labels, 24px/700
  values) + the re-proven F-107 peak (25.9 below the 100-gridline at 5.0), the
  F-76 drift spot-check (oklab posture), and the mobile drawer (8 links, zero
  overflow). Screenshots **81–86**.
- **Two evidence-infra fixes mid-run, zero checks weakened** (both recorded in
  AGENTS.md): (1) **the zoom-in animation race** — `waitFor({state:"visible"})` ≠
  animation-settled; the dialog geometry read 384×0.95 ≈ 365 mid-flight (twice);
  cured with a 700ms settle after the visible wait. (2) **the bootstrap race** —
  `goto` with default "load" + a fixed 800ms sleep lost to the shifts fetch on the
  cold /Cashiers route (the ledger probed as "Sin turnos registrados"); cured with
  a `waitForFunction` on the SETTLED ledger (the row or the empty copy — the pin
  fails honestly if the data never lands).
- **VLM cross-check: 5/5** on the evidence captures (the with-data Registers card,
  the receipt's DD/MM/YYYY HH:MM stamp, the populated ledger, the Dashboard
  peak-in-grid, the mobile drawer).
- **Docs lockstep**: this plan's record, AGENTS.md (the Session-16 contracts
  section: the saleTimestamp law, the with-data evidence tier, the two race
  lessons, the leaf-measurement lesson), CLAUDE.md (the receipt-timestamp
  contract), PAD v1.14 (revision block + counts + the re-certification label),
  velox-pos_SKILL.md v2.12.0 (the seam row + the Session-16 addendum), README
  (counts), the repo worklog's Session-16 entry, and `docs/session_27.md` (the
  narration). `.env.example` re-verified against `.env` (identical — this cycle's
  .env was CREATED from it).

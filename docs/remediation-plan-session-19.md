# VeloxPOS Remediation Plan — Session-19

**Date:** 2026-10-28 (Session-19 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-18 tree (HEAD `a94c105` = the
Session-18 push `c16900c` + `87f88b2` + the operator's session_32 raw-log commit `a94c105` —
fresh clone this cycle, tree synced, NO reset). A full received-tree gate re-verification, a live
reference re-measurement at every previously-pinned depth (the "reference DRIFTS" law — THIRTEENTH
consecutive cycle, zero drift on every standing pin), the clone-side mobile-navigation
re-verification (the operator's named priority — the drawer superset probed live on the dev
server at 390×844), a Playwright trace audit (the session_31 candidate), and this cycle's
NEW-depth audit — **the receipt print-path (the session_31 "Next" pointer's other candidate:
"the receipt's print-path under the seeded branding colors")** — plus the static sweep
(zero-importer file + dependency censuses, secrets, credential, Session-18 code review).
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate),
skills/agent-browser (computed styles are ground truth), skills/tdd + skills/principle-test-
behavior-not-implementation (the print pins assert observable print-media rendering), the
count-lockstep doctrine (docs-counts gate — this cycle moves E2E 104→105), evidence-driven
verification (the print-media emulation probes are the honest harness: `page.emulateMedia`).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Workspace refresh | fresh `git clone` (the workspace had been reset); `git fetch` confirms `main == origin/main` at `a94c105` | clean tree @ `a94c105` (= the Session-18 push + the operator's raw-log commit) |
| V2 | Environment contract | `.env` created from `.env.example` (`DATABASE_URL="file:../db/custom.db"` + a generated 64-hex `AUTH_SECRET`) · `bun install` (472 packages) · `db:push` + `db:seed` (owner ready) · bun 1.3.14 · agent-browser 0.39.4 · Playwright 1.63 + chromium-1243 (the s17 browser-build lesson — installed BEFORE the e2e leg; only chromium-1200 was cached on the fresh sandbox) | environment ready; `db/` at the repo root with `custom.db`; `.env` mirrors `.env.example` + the real secret |
| V3 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 149/149** (14 files) — the Session-16 lock holds |
| V4 | Standalone build + smoke | `bun run build` → `bun run smoke` | build green (full route table) · smoke **13/13** (incl. artifact hygiene + the no-secret boot refusal) |
| V5 | Full e2e on the received tree | `CI=1 bun run test:e2e` | **104/104** (2.4m) — 90 desktop + 13 mobile + 1 setup; the mobile drawer suite green (the operator's named priority holds on the received tree) |
| V6 | Zero-importer census — FILES + DEPENDENCIES | the persisted sweep (`/home/z/my-project/scripts/zero-importer-census.mjs`, outside the repo; `src/app/**` convention-live + `src/instrumentation.ts`) | **ZERO dead files**; deps: only the known tooling/type-level/CLI entries (`prisma` CLI, `react-dom` peer-coupled, `@types/*`, `typescript`, `eslint`, the CSS pipeline, `bun-types`) + `z-ai-web-dev-sdk` (live — the VLM evidence-script family) |
| V7 | Dev-db credential (the SD-2 doctrine) | read-only scrypt verify mirroring `src/lib/auth.ts` (`check-owner-credential.mjs`, outside the repo; NOTE: a bun script — `Bun.password.verify` rejects the app's own `scrypt$salt$hash` shape with `PASSWORD_UNSUPPORTED_ALGORITHM`; the mirror-verify pattern is the correct probe) | **the documented `$Abcd1234` VERIFIES** against `db/custom.db` |
| V8 | Secrets scan | `git grep` for 40+ hex runs across the tracked tree | clean — the hits are test fixtures (the fake reset token, the env-check fixture constants); no live secrets |
| V9 | Session-18 code review (Mode C) | `git diff e67a997..a94c105` | the Session-18 commits touched ONLY evidence scripts/docs/screenshots/worklog (zero production code — the §2.4 design held) |
| V10 | Live drift — the login card | agent-browser computed styles on `/login` | **HOLDS (13th cycle)**: blur(4px) · rgba(255,255,255,0.95) · 16px radius · h1 30px/700 · inputs 48px/12px · SSO 54px/16px |
| V11 | Live drift — the F-76 error alert | wrong-credentials submit (`main [role=alert]` scoping — the s31 probe note) | **HOLDS byte-exact**: "Invalid email or password" · 12px · red-50/0.7 · 1px red-200 · 16px pad |
| V12 | Live drift — the sidebar + landing | computed styles post-login | **HOLDS**: lands on `/` (F-60) · aside 220px · z-50 · 8 links · Terminal pill 42px @ rgba(124,58,237,0.2) |
| V13 | Live drift — Dashboard + Spanish families | /Dashboard, /Sales, /Cashiers | **HOLDS**: date line 14px slate-500 en-US; both chart h3s 16px/700; "Historial de Ventas" + the 7 ledger headers + the byte-exact search placeholder; "Cajeros" h1 24px/700 + "Turnos Recientes" as H3 |
| V14 | Live drift — the mobile defect (reference) | viewport 390×844 on /POS | **HOLDS**: still NO hamburger, the 220px z-50 STATIC sidebar — the reference's own defect, unchanged (13th cycle) |
| V15 | Clone mobile-navigation re-verification (the operator's priority) | agent-browser on the dev server at 390×844, the full drawer journey | **ALL SUPerset pins PASS live**: labeled hamburger ("Open navigation menu") · drawer role=dialog + aria-label, 288px (w-72), glass-dark rgba(13,15,26,0.95), 8 labeled links · focus → Close on open · Escape closes + restores the hamburger's focus + releases the scroll lock · drawer navigation auto-closes (unmounts) · no horizontal overflow at 390px — plus the 13/13 mobile e2e (V5). NO Tailwind v4 regression (the glass-* plain-CSS doctrine holds; `@custom-variant hover` present) |
| V16 | Playwright trace audit (the session_31 candidate) | sweep of all raw `evaluate` reads in the e2e suite (the F-51 doctrine) | **NO violations** — the 2 unpinned reads (auth.spec 248/339) are post-settled reads riding auto-retrying `toHaveCSS` pins; the other 50 live inside `expect.poll`. No flaky-posture findings |
| V17 | NEW depth — the receipt print-path (the session_31 pointer) | print-media emulation probes on the dev server (`scripts/print-path-probe*.mjs` + the text-node census, persisted outside the repo): a full UI checkout (T-000001) then `page.emulateMedia({ media: "print" })` + computed-style walks of `.receipt-print` descendants; the Sales viewer probe (open `Ver T-000001` → emulate → census painted elements) | **TWO defects confirmed** (F-114/F-115 below): the terminal receipt prints ONLY "My Store" — the ticket line, items, Subtotal/Tax/Method (oklab white/0.6), the **Total row (pure rgb(255,255,255))**, and the footer all render white-on-white; the Sales viewer prints a BLANK page (no `.receipt-print` wrapper — `body * { visibility: hidden }` with nothing re-visible; dialog computes `visibility: hidden`, exactly 1 painted element) |
| V18 | The `[m` display artifact (withdrawn pre-fix) | Read-tool display showed `const ethod, setMethod]` in terminal-view.tsx:76 | **NOT a defect** — the documented SD-4 class (the terminal display eats the two-byte `[m` sequence from `const [method`); tsc/build/e2e all green on the received tree. Withdrawn before any "fix" — the s13 lesson applied |
| V19 | vitest + playwright config review (the operator's ask) | full read of `vitest.config.ts` + `playwright.config.ts` | both current and well-formed: node-env unit at the pure seams (14 files / 149 tests), e2e = production standalone on :3100 + own `db/e2e.db` + desktop/mobile projects + storageState auth; this cycle ADDS tests through them (the configs need no changes) |

---

## 1. Findings

### The receipt print-path cluster (this cycle's NEW depth — the session_31 pointer)

| ID | Severity | Location | Description |
|---|---|---|---|
| **F-114** | **HIGH** (a functional superset surface broken) | `src/app/tokens.css` `@media print` block (lines 302–316) | The terminal receipt's print path renders **invisible text**. The print block sets `color: #000` only on the `.receipt-print` CONTAINER; every receipt line that carries an explicit white text utility (`text-white/60`, `text-white/80`, `text-white`) beats the inherited color — under `page.emulateMedia({ media: "print" })` the census shows the ticket/timestamp at oklab-white/0.6, the line items at white/0.8, and the **Total row at pure rgb(255,255,255)** on the `background: #fff` print canvas. Only "My Store" (the DialogTitle — no explicit color utility) prints black. A cashier printing a receipt gets a page with a store name and nothing else. Cure: the print block's `.receipt-print, .receipt-print *` rule gains `color: #000` — tokens.css is UNLAYERED plain CSS, which beats Tailwind v4's `@layer utilities` in the cascade (the same law that makes the `glass-*` family work), so no `!important` is needed; the e2e print pin proves it. |
| **F-115** | **HIGH** (a functional superset surface broken) | `src/components/pos/views/sales-view.tsx` `SaleDetailDialog` (lines 38–76) | The Sales receipt viewer's "Imprimir" button **prints a blank page**. The dialog's receipt content (the ticket title, timestamp, line items, Total, Método) has NO `.receipt-print` wrapper — under the print block's `body * { visibility: hidden }`, nothing inside this dialog re-becomes visible: the emulation census shows `hasReceiptPrintWrapper: false`, the dialog itself at `visibility: hidden`, and exactly ONE painted element on the page. The terminal's receipt dialog has the wrapper (terminal-view.tsx:215); the Sales viewer was never given it. Cure: wrap the viewer's receipt content (DialogHeader + the lines block) in `<div className="receipt-print">` — mirroring the terminal receipt's structure, keeping the Cerrar/Imprimir footer buttons outside the wrapper (buttons must not print). |

### Withdrawn / not-findings (recorded to prevent re-litigation)

- **Every standing reference pin** (V10–V14): THIRTEENTH consecutive drift-free cycle. The
  reference is stable; the pin doctrine keeps proving it.
- **The clone's mobile navigation** (V15): the drawer superset is fully live on the dev server
  (all a11y pins + the 13/13 mobile e2e) — the operator's priority check passes with no
  Tailwind v4 regression (the plain-CSS `glass-*` doctrine, `@theme inline`, and
  `@custom-variant hover` all hold).
- **The `ethod` source suspicion** (V18): the documented `[m`-eating terminal display artifact
  (SD-4) — the source is `const [method, setMethod]`; tsc/build/e2e green. Withdrawn.
- **The trace audit** (V16): no F-51-class violations — the 2 unpinned raw reads are
  post-settled reads behind auto-retrying pins.
- **The received tree** (V3–V5): fully green at the Session-16/18 baselines — zero environment
  defects after the chromium-1243 install (the s17 lesson pre-applied).

---

## 2. The GREEN design (constraints settled before any code moves)

1. **The production cures are two surgical edits:**
   - `tokens.css` — the `@media print` block's `.receipt-print, .receipt-print *` rule gains
     `color: #000` (unlayered plain CSS beats `@layer utilities` — the glass-* doctrine; no
     `!important`).
   - `sales-view.tsx` — `SaleDetailDialog`'s receipt content (DialogHeader + the lines block)
     wrapped in `<div className="receipt-print">`; the DialogFooter (Cerrar/Imprimir) stays
     outside the wrapper (buttons must not print — the terminal receipt's own structure).
   No other production code changes. Borders (`border-edge` dashed separators) print dark navy
   — standard receipt furniture, byte-acceptable, NOT part of the defect.
2. **The pins land in the E2E tier (the F-51/F-76 posture: computed styles under print-media
   emulation are the ground truth):**
   - **F-114 pin** extends the existing `cash checkout computes change and assigns the ticket`
     test (terminal.spec.ts) — right before the receipt's Close click: emulate print media,
     pin the Total row's computed color (must be dark — `rgb(0, 0, 0)`), pin a line-item row
     (also dark), emulate back to screen. Extending an existing test adds NO count and touches
     NO shared data order.
   - **F-115 pin** is a NEW test in the same serial describe (after `the sale lands in Historial
     de Ventas`): open `Ver T-000001` → assert the `.receipt-print` wrapper exists inside the
     dialog → emulate print → pin the wrapper's `position: fixed` + white bg + black text and
     the Total row's dark color → emulate back. Read-only (no new sale data — it rides the
     existing T-000001).
   - **E2E moves 104 → 105** (90 → 91 desktop). UNIT stays 149/14. The docs-counts constants
     AND every live-tense doc site move in the SAME commit: README (badge, scripts table,
     testing section), CLAUDE (baseline), PAD (all `${E2E}` sites + v1.17 revision block),
     SKILL v2.15.0 (baselines + the desktop/mobile breakdown + the Session-19 addendum),
     docs-counts.test.ts (constant + comment + the "Session-16 lock" literal → the
     Session-19 lock — this cycle re-anchors the e2e count, so the lock name moves with it).
3. **TDD order (the red is honest):** write both pins FIRST → `bun run build` (the current
   artifact carries the defects) → run the terminal spec → **both print pins FAIL** (the red
   proof on the production artifact) → apply the two cures → rebuild → the pins pass → the
   full gate.
4. **Docs lockstep** (counts move — content + counts): this plan, AGENTS.md (the Session-19
   contracts: the print-path law — "the print canvas is white; every receipt line must compute
   black under print emulation; any new white-text utility inside `.receipt-print` needs the
   pin's protection"), CLAUDE.md (the baseline count + the print-path line), PAD v1.16 →
   **v1.17**, velox-pos_SKILL.md v2.14.0 → **v2.15.0** (the Session-19 addendum), README
   (badge + scripts + testing lines), the repo worklog's Session-19 entry,
   `docs/session_33.md` (the narration). `.env.example` re-verified against `.env`.
5. **Evidence:** screenshots continue the numbered record at **93** (the remediated terminal
   receipt print emulation), **94** (the remediated Sales viewer print emulation), **95** (the
   mobile drawer on the remediated dev server — the operator's priority surface), all captured
   from the running dev server per the operator's ask.

### The RED posture (e2e-tier)

- Both pins must fail on the pre-fix artifact (the build from the received tree) and pass on
  the post-fix build. The pins assert OBSERVABLE print rendering (computed colors + painted
  geometry), never class strings. The F-114 pin rides the existing checkout test's open
  receipt (no data-order risk); the F-115 pin is read-only on the existing T-000001 row.

---

## 3. Execution order

1. This plan → validation against the codebase (the pin insertion points, the wrapper
   structure, the docs-counts anchor list, the screenshot numbering 93–95).
2. **RED**: add the two e2e pins → `bun run build` → run `terminal.spec.ts` → both print pins
   FAIL on the pre-fix artifact (the honest red).
3. **GREEN**: the two cures (tokens.css print color + the sales-view wrapper) → `bun run
   build` → the pins pass.
4. The count lockstep: docs-counts.test.ts E2E 104→105 (+ the lock literal) + every doc site
   (README, CLAUDE, PAD v1.17, SKILL v2.15.0, AGENTS) in the SAME commit.
5. The full gate on the final tree: lint 0 · tsc · unit **149/149** (14 files) · build · smoke
   13/13 · e2e **105/105**.
6. Screenshots 93–95 from the remediated dev server → `docs/screenshots/`.
7. Docs lockstep (§2.4) + `.env.example` verify + the worklog's Session-19 entry +
   `docs/session_33.md` (the narration).
8. Commit (`fix(session-19)` + `update session log`) on main → push via the SSH wrapper
   (`docs/ssh_git_wrapper_v3.py` per its SKILL — dry-run first) → remote verification →
   operator key shredded.

## 4. Execution record (filled in as the cycle runs)

- **The audit pre-proved both defects** (V17): the print-media emulation probes on
  the dev server — the terminal receipt's text-node census (only "My Store"
  black; the Total row rgb(255,255,255); items/ticket/footer at oklab-white
  0.6–0.8) and the Sales viewer census (no wrapper, the dialog hidden, ONE
  painted element). Zero checks weakened; zero production code touched before
  the red.
- **RED proven on the production artifact**: the two e2e pins landed first
  (the F-114 pins inside the existing cash-checkout test; the F-115 test as the
  one NEW test); `bun run build` (the pre-fix tree) → the terminal spec run →
  the checkout test FAILED at the F-114 pin with `Received: "rgb(255, 255,
  255)"` — the Total row's computed print color, byte-exactly the defect. (The
  serial describe stopped there; the F-115 red was proven by the V17 probe —
  `hasReceiptPrintWrapper: false`.)
- **GREEN after the two cures**: `tokens.css` (the `.receipt-print,
  .receipt-print *` print rule gained `color: #000` — unlayered plain CSS
  beating `@layer utilities`, no `!important`, exactly as designed) +
  `sales-view.tsx` (the receipt content wrapped in `.receipt-print`, the
  Cerrar/Imprimir footer outside) → rebuild → the terminal spec **12/12** —
  both print pins pass.
- **Count lockstep executed in the same commit**: docs-counts.test.ts (E2E
  104→105 + the "Session-16 lock" → "Session-19 lock" literal + the
  91-desktop breakdown), README (badge/scripts/testing), CLAUDE (the 105
  baseline + the print-path law line), PAD **v1.17** (header + Last Updated +
  all E2E sites + the revision block), SKILL **v2.15.0** (version + the
  Session-19 addendum + header/commands/testing counts), AGENTS (the
  Session-19 contracts section). The unit gate stayed green through every doc
  edit (the lockstep gate re-verified after each pass).
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **149/149** (14 files — UNMOVED, the lockstep
  gate green with the re-anchored E2E constant) · build green · smoke
  **13/13** · e2e **105/105** (2.5m — 91 desktop + 13 mobile + 1 setup).
- **Evidence: screenshots 93–95** captured from the remediated dev server
  (93: the terminal receipt under print emulation — the Total row verified
  black during capture; 94: the Sales viewer under print emulation — the
  wrapper verified painting; 95: the mobile drawer at 390×844 — the
  operator's priority surface). The capture script
  (`scripts/capture-s19-evidence.mjs`) is committed as the cycle's evidence
  record — it self-provisions its fixture (the s16 family posture) and is
  re-runnable; the STANDING protection for the print-path class lives in the
  e2e suite itself (unlike the s16–s18 with-data harnesses, the print path is
  e2e-visible by construction — the F-114/F-115 pins run on every
  `bun run test:e2e`).
- **`.env.example` verified** against the working `.env` (the documented
  DATABASE_URL + the AUTH_SECRET placeholder posture — the working .env
  carries the generated 64-hex secret; the example keeps the empty-string
  contract).

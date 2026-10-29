# Session-29 remediation plan — the receipt PDF superset build (F-127)

**Received tree:** `31a103c` (the Session-28 push `c0761de` + the operator's `session_52`
raw-log commit — exactly one file, +92, matching the Session-28 record line for line).

**Cycle shape:** the FOURTH full sandbox reset (the whole environment again — the repo,
`scripts/`, and `bin/` all gone). Fresh clone + the documented rebuild ladder; the
audit helpers rebuilt (census, credential checker, with-dev-server bundle, the
Appendix-A ssh shim — all from their plan-corpus/SKILL descriptions). Then the standing
sweeps, the depth ANALYZE, this cycle's cure — the LAST standing session_47 candidate,
deferred three times: **the receipt PDF**. A PRODUCTION-code feature build (the
codebase's first new seam + new route since Session-21's store race): a hand-rolled
PDF renderer (the zero-dependency doctrine — no PDF library, the "zero chart
dependencies" precedent extended), a new ownership-scoped API route, a Sales-viewer
footer affordance, a unit seam file (TDD), and a 4th test in the Session-28 sales walk.

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|-------|-----|--------|
| V1 | Workspace rebuild | clone `31a103c` → `.env` (fresh 64-hex AUTH_SECRET + COOKIE_SECURE=false + `DATABASE_URL="file:../db/custom.db"`) → `bun install` (472 pkgs) → `db:push` + `db:seed` → `bunx playwright install chromium` (chromium-1243, matching the S27/S28 record) | ready; the owner seeds (role owner, verified) |
| V2 | Received delta + fast gate | `git diff c0761de..31a103c --stat` + `lint → tsc → test` | delta = exactly `docs/session_52.md` (+92) · lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-28 lock holds |
| V3 | Zero-importer census | the REBUILT census (Session-28 semantics: `@/` alias, runtime `dependencies` only) | **158 scanned (+2 = the s28 evidence script + the sales walk spec, as recorded), ZERO dead**; the dep report exactly the documented trio |
| V4 | Secrets scan | ripgrep for the credential + key/AWS/ghp patterns across `src/ tests/ scripts/ prisma/` | only the documented locations (the seed + the e2e boot fixtures + the evidence-script family + smoke-test.sh + restore-owner-password); no other patterns |
| V5 | Owner credential | the REBUILT scrypt mirror checker | **VERIFIES** against the warm `db/custom.db` |
| V6 | Reference sweep #23 | agent-browser (named session; state persists across calls), computed styles, ONE login (2 attempts of the 10/15-min budget) | ALL pins HOLD — see V6 detail |
| V7 | Clone mobile drawer 390×844 | `with-dev-server.sh` bundle + agent-browser, REAL clicks (the V14 law) | ALL superset pins PASS — see V7 detail; NO Tailwind v4 regression |
| V8 | The F-127 ANALYZE | the static reads (§1.3) — the receipt content contract, the route/wrapper shapes, the download-event precedent, the pin-collision survey | design settled; see §1.3 |

**V6 detail — sweep #23 (the twenty-third consecutive hold):** the login card
(backdrop `blur(4px)` · `rgba(255,255,255,0.95)` · 16px radius · h1 30px/700 · inputs
48px/12px · SSO 54px/16px); the F-76 alert byte-exact on `rgba(254,242,242,0.7)` with
red-700 text (re-verified with wrong credentials); the `/` landing + the 220px sidebar
+ the 8 links + doc 1440 = client 1440; the Dashboard date line ("Thursday, October 29,
2026") + both chart h3s at 16px/700; the Spanish families ("Historial de Ventas" H1 +
"Sin ventas"; "Cajeros" H1 + "Turnos Recientes" 16px/700 + "0 usuarios registrados");
**the Session-28 bare-table finding re-confirmed** (the reference's empty Turnos
ledger: six headers, ZERO tbody rows, no "Sin turnos" copy — settled at 3.5s); Reports
STILL empty (2× "No data for this period"). The reference's OWN mobile defect STABLE
at the D-1 shape (390 on /POS and /Dashboard: no hamburger, static 220px sidebar, main
170px). Reference capture: `docs/screenshots/ref-mobile-pos-390-s29.png`.

**V7 detail — the clone's mobile drawer:** at 390 the chrome switches exactly at md
(aside `display:none`, the labeled hamburger visible, doc 390 = client 390); the REAL
click opens the dialog at 288px with its 8 labeled links; `animation-name: enter`
(read directly on the `[role=dialog]` element); focus moves to "Close navigation menu"
on open (inside the dialog); the body scroll-lock; Escape unmounts, RESTORES the
hamburger's focus, releases the lock; a link click navigates (/Dashboard) and unmounts
the drawer; zero horizontal overflow at every step. (One probe-script quoting bug —
a missing IIFE paren in the D4 read-out — was re-run corrected; the click+navigate
leg itself had run.)

## 1. Findings

### F-127 — the receipt has no programmatic PDF form (this cycle's NEW depth — the last standing session_47 candidate)

**The gap:** the clone's receipts exist in exactly two forms — the on-screen dialog
(the terminal post-checkout + the Sales viewer) and the browser's print dialog
(`window.print()` → Save-as-PDF is a CLIENT-side, browser-dependent flow). There is
no SERVER-side receipt artifact: nothing an integration can fetch, archive, or attach;
no deterministic bytes; no ownership-scoped endpoint. The reference is write-gated —
its checkout chain is unmeasurable there — so this is a pure functional-SUPERSET
feature (the deepest one still missing from the session_47 lineage).

**The "email" question, decided (the operator's open-questions mandate):** no SMTP
exists in this deployment story — the codebase's documented no-SMTP posture (the
reset-password route: the URL in the response IS the delivery). An "email receipt"
without a transport would be fake functionality; the honest superset is the PDF
endpoint as the receipt's DELIVERABLE (download it, archive it, attach it however
the operator pleases). No stub send will ever be shipped — recorded as law in AGENTS.

**The design (the zero-dependency doctrine):** the charts are hand-rolled SVG ("zero
chart dependencies"); the PDF gets the same treatment — a hand-rolled minimal
**PDF 1.4** text renderer at a pure seam, NO PDF library (no `pdfkit`, no `jspdf` —
zero new dependencies, zero supply-chain surface). The input contract mirrors the
terminal receipt's exact content family (measured in §1.3): store name, `ticket ·
DD/MM/YYYY HH:MM`, the `qty × name … $` lines, Subtotal/Tax/Total, the cash
Paid/Change row (cash sales only), Method, the fiscal conditional, the footer.

### 1.3 The ANALYZE (the static reads + the design measurements)

- **The content contract** (`src/components/pos/views/terminal-view.tsx:215-270`,
  the richest receipt rendering): the DialogTitle is the store name; the description
  `ticket · saleTimestamp`; the lines `qty × name` + `formatMoney(price×qty)`; the
  money block Subtotal/Tax/Total + the cash-only `Cash / Change: paid / change` row +
  `Method: capitalize`; the fiscal conditional
  `!hideFiscalOnReceipt && (fiscalRuc || taxId)` → `{ruc|taxId}{biz ? ` · ${biz}` : ""}`;
  the footer `receiptFooter`. The Sales viewer's dialog (Session-28's walk) is the
  same family minus Subtotal/Tax/Cash rows.
- **The data available at the route**: `GET /api/sales/[id]` already returns the sale
  with `cashier`/`register` includes; the settings row carries `storeName`,
  `receiptFooter`, `hideFiscalOnReceipt`, `fiscalRuc`, `fiscalBusinessType`, `taxId`.
  The PDF route composes both (ownership-scoped: the sale by `findFirst({ where: {
  id, userId } })`, the settings by `userId` — the 404 wall rides `NotFoundError`).
- **The wrapper pattern** (`src/lib/server/http.ts:147`): `withUserParams` — the new
  route is a 3-line shell over it (the route-shell law).
- **The download-event precedent**: F-122's CSV export leg
  (`page.waitForEvent("download")` + `suggestedFilename()` + the saved file's bytes)
  — field-tested in this suite; the same pattern proves the PDF wiring end-to-end.
- **The pin-collision survey**: terminal.spec's F-115 asserts the footer buttons are
  OUTSIDE `.receipt-print` (a third footer anchor is safe — it never enters the
  wrapper, so `receipt.getByRole("button")).toHaveCount(0)` is untouched); the s16
  harness pins the dialog family + the F-110 stamp on the title/description (the new
  anchor changes neither); the Sales viewer's `Imprimir`/`Cerrar` pins are additive.
  The Button primitive supports `asChild` (Radix Slot) — the affordance is a styled
  anchor. **The one intentional capture change**: s16's screenshot 82 (the receipt
  viewer) re-commits with the new footer button — an intentional content change, not
  a content-identical restore.
- **The encoding decision**: PDF text strings are encoded **latin-1** (WinAnsi) — the
  receipt family's `×` (0xD7), `·` (0xB7), and the Spanish diacritics are all
  single-byte WinAnsi; the font declares `/Encoding /WinAnsiEncoding`. Characters
  outside latin-1 (a CJK product name, say) are a documented limitation of the
  no-dependency renderer (the es/en receipt domain the reference itself ships);
  noted in the seam's doc comment.
- **The PDF structure** (the unit-testable contract): `%PDF-1.4` header; objects
  1..5 (catalog, pages, page A4 595×842, Courier font, content stream); the xref
  table with EXACT byte offsets; `trailer` + `startxref`. Deterministic: same input →
  identical bytes.

## 2. The cure

### 2.1 The seam — `src/lib/receipt-pdf.ts` (TDD; the pure-render law)

`renderReceiptPdf(input: ReceiptPdfInput): Uint8Array`. The input carries
PRE-FORMATTED strings (money/timestamp formatting stays at the edge — the route
layer formats via `formatMoney`/`saleTimestamp`; the seam is pure bytes):

```ts
export type ReceiptPdfLine = { qty: number; name: string; amount: string };
export type ReceiptPdfInput = {
  storeName: string;
  ticket: string;        // "T-000001"
  timestamp: string;      // DD/MM/YYYY HH:MM (F-110's byte-stable form)
  lines: ReceiptPdfLine[];
  subtotal: string; tax: string; total: string;
  method: string;        // "cash" | "card" (capitalize at the edge)
  cash?: { paid: string; change: string };  // cash sales only
  fiscal?: string;       // the preformatted "RUC · biz" line; undefined = hidden
  footer?: string;
};
```

### 2.2 The unit file — `tests/unit/receipt-pdf.test.ts` (RED first)

1. the `%PDF-1.4` magic + `%%EOF` terminator;
2. **the xref contract**: parse the xref entries; each offset must point EXACTLY at
   its `N 0 obj` (the strongest structural assertion — the render's byte math);
3. the content stream carries the store name, the ticket · timestamp, every line's
   `qty × name` and amount, Subtotal/Tax/Total/Method (latin-1: `×` as 0xD7);
4. PDF string escaping: parens/backslashes in a product name survive round-trip;
5. the conditionals: `cash` present → the Paid/Change row; absent → no row; `fiscal`
   undefined → no fiscal line; `footer` empty → no footer line;
6. determinism: two renders of the same input are byte-identical.

### 2.3 The route — `src/app/api/sales/[id]/receipt/route.ts`

A 3-line shell over `withUserParams`: ownership-scoped sale fetch (+ settings row),
`renderReceiptPdf` at the edge (formatting via `formatMoney` + `saleTimestamp`), the
response `application/pdf` + `Content-Disposition: attachment; filename="<ticket>.pdf"`;
the 404 wall via `NotFoundError` (bogus id / foreign id).

### 2.4 The UI — the Sales viewer's `SaleDetailDialog` footer

A third affordance beside Cerrar/Imprimir (OUTSIDE `.receipt-print` — buttons never
print): `Button asChild` wrapping `<a href="/api/sales/{id}/receipt" download
aria-label="Descargar PDF {ticket}">` with a lucide `Download` icon, label "PDF".
The terminal receipt dialog is deliberately UNTOUCHED this cycle (minimal diff; the
walk pins the Sales surface; recorded as the next candidate).

### 2.5 The e2e — the Session-28 sales walk's 4th test

Placed BETWEEN the search test and the refund test (declaration order — the sale is
still `completed`): the API leg (GET `/api/sales/{id}/receipt` → 200
`application/pdf` + the `%PDF` magic + the latin-1 content stream carries the store
name/ticket/line/Total; the bogus-id 404 wall), the UI leg (the "Descargar PDF"
click → `waitForEvent("download")` → `suggestedFilename()` = `<ticket>.pdf` → the
saved file's bytes match the API's), riding the walk's existing fixture (no new
provisioning; the ordering law untouched — no new spec file, the walk still sorts
LAST, its shift self-closes at the end of test 1 as before).

### 2.6 Counts

UNIT **151 → 151+N** (N = the seam tests; **files 15 → 16**) · E2E **123 → 124**
(desktop **109 → 110**) · specs stay **14** · **ROUTE_FILES 26 → 27** (the new
nested route). Every live-tense site moves in the SAME commit (docs-counts
re-anchored; the unit census is self-anchoring so N lands from the live run).

## 3. Execution order

1. The unit seam RED (the file imports a non-existent module → the suite fails) →
   `receipt-pdf.ts` GREEN (iterate until all §2.2 assertions pass).
2. The API route (thin shell) + a quick bun live probe against the dev server
   (bundle: boot → curl the PDF → byte-inspect → shutdown).
3. The UI anchor in `sales-view.tsx`.
4. The e2e 4th test (characterization — the ANALYZE says every leg must PASS first
   run; the download-event pattern is field-tested).
5. `lint` + `typecheck` + `build`.
6. The count lockstep in the SAME commit (docs-counts: UNIT/UNIT_FILES from the live
   census, E2E 124, ROUTE_FILES 27 + every site: README badge/scripts/testing, CLAUDE
   baseline + seam registry, AGENTS the Session-29 contracts + the registry line, PAD
   v1.27 scale line + spec map + revision block, SKILL v2.25.0 + the addendum,
   vitest.config.ts's header).
7. The full gate: lint → tsc → unit → build → smoke → e2e ×2 → the three with-data
   harnesses (s16's capture 82 re-commits intentionally; the rest restore
   content-identical).
8. The s29 evidence script: screenshots 123–125 (the viewer with the PDF button +
   the downloaded PDF's first bytes; the receipt PDF rendered in a viewer if the
   sandbox opens one — else the byte dump as the evidence; the mobile drawer at 390).
9. `.env.example` verify · worklog entry · session_53.md narration · commit · the
   SSH-wrapper push (dry-run → fingerprint oracle → push → dual verify → shred).

## 4. Execution record (filled in as the cycle runs)

- **The seam, TDD-first**: the unit file written and run RED (`Cannot find
  package '@/lib/receipt-pdf'`), then `src/lib/receipt-pdf.ts` landed — 6/6
  GREEN after ONE authoring iteration in the TEST (a 12-char offset slice
  compared against a 7-char expected string; corrected to `startsWith`).
  The xref byte-math held on the first render — verified TWICE: the unit
  contract, then an independent Python re-parse of the rendered bytes
  (offsets, trailer, EOF), then a THIRD authoritative validation via pypdf
  (the full text extraction — store/ticket/stamp/lines/money/cash/fiscal/
  footer all present, `×` and `·` correct at the WinAnsi code points).
- **The live probe** (with-dev-server bundle + curl): 200
  `application/pdf` + `Content-Disposition: attachment; filename="T-000001.pdf"`
  + the pypdf extraction printed to the log + the 404 wall (bogus id) + the
  401 wall (no cookie) + the self-clean close at exact variance.
- **The e2e leg**: the 4th test (placed between the search and refund
  tests, riding the completed sale) — the API leg (headers, the %PDF magic,
  the latin-1 content family, the bogus-id 404) + the UI leg (the
  "Descargar PDF" anchor → the download event → the suggested filename →
  the downloaded bytes byte-identical to the API's + the anchor outside
  .receipt-print). **First-run green** — the F-122 download-event pattern
  carried it.
- **The count lockstep executed in the same commit**: docs-counts (UNIT 157,
  UNIT_FILES 16, E2E 124, ROUTE_FILES 27, the "Session-29 lock" literal, the
  F-127 provenance comments) + every live-tense site: README (badges, the
  scripts table, the testing section's seam list, the API table's receipt
  row, the architecture table's PDF row, the directory map at 16) + CLAUDE
  (the baseline, the seam table's receipt-pdf row) + AGENTS (the registry
  line at 16 + the Session-29 PDF contracts: the zero-dependency law, the
  edge-formatting law, the latin-1 limitation, the no-SMTP law, the
  outside-the-wrapper law, the ownership-wall law) + PAD v1.27 (the scale
  line at 27 routes + the spec map's PDF leg + the revision block) + SKILL
  v2.25.0 (the header baselines, the commands, §12's tiers, the addendum) +
  vitest.config.ts's header (16 files + receipt-pdf). The gate's failing
  assertions enumerated the six stale docsites and all passed after the
  sweep. Note: two `bun run test` invocations hung mid-run (the sandbox's
  process-kill behavior); direct `bunx vitest run` runs clean — noted in
  the worklog.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **157/157** (16 files) · build green · smoke
  **13/13** · e2e **124/124 × 2 consecutive full runs** (110 desktop + 13
  mobile + 1 setup) · the three with-data harnesses **s16 13/13 · s17 19/19
  · s18 20/20**.
- **The post-run db state verified**: the settings at seed defaults · ZERO
  open shifts · 11 fixture sales, 1 refunded (the walk's one-way guard
  means it stays; the scratch db is per-run).
- **Evidence: screenshots 123–125** via the committed
  `scripts/capture-s29-evidence.mjs` — 123 the receipt viewer with the new
  "Descargar PDF" affordance (glass-button family rgba(28,31,52,0.85)
  verified), 124 the receipt PDF rendered in the browser (the download
  event verified FIRST — the suggested filename `T-000002.pdf` + the
  downloaded bytes byte-identical to the API's — then the same bytes
  rendered via an embed data-URL overlay), 125 the mobile drawer at 390
  (288px, zero overflow). The script's live log carries the pypdf
  authoritative extraction. The captures verified DISTINCT (5 unique
  md5s with the ref + the s16 re-commit). s16's capture 82 re-commits
  intentionally (the new footer button); the rest restored
  content-identical.
- **`.env.example` verified** key-for-key against the working `.env`
  (COOKIE_SECURE the documented optional escape hatch — the only delta).

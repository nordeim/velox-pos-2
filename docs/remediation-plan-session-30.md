# Session-30 remediation plan — the terminal receipt PDF affordance (F-128)

**Received tree:** `e8c8666` (the Session-29 push `535385a` + the operator's `session_54`
raw-log commit — exactly one file, +49, matching the Session-29 record line for line).

**Cycle shape:** the FIFTH full sandbox reset (the repo, `scripts/`, and `bin/` all gone —
again). Fresh clone + the documented rebuild ladder; the audit helpers rebuilt from their
plan-corpus/SKILL descriptions (the census with its Session-28/29 semantics, the scrypt
credential checker, the with-dev-server bundle; the Appendix-A ssh shim rebuilds at push
time). Then the standing sweeps, the depth ANALYZE, this cycle's cure — the
session_53 pointer's leading candidate, deliberately untouched in Session-29: **the
terminal receipt dialog's own PDF affordance**. The PDF delivery story completes: every
receipt surface (the Sales viewer since F-127, the post-checkout terminal dialog now)
carries the download anchor.

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|-------|-----|--------|
| V1 | Workspace rebuild | clone `e8c8666` → `.env` (fresh 64-hex AUTH_SECRET + COOKIE_SECURE=false + `DATABASE_URL="file:../db/custom.db"`) → `bun install` (472 pkgs) → `db:push` + `db:seed` → `bunx playwright install chromium` (chromium-1243, matching the S27–S29 record) | ready; the owner seeds (role owner) |
| V2 | Received delta + fast gate | `git diff 535385a..e8c8666 --stat` + `lint → tsc → vitest` | delta = exactly `docs/session_54.md` (+49) · lint 0 errors (1 documented warning) · tsc clean · **unit 157/157** (16 files) — the Session-29 lock holds |
| V3 | Zero-importer census | the REBUILT census (S28/S29 semantics: `@/` alias, runtime `dependencies` only, roots = app-router convention files + tests + scripts) | **156 scanned (src 90 / tests 33 / scripts 33), ZERO dead**; the dep report exactly the documented trio (`prisma` declared-never-imported · `react-dom` declared-never-imported · `z-ai-web-dev-sdk` evidence-script family only). Scope note: S29's rebuilt census recorded 158 — its walk additionally counted `scripts/smoke-test.sh` and one root-level entry; the semantic verdict (zero dead + the trio) is identical |
| V4 | Secrets scan | ripgrep for the credential + key/AWS/ghp patterns across `src/ tests/ scripts/ prisma/` | only the documented locations (the seed + the e2e boot fixtures + the evidence-script family + smoke-test.sh + restore-owner-password); no other patterns |
| V5 | Owner credential | the REBUILT scrypt mirror checker (createRequire from the REPO's package.json, absolute db URL) | **VERIFIES** against the warm `db/custom.db` (`scrypt$46d9a28…`) |
| V6 | Reference sweep #24 | agent-browser (named session `ref24`), computed styles, ONE real login + one wrong-credential probe (2 attempts of the 10/15-min budget) | ALL pins HOLD — see V6 detail |
| V7 | Clone mobile drawer 390×844 | `with-dev-server.sh` bundle + agent-browser, REAL clicks (the V14 law) | ALL superset pins PASS — see V7 detail; NO Tailwind v4 regression |
| V8 | The F-128 ANALYZE | the static reads (§1) — the terminal receipt dialog footer, the Sale type, the Button/asChild + Download-icon availability, the S29 anchor pattern, the pin-collision survey | design settled; see §1 |

**V6 detail — sweep #24 (the twenty-fourth consecutive hold):** the login card
(backdrop `blur(4px)` · `rgba(255,255,255,0.95)` · 16px radius · h1 30px/700 · inputs
48px/12px · SSO 54px/12px); the F-76 alert byte-exact on `rgba(254,242,242,0.7)` with
red-700 `rgb(185,28,28)` text and the "Invalid email or password" copy; the `/` landing
+ the 220px sidebar + the 8 links + doc 1440 = client 1440; the Dashboard date line
("Thursday, October 29, 2026") + both chart h3s at 16px/700; the Spanish families
("Historial de Ventas" H1 + "Sin ventas"; "Cajeros" H1 + "Turnos Recientes" **H3** at
16px/700 — the F-57 tag verified against the clone — + "0 usuarios registrados"); the
Session-28 bare-table finding re-confirmed a THIRD time (the empty Turnos ledger: six
headers — Cajero/Caja/Inicio/Fin/Ventas/Estado — ZERO tbody rows, no "Sin turnos" copy);
Reports STILL empty (2× "No data for this period"). The reference's OWN mobile defect
STABLE at the D-1 shape (390 on `/` and `/dashboard`: no hamburger, static 220px sidebar,
main 170px, doc 390 = client 390). Reference capture: `docs/screenshots/ref-mobile-pos-390-s30.png`.

**V7 detail — the clone's mobile drawer:** at 390 the chrome switches exactly at md
(aside `display:none`, the labeled hamburger "Open navigation menu" visible, doc 390 =
client 390); the REAL click opens the dialog at **288px** with its **8 labeled links**;
`animation-name: enter` (read directly on the `[role=dialog]` element); the body
scroll-lock (`overflow:hidden`); focus inside the dialog on the "Close navigation menu"
button; Escape unmounts, RESTORES the hamburger's focus, releases the lock; a Dashboard
link click navigates and unmounts the drawer; zero horizontal overflow at every step.
(One probe-script paren bug in the D2 read-out — the S29 lesson's exact class, a missing
`)` in a ternary — was corrected and re-run; the click legs themselves had run clean,
proven by the Escape-close and the re-open-navigate.)

## 1. Findings

### F-128 — the terminal receipt dialog has no PDF affordance (this cycle's depth — the session_53 pointer's leading candidate)

**The gap:** since F-127 the receipt PDF exists as a server-side artifact
(`/api/sales/[id]/receipt`) with exactly ONE UI entry point — the Sales viewer's
"Descargar PDF" footer anchor. The surface where a receipt is BORN — the terminal's
post-checkout dialog (`terminal-view.tsx` `ReceiptDialog`) — offers only Close and
Print receipt; the cashier who just completed a sale must navigate to Sales and find
the ticket to get the PDF. Session-29's plan recorded this deliberately: "the terminal
receipt dialog is deliberately UNTOUCHED this cycle (minimal diff) … recorded as the
next candidate."

**The ANALYZE (the static reads):**
- The footer (`terminal-view.tsx:266-273`): `DialogFooter` with Close (ghost) and
  Print receipt (primary, `window.print()`) — both OUTSIDE `.receipt-print` (the F-115
  law). The new anchor slots before Close, mirroring the Sales viewer's
  `[PDF][Cerrar][Imprimir]` order → `[PDF][Close][Print receipt]`.
- **The copy is ENGLISH on this surface** ("Close", "Print receipt", "Thank you for
  your purchase!") — the anchor is `Download PDF ${ticket}` (aria-label) with the
  visible "PDF" label + the lucide `Download` icon, matching its surface's family
  (the Sales viewer's Spanish "Descargar PDF" stays untouched — each surface is
  internally consistent).
- The `Sale` type carries `id` (`src/lib/store.ts:86`) — the anchor's
  `href={/api/sales/${sale.id}/receipt}` is available as-is.
- `Button` supports `asChild` (the S29 anchor rides it); `Download` is not yet in
  terminal-view's lucide import (add it).
- **The pin-collision survey (the decisive read):** terminal.spec's checkout test
  clicks `getByRole("button", { name: "Close", exact: true })` — an anchor named
  "Download PDF T-000001" cannot collide. F-110 (the byte-stable stamp) and F-114
  (the print-media colors) pin `.receipt-print` internals — unaffected by a footer
  anchor outside the wrapper. The s16 harness pins the Sales viewer's dialog family
  — not the terminal dialog. BUT a NEW test doing its own checkout would mint
  T-000002 and break two downstream pins: the stock-decrement test asserts Checkout
  Juice at **39** (40 − 1), and the dashboard chart tests (F-50/F-95..F-101) measure
  the suite's real sales. **→ EXTEND the existing checkout test** (the receipt dialog
  is already open with T-000001; no new sale, no count change, no cascade).
- The e2e pattern is field-tested twice (F-122's CSV leg, F-127's viewer leg):
  `Promise.all([page.waitForEvent("download"), anchor.click()])` →
  `suggestedFilename()` → the saved bytes vs the API's.

## 2. The cure

### 2.1 The UI — `terminal-view.tsx` `ReceiptDialog` footer

A third affordance before Close, mirroring `sales-view.tsx` exactly but in the
surface's English family:

```tsx
<Button variant="ghost" asChild className="glass-button rounded-xl border-0">
  <a href={`/api/sales/${sale.id}/receipt`} download aria-label={`Download PDF ${sale.ticket}`}>
    <Download className="h-4 w-4" aria-hidden="true" />
    PDF
  </a>
</Button>
```

OUTSIDE `.receipt-print` (the F-115 law — footer buttons never print). The route,
the seam, and the renderer are UNTOUCHED (F-127's stack serves this surface as-is).

### 2.2 The e2e — the terminal checkout test's F-128 legs (extend, no new test)

Inside `"cash checkout computes change and assigns the ticket"`, after the F-114
print-media probes and before the Close click (the receipt dialog is open, T-000001):

1. the anchor is visible: `getByRole("link", { name: "Download PDF T-000001" })`;
2. the anchor stays OUTSIDE `.receipt-print` — the F-115 law now pinned on the
   terminal surface too (`receipt.locator(".receipt-print").getByRole("link")` → 0);
3. the download event: the click → `waitForEvent("download")` →
   `suggestedFilename()` = `T-000001.pdf`;
4. byte-identity: the downloaded file's bytes === the API's
   (`page.request.get("/api/sales/<id>/receipt")` — the anchor's href read from the
   DOM; determinism makes them identical).

### 2.3 Counts

**NO COUNTS MOVE**: unit **157** (16 files — no seam change) · e2e **124** (the legs
extend an existing test) · specs **14** · ROUTE_FILES **27**. The lock literal moves
"Session-29 lock" → **"Session-30 lock"** (the baseline re-verified this cycle) in
docs-counts + the SKILL header — same commit.

### 2.4 The docs lockstep

AGENTS (the Session-30 section: the English-copy law per surface, the
outside-wrapper pin now on both receipt surfaces, the extend-not-mint law — the
stock/dashboard pin cascade) · README (the terminal.spec row in the testing section,
if it enumerates legs) · CLAUDE (baseline note) · PAD **v1.28** (revision block + the
spec-map note) · SKILL **v2.26.0** (header baselines + §12 + the addendum) ·
docs-counts (the lock literal) · worklog Session-30 · `docs/session_55.md` narration.

### 2.5 The evidence — `scripts/capture-s30-evidence.mjs`

Screenshots **126–128** (the s19..s29 family posture — self-provisioning, idempotent
by name, re-runnable): **126** the terminal receipt dialog with the new Download PDF
affordance (the cycle's UI change); **127** the PDF verification capture (the anchor
click's download verified — suggested filename + byte-identity against the API — with
the pypdf extraction printed to the live log); **128** the mobile drawer at 390 (the
operator's priority surface). Self-clean: the shift closes at exact variance; the
minted sale stays (the one-way refund guard posture — no deletes).

## 3. Execution order

1. The src anchor + the lucide import (the 2.1 diff).
2. The e2e legs (the 2.2 extension) — characterization: the ANALYZE says every leg
   must PASS first run (the pattern is field-tested twice).
3. `lint → typecheck → unit 157 → build`.
4. The docs lockstep (§2.4) in the SAME commit.
5. The full gate: lint → tsc → unit → build → smoke → e2e ×2 → the three with-data
   harnesses (captures restore content-identical).
6. The s30 evidence script (§2.5) + `.env.example` verify.
7. worklog Session-30 · session_55.md · commit · the SSH-wrapper push
   (shim rebuild → dry-run → fingerprint oracle → push → dual verify → shred).

## 4. Execution record (filled in as the cycle runs)

- **The TDD ledger, RED first**: the e2e legs written and run against the
  pre-fix build — RED exactly at the new anchor assertion
  (`getByRole('link', { name: 'Download PDF T-000001' })` timing out; the
  serial block stopped there, 3 passed / 1 failed / 8 not run). Then the
  two-file src change (the lucide `Download` import + the footer anchor),
  `lint → tsc → build` clean, and the GREEN run: **all 12 terminal tests
  first-run** — the F-128 legs (anchor visible · outside `.receipt-print` ·
  the download event · `T-000001.pdf` · the downloaded bytes byte-identical
  to the API's through the anchor's own href) passed exactly as the ANALYZE
  predicted (the pattern field-tested by F-122 and F-127).
- **The count lockstep**: NO counts moved (unit 157/16, e2e 124, specs 14,
  ROUTE_FILES 27 — by design, the extend-not-mint law); the lock literal
  moved "Session-29 lock" → **"Session-30 lock"** in the SKILL header +
  the docs-counts assertion, with the F-128 provenance comment added to the
  E2E census block. The docs-counts gate: **10/10**. The narrative sites:
  AGENTS' Session-30 contracts section (the English-copy law per surface,
  the outside-wrapper pin on both receipt surfaces, the extend-not-mint
  law, the anchor's-own-href byte-identity law) · README's e2e row (the
  F-128 anchor note) · CLAUDE's receipt-print paragraph (both surfaces'
  anchors) · PAD **v1.28** (the spec map's terminal entry + the revision
  block) · SKILL **v2.26.0** (the header baselines + the Session-30
  addendum).
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **157/157** (16 files) · build green · smoke
  **13/13** · e2e **124/124 × 2 consecutive full runs** (110 desktop + 13
  mobile + 1 setup) · the three with-data harnesses **s16 13/13 · s17
  19/19 · s18 20/20** (the captures restored content-identical — no
  intentional capture changes this cycle; the terminal dialog is not a
  harness surface).
- **The post-run db state verified**: the settings at seed defaults · ZERO
  open shifts · the evidence script's 4 completed fixture sales remain
  (the re-run posture — two earlier script iterations minted T-000001–3
  before the restructure; no deletes, the one-way-guard posture).
- **The s30 evidence script (committed)**: `scripts/capture-s30-evidence.mjs`
  — one flow per the e2e test (checkout → the receipt dialog → the anchor →
  the screenshot → the REAL download → the API byte-compare → the pypdf
  extraction), then the overlay render + the drawer capture. **Screenshots
  126–128**: 126 the post-checkout dialog with the Download PDF affordance
  (the glass-button family `rgba(28,31,52,0.85)` verified, matching S29's
  record), 127 the anchor-delivered PDF rendered in the browser (the
  download verified byte-identical FIRST), 128 the mobile drawer at 390
  (288px, zero overflow). The live log carries the pypdf authoritative
  extraction — the full receipt content including the live **Cash / Change
  $5.00 / $0.50** row (the change-generating sale, richer than S29's
  exact-payment fixture). The captures verified DISTINCT (4 unique md5s
  with the ref capture). Two script iterations were needed: (1) the
  href-parse popped "receipt" instead of the sale id — the 404; (2) the
  127 block minted a second sale but clicked the first block's ticket —
  restructured into the single-flow pattern (the s29 lesson generalized:
  the evidence flow should mirror the e2e flow, one sale one dialog).
- **`.env.example` verified** key-for-key against the working `.env`
  (COOKIE_SECURE the documented optional escape hatch — the only delta).
- **The ssh push**: the Appendix-A shim rebuilt (the fifth reset took `bin/`
  with everything else) · paramiko 5.1.0 installed · the operator key to
  /tmp (0600) with the fingerprint matching the oracle
  (`SHA256:4FSV1Prot+…` ed25519) · the wrapper's dry-run GREEN (remote
  `e8c8666` → `218e7f0`) · the real push **`218e7f0`** with the wrapper's
  own remote verification (`refs/heads/main @ 218e7f0 == local HEAD`) ·
  the HTTPS `ls-remote` dual-channel match · the operator key shredded
  (`shred -u -z`, the file gone) after the wrapper had already shredded
  its temp copy.

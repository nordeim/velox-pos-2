# Session-28 remediation plan — the Sales receipt-viewer walk (F-126) + the Cashiers empty-ledger parity cure (F-126-a)

**Received tree:** `b822eaa` (the Session-27 push `dbc8f9d` + the operator's `session_50`
raw-log commit — the pull/clone brought exactly that one file, +60 lines, matching the
Session-27 record line for line).

**Cycle shape:** the workspace was RESET for the third time (the whole sandbox, not just
the repo — `/home/z/my-project/scripts/` died with it). Fresh clone + full rebuild; the
NEW sandbox kills every background process at the end of each tool call, so the
"boot once, probe across calls" dev-server posture of Sessions 1–27 is dead — replaced by
`with-dev-server.sh` (a self-contained boot→probe→shutdown wrapper per call). The
standing audit scripts were rebuilt from their plan-corpus descriptions (provenance below).
Then the standing sweeps, the depth ANALYZE, a TWO-part cure — the cycle's first `src/`
change since Session-21 (a measured parity fix) plus the season's eighth with-data walk —
the count lockstep, the full gate, screenshots 120–122, docs, push.

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|-------|-----|--------|
| V1 | Workspace rebuild | clone `b822eaa` → `.env` (fresh 64-hex AUTH_SECRET + COOKIE_SECURE=false + `DATABASE_URL="file:../db/custom.db"`) → `bun install` (471 pkgs) → `db:push` + `db:seed` → `bunx playwright install chromium` (chromium-1243, matching the S27 record) | ready; the owner seeds (`sepnetflix2023@outlook.com`, role owner, verified) |
| V2 | Received delta + fast gate | `git diff dbc8f9d..b822eaa --stat` + `lint → tsc → test` | delta = exactly `docs/session_50.md` (+60) · lint 0 errors (1 documented warning) · tsc clean · **unit 151/151** (15 files) — the Session-27 lock holds |
| V3 | Zero-importer census | the REBUILT `/home/z/my-project/scripts/zero-importer-census.mjs` (the reset destroyed the Session-3 original; scope + semantics reconstructed from the plan corpus — `@/` alias resolution added, dep scan = runtime `dependencies` only) | **156 scanned, ZERO dead files**; dep report = exactly the documented trio (`prisma` the CLI, `react-dom` the implicit Next entry, `z-ai-web-dev-sdk` the evidence-script family). Provenance: the historical scope counted 151 at this tree's lineage; the rebuilt scope's 156 = the same tree counted with the reconstruction's documented roots (the +2 delta vs S27 = the S27 spec + the s27 evidence script, as recorded) |
| V4 | Secrets scan | ripgrep for the credential + key/AWS/PEM patterns across `src/ scripts/ tests/ prisma/` | only the documented locations (the seed + the e2e boot fixtures + the evidence-script family + smoke-test.sh); no other secret patterns |
| V5 | Owner credential | the REBUILT `check-owner-credential.mjs` (scrypt mirror of `src/lib/auth.ts`, read-only) | **VERIFIES** — the documented `$Abcd1234` passes against `db/custom.db` |
| V6 | Reference sweep #22 | agent-browser (its own session; state persists across calls in the new sandbox — verified), computed styles, ONE login (2 attempts of the 10/15-min budget) | ALL pins HOLD — see V6 detail + **the cycle's finding F-126-a** |
| V7 | Clone mobile drawer 390×844 | `with-dev-server.sh` + agent-browser, REAL clicks (the V14 law) | ALL superset pins PASS — see V7 detail; NO Tailwind v4 regression |
| V8 | The F-126 ANALYZE | the fixture chain via the API (bun native fetch) + agent-browser probes on the dev server | every leg CORRECT live — see §1.3 |

**V6 detail — sweep #22 (the twenty-second consecutive hold):** the login card
(backdrop `blur(4px)` · `rgba(255,255,255,0.95)` · 16px radius · h1 30px/700 · inputs
48px/12px · SSO 54px/16px); the F-76 alert byte-exact on `rgba(254,242,242,0.7)` with
red-700 text (re-verified with wrong credentials); the `/` landing + the 220px sidebar +
the 8 links (/POS … /StoreSettings) + doc 1440 = client 1440; the Dashboard date line
("Thursday, October 29, 2026", a leaf `<p>`) + both chart h3s at 16px/700 ("Sales — Last
7 days" / "Products by Category"); the Spanish families ("Historial de Ventas" H1,
"Cajeros" H1 + "Turnos Recientes" H3 at 16px/700 + "0 usuarios registrados"); Reports
STILL empty (2× "No data for this period" — the demo account remains write-restricted,
the with-data tiers stay the functional superset). The reference's OWN mobile defect is
STABLE at the D-1 shape (390×844 on /POS and /Dashboard: no hamburger, the static 220px
sidebar, main crushed to 170px, the document computing exactly 390). Reference capture:
`docs/screenshots/ref-mobile-pos-390-s28.png`.

**V6's NEW measurement (the cycle's finding):** the reference's Cashiers
"Turnos Recientes" ledger, settled (probed twice at 2s/4s+): the SIX-header table
(Cajero/Caja/Inicio/Fin/Ventas/Estado) with **ZERO tbody rows and NO empty-state copy**
— `Sin turnos` appears nowhere in the body. The reference's Sales and Inventory empty
ledgers DO render in-table empty rows ("Sin ventas" colSpan 7 / "No products found"
colSpan 7) — the convention is per-surface, and the Cashiers ledger's empty state is the
bare table. The prior record's "permanently empty ('Sin turnos registrados')" attributed
the CLONE's own empty row to the reference — falsified by this measurement.

**V7 detail — the clone's mobile drawer:** at 390 the chrome switches exactly at md
(aside `display:none`, the labeled hamburger visible, doc 390 = client 390); the REAL
click opens the dialog at 288px with its 8 labeled links; `animation-name: enter`
(tw-animate-css, read mid-flight AND settled on the `[role=dialog]` element — the
animate class sits on the dialog content itself, not its children: the first probe read
the header row div and false-negatived); focus moves to "Close navigation menu" on open
(inside the dialog); the body scroll-lock (`overflow: hidden`); Escape unmounts the
dialog, RESTORES the hamburger's focus ("Open navigation menu"), releases the lock; a
link click navigates (/Dashboard) and unmounts the drawer; zero horizontal overflow at
every step.

## 1. Findings

### F-126-a — the clone's Cashiers empty-ledger row is a parity delta (this cycle's src cure)

**The chain:** `cashiers-view.tsx` renders the Turnos ledger's tbody as
`recentShifts.length === 0 ? (<tr><td colSpan={6}>Sin turnos registrados</td></tr>) :
(recentShifts.map(...))` — an in-table empty-state row authored in the Session-2/3 era
under the belief that it mirrored the reference (the record carried the claim forward
through Session-27).

**The evidence of the gap:** sweep #22's settled measurement — the reference renders the
bare table (six headers, zero tbody rows, no copy) on a state it shows FOREVER (the demo
account is write-gated; its ledger can never gain a row). The clone shows an extra
centered gray row. The readable-superset reservation (AGENTS) covers only the
near-invisible slate-700/800 defect class — an empty-state row is not in it; the
strict-parity default applies.

**The trade-off, recorded:** removing the row deletes the only post-bootstrap DOM
observable on the EMPTY Cashiers ledger (the S16 settled-marker). No current spec waits
on it (surfaces.spec waits on the roster copy — the cashiers fetch; the drift sweep and
the F-125 walk wait on fixture rows); the s16 harness's `Sin turnos` wait arm becomes
dead (it runs on the demo db where the `Cerrado` arm fires) and is updated to the
header-settled form. A future spec needing the empty-ledger settled state must wait on
the roster copy or the table headers + a stable sibling signal — noted in AGENTS.

**The cure:** delete the ternary's empty branch (the map renders alone); the surfaces.spec
Cashiers test gains the bare-table pin FIRST (RED on the standing tree: the tbody carries
the "Sin turnos registrados" row), then the src fix turns it GREEN — TDD, the pin is the
regression test. The s27 walk spec's stale reference comment (line 28) and the s16
harness's wait arm are updated in the same commit.

### F-126-b — the Sales receipt-viewer chain has ZERO with-data protection (this cycle's NEW depth — the session_49 pointer)

**The chain (all verified live in §1.3):** the Sales surface is the reference's Spanish
ledger ("Historial de Ventas") + the clone's documented superset — a per-sale receipt
viewer behind the eye action and refunds. `sales-view.tsx` renders: the ledger row
(ticket font-mono · Fecha `saleDate` es-MX 2-digit/short-year · Cajero `fullName||email` ·
the Método chip (capitalize, cash emerald-500/15 + emerald-400 | card violet) · Total
`formatMoney` · the Estado chip (Completada emerald | Reembolsada orange) · the Eye
action `Ver {ticket}`), and `SaleDetailDialog` (title = the ticket; description =
`saleTimestamp` DD/MM/YYYY HH:MM; the item lines `qty × name` + `formatMoney(price×qty)`;
the dashed Total row; the Método row `capitalize`; Cerrar/Imprimir OUTSIDE
`.receipt-print`). `/api/sales/[id]` PATCH flips the status (the one-way guard: a
refunded sale cannot be un-refunded, 400; same-status re-PATCH idempotent 200); the
visible filter searches ticket || customer || cashier.

**The evidence of the gap:** the existing pins cover the AROUND, not the INSIDE —
terminal.spec pins the checkout-derived ROW visibility (the `T-000001` cell +
"Completada") and the F-115 print wrapper; F-110 pins `saleTimestamp` on the CHECKOUT
receipt only; the s16 harness pins the demo-seeded ledger family. NOTHING pins the
viewer's CONTENT with data (the item-line math `l.price * l.qty`, the description
format, the Método row), the ledger row's derived cells (the es-MX Fecha, the chip
families, the Cajero cell), the search's three arms, or the refund round-trip (the
one-way guard, the chip flip, the viewer opening on a refunded sale). A regression in
any of these would pass the entire 119-test suite green. The reference is write-gated
(its Sales ledger renders "Sin ventas" forever) — this tier is a functional-SUPERSET pin
of the clone's own working surface.

### 1.3 The ANALYZE (measured live on the dev server before this plan)

Every leg measured CORRECT — the values the spec transcribes:

- The fixture chain (login → category "Sales Viewer Walk" → product "Viewer Walk
  Coffee" SVWALK-390 at $4.50/taxRate 0 → register "Viewer Walk Register" float 50 →
  shift): all 200/201; the checkout `items:[{productId, name, price: 4.5, qty: 2,
  taxRate: 0}], paymentMethod: "cash", amountPaid: 9, customer: "Viewer Walk Customer"`
  → `total: 9`, the ticket allocated, the sale pinned to the active shift.
- The LEDGER row (goto /Sales): `["T-000001", "29 oct 2026", "Store Owner", "cash",
  "$9.00", "Completada", ""]` — the Fecha cell `saleDate` es-MX ("29 oct 2026"), the
  Cajero cell from the sale's own cashier include ("Store Owner" — the shifts POST pins
  cashierId to the owner), the Método chip textContent "cash" + `text-transform:
  capitalize` + emerald-500/15 (oklab α 0.15) + rgb(52,211,153), the Total "$9.00", the
  Estado chip "Completada" on the same emerald family, the subtitle "1 ventas
  registradas".
- The VIEWER (the real click on `Ver T-000001`): the dialog title "T-000001", the
  description `saleTimestamp` "29/10/2026 15:31" (DD/MM/YYYY HH:MM), the item line
  "2 × Viewer Walk Coffee" + "$9.00", the dashed Total row "$9.00", the Método row
  "Método"/"cash" (textContent; CSS-capitalized visually), the footer
  Cerrar/Imprimir/Close with the buttons outside `.receipt-print`.
- The SEARCH: no-match → the "Sin ventas" in-table row (the search-empty state —
  `visible.length === 0`); byCustomer "Viewer Walk Customer" → the row. (The byTicket
  and byCashier arms are the same `||` chain — the ANALYZE's dedicated probes were lost
  to a probe quoting error; the capture-s28 script measures them live and the spec pins
  all three.)
- The REFUND round-trip: PATCH `{status:"refunded"}` → 200 `statusAfter "refunded"`;
  the same-status re-PATCH → 200 (idempotent); PATCH `{status:"completed"}` → **400
  "A refunded sale cannot be un-refunded."** (the one-way guard). The re-mounted ledger
  (a fresh goto — the store does not poll): the Estado chip **"Reembolsada"** on
  orange-500/15 (oklab α 0.15); the viewer still opens on the refunded sale with the
  content unchanged.
- **Cleanup verified live:** the shift closed at exact variance (countedCash 59 = float
  50 + the $9 cash sale), then the fixture deleted children-first (sale → shift →
  register → product → category — via PrismaClient; sales/shifts have no DELETE
  endpoints), the dev db verified pristine (zero walk sales, zero walk shifts).

**The ordering analysis (why a SIXTH persisting spec is safe):** the new file
`with-data-sales-receipt-viewer-walk.spec.ts` sorts LAST among the walks
(**c < d < f < i < r < s**) — after every empty-state pin of what it creates:
surfaces.spec (s-u < s-w — its Sales "Sin ventas" and Reports-empty pins), inventory.spec
(i < w), registers-shifts (r-e < w), the drift sweep (v < w), and all five existing
walks (c/d/f/i/r < s). Every existing walk derives its expectations from the APIs at
runtime (verified in prior cycles), so the sales walk's extra sale/shift perturbs none
of them — they run BEFORE it exists; nothing after it in chromium; the mobile project
runs after and needs "No active shift" — the walk CLOSES its shift (the self-clean law).

## 2. The cure

### 2.1 F-126-a — `src/components/pos/views/cashiers-view.tsx` + the navigation pin

1. **The pin first (RED):** the bare-table assertions — the Turnos `tbody`
   carries ZERO rows and the six headers render (Cajero/Caja/Inicio/Fin/
   Ventas/Estado). Fails on the standing tree (the tbody renders the "Sin
   turnos registrados" row).
2. **The pin's home is navigation.spec, BY THE ORDERING LAW'S INVERSE** (the
   full-run catch): the pin must read the ZERO-SHIFT state before any spec
   creates a shift — a CLOSED shift renders a ledger row forever after (no
   shift DELETE endpoints exist), and registers-shifts.spec (r) closes a
   shift before surfaces.spec (s) ever runs. The first placement (surfaces)
   failed the full run exactly there (1 row at runtime); the pin moved to
   navigation.spec (n < r), which reads the still-shift-free db.
3. **The fix (GREEN):** delete the ternary's empty branch — `recentShifts.map(...)`
   renders alone; a provenance comment cites the sweep-#22 measurement.
4. The companions: the s27 walk spec's line-28 comment (the reference's empty ledger
   is the BARE TABLE) + the s16 harness's wait arm (`Cerrado` only — the
   `Sin turnos` arm is gone with the row).

### 2.2 F-126-b — `tests/e2e/with-data-sales-receipt-viewer-walk.spec.ts` (3 tests)

The walk conventions: idempotent provisioning with POSTs asserted (the F-120 law),
runtime-derived expectations (never a hardcoded total), the self-clean law (the shift
CLOSES with exact variance), the mirror laws (the CAJERO cell from the sale's OWN
payload — the S27 identity-cell law; `saleDate`/`saleTimestamp` mirrored in-spec; the
seam's own math, never hardcoded times).

- **Test 1 — the ledger row + the viewer content, exact:** the fixture chain → the
  checkout → goto /Sales → the row filtered by the ticket → all SEVEN cells asserted
  against API-derived expectations (the ticket from the sale response; the Fecha
  mirrored `saleDate`; the Cajero from the sale's cashier include; the Método chip
  textContent + the computed emerald family; the Total; the Estado "Completada") + the
  subtitle count; then the real click on `Ver {ticket}` → the viewer's title,
  description (`saleTimestamp` mirrored), the item line, the Total row, the Método row,
  the footer buttons outside `.receipt-print` (the F-115 posture).
- **Test 2 — the search journeys:** byTicket (the ticket substring), byCustomer, byCashier
  ("Store Owner") — each narrows to the fixture row; no-match → the "Sin ventas"
  in-table row (the search-empty state, distinct from the no-data state).
- **Test 3 — the refund round-trip:** PATCH refunded → the re-mounted ledger's chip
  "Reembolsada" (the orange family, computed) + the same-status re-PATCH 200 + the
  un-refund 400 "A refunded sale cannot be un-refunded." + the viewer opening on the
  refunded sale with the content unchanged. The API legs ride the isolated `request`
  fixture pattern where cookie hygiene matters (the Session-26 law; here the page
  context is authenticated, so the legs may use `page.request` — but the PATCHes are
  POSTed from the spec's request context per the walk family's convention).

### 2.3 Counts

E2E **119 → 123** (desktop **105 → 109**: +3 the walk, +1 the relocated
bare-ledger pin; mobile 13 + setup 1 unmoved) · spec files
**13 → 14** · unit stays **151/15** (no new seam).

## 3. Execution order

1. The F-126-a pin (surfaces.spec) — run it RED on the standing tree.
2. The F-126-a fix (cashiers-view.tsx) + the companions — run the pin GREEN.
3. The F-126-b spec (characterization — the ANALYZE measured every leg green; the
   first run must PASS, the F-122..F-125 pattern).
4. `lint` + `typecheck` (both must clear).
5. `build`, then the three new tests alone (`--grep`), then the full suite ×2
   consecutive (119+3 = 122 expected both runs).
6. The count lockstep in the SAME commit: docs-counts (E2E 122, SPECS 14, the
   "Session-27 lock" → "Session-28 lock" literal, the "108 desktop" breakdown) +
   README (badge/scripts/testing + the walk paragraph) + CLAUDE (baseline + the
   six-walk ordering) + AGENTS (the Session-28 contracts: the bare-table law, the
   viewer/search/refund laws, the six-specs ordering law, the lost-observable note) +
   PAD **v1.26** (the spec map + the revision block) + SKILL **v2.24.0** (the addendum).
7. The s28 evidence script: screenshots 120–122 (the ledger row + the viewer open; the
   Reembolsada flip; the mobile drawer at 390) — self-provisioning, self-cleaning,
   captures verified DISTINCT; it also measures the byTicket/byCashier search arms live.
8. The full gate: lint → tsc → unit → build → smoke → e2e ×2 → the three with-data
   harnesses (s16 13/13 · s17 19/19 · s18 20/20; restore the content-identical older
   captures first).
9. `.env.example` verify · worklog entry · session_51.md narration · commit · the
   SSH-wrapper push (dry-run → fingerprint → push → dual verify → shred).

## 4. Execution record (filled in as the cycle runs)

- **F-126-a executed TDD-first**: the bare-table pin written and run RED on the
  standing tree (the tbody rendered the "Sin turnos registrados" row → 1 ≠ 0),
  then the `cashiers-view.tsx` empty branch removed → the pin GREEN. The pin's
  first home (surfaces.spec) FAILED the first FULL run — registers-shifts'
  closed shift rendered a row at surfaces' runtime (the ordering law's inverse,
  caught by the full suite exactly as designed); the pin relocated to
  navigation.spec (n < r), reading the still-shift-free db. The companions
  landed with it: the s27 walk spec's corrected reference comment + the s16
  harness's wait arm (now "Cerrado" only).
- **F-126-b characterized**: the spec (3 tests) passed its first intent-run
  after ONE authoring iteration — the line-row locator's text filter on an
  unqualified `div` matched the ANCESTOR container (whose last span is the
  method row's), silently mis-targeting the line-money pin AND aborting
  Test 1 before its self-clean close (which Test 3's shift-free canary then
  caught — the self-clean law's canary working as designed). The fix scopes
  text-filtered row locators to the LEAF class (`div.flex.justify-between`);
  the lesson is in AGENTS. All three tests then passed (4.9s), and the
  standalone run + the two consecutive full runs held.
- **The count lockstep executed in the same commit**: docs-counts (E2E 123,
  SPECS 14, the "Session-27 lock" → "Session-28 lock" literal, the
  "109 desktop" breakdown, the F-126 provenance comments) + README
  (badge/scripts/testing + the Session-28 paragraph) + CLAUDE (baseline 123 +
  the six-walk ordering c < d < f < i < r < s) + AGENTS (the Session-28 Sales
  contracts: the bare-table law + the ordering-law-inverse note, the
  identity-cell mirror extension, the textContent lesson, the search-arm
  derivation law, the one-way refund law, the locator-scope lesson, the
  six-specs ordering law) + PAD **v1.26** (scale line + §9 spec map +
  the revision block) + SKILL **v2.24.0** (header baselines + commands +
  the testing tier + the Session-28 addendum + the sandbox-bundle doctrine
  note). UNIT stays 151/15.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **151/151** (15 files) · build green · smoke
  **13/13** · e2e **123/123 × 2 consecutive full runs** (109 desktop + 13
  mobile + 1 setup) · the three with-data harnesses **s16 13/13 · s17 19/19 ·
  s18 20/20** (the money-unit cure holding on the afternoon seed; the older
  harness captures restored content-identical).
- **The post-run db state verified (state, not exit codes)**: the settings at
  seed defaults (storeName "My Store" · hideFiscal true · fiscalRuc "") ·
  ZERO open shifts globally (the self-clean held — the mobile project's "No
  active shift" parity pin safe) · 11 fixture sales, the walk's 1 sale left
  refunded (the scratch db is per-run; the one-way guard means it stays).
- **Evidence: screenshots 120–122** captured from the remediated dev server
  via the committed `scripts/capture-s28-evidence.mjs` — 120 the ledger row +
  the viewer OPEN (the item line "2 × Viewer Walk Coffee" + "$9.00", the
  dashed Total row, the "Método"/"cash" row, the Cerrar/Imprimir footer
  outside .receipt-print), 121 the refund flip (the Reembolsada chip on the
  orange oklab /0.15 family), 122 the mobile drawer at 390 (288px, zero
  overflow — the operator's priority surface). The captures verified DISTINCT
  (4 unique md5s with the ref capture). The script ALSO measured the
  byTicket/byCashier search arms live (the ANALYZE's lost probes — byTicket=1,
  byCashier=1-of-1-expected) and its self-clean verified live (the shift
  closed at exact variance, zero active).
- **`.env.example` verified** key-for-key against the working `.env`
  (COOKIE_SECURE the documented optional escape hatch — the only delta, by
  design).

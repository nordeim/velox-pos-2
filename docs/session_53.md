# Session 53 — the Session-29 cycle narration

> The numbering convention, continued: the Session-29 remediation cycle (the ledger is
> `docs/remediation-plan-session-29.md`) narrates as session_53 — session_51 was the
> Session-28 cycle's own narration, session_52 the operator's raw-log commit of that same
> conversation, so the sequence moves to 53. Companion: the worklog's Session-29 entry
> (the condensed record) and the plan (the full verification ledger V1–V8 + the
> execution record).

The cycle opened with a clone, not a pull — the fourth full sandbox reset, and this
time the audit helpers died with the repo. The rebuild rode the documented ladder (the
`.env` with a fresh 64-hex secret, install, db:push/db:seed, chromium-1243), and the
helpers were rebuilt from their own plan-corpus descriptions: the census (its Session-28
semantics — `@/` alias resolution, the dependency scan scoped to runtime
`dependencies`), the scrypt credential checker, the with-dev-server bundle, and the
Appendix-A ssh shim. The received tree's fast gate ran green on arrival, and the
received delta was exactly the operator's session_52 raw log.

The reference sweep — the twenty-third consecutive — held every standing pin
byte-exact: the login card's blur and white/95 and radius and sizes; the F-76 alert
re-verified with wrong credentials; the landing with its 220px sidebar and eight links;
the Dashboard's date line and both 16px/700 chart h3s; the Spanish families; the
still-empty Reports; the D-1 mobile defect stable on both routes. The sweep also
re-confirmed Session-28's own finding: the reference's empty Turnos ledger is the bare
table — six headers over zero tbody rows with no "Sin turnos" copy anywhere — measured
settled this time at 3.5 seconds. The clone-side drawer verification followed, REAL
clicks throughout: the chrome switch at md, the 288px dialog with its eight labeled
links, the `enter` animation read directly on the dialog element, focus moving to the
close button, the scroll-lock, Escape restoring the hamburger's focus, the route-close
unmount, zero overflow at every step. One probe script had a quoting bug — a missing
IIFE paren in its final read-out — and the corrected re-run closed the chain; the
click-and-navigate legs themselves had run clean.

The depth selection took the session_51 pointer's leading candidate: the receipt PDF —
the LAST standing session_47 candidate, deferred three times, and the only one that
needed production code. The ANALYZE was a design analysis: the terminal receipt's
content contract (the richest rendering — the store-name title, the F-110 stamp, the
lines, the money block with the cash-only Paid/Change row, the fiscal conditional with
its exact template, the footer); the data available at a route (the sale's includes,
the settings row); the wrapper patterns; the download-event precedent (F-122's CSV
export leg — field-tested); and the pin-collision survey (F-115's footer-outside-
wrapper assertion, the s16 harness's dialog-family pins, the Button primitive's asChild
Slot). The "email" question was decided on the codebase's own precedent: no SMTP
exists in the deployment story, so the PDF endpoint IS the receipt's delivery — never
a stubbed send; the decision is now law in AGENTS.

The cure followed the codebase's doctrines rather than adding a dependency: a
HAND-ROLLED PDF 1.4 renderer at a new pure seam — the same doctrine that keeps the
charts dependency-free SVG. WinAnsi latin-1 text (the receipt family's × and · and the
Spanish diacritics are single-byte; outside-latin-1 is a documented mangling, never a
crash), Courier monospace mirroring the on-screen font-mono family, and DETERMINISM as
law — no CreationDate, so the same input always renders identical bytes. The unit
contract was written first and failed first (the missing module), then the renderer
landed: six tests — the magic, the xref byte-math (every offset pointing exactly at
its `N 0 obj`, startxref at the xref itself), the content family, the PDF string
escaping, the cash/fiscal/footer conditionals, determinism. One authoring iteration
was needed in the TEST itself: the xref assertion sliced twelve characters and
compared them against a seven-character expected string — the offsets were right all
along; the fix is a startsWith. The render was then validated three ways: the unit
contract, an independent Python re-parse of the raw bytes, and an authoritative pypdf
extraction — the full receipt text parses in a real PDF reader.

The route is a thin ownership-scoped shell — the sale by `findFirst({ where: { id,
userId } })` with the 404 wall, the settings row supplying the store name and the
fiscal block and the footer, and the formatting composed at the edge (formatMoney and
the byte-stable saleTimestamp) before the seam receives PRE-FORMATTED strings. The UI
affordance is a "Descargar PDF" anchor in the Sales viewer's footer — outside the
receipt-print wrapper with the other footer controls, riding Content-Disposition for
its filename. The live probe ran the whole chain against the dev server: the 200 with
the right headers, the pypdf extraction printed to the log, the 404 wall on a bogus id,
the 401 wall without a cookie, and the self-clean close at exact variance.

The e2e leg is a fourth test in the Session-28 sales walk, placed between the search
and refund tests so it rides the still-completed sale: the API leg (the headers, the
PDF magic, the latin-1 content family, the bogus-id 404) and the UI leg (the
"Descargar PDF" click → the download event → the suggested filename → the downloaded
bytes byte-identical to the API's). It passed on the first run — the F-122 pattern
carried it, exactly as the ANALYZE predicted.

The count lockstep rode in the same commit: UNIT 151 → 157 (the new file makes
sixteen), E2E 123 → 124, ROUTE_FILES 26 → 27, the "Session-28 lock" literal becoming
the Session-29 lock — with every live-tense site moving in one sweep: the README's
badges and scripts and testing section plus the API table's new receipt row and the
architecture table's PDF row; CLAUDE's baseline and seam table; AGENTS' registry line
and the Session-29 PDF contracts; PAD v1.27 with its spec map and revision block; the
SKILL v2.25.0 with its addendum; and vitest.config.ts's header. The lockstep gate
enumerated the six stale docsites and passed after the sweep — a full run of the
suite needed the direct vitest invocation twice, the sandbox's process-kill behavior
hanging two `bun run test` wrappers mid-run (noted in the worklog for future cycles).

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
157/157 (sixteen files) · build · smoke 13/13 · e2e 124/124 — twice, consecutively —
with the post-run db verified as state: the settings at seed defaults, zero open
shifts globally, eleven fixture sales with the walk's one left refunded. The three
with-data harnesses re-ran green (13/13, 19/19, 20/20). The evidence tier got its
record: screenshots 123–125 — the viewer with the new affordance, the receipt PDF
rendered in the browser (its download verified byte-identical first), and the mobile
drawer at 390 — with the pypdf extraction in the script's live log, and s16's
receipt-viewer capture re-committed intentionally for the new footer button. The
`.env.example` verified key-for-key against the working `.env`. The next cycle's
candidates: the terminal receipt dialog's own PDF affordance (the same anchor pattern
on the post-checkout surface — deliberately untouched this cycle), a Settings-driven
PDF-theme pass (the branding colors reaching the renderer), or whatever the next
operator log names.

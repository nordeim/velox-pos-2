# Session 33 — the Session-19 cycle narration

> The numbering convention, continued: the Session-19 remediation cycle (the ledger is
> `docs/remediation-plan-session-19.md`) narrates as session_33 — session_31 was the
> Session-18 cycle's own narration, session_32 the operator's raw-log commit of that same
> conversation, so the sequence moves to 33. Companion: the worklog's Session-19 entry
> (the condensed record) and the plan (the full verification ledger V1–V19).

This cycle opened differently than any before it: with a clone, not a pull. The sandbox
workspace had been reset, so the tree arrived fresh from `https://github.com/nordeim/velox-pos-2.git`
at `a94c105` — the Session-18 push plus the operator's session_32 raw-log commit. A fresh
clone is its own environment audit: no `.env` (created from `.env.example` with a generated
64-hex secret), no `db/` contents (`db:push` + `db:seed` — the owner verified against the
documented credential), and only chromium-1200 in the Playwright cache where 1.63 wants
1243 — the s17 browser-build lesson, pre-applied before the e2e leg could trip on it. With
that, the received-tree gate ran fully green on arrival: lint 0 (1 documented warning),
tsc, unit 149/149 (14 files), build, smoke 13/13, e2e 104/104.

The static sweeps came back clean too. The zero-importer census found no dead files (the
one convention entry `src/instrumentation.ts`, live by Next's auto-registration); the
secrets scan found only test fixtures; the documented credential verified against the dev
db — though the checker itself needed a lesson: `Bun.password.verify` rejects the app's
own `scrypt$salt$hash` shape with `PASSWORD_UNSUPPORTED_ALGORITHM`, so the checker mirrors
`src/lib/auth.ts`'s `scryptSync` + `timingSafeEqual` instead. The Session-18 code review
confirmed the prior commits had touched nothing but evidence scripts and docs. And one
suspicion died before it became a false fix: the Read tool displayed `const ethod,
setMethod]` in terminal-view.tsx — the SD-4 display artifact again, the terminal eating
the two-byte `[m` from `const [method`. tsc, the build, and 104 e2e tests all passing is
the counter-proof; withdrawn, the second time that lesson has saved a finding.

The drift sweep came next — the THIRTEENTH consecutive cycle with every standing pin
byte-exact. The login card with its blur(4px) and its white/95; the F-76 alert with its
exact copy and its red-50/0.7 wash; the 220px sidebar with its eight links and the
violet-600/0.2 pill on Terminal; the `/` landing; the Dashboard's en-US date line and its
two 16px/700 chart headings; the Spanish families on Sales and Cashiers with "Turnos
Recientes" still an H3. The reference's own mobile defect too: still no hamburger at
390×844, still the static 220px z-50 sidebar. And because the operator named it the
priority, the clone's mobile drawer was re-verified LIVE on the dev server at 390×844 —
the labeled hamburger, the dialog semantics with its eight labeled links, focus moving to
the close button on open, Escape restoring the hamburger's focus and releasing the scroll
lock, drawer navigation unmounting it, zero horizontal overflow. No Tailwind v4
regression anywhere in the chain: the plain-CSS glass-* doctrine, `@theme inline`, and
the `@custom-variant hover` unwrap all hold, and the 13 mobile e2e pins stay green.

Then the NEW depth, on the session_31 pointer: the receipt print-path — the last
unmeasured leg of the checkout→receipt chain, and a surface the reference's write-gated
demo account can never exercise (which makes it the clone's OWN superset, twice over).
The harness is `page.emulateMedia({ media: "print" })` plus computed-style walks: no
print-preview dependency, the same ground-truth posture as every pin in the suite. The
terminal receipt was probed through a full UI checkout — a real product, a real charge
with the amount-received gate, a real T-000001 — and the text-node census found the first
defect: **F-114**, the receipt prints only "My Store". The `@media print` block set
`color: #000` on the `.receipt-print` container, but the receipt's explicit white
utilities beat the inherited color — the ticket line at oklab-white/0.6, the items at
/0.8, and the Total row at pure rgb(255,255,255) on the white canvas. The Sales viewer
was probed next and the census found the second: **F-115**, its Imprimir prints a
BLANK page — no `.receipt-print` wrapper in the dialog at all, so `body * { visibility:
hidden }` hid everything (the dialog itself computed hidden; exactly one element painted).

The remediation plan settled the GREEN design before any code moved, and the cure ran
TDD: the pins landed first — the F-114 pins inside the existing cash-checkout test (the
moment the receipt dialog is open; no count change, no data-order risk), the F-115 pin
as the one NEW test. Against the pre-fix build the checkout test failed with `Received:
"rgb(255, 255, 255)"` — the defect, byte-exact, in the assertion message. Then the two
surgical cures: the print rule's descendant selector gained `color: #000` (unlayered
plain CSS beating `@layer utilities` — the glass-* cascade law, no `!important`), and
the Sales viewer's receipt content got the wrapper with the footer buttons outside it.
Rebuild, and the terminal spec passed 12/12 with both print pins green.

The count moved by exactly one — e2e 104 → 105 (90 → 91 desktop) — and the lockstep
followed it in the same commit: the docs-counts constant and its "Session-16 lock"
literal (now the Session-19 lock, this being the cycle that re-anchored the count), the
README badge and its two prose sites, CLAUDE's baseline, PAD v1.17 with its revision
block, the SKILL v2.15.0 with the Session-19 addendum, AGENTS with the print-path
contracts. The unit gate stayed green through every doc edit — the lockstep gate
re-verified after each pass. The full gate on the final tree: lint 0 · tsc · unit
149/149 · build · smoke 13/13 · **e2e 105/105**.

The evidence tier got its record: `scripts/capture-s19-evidence.mjs`, self-provisioning
in the s16 family posture, captured screenshots 93–95 from the remediated dev server —
93 the terminal receipt under print emulation (the Total row verified black during
capture), 94 the Sales viewer printing (the wrapper verified painting), 95 the mobile
drawer, the operator's priority surface. The standing protection for the whole
print-path class lives in the e2e suite itself — unlike the with-data harnesses, the
print path is e2e-visible by construction, so every future `bun run test:e2e` re-proves
it. The print-path law is now recorded in three docs (AGENTS, CLAUDE, the SKILL): the
print canvas is white — every receipt line must compute black under print emulation,
and every printable surface wraps its content in `.receipt-print`. The next cycle's
candidates: the receipt's emailed-PDF shape (if the reference ever exposes one), or the
drift-sweep gates the neo-crm sibling runs at four widths — a standing visual-regression
tier this codebase does not yet have.

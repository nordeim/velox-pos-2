# Session 27 — the Session-16 cycle narration

> The numbering convention, continued: the Session-16 remediation cycle (the ledger is
> `docs/remediation-plan-session-16.md`) narrates as session_27 — session_25 was the
> Session-15 cycle's own narration, session_26 the operator's raw-log commit of that same
> conversation, so the sequence moves to 27. Companion: the worklog's Session-16 entry
> (the condensed record) and the plan (the full verification ledger V1–V23).

The workspace had been reset — the cycle opened with a fresh `git clone` instead of a
pull, and the fresh sandbox turned out to be missing the Playwright browsers (the
first e2e run failed at setup with the "Executable doesn't exist" banner;
`bunx playwright install chromium`, environment-only, recorded in the plan so the next
fresh-clone cycle runs it before the gate). From there the received-tree gate came up
green on the first try at `3a0594c`: lint 0 · tsc · unit 146/146 · build · smoke 13/13
· e2e 104/104. The Session-15 lock held.

The drift sweep came first, as always. Every standing pin measured byte-exact for the
TENTH consecutive cycle — the login card's blur(4px) and its 4px slate strip, the F-76
error panel, the 220px sidebar and its 42px violet pill, the terminal's shift gate, the
Spanish families on Sales and Cashiers, the Dashboard's date line. The reference's own
mobile defect too: still no hamburger at 390×844, still the static 220px sidebar. Ten
cycles, zero drift.

Then the NEW depth, and it came in two halves. The reference side first: the
Registers/Sales internals measured at a precision no cycle had taken before. The New
Register dialog decoded at byte parity — the panel's `max-w-lg` = 512px (a first read
of 462 turned out to be the content-box artifact: 512 minus the 24px paddings and the
1px borders; the panel width is the contract), #0f121a, 8px radius, p-6, no blur, the
18px/600 #e7e9ef title, h-9 inputs, 42px Cancel/Create — and the reference literally
ships the clone's vendored class strings: `glass-button`, `glass-button-primary`,
`left-[50%] top-[50%] z-50 grid w-full max-w-lg`. The Sales search input and its
"Buscar por ticket, cliente o cajero..." placeholder, byte-exact. The "Sin ventas"
empty cell taught the cycle its measurement lesson: a wrapper-div probe first read the
copy's color as #e7e9ef — the inherited foreground — until a TreeWalker to the TEXT
NODE's parentElement showed the leaf TD's own `text-slate-400`, byte-identical to the
clone's. Probe the leaf, never the first ancestor matching the copy.

The second half was the one the last cycle's "Next" pointer had actually named: the
WITH-DATA states, on the demo seed, against the standalone build. The Registers cards
with a real register, the Open-shift dialog (a superset surface — and it follows the
measured dialog family to the byte: 384px, #0f121a, 8px, p-6, h-9), the Sales ledger
with thirty-three rows and the ticket search and the receipt viewer, the Cashiers
shift ledger with its "$410.64 (33) · Cerrado" row, the POS gate, the Dashboard stats.
All of it green — no with-data defects, and the Session-15 chart cure re-proven under
load. But the receipt viewer's header rendered "10/26/2026, 2:41:33 PM" — English,
AM/PM, seconds — in the middle of a Spanish-mixed surface whose own ledger cell says
"26 oct 2026". The sweep found the class: TWO sites shipping bare
`toLocaleString()`, both receipt headers, both client-locale-dependent. An ar-SA
device would render the receipt's timestamp in Arabic digits on a hijri calendar. A
printed receipt must render identically on every device.

The cure followed the house pattern exactly. `saleTimestamp(at: string | Date)` — a
pure seam in `src/lib/reports.ts`, the byte-stable es-convention `DD/MM/YYYY HH:MM`
via manual padStart (the `shiftTime` precedent, the deterministic formatting the shift
ledger already used), zero Intl dependence. Three unit pins: the format bytes, the
zero-padding, and the runtime's real input class — the ISO string from the JSON wire,
pinned with the no-Z form that parses local time in every timezone, so the test is
tz-safe anywhere it runs. Both receipt sites adopted it. And the e2e pin rode the
EXISTING checkout test — an added regex assertion on "T-000001 · DD/MM/YYYY HH:MM",
not a new test, so the e2e count never moved. The RED proofs were clean at both tiers:
3/3 unit failures against the absent seam (with the test held aside for the e2e RED
build, the s14/s15 lesson), then exactly one targeted e2e failure on the format
assertion, zero collateral either way.

The structural deliverable is the one future cycles will feel: F-111, the with-data
evidence harness. The empty-store e2e can never see these states — that's been
doctrine since Session-15's V24 — so this cycle's measurements became
`scripts/capture-s16-evidence.mjs`: thirteen live pins on the demo-seeded db, from the
Registers card census to the receipt stamp to the Cashiers ledger, plus the standing
F-76 and drawer spot-checks. The harness earned its own lessons mid-run, both the
infrastructure-flavored kind the evidence tier keeps teaching: `waitFor(visible)` is
not animation-settled (the Radix zoom-in read the 384px dialog as 365 — exactly 0.95×
— until a 700ms settle landed the true width), and a fixed sleep loses bootstrap
races on cold routes (the Cashiers ledger probed as empty until the wait became a
settled-state `waitForFunction`). Both fixed without weakening a single check; both
recorded in AGENTS.md.

The full gate on the final tree: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files — the three new pins, the count-lockstep gate firing on cue and
every live-tense site re-anchored: README, CLAUDE, PAD, the SKILL, and the lock
literal itself, now "Session-16 lock") · build · smoke **13/13** · e2e **104/104**.
The evidence run proved **13/13** live — the receipt stamp reading "26/10/2026 14:41"
on the demo db's newest ticket, the peak still under the 100-gridline, the drawer
still whole. The VLM cross-check matched **5/5** on the captures. Screenshots 81–86.
The docs moved in lockstep: AGENTS gained the Session-16 contracts (the saleTimestamp
law, the evidence tier, the two race lessons, the leaf-measurement lesson), CLAUDE
gained the receipt-timestamp entry, PAD shipped v1.14 with the revision block, the
SKILL shipped v2.12.0 with the seam row and the addendum, and the plan's ledger
closes the record.

# Session 37 — the Session-21 cycle narration

> The numbering convention, continued: the Session-21 remediation cycle (the ledger is
> `docs/remediation-plan-session-21.md`) narrates as session_37 — session_35 was the
> Session-20 cycle's own narration, session_36 the operator's raw-log commit of that same
> conversation, so the sequence moves to 37. Companion: the worklog's Session-21 entry
> (the condensed record) and the plan (the full verification ledger V1–V19 + the
> execution record).

This cycle opened with a pull, not a clone: the sandbox workspace had persisted from
Session-20, so the refresh was `git pull` bringing exactly one file — `docs/session_36.md`,
the operator's raw log — onto the Session-20 tree at `927bc98`. The environment acts were
re-verification plus one repair: the `.env` had reverted to the template's unevaluated
`AUTH_SECRET="$(openssl rand -hex 32)"` literal (the sandbox's reset), so a fresh 64-hex
secret was generated before anything else ran; `db/` at the repo root with all four
scratch databases, chromium-1243 cached, everything else in place. The received-tree gate
ran fully green on arrival — lint 0 (the one documented warning), tsc, unit 149/149,
build (the background invocation died silently again; the foreground rerun is the
posture), smoke 13/13, e2e 107/107 — and the static sweeps came back clean: zero dead
files, secrets confined to test fixtures, the documented credential verifying against the
dev db (the checker runs under bun — it imports `bun:sqlite`), and the Session-20 code
review confirming the prior commits had touched exactly the drift-sweep spec, the
docs-counts re-anchor, the evidence script, and the docs.

The drift sweep ran next — the FIFTEENTH consecutive cycle — and for the first time in
fourteen cycles it found something: every standing pin held byte-exact (the login card's
blur(4px) and white/95 and 16px radius and 30px/700 h1 and 48px inputs; the F-76 alert's
exact copy and red-50/0.7 wash; the 220px sidebar with its eight links and the `/`
landing; the Dashboard date line and its two 16px/700 chart headings; the Spanish
families on Sales and Cashiers with "Turnos Recientes" still an H3), but the reference's
OWN mobile defect had changed shape. Fourteen sweeps had measured no hamburger, the
static 220px sidebar, and the 390px document scrolling out to 1280px. This sweep measured
no hamburger and the same static sidebar — but the document now computes exactly 390px on
every route, with main squeezed to 170px beside the rail, carrying its own internal
scroll. The reference restructured its phone layout from "document overflows" to "content
crushed beside the sidebar." The defect class persists (an unusable 170px main is still
an unusable phone layout); the observable changed; the clone's drawer superset remains
strictly better, and the live-tense doc sites that stated the old observable as current
fact were refreshed (D-1) while the history blocks kept their historical statements.

Then the clone-side verification, the operator's standing priority: the mobile drawer
probed live on the dev server at 390×844 — the labeled hamburger, the dialog semantics
with its eight labeled links at 288px, focus moving to the close button on open, Escape
restoring the hamburger's focus and releasing the scroll lock, drawer navigation
unmounting it, zero horizontal overflow. No Tailwind v4 regression anywhere in the chain:
the plain-CSS glass-* doctrine, `@theme inline`, and the `@custom-variant hover` unwrap
all hold, and the 13 mobile e2e pins stay green.

Then the NEW depth, on the session_35 pointer: the with-data mobile walk of the remaining
ledger surfaces, Sales and Cashiers at 390 — the two tables the s20 guard covered only by
the frame contract. The ANALYZE came first: data provisioned through the API, both
surfaces measured CORRECT with data (contained, functionally scrollable, floors intact at
720 and 640), and the mutation proof re-run live on both new surfaces (the injected
`overflow-x: visible` regression no-ops the scrollLeft assignment on each — the pin
design is evidence-backed on all three ledgers now). The finding looked like F-116's
posture: a protection gap, not a live defect. The cure restructured the s20 guard's
second test into the three-ledger walk — one provisioning chain (category → product →
register → shift → sale; the shift's cashierId is the owner, so it renders the Cashiers
row) visiting all three ledger routes with per-route frame, functional-scroll, and floor
assertions.

And then the cycle earned its keep, twice. The first full-suite run failed the mobile
project's terminal-gate test: the walk had left its shift ACTIVE, and the POS gate —
which needs no active shift — never rendered. The self-clean law terminal.spec has always
followed (close your shift) is now written into the drift-sweep walk and the AGENTS
contracts. The second failure was the real prize: the walk's own Cashiers leg, flaky
twice in four runs, rendering "Sin turnos registrados" with three closed shifts in the
db. The forensics went deep — the failure trace's network log showed the API returning
the correct three-shift list with 200s on every leg, which isolated the defect to the
client: the store's `shifts` collection had TWO writers. `loadAll` fetched the full
ledger list; `loadCore` fetched the active-only list and wrote it into the SAME key; the
bootstrap hook ran both in one `Promise.all`, so the last writer won — and when the
filtered fetch resolved last, the ledgers lost their closed-shift history. Twenty
sessions of empty-store e2e never saw it, because an empty store has no closed shifts to
lose — the s15 V24 doctrine, proven twice now.

The cure went test-first: `tests/unit/store.test.ts` — the store seam's first unit file
— with a path-dispatched transport mock pinning the deterministic interleaving (the
active-only fetch resolving LAST). RED on the pre-fix store, both its. Then the surgical
fix: `loadCore` refreshes settings only — no consumer ever read the active-only value;
the terminal gate finds its active shift by filtering the collection itself. GREEN. The
count moved 149 → 151 (14 → 15 files, the store seam joining the registry), the e2e
stayed 107 (the walk restructures the existing test), and the lockstep followed in the
same commit: the constants and the "Session-20 lock" → "Session-21 lock" literal, the
vitest config header, README's badge and scripts and testing, CLAUDE's baseline plus the
two new law entries, AGENTS' Session-21 store-writer contracts, PAD v1.19 with its
revision block, the SKILL v2.17.0 with the Session-21 addendum.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
151/151 (15 files) · build · smoke 13/13 · e2e 107/107 — twice, consecutively, the race
cure verified against the exact failure mode that had flaked 2-in-4. The three with-data
evidence harnesses all green (s16 13/13, s17 19/19, s18 20/20). The evidence tier got
its record: `scripts/capture-s21-evidence.mjs`, self-provisioning in the family posture,
captured screenshots 99–101 from the remediated dev server — 99 the with-data Sales
ledger contained at 390, 100 the with-data Cashiers ledger with the closed shift
rendering "Cerrado" (the F-118 surface, the race's exact failure mode now cured and
proven live), 101 the mobile drawer at 390 — plus the D-1 reference capture of the
reference's new crushed-main phone layout. The next cycle's candidates: the receipt's
PDF/email shape (still unmeasurable on the write-gated reference), a with-data walk of
the remaining Reports periods, or a deeper probe of the reference's new phone layout
(now that it stopped overflowing, its 170px main might itself be drift-measurable
against fresh reference deploys).

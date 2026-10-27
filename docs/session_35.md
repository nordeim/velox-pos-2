# Session 35 — the Session-20 cycle narration

> The numbering convention, continued: the Session-20 remediation cycle (the ledger is
> `docs/remediation-plan-session-20.md`) narrates as session_35 — session_33 was the
> Session-19 cycle's own narration, session_34 the operator's raw-log commit of that same
> conversation, so the sequence moves to 35. Companion: the worklog's Session-20 entry
> (the condensed record) and the plan (the full verification ledger V1–V20).

This cycle opened with a pull, not a clone: the sandbox workspace had persisted from
Session-19, so the refresh was `git pull` bringing exactly one file — `docs/session_34.md`,
the operator's raw log of the previous conversation — onto the Session-19 tree at
`6f32b4f`. The environment acts were re-verifications rather than provisions: `.env`
still carrying `DATABASE_URL="file:../db/custom.db"` and its generated secret, `db/` at
the repo root with all three scratch databases, chromium-1243 already in the Playwright
cache. The received-tree gate ran fully green on arrival — lint 0 (the one documented
warning), tsc, unit 149/149, build, smoke 13/13, e2e 105/105 — and the static sweeps
came back clean: zero dead files, secrets confined to test fixtures, the documented
credential verifying against the dev db, and the Session-19 code review confirming the
prior commits had touched exactly the two surgical cures, the print pins, and the docs.

The drift sweep ran next — the FOURTEENTH consecutive cycle with every standing pin
byte-exact. The login card with its blur(4px) and its white/95; the F-76 alert with its
exact copy and its red-50/0.7 wash; the 220px sidebar with its eight links and the `/`
landing; the Dashboard's en-US date line and its two 16px/700 chart headings; the Spanish
families on Sales and Cashiers with "Turnos Recientes" still an H3. The reference's own
mobile defect too: still no hamburger at 390×844, still the static 220px sidebar, still
the 390px document scrolling out to 1280px. And because the operator named it the
priority again, the clone's mobile drawer was re-verified LIVE on the dev server — the
labeled hamburger, the dialog semantics with its eight labeled links, focus moving to
the close button on open, Escape restoring the hamburger's focus and releasing the scroll
lock, drawer navigation unmounting it, zero horizontal overflow. No Tailwind v4
regression anywhere in the chain: the plain-CSS glass-* doctrine, `@theme inline`, and
the `@custom-variant hover` unwrap all hold, and the 13 mobile e2e pins stay green.

Then the NEW depth, on the session_33 pointer: the neo-crm-style drift-sweep tier at
four viewport widths. The ANALYZE came first — a route-battery probe at 390/768/1024/1440
across all eight routes, first on the empty dev store, then on a demo-seeded standalone.
The result was zero overflow findings on both: every route computes its document and main
scroll widths exactly at the viewport, the wide ledger tables (Inventory 773px, Sales
723px, Cashiers 640px at 390) stay inside their `.vpx-scroll` scroll containers, and the
chrome switches exactly at md. The frame is correct — which made the finding itself
clearer: F-116 is a protection gap, not a live defect. The suite pinned 390
(/POS-centered) and 1440; the intermediate widths 768/1024 had no coverage at all; the
overflow contract existed for one route at one width; and the with-data containment
class — the neo-crm M-109c1 genus, a seeded row's min-content overflowing the phone
frame — had no guard anywhere. The reference itself ships that class on its own phone
layout.

The pin design earned its shape the hard way, in the mutation probes. Breaking the inner
scroll container (`overflow-x: visible` on `.vpx-scroll`) did NOT overflow the frame —
the outer `glass-card overflow-hidden` clipped the spill, so a frame-level pin alone is
blind to the inner break. The scrollWidth census is blind too: Chromium reports
`scrollWidth > clientWidth` even for visible overflow, so the numbers cannot distinguish
a scroll container from a spilling one. The `scrollLeft = 50` read-back can — under the
mutation the assignment no-ops, measured live. That became the containment pin's
observable: functional, not structural. And the spec's first run added its own lesson —
the ledger-container lookup `.find(c => c.querySelector("table"))` picked `main`, which
itself carries `.vpx-scroll` (the app-shell's overflow-y-auto) and contains every table;
the pin failed falsely until the lookup became `table.closest(".vpx-scroll")`. A probe
bug, not an app bug — fixed in the same cycle, recorded in AGENTS and the SKILL.

So the cure is one new spec, `tests/e2e/viewport-drift-sweep.spec.ts`, two tests, no
production code: the route battery (every route at every audit width keeps doc and main
within the viewport, plus the chrome-switch contract — the hamburger owns the sub-md
chrome, the sidebar the md+ chrome, pinned by visibility, never count) and the with-data
guard (a self-provisioned product; Inventory at 390 keeps main contained, the ledger
container is a functional scroll region, and the table keeps its 760px floor — the
container contains, the table never shrinks). The characterization posture is the honest
one for a protection gap: the pins pass on the standing build, and the red is the
mutation record — the injected regression provably no-ops the pin's observable.

The count moved by exactly two — e2e 105 → 107 (91 → 93 desktop), specs 7 → 8 — and the
lockstep followed it in the same commit: the docs-counts constants and the
"Session-19 lock" literal (now the Session-20 lock), the README badge and its two prose
sites, CLAUDE's baseline and the new drift-sweep law line, PAD v1.18 with its revision
block, the SKILL v2.16.0 with the Session-20 addendum, AGENTS with the four-width
contracts. The lockstep gate earned its keep mid-pass: the PAD's scoped negative
`not.toContain("8 spec files")` was a retired-form ban from the 7-spec era, and with the
tree legitimately back at eight specs the ban moved to "7 spec files" — the gate
catching its own doc history, exactly as designed. The unit gate stayed green through
every doc edit. The full gate on the final tree: lint 0 · tsc · unit 149/149 · build ·
smoke 13/13 · **e2e 107/107**.

The evidence tier got its record: `scripts/capture-s20-evidence.mjs`, self-provisioning
in the s19 family posture, captured screenshots 96–98 from the remediated dev server —
96 the with-data Inventory contained at 390 (main=390/390 and the functional scroll
verified live during capture), 97 the POS md chrome switch at 768 (the sidebar visible,
the 380px cart rail, the hamburger gone), 98 the mobile drawer at 390 (288px, eight
links, zero overflow — the operator's priority surface). The standing protection for
the whole drift-sweep class lives in the e2e suite itself: every future
`bun run test:e2e` walks all eight routes at all four widths and probes the ledger's
functional scroll. The next cycle's candidates: the receipt's PDF/email shape (still
unmeasurable on the write-gated reference), or a deeper with-data mobile walk of the
remaining ledger surfaces (Sales and Cashiers at 390, the two tables the s20 guard
covers only by the frame contract).

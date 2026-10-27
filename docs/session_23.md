# Session 23 — the Session-14 cycle narration

> The numbering convention, continued: the Session-14 remediation cycle (the ledger is
> `docs/remediation-plan-session-14.md`) narrates as session_23 — session_21 was the
> Session-13 cycle's own narration, session_22 the operator's raw-log commit of that same
> conversation, so the sequence moves to 23. Companion: the worklog's Session-14 entry
> (the condensed record) and the plan (the full verification ledger V1–V24).

The pull brought in one file: `docs/session_22.md`, the raw conversation log of the
Session-13 cycle — 104 lines ending with a "Next" pointer that named this cycle's
targets before this cycle knew it would take them: *"the Dashboard/Reports chart
internals with populated data, and a fresh-clone pristine-path verification."* The
received-tree gate came up green on the first run at `fdd2704`: lint 0 · tsc · unit
133/133 · build · smoke 13/13 · e2e 97/97. The Session-13 lock held.

The drift sweep came first, as always. Every standing pin measured byte-exact for the
EIGHTH consecutive cycle — the login card's blur(4px) and its 4px slate strip, the F-76
error panel, the 220px sidebar and its 42px violet pill, the terminal's shift gate, the
Spanish families on Sales and Cashiers, the Dashboard's date line. The reference's own
mobile defect too: still no hamburger at 390×844, still the static 220px sidebar over
the content. Eight cycles, zero drift. The reference is stable; the pin doctrine is
doing its job.

Then the NEW depth. The Dashboard rendered its two chart headings — "Sales — Last 7
days" and "Products by Category" — and the sweep moved inside the SVG. What it found
was a surprise thirteen cycles in the making: the clone's charts had never been
color-measured at all. Session-6's F-50 pin had decoded the tick discipline — nice
ticks, ~5 steps, 12px fonts, weekday labels — and Session-101 had implemented "dotted
grid + violet stroke" around that skeleton. An assumption, never a measurement. The
reference's actual chart: an **indigo-500 line** — not violet — at 2.5px, drawn as a
SMOOTH monotone curve (the D string's C-segments with controls at 1/3 and 2/3 of each
span, the recharts signature), over a **slate-200 grid dashed 3-3** (not dotted
white/16%), with **two full-length slate-400 axis lines** and tick stubs below the
baseline (the clone had no axes at all), 12px slate-400 tick text, a **gradient area
filling under the line** (indigo 0.3 at 5% fading to 0 at 95%, the whole path at
fill-opacity 0.6), and **zero data dots** — where the clone drew seven violet circles.
Seven findings on one chart. The Reports chart turned out to be a SECOND, distinct
contract — the reference's own pattern repeating (two alert families, two stat
families, two chart families): indigo again but at 2px, a white-at-4% dashed grid with
NO slate axes, 11px white/30 ticks, the gradient at 0.35 rather than 0.3. Twelve
findings total, F-95 through F-106, every one measured at both the computed-style and
DOM-attribute layer before a line of code moved.

The geometry told the subtlest story. The reference's chart svg measured 625 wide in
one pass and 731 in another — not drift, but a container-responsive recharts chart
whose viewBox tracks its container while its paddings, fonts, and height stay fixed
pixels. The fixed values are the contract: edge x=65, top y=5, baseline y=245, height
280, fonts 12px. And the clone's own chart box computes to ~731px at the same viewport
— so a 731-wide viewBox renders one-to-one at the e2e state. The clone kept its
zero-dependency fixed-viewBox SVG (the doctrine that survived every audit) and adopted
the reference's measured internals wholesale: the plot boxes, the families, the
gradient defs, the smooth curve through a new pure seam — `smoothPath`, a
Fritsch-Carlson monotone-X Hermite living in `src/lib/chart-path.ts`, unit-pinned so
flat data reproduces the reference's measured D shape exactly and monotone data never
overshoots its range.

The static audit had its own find. The zero-importer census — the same sweep that
found Session-13's four dead lib files — turned on the ui/ layer for the first time
and found twelve scaffolding-era primitives with zero importers: avatar, badge, card,
checkbox, dropdown-menu, popover, progress, separator, skeleton, slider, tabs,
tooltip. Nine Radix packages existed in the manifest solely to serve them. No doc
claimed the dead twelve (the 88 "card" mentions in the docs are all "the login card" —
domain language). They left the tree the same way the Session-13 debt did: deleted,
`bun remove`d through the package manager, census-proven — the ui layer is now exactly
the ten files that render.

Then the evidence run found something nobody was looking for. The script signed in
through the real UI — and the login 401'd. Not a code bug: a hash check against
`db/custom.db` proved the owner's password was "Abcd1234!", not the documented
`$Abcd1234`. The Session-13 evidence script's "full one-shot reset round-trip" had
typed its own form-fill constant into the reset form and silently changed the
credential — and the s13 plan's "no state change" claim went with it. A documentation-
truth defect hiding in a git-ignored scratch db for a whole cycle. The restore script
control-verifies the drifted hash first, then rewrites through the repo's own scrypt
scheme and end-to-end verifies the documented login. The lesson went into AGENTS.md:
any script that exercises a password-changing flow ends by proving the documented
login works.

The fresh-clone verification — the other "Next" pointer, and the web-application
skill's own periodic gate — closed the cycle's audit. A pristine clone of HEAD:
install (485 packages from the lockfile), `cp .env.example .env`, db:push, db:seed
(the owner materializes, `db/custom.db` lands at the clone's own root — the relative
URL contract proven on a virgin tree), typecheck, build, standalone boot, health
`{"status":"ok","db":"up"}`, /login 200. The no-AUTH_SECRET boot refusal fires first,
exactly as §5 documents it. The README's quick-start is true, verbatim, on a tree no
one has touched.

The RED proofs were clean at both tiers — with one infrastructure lesson worth keeping:
`next build` type-checks `tests/` too, so a unit-tier RED pin (importing the seam that
doesn't exist yet) blocks the very build the e2e RED needs. The order for a two-tier
RED: prove the unit RED, hold the test aside, prove the e2e RED against the pre-fix
build, restore for GREEN. The e2e RED gave exactly five targeted failures — three of
them serial-skipped siblings, each proven failing individually — with the only passes
being the setup sign-ins. GREEN landed in vertical slices: the seam, then the two
charts, then the purge. Two serialization postures surfaced mid-green, both absorbed
without weakening a single assertion: Chromium computes gradient fills QUOTED
(`url("#id")` — the reference's own computed fill measures identically), and the F-50
pin's y-label filter — which had encoded the clone's own old padding of 34 — was
corrected to the measured plot edge of 65, valid across both the old and new
geometries.

The full gate on the final tree: lint 0 (1 documented warning) · tsc · unit **138/138**
(14 files) · build · smoke **13/13** · e2e **102/102** — the five new chart pins riding
the 97 baseline, nothing weakened. The evidence script proved **14/14** live: both
charts' contracts computed end-to-end on the production standalone, the primitive
census, the F-76 spot-check under its documented oklab-alpha posture, the mobile
drawer. And the VLM cross-check — the clone's chart screenshot against the reference's
own — matched on all four contract axes: the indigo family, the dashed grid, the axes,
the absence of dots. The one visible difference is the container-responsive width at
different capture viewports, which is precisely the part the pins don't claim.

The docs moved in lockstep, as the gate demands: the constants re-anchored (138/14/102,
"Session-14 lock", "88 desktop") across the README badges and tables, CLAUDE's
baselines, AGENTS' registry line, the PAD's scale line, vitest.config's header, the
SKILL's header and tiers — history blocks keeping their numbers by design, except the
one claim now known false: the Session-14 addendum corrects the s13 "credentials
unchanged" line on the record. PAD v1.12 carries the revision block and now names the
exact ten-file ui layer in its component tree (curing, along the way, a stale `date`
seam entry that had survived the Session-13 purge). The SKILL ships v2.10.0 with the
charts row that future agents will need most: *do not restyle the charts from memory —
two measured contracts, pinned.*

# Session 25 — the Session-15 cycle narration

> The numbering convention, continued: the Session-15 remediation cycle (the ledger is
> `docs/remediation-plan-session-15.md`) narrates as session_25 — session_23 was the
> Session-14 cycle's own narration, session_24 the operator's raw-log commit of that same
> conversation, so the sequence moves to 25. Companion: the worklog's Session-15 entry
> (the condensed record) and the plan (the full verification ledger V1–V25).

The pull brought in one file: `docs/session_24.md`, the raw conversation log of
the Session-14 cycle — 149 lines ending with the "Next" pointer that named
this cycle's targets before this cycle knew how it would find them: *"the
natural NEW-depth targets are a re-sweep of the populated-data dashboard with
the demo seed and the Settings dialog internals."* The received-tree gate
came up green on the first run at `197443c`: lint 0 · tsc · unit 138/138 ·
build · smoke 13/13 · e2e 102/102. The Session-14 lock held.

The drift sweep came first, as always. Every standing pin measured byte-exact
for the NINTH consecutive cycle — the login card's blur(4px) and its 4px
slate strip, the F-76 error panel, the 220px sidebar and its 42px violet
pill, the terminal's shift gate, the Spanish families on Sales and Cashiers,
the Dashboard's date line. The reference's own mobile defect too: still no
hamburger at 390×844, still the static 220px sidebar over the content. Nine
cycles, zero drift. The reference is stable; the pin doctrine keeps proving
it.

Then the NEW depth, first target: the Settings page. The section structure,
the label census, the New Category dialog — all of it PARITY, byte for byte
(384px, #0f121a, 8px radius, p-6, the 18px/600 title, the h-9 input, the 42px
buttons). The fiscal toggle decoded as the reference's own quirk: a
`lucide-toggle-left` icon-button with no switch semantics and no aria state —
the clone's labeled Radix Switch stays the documented a11y superset, the same
posture as the drawer. But the two LISTBOXES had a surprise hiding in plain
sight: the reference's Currency options are exactly six — USD, EUR, GBP, MXN,
COP, **ARS - Argentine Peso** — and its Card Payment Provider options are
exactly [None, Stripe, **PayPal, Clip, Mercado Pago**]. The clone shipped
eight currencies and four providers… and was missing the reference's own
entries while carrying invented ones (CAD/AUD/PEN; SumUp/Square). The
ancestry was unmistakable: Session-101's implementation note said
"USD/EUR/MXN/GBP/…" — an ellipsis, never enumerated, and the gap filled
itself with guesses that survived fifteen cycles because no session ever
opened the listbox. The same unmeasured-assumption class as Session-14's
violet charts. The measured lists replaced the inventions; the Zod gate
updated itself through the existing refines; two new e2e pins now hold the
lists by exact enumeration.

The second NEW-depth target was the one the last cycle's evidence run
couldn't take: the dashboard WITH data. The reference is write-gated and
permanently empty — so this is a clone-side verification, the demo seed
booted against the standalone build. The stats populated, the smooth curve
rendered, the gradient area showed, the nice ticks held at five steps — and
then the DOM probe found what the empty-store e2e could never see: the
curve's PEAK floating 29px above the topmost gridline. The charts mapped
their domain to ceil(dataMax) — $92 on the demo week — while niceTicks
stopped at the largest step multiple below it: 80. Thirteen percent of the
plot height, ungridded, with the line soaring through it. Recharts — the
reference's own engine — scales the domain to the nice ceiling above the
data; the clone now does too, through a new pure seam: `niceScale(max,
count) → {top, ticks}`, the domain top rounded UP to the step lattice. The
contract-preservation check came first, as it must: `niceScale(4,5)` =
`{4, [0,1,2,3,4]}` — byte-identical to the measured empty-state ticks, so
every existing pin computed the same values before the code moved. Zero e2e
collateral, by arithmetic, not by luck.

The static audit had its own finds. The zero-importer file census came back
clean — Session-14's purge holds, 45/45 live — but this cycle turned the
same sweep on the DEPENDENCY manifest for the first time, and two dead
entries surfaced: `@radix-ui/react-toast` (the toaster has been pure zustand
since the scaffolding — and Session-14's V9 census had explicitly
misclassified it as "load-bearing," a wrong claim in the record that this
cycle corrects) and `axe-core`, an Omni-Study-era remnant whose only
appearances in the tree are the chart word "axes." Both left through the
package manager; the three doc rows that attributed the toaster to Radix
went with them. `react-dom` was flagged and withdrawn — peer-coupled to
next, framework-required, not dead.

The RED proofs were clean at both tiers, and the unit gate earned its keep
once more: a blast-radius site the manual census had missed —
`validation.test.ts`'s pin asserting PayPal is REJECTED, the same unmeasured
assumption baked into a test — failed the first GREEN run and flipped with
the measurement. The lesson went into the plan: when a list-valued seam
changes, sweep the TEST files for the old values, not just the source. The
evidence run had its own infra lessons (Playwright's evaluate arguments are
JSON-only — the shared DOM probe now inlines as a `new Function` body; and
the F-76 wait re-scoped to `main.login-canvas`, the route-announcer trap
biting exactly where the docs said it would), both fixed without weakening
a single check.

The full gate on the final tree: lint 0 (1 documented warning) · tsc · unit
**146/146** (14 files) · build · smoke **13/13** · e2e **104/104** — the two
list pins riding the 102 baseline, nothing weakened. The evidence script —
booting the standalone on the demo-seeded scratch db — proved **14/14**
live: both peaks now sitting BELOW their top gridlines (25.9 under the
100-line at 5.0; 20.2 under the $100-line at 4.0), the ticks covering the
domain, both listboxes byte-exact in order, the manifest census, the F-76
spot-check under its oklab posture, the mobile drawer. The VLM cross-check
matched 4/4 on the post-fix captures. Screenshots 75–80: the pre-fix audit
pair kept as the finding's visual record, the cured state captured fresh.

The docs moved in lockstep, as the gate demands: the constants re-anchored
(146/14/104, "Session-15 lock", "90 desktop") across the README badges and
tables, CLAUDE's baselines, the PAD's scale line, the SKILL's header and
tiers — and AGENTS.md gained the cycle's contract section: the niceScale
law, the measured lists ("never restyle or extend from memory"), the toggle
measurement, and the corrected toaster record. PAD v1.13 carries the
revision block; the SKILL ships v2.11.0 with the rows future agents will
need most: the two lists that are also the validation gate, and the seam
that keeps the curve inside its grid.

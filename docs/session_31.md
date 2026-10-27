# Session 31 — the Session-18 cycle narration

> The numbering convention, continued: the Session-18 remediation cycle (the ledger is
> `docs/remediation-plan-session-18.md`) narrates as session_31 — session_29 was the
> Session-17 cycle's own narration, session_30 the operator's raw-log commit of that same
> conversation, so the sequence moves to 31. Companion: the worklog's Session-18 entry
> (the condensed record) and the plan (the full verification ledger V1–V20).

This cycle opened the way the last one closed: with a pull, not a clone. The remote
sat one commit ahead of the local snapshot — the operator's session_30 raw-log commit,
pushed after the previous conversation's context ended — so the workspace fast-forwarded
to `e67a997` and the received tree came up green at the Session-16 baselines with zero
environment defects for the first time in three cycles: lint 0, tsc, unit 149/149
(14 files), build, smoke 13/13, e2e 104/104. The s17 lesson about the Playwright
browser-build mismatch had been pre-applied — chromium-1243 was already cached — and
nothing else tripped. The static sweeps came back clean too: the zero-importer census
(its one flag still Next.js's auto-registered instrumentation hook, live by design),
the secrets scan (every AUTH_SECRET hit the documented throwaway test constant), the
documented credential verifying against the dev db, and a Session-17 code review that
confirmed the prior cycle's commits had touched nothing but evidence scripts and docs.

The drift sweep came next, as it always does, and every standing pin measured
byte-exact for the TWELFTH consecutive cycle. The login card with its blur(4px) and
its 30px/700 h1; the F-76 error panel with its exact copy and its red-50/0.7 wash; the
220px sidebar with its eight links and the violet-600/0.2 pill on Terminal; the `/`
landing; the Dashboard's en-US date line and its two 16px/700 chart headings; the
Spanish families on Sales and Cashiers — "Turnos Recientes" re-proven as an H3, the
Session-9 level contract holding live. The reference's own mobile defect too: still no
hamburger at 390×844, still the static 220px z-50 sidebar. Two probe notes fell out of
the sweep, both worth recording: the reference's `<main>` does not carry the clone's
`login-canvas` class, so reference-side alert probes must scope to `main [role=alert]`;
and `find text "Sign in"` clicks the "Sign in to continue" subtitle before the button —
role-scoped locators or refs, never substring text.

Then the NEW depth, in two halves again. The reference side first: the StoreSettings
internals measured at full structure, most of them for the first time since Session-15
enumerated the two listboxes. Six H3 sections at 16px — Business Information,
Branding, Receipt, Fiscal / Tax Data, Card Payment Provider, Product Categories — each
with its bare 20px icon in the measured color: the store at indigo-500, the palette at
purple-500, the file-text at green-500, the receipt at orange-500, the credit-card at
blue-500, the tag at amber-500. The labels all 14px/500 at #e7e9ef; the inputs all
36px/12px. The Business Information card carries Store name (defaulting to "My
Store"), the Upload logo affordance, Address, Phone, Email, Tax ID / EIN, and the
Currency select reading "USD - US Dollar"; Branding holds the two color pickers; the
Receipt card its textarea at rows=2 and 60px; the Fiscal card the four pinned labels
plus its `lucide-toggle-left` icon-button — no role, no switch semantics, exactly the
s15 posture; the Provider trigger reads "None"; Categories shows its 34px Add chip and
"No categories"; Save Changes computes 54px. Both listbox enumerations re-verified
byte-exact, panel and all. One suspicion arose and dissolved the same hour: the
reference renders the provider's empty choice as "None" with a capital N, where the
s15 record said "none" — but the clone's `cardProviderLabel` already renders the
identical display label while storing the code form. The record's lowercase list was
the stored-value list, never a display pin. Withdrawn, on the record.

Then the with-data half. The demo seed's settings row — My Store, USD, #6366f1,
#8b5cf6, "Thank you for your purchase!", provider none, fiscal hidden — plus its five
colored categories, its fifteen products, its week of sales. The clone materialized
every value correctly: the form carrying the saved row, the pickers and their hex
inputs in agreement, the footer textarea with its seeded copy, the "None" trigger, the
fiscal switch checked=false with its "Hidden on receipt" label, the five category
chips with dots at the exact seeded rgb values, the 54px Save CTA. The Dashboard
carried the db truth too, and the truth itself was the interesting part: **Today's
Sales $0.00, Transactions 0** — not a defect but the honest calendar-bucket answer on
a morning-seeded db, whose day-0 sales (16-20h before seed time) land on YESTERDAY's
bucket even as the 7-day chart carries 28 sales. The four stats read $0.00 / 0 / 15 /
3; the chart drew its curve over 13 grid lines with y ticks 0 through 100 — the
topTick 100 sitting above the $94.43 peak, the niceScale law holding on real data; the
category breakdown drew its five rows at three products and 20% bars each. Sixteen of
sixteen, no defects.

Getting there took three probe fixes, and once again every one was a lesson about the
probes. The section icons failed their pin because the audit compared class strings —
the clone writes `h-5 w-5`, the reference `w-5 h-5`, identical computed styles, and the
pin now reads computed color and size plus the icon name. The stat values failed
because v4 serializes white/90 as `oklab(0.999994 … / 0.9)` — WITH a space after the
slash, which the s17 either-form regex did not anticipate; its generalized form
`/\/\s*([\d.]+)\)$/` does. And the chart's top tick came back NaN because the tick
array mixes numbers with weekday labels — `Math.max` over `Number("Wed")` — so the
numeric ticks are filtered before the reduce. A fourth lesson arrived before any
server booted: a SyntaxError caret pointing at `#` in a selector, three tokens away
from the actual unterminated string — when a caret makes no sense, hexdump the line.

The structural find wrote itself out of the coverage check: the with-data
StoreSettings and Dashboard renderings had no standing tier. The e2e pins the save
round-trip, the headings, the form controls, and both listboxes; the unit tier pins
the labels and the Zod gate; the empty-state stats and chart are e2e-pinned — but the
live with-data rendering is invisible to the empty-store e2e by construction, the s16
harness owns Registers/Sales/Cashiers, and the s17 owns Inventory/Reports. **F-113**:
the evidence tier extended to three harnesses. `scripts/capture-s18-evidence.mjs`, the
family successor on port 3419, pins the settings form census and the Dashboard family
plus the standing F-76 and drawer spot-checks — and it carries this cycle's structural
law: the volatile expectations (the today-bucket pair) are DERIVED FROM THE DB AT
RUNTIME, a read-only JSON dump computed before the probes, because a hardcoded
"$X.NN today" pin rots within hours of any re-seed. The re-seed-stable constants —
Products 15, Low Stock 3, the settings row, the five category colors — stay literal.
The harness passed **20/20** on its first complete run, screenshots 90–92 joined the
numbered record, and the VLM cross-check matched **3/3** on the captures.

The full gate on the final tree: lint 0 (1 documented warning) · tsc · unit
**149/149** (14 files) · build · smoke **13/13** · e2e **104/104** — the count
constants unmoved, the docs-counts gate green with nothing re-anchored, the
"Session-16 lock" literal staying by design. The docs moved in lockstep: AGENTS
gained the Session-18 contracts (the three-harness tier, the db-derived-expectation
law, the three postures), CLAUDE's evidence line now names all three harnesses, PAD
shipped v1.16 with the revision block, the SKILL shipped v2.14.0 with the addendum,
the worklog gained its Session-18 entry, and the plan's ledger closes the record.
`.env.example` verified byte-identical to the `.env` it mirrors. The with-data tier
now covers all eight surfaces' populated states — the next cycle's candidates: a
full-suite Playwright trace audit, or the receipt's print-path under the seeded
branding colors.

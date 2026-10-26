# Session-13 log — the glyph/cursor/tag parity pass (narrating the Session-9 work cycle)

*(The narration files run one ahead of the work-session numbering: session_11.md
narrated the Session-8 work; session_12.md holds that session's raw transcript; this
file narrates the Session-9 work cycle.)*

1. Workspace refresh: the local tree had been RESET — a fresh
   `git clone https://github.com/nordeim/velox-pos-2.git` (HEAD `16a0442` =
   Session-8's `c306c95` + the operator's session-log commit), then the full
   environment provision: `cp .env.example .env` (AUTH_SECRET generated;
   `DATABASE_URL="file:../db/custom.db"` — the documented dev form, `db/` at the
   repo root, resolved by the `db-path.ts` contract), `bun install`,
   `bun run db:push`, `bun run db:seed -- --demo` (15 products / 5 categories /
   1 register / 33 sales), and `bunx playwright install chromium` — the
   environment's browser cache held chromium-1200 (a Python-era install) while the
   lockfile's Playwright 1.63.0 pins 1243; the first e2e run failed on the missing
   executable until provisioned. Core docs re-read (AGENTS/CLAUDE/PAD/
   velox-pos_SKILL, session_11.md, remediation-plan-session-8.md, worklog.md,
   session_12.md): the Session-8 tree confirmed as the received state; this cycle =
   the repo's "Session-9" audit→remediate→push pass.
2. Skills loaded for the audit: web-application SKILL.md (§12 v4 traps, §14 the
   three-tier testing doctrine, §15 the gate, §16 security, §20 pre-ship), tdd
   (red → green at pre-agreed seams), clone-app-pat-pro (computed styles as ground
   truth), agent-browser (the live measurement CLI).
3. **The received-tree gate: GREEN on first run** — lint 0 errors (1 documented
   warning) · tsc clean · unit 133/133 · build green (hygiene-clean) · smoke 13/13 ·
   e2e **78/78** (after the chromium provisioning). The documented Session-8
   baseline held.
4. The full reference re-measurement (agent-browser, computed styles, logged in with
   the operator's credentials): **NO drift for the THIRD consecutive cycle** — every
   Session-4/5/6/8 pin re-measured byte-exact (the sidebar chrome, the POS gate +
   CHARGE, the Dashboard stats + weekday axes, the Inventory chips, the Reports
   pills + container, the Settings fiscal labels + Save 54px + the Add chip, the
   Spanish copy, the login internals, the mobile defect at 390×844 — the reference's
   own 220px z-50 overlay with no hamburger, still unfixed on their side). With the
   style surface stable, the audit went one layer DEEPER than computed styles: the
   DOM **tag census** (which heading levels the reference uses) and the **button
   cursor semantics** — and that is where the findings lived.
5. The audit found three findings (the full ledger is
   `docs/remediation-plan-session-9.md`):
   - **F-56**: the Reports nav glyph — the reference's measured class
     `lucide-file-chart-column-increasing` names the lucide export
     `FileChartColumnIncreasing` (a document with increasing bars), but the clone
     rendered `ChartColumnIncreasing` (bare bars). Root cause: Session-6's F-47 fix
     misread the class string as the export name — and the misreading was codified
     into the AGENTS/CLAUDE/SKILL chrome contracts, so three later re-measurements
     (Session-8's ledger even recorded the class string correctly!) never triggered
     the comparison. No e2e pin existed on the glyph class — that is why it
     survived.
   - **F-58**: buttons computed `cursor: default` (Tailwind v4's preflight dropped
     v3's `cursor: pointer` rule) while the reference (v3-era CSS) measures
     `pointer` — measured on both sides (SSO, forgot-password, hamburger, chevron).
     The family skill's §12 documents exactly this trap; it had never been swept
     here.
   - **F-57**: the reference renders its section headings as `<h3>` (Dashboard ×2,
     Settings ×6, Cashiers "Turnos Recientes"); the clone's `<h2>`s had identical
     computed styles (16px/700) but a different document outline.
   Explicitly NOT findings (the discipline list): the login-card audit heuristic
   failures (oklab-serialized `bg-white/95` — the card is e2e-pinned and all
   internals measured parity), the Dashboard y-axis tick difference (data-dependent
   niceTicks), the POS gate `<a>`-vs-`<strong>` emphasis (the documented functional
   superset), the reference's empty states (write-restricted demo data), the
   non-inline `@theme` in globals.css (literal hex pins only — the F-28 inline
   contract applies to the shadcn block in tokens.css, which IS inline), and the
   chromium-1243 requirement (environment provisioning, not a repo defect).
   The local parity audit ran on the production standalone (script-owned server
   lifecycle — the sandbox reaps detached daemons, re-confirmed): every measured
   surface byte-parity with the reference, and the **mobile drawer contract verified
   live** (burger "Open navigation menu", role=dialog + 8 labeled links, scroll lock,
   navigate → unmount, no horizontal overflow at 390×844 — the user's called-out
   mobile-nav surface works; the static v4 trap sweep is clean).
6. The remediation plan written + validated against the codebase (the exact spec
   structures for the new pins, the lucide export table verified, the docs-counts
   lockstep surface mapped) before execution.
7. **TDD execution — RED before GREEN**: the glyph pin
   (`toHaveClass(/lucide-file-chart-column-increasing/)`) + the cursor pin
   (`toHaveCSS("cursor", "pointer")` on the chevron) appended to navigation.spec.ts,
   and the surfaces.spec heading pins extended with `level: 3` — all three RED
   against the pre-fix tree. GREEN: the `FileChartColumnIncreasing` import swap, the
   base-layer cursor rule (`button:not([disabled]), [role="button"]:not([disabled])
   { cursor: pointer }` — the guard keeps the disabled not-allowed contract
   winning), and the nine h2→h3 tag swaps (classNames byte-identical). The first
   full-suite run caught ONE existing locator riding the tag change
   (`section.locator("h2 svg")` → `"h3 svg"` in the section-icon census — assertion
   strength unchanged), and the Session-7 sweep lesson verified no other
   tag-specific locators exist.
8. **Docs-counts lockstep in the same commit**: e2e 78 → 80 (+2 tests) across the
   constants, the gate's own SKILL pin strings ("Session-9 lock", "66 desktop + 13
   mobile + 1 setup"), README (badge + commands + testing), CLAUDE (baseline), PAD
   (scale + tier + the re-certification stamp), SKILL (header baselines + §3 + §12).
   The gate ran 10/10 green.
9. **FINAL GATE GREEN: lint 0 errors (1 documented warning) · tsc clean · unit
   133/133 (13 files) · build green (hygiene-clean) · smoke 13/13 · e2e 80/80** —
   no prior pin weakened.
10. Live re-verification on the rebuilt standalone (`scripts/capture-s9-evidence.mjs`,
    the script owns the server lifecycle): **14/14** — the login round-trip, F-56
    live (the FILE glyph on desktop AND inside the drawer), F-58 live (pointer on
    SSO/chevron/hamburger), F-57 live (the h3 censuses on Dashboard/Settings/
    Cashiers), the checkout journey through the real UI (open shift → cart → cash
    charge → ticket **T-000035** → the ledger row), the shift closed tidy, and the
    mobile drawer contract at 390×844.
11. The VLM sweep of the six fresh screenshots (43–48): **6/6 effective** — the
    three initial flags were all PROMPT-expectation bugs, each disproven by
    re-measurement (the login canvas IS light per Session-4's measured gradient —
    re-reading the REFERENCE's login body computes white; Dashboard was the
    legitimately active pill in the sidebar clip; a 900px viewport shows the first
    three Settings sections in normal flow). The discipline held: the VLM is the
    hypothesis generator, computed styles are ground truth — including when the
    hypothesis is about your own expectations.
12. Docs lockstep in the same commit: README (the 80-test sites), AGENTS.md (the
    corrected glyph contract + the cursor rule + the h3 contract), CLAUDE.md (the
    same), PAD v1.7 (the revision block + the stale v1.1 header bumped + counts),
    velox-pos_SKILL.md v2.5.0 (traps 17/18 + the Session-9 addendum + counts), the
    remediation plan's execution record, the worklog entry, and this narration.
13. Commit + push via the SSH wrapper (main only; the key deployed outside the repo,
    validated, used, and shredded per the runbook).

**The Session-9 lessons, codified:** (a) a measured CSS class string is not an icon
name — map it through the library's export table and PIN the class, or the mapping
silently rots while every re-measurement "confirms" it (F-56 survived three sessions
because the docs recorded the misreading as the contract); (b) parity audits must
occasionally go one layer deeper than computed styles — the tag census and the
cursor semantics both live BELOW the style layer the previous audits stopped at;
(c) the v4 preflight trap list is not exhaustive until you've diffed the preflights
themselves — v3's `cursor: pointer` was load-bearing UX the clone silently lost;
(d) VLM flags are hypotheses about YOUR expectations too — three of six flags this
cycle were my prompt's wrong model of the app, each disproven by measuring the
reference again.

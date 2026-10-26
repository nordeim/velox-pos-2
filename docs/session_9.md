# Session-9 log — the pin-race hardening pass (narrating the Session-7 work cycle)

*(The narration files run one ahead of the work-session numbering: session_7.md narrated
the Session-6 work; session_8.md holds that session's raw transcript; this file narrates
the Session-7 work cycle.)*

1. Workspace refresh: the local tree was intact (bun, deps, Playwright chromium 1243,
   the demo db all present) but 1 commit behind — fast-forward to `88dae55`, which
   brought in `docs/session_8.md` (the raw transcript of the Session-6 work session,
   committed by the operator). Core docs re-read (AGENTS/CLAUDE/PAD/velox-pos_SKILL,
   session_7.md, remediation-plan-session-6.md, worklog.md, session_8.md): Session-6's
   tree confirmed as the received state; this cycle = the repo's "Session-7"
   audit→remediate→push pass.
2. Skills loaded for the audit: web-application SKILL.md (§12 v4 traps, §14 testing,
   §15 gate, §20 pre-ship), tdd, clone-app-pat-pro (computed styles as ground truth),
   agent-browser.
3. **The received-tree gate surfaced the cycle's headline immediately**: fast gate green
   (lint 0 errors/1 documented warning, tsc clean, unit 123/123), build green — but e2e
   came back **77/78**. The red pin: `mobile-navigation.spec.ts:154` "the drawer
   auto-closes when the viewport grows past md (no stuck scroll lock)". Re-run in
   isolation: still red (13/14) — NOT a flake, and the documented 78/78 baseline did
   not hold.
4. Root-cause discipline (reproduce → isolate → prove): a temporary instrumented spec
   drove the pin's exact steps with a MutationObserver on `body[style]`. Verdict: **the
   product code is CORRECT** — the observer log reads `obs-start@770=hidden` →
   `style-mut@816=(empty)`: the drawer's effect cleanup restores the overflow ~46ms
   after the md-growth close. The pin races: `toHaveCount(0)` passes the instant
   React's commit removes the dialog node, but the passive-effect cleanup (the overflow
   restore) flushes after it — and the pin's raw `page.evaluate` read (which does NOT
   retry) lands inside that window. This sandbox's timing hits the window reliably.
   **F-51**: exactly the Session-6 doctrine ("raw `evaluate` computed reads do NOT
   retry — always `expect.poll`") — but the Session-6 hardening covered only the NEW
   pins; the two Session-3-era raw reads in this spec predate the doctrine and were
   never swept. The meta-lesson: when a doctrine lands, sweep the WHOLE suite for the
   old pattern.
5. The full reference re-measurement (agent-browser, computed styles, logged in with the
   operator's credentials): **the reference did NOT drift this cycle** — the first
   drift-free cycle since the parity work began (Sessions 4 and 6 both caught live
   drift). Every pin re-measured byte-exact: the sidebar chrome (40/42px pills, the
   violet border pair, 16px icons, ChartColumnIncreasing, the 14px wordmark, the p-3
   footer), Settings (fiscal labels, H1 24px, the six per-section-colored 20px header
   icons, the 34px header Add chip, the New Category dialog geometry — opened live,
   18px/600 title, "e.g. Beverages", 36px input, 42px Cancel/Create — Save Changes
   54px), Inventory (the 36px gradient chip, 42px New Product), Reports (14px uppercase
   white/60 headings, the 32px pills in the rgba(28,31,52,0.85) container), Dashboard
   (Title Case stats, weekday chart labels, 0..4 nice ticks), the POS gate (p-8, the
   /30 64px Monitor, white/35 copy, the strong white/60 emphasis, CHARGE 70/20/900),
   the Spanish copy verbatim, the login internals (48px slate inputs, white/95
   shadow-2xl card, 96px logo, 54px SSO, 500 sign-in) — and the reference's OWN mobile
   defect still present at 390×844 (220px z-50 overlay, no hamburger): the clone's
   drawer-superset posture remains the correct answer.
6. The Session-6 change audit (commit `1ecc333`) + the static v4-trap sweep: all clean
   (the category-dialog restructure with click-handler resets, the niceTicks seam, the
   nav chrome; no `@layer utilities`, `@theme inline` intact, the hover unwrap present,
   no space-y + mt/mb in the nav). Tree hygiene clean; the `[m`-eating bash display
   artifact re-encountered and dismissed via the Read tool (the file was never
   corrupted — the documented hex-dump discipline).
7. The remediation plan written + validated (`docs/remediation-plan-session-7.md`:
   the V1–V15 ledger, F-51 as the single finding, the not-findings list).
8. TDD GREEN (the RED was the reproduced failure itself): both raw reads in
   `mobile-navigation.spec.ts` hardened to `expect.poll` — identical assertions,
   identical protection, retried. Stability proof: the mobile spec passed 3/3
   consecutive full runs (14/14 each).
9. **FINAL GATE GREEN: lint 0 errors (1 documented warning) · tsc clean · unit
   123/123 · build green · e2e 78/78** — the documented baseline restored.
10. Live re-verification on the rebuilt standalone (:3400) via a new evidence script
    (`scripts/capture-s7-evidence.mjs` — the script owns the server lifecycle; the
    sandbox reaps detached daemons): **7/7 checks** — login round-trip, the drawer
    dialog + 8 links, the scroll lock ENGAGED while open, **the F-51 path live**
    (md-growth → unmount → lock RELEASED, polled), the Session-6 nav chrome
    (oklab-serialized border, alpha-pinned), Save Changes 54px, the chart at data
    scale (0/25/50/75/100 + Tue..Mon).
11. The VLM sweep of the fresh screenshots re-caught a capture-discipline gap: the
    first drawer screenshot (taken the moment the dialog became visible) read as a
    "severely clipped" drawer — it was a mid-entrance-animation frame (the slide-in
    runs ~300-500ms). Fix: settle-wait ~600ms before capturing animated surfaces;
    re-captured and VLM-verified clean (drawer + chart both PASS all checks). The
    capture law is recorded in the skill's trap 16.
12. Docs lockstep: AGENTS.md + CLAUDE.md (the poll-doctrine completion + the
    sweep-the-suite meta-lesson), velox-pos_SKILL.md v2.3.1 (trap 16 + the Session-7
    addendum), PAD v1.5 revision block, the plan's checkboxes + execution record, the
    worklog Session-7 entry, five fresh screenshots (32–36) from the production
    standalone, .env.example re-verified against every `process.env` read (all four
    configurable vars covered, unchanged — the counts in README/AGENTS/CLAUDE stay
    123/78, so no count sweep was needed).

## Session-7 complete — pushed & verified

**`main` pushed via the SSH wrapper** on `github.com:nordeim/velox-pos-2.git` (dry-run
first, remote ref verified == local HEAD; operator key shredded per the runbook).

**What happened:** The received-tree gate came back 77/78 — the mobile scroll-lock pin
failed reliably, and the root cause was in the PIN, not the product (instrumented proof:
the drawer's cleanup runs ~46ms after the close; the unpollled raw read raced React's
passive-effect flush). Both Session-3-era raw reads hardened to `expect.poll` — the
Session-6 doctrine now covers every raw computed read in the suite. The reference
re-measured end-to-end: **NO drift** — every Session-4/5/6 pin byte-exact, the
reference's own mobile defect still present (the clone's drawer superset stays correct).
The VLM sweep caught one capture-discipline gap (mid-animation screenshots read as
broken UI — settle-wait before capturing).

**Final gate:** lint 0 errors · tsc clean · unit **123/123** · build green · e2e
**78/78** (the mobile spec re-proven stable across 3 consecutive runs). Docs, skill
(v2.3.1), PAD v1.5, worklog, and 5 screenshots in lockstep.

**Suggested next:** the drift-sweep script (auto-diffing computed styles against the
reference per session — this cycle's manual sweep found no drift, but it stays the
highest-value automation), barcode-scanner hardware support, or Stripe settlement.

# Session-5 log — the form-control parity pass + the @theme inline bug

1. Workspace refreshed (`git pull`: `3bcb890..dab7f4f`, the Session-4 log doc). Core docs re-read
   (AGENTS/CLAUDE/README/PAD/velox-pos_SKILL.md, session_4.md, remediation-plan-session-4.md,
   worklog.md) — Session-4's tree confirmed as the received state.
2. Skills loaded for the audit: web-application SKILL.md (§12 v4 traps, §14 testing, §15 gate,
   §20 pre-ship), tdd, agent-browser, clone-app-pat-pro. Fast gate on the received tree: lint
   0 errors · tsc clean · unit 117/117; build kicked off double-forked (the sandbox reaper).
3. Build green; e2e 55/55 on the received tree — the Session-4 baselines hold pristine.
4. Reference re-measurement (agent-browser, computed styles): all Session-4 pins still match
   (fiscal labels/toggle/help, heading scale 24/16/14px, Title Case, Added banner classes,
   login canvas gradient); the reference's own mobile defect still present (220px overlay,
   no hamburger @390×844); the clone's drawer contract live-verified intact.
5. The view-by-view text sweep (explicit navigation per site — the CLI sessions share one tab;
   agent-browser's eval output is multi-encoded, decoded with a peel loop): only data-driven
   diffs — no copy drift.
6. **The form-control census** (never previously pinned): the reference's Store name input
   computes 12px radius — the clone's computes 6px. Systematic across EVERY input, select,
   textarea (settings, dialogs, search). Border too: #262a36 (border-input) vs #1e2235
   (border-edge overrides), bg transparent vs white/5, placeholder #707a8f vs white/30.
7. **The mechanism dig**: the reference's :root tokens EQUAL the clone's — but the reference
   re-points --input/--border/--muted-foreground/--ring on its app wrapper. And the clone's
   `--color-input` reads the :root-baked dark value INSIDE .theme-light — **non-inline @theme
   bakes `hsl(var(--input))` at :root; scoped re-pointing never reaches the utilities.** The
   login inputs had rendered dark borders on the light card since Session-101 (visible in the
   old screenshots, never measured).
8. The login surface deep-measure: 48px slate-filled inputs (h-11 sm:h-12, slate-200 borders,
   slate-50/50 fill, pl-10), the bg-white/95 + shadow-2xl card with a 4px top gradient strip
   and inner content paddings, the logo as a 96×96 img (the hexagonal crystal — vendored to
   public/), 54px SSO buttons (px-5 py-3.5, text-base), font-medium sign-in.
9. Buttons: the reference's standard buttons are py-2.5 (42px — New Product, dialog
   Cancel/Create); CHARGE is py-5 (70px). An intermediate "gradient drift" reading on
   glass-button-primary was a HOVER-STATE artifact — re-measured clean, gradients match.
10. More findings: the receipt footer is a TEXTAREA (rows=2); the Reports period pills
    (rounded-2xl container rgba(28,31,52,0.85), text-xs bold pills, shadow-lg active); the
    color-swatch frames. Verified NOT findings: the glass dialog frames (equivalent),
    label-to-input spacing (8px both sides).
11. `docs/remediation-plan-session-5.md` written (13 findings F-26..F-38, 18 verification
    checks) and validated against the codebase.
12. TDD RED: 13 new e2e pins (surfaces + auth) — verified failing (12 + SSO).
13. TDD GREEN: `@theme` → `@theme inline` (verified in the built CSS:
    `.border-input{border-color:hsl(var(--input))}`); :root tokens → the reference's
    app-scoped values; Input/Select/Textarea bases → rounded-xl + ring-1 + text-base
    md:text-sm; 34 per-field `border-edge bg-white/5` overrides stripped; the search inputs
    → transparent + pl-10 + slate-400 icons; Button default → px-4 py-2.5; CHARGE → py-5;
    the receipt footer → Textarea rows=2; the Reports pills; the login surface (direct slate
    classes, the card frame, the vendored logo, 54px SSO, font-medium); the color swatches.
14. GREEN verified: full e2e 68/68 (two pin bugs fixed during GREEN — the SSO line-height is
    text-base (24px line → 54px), and bg-slate-50/50 serializes as oklab → pinned
    alpha-tolerant). Fast gate: lint 0 errors (1 documented warning) · tsc clean · 117/117.
15. Live re-verification on the rebuilt standalone (:3400, double-forked): every fix confirmed
    by computed styles; the mobile drawer re-verified @390×844 (288px dialog, 8 links,
    `animation-name: enter`, focus on close, no overflow); the F-28 mechanism probe (the
    built CSS emits hsl(var(--input)) inline).
16. Six screenshots (19–24) captured from the production standalone; the login card VLM-checked.
17. Docs lockstep: README (e2e 55→68), AGENTS.md (the @theme inline law + the Session-5
    contracts), CLAUDE.md (same), PAD v1.3 + ADR-010, velox-pos_SKILL.md v2.2.0 (trap 13 +
    the session addendum), the plan's checkboxes ticked, the worklog entry.
18. Committed `e4cca8f` and pushed via `docs/ssh_git_wrapper_v3.py` (the Appendix-A paramiko
    shim on PATH, python3.13; key materialized outside the repo at 0600, fingerprint checked,
    dry-run then push — remote verified `main @ e4cca8f == local HEAD`, key shredded).

## Session-5 complete — pushed & verified

**`main @ e4cca8f`** on `github.com:nordeim/velox-pos-2.git` (remote ref verified, key shredded
per the runbook).

**What happened:** the received gate held (117 unit / 55 e2e), then a computed-style census at
the form-control depth — never previously measured — surfaced **the Tailwind v4
theme-switching bug**: non-inline `@theme` baked `hsl(var(--input))` at `:root`, so the login
card's light scope never reached themed utilities (dark-bordered inputs on the light card since
Session-101). Thirteen findings fixed TDD-style (13 new e2e pins, red→green): the `@theme
inline` root fix + the reference's direct-slate login form (48px inputs, the shadow-2xl card
with the 4px gradient strip, the vendored logo, 54px SSO buttons), the systematic 12px
form-control contract (34 compensating overrides stripped), py-2.5 buttons, the 70px CHARGE,
the receipt-footer TEXTAREA, the Reports pill geometry.

**Final gate:** lint 0 errors · tsc clean · unit **117/117** · build green · e2e **68/68**.
Docs, skill (v2.2.0), worklog, and 6 screenshots all in lockstep.

**Suggested next:** walk the store's forms (settings + dialogs) to feel the new control
geometry, or I can tackle a drift-sweep script (auto-diff computed styles vs. the reference),
barcode-scanner hardware support, or Stripe settlement next.

# Session 19 — the Session-12 cycle narration

> The one-ahead numbering convention: the Session-12 remediation cycle (the
> ledger is `docs/remediation-plan-session-12.md`) narrates as session_19.
> Companion: the worklog's Session-12 entry (the condensed record) and the
> plan (the full verification ledger V1–V17).

The workspace had been reset again — a fresh clone of `336284e`, the
Session-11 baseline. Environment provisioned (bun 485 pkgs, prisma generate +
push + seed, chromium 1243, `.env` from `.env.example` with the
`DATABASE_URL="file:../db/custom.db"` contract). The received-tree gate came
up GREEN on the first run: lint 0 errors (1 documented warning) · tsc clean ·
unit 133/133 · build green (hygiene-clean) · smoke 13/13 · e2e 88/88. The
Session-11 baseline held.

The sixth consecutive live re-measurement of the reference
(veloxposen.base44.app, via agent-browser — computed styles are ground
truth): every standing pin held byte-exact. The login internals (blur(4px),
typed rgb(9,9,11), 48px inputs, 54px SSO, the slate canvas), the sidebar,
the POS gate, the Dashboard/Reports/Settings families — all stable. But the
audit's NEW depth this cycle opened the four surfaces no prior session had
ever measured: **the failed-login error state, the forgot-password view,
the sign-up view, and the 404 — both authenticated and logged-out.**

The error state turned out to be an inline shadcn-family Alert panel —
`rounded-xl border-red-200 bg-red-50/70 p-4` + an inner 14px red-700 block,
no icon — not the toast the first probe guessed at, and not the bare red
paragraph the clone shipped. The forgot view turned out to be a COMPLETE
card-content swap: the logo, the h1, the sub, all four SSO buttons and the
OR divider all unmount; a "Back to sign in" ArrowLeft link becomes the first
child; the subview fields are `h-10 sm:h-11` with slate-400 placeholders
(the sign-in view's own fields are `h-11 sm:h-12` with slate-600 — the
reference itself differs per view). The sign-up view: back-first, "Create
your account", exactly Email / Password / Confirm Password, no SSO, no Full
name. The authenticated 404: a plain white span numeral (not the clone's
brand chip), the slate-800/slate-500 text family, a 50px font-medium
gradient link with a lucide ArrowLeft icon, on `rounded-3xl p-12`. And the
logged-out bogus route never renders a 404 at all — the reference
auth-gates unknown routes straight to /login.

A second structural pass on the sign-in card went deeper than any prior
session — and found the skeleton beneath the byte-exact pins: the reference's
body is ONE `flex flex-col items-center text-center space-y-6 sm:space-y-8`
block, not the flat margin chain the clone shipped. The logo is a blur(24px)
halo group behind a ring-4 ring-white/50 rounded-full span. The h1 is
responsive (`text-2xl sm:text-3xl tracking-tight`). The OR divider is a
continuous absolute 1px line with a bg-white px-3 knockout rendering
lowercase "or" through an uppercase transform. And the links live INSIDE the
form, justify-between at desktop — Forgot left, signup right — collapsing to
a centered 8px column at 390px. Two link-contract surprises: the "Sign up"
phrase is mixed (a 400/slate-500 base with a font-medium slate-700 span —
the Session-4 whole-phrase pin had drifted on the reference), and "Forgot
password?" is 14px/500 with no underline anywhere. Plus the mid-flight
observation: the reference's submit renders "Signing in..." while busy.

The plan (docs/remediation-plan-session-12.md) recorded ten findings —
F-76 through F-85 — all clone-side, all on the auth surface, each with its
measured contract, and the TDD task list T-1…T-16. Validated against the
codebase before execution: the register API's optional fullName (the UI
field could simply go), the (app) layout's gate pattern (the mirror for the
404 gate), and the `.glass-card`/`--color-ink` byte-parity (the 404 needed
no token work).

RED first: auth.spec grew 14 → 19 tests (the forgot swap, the signup
3-field card, the logo/halo/h1 depth, the OR/links pair, the guest 404
gate), and four contracts extended existing tests (wrong-creds + the alert
panel, the signup affordance + the mixed span, the sign-in button + the
14px font, the 404 + the full contract). The RED proof: **9/9 targeted
failures, zero collateral** (84 passing of 93). One locator hardening en
route — Next's own route-announcer div carries `role="alert"` at body
level, and strict mode matched both; the alert pins scope to
`main.login-canvas [role='alert']` (trap #28).

GREEN: the Alert primitive (`src/components/ui/alert.tsx`), the
login-surface restructure (the shared centered skeleton + the per-view
swaps + the client-side confirm-password check), and the not-found rewrite
+ gate landed in one pass. The build needed no dynamic escape — Next 16
renders `/_not-found` as Dynamic within the request scope, the cookie gate
intact.

The GREEN run then surfaced three v3→v4 serialization traps, all cured per
the standing doctrine — translate the class, pin the computed both ways:
`bg-red-50/70` serializes as `oklab(.../0.7)` (the same color as the
reference's rgba — the login-geometry regex posture, trap #27); v4's
`rounded-full` computes `calc(infinity * 1px)` → 33554400px (vs v3's
9999px — the pin accepts both serializations, trap #26); and v4 RESCALED
`tracking-wider` from 0.1em to 0.05em (the OR label now ships
`tracking-[0.1em]` — the F-59 genus in the letter-spacing family, trap
#25).

Re-certification on the final tree: lint 0 errors (1 documented warning) ·
tsc clean · unit **133/133** · build green (hygiene-clean; `/_not-found`
Dynamic) · smoke **13/13** · e2e **93/93**. The docs-counts lockstep gate
enforced the same-commit rule mid-cycle — the count constants re-anchored
(E2E=93, "Session-12 lock", "79 desktop + 13 mobile + 1 setup") together
with README, CLAUDE, PAD and the SKILL's live-tense sites. Live evidence
(`scripts/capture-s12-evidence.mjs`): **8/8** — including the busy-copy
capture (the login response held 600ms via route interception so the
transient "Signing in…" state was grabbable) and the mobile 390×844 sign-in
(80px logo, 24px h1, 44px inputs, the links column, no horizontal
overflow). Screenshots 61–66.

Docs lockstep: AGENTS.md + CLAUDE.md (the auth-surface contracts), PAD
v1.10 (the revision block), velox-pos_SKILL.md v2.8.0 (traps 25–28 + the
Session-12 addendum), the worklog's Session-12 entry, and this narration.
One parity correction on a prior pin, documented in the plan: the divider
label moved from the literal "OR" to the reference's lowercase "or" + CSS
uppercase transform.

Standing debt: NONE identified. The parity surface has now held for six
consecutive reference cycles, and the pin doctrine covers the last unpinned
auth depth — the card every guest meets first.

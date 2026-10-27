# Session 21 — the Session-13 cycle narration

> The numbering convention, continued: the Session-13 remediation cycle (the
> ledger is `docs/remediation-plan-session-13.md`) narrates as session_21 —
> session_19 was the Session-12 cycle's own narration, session_20 the
> operator's raw-log commit of that same conversation, so the sequence moves
> to 21. Companion: the worklog's Session-13 entry (the condensed record)
> and the plan (the full verification ledger V1–V20).

The workspace survived this time. `git pull` fast-forwarded `5d75a61` to
`9caacf0` — the operator's `docs/session_20.md`, the raw conversation log of
the Session-12 cycle, 190 lines of the redo run that had rebuilt the lost
auth-surface work and pushed it. The environment was intact (the .env
contract, the db/, the 485 packages, chromium 1243). The received-tree gate
came up green on the first run: lint 0 errors (1 documented warning) · tsc
clean · unit 133/133 · build green · smoke 13/13 · e2e 93/93. The Session-12
baseline held.

The docs re-read set the cycle's frame: the Session-12 plan's findings
F-76..F-85 were all cured and pinned, but the raw log's first-pass audit
(lines 14–24 of session_20.md) had proven a standing static debt — 226+
dead StudyFlow scripts, dead src files, root leftovers, a "log typo" — that
never landed in the redo's plan. The redo's budget had gone to the lost auth
work; the static findings were left standing. This cycle would cure them.

The live re-measurement (agent-browser — computed styles are ground truth)
held EVERY standing pin byte-exact for the SEVENTH consecutive cycle: the
login card's internals (blur(4px), the halo/ring logo, the 30px h1, the 48px
inputs, the 54px SSO), the F-76 alert panel, the sidebar family, the
terminal's shift gate, the Spanish empty states, the Dashboard's date line —
and the reference's own mobile defect at 390×844 (still no hamburger, still
the static 219px sidebar; the clone's drawer superset remains the correct
posture).

The NEW depth opened the one auth surface no prior session had ever
measured: **the reset-password page**. It turned out to be a completely
different design family from the login card — the stock shadcn GRAY family,
the base44 default: a flat gray-50 canvas, an 8px rounded-lg shadow-lg card
with a 2px SOLID gray-900 top strip (not the login's 4px slate gradient),
Title Case gray-700 labels, 6px rounded-md gray-200 inputs with Lock icons
on both fields, an 8-character helper line, NO token field, a 44px gray-900
submit beside a full-width "Back to login" text link. Its error alert is its
OWN family — 8px radius, red-50 at 0.5 alpha, an inner red-800 #991b1b —
deliberately different from the login's 12px/0.7/red-700 panel; the
reference itself ships two alert treatments on its two auth surfaces. And a
tokenless URL renders a distinct dead-end — "Invalid Reset Link", an 80px
red-100 circle chip around a 40px CircleAlert, zero inputs, a 44px back
button. Nine findings, F-86 through F-94, every one measured before a line
of code moved.

One more probe settled a long-standing open question: the reference's demo
account is CLIENT-SIDE write-gated. The New Register dialog's Create button
never enables — even with both fields genuinely typed through CDP keyboard
events and React-native setters — and an armed MutationObserver caught no
toast on a Settings save. The checkout→receipt chain, the Sales receipt
viewer (0 sales on the reference), and every toast contract are formally
UNMEASURABLE there. They stay documented superset surfaces, and the clone's
working flows own them.

The plan (docs/remediation-plan-session-13.md) recorded the verification
ledger V1–V20, the nine reset findings, and the static-debt set SD-1..SD-4.
RED first: four new auth.spec pins — the form card, the invalid-token alert
(through the real API, pinning the reference's own error copy end-to-end),
the client-side mismatch (a route interception asserting ZERO requests), and
the tokenless dead-end with its back-navigation. RED proof: 4/4 targeted
failures, zero collateral.

GREEN landed in one pass: the Alert primitive gained the `error-soft` tone,
`--color-red-800: #991b1b` was hex-pinned per the F-62 doctrine, the API's
error copy moved to the reference's "Invalid or expired reset token", and
the surface was rebuilt as three SERVER-RENDERED states — the token now
arrives as a prop from an async server page reading `searchParams`, so a
token-ful URL never flashes the dead-end first (the old client-side URL
read would have SSR'd "" and flipped on hydration). No v4 serialization
surprises this time — the regex postures and hex pins went in up front from
the standing trap catalog, and the clone's alert background computed
`oklab(.../0.5)` exactly as trap #27 anticipates.

The static sweep cured the standing debt: **243 of 254 tracked scripts
deleted** (the git-history census since the StudyFlow pivot is the
authoritative keep-list — exactly 11 velox-pos-era files remain), **4 dead
src files deleted**, `omni-study1_SKILL.md` archived into
`docs/archive/omni-study1/`, the `studyflow`-branded Docker trio removed,
and 3 dead artifact-excludes entries dropped.

Then the verification doctrine earned its keep. The T-12 "typo fix" was
about to run — the first-pass audit had recorded `"[health` log typo", and
the terminal greps still showed `console.error("ealth] db probe failed:"`.
But the Read tool showed the line CORRECT, and `grep -c "health]"` matched.
The control test settled it: `echo "[health]"` renders as `ealth]"` — this
sandbox's bash OUTPUT DISPLAY eats the literal two-byte sequence `[h`. The
typo never existed; the first-pass audit had been fooled by its own
terminal. SD-4 was withdrawn, the plan corrected in place, and the lesson
recorded in AGENTS.md and the SKILL's debugging guide: never diagnose a
source defect from a terminal echo — confirm raw bytes via a second tool.

Re-certification on the final cleaned tree: lint 0 errors (1 documented
warning) · tsc clean · unit **133/133** · build green (hygiene-clean;
`/reset-password` Dynamic) · smoke **13/13** · e2e **97/97**. The
docs-counts lockstep gate fired mid-cycle exactly as designed — the census
read 97 against the constant's 93 — and the constants re-anchored
(E2E=97, "Session-13 lock", "83 desktop + 13 mobile + 1 setup") together
with README, CLAUDE, PAD and the SKILL, including the two literal strings
pinned inside the gate itself. Live evidence
(`scripts/capture-s13-evidence.mjs`): **10/10** — including the FULL
one-shot reset round-trip (forgot-password → resetUrl → reset → done, the
owner's password rewritten to its current value so the dev db's credentials
never changed) and the login-surface sanity sweep. Screenshots 67–70.

Docs lockstep: AGENTS.md (the reset-password contracts + the write-gate and
display-artifact lessons), CLAUDE.md, PAD v1.11, velox-pos_SKILL.md v2.9.0,
the worklog's Session-13 entry, and this narration.

Standing debt: NONE identified. The parity surface has held for seven
consecutive reference cycles, the pin doctrine now covers every auth
surface including the reset page's three states, and the repo's StudyFlow
debt is fully purged.

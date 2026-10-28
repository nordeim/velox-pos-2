# Session 47 — the Session-26 cycle narration

> The numbering convention, continued: the Session-26 remediation cycle (the ledger is
> `docs/remediation-plan-session-26.md`) narrates as session_47 — session_45 was the
> Session-25 cycle's own narration, session_46 the operator's raw-log commit of that same
> conversation, so the sequence moves to 47. Companion: the worklog's Session-26 entry
> (the condensed record) and the plan (the full verification ledger V1–V8 + the
> execution record).

The second consecutive reset: the sandbox workspace arrived empty again, so the cycle
opened with a clone rather than a pull — the checkout, and this time nothing else, for
the persisted audit scripts at `/home/z/my-project/scripts/` had survived. The
documented rebuild ran in full: a fresh `.env` with a new 64-hex secret, `bun install`,
`db:push` + `db:seed`, and — the step the first e2e attempt reminded us of — a
chromium-1243 install. The received tree's fast gate ran green on arrival (lint 0 with
the one documented warning, tsc, unit 151/151), and the static sweeps came back clean:
the census now scans 148 sources (the two Session-25 additions) with zero dead, the
secrets scan finds only the documented locations, the documented credential verifies,
and the Session-25 commit review confirmed the prior cycle had touched exactly what its
plan said — test-tier only, zero `src/` files.

The reference sweep ran next — the TWENTIETH consecutive cycle — and every standing
pin held byte-exact: the login card's blur(4px) and white/95 and 16px radius and
30px/700 h1 and 48px inputs and 54px/16px SSO buttons; the F-76 alert re-verified
with wrong credentials ("Invalid email or password" on the red-50/0.7 wash); the `/`
landing with the 220px sidebar and its eight links; the Dashboard's date line and both
16px/700 chart h3s; the Spanish families on Sales and Cashiers; the Reports surface
still empty in its 2× "No data for this period" (the demo account remains
write-restricted, the with-data tiers still the functional superset). The reference's
OWN mobile defect is STABLE at the D-1 shape Session-21 caught — no hamburger, the
static 220px sidebar, main crushed to 170px, the document computing exactly 390 — and
the cycle's reference capture was refreshed. Then the clone-side verification, the
operator's standing priority: the mobile drawer probed live at 390×844 with REAL
clicks throughout (the V14 law) — the labeled hamburger, the 288px dialog with its
eight labeled links, the tw-animate-css `enter` animation, focus moving to the close
button, the body scroll-lock, Escape restoring the hamburger's focus and releasing the
lock, the route-close unmount, zero horizontal overflow at every step. No Tailwind v4
regression anywhere in the chain.

The session_45 pointer had named three candidates. The receipt PDF/email shape stays
unmeasurable on the write-gated reference (no sale can be created to reach its
receipt email/PDF) and remains the pure-superset feature build for a future cycle.
The Cashiers shift-ledger walk is real — the "Turnos Recientes" rows are unpinned
with data — but sits adjacent to two already-pinned journeys (registers-shifts.spec's
dialogs, the fiscal walk's shift closes), so it is recorded as the next cycle's
leading candidate. The password-reset round-trip was chosen: a single ripgrep —
`resetPath|resetUrl|PasswordResetToken` over `tests/` — returns NOTHING. The
Session-13 pins (F-86..F-94) drive FABRICATED tokens ("a".repeat(48),
"f".repeat(48)) into the failure branches (the form card, the invalid-token alert,
the client-side mismatch, the tokenless dead-end), and the forgot view's static
contract was pinned but never its submit. An auth surface, security-critical, zero
suite references at any tier — the deepest unpinned chain of the three.

The ANALYZE took it live and measured every leg CORRECT: the register (201 + a
6-digit code), the verify-email (200 — the login gate 403s unverified accounts, so
the fixture must verify), the sanity login with the original password, the forgot
call (200 + `resetPath` carrying a REAL 48-hex one-shot token, TTL 30 minutes, no
SMTP — the URL in the response IS the delivery), the reset page rendering the
measured form from the URL token, the submit's done state ("Password Updated", zero
inputs, the Back to Login link), the new password signing in (200) while the old one
401s, and the replay of the consumed token rejected (400, the exact copy). Zero
production defects — the gap was pure protection, and the cure is the F-122/F-123
pattern again: two tests in `auth.spec.ts` (the guest tier — the file-level
empty-storageState opt-out), the first pinning the full round-trip including two
never-pinned surfaces (the forgot view's anti-enumeration notice, the 48-hex
`resetPath` format) and the real landing on the shift gate with the new password; the
second pinning the one-shot semantics — the replay rejected, the old password dead,
the new one signing in. The ordering analysis is part of the record: register
defaults to role=owner (the Cashiers roster filters role=cashier — the empty-roster
pins are safe), the e2e db is fresh per run, the namespaced in-memory rate limiters
see 2 register + 2 forgot + a handful of logins, and the API legs ride Playwright's
ISOLATED `request` fixture — because `page.request` shares the page's cookie jar and
the verify-email call SETS a session cookie that would leak into the UI legs. Both
tests passed on the first run against the standing artifact; the coupling trap
itself, caught during the design, is now a law in AGENTS.

The count lockstep rode in the same commit — E2E 115 → 117, desktop 101 → 103, the
"Session-25 lock" literal becoming the Session-26 lock — and immediately paid a
dividend of its own: the docs-counts gate's scoped NEGATIVES failed on the first unit
run, because the historical ban on `"117/117"` (the retired UNIT count from Sessions
6-7) now collided with the live e2e 117/117. The bans are unit-scoped (`"unit
**117/117**"`, `"tests/unit/** (117)"`) — the retired claims stay banned, the live
forms pass, the intent preserved and the letter corrected. Then the full gate
surfaced the cycle's second finding, and it was the Session-25 hour-drift genus
again: on this cycle's fresh demo.db — seeded at 23:09, an EVENING seed, where the
demo seed's now−12/10/8 h "today" sales land INSIDE today (every prior cycle's db
was either morning-seeded, landing them YESTERDAY with the today bucket empty, or
warm since Session-22) — s18 failed one check: the today pair expected `$0.37`
while the page rendered `$36.54`, the count 3/3 agreeing. The forensics replicated
the harness's raw truth query standalone — it derives the CORRECT $36.54/3 — which
isolated the defect to the check's FORMATTER: `money(cents)` divides by 100, but
`truth.today.sum` sums the Sale.total column, which is DOLLARS. The bug was
invisible in every prior green run because the today bucket was empty —
`money(0)` = "$0.00" = the page's "$0.00" — the same latent-defect genus that only
a fresh-seed hour change can expose, striking the TODAY bucket this time instead of
the 7-day window. The cure is one line with a provenance comment: money() formats
dollars. s18 re-ran 20/20, alongside s16's 13/13 and s17's 19/19.

The evidence tier earned its own debugging record. The s26 evidence script's API
legs first rode `page.request` — and crashed in playwright-core's
`_parseSetCookieHeader` the moment a cookie-setting endpoint answered
(`"/api/auth/login" cannot be parsed as a URL`), a quirk the e2e suite is immune to
because it runs under the node-based playwright RUNNER while the harness family
runs under bun. The cure: the API legs ride bun's native fetch — they need only
status codes and JSON bodies, no cookie jar — and the self-clean's PrismaClient
takes the absolute datasource URL (the documented relative-URL quirk). The script
then ran clean end to end: the fixture provisioning (idempotent per email), the
reset form verified (2 inputs on the measured gray-50 canvas), the done state
verified ("Password Updated", zero inputs, the back link), the completion legs
API-verified (new=200, old=401, replay=400), the mobile drawer verified at 390
(288px, zero overflow), and the self-clean verified live — the throwaway account
deleted, its tokens cascade-removed, the dev db back to its default state.

The full gate on the final tree: lint 0 (the one documented warning) · tsc · unit
151/151 (15 files — unmoved) · build · smoke 13/13 · e2e 117/117 — twice,
consecutively — with the post-run db verified as state, not exit codes: the settings
at seed defaults, zero open shifts, both throwaway chains completed, and the token
math exactly explained (three created — two API forgot legs plus the UI submit —
two consumed, one open, the UI-submit token correctly never used). Screenshots
114–116 committed through the evidence script, verified distinct before commit, plus
the D-1-shape reference capture. The `.env.example` verified key-for-key against
the working `.env` (COOKIE_SECURE the documented optional escape hatch). The next
cycle's candidates: the Cashiers shift-ledger with-data walk (the leading candidate
— the Turnos rows' shift×sales×cashier×register join, the Abierto/Cerrado chips),
the receipt PDF/email shape (still the pure-superset feature build), or whatever
the next operator log names.

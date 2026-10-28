# Session-26 remediation plan — the password-reset round-trip walk (F-124)

**Received tree:** `cb3ce09` (the Session-25 push `f05d765` + the two session-log
commits — `35a13a6` carried `session_44`/`session_45`, `cb3ce09` the operator's
`session_46` raw log). A FRESH CLONE this cycle again — the sandbox workspace was
reset (the second consecutive reset), so the documented rebuild ran in full:
`.env` regenerated with a fresh 64-hex `AUTH_SECRET`, `bun install` (472 packages),
`db:push` + `db:seed` (the owner + the empty store), the persisted audit scripts
at `/home/z/my-project/scripts/` SURVIVED this reset (unlike last cycle).

**Cycle shape:** the session_45 "Next" pointer's three candidates weighed → the
password-reset round-trip selected as the deepest UNPINNED chain → ANALYZE live →
2 new tests in `auth.spec.ts` (F-124) → the count lockstep → the full gate →
screenshots 114–116 → docs → push. Test-tier only; zero production-code changes
expected (the ANALYZE measured every leg CORRECT).

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|-------|-----|--------|
| V1 | Received-tree fast gate | `lint` → `tsc` → `test` on the fresh clone | GREEN — lint 0 errors (1 documented warning), tsc clean, unit 151/151 (15 files) |
| V2 | Session-25 commit review | `git show f05d765 --stat` + `git diff 0276d83..cb3ce09 --name-only -- src/` | test-tier only — ZERO `src/` files; the fiscal walk spec, the s25 evidence script, the s17/s18 harness cures, screenshots 111–113, the docs lockstep |
| V3 | Zero-importer census | `bun /home/z/my-project/scripts/zero-importer-census.mjs` | 148 scanned (146 + the s25 spec + the s25 evidence script), ZERO dead; react-dom + z-ai-web-dev-sdk never imported from src/ (the documented known pair) |
| V4 | Secrets scan | ripgrep for the credential + a live 64-hex AUTH_SECRET pattern, excluding skills//docs//scripts/ | Only the documented locations (the e2e boot fixtures, the seed, the doc corpus); no real AUTH_SECRET anywhere |
| V5 | Owner credential | `bun /home/z/my-project/scripts/check-owner-credential.mjs` | VERIFIES against the fresh seed |
| V6 | Reference sweep #20 | agent-browser, computed styles, one login (2 of the 10/15-min budget) | ALL pins HOLD byte-exact — see V6 detail |
| V7 | Clone mobile drawer 390×844 | agent-browser, REAL clicks throughout (the V14 law) | ALL superset pins PASS — see V7 detail; NO Tailwind v4 regression |
| V8 | The F-124 ANALYZE | curl + agent-browser against the dev server (§1.3) | every leg CORRECT live; zero production defects |

**V6 detail — sweep #20 (the NINETEENTH→TWENTIETH consecutive hold):** the login
card (backdrop `blur(4px)` · `rgba(255,255,255,0.95)` · 16px radius · h1
30px/700 · inputs 48px · SSO 54px/16px); the F-76 alert re-verified with wrong
credentials ("Invalid email or password" byte-exact on `rgba(254, 242, 242, 0.7)` —
red-50 at 0.7); the `/` landing + the 220px sidebar + the 8 links (/POS
/Dashboard /Inventory /Sales /Registers /Cashiers /Reports /StoreSettings); the
Dashboard date line + both chart h3s at 16px/700 ("Sales — Last 7 days",
"Products by Category"); the Spanish families ("Historial de Ventas" H1,
"Cajeros" H1 + "Turnos Recientes" H3 at 16px/700); Reports STILL empty (2× "No
data for this period" — the demo account remains write-restricted, the with-data
tiers stay the functional superset). The reference's OWN mobile defect is STABLE
at the D-1 shape: document 390, NO hamburger, the static 220px sidebar (display
flex), main crushed to 170px. Reference capture refreshed:
`docs/screenshots/ref-mobile-pos-390-s26.png`.

**V7 detail — the clone's mobile drawer:** the labeled hamburger ("Open
navigation menu") → the dialog at 288px with its 8 labeled links + the labeled
close button → `animation-name: enter` (tw-animate-css) → focus moves to the
close button on open → the body scroll-lock (`overflow: hidden`) → Escape
unmounts the dialog, RESTORES the hamburger's focus, releases the lock →
re-open + a link click navigates (`/Dashboard`) and unmounts the drawer → zero
horizontal overflow at every step (scrollWidth 390 === clientWidth 390).

## 1. Findings

### F-124 — the password-reset happy-path round-trip has ZERO suite protection (this cycle's NEW depth)

**The chain (all verified live in §1.3):** `POST /api/auth/register` (a
throwaway account, 201 + the 6-digit code) → `POST /api/auth/verify-email` (the
account signs in — login gates unverified accounts at 403) → `POST
/api/auth/login` with the ORIGINAL password (200) → the forgot leg (`POST
/api/auth/forgot-password` → `{ ok, resetPath, resetUrl }` carrying a REAL
48-hex one-shot token, TTL 30 min) → the reset PAGE at `resetPath` rendering
the "Set new password" form from the URL token → the submit (`POST
/api/auth/reset-password` → the password write + the token's `usedAt` consumption
in ONE transaction) → the "Password Updated" done state → signing in with the
NEW password (200) while the OLD password is dead (401) → a token REPLAY
rejected (400 "Invalid or expired reset token").

**The evidence of the gap:** `rg "resetPath|resetUrl|PasswordResetToken" tests/`
returns NOTHING — zero references at every tier. `auth.spec.ts` pins the
forgot/reset SURFACES with FABRICATED tokens only (`"a".repeat(48)`,
`"f".repeat(48)` — the form card, the invalid-token alert, the client-side
mismatch, the tokenless dead-end) and the forgot view's STATIC contract (the
card swap, never the submit). A regression anywhere in the REAL chain — the
token generation, the `PasswordResetToken` creation, the one-shot transaction
(the `usedAt` write riding the same transaction as the password write), the
password hash rotation, even the forgot route forgetting to return `resetPath`
— would pass the entire 115-test suite green.

**Why this tier is a functional SUPERSET pin, not a parity pin:** the
reference's reset EMAILS are unreachable (the demo account is write-gated and
the inbox is not observable), so the reference's own success state is
unmeasurable — session_13 documented the reset card's measured chrome and the
clone's done state as the superset. This walk pins the CLONE's complete,
working chain.

**The candidates weighed (the session_45 pointer):** ① the receipt PDF/email
shape — STILL unmeasurable on the write-gated reference (no sale can be created
to reach its receipt email/PDF); a pure-superset FEATURE build (new production
code, a PDF/email dependency, an SMTP story) — deferred again, the strongest
candidate for a dedicated feature cycle; ② the Cashiers shift-ledger with-data
walk — real (the "Turnos Recientes" rows are unpinned with data: the
shift×sales×cashier×register join, the Abierto/Cerrado chips) but ADJACENT to
two pinned journeys (registers-shifts.spec's open/close dialogs, the fiscal
walk's shift closes) — recorded as the next cycle's leading candidate; ③ the
password-reset round-trip — SELECTED: the deepest UNPINNED chain (an AUTH
surface, security-critical: the one-shot token lifecycle + the password hash
rotation), zero suite references at any tier, fully built, fully verifiable
live, and self-contained (guest-tier, no with-data ordering coupling).

### 1.3 The ANALYZE (measured live on the dev server before this plan)

Every leg measured CORRECT — the numbers the spec transcribes:

- `register { name, email, password }` → **201** `{ ok: true, code: "669987" }`
  (the 6-digit code; a re-register of an unverified account re-issues a fresh
  code at 200 — the S25/S26 flow).
- `verify-email { email, code }` → **200** (the account is verified AND signed
  in — verify is the email proof).
- `login` with the original password → **200** (the sanity leg).
- `forgot-password { email }` → **200** `{ ok, resetPath:
  "/reset-password?token=<48-hex>", resetUrl }` — the token is exactly 48 hex
  chars; the URL derives from the REQUEST origin (not `siteUrl()`).
- The reset page at `resetPath` → the "Set new password" form (the labeled
  "New Password" + "Confirm New Password" + the "Reset password" submit + the
  "Back to login" link).
- Submit `NewPass456!` twice → the **done state**: the "Password Updated" h2 +
  "Your password has been updated. Sign in with the new password." + the
  "Back to Login" link + ZERO inputs (the form is gone).
- `login` with the NEW password → **200**; with the OLD password → **401**
  (the old hash is gone — not 403: the account IS verified, so 401 cleanly
  isolates "wrong password").
- A REPLAY of the consumed token (`reset-password` with the same 48-hex) →
  **400** `{"error":"Invalid or expired reset token"}` — the one-shot consumed.
- The forgot view's UI submit shows the generic notice "If that email exists, a
  reset link is on its way. Check your inbox." (no oracle — the reference's
  anti-enumeration posture) — the notice is UNPINNED; the walk pins it.
- **Cleanup verified live:** the ANALYZE fixture (the throwaway user, its
  verification + reset tokens) deleted from the dev db after the probes.

**The ordering analysis (why this is safe):** the two new tests live in
`auth.spec.ts` — the GUEST tier (empty storageState, runs in the chromium
project, sorts before every with-data walk). The throwaway accounts are
**role=owner by the schema default** (register never sets a role), and the
Cashiers roster API filters `role: "cashier"` — so surfaces.spec's
"0 usuarios registrados" empty-roster pin is UNPERTURBED (verified in
`src/lib/server/entities.ts` — the roster lists workers only). The e2e db is
provisioned fresh by global-setup each run, so the fixtures never cross runs.
The rate limiters are per-server-process in-memory (fresh per boot) and
namespaced (`register:ip` 10, `forgot:ip` 10, `login:ip` 10 with SUCCESS
resetting the login bucket) — the two tests consume 2 register + 2 forgot + a
handful of logins, far inside every budget. No settings, products, sales, or
shifts are touched — the four with-data walks (d < f < i < r) are unaffected
by construction.

## 2. The cure — two tests in `tests/e2e/auth.spec.ts` (F-124)

Both tests follow the spec's conventions: `test.use({ storageState: { cookies:
[], origins: [] } })` (the file-level opt-out), the API legs through
`page.request` (the fiscal walk's pattern), the UI legs through the real
locators (the mirrored `getByTestId("login-submit")` / `waitForURL` patterns).

### 2.1 Test A — "the reset round-trip: a real one-shot token changes the password end-to-end"

1. **Fixture (API):** register `reset.walk.a@veloxpos.test` / `OldWalkPass1!`
   (assert 201 + capture the 6-digit `code`) → verify-email (assert 200) →
   login with the original password (assert 200 — the account works).
2. **The forgot view's submit (UI):** `/login` → "Forgot password?" → fill the
   email → "Send reset link" → the notice "If that email exists, a reset link
   is on its way. Check your inbox." (the anti-enumeration copy, pinned).
3. **The token (API):** `forgot-password` → 200 + `resetPath` matching
   `/^\/reset-password\?token=[0-9a-f]{48}$/` (the 48-hex format pinned).
4. **The reset page (UI):** goto `resetPath` → "Set new password" visible (the
   REAL token renders the form) → fill "New Password" + "Confirm New Password"
   with `NewWalkPass2!` → "Reset password" → the done state: the "Password
   Updated" h2 + the note + the "Back to Login" link + ZERO inputs.
5. **The landing (UI):** "Back to Login" → login with the NEW password →
   `waitForURL(pathname === "/")` + the "No active shift" shift-gate heading +
   the disabled CHARGE button (test 88's mirrored assertions) — the password
   ACTUALLY changed, proven through the real UI.

### 2.2 Test B — "the one-shot semantics: the consumed token rejects replays and the old password is dead"

1. **Fixture (API):** a second throwaway (`reset.walk.b@veloxpos.test`) —
   register → verify (the same helper, idempotent by email).
2. **The completion (API):** `forgot-password` → capture the token →
   `reset-password { token, password: "ReplayDead3!" }` → 200 `{ ok: true }`.
3. **The replay (API):** the SAME token again with a third password → 400 +
   the exact copy "Invalid or expired reset token" (the one-shot `usedAt`
   consumption, pinned).
4. **The old password (API):** `login` with the ORIGINAL password → 401 (the
   old hash is gone).
5. **The new password (API):** `login` with `ReplayDead3!` → 200 (the rotation
   completed).

### 2.3 Counts

E2E **115 → 117** (desktop **101 → 103**; mobile 13 + setup 1 unmoved) · spec
files stay **12** (both tests land in `auth.spec.ts`) · unit stays **151/15**.

## 3. Execution order

1. Write the two tests (red-first not applicable — this is a CHARACTERIZATION
   tier: the ANALYZE measured every leg green, so the first run must PASS; the
   F-122/F-123 pattern).
2. `bun run lint` + `bun run typecheck` (the spec must clear both).
3. `bun run build` then the two tests alone (`--grep`), then the full suite ×2
   consecutive (115+2 = 117 expected both runs).
4. The count lockstep in the SAME commit: `docs-counts.test.ts` (E2E 117,
   the "Session-25 lock" → "Session-26 lock" literal, the "103 desktop"
   breakdown) + README (badge/scripts/testing + the walk paragraph) + CLAUDE
   (the baseline + the guest-tier note) + AGENTS (the Session-26 reset
   contracts section) + PAD v1.24 (the scale line + the spec map + the
   revision block) + SKILL v2.22.0 (the version + the baselines + the
   addendum).
5. The s26 evidence script (`scripts/capture-s26-evidence.mjs`): screenshots
   114–116 — the reset form with a REAL token, the "Password Updated" done
   state, and this cycle's mobile drawer capture at 390 — self-provisioning,
   self-cleaning, captures verified DISTINCT before commit.
6. The full gate: lint → tsc → unit → build → smoke → e2e ×2 → the three
   with-data harnesses (s16 13/13 · s17 19/19 · s18 20/20).
7. `.env.example` verify · worklog entry · session_47.md narration · commit ·
   the SSH-wrapper push (dry-run → fingerprint → push → dual verify → shred).

## 4. Execution record (filled in as the cycle runs)

- **The two F-124 tests appended to `auth.spec.ts`** (the Session-26 block after
  the Session-13 tokenless dead-end pin, with the `provisionResetAccount` helper
  — idempotent per email across the register route's three states). Lint 0 ·
  tsc clean. **First run against the standing artifact: BOTH PASS** — the
  characterization posture (the ANALYZE measured every leg green; the
  F-122/F-123 pattern), 3 passed in 9.1s.
- **The count lockstep executed in the same commit**: docs-counts.test.ts (E2E
  117, the "Session-25 lock" → "Session-26 lock" literal, the "103 desktop"
  breakdown, the F-124 provenance comment) + README (badge/scripts/testing +
  the Session-26 paragraph) + CLAUDE (baseline 117 + the guest-tier note with
  the role=owner/roster-filter reasoning) + AGENTS (the Session-26
  reset-round-trip contracts: the real-token-chain law, the one-shot
  transaction law, the isolated-request-fixture law, the register-role law) +
  PAD **v1.24** (scale line + the E2E tier + the spec map's auth entry + the
  revision block) + SKILL **v2.22.0** (version + header baselines + commands +
  the testing tier + the Session-26 addendum). UNIT stays 151/15.
- **A DOCS-COUNTS NEGATIVE RE-SCOPED**: the first unit run failed the scoped
  negatives — the historical ban on `"117/117"` (the retired UNIT count from
  Sessions 6-7) collided with the now-live e2e 117/117 (the same for the
  `"(117)"` commands form). The bans are now UNIT-scoped (`"unit **117/117**"`,
  `"tests/unit/** (117)"`) — the retired unit claims stay banned, the live e2e
  forms pass. The intent preserved, the letter corrected.
- **A GATE-TIME FINDING, CURED IN THE SAME CYCLE — the s18 harness's
  money() unit bug (the hour-drift class, again)**: on this cycle's FRESH
  demo.db (seeded ~23:09 — an EVENING seed, where the demo seed's
  now−12/10/8 h "today" sales land INSIDE today; every prior cycle's db was
  either morning-seeded — the same sales land YESTERDAY, the today bucket
  EMPTY — or warm since Session-22), s18 failed 19/20: the today-pair check
  expected `$0.37` while the page rendered `$36.54` (the count 3/3 agreeing).
  The forensics (the raw truth query replicated standalone — it derives the
  CORRECT $36.54/3) isolated the defect to the check's FORMATTER:
  `money(cents)` divides by 100, but `truth.today.sum` sums the Sale.total
  column — DOLLARS. `money(36.54)` → "$0.37". The bug was invisible in every
  prior green run because the today bucket was empty (`money(0)` = "$0.00" =
  the page's "$0.00") — the Session-25 hour-drift genus (a latent harness
  defect that only a fresh-seed hour change exposes), striking the TODAY
  bucket this time instead of the 7-day window. **The cure (test-tier)**:
  money() now formats dollars (`$${dollars.toFixed(2)}`) with the provenance
  comment. s18 re-ran GREEN: **20/20** (s16 13/13 · s17 19/19 — unaffected;
  neither shares a money formatter).
- **The evidence tier's own debugging record**: the s26 evidence script's API
  legs first rode `page.request` — and crashed in playwright-core's
  `_parseSetCookieHeader` (`"/api/auth/login" cannot be parsed as a URL`) the
  moment a cookie-setting endpoint answered. The same legs passed in the e2e
  suite (117/117 twice) because the SUITE runs under the node-based playwright
  runner while the harness family runs under BUN — a runtime-specific quirk in
  playwright-core's APIRequestContext under bun. The cure: the API legs ride
  bun's NATIVE fetch (they need only status codes + JSON bodies — no cookie
  jar); the self-clean's PrismaClient takes the ABSOLUTE datasource URL (the
  documented relative-URL quirk). Both laws recorded in the script's header.
- **FULL GATE on the final tree: GREEN** — lint 0 errors (1 documented
  warning) · tsc clean · unit **151/151** (15 files) · build green · smoke
  **13/13** · e2e **117/117 × 2 consecutive full runs** (103 desktop + 13
  mobile + 1 setup) · the three with-data harnesses **s16 13/13 · s17 19/19 ·
  s18 20/20** (the older harness captures restored — content-identical, only
  this cycle's captures commit).
- **The post-run db state verified (state, not exit codes)**: the settings at
  seed defaults (storeName "My Store" · hideFiscalOnReceipt true · fiscalRuc
  ""), zero open shifts, both throwaway accounts present + verified, 2 reset
  tokens consumed + 1 open (Test A's UI-submit forgot call — correctly never
  consumed; 3 created = 2 API legs + the UI submit).
- **Evidence: screenshots 114–116** captured from the remediated dev server
  via the committed `scripts/capture-s26-evidence.mjs` — 114 the reset form
  rendering from a REAL 48-hex token (2 inputs, the measured gray-50 canvas),
  115 the "Password Updated" done state (zero inputs, the Back to Login
  link), 116 the mobile drawer at 390 (288px, zero overflow — the operator's
  priority surface). The captures verified DISTINCT before commit. Plus the
  D-1-shape reference capture (`ref-mobile-pos-390-s26.png`).
- **`.env.example` verified** against the working `.env` (key-for-key aligned;
  the working `.env` carries its 64-hex AUTH_SECRET + COOKIE_SECURE=false for
  the local dev story).

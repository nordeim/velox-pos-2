# VeloxPOS Remediation Plan — Session-8

**Date:** 2026-10-26 (Session-8 work cycle)
**Scope:** the standing audit→remediate→push cycle on the Session-7 tree (HEAD `16d4736`
= `025ec11` + the operator's `docs/session_10.md` transcript commit). A full
received-tree gate re-verification, a live reference re-measurement at every
previously-pinned depth (the "reference DRIFTS" law), a static Tailwind-v4 trap sweep,
a workflow-route correctness audit, an artifact-hygiene audit (the neo-crm F-170a
genus, never swept here), and a testing-tier audit against the family skill §14.
**Method:** skills/web-application (§12 v4 traps, §14 testing tiers, §15 gate, §16
security, §20 pre-ship), skills/agent-browser (live computed-style measurement),
skills/tdd (red → green), skills/clone-app-pat-pro (computed styles as ground truth),
the neo-crm repo as the family-pattern source (`tests/docs-counts.test.ts`,
`scripts/smoke-test.sh`, the next.config tracing-excludes cure).

---

## 0. Verification ledger (what was checked, how, result)

| # | Check | How | Result |
|---|---|---|---|
| V1 | Fast gate on the received tree | `lint → typecheck → test` | lint 0 errors (1 documented warning) · tsc clean · **unit 123/123** (12 files) — the documented baseline holds |
| V2 | Build on the received tree | `bun run build` (foreground) | green; standalone + static assembly completed, all routes compiled |
| V3 | E2E on the received tree | `bun run test:e2e` (full suite, both projects) | **78/78** — the Session-7 baseline holds on the received tree (the F-51-hardened pins included) |
| V4 | Reference: sidebar nav (the Session-6 drift site) | agent-browser computed styles @1440×900 | ✅ all pins hold: aside 220px, nav `16px 8px`, items `10px 12px` padding-driven 40px inactive / 42px active, weight 500 / 14px, active `rgb(196,181,253)` + border `rgba(139,92,246,0.3)` + radius 12px + violet shadow, inactive `rgba(255,255,255,0.4)` no border, icons 16px, Reports glyph `lucide-file-chart-column-increasing`, wordmark 14px/700/`rgba(255,255,255,0.9)`/0.35px tracking |
| V5 | Reference: Settings (the Session-4 drift site) | computed + label census | ✅ H1 "Store Settings" 24px; fiscal labels "Tax ID / EIN"/"Tax Regime"/"Fiscal Address"/"CFDI Use (default)"; 6 section h3s @ 16px/700; Save Changes 54px (`14px 24px`, 16px/500, 12px radius); the header Add chip 34px (`6px 12px`, 14px) |
| V6 | Reference: Inventory | computed | ✅ the "All" chip 36px (`8px 16px`, 12px/600, 12px radius, the violet→indigo 135° gradient); New Product 42px (`10px 16px`); H1 24px |
| V7 | Reference: Reports | computed | ✅ section h2s 14px uppercase `rgba(255,255,255,0.6)`; the "7 days" pill 32px (`8px 16px`, 12px/700); container `rgba(28,31,52,0.85)` + 16px radius + 4px pad + white/7 1px border |
| V8 | Reference: Dashboard + POS gate + copy | computed + text census | ✅ Title Case stats ("Today's Sales"/"Transactions"/"Products"/"Low Stock"); the chart x axis = weekday abbreviations (Tue..Mon) + 0..4 nice ticks; the POS gate card p-8 (32px), Monitor `rgba(167,139,250,0.3)` 64px mb-16px stroke-2, paragraph white/35, "Registers" `<strong>` white/60/700/no-underline; CHARGE 70px/20px/900/`20px 32px`; Sales = "Historial de Ventas" + "Buscar por ticket, cliente o cajero..."; Cashiers = "Cajeros"; Registers H1 "Cash Registers" 24px |
| V9 | Reference: mobile state @390×844 | `set viewport` + geometry | ✅ the reference's OWN defect confirmed still present: the 220px z-50 sidebar overlays content (main margin-left 0), NO hamburger — the clone's drawer-superset posture remains the correct answer |
| V10 | Reference: login surface | cookies cleared → `/login` → computed | ✅ inputs 48px `rgba(248,250,252,0.5)` bg + `rgb(226,232,240)` border + 12px radius + pl-40px; the 4px top strip `slate-200→300→200`; logo 96px img; SSO 54px (`14px 20px`, 16px); Sign in weight 500 |
| V11 | Static Tailwind-v4 trap sweep | `rg` across `src/app/*.css` + components | ✅ no `@layer utilities` custom classes; `@theme inline` in place; `@custom-variant hover (&:hover)` present; `tw-animate-css` imported; NO `tailwind.config.*`; no `space-y-*` in the nav chrome |
| V12 | Session-7 change audit | `git show 025ec11` review (the two expect.poll hardenings in mobile-navigation.spec.ts) | ✅ surgical, matches the F-51 contract; no product code touched |
| V13 | Workflow-route audit | read `sales/route.ts`, `shifts/*`, `sales/[id]`, `health` | ⚠️ **F-55**: the sales POST's own comment claims "Ticket allocation + the active shift … both resolved inside the transaction that decrements stock and writes the sale" — but `db.sale.count` + `cashierShift.findFirst` execute OUTSIDE the `$transaction` (comment/code mismatch + a wider ticket-allocation race window than documented). Shifts open/close + refund-flip routes: clean (ownership verified, server-side variance, one-active-shift rule enforced) |
| V14 | Artifact-hygiene audit (the neo-crm F-170a genus) | `ls -R .next/standalone` + content read | ⚠️ **F-54**: the standalone artifact ships **`.env` (the live AUTH_SECRET)** and **`db/custom.db` (the 180KB dev database — user rows with scrypt password hashes)**. No `outputFileTracingExcludes` in next.config.ts; no post-build `.env` removal (Next's writeStandaloneDirectory copies `.env` explicitly — immune to excludes; the family cure is the build-script `rm -f`) |
| V15 | Testing-tier audit vs family skill §14 | inventory + doc-census | ⚠️ **F-52** (SKILL live-tense count sites re-staled: §3 Commands says unit `(117)`/playwright `(55)`, §12 says `117/117` + `68/68` — live: 123/78. The neo-crm F-99a1 genus: headline sites ride the per-session re-anchor, secondary sites silently re-stale. ROOT CAUSE: no docs-counts unit gate) and ⚠️ **F-53** (no tier-3 API smoke script for the POS domain — `scripts/` holds only Omni-Study-era archives; §14 tier 3 + §15 both list `./scripts/smoke-test.sh` as a gate component). Live censuses: unit 123 its / 12 files; e2e 77 spec tests + 1 setup = 78 |
| V16 | Tree hygiene | `git status` + .gitignore review | ✅ clean; `db/*.db` covers the planned `db/smoke.db` scratch file; no stray artifacts |

**Baseline verdict:** the Session-7 tree is green end-to-end and the reference has NOT
drifted (the second consecutive drift-free cycle — the parity surface is stable). The
cycle's findings are all CODEBASE-side: two documentation-integrity defects (F-52's
stale counts; F-55's contradicting comment), one security/hygiene gap (F-54's artifact
contents), and one gate gap (F-53's missing tier-3 smoke). The received-state
understanding (worklog + session_9/10 + remediation-plan-session-7) validated against
the codebase: consistent.

---

## 1. Findings (ordered by severity)

| ID | Sev | Location | Finding | Evidence | Fix |
|----|-----|----------|---------|----------|-----|
| F-52 | **HIGH** (docs integrity — the count-lockstep law violated at 4 live sites) | `velox-pos_SKILL.md` :69 (unit `(117)`), :70 (playwright `(55)`), :333 (`117/117, 12 files`), :334 (`68/68`) | The SKILL's live-tense count sites re-staled across Sessions 6–7 (the unit suite grew 117→123 in Session-6's niceTicks pass; e2e grew 55→68 (S-5)→78 (S-6)). The README/CLAUDE/PAD headline sites were re-anchored each session, but the SKILL's Commands §3 + Testing §12 sites were not — exactly the neo-crm F-99a1/F-102a2 genus (twice-caught there). **PLUS the PAD's scale line (:29–30)**: "7 Prisma models · 22 API route files" — the live census is **9 models** (the Session-101 count skipped the two auth-support models, VerificationToken + PasswordResetToken) and **26 route files**. ROOT CAUSE: the repo has NO docs-counts unit gate, so nothing fails when a count site stales. | V15 (grep census + live `it(`/`test(`/model/route/view counts) | (1) Correct the four SKILL sites + the PAD scale line to the live counts. (2) **Adopt the family mechanism** (web-application §14: "the proven mechanism is neo-crm's tests/docs-counts.test.ts, which puts every live-tense count site under the unit gate"): a new `tests/unit/docs-counts.test.ts` that (a) LIVE-censuses the test tree (its own included — re-anchoring the constants) AND the source tree (route files, Prisma models, views — the neo-crm F-165e live-census pattern), (b) pins every live-tense doc site to the constants, (c) bans the retired stale forms at the live-tense sections (scoped, never bare-number bans — history blocks keep their historical numbers per the F-100a2 scope doctrine). |
| F-53 | **MEDIUM** (gate gap — tier 3 of the testing doctrine missing) | `scripts/` (no POS-domain smoke), `package.json` (no smoke/gate scripts) | The family skill §14 defines three tiers; §15's gate lists `./scripts/smoke-test.sh`. The repo's tier 3 does not exist for the POS domain (`scripts/` = Omni-Study-era archives only). The API surface (health, the 401 wall, the Zod seam, CRUD round-trips, logout teardown, the rate limiter, the boot guard) is covered only indirectly by e2e UI journeys — no direct API-level ladder exists. | V15 | Write `scripts/smoke-test.sh` (the neo-crm form adapted): boots the STANDALONE artifact on :3210 with its own `db/smoke.db` + a throwaway AUTH_SECRET, then walks the 13-step assertion ladder (see T-4). Every step ok/FAIL with a loud exit; the trap kills the server on any exit; the script counts executed vs passed. Add `smoke` + `gate` scripts to package.json (the §15 one-command gate). |
| F-54 | **HIGH** (security/hygiene — secrets + user rows inside the deployable artifact) | `next.config.ts` (no excludes), `package.json` build script, `.next/standalone/` | The standalone build ships `.env` (the live `AUTH_SECRET` value — verified by reading the artifact copy) and `db/custom.db` (the dev SQLite: user rows with scrypt password hashes, sales data). A standalone artifact is the DEPLOYABLE unit (Docker COPY / zip-and-ship) — it must not carry the dev secret + dev database. The neo-crm F-170a genus, cured there in their session-170 and policed by their smoke step 14 ever since. | V14 (ls + read of the artifact) | (1) `outputFileTracingExcludes` in next.config.ts for the repo-root entries the server never needs at runtime (`.env*`, `.git/**`, `db/**`, `skills/**`, `docs/**`, `tests/**`, `scripts/**`, `test-results/**`, the doc .md files, the config/tooling files). `prisma/schema.prisma` STAYS traced (the db-path anchor — verified load-bearing). (2) The build script gains `&& rm -f .next/standalone/.env` (Next's writeStandaloneDirectory copies .env explicitly — immune to excludes; the double-cure). (3) The smoke ladder's artifact-hygiene leg polices it on every run (F-53's step 13). |
| F-55 | **LOW** (code integrity — comment/code mismatch + race window) | `src/app/api/sales/route.ts:83-92` | The route's comment says the ticket allocation + active-shift lookup are "resolved inside the transaction that decrements stock and writes the sale" — both reads actually execute BEFORE the `$transaction`. Under two concurrent checkouts both would read the same `sale.count` and allocate the same ticket number. Narrow, single-user SQLite POS in practice, but the code should match its own documented contract. | V13 | Move `db.sale.count` + `cashierShift.findFirst` INSIDE the `$transaction` callback (the reads join the decrement+create unit; the comment becomes true; the window narrows to the transaction). Behavior in the happy path unchanged — protected by the existing terminal e2e pins (the checkout journey + the Session-6 data-state pin drive real checkouts). |

**Explicitly NOT findings (verified — do not "fix"):**
- `console.error("[health] …")` — the bash ``-eating display artifact read `ealth]`; the
  Read tool shows the file is clean (`[health]` intact). The documented hex-dump
  discipline applied.
- `z-ai-web-dev-sdk` in dependencies — USED (`src/lib/server/ai.ts`).
- The Docker path — `.dockerignore` already excludes `db/`, `docs/`, `skills/` (the
  image rebuilds inside the container); F-54's exposure is the HOST-built
  `.next/standalone` artifact.
- The refund-does-not-restock behavior, the in-memory rate limiter, the global cashier
  scope — all documented PAD known-issues rows (the register stays swept and honest).
- The reference's surfaces — NO drift this cycle (V4–V10 all hold). No parity work needed.
- The clone's supersets (drawer a11y, readable heading colors, CSV import/export,
  working hrefs) — the documented superset posture.

---

## 2. The ToDo list (execution order, TDD where behavioral)

- [x] **T-1** (RED, F-52) Write `tests/unit/docs-counts.test.ts` FIRST with the
       current-live constants (UNIT=123+own-its, FILES=12+1, E2E=78, E2E_SPECS=7):
       the live-census its (count `it(`/`test(` across the tree) PASS, but the
       doc-site pins FAIL against the four stale SKILL sites — a genuine red that
       proves the gate catches the genus.
- [x] **T-2** (GREEN, F-52) Fix the four SKILL sites (123 / 78 / 123/123 / 78/78
       forms) + re-anchor EVERY live-tense count site to the new totals in the same
       lockstep commit (README badges + rows, CLAUDE, AGENTS seam-registry line,
       PAD). All docs-counts its green.
- [x] **T-3** (F-54) `next.config.ts` gains `outputFileTracingExcludes` (the
       repo-root entries; `prisma/**` NOT excluded — the db-path anchor) +
       `package.json` build script gains `&& rm -f .next/standalone/.env`. Rebuild
       and verify the artifact: no `.env`, no `db/`, `prisma/schema.prisma` present,
       `public/` present, server.js boots.
- [x] **T-4** (F-53) Write `scripts/smoke-test.sh` — the 13-step ladder: 01 health
       200 `{"status":"ok"}` · 02 unauthed `/api/products` 401 · 03 `/login` renders
       the SSR shell · 04 the seeded owner login → the `sf_session` cookie · 05
       sessioned `GET /api/products` 200 · 06 an invalid category POST → 400 (the
       Zod seam) · 07 a valid category POST → 201 · 08 DELETE the category → 200 ·
       09 logout → `/api/auth/me` 401 · 10 the login rate-limit probe → 429 (LAST:
       it exhausts the bucket) · 11 sitemap.xml + robots.txt 200 · 12 the boot-gate
       probe (a second boot WITHOUT AUTH_SECRET refuses — the log carries the
       fatal message) · 13 the ARTIFACT-HYGIENE assertions (no `.env`/`db/`/
       `skills/`/`docs/`/`tests/` inside `.next/standalone` — polices F-54 forever).
       Add `smoke` + `gate` scripts to package.json. Run it GREEN.
- [x] **T-5** (F-55) Move the ticket-count + active-shift reads inside the sales
       `$transaction` (comment/code integrity; the narrowed window). The existing
       e2e checkout pins are the protection — re-run them green.
- [x] **T-6** Full gate re-run: `lint → typecheck → test (new count) → build →
       test:e2e (78)` + `./scripts/smoke-test.sh` — all green, no prior pin
       weakened.
- [x] **T-7** Live re-verification with agent-browser against the rebuilt standalone
       + fresh screenshots (the Session-8 set) into `docs/screenshots/` + a VLM
       spot-check (the trap-16 discipline: settle-wait animated surfaces).
- [x] **T-8** Docs lockstep: README (counts + the smoke/gate rows), AGENTS.md (the
       smoke tier + the gate commands + the artifact-hygiene law), CLAUDE.md (the
       same + the new baselines), PAD (v1.6 revision block + ADR-012 the
       artifact-hygiene decision), velox-pos_SKILL.md (v2.4.0 — the corrected
       counts + the new gates/traps + the Session-8 addendum), `.env.example`
       re-verified, worklog.md Session-8 entry, `docs/session_11.md` narration.
- [x] **T-9** Commit + push via the SSH wrapper (main only; key shredded after).

---

## 3. Execution record

**RED (T-1):** `tests/unit/docs-counts.test.ts` written first with the live constants
(UNIT=133 = the 123 baseline + its own 10 its; FILES=13; E2E=78; E2E_SPECS=7;
ROUTES=26; MODELS=9; VIEWS=8). The 4 live-census its PASSED immediately (the constants
match reality); the 7 doc-site its FAILED against the stale docs — the genuine red
proving the gate catches the F-52 genus.

**GREEN (T-2):** 17 stale sites corrected — the SKILL's 4 (the header baselines line
re-labeled "Session-8 lock: 133/133 (13 files) · 78/78 (64 desktop + 13 mobile + 1
setup)", the Commands §3 pair, the §12 tier pair, the 9-models diagram + heading), the
README's 6 (the badge, the commands row, the quick-start line, the architecture-table
ORM row, the directory-map prisma + tests lines), CLAUDE's 1, AGENTS's 1 (reworded to
"the seam registry + the docs-counts lockstep gate"), the PAD's 7 (the scale line
9/26/8 + 133/13/78, the ORM row, both diagrams, the file tree's prisma/tests/unit/
tests/e2e lines, the doctrine baseline), the data-model listings' auth-support pair
(the SKILL + the PAD invariants note), and vitest.config.ts's header. **The gate's
maiden run caught 3 MORE README sites the manual sweep missed** (the architecture
table + the directory map) — the negatives working as designed. A second self-catch:
the scoped negatives flagged the v1.6 revision block QUOTING the retired forms — the
bans re-scoped to the live-tense parts (padLive/skillLive slices; the F-100a2
history-record doctrine now encoded in the test's comments).

**F-54 (T-3):** `outputFileTracingExcludes` (30 entries) + the build script's
`rm -f .next/standalone/.env`. Rebuilt artifact verified: no `.env`, no `db/`, no
skills/docs/tests; `prisma/schema.prisma` present (the db-path anchor); `public/`
present.

**F-53 (T-4):** `scripts/smoke-test.sh` — 13 steps, each ok/FAIL with a loud exit;
FRESH `db/smoke.db` each run (a leftover probe row from an aborted run must never
poison the ladder); the rate-limit probe LAST (it exhausts the login bucket); counts
executed vs passed. Two instrument bugs found BY the ladder and fixed: the "invalid"
payload (`{"name":"x"}`) that was actually valid (boundedText's min is 1 — replaced
with a 201-char name), and a double-POST in the create step (the second identical
POST hit the category unique constraint — replaced with a single `-w '%{http_code}'`
request). Final: **13/13**.

**F-55 (T-5):** the ticket-count + active-shift reads moved inside the
`$transaction` (with the expanded comment recording why). Verified live: the
checkout journey allocated T-000035 through the real UI.

**Final gate (T-6):** lint ✓ (0 errors, 1 documented warning) · tsc ✓ · unit
**133/133** (13 files) · build ✓ (hygiene-clean) · e2e **78/78** · smoke **13/13**.

**Live evidence (T-7):** `scripts/capture-s8-evidence.mjs` **8/8** — the login
round-trip on the CLEANED artifact, the F-55 checkout journey (shift → cart → cash
charge → ticket T-000035 → the ledger row), the shift closed tidy, the mobile drawer
contract (dialog, 8 links, no overflow at 390). VLM sweep **6/6** on screenshots
37–42.

**Docs lockstep (T-8):** README/AGENTS/CLAUDE/PAD v1.6 (+ ADR-012)/SKILL v2.4.0/
vitest.config.ts/.env.example (re-verified)/worklog/session_11.md — all in the same
commit. **T-9:** committed + pushed via the SSH wrapper.

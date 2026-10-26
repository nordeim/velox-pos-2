# Session-11 log — the docs-counts lockstep + the artifact-hygiene pass (narrating the Session-8 work cycle)

*(The narration files run one ahead of the work-session numbering: session_9.md narrated
the Session-7 work; session_10.md holds that session's raw transcript; this file
narrates the Session-8 work cycle.)*

1. Workspace refresh: the local tree was intact (bun, deps, Playwright chromium 1243,
   the demo db all present) and clean; the pull brought in exactly one commit —
   `16d4736` (`docs/session_10.md`, the raw transcript of the Session-7 conversation,
   committed by the operator). Core docs re-read (AGENTS/CLAUDE/PAD/velox-pos_SKILL,
   session_9.md, remediation-plan-session-7.md, worklog.md, session_10.md): the
   Session-7 tree confirmed as the received state; this cycle = the repo's "Session-8"
   audit→remediate→push pass.
2. Skills loaded for the audit: web-application SKILL.md (§12 v4 traps, §14 the
   three-tier testing doctrine, §15 the gate, §16 security, §20 pre-ship), tdd,
   clone-app-pat-pro (computed styles as ground truth), agent-browser. The neo-crm repo
   cloned fresh as the family-pattern source (its docs-counts.test.ts, smoke-test.sh,
   and the next.config tracing-excludes cure — all referenced by the web-application
   skill as proven family mechanisms).
3. **The received-tree gate: GREEN on first run** — lint 0 errors (1 documented
   warning) · tsc clean · unit 123/123 · build green · e2e **78/78**. The documented
   baseline held (Session-7 opened with a red pin; this cycle opened clean).
4. The full reference re-measurement (agent-browser, computed styles, logged in with
   the operator's credentials): **NO drift for the second consecutive cycle** — every
   Session-4/5/6 pin re-measured byte-exact (the sidebar chrome, the Settings fiscal
   card + section headers + Save 54px + the Add chip, the Inventory chips, the Reports
   pills + container, the Dashboard stats + weekday axes, the POS gate + CHARGE, the
   Spanish copy, the login internals, the mobile defect at 390×844 — the reference's
   own 220px z-50 overlay with no hamburger, still unfixed on their side). With the
   parity surface stable, the audit went where the family skill pointed: the codebase's
   OWN engineering hygiene.
5. The audit found four findings (the full ledger is
   `docs/remediation-plan-session-8.md`):
   - **F-52**: the SKILL's live-tense count sites re-staled (117/55/68/68 vs the live
     123/78) — and the census swept wider: the PAD's scale line said 7 models · 22
     routes against a live 9 · 26 (the two auth-support models were never counted), its
     file tree said 8 spec files vs a live 7, the README's architecture table said
     7 models, and vitest.config.ts's header said 12 files vs a live 13. Root cause:
     NO docs-counts gate — the count-lockstep law was a convention, not a mechanism.
   - **F-53**: tier 3 of the testing doctrine (§14's API smoke ladder) did not exist
     for the POS domain — `scripts/` held only Omni-Study-era archives.
   - **F-54**: the standalone artifact shipped `.env` (the LIVE AUTH_SECRET) +
     `db/custom.db` (the dev database with scrypt password hashes) inside
     `.next/standalone/` on every build — the neo-crm F-170a genus, never swept here.
   - **F-55**: the sales checkout's ticket-count + active-shift reads ran OUTSIDE the
     `$transaction` while the route's comment claimed inside — a comment/code mismatch
     + a ticket-allocation race window.
   Explicitly NOT findings (the discipline list): the health route's "[health]" prefix
   (the bash display artifact — the Read tool proved the file clean),
   `z-ai-web-dev-sdk` (used by ai.ts), the Docker path (already hygiene-clean via
   .dockerignore), and the v4-trap sweep (all mitigated).
6. The remediation plan written + validated against the codebase (every finding's
   surfaces re-checked: the makeItemRoutes DELETE shape, the rate limiter's 10-then-429
   semantics, the boot-guard message, the e2e webServer's env passing, the seed's
   db-path resolution, the smoke-db gitignore coverage).
7. **TDD execution — RED before GREEN**: `tests/unit/docs-counts.test.ts` written
   FIRST with the live constants (the census its passed; the doc-site pins FAILED
   against the stale docs — the genuine red). GREEN: 17 stale sites corrected across
   the SKILL/README/CLAUDE/AGENTS/PAD/vitest.config.ts. The gate's maiden run then
   caught 3 MORE README sites the manual sweep had missed (the negatives doing their
   job), and the scoped negatives later caught the v1.6 revision block legitimately
   QUOTING the retired forms — forcing the proper live-part scoping (the F-100a2
   history-record doctrine, now encoded in the test's own comments).
8. **F-54 cured** (the double-cure): `outputFileTracingExcludes` in next.config.ts +
   the build script's `rm -f .next/standalone/.env`. The rebuilt artifact verified:
   no `.env`, no `db/`, `prisma/schema.prisma` present (the db-path anchor), `public/`
   present. **F-53 built**: `scripts/smoke-test.sh` — the 13-step ladder, run to
   **13/13** (after two script-bug fixes found by the ladder itself: the "invalid"
   payload that was actually valid, and a double-POST in the create step that tripped
   the unique constraint — the ladder debugging its own instrument).
   `bun run smoke` + `bun run gate` added to package.json. **F-55 fixed**: both reads
   moved inside the transaction.
9. **FINAL GATE GREEN: lint 0 errors (1 documented warning) · tsc clean · unit
   133/133 (13 files) · build green (hygiene-clean) · e2e 78/78 · smoke 13/13** —
   no prior pin weakened.
10. Live re-verification on the cleaned standalone (`scripts/capture-s8-evidence.mjs`,
    the script owns the server lifecycle): **8/8** — the login round-trip (the
    artifact-hygiene cure broke nothing), the F-55 checkout journey through the real
    UI (open shift → cart → cash charge → ticket **T-000035** → the ledger row), the
    shift closed tidy, and the mobile drawer contract at 390×844 (dialog, 8 labeled
    links, no horizontal overflow — the user's called-out mobile-nav surface).
11. The VLM sweep of the six fresh screenshots (37–42): **6/6 PASS** — the drawer
    fully slid in (the settle-wait discipline), the terminal cart, the receipt, the
    Spanish ledger, the dashboard chart at data scale, and the inventory view all
    render clean on the cleaned artifact.
12. Docs lockstep in the same commit: README (counts + smoke/gate rows + the 9-models
    sites), AGENTS.md (the renumbered invariants + the docs-counts law + the smoke
    tier + the artifact-hygiene law), CLAUDE.md (the same), PAD v1.6 (ADR-012 + the
    corrected scale line + the gate line now including smoke),
    velox-pos_SKILL.md v2.4.0 (the corrected counts + the smoke/gate commands + the
    Session-8 addendum), vitest.config.ts's header, .env.example re-verified (all
    four vars covered), the remediation plan's execution record, the worklog entry,
    and this narration.
13. Commit + push via the SSH wrapper (main only; the key deployed outside the repo,
    validated, used, and shredded per the runbook).

**The Session-8 lessons, codified:** (a) the count-lockstep law only works as a
MECHANISM — the convention re-staled the docs within two sessions of its invention,
and the gate's own maiden run out-performed the manual sweep; (b) audit the ARTIFACT,
not just the source tree — the tracer's output is a shipping surface, and it was
carrying the dev secret + dev database invisible to every prior gate; (c) a smoke
ladder that counts executed-vs-passed debugs its own instrument (both of its bugs were
its own assertions, not product defects); (d) scoped negatives must anticipate history
QUOTING the retired forms — the ban is on the live-tense sites, never the record.

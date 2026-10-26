# CLAUDE.md — VeloxPOS

Guidance for Claude (and Claude Code) sessions in this repository. The full
engineering contract lives in `AGENTS.md` — read it first; this file adds
Claude-specific orientation and the documentation chain.

## Session boot sequence

1. Read `AGENTS.md` (commands, Tailwind v4 traps, money contract, seams).
2. Skim `worklog.md`'s latest entry — what the last session changed and what
   it deliberately left broken or deferred.
3. For visual questions, the evidence is `docs/veloxpos-implementation-plan.md`
   §0 (measured findings F1–F21) + `docs/screenshots/`.
4. Check `git status` before assuming a clean tree; `.env` and `db/` are
   local-only (gitignored) — recreate with `cp .env.example .env` +
   `bun run db:push && bun run db:seed`.

## The one-paragraph product brief

VeloxPOS is a self-hosted point of sale cloning `veloxposen.base44.app`
(dark theme, 8 views: Terminal / Dashboard / Inventory / Sales / Registers /
Cashiers / Reports / Settings) as a functional superset: the reference's
write flows and its Settings page are broken — ours work; the reference has
no mobile navigation — ours ships a compliant drawer. Visual parity is the
goal; the measured tokens and the Spanish/English copy mix are intentional.

## Verification gate (non-negotiable before commits/pushes)

```bash
bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e
```

Current status at last session: 65 unit + 44 e2e green. `test:e2e` runs the
PRODUCTION standalone server — rebuild after any src change or you verify
stale code.

## Debugging playbook (the things that actually happened here)

- **A view renders but data is missing** → check the view's async-IIFE load
  effect; state must be set after await boundaries (lint enforces it), and a
  401 must `window.location.replace("/login")`.
- **Product create 500s** → the dollar→cents mapping lives in
  `mapProductData` (src/lib/server/entities.ts); the Zod schema outputs
  `price`/`cost` in cents, the columns are `priceCents`/`costCents`.
- **A dialog "Create" does nothing** → the schema rejected the payload; the
  toast carries the Zod message. Check `src/lib/validation.ts` first.
- **Styles look wrong in dark mode** → there IS no light mode; tokens are in
  `globals.css` `@theme` + the `:root` CSS vars. The dark-on-dark page
  titles (slate-700) are reference parity — do not "fix" them.
- **Mobile nav behaves oddly** → the drawer contract and its regression
  specs are `tests/e2e/mobile-navigation.spec.ts`; the Tailwind v4 traps are
  documented in `docs/Tailwind-V4-Validation-Report.md` (gap-based nav lists,
  `backdrop-blur-xs`, CSS-class gradients).
- **e2e auth failures** → the limiter allows 10 login attempts/15 min; the
  setup project signs in ONCE and reuses storageState. Never add per-test
  logins.

## Documentation chain (keep in sync)

| File | When to touch it |
|---|---|
| `AGENTS.md` | commands, seams, traps change |
| `README.md` | features, scripts, screenshots change |
| `Project_Architecture_Document.md` | layers, data model, ADRs change |
| `veloxpos_SKILL.md` | the distilled project skill (architecture/lessons) changes |
| `docs/veloxpos-implementation-plan.md` | new reference findings or superset decisions |
| `worklog.md` | every session appends (never rewrites) its entry |

## Commits & pushing

- Conventional Commits, atomic, `main` only — no feature branches.
- Push via `python3 docs/ssh_git_wrapper_v3.py --key-file <key outside repo>`
  after the gate is green (full runbook:
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; no OpenSSH binary in
  the sandbox → deploy the paramiko shim from its Appendix A on PATH).
- Never commit `.env`, keys, or `db/*.db`.
- `skills/` is vendored reference material — excluded from lint/type/tests;
  leave it untouched.

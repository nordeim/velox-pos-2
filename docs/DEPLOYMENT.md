# Deployment Guide — VeloxPOS

VeloxPOS ships as a single Next.js **standalone** build with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
bun install
bun run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the app pages and the API route handlers, then copies
`.next/static` and `public/` into `.next/standalone/` (see the `build`
script in `package.json`). `next.config.ts` pins `outputFileTracingRoot` to
the repo root — keep it; the standalone trace depends on it.

## 2. Run

```bash
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Behind a
reverse proxy, terminate TLS at the proxy and keep the app on plain HTTP —
session cookies are `Secure` by default in production (`NODE_ENV=production`),
so the browser must see HTTPS.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production — enforced at boot** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. **The boot guard (`src/instrumentation.ts`) refuses to start the production server without a real secret** (missing/empty/the public dev constant → the process exits with the remedy message; dev/test keep the zero-config fallback with a one-line boot warning). |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin, used for metadata URLs and `sitemap.xml` (e.g. `https://pos.example.com`). |
| `COOKIE_SECURE` | No | The only sanctioned way to run a **plain-HTTP** production-style server: `COOKIE_SECURE=false` keeps the session cookie off `Secure` (browsers drop Secure cookies over non-HTTPS origins; the e2e suite's standalone server uses this). HTTPS deployments never set it. |

## 4. Database location (the `.env.example` reference)

```bash
DATABASE_URL="file:../db/custom.db"   # DEV convention (repo-root .env)
```

- **Development:** the relative form resolves against `prisma/schema.prisma`
  — exactly like the Prisma CLI — via `src/lib/db-path.ts` (schema-anchored
  for the runtime too). The `db/` folder lives at the repo root; its `*.db`
  files are git-ignored (recreate with `db:push` + `db:seed`).
- **Production/standalone:** use an **ABSOLUTE** `file:` URL:

```bash
DATABASE_URL="file:/srv/veloxpos/db/custom.db" \
AUTH_SECRET="$(openssl rand -hex 32)" \
PORT=3000 \
bun .next/standalone/server.js
```

Rationale (field-tested): under the standalone server, per-bundle anchors and
Prisma's own `.env` walk-up make the relative form bundle-dependent — the e2e
suite observed the login and the page render disagreeing about the same
relative URL (two different files). The absolute form removes the entire
class. See `src/lib/db-path.ts` for the resolution contract and
`playwright.config.ts` for the e2e usage.

Provisioning (first run, or after wiping the db file):

```bash
bun run db:push        # create/update the schema
bun run db:seed        # the owner account + default Store Settings
bun run db:seed -- --demo   # optional: showcase dataset
```

## 5. Health & operations

- `GET /api/health` → `{"status":"ok","db":"up","app":"veloxpos"}` (200) or
  `{"status":"degraded","db":"down",...}` (503) — wire this into your
  uptime probe.
- Logs: the standalone server prints to stdout; route errors log server-side
  only (response bodies never carry stack traces).

## 6. Pre-ship checklist (the local gate is the only gate)

```bash
bun run lint        # 0 errors
bun run typecheck   # clean
bun run test        # 117/117
bun run build       # standalone green
bun run test:e2e    # 39/39 (desktop + mobile) — needs the build first
```

## 7. Pushing (SSH wrapper)

The canonical push remote is `git@github.com:nordeim/velox-pos.git`. The push
path is the operator-supplied key + `docs/ssh_git_wrapper_v3.py` — keys live
outside the repo, materialized 0600, remote ref verified, shredded after the
push. Full runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`
(the paramiko shim in its Appendix A covers sandboxes without OpenSSH).

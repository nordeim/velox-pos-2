#!/usr/bin/env bash
# The smoke leg (Session-8, F-53 — the web-application skill §14 tier-3
# skeleton, the neo-crm form). Boots the STANDALONE ARTIFACT (not the dev
# server — the e2e doctrine: validate what ships) on :3210 with its OWN
# scratch database (db/smoke.db, gitignored like db/custom.db) and a
# dedicated throwaway AUTH_SECRET, then walks the assertion ladder:
#
#   01  /api/health 200 + "status":"ok"            (the db round-trip)
#   02  unauthenticated /api/products -> 401       (the session wall)
#   03  /login renders the page title              (the SSR shell)
#   04  the seeded owner login -> the sf_session cookie (the auth round-trip)
#   05  the sessioned /api/products -> 200         (the ownership-scoped list)
#   06  an invalid payload POST -> 400             (the Zod seam)
#   07  a valid category create -> 201             (the CRUD round-trip)
#   08  the category DELETE -> 200                 (the teardown round-trip)
#   09  logout -> /api/auth/me 401                 (the cookie teardown)
#   10  the login rate-limit probe -> the 11th -> 429 (LAST: it exhausts
#       the login bucket for this IP for 15 min)
#   11  /sitemap.xml + /robots.txt -> 200          (the SEO family)
#   12  THE BOOT-GATE PROBE: a second boot WITHOUT AUTH_SECRET refuses
#       to serve — the fail-fast posture (the log carries the message)
#   13  THE ARTIFACT-HYGIENE assertions (Session-8, F-54): the built
#       artifact contains NO .env / db / skills / docs / tests / .git
#       entries, keeps prisma/schema.prisma (the db-path anchor) and
#       public/ — policed on every smoke run.
#
# Every assertion: ok "NN — description" || { fail "NN"; exit 1; } (the
# §13.4 convention — failure is loud and the ladder stops). The trap kills
# the server on ANY exit. The summary line counts EXECUTED vs PASSED (the
# §15 lesson: a smoke leg must count what it executed, not only what
# passed — a silently-skipped leg is a shrunken gate).

set -euo pipefail

PORT=3210
BASE="http://localhost:${PORT}"
SMOKE_DB_URL="file:../db/smoke.db"
SMOKE_DB_ABS="file:$(pwd)/db/smoke.db"
# A dedicated throwaway secret (the 64-hex production shape) — NEVER the
# repo .env's value: the smoke leg must be immune to the shell-env trap the
# db-path seam documents.
SMOKE_SECRET="smoke-test-secret-0123456789abcdefghijklmnopqrstuvwxyz0123456789"
COOKIE_JAR="$(mktemp)"
SERVER_LOG="$(mktemp)"
GATE_LOG="$(mktemp)"
SERVER_PID=""
EXECUTED=0
PASSED=0

ok()   { EXECUTED=$((EXECUTED + 1)); PASSED=$((PASSED + 1)); echo "  ok $1 — $2"; }
fail() { EXECUTED=$((EXECUTED + 1)); echo "  FAIL $1 — $2" >&2; }
cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  rm -f "$COOKIE_JAR" "$SERVER_LOG" "$GATE_LOG"
}
trap cleanup EXIT

# --- 0. the artifact must exist (the gate chain builds right before) --------
[ -f .next/standalone/server.js ] || { echo "  FAIL 00 — no standalone artifact — run bun run build first" >&2; exit 1; }

# --- 1. the smoke database: FRESH schema + seed each run (deterministic —
# leftover probe rows from an aborted run must never poison the ladder)
rm -f db/smoke.db db/smoke.db-journal
DATABASE_URL="$SMOKE_DB_URL" bunx prisma db push --accept-data-loss >/dev/null 2>&1
DATABASE_URL="$SMOKE_DB_URL" bun prisma/seed.ts >/dev/null 2>&1

# --- 2. kill squatters on the smoke port ------------------------------------
lsof -ti:"$PORT" | xargs -r kill -9 2>/dev/null || true
sleep 1

# --- 3. boot the standalone artifact ----------------------------------------
# COOKIE_SECURE=false: the documented plain-HTTP escape hatch (curl will not
# replay a Secure cookie over http:// — the e2e suite boots the same way).
DATABASE_URL="$SMOKE_DB_ABS" AUTH_SECRET="$SMOKE_SECRET" NODE_ENV=production \
  COOKIE_SECURE=false PORT="$PORT" \
  node .next/standalone/server.js >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

# --- the health-wait loop (30 x 1s) -----------------------------------------
up=1
for _ in $(seq 1 30); do
  if curl -sf "$BASE/api/health" >/dev/null 2>&1; then up=0; break; fi
  sleep 1
done
if [ "$up" != 0 ]; then
  fail "00" "the standalone server never became healthy"
  cat "$SERVER_LOG" >&2
  exit 1
fi

# --- 4. the assertion ladder -------------------------------------------------
body() { curl -s "$@"; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

# 01 — health: the db round-trip
h="$(body "$BASE/api/health")"
case "$h" in
  *'"status":"ok"'*) ok "01" "health 200 + status ok";;
  *) fail "01" "health body: $h"; exit 1;;
esac

# 02 — the session wall
c="$(code "$BASE/api/products")"
[ "$c" = 401 ] && ok "02" "unauthenticated /api/products -> 401" || { fail "02" "expected 401, got $c"; exit 1; }

# 03 — the login SSR shell
h="$(body "$BASE/login")"
case "$h" in
  *"Sign in to continue"*) ok "03" "/login renders the SSR shell";;
  *) fail "03" "login page missing the reference copy"; exit 1;;
esac

# 04 — the seeded owner login (the sf_session cookie lands in the jar)
c="$(code -c "$COOKIE_JAR" -H 'Content-Type: application/json' \
  -d '{"email":"sepnetflix2023@outlook.com","password":"$Abcd1234"}' \
  "$BASE/api/auth/login")"
if [ "$c" = 200 ] && grep -q "sf_session" "$COOKIE_JAR"; then
  ok "04" "the owner login -> the sf_session cookie"
else
  fail "04" "login returned $c (cookie jar below)"; cat "$COOKIE_JAR" >&2; exit 1
fi

# 05 — the ownership-scoped list
c="$(code -b "$COOKIE_JAR" "$BASE/api/products")"
[ "$c" = 200 ] && ok "05" "sessioned /api/products -> 200" || { fail "05" "expected 200, got $c"; exit 1; }

# 06 — the Zod seam (an invalid category: the name exceeds the 200-char
# bounded-text limit)
c="$(code -b "$COOKIE_JAR" -H 'Content-Type: application/json' \
  -d "{\"name\":\"$(printf 'x%.0s' $(seq 1 201))\"}" "$BASE/api/categories")"
[ "$c" = 400 ] && ok "06" "the invalid category POST -> 400" || { fail "06" "expected 400, got $c"; exit 1; }

# 07 — the valid create (ONE request — the category name is unique per user;
# a second identical POST would 409)
create_resp="$(curl -s -b "$COOKIE_JAR" -H 'Content-Type: application/json' \
  -w '\n%{http_code}' -d '{"name":"Smoke Probe Category","color":"#8b5cf6"}' \
  "$BASE/api/categories")"
c="$(printf '%s' "$create_resp" | tail -1)"
create_body="$(printf '%s' "$create_resp" | sed '$d')"
created_id="$(printf '%s' "$create_body" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)"
if [ "$c" = 201 ] && [ -n "$created_id" ]; then
  ok "07" "the category create -> 201 (id ${created_id:0:8}…)"
else
  fail "07" "create returned $c / id '$created_id'"; exit 1
fi

# 08 — the teardown round-trip
c="$(code -b "$COOKIE_JAR" -X DELETE "$BASE/api/categories/$created_id")"
[ "$c" = 200 ] && ok "08" "the category DELETE -> 200" || { fail "08" "expected 200, got $c"; exit 1; }

# 09 — the cookie teardown
c="$(code -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/logout")"
[ "$c" = 200 ] || { fail "09" "logout returned $c"; exit 1; }
c="$(code -b "$COOKIE_JAR" "$BASE/api/auth/me")"
[ "$c" = 401 ] && ok "09" "logout -> /api/auth/me 401" || { fail "09" "me returned $c after logout"; exit 1; }

# 10 — the rate-limit probe (LAST — it exhausts the login bucket): the
# limiter allows 10 attempts/IP/15 min; ten wrong-password posts consume the
# budget (each 401), the ELEVENTH must answer 429.
for i in $(seq 1 10); do
  code -c /dev/null -H 'Content-Type: application/json' \
    -d '{"email":"sepnetflix2023@outlook.com","password":"wrong-password"}' \
    "$BASE/api/auth/login" >/dev/null
done
c="$(code -H 'Content-Type: application/json' \
  -d '{"email":"sepnetflix2023@outlook.com","password":"wrong-password"}' \
  "$BASE/api/auth/login")"
[ "$c" = 429 ] && ok "10" "the 11th login attempt -> 429 (the limiter)" || { fail "10" "expected 429, got $c"; exit 1; }

# 11 — the SEO family
c1="$(code "$BASE/sitemap.xml")"
c2="$(code "$BASE/robots.txt")"
[ "$c1" = 200 ] && [ "$c2" = 200 ] && ok "11" "sitemap.xml + robots.txt -> 200" || { fail "11" "sitemap $c1 / robots $c2"; exit 1; }

# 12 — THE BOOT-GATE PROBE: without AUTH_SECRET the production server must
# refuse to serve (the instrumentation exit — the fail-fast posture).
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true
SERVER_PID=""
DATABASE_URL="$SMOKE_DB_ABS" NODE_ENV=production PORT="$PORT" \
  node .next/standalone/server.js >"$GATE_LOG" 2>&1 &
SERVER_PID=$!
gate_died=0
for _ in $(seq 1 15); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then gate_died=1; break; fi
  sleep 1
done
if [ "$gate_died" = 1 ] && grep -q "AUTH_SECRET is required in production" "$GATE_LOG"; then
  ok "12" "the no-secret boot refuses (the log carries the fatal message)"
else
  fail "12" "the boot gate did not fire (died=$gate_died)"; cat "$GATE_LOG" >&2; exit 1
fi
SERVER_PID=""

# 13 — THE ARTIFACT-HYGIENE assertions (F-54): the deployable artifact must
# not carry the dev environment, the dev database, the docs, the skills, the
# tests, or the VCS — and MUST keep the db-path anchor + the public assets.
A=".next/standalone"
hygiene_fail=""
[ -e "$A/.env" ]          && hygiene_fail="$hygiene_fail .env"
[ -e "$A/.env.example" ]  && hygiene_fail="$hygiene_fail .env.example"
[ -e "$A/db" ]            && hygiene_fail="$hygiene_fail db/"
[ -e "$A/skills" ]        && hygiene_fail="$hygiene_fail skills/"
[ -e "$A/docs" ]          && hygiene_fail="$hygiene_fail docs/"
[ -e "$A/tests" ]         && hygiene_fail="$hygiene_fail tests/"
[ -e "$A/scripts" ]       && hygiene_fail="$hygiene_fail scripts/"
[ -e "$A/.git" ]          && hygiene_fail="$hygiene_fail .git/"
[ -e "$A/worklog.md" ]    && hygiene_fail="$hygiene_fail worklog.md"
if [ -n "$hygiene_fail" ]; then
  fail "13" "the artifact ships forbidden entries:$hygiene_fail"
  exit 1
fi
[ -f "$A/prisma/schema.prisma" ] || { fail "13" "the db-path anchor (prisma/schema.prisma) is missing from the artifact"; exit 1; }
[ -f "$A/public/favicon.svg" ]   || { fail "13" "public/ assets missing from the artifact"; exit 1; }
ok "13" "the artifact is hygiene-clean (no .env/db/skills/docs/tests; anchor + public present)"

# --- the summary (executed vs passed — the loud-complete doctrine) -----------
echo ""
echo "SMOKE RESULT: ${PASSED}/${EXECUTED} passed — smoke ladder complete"
[ "$PASSED" = "$EXECUTED" ] || exit 1

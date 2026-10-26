import { defineConfig, devices } from "@playwright/test";

// ---------------------------------------------------------------------------
// E2E layer for VeloxPOS: boots the PRODUCTION standalone server on an
// isolated port with its own scratch database (db/e2e.db, schema-pushed +
// seeded by the global setup), then drives the real UI in Chromium.
//
// Prerequisites: `bun run build` (the standalone server must exist).
// Run with: `bun run test:e2e`.
//
// Auth strategy: the "setup" project signs the store owner in ONCE and saves
// the session cookie to tests/e2e/.auth/user.json; every spec in the main
// projects starts with that storageState. The auth endpoints are rate-limited
// (10 attempts/IP/15 min), so per-test logins would trip the limiter
// mid-suite. auth.spec.ts opts back out with an empty storageState.
//
// Two projects: desktop (1440x900) and mobile (390x844) — the mobile project
// exists for the mobile-navigation spec (the drawer superset surface).
// ---------------------------------------------------------------------------

import path from "node:path";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
// ABSOLUTE by contract (see .env.example + docs/DEPLOYMENT.md §4): the
// standalone server's render workers resolve relative `file:` URLs against
// bundle-dependent anchors (observed live: Prisma's own .env walk-up plus
// per-worker anchors created an empty .next/standalone/db/e2e.db while the
// route handlers read the repo's db — the page renders then bounced every
// authed session to /login). The relative form stays a DEV convention.
const E2E_DATABASE_URL = `file:${path.join(process.cwd(), "db", "e2e.db")}`;
const AUTH_STATE = "tests/e2e/.auth/user.json";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // one worker: the specs share a single seeded SQLite file
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts|mobile-navigation\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // The FULL chromium (still headless): chrome-headless-shell has a
        // cookie-storage quirk on plain-HTTP localhost (observed live: a
        // manually-injected valid session cookie still bounced the
        // server-side gate, while the full browser + curl both accepted
        // it) — the full browser is also the production-realistic target.
        channel: "chromium",
        viewport: { width: 1440, height: 900 },
        storageState: AUTH_STATE,
      },
    },
    {
      name: "mobile",
      dependencies: ["setup"],
      testMatch: /mobile-navigation\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        channel: "chromium",
        viewport: { width: 390, height: 844 },
        storageState: AUTH_STATE,
      },
    },
  ],
  webServer: {
    // The kill-before-boot guard lives HERE (the webServer starts BEFORE
    // globalSetup, so a cleanup inside global-setup would murder the fresh
    // server too): a bun child that survived a prior run's cleanup keeps
    // serving with open handles to a DELETED scratch db — and
    // reuseExistingServer happily reuses it (field-tested: every session
    // bounced because the login minted tokens for users of the old inode).
    command: `bun tests/e2e/kill-port.ts && bun tests/e2e/global-setup.ts && bun .next/standalone/server.js`,
    url: `${BASE_URL}/api/health`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: "production",
      DATABASE_URL: E2E_DATABASE_URL,
      // The e2e production server runs plain HTTP on localhost; the
      // headless shell refuses Secure cookies there. The documented
      // COOKIE_SECURE=false escape hatch (src/lib/server/auth.ts) applies.
      COOKIE_SECURE: "false",
      // The documented 64-hex production shape (openssl rand -hex 32) so the
      // boot guard's weak-secret warn stays silent in the suite's own boot.
      AUTH_SECRET: "5f3a9c1e7b2d4f6a8c0e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f",
    } as Record<string, string>,
  },
});

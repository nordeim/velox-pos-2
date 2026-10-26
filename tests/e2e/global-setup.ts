// ---------------------------------------------------------------------------
// E2E provisioning — invoked BY THE WEBSERVER COMMAND (kill-port → provision
// → boot), NOT as a Playwright globalSetup: the standalone server's clients
// bind the SQLite file eagerly, so ANY file replacement after boot leaves
// some bundles reading a deleted inode (field-tested: the login and the page
// render then disagreed about the user table — userLookup NULL on a live
// row). The scratch db is provisioned ONCE, BEFORE boot, and never touched
// again while the server lives. The e2e owner mirrors the reference
// credentials so the suite exercises the same login story.
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const E2E_PORT = process.env.E2E_PORT ?? "3100";

export function provision(): void {
  const repoRoot = process.cwd();
  const dbDir = path.join(repoRoot, "db");
  const dbFile = path.join(dbDir, "e2e.db");

  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  // A stale scratch db would leak rate-limit windows and prior-shift state
  // into the run — the scratch db is disposable by contract.
  if (existsSync(dbFile)) rmSync(dbFile);
  if (existsSync(`${dbFile}-journal`)) rmSync(`${dbFile}-journal`);

  const env = {
    ...process.env,
    DATABASE_URL: `file:${dbFile}`,
  };
  execSync("bunx prisma db push --accept-data-loss --skip-generate", {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  });
  execSync("bun prisma/seed.ts", { cwd: repoRoot, env, stdio: "inherit" });
}

provision();

// ---------------------------------------------------------------------------
// db-path.ts — the DATABASE_URL contract: `file:../db/custom.db` from .env
// must resolve to <repo>/db/custom.db for the runtime (the user's explicit
// requirement — the db/ folder lives at the repo root).
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import { resolveDatabaseUrl } from "../src/lib/db-path";

const REPO = "/repo/velox-pos";

describe("resolveDatabaseUrl", () => {
  it("resolves the .env default against the schema-owning anchor", () => {
    const url = resolveDatabaseUrl("file:../db/custom.db", [REPO]);
    expect(url).toBe(`file:${REPO}/db/custom.db`);
  });

  it("prefers the anchor that actually owns prisma/schema.prisma", () => {
    const url = resolveDatabaseUrl("file:../db/custom.db", ["/wrong/root", REPO]);
    expect(url).toBe(`file:${REPO}/db/custom.db`);
  });

  it("falls back to the last anchor (cwd semantics) when no schema exists", () => {
    // The fallback anchors relative URLs against <anchor>/prisma — the same
    // schema-relative rule the Prisma CLI applies (db-path.ts header).
    const url = resolveDatabaseUrl("file:./local.db", ["/a", "/b"]);
    expect(url).toBe(`file:/b/prisma/local.db`);
  });

  it("substitutes the documented default when the env var is missing", () => {
    const url = resolveDatabaseUrl(undefined, [REPO]);
    expect(url).toBe(`file:${REPO}/db/custom.db`);
  });

  it("passes absolute file: URLs through untouched", () => {
    expect(resolveDatabaseUrl("file:/data/pos.db", [REPO])).toBe("file:/data/pos.db");
  });

  it("passes non-sqlite URLs through untouched (postgres deploys)", () => {
    const pg = "postgresql://user:pass@host:5432/pos";
    expect(resolveDatabaseUrl(pg, [REPO])).toBe(pg);
  });
});

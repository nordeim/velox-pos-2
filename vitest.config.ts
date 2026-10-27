import { defineConfig } from "vitest/config";
import path from "node:path";

// ---------------------------------------------------------------------------
// Unit-test layer for VeloxPOS — the pure domain seams (src/lib).
//
// 14 files: money, cart, shift, reports, inventory-status, currency, router,
// validation, auth, db-path, env-check, site, docs-counts (the lockstep
// gate), chart-path (the smooth-curve seam). Every seam is the public boundary the API routes and views consume;
// nothing here imports React or the database. Run: `bun run test`.
// ---------------------------------------------------------------------------

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

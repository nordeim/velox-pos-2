import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — the VeloxPOS clone.
//
// Matches *.test.ts under tests/ ONLY (never the e2e *.spec.ts files, which
// Playwright owns — see playwright.config.ts). Run via `bun run test`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});

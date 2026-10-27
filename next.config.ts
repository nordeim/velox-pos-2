import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  // Session-8 (F-54 — THE ARTIFACT HYGIENE): without excludes the tracer
  // ships repo-root entries inside the deployable artifact — observed live:
  // .env (the real AUTH_SECRET) and db/custom.db (the dev SQLite with user
  // rows + scrypt password hashes) landed in .next/standalone/ on every
  // build. A standalone artifact is the deployable unit; it must carry only
  // the server's true runtime needs. prisma/schema.prisma STAYS traced (the
  // db-path anchor — verified load-bearing), and db/ is mkdir'd on demand by
  // the resolver when a relative URL legitimately targets it. Next's own
  // writeStandaloneDirectory ALSO copies .env explicitly (immune to these
  // excludes): the build script's trailing `rm -f .next/standalone/.env`
  // removes that copy (the double-cure — the neo-crm F-170a form).
  outputFileTracingExcludes: {
    "*": [
      ".env",
      ".env.example",
      ".git/**",
      "db/**",
      "skills/**",
      "docs/**",
      "tests/**",
      "scripts/**",
      "test-results/**",
      "research/**",
      "AGENTS.md",
      "CLAUDE.md",
      "README.md",
      "Project_Architecture_Document.md",
      "velox-pos_SKILL.md",
      "worklog.md",
      "bun.lock",
      "components.json",
      "eslint.config.mjs",
      "playwright.config.ts",
      "postcss.config.mjs",
      "tsconfig.json",
      "tsconfig.tsbuildinfo",
      "vitest.config.ts",
      ".gitignore",
      "dev.log",
      "server.log",
    ],
  },
  reactStrictMode: false,
  // Next 16's dev-origin protection silently blocks dev chunks for the
  // 127.0.0.1 origin (unhydrated page, native form GET fallbacks) — restore
  // both origins for local browser/probe access (see
  // docs/Tailwind-V4-Validation-Report.md, session-12 methodology note).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // The views live at their real reference paths (/POS, /Dashboard, …) as
  // genuine routes under src/app/(app)/ — no rewrites needed.
};

export default nextConfig;

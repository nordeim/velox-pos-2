import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
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

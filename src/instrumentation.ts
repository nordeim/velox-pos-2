// ---------------------------------------------------------------------------
// Next.js instrumentation hook (the scaffolding's S22/ADR-020 boot guard):
// runs once per server boot — dev, next start, and the standalone build
// (never during next build). Asks the PURE seam what to do about the
// configured AUTH_SECRET:
//
//   - production fatal (missing / blank / the public dev fallback):
//     console.error + process.exit(1). A plain throw is CAUGHT by Next and
//     leaves a degraded 500-everything server — the explicit exit is the
//     validated fail-fast mechanism.
//   - warn (weak production secret / dev without a secret): console.warn.
//
// The Node-only body is guarded by NEXT_RUNTIME: instrumentation's register
// is evaluated in the Edge runtime too, where `process.exit` is an
// Ecmascript-file error that 500s every route (observed live on Next 16 —
// the whole app 500s until this guard exists).
// ---------------------------------------------------------------------------

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { authSecretBootStatus } = await import("./lib/env-check");
  const status = authSecretBootStatus(
    process.env.NODE_ENV,
    process.env.AUTH_SECRET,
  );

  if (status.level === "fatal") {
    console.error(status.message);
    process.exit(1);
  }
  if (status.level === "warn" && status.message) {
    console.warn(status.message);
  }
}

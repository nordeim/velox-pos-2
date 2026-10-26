// ---------------------------------------------------------------------------
// The S31 dev-server boot-stability seam. The browser-context audits assume a
// hydrated, navigation-stable dev server as a PRECONDITION; when a stale
// Turbopack `.next/dev` cache puts a route into a full-page reload loop the
// audits fail OPAQUELY (a 30 s click timeout naming the symptom — a disabled
// button — not the cause). This seam classifies the measured boot signals
// into the honest verdict + remedy (S27: loud, self-describing failures;
// S28: the louder finding wins).
//
// Pure function with explicit args — never touches a browser or a process
// itself (scripts/dev-server-preflight.mjs owns the measurement), so every
// precedence pair and boundary is unit-pinnable (tests/dev-preflight.test.ts).
// ---------------------------------------------------------------------------

/**
 * Full-page reloads per navigation window above which the route is in a
 * reload loop. Sits ABOVE the legitimate first-compile HMR full-reloads
 * (1-2) with margin — 4 navs alone is not a loop, 5+ is.
 */
export const NAV_LOOP_THRESHOLD = 5;

export type BootVerdict = "green" | "reload-loop" | "no-hydration" | "unreachable";

export interface BootSignals {
  reachable: boolean;
  navigations: number;
  hydrated: boolean;
}

export interface BootStability {
  verdict: BootVerdict;
  remedy: string | null;
}

/**
 * Classify the preflight measurement. Precedence is the diagnosis ladder:
 * UNREACHABLE first (no measurement is possible — every other signal is
 * noise), then RELOAD-LOOP (beats a mid-window hydration reading and beats
 * no-hydration: a looping page also never hydrates, but the loop names the
 * actual cause and the actual remedy), then NO-HYDRATION (the S9 silent
 * class), and only then GREEN.
 */
export function classifyBootStability(signals: BootSignals): BootStability {
  if (!signals.reachable) {
    return {
      verdict: "unreachable",
      remedy:
        "start the dev server (bun run dev — the setsid daemon recipe in AGENTS.md), verify /api/health returns 200, then re-run this preflight",
    };
  }
  if (signals.navigations >= NAV_LOOP_THRESHOLD) {
    return {
      verdict: "reload-loop",
      // The FULL sequence: S31 proved a daemon restart alone does NOT clear
      // the loop when the kill was unclean — the stale `.next/dev` cache
      // survives; only the cache clear + restart does.
      remedy: "stop the daemon, rm -rf .next/dev, restart (bun run dev), re-run this preflight",
    };
  }
  if (!signals.hydrated) {
    return {
      verdict: "no-hydration",
      remedy:
        "retry the probe once (a slow first compile can delay hydration), then restart the daemon, then rm -rf .next/dev + restart",
    };
  }
  return { verdict: "green", remedy: null };
}

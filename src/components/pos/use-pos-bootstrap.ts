"use client";

// ---------------------------------------------------------------------------
// The POS bootstrap hook: on mount it resolves the session (/api/auth/me),
// pre-warms the collections in parallel, and — on a 401 — leaves through a
// FULL reload to /login?from_url=… (a reload, not a router push, so the app
// starts clean; the documented pattern).
// ---------------------------------------------------------------------------

import * as React from "react";

import { apiGet } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { usePosStore, type AppUser } from "@/lib/store";

export function usePosBootstrap(): { ready: boolean } {
  const setUser = usePosStore((s) => s.setUser);
  const loadAll = usePosStore((s) => s.loadAll);
  const loadCore = usePosStore((s) => s.loadCore);
  const hydrated = usePosStore((s) => s.hydrated);
  const dataReady = usePosStore((s) => s.dataReady);

  React.useEffect(() => {
    if (hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        const user = await apiGet<AppUser>("/api/auth/me");
        if (cancelled) return;
        setUser(user);
        await Promise.all([loadAll(), loadCore()]);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          const from = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.replace(`/login?from_url=${from}`);
          return;
        }
        // Non-auth failures still reveal the shell (the views show their
        // empty states and retry through their own actions).
        if (!cancelled && !usePosStore.getState().hydrated) {
          usePosStore.setState({ user: null, hydrated: true, dataReady: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, setUser, loadAll, loadCore]);

  // Readiness is DERIVED from the store (never a duplicated state flag):
  // hydrated means the session resolved; dataReady means the pre-warm landed.
  return { ready: hydrated && dataReady };
}

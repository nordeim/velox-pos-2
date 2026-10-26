"use client";

// ---------------------------------------------------------------------------
// The S14 connectivity contract: the offline state is AMBIENT. Bridges
// navigator.onLine through useSyncExternalStore (subscribe to online/offline)
// and renders NOTHING while online — the online DOM stays byte-identical —
// and a fixed bottom-center amber role="status" pill while offline.
// Transport failures themselves map to a human message at the ONE seam
// (doFetch in src/lib/api.ts); this banner is the standing signal.
// The pill styles inline (amber on dark) — the POS app is dark-only.
// ---------------------------------------------------------------------------

import * as React from "react";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getClientSnapshot(): boolean {
  return navigator.onLine;
}

/** The server (and hydration) snapshot: assume online — the banner must
 *  never flash on the server-rendered HTML. */
function getServerSnapshot(): boolean {
  return true;
}

export function ConnectivityBanner() {
  const online = React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[70] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300 shadow-lg"
    >
      You&apos;re offline — changes will not be saved until you reconnect.
    </div>
  );
}

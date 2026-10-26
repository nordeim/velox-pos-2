"use client";

// ---------------------------------------------------------------------------
// The WHOLE app: one page — auth gate → shell → view switcher. The 8
// PascalCase paths are rewritten onto / by next.config.ts; the store syncs
// the view with the pathname (hydrate()).
//
// Load-stability contract: the shell renders as soon as /api/auth/me
// settles; the active view fetches its own data (each view owns its loading
// state — a slow /api/dashboard/summary never blocks the Terminal).
// A 401 leaves through window.location.replace("/login") — a FULL reload.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Zap } from "lucide-react";

import { ConnectivityBanner } from "@/components/layout/connectivity-banner";
import { MobileChrome } from "@/components/layout/mobile-chrome";
import { Sidebar } from "@/components/layout/sidebar";
import { apiGet, ApiError } from "@/lib/api";
import { useAppStore, type AppUser } from "@/lib/store";
import { cn } from "@/lib/utils";

import { CashiersView } from "@/components/views/cashiers-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { InventoryView } from "@/components/views/inventory-view";
import { RegistersView } from "@/components/views/registers-view";
import { ReportsView } from "@/components/views/reports-view";
import { SalesView } from "@/components/views/sales-view";
import { SettingsView } from "@/components/views/settings-view";
import { TerminalView } from "@/components/views/terminal-view";

/**
 * Sets data-app-hydrated on the shell commit — the e2e gate that proves
 * the authed chrome (sidebar nav) has actually rendered.
 */
function HydrationMarker() {
  React.useEffect(() => {
    document.documentElement.dataset.appHydrated = "true";
  }, []);
  return null;
}

/** The static view registry — one component per NAV_ITEM view id. */
const VIEW_COMPONENTS: Record<string, React.ComponentType> = {
  terminal: TerminalView,
  dashboard: DashboardView,
  inventory: InventoryView,
  sales: SalesView,
  registers: RegistersView,
  cashiers: CashiersView,
  reports: ReportsView,
  settings: SettingsView,
};

type GateStatus = "loading" | "ready" | "error";

function Splash({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  return (
    <div className="vx-canvas flex min-h-dvh flex-col items-center justify-center gap-4">
      <span
        aria-hidden
        className="vx-gradient vx-glow flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl text-white"
      >
        <Zap className="h-7 w-7" strokeWidth={2} fill="currentColor" />
      </span>
      {error && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-slate-400">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="vx-focusable rounded-md px-3 py-1.5 text-sm font-medium text-violet-300 outline-none"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = React.useState<GateStatus>("loading");
  const [gateError, setGateError] = React.useState<string>("");
  const [attempt, setAttempt] = React.useState(0);
  const view = useAppStore((s) => s.view);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  React.useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      setStatus("loading");
      setGateError("");
      // The view comes from the URL, not the render closure.
      useAppStore.getState().hydrate();

      try {
        const { user } = await apiGet<{ user: AppUser }>("/api/auth/me");
        if (cancelled) return;
        void user;
        setStatus("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        setGateError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the store.",
        );
        setStatus("error");
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (status !== "ready") {
    return (
      <>
        <a href="#main-content" className="vx-skip-link">
          Skip to main content
        </a>
        <Splash
          error={status === "error" ? gateError : undefined}
          onRetry={status === "error" ? () => setAttempt((n) => n + 1) : undefined}
        />
      </>
    );
  }

  const ActiveView = VIEW_COMPONENTS[view] ?? VIEW_COMPONENTS.terminal;

  return (
    <>
      <a href="#main-content" className="vx-skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <HydrationMarker />
      <MobileChrome />
      <ConnectivityBanner />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "vx-scroll min-h-dvh px-4 pb-10 pt-20 outline-none transition-[margin] lg:px-8 lg:pt-8",
          sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[220px]",
        )}
      >
        <ActiveView />
      </main>
    </>
  );
}

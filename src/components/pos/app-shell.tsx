"use client";

// ---------------------------------------------------------------------------
// The app shell: the desktop sidebar (220px expanded / 68px icon-rail, chevron
// toggle — reference-measured) + the MOBILE DRAWER (the documented a11y
// superset: the reference keeps a 220px overlay with no hamburger on phones;
// the clone ships a working mobile menu instead — top app bar with a labeled
// hamburger, a slide-in glass-dark drawer, backdrop, Escape, route-change
// auto-close, and body scroll-lock).
//
// ONE content column renders `children` exactly once — the mobile app bar
// stacks above it (md:hidden) and the desktop sidebar sits beside it.
//
// Tailwind v4 trap discipline (the mobile-nav bug class):
//  - the nav list is flex flex-col gap-* — NEVER space-y-* with mt-*/mb-*
//    children (v4's :where() rewrite flips specificity);
//  - the drawer's custom surface is the .glass-dark class (plain CSS in
//    tokens.css — never @layer utilities, which lose the cascade in v4);
//  - the mobile hamburger and the desktop chevron are each rendered only at
//    their breakpoint (no dead controls below breakpoints).
// ---------------------------------------------------------------------------

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X, Zap } from "lucide-react";

import { BrandRow, NavItemLink } from "@/components/pos/nav-items";
import { NAV_ITEMS } from "@/lib/router";
import { usePosStore } from "@/lib/store";

function SidebarBody({
  collapsed,
  onNavigate,
  showBrand = true,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  /** The drawer renders its own header row — pass false to skip the brand. */
  showBrand?: boolean;
}) {
  const activeView = usePosStore((s) => s.activeView);
  return (
    <div className="flex h-full flex-col">
      {showBrand && (
        <div className={collapsed ? "flex justify-center px-2 pt-5" : "px-3 pt-5"}>
          <BrandRow collapsed={collapsed} />
        </div>
      )}
      <nav
        aria-label="Main navigation"
        className="vpx-scroll mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-3"
      >
        {NAV_ITEMS.map((item) => (
          <NavItemLink
            key={item.id}
            item={item}
            active={activeView === item.id}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrateFromPath = usePosStore((s) => s.hydrateFromPath);
  const sidebarCollapsed = usePosStore((s) => s.sidebarCollapsed);
  const toggleSidebar = usePosStore((s) => s.toggleSidebar);
  const mobileNavOpen = usePosStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = usePosStore((s) => s.setMobileNavOpen);

  // Sync the active view with the real route (the reference's own paths).
  React.useEffect(() => {
    hydrateFromPath(pathname);
  }, [pathname, hydrateFromPath]);

  // Escape closes; body scroll is locked while the drawer is open.
  React.useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-ink">
      {/* Desktop sidebar (md+). Hidden on mobile — the drawer replaces it. */}
      <aside
        data-testid="app-sidebar"
        className={`z-40 hidden h-dvh shrink-0 flex-col border-r border-edge bg-panel text-white transition-all duration-300 md:flex ${
          sidebarCollapsed ? "w-[68px]" : "w-[220px]"
        }`}
      >
        <SidebarBody collapsed={sidebarCollapsed} />
        <div className="border-t border-edge p-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
            className="vpx-focus flex w-full items-center justify-center rounded-xl p-2 text-white/30 transition-colors hover:text-white/80"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* The single content column: mobile app bar on top, main below. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-dark sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-edge px-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            aria-controls="vpx-mobile-drawer"
            className="vpx-focus -ml-1 rounded-lg p-2 text-white/80 hover:text-white"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="brand-chip flex h-8 w-8 items-center justify-center rounded-xl">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.4} aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-white">VeloxPOS</span>
          </div>
        </header>

        <main className="vpx-scroll min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* The mobile drawer (below md) — mounts only when open (it UNMOUNTS
          on close, the e2e-pinned behavior). */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-xs"
          />
          <div
            id="vpx-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            data-state="open"
            className="glass-dark absolute inset-y-0 left-0 flex w-72 flex-col border-r border-edge"
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <BrandRow />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="vpx-focus rounded-lg p-2 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarBody showBrand={false} collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

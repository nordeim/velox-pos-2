"use client";

// ---------------------------------------------------------------------------
// The desktop chrome: a fixed dark rail — `hidden lg:flex`, 220px expanded /
// 68px collapsed (the measured reference geometry). Everything below lg goes
// through the mobile drawer; `main` carries the lg:ml offset (page.tsx).
//
// Measured anatomy (docs/veloxpos-implementation-plan.md F3/F4): bg
// rgb(13,15,26) + border-r rgb(30,34,53); brand = 40px violet gradient chip
// (Zap) + "VeloxPOS" 18px/800; the nav rows are 42px tall with a 12px
// radius; the collapse chevron lives in a border-t footer row, centered.
// ---------------------------------------------------------------------------

import { ChevronLeft, Zap } from "lucide-react";

import { NavItemLink } from "@/components/layout/nav-items";
import { NAV_ITEMS } from "@/lib/router";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-vx-border bg-vx-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-[220px]",
      )}
    >
      {/* Brand row */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-vx-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="vx-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            >
              <Zap className="h-5 w-5" strokeWidth={2} fill="currentColor" />
            </span>
            <p className="text-lg font-extrabold text-white">VeloxPOS</p>
          </div>
        )}
        {collapsed && (
          <span
            aria-hidden
            className="vx-gradient mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          >
            <Zap className="h-5 w-5" strokeWidth={2} fill="currentColor" />
          </span>
        )}
      </div>

      {/* The ONE nav-item source — NavItemLink for every NAV_ITEM. Gap on the
          parent (trap 4): no margins on the children, ever. */}
      <nav
        aria-label="Primary"
        className="vx-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {NAV_ITEMS.map((item) => (
          <NavItemLink key={item.id} view={item.id} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse toggle — the reference centers it in a bordered footer. */}
      <div className="shrink-0 border-t border-vx-border p-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "vx-focusable flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-white/5 hover:text-slate-200",
            collapsed && "mx-auto",
          )}
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
}

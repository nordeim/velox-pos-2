"use client";

// ---------------------------------------------------------------------------
// The nav link + the icon map (the reference's own icon choices, read off the
// live sidebar: ShoppingCart/BarChart3/Package/History/Monitor/Users/
// ChartColumnIncreasing/Settings — Session-6 re-measurement: the reference
// swapped its Reports glyph to lucide-file-chart-column-increasing). The
// active state is the measured one: violet-600/20 wash + violet-300 text +
// border-violet-500/30 + shadow-violet-500/10 on a 12px-radius pill.
// ---------------------------------------------------------------------------

import Link from "next/link";

import {
  BarChart3,
  ChartColumnIncreasing,
  History,
  Monitor,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { NAV_ITEMS, type ViewId } from "@/lib/router";
import { usePosStore } from "@/lib/store";

export const NAV_ICONS: Record<ViewId, LucideIcon> = {
  terminal: ShoppingCart,
  dashboard: BarChart3,
  inventory: Package,
  sales: History,
  registers: Monitor,
  cashiers: Users,
  reports: ChartColumnIncreasing,
  settings: Settings,
};

/** The py-2.5 pill (Session-6: padding-driven 40px inactive / 42px with the
 *  active border — the reference dropped its fixed height); 16px icons. */
export function NavItemLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = NAV_ICONS[item.id];
  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={`vpx-focus flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        collapsed ? "justify-center px-0" : ""
      } ${
        active
          ? "border border-violet-500/30 bg-violet-600/20 text-violet-300 shadow-sm shadow-violet-500/10"
          : "text-white/40 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/** The 32px gradient brand chip + wordmark (the measured logo row — the
 *  container in app-shell.tsx owns the reference's px-4 py-5 border-b frame,
 *  so this row adds no padding of its own). */
export function BrandRow({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-chip flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.45)]">
        <Zap className="h-4 w-4 text-white" strokeWidth={2} aria-hidden="true" />
      </div>
      {!collapsed && (
        <span className="truncate text-sm font-bold tracking-wide text-white/90" id="vpx-brand-label">
          VeloxPOS
        </span>
      )}
    </div>
  );
}

/** Convenience selector hook for the active view. */
export function useActiveView(): ViewId {
  return usePosStore((s) => s.activeView);
}

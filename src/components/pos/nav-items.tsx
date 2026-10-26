"use client";

// ---------------------------------------------------------------------------
// The nav link + the icon map (the reference's own icon choices, read off the
// live sidebar: ShoppingCart/BarChart3/Package/History/Monitor/Users/FileText/
// Settings). The active state is the measured one: violet-600/20 wash +
// violet-300 text on a 12px-radius pill.
// ---------------------------------------------------------------------------

import Link from "next/link";

import {
  BarChart3,
  FileText,
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
  reports: FileText,
  settings: Settings,
};

/** The 42px pill — icon 18px + label; active/frozen styles match the reference. */
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
      className={`vpx-focus flex h-[42px] w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
        collapsed ? "justify-center px-0" : ""
      } ${
        active
          ? "bg-violet-600/20 text-violet-300"
          : "text-white/60 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
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
        <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.4} aria-hidden="true" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-white" id="vpx-brand-label">
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

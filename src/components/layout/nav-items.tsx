"use client";

// ---------------------------------------------------------------------------
// The ONE nav-item markup source — consumed by BOTH the desktop sidebar and
// the mobile drawer; never re-implement the item markup.
//
// Icon set is reference-measured (docs/veloxpos-implementation-plan.md §0):
// Terminal is a cart, Dashboard a bar chart, Inventory a package box, Sales
// a clock/history glyph, Registers a monitor, Cashiers users, Reports a
// file, Settings the gear.
//
// Tailwind v4 trap 4 (docs/Tailwind-V4-Validation-Report.md): the parent nav
// is flex flex-col — spacing comes from gap on the PARENT, never margins on
// these items, and no item is ever a child of a space-y-* container.
// ---------------------------------------------------------------------------

import {
  ChartColumn,
  FileText,
  History,
  Monitor,
  Package,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

import { NAV_ITEMS } from "@/lib/router";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { ViewId } from "@/lib/router";

export const NAV_ICONS: Record<ViewId, LucideIcon> = {
  terminal: ShoppingCart,
  dashboard: ChartColumn,
  inventory: Package,
  sales: History,
  registers: Monitor,
  cashiers: Users,
  reports: FileText,
  settings: Settings,
};

type NavItemLinkProps = {
  view: ViewId;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

/** Icon + label; active = the measured violet wash (rgba(124,58,237,.2)) +
 *  violet-300 text + aria-current. The <a> is the hit area; the inner span
 *  is the visual chip (42px row, 12px radius, 14px/500). */
export function NavItemLink({
  view,
  collapsed = false,
  onNavigate,
  className,
}: NavItemLinkProps) {
  const item = NAV_ITEMS.find((n) => n.id === view);
  const active = useAppStore((s) => s.view) === view;
  const navigate = useAppStore((s) => s.navigate);
  if (!item) return null;
  const Icon = NAV_ICONS[view];

  return (
    <a
      href={item.path}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      data-view={item.id}
      onClick={(e) => {
        e.preventDefault();
        navigate(view);
        onNavigate?.();
      }}
      className={cn(
        "vx-focusable block outline-none transition-colors",
        className,
      )}
    >
      <span
        className={cn(
          "flex flex-1 items-center rounded-xl px-3 py-2.5 text-sm transition-colors",
          collapsed ? "justify-center px-0" : "gap-3",
          active
            ? "vx-nav-active font-medium"
            : "font-normal text-slate-400 hover:bg-white/5 hover:text-slate-200",
        )}
      >
        <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      </span>
    </a>
  );
}

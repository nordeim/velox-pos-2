// ---------------------------------------------------------------------------
// The single view ↔ path map (unit-tested). The 8 reference views mirror the
// veloxposen.base44.app sidebar (Terminal, Dashboard, Inventory, Sales,
// Registers, Cashiers, Reports, Settings) — PascalCase paths rewritten onto
// `/` by next.config.ts; the SPA store syncs view state with the pathname.
// Pure — unit-pinned by tests/router.test.ts.
// ---------------------------------------------------------------------------

export type ViewId =
  | "terminal"
  | "dashboard"
  | "inventory"
  | "sales"
  | "registers"
  | "cashiers"
  | "reports"
  | "settings";

export const VIEWS: ViewId[] = [
  "terminal",
  "dashboard",
  "inventory",
  "sales",
  "registers",
  "cashiers",
  "reports",
  "settings",
];

export type NavItem = { id: ViewId; label: string; path: string };

/** All 8 reference views in sidebar order (reference-measured). */
export const NAV_ITEMS: NavItem[] = [
  { id: "terminal", label: "Terminal", path: "/Terminal" },
  { id: "dashboard", label: "Dashboard", path: "/Dashboard" },
  { id: "inventory", label: "Inventory", path: "/Inventory" },
  { id: "sales", label: "Sales", path: "/Sales" },
  { id: "registers", label: "Registers", path: "/Registers" },
  { id: "cashiers", label: "Cashiers", path: "/Cashiers" },
  { id: "reports", label: "Reports", path: "/Reports" },
  { id: "settings", label: "Settings", path: "/Settings" },
];

/** Canonical PascalCase path for a view (unknown ids fall back to /Terminal). */
export function pathForView(view: ViewId): string {
  return NAV_ITEMS.find((item) => item.id === view)?.path ?? "/Terminal";
}

/** Map a pathname to its view id — first segment wins, case-insensitive,
 *  trailing slashes tolerated; root/unknown → terminal. */
export function viewFromPath(pathname: string): ViewId {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (!segment) return "terminal";
  const hit = NAV_ITEMS.find((item) => item.path.toLowerCase() === `/${segment}`);
  return hit?.id ?? "terminal";
}

/** The Dashboard header's long date ("Monday, October 26, 2026"). */
export function dashboardDateLabel(now: Date = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

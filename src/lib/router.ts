// ---------------------------------------------------------------------------
// The route ↔ nav map for VeloxPOS (the reference's own real paths —
// /POS, /Dashboard, /Inventory, /Sales, /Registers, /Cashiers, /Reports,
// /StoreSettings — measured live; Settings' sidebar href is the entity-named
// /StoreSettings and /Settings itself 404s on the reference, replicated).
// Pure — unit-pinned by tests/unit/router.test.ts.
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

/** The 8 sidebar items in the reference's order (Terminal first). */
export const NAV_ITEMS: NavItem[] = [
  { id: "terminal", label: "Terminal", path: "/POS" },
  { id: "dashboard", label: "Dashboard", path: "/Dashboard" },
  { id: "inventory", label: "Inventory", path: "/Inventory" },
  { id: "sales", label: "Sales", path: "/Sales" },
  { id: "registers", label: "Registers", path: "/Registers" },
  { id: "cashiers", label: "Cashiers", path: "/Cashiers" },
  { id: "reports", label: "Reports", path: "/Reports" },
  { id: "settings", label: "Settings", path: "/StoreSettings" },
];

/** The canonical path for a view (unknown ids fall back to /POS). */
export function pathForView(view: ViewId): string {
  return NAV_ITEMS.find((item) => item.id === view)?.path ?? "/POS";
}

/** Map a pathname to its view id — first segment wins, case-insensitive,
 *  trailing slashes tolerated; /POS and / → terminal; unknown → null (404). */
export function viewFromPath(pathname: string): ViewId | null {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (!segment) return "terminal";
  const hit = NAV_ITEMS.find((item) => item.path.toLowerCase() === `/${segment}`);
  return hit?.id ?? null;
}

/** Whether the pathname is one of the app's real routes (the shell gate). */
export function isAppPath(pathname: string): boolean {
  return viewFromPath(pathname) !== null;
}

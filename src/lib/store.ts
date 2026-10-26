"use client";

// ---------------------------------------------------------------------------
// The ONE VeloxPOS Zustand store (the family law: one store per application).
// Collections (products/categories/registers/shifts/sales/settings/user),
// the cart, and the chrome state (sidebar collapse, mobile drawer) all live
// here; views subscribe with selectors — components never fetch on their own.
//
// Contract notes:
//  - All list mutations go through the api seam; failures surface as toasts
//    at the call site (never thrown into the render tree).
//  - The cart mutations delegate to the pure cart seam (src/lib/cart.ts) —
//    the store holds state, the seam owns the math.
//  - Sidebar collapse persists per-browser (localStorage), like the reference.
// ---------------------------------------------------------------------------

import { create } from "zustand";

import {
  addToCart,
  canCharge as cartCanCharge,
  cartTotals,
  clearCart,
  removeFromCart,
  setQty as cartSetQty,
  type CartLine,
} from "./cart";
import { apiGet, apiSend } from "./api";
import { viewFromPath, type ViewId } from "./router";

const SIDEBAR_COLLAPSED_KEY = "vpx-sidebar-collapsed";

// ---- shapes (the camelCase rows the API returns) ----------------------------

export type AppUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  emailVerified: boolean;
};

export type Product = {
  id: string;
  name: string;
  barcode: string;
  categoryId: string | null;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  taxRate: number;
  unit: string;
  image: string | null;
  active: boolean;
  createdAt: string;
  category?: { id: string; name: string; color: string } | null;
};

export type Category = { id: string; name: string; color: string; createdAt: string };

export type RegisterRow = {
  id: string;
  name: string;
  location: string;
  status: string;
  createdAt: string;
};

export type Shift = {
  id: string;
  registerId: string;
  cashierId: string;
  status: "active" | "closed";
  openingFloat: number;
  countedCash: number | null;
  expectedCash: number | null;
  variance: number | null;
  openedAt: string;
  closedAt: string | null;
  register?: { name: string; location: string };
  cashier?: { fullName: string; email: string };
};

export type Sale = {
  id: string;
  ticket: string;
  items: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: string;
  amountPaid: number | null;
  changeDue: number | null;
  customer: string;
  shiftId: string | null;
  status: string;
  createdAt: string;
  cashier?: { fullName: string; email: string };
  register?: { name: string };
};

export type StoreSettingsRow = {
  storeName: string;
  logoDataUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  primaryColor: string;
  secondaryColor: string;
  receiptFooter: string;
  hideFiscalOnReceipt: boolean;
  fiscalRuc: string;
  fiscalBusinessType: string;
  fiscalAddress: string;
  fiscalExpenseAccount: string;
  cardProvider: string;
  updatedAt?: string;
};

export type Cashier = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type Collections = {
  products: Product[];
  categories: Category[];
  registers: RegisterRow[];
  shifts: Shift[];
  sales: Sale[];
  cashiers: Cashier[];
  settings: StoreSettingsRow | null;
};

// ---- the store -------------------------------------------------------------

type PosStore = Collections & {
  user: AppUser | null;
  hydrated: boolean;
  dataReady: boolean;
  cart: CartLine[];
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  activeView: ViewId;

  // hydration
  setUser: (user: AppUser | null) => void;
  hydrateFromPath: (pathname: string) => void;
  loadAll: () => Promise<void>;
  loadCore: () => Promise<void>;

  // chrome
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setActiveView: (view: ViewId) => void;

  // cart (delegates to the pure seam)
  addProduct: (line: CartLine) => void;
  changeQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  resetCart: () => void;

  // collection mutations
  upsertProduct: (row: Product) => void;
  dropProduct: (id: string) => void;
  upsertCategory: (row: Category) => void;
  dropCategory: (id: string) => void;
  upsertRegister: (row: RegisterRow) => void;
  dropRegister: (id: string) => void;
  setShifts: (rows: Shift[]) => void;
  upsertShift: (row: Shift) => void;
  addSale: (row: Sale) => void;
  setSettings: (row: StoreSettingsRow) => void;
  setCashiers: (rows: Cashier[]) => void;
  upsertCashier: (row: Cashier) => void;
  dropCashier: (id: string) => void;
};

const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

const persistCollapsed = (collapsed: boolean): void => {
  try {
    if (collapsed) localStorage.setItem(SIDEBAR_COLLAPSED_KEY, "1");
    else localStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
  } catch {
    // storage unavailable (private mode) — collapse stays session-only
  }
};

export const usePosStore = create<PosStore>((set, get) => ({
  products: [],
  categories: [],
  registers: [],
  shifts: [],
  sales: [],
  cashiers: [],
  settings: null,
  user: null,
  hydrated: false,
  dataReady: false,
  cart: [],
  sidebarCollapsed: false,
  mobileNavOpen: false,
  activeView: "terminal",

  setUser: (user) => set({ user, hydrated: true }),

  hydrateFromPath: (pathname) => {
    const view = viewFromPath(pathname);
    if (view) set({ activeView: view });
    if (typeof window !== "undefined") {
      set({ sidebarCollapsed: readCollapsed() });
    }
  },

  loadAll: async () => {
    const [products, categories, registers, shifts, sales] = await Promise.all([
      apiGet<Product[]>("/api/products").catch(() => []),
      apiGet<Category[]>("/api/categories").catch(() => []),
      apiGet<RegisterRow[]>("/api/registers").catch(() => []),
      apiGet<Shift[]>("/api/shifts").catch(() => []),
      apiGet<Sale[]>("/api/sales").catch(() => []),
    ]);
    set({ products, categories, registers, shifts, sales, dataReady: true });
  },

  loadCore: async () => {
    const [shifts, settings] = await Promise.all([
      apiGet<Shift[]>("/api/shifts?status=active").catch(() => []),
      apiGet<StoreSettingsRow>("/api/store-settings").catch(() => null),
    ]);
    set({ shifts, settings });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    persistCollapsed(next);
    set({ sidebarCollapsed: next });
  },

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  addProduct: (line) => set({ cart: addToCart(get().cart, line) }),
  changeQty: (productId, qty) => set({ cart: cartSetQty(get().cart, productId, qty) }),
  removeLine: (productId) => set({ cart: removeFromCart(get().cart, productId) }),
  resetCart: () => set({ cart: clearCart() }),

  upsertProduct: (row) =>
    set({
      products: get().products.some((p) => p.id === row.id)
        ? get().products.map((p) => (p.id === row.id ? row : p))
        : [row, ...get().products],
    }),
  dropProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),

  upsertCategory: (row) =>
    set({
      categories: get().categories.some((c) => c.id === row.id)
        ? get().categories.map((c) => (c.id === row.id ? row : c))
        : [...get().categories, row],
    }),
  dropCategory: (id) => set({ categories: get().categories.filter((c) => c.id !== id) }),

  upsertRegister: (row) =>
    set({
      registers: get().registers.some((r) => r.id === row.id)
        ? get().registers.map((r) => (r.id === row.id ? row : r))
        : [...get().registers, row],
    }),
  dropRegister: (id) => set({ registers: get().registers.filter((r) => r.id !== id) }),

  setShifts: (rows) => set({ shifts: rows }),
  upsertShift: (row) =>
    set({
      shifts: get().shifts.some((s) => s.id === row.id)
        ? get().shifts.map((s) => (s.id === row.id ? row : s))
        : [row, ...get().shifts],
    }),

  addSale: (row) => set({ sales: [row, ...get().sales] }),

  setSettings: (row) => set({ settings: row }),

  setCashiers: (rows) => set({ cashiers: rows }),
  upsertCashier: (row) =>
    set({
      cashiers: get().cashiers.some((c) => c.id === row.id)
        ? get().cashiers.map((c) => (c.id === row.id ? row : c))
        : [row, ...get().cashiers],
    }),
  dropCashier: (id) => set({ cashiers: get().cashiers.filter((c) => c.id !== id) }),
}));

// ---- derived helpers (pure, store-independent) -------------------------------

export function cartChargeEnabled(cart: CartLine[]): boolean {
  return cartCanCharge(cart);
}

export function cartTotalDisplay(cart: CartLine[], currency: string): string {
  return cartTotals(cart, currency).totalDisplay;
}

/** The api helper the store uses for mutations (re-exported for views). */
export { apiGet, apiSend };

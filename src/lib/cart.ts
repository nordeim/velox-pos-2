// ---------------------------------------------------------------------------
// The cart domain: immutable reducer + derived totals + the charge gate.
// Pure — unit-pinned by tests/unit/cart.test.ts. The UI store consumes these;
// components never do arithmetic themselves (the pure-seam rule).
// ---------------------------------------------------------------------------

import { computeTotals, formatMoney, lineTotalCents, round2 } from "./money";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  taxRate: number;
  unit?: string;
  image?: string | null;
};

export type CartTotals = {
  subtotal: number;
  taxTotal: number;
  itemCount: number;
  total: number;
  totalDisplay: string;
};

/** Add one unit of a product (or insert the line). Caps qty at 999. */
export function addToCart(cart: CartLine[], product: CartLine): CartLine[] {
  const existing = cart.find((l) => l.productId === product.productId);
  if (!existing) return [...cart, { ...product, qty: Math.min(1, Math.max(1, product.qty)) }];
  return cart.map((l) =>
    l.productId === product.productId ? { ...l, qty: Math.min(999, l.qty + 1) } : l,
  );
}

/** Set an explicit quantity (0 removes the line). */
export function setQty(cart: CartLine[], productId: string, qty: number): CartLine[] {
  if (qty <= 0) return cart.filter((l) => l.productId !== productId);
  return cart.map((l) => (l.productId === productId ? { ...l, qty: Math.min(999, qty) } : l));
}

export function removeFromCart(cart: CartLine[], productId: string): CartLine[] {
  return cart.filter((l) => l.productId !== productId);
}

export function clearCart(): CartLine[] {
  return [];
}

/** Derived totals + display strings (the CHARGE button's label). */
export function cartTotals(cart: CartLine[], currency = "USD"): CartTotals {
  const t = computeTotals(cart);
  const itemCount = cart.reduce((n, l) => n + l.qty, 0);
  return {
    subtotal: t.subtotal,
    taxTotal: t.taxTotal,
    itemCount,
    total: t.total,
    totalDisplay: formatMoney(t.total, currency),
  };
}

/** The CHARGE button's gate: a non-empty cart AND a strictly positive total. */
export function canCharge(cart: CartLine[]): boolean {
  return cart.length > 0 && lineTotalCents(cart.reduce((s, l) => s + l.price * l.qty, 0), 1) > 0
    ? cartTotals(cart).total > 0
    : false;
}

/** Cash checkout: change due (never negative). */
export function changeDue(total: number, amountPaid: number): number {
  return round2(Math.max(0, amountPaid - total));
}

/** The sequential ticket label for the n-th sale of a store. */
export function ticketLabel(n: number): string {
  return `T-${String(Math.max(1, n)).padStart(6, "0")}`;
}

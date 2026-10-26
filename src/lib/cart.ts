// ---------------------------------------------------------------------------
// Cart seam — the Terminal's shopping cart as a pure state machine. The view
// holds CartLine[] + dispatches these helpers; totals are derived, never
// stored in component state.
// ---------------------------------------------------------------------------

import { lineTotalCents, taxOnCents, toCents } from "./money";

export type CartLine = {
  productId: string;
  name: string;
  /** price per unit in cents */
  priceCents: number;
  qty: number;
  taxRate: number;
};

export type CartTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
};

export const PAYMENT_METHODS = ["cash", "card", "transfer", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

/** Add a product (or bump qty when already present). Pure. */
export function addToCart(
  lines: CartLine[],
  item: Omit<CartLine, "qty">,
  qty = 1,
): CartLine[] {
  const existing = lines.find((l) => l.productId === item.productId);
  if (existing) {
    return lines.map((l) =>
      l.productId === item.productId
        ? { ...l, qty: Math.min(9999, l.qty + Math.max(1, Math.trunc(qty))) }
        : l,
    );
  }
  return [...lines, { ...item, qty: Math.max(1, Math.trunc(qty)) }];
}

/** Set an exact quantity (0 removes the line). Pure. */
export function setQty(lines: CartLine[], productId: string, qty: number): CartLine[] {
  const safe = Math.min(9999, Math.max(0, Math.trunc(qty)));
  if (safe === 0) return lines.filter((l) => l.productId !== productId);
  return lines.map((l) => (l.productId === productId ? { ...l, qty: safe } : l));
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function clearCart(): CartLine[] {
  return [];
}

/** Derive the ticket totals: subtotal, per-line tax summed, discount,
 *  total (never negative). Accepts any line shape carrying price/qty/tax. */
export function buildCartTotals(
  lines: Array<Pick<CartLine, "priceCents" | "qty" | "taxRate">>,
  discountCents = 0,
): CartTotals {
  let subtotal = 0;
  let tax = 0;
  let itemCount = 0;
  for (const line of lines) {
    const lineTotal = lineTotalCents(line.priceCents, line.qty);
    subtotal += lineTotal;
    tax += taxOnCents(lineTotal, line.taxRate);
    itemCount += line.qty;
  }
  const discount = Math.max(0, Math.trunc(discountCents));
  const total = Math.max(0, subtotal + tax - discount);
  return { subtotal, tax, discount, total, itemCount };
}

/** Change due for a cash payment (never negative). */
export function changeDue(totalCents: number, paidCents: number): number {
  return Math.max(0, Math.trunc(paidCents) - Math.trunc(totalCents));
}

/** Suggest the next cash-tender denomination (round up to 50 cents) so the
 *  quick-cash buttons land on payable amounts. */
export function suggestCashTender(totalCents: number): number {
  return Math.max(0, Math.ceil(Math.max(0, totalCents) / 50) * 50);
}

/** Parse a scanner/keyboard barcode line: digits (and common check chars)
 *  only, trimmed; null when the input cannot be a barcode. */
export function parseBarcodeInput(raw: string): string | null {
  const value = raw.trim();
  if (!/^[0-9A-Za-z\-_]{4,32}$/.test(value)) return null;
  return value;
}

/** Receipt lines for printing/preview: derived from the cart at charge time. */
export type ReceiptLine = { name: string; qty: number; priceCents: number; lineTotalCents: number };

export function buildReceipt(lines: CartLine[]): ReceiptLine[] {
  return lines.map((l) => ({
    name: l.name,
    qty: l.qty,
    priceCents: l.priceCents,
    lineTotalCents: lineTotalCents(l.priceCents, l.qty),
  }));
}

/** Coerce a price input (dollars) into cents via the shared money seam. */
export function priceInputToCents(input: number | string): number {
  return toCents(input);
}

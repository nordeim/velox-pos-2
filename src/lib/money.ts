// ---------------------------------------------------------------------------
// Money math. Every amount in the app flows through here — dollars at the
// edges (schema, display), integer cents in the middle (never float math).
// Pure — unit-pinned by tests/unit/money.test.ts.
// ---------------------------------------------------------------------------

/** Round half-up to a 2-decimal dollar amount. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Dollars → integer cents (half-up on the 3rd decimal). */
export function toCents(dollars: number): number {
  return Math.round((dollars + Number.EPSILON) * 100);
}

/** Integer cents → 2-decimal dollars. */
export function fromCents(cents: number): number {
  return round2(cents / 100);
}

/** A single cart/sale line total: price × qty, in cents. */
export function lineTotalCents(price: number, qty: number): number {
  return toCents(price) * Math.max(0, Math.round(qty));
}

/** Tax for a line: line total × rate% (rate in percent, e.g. 16). */
export function lineTaxCents(price: number, qty: number, taxRate: number): number {
  return Math.round((lineTotalCents(price, qty) * Math.max(0, taxRate)) / 100);
}

export type SaleTotals = {
  subtotal: number;
  taxTotal: number;
  total: number;
};

/** Totals for a set of lines (dollars in, dollars out — rounded to 2dp). */
export function computeTotals(
  lines: Array<{ price: number; qty: number; taxRate: number }>,
): SaleTotals {
  const subtotal = lines.reduce((sum, l) => sum + lineTotalCents(l.price, l.qty), 0);
  const taxTotal = lines.reduce((sum, l) => sum + lineTaxCents(l.price, l.qty, l.taxRate), 0);
  return {
    subtotal: fromCents(subtotal),
    taxTotal: fromCents(taxTotal),
    total: fromCents(subtotal + taxTotal),
  };
}

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  MXN: "es-MX",
  CAD: "en-CA",
  AUD: "en-AU",
  PEN: "es-PE",
  COP: "es-CO",
};

/** Format a dollar amount with the store's currency ($0.00 by default). */
export function formatMoney(amount: number, currency = "USD"): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${round2(safe).toFixed(2)}`;
  }
}

/** The bare symbol for compact chips (CHARGE $0.00, stat cards). */
export function currencySymbol(currency = "USD"): string {
  return formatMoney(0, currency).replace(/[\d.,\s]/g, "");
}

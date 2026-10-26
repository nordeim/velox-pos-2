// ---------------------------------------------------------------------------
// Money seam — integer-cents math and formatting. All monetary math in the
// app flows through here; floats never touch storage (schema *Cents columns).
// ---------------------------------------------------------------------------

/** Parse a decimal string/number into integer cents, banker-safe for the
 *  two-decimal POS domain (rounds half away from zero on the 3rd decimal). */
export function toCents(input: number | string): number {
  const value = typeof input === "string" ? Number.parseFloat(input) : input;
  if (!Number.isFinite(value)) return 0;
  const sign = value < 0 ? -1 : 1;
  const abs = Math.round(Math.abs(value) * 1000);
  // round half away from zero at the sub-cent position
  const cents = Math.floor(abs / 10) + (abs % 10 >= 5 ? 1 : 0);
  return sign * cents;
}

/** cents -> "$12.34" (USD by default; never negative-zero). */
export function formatMoney(cents: number, currency = "USD"): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${(safe / 100).toFixed(2)}`;
}

/** cents -> plain "12.34" (form inputs). */
export function centsToDecimalString(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  return (safe / 100).toFixed(2);
}

/** Line total for a cart/product line: price * qty (tax applied at the
 *  cart level so mixed-rate tickets round predictably). */
export function lineTotalCents(priceCents: number, qty: number): number {
  const safeQty = Math.max(0, Math.trunc(qty));
  return Math.max(0, Math.trunc(priceCents)) * safeQty;
}

/** Per-line tax at the given percent, half-up on the sub-cent. */
export function taxOnCents(amountCents: number, taxRatePercent: number): number {
  const rate = Number.isFinite(taxRatePercent) ? taxRatePercent : 0;
  if (rate <= 0) return 0;
  return Math.round((amountCents * rate) / 100);
}

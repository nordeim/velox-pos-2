import { describe, expect, it } from "vitest";

import {
  computeTotals,
  currencySymbol,
  formatMoney,
  fromCents,
  lineTaxCents,
  lineTotalCents,
  round2,
  toCents,
} from "@/lib/money";

describe("round2 / cents conversions", () => {
  it("rounds half-up to 2dp", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(1.004)).toBe(1.0);
    expect(round2(19.719999)).toBe(19.72);
  });

  it("converts dollars to integer cents and back", () => {
    expect(toCents(19.72)).toBe(1972);
    expect(toCents(0.1 + 0.2)).toBe(30); // float drift eliminated
    expect(fromCents(1972)).toBe(19.72);
    expect(fromCents(toCents(8.5) * 2)).toBe(17);
  });
});

describe("line math", () => {
  it("line total = price × qty in cents", () => {
    expect(lineTotalCents(8.5, 2)).toBe(1700);
    expect(lineTotalCents(0.1, 3)).toBe(30);
    expect(lineTotalCents(1.0, 0)).toBe(0);
  });

  it("line tax = total × rate%", () => {
    expect(lineTaxCents(8.5, 2, 16)).toBe(272);
    expect(lineTaxCents(10, 1, 0)).toBe(0);
  });

  it("computeTotals aggregates subtotal/tax/total", () => {
    const t = computeTotals([
      { price: 8.5, qty: 2, taxRate: 16 },
      { price: 3.4, qty: 1, taxRate: 16 },
    ]);
    expect(t.subtotal).toBe(20.4);
    expect(t.taxTotal).toBe(3.26);
    expect(t.total).toBe(23.66);
  });

  it("computeTotals handles mixed rates and an empty cart", () => {
    const t = computeTotals([
      { price: 10, qty: 1, taxRate: 0 },
      { price: 10, qty: 1, taxRate: 10 },
    ]);
    expect(t.subtotal).toBe(20);
    expect(t.taxTotal).toBe(1);
    expect(t.total).toBe(21);
    expect(computeTotals([])).toEqual({ subtotal: 0, taxTotal: 0, total: 0 });
  });
});

describe("formatMoney", () => {
  it("formats with the store currency", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
    expect(formatMoney(19.72, "USD")).toBe("$19.72");
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
  });

  it("switches locale/symbol by currency", () => {
    expect(formatMoney(5, "EUR")).toContain("5,00");
    expect(currencySymbol("USD")).toBe("$");
  });

  it("falls back to $ for non-numbers (NaN renders as $0.00)", () => {
    expect(formatMoney(Number.NaN, "USD")).toBe("$0.00");
    expect(formatMoney(Number.POSITIVE_INFINITY, "USD")).toBe("$0.00");
  });
});

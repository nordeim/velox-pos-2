// ---------------------------------------------------------------------------
// money.ts — the integer-cents contract. Every monetary behavior the POS
// guarantees rides on these primitives.
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  centsToDecimalString,
  formatMoney,
  lineTotalCents,
  taxOnCents,
  toCents,
} from "../src/lib/money";

describe("toCents", () => {
  it("converts two-decimal dollars exactly", () => {
    expect(toCents("3.50")).toBe(350);
    expect(toCents(3.5)).toBe(350);
    expect(toCents(0.1)).toBe(10);
  });

  it("rounds half away from zero on the third decimal", () => {
    expect(toCents("1.805")).toBe(181);
    expect(toCents("1.804")).toBe(180);
  });

  it("maps non-finite input to zero", () => {
    expect(toCents(Number.NaN)).toBe(0);
    expect(toCents("abc")).toBe(0);
    expect(toCents(Infinity)).toBe(0);
  });
});

describe("formatMoney", () => {
  it("formats USD with the leading symbol", () => {
    expect(formatMoney(1234)).toBe("$12.34");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(5)).toBe("$0.05");
  });

  it("supports other currency codes as a prefix", () => {
    expect(formatMoney(1000, "EUR")).toBe("EUR 10.00");
  });

  it("never renders NaN", () => {
    expect(formatMoney(Number.NaN)).toBe("$0.00");
  });
});

describe("centsToDecimalString", () => {
  it("round-trips with toCents", () => {
    expect(centsToDecimalString(350)).toBe("3.50");
    expect(centsToDecimalString(0)).toBe("0.00");
  });
});

describe("lineTotalCents", () => {
  it("multiplies price by qty", () => {
    expect(lineTotalCents(350, 3)).toBe(1050);
  });

  it("clamps negative qty/price to zero", () => {
    expect(lineTotalCents(350, -2)).toBe(0);
    expect(lineTotalCents(-350, 2)).toBe(0);
  });

  it("truncates fractional qty", () => {
    expect(lineTotalCents(100, 2.9)).toBe(200);
  });
});

describe("taxOnCents", () => {
  it("applies the percent and rounds the sub-cent", () => {
    expect(taxOnCents(1000, 16)).toBe(160);
    expect(taxOnCents(1050, 16)).toBe(168); // 168.0
    expect(taxOnCents(333, 5)).toBe(17); // 16.65 → 17
  });

  it("returns zero for non-positive rates", () => {
    expect(taxOnCents(1000, 0)).toBe(0);
    expect(taxOnCents(1000, -5)).toBe(0);
  });
});

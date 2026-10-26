// ---------------------------------------------------------------------------
// cart.ts — the Terminal's cart state machine + totals + cash math.
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  addToCart,
  buildCartTotals,
  changeDue,
  isPaymentMethod,
  parseBarcodeInput,
  removeLine,
  setQty,
  suggestCashTender,
  type CartLine,
} from "../src/lib/cart";

const espresso: CartLine = {
  productId: "p1",
  name: "Espresso",
  priceCents: 350,
  qty: 2,
  taxRate: 16,
};
const muffin: CartLine = {
  productId: "p2",
  name: "Muffin",
  priceCents: 320,
  qty: 1,
  taxRate: 16,
};

describe("addToCart", () => {
  it("appends a new line", () => {
    const lines = addToCart(
      [],
      { productId: "p1", name: "Espresso", priceCents: 350, taxRate: 16 },
      1,
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(1);
  });

  it("bumps qty for an existing product", () => {
    const lines = addToCart([espresso], { productId: "p1", name: "Espresso", priceCents: 350, taxRate: 16 });
    expect(lines[0].qty).toBe(3);
  });

  it("never adds below one", () => {
    const lines = addToCart([], { productId: "p1", name: "Espresso", priceCents: 350, taxRate: 16 }, 0);
    expect(lines[0].qty).toBe(1);
  });
});

describe("setQty / removeLine", () => {
  it("zero removes the line", () => {
    const lines = setQty([espresso, muffin], "p1", 0);
    expect(lines).toEqual([muffin]);
  });

  it("sets an exact quantity", () => {
    const lines = setQty([espresso], "p1", 7);
    expect(lines[0].qty).toBe(7);
  });

  it("removes by id", () => {
    expect(removeLine([espresso, muffin], "p2")).toEqual([espresso]);
  });
});

describe("buildCartTotals", () => {
  it("sums subtotal, per-line tax, and total", () => {
    const totals = buildCartTotals([espresso, muffin]);
    expect(totals.subtotal).toBe(350 * 2 + 320);
    expect(totals.tax).toBe(taxOf(700) + taxOf(320));
    expect(totals.total).toBe(totals.subtotal + totals.tax);
    expect(totals.itemCount).toBe(3);
  });

  it("applies the discount but never goes negative", () => {
    const totals = buildCartTotals([espresso], 999_999);
    expect(totals.total).toBe(0);
    expect(totals.discount).toBe(999_999);
  });
});

function taxOf(amount: number): number {
  return Math.round((amount * 16) / 100);
}

describe("cash math", () => {
  it("computes change due (never negative)", () => {
    expect(changeDue(1000, 1200)).toBe(200);
    expect(changeDue(1000, 500)).toBe(0);
  });

  it("suggests a payable tender rounded to 50 cents", () => {
    expect(suggestCashTender(1001)).toBe(1050);
    expect(suggestCashTender(1000)).toBe(1000);
  });
});

describe("payment methods + barcode", () => {
  it("validates the method union", () => {
    expect(isPaymentMethod("cash")).toBe(true);
    expect(isPaymentMethod("crypto")).toBe(false);
  });

  it("accepts plausible barcodes, rejects noise", () => {
    expect(parseBarcodeInput(" 7501234567890 ")).toBe("7501234567890");
    expect(parseBarcodeInput("AB-12_CD")).toBe("AB-12_CD");
    expect(parseBarcodeInput("abc")).toBeNull();
    expect(parseBarcodeInput("hello world!")).toBeNull();
    expect(parseBarcodeInput("")).toBeNull();
  });
});

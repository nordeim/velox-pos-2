import { describe, expect, it } from "vitest";

import {
  addToCart,
  canCharge,
  cartTotals,
  changeDue,
  removeFromCart,
  setQty,
  ticketLabel,
  type CartLine,
} from "@/lib/cart";

const line = (overrides: Partial<CartLine> = {}): CartLine => ({
  productId: "p1",
  name: "Espresso Beans",
  price: 8.5,
  qty: 1,
  taxRate: 16,
  ...overrides,
});

describe("cart mutations", () => {
  it("adds a new line and increments an existing one", () => {
    let cart = addToCart([], line());
    expect(cart).toHaveLength(1);
    cart = addToCart(cart, line());
    expect(cart[0].qty).toBe(2);
    expect(cart).toHaveLength(1);
  });

  it("never lets qty exceed 999 on increment", () => {
    let cart = addToCart([], line());
    cart = setQty(cart, "p1", 999);
    expect(addToCart(cart, line())[0].qty).toBe(999);
  });

  it("setQty removes at 0 and clamps at 999", () => {
    let cart = addToCart([], line());
    expect(setQty(cart, "p1", 0)).toHaveLength(0);
    cart = setQty(cart, "p1", 1000);
    expect(cart[0].qty).toBe(999);
    expect(setQty(cart, "missing", 3)).toHaveLength(1);
  });

  it("removeFromCart / setQty are immutable", () => {
    const cart = addToCart([], line());
    const next = removeFromCart(cart, "p1");
    expect(cart).toHaveLength(1);
    expect(next).toHaveLength(0);
  });
});

describe("totals + the charge gate", () => {
  it("computes subtotal/tax/itemCount/total", () => {
    const cart = [
      line({ price: 8.5, qty: 2, taxRate: 16 }),
      line({ productId: "p2", name: "Juice", price: 3.4, qty: 1 }),
    ];
    const t = cartTotals(cart, "USD");
    expect(t.subtotal).toBe(20.4);
    expect(t.taxTotal).toBe(3.26);
    expect(t.itemCount).toBe(3);
    expect(t.total).toBe(23.66);
    expect(t.totalDisplay).toBe("$23.66");
  });

  it("the charge gate needs items AND a positive total", () => {
    expect(canCharge([])).toBe(false);
    expect(canCharge([line({ price: 0 })])).toBe(false);
    expect(canCharge([line()])).toBe(true);
  });

  it("change due never goes negative", () => {
    expect(changeDue(19.72, 20)).toBe(0.28);
    expect(changeDue(19.72, 10)).toBe(0);
  });
});

describe("ticket labels", () => {
  it("formats the sequential T-XXXXXX form", () => {
    expect(ticketLabel(1)).toBe("T-000001");
    expect(ticketLabel(1234)).toBe("T-001234");
    expect(ticketLabel(0)).toBe("T-000001"); // never T-000000
  });
});

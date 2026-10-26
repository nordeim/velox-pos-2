import { describe, expect, it } from "vitest";

import {
  cashierCreateSchema,
  categoryCreateSchema,
  productCreateSchema,
  registerCreateSchema,
  saleCreateSchema,
  shiftCloseSchema,
  shiftOpenSchema,
  storeSettingsUpdateSchema,
} from "@/lib/validation";

describe("productCreateSchema", () => {
  const valid = {
    name: "Espresso Beans",
    barcode: "7501234567811",
    categoryId: null,
    price: 8.5,
    stock: 24,
    minStock: 5,
    taxRate: 16,
    unit: "Piece",
    active: true,
  };

  it("accepts the canonical payload and defaults optionals", () => {
    const parsed = productCreateSchema.parse(valid);
    expect(parsed.barcode).toBe("7501234567811");
    expect(parsed.cost).toBeNull();
    expect(parsed.image).toBeNull();
  });

  it("strips unknown keys (the strip-mode convention)", () => {
    const parsed = productCreateSchema.parse({ ...valid, hacker: "x" } as Record<string, unknown>);
    expect("hacker" in parsed).toBe(false);
  });

  it("rejects empty names, negative money, bad units, non-hex data URLs", () => {
    expect(productCreateSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...valid, unit: "Banana" }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...valid, image: "javascript:alert(1)" }).success).toBe(
      false,
    );
  });

  it("tax rate is a percent (0..100)", () => {
    expect(productCreateSchema.safeParse({ ...valid, taxRate: 101 }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...valid, taxRate: 16.5 }).success).toBe(true);
  });
});

describe("register + shift schemas", () => {
  it("register: location optional, empty name rejected", () => {
    expect(registerCreateSchema.parse({ name: "Register 1" })).toEqual({
      name: "Register 1",
      location: "",
    });
    expect(registerCreateSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("shift open requires a registerId; close requires counted ≥ 0", () => {
    expect(shiftOpenSchema.safeParse({}).success).toBe(false);
    expect(shiftOpenSchema.parse({ registerId: "r1" }).openingFloat).toBe(0);
    expect(shiftCloseSchema.safeParse({ countedCash: -1 }).success).toBe(false);
  });
});

describe("saleCreateSchema (checkout)", () => {
  const item = { productId: "p1", name: "Juice", price: 3.4, qty: 2, taxRate: 16 };

  it("accepts a cash sale without customer/amountPaid omissions crashing", () => {
    const parsed = saleCreateSchema.parse({
      items: [item],
      paymentMethod: "cash",
      amountPaid: 10,
    });
    expect(parsed.customer).toBe("");
    expect(parsed.amountPaid).toBe(10);
  });

  it("rejects an empty cart and out-of-range qty", () => {
    expect(saleCreateSchema.safeParse({ items: [], paymentMethod: "cash" }).success).toBe(false);
    expect(
      saleCreateSchema.safeParse({ items: [{ ...item, qty: 0 }], paymentMethod: "cash" }).success,
    ).toBe(false);
    expect(
      saleCreateSchema.safeParse({ items: [item], paymentMethod: "bitcoin" }).success,
    ).toBe(false);
  });
});

describe("storeSettingsUpdateSchema", () => {
  it("accepts the reference defaults and validates colors/currency", () => {
    const parsed = storeSettingsUpdateSchema.parse({
      storeName: "My Store",
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      currency: "USD",
      receiptFooter: "Thank you for your purchase!",
      cardProvider: "none",
      hideFiscalOnReceipt: false,
    });
    expect(parsed.storeName).toBe("My Store");
  });

  it("rejects bad hex colors, unsupported currencies/providers", () => {
    const base = { storeName: "S", primaryColor: "#6366f1", secondaryColor: "#8b5cf6" };
    expect(storeSettingsUpdateSchema.safeParse({ ...base, currency: "BTC" }).success).toBe(false);
    expect(storeSettingsUpdateSchema.safeParse({ ...base, primaryColor: "violet" }).success).toBe(
      false,
    );
    expect(storeSettingsUpdateSchema.safeParse({ ...base, cardProvider: "PayPal" }).success).toBe(
      false,
    );
  });
});

describe("category + cashier schemas", () => {
  it("category requires a name; hex color defaults to violet", () => {
    expect(categoryCreateSchema.parse({ name: "Beverages" })).toEqual({
      name: "Beverages",
      color: "#8b5cf6",
    });
    expect(categoryCreateSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("cashier creation needs a valid email and an 8+ password", () => {
    expect(cashierCreateSchema.safeParse({ fullName: "A", email: "nope", password: "12345678" }).success).toBe(false);
    expect(cashierCreateSchema.safeParse({ fullName: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(cashierCreateSchema.parse({ fullName: "Cashier", email: "c@b.co", password: "longenough1" }).fullName).toBe("Cashier");
  });
});

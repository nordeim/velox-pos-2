// ---------------------------------------------------------------------------
// validation.ts — the Zod boundary contracts: dollars→cents moneyInput,
// unit/role enums, the auth schemas (including the delete confirmation),
// the sale payload, and the settings partial.
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  accountUpdateSchema,
  cashierCreateSchema,
  categoryCreateSchema,
  changeEmailSchema,
  deleteAccountSchema,
  productCreateSchema,
  registerCreateSchema,
  saleCreateSchema,
  settingsUpdateSchema,
  shiftCloseSchema,
  shiftOpenSchema,
} from "../src/lib/validation";

describe("productCreateSchema", () => {
  it("maps dollar strings to integer cents", () => {
    const parsed = productCreateSchema.parse({
      name: "Espresso",
      barcode: "7501234567890",
      price: "3.50",
      cost: "1.805",
    });
    expect(parsed.price).toBe(350);
    expect(parsed.cost).toBe(181); // half-up at the sub-cent
  });

  it("applies the reference defaults (stock 0, min 5, tax 16, Piece, active)", () => {
    const parsed = productCreateSchema.parse({
      name: "Espresso",
      barcode: "1",
      price: 1,
    });
    expect(parsed.stock).toBe(0);
    expect(parsed.minStock).toBe(5);
    expect(parsed.taxRate).toBe(16);
    expect(parsed.unit).toBe("Piece");
    expect(parsed.active).toBe(true);
  });

  it("maps empty-string category to null and rejects bad units", () => {
    const parsed = productCreateSchema.parse({
      name: "X",
      barcode: "1",
      price: 1,
      categoryId: "",
    });
    expect(parsed.categoryId).toBeNull();
    expect(() =>
      productCreateSchema.parse({ name: "X", barcode: "1", price: 1, unit: "Pallet" }),
    ).toThrow();
  });
});

describe("auth schemas", () => {
  it("requires the typed DELETE confirmation", () => {
    expect(() =>
      deleteAccountSchema.parse({ password: "pw", confirmation: "delete" }),
    ).toThrow();
    expect(
      deleteAccountSchema.parse({ password: "pw", confirmation: "DELETE" }).confirmation,
    ).toBe("DELETE");
  });

  it("change-email requires matching addresses", () => {
    expect(() =>
      changeEmailSchema.parse({
        password: "pw",
        newEmail: "a@b.co",
        confirmEmail: "x@b.co",
      }),
    ).toThrow();
    expect(
      changeEmailSchema.parse({
        password: "pw",
        newEmail: "a@b.co",
        confirmEmail: "a@b.co",
      }).newEmail,
    ).toBe("a@b.co");
  });
});

describe("sale schema", () => {
  it("requires at least one item and coerces money fields", () => {
    const parsed = saleCreateSchema.parse({
      registerId: "r1",
      items: [{ productId: "p1", qty: 2 }],
      discount: "1.25",
      paid: 10,
    });
    expect(parsed.items).toHaveLength(1);
    expect(parsed.discount).toBe(125);
    expect(parsed.paid).toBe(1000);
    expect(parsed.method).toBe("cash");
    expect(() => saleCreateSchema.parse({ registerId: "r1", items: [] })).toThrow();
  });
});

describe("shifts + registers + categories + cashiers + settings", () => {
  it("shift-open accepts a dollar float", () => {
    expect(shiftOpenSchema.parse({ registerId: "r1", openingFloat: "100.5" }).openingFloat).toBe(10050);
    expect(shiftOpenSchema.parse({ registerId: "r1" }).openingFloat).toBe(0);
  });

  it("shift-close requires the counted cash", () => {
    expect(shiftCloseSchema.parse({ closingCash: "114.10" }).closingCash).toBe(11410);
    expect(() => shiftCloseSchema.parse({})).toThrow();
  });

  it("register names are required; locations optional", () => {
    expect(registerCreateSchema.parse({ name: "Register 1" })).toMatchObject({
      name: "Register 1",
      location: "",
    });
    expect(() => registerCreateSchema.parse({})).toThrow();
  });

  it("category colors default to the brand violet", () => {
    expect(categoryCreateSchema.parse({ name: "Beverages" }).color).toBe("#7c3aed");
    expect(() => categoryCreateSchema.parse({ name: "B", color: "red" })).toThrow();
  });

  it("cashier roles default to cashier", () => {
    expect(cashierCreateSchema.parse({ name: "A", email: "a@b.co", password: "12345678" }).role).toBe("cashier");
  });

  it("settings currency upper-cases", () => {
    expect(settingsUpdateSchema.parse({ currency: "eur" }).currency).toBe("EUR");
  });

  it("account updates carry name + phone", () => {
    expect(accountUpdateSchema.parse({ name: "Sam", phone: "" })).toMatchObject({ name: "Sam" });
  });
});

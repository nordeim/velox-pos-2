import { describe, expect, it } from "vitest";

import {
  isUnit,
  lowStockCount,
  parseCsv,
  parseCsvRow,
  PRODUCT_CSV_HEADER,
  productsToCsv,
  stockStatus,
  UNITS,
} from "@/lib/inventory-status";

describe("stockStatus", () => {
  it("out ≤ 0, low ≤ minStock, ok above", () => {
    expect(stockStatus(0, 5)).toBe("out");
    expect(stockStatus(-3, 5)).toBe("out");
    expect(stockStatus(5, 5)).toBe("low");
    expect(stockStatus(3, 5)).toBe("low");
    expect(stockStatus(6, 5)).toBe("ok");
  });
});

describe("lowStockCount", () => {
  it("counts active products at/below minimum only", () => {
    expect(
      lowStockCount([
        { stock: 0, minStock: 5, active: true },
        { stock: 4, minStock: 5, active: true },
        { stock: 10, minStock: 5, active: true },
        { stock: 0, minStock: 5, active: false }, // inactive ignored
      ]),
    ).toBe(2);
  });
});

describe("units", () => {
  it("the reference's unit list is Piece-first", () => {
    expect(UNITS[0]).toBe("Piece");
    expect(UNITS).toContain("Kg");
    expect(isUnit("Piece")).toBe(true);
    expect(isUnit("Banana")).toBe(false);
  });
});

describe("CSV round-trip", () => {
  it("exports the documented header + rows (quoted commas safe)", () => {
    const csv = productsToCsv([
      {
        name: "Beans, Black",
        barcode: "7501",
        categoryName: "Groceries",
        price: 8.5,
        cost: 5.2,
        stock: 24,
        minStock: 5,
        taxRate: 16,
        unit: "Piece",
        active: true,
      },
    ]);
    const [header, row] = csv.split("\n");
    expect(header).toBe(PRODUCT_CSV_HEADER.join(","));
    expect(row).toContain('"Beans, Black"');
    expect(row).toContain("Groceries");
  });

  it("parses quoted commas and escaped quotes", () => {
    const rows = parseCsv('name,price\n"Chips, Salt",2.2\n"Say ""hi""",3\n');
    expect(rows).toEqual([["name", "price"], ["Chips, Salt", "2.2"], ['Say "hi"', "3"]]);
  });

  it("parseCsvRow applies the documented defaults and rejects bad names", () => {
    const row = parseCsvRow(["Juice", "7501", "Beverages", "3.4", "", "40", "8", "16", "Piece", "true"]);
    expect(row).toMatchObject({
      name: "Juice",
      cost: null,
      minStock: 8,
      active: true,
    });
    const defaulted = parseCsvRow(["Gum"]);
    expect(defaulted).toMatchObject({ price: 0, stock: 0, minStock: 5, taxRate: 16, unit: "Piece" });
    expect(() => parseCsvRow(["", "x"])).toThrow("name is required");
    expect(() => parseCsvRow(["Gum", "", "", "not-a-number"])).toThrow("invalid number");
  });

  it("skips blank lines entirely", () => {
    expect(parseCsv("a,b\n\n\nc,d\n")).toEqual([["a", "b"], ["c", "d"]]);
  });
});

// ---------------------------------------------------------------------------
// Inventory status + units + the product CSV shape.
// Pure — unit-pinned by tests/unit/inventory-status.test.ts.
// ---------------------------------------------------------------------------

export type StockStatus = "out" | "low" | "ok";

/** The STATUS column's derivation: out of stock → low (≤ minStock) → ok. */
export function stockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= minStock) return "low";
  return "ok";
}

export const UNITS = ["Piece", "Box", "Kg", "Liter", "Pack"] as const;
export type Unit = (typeof UNITS)[number];

export function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value);
}

/** The Dashboard LOW STOCK stat: active products at/below their minimum. */
export function lowStockCount(
  products: Array<{ stock: number; minStock: number; active: boolean }>,
): number {
  return products.filter((p) => p.active && stockStatus(p.stock, p.minStock) !== "ok").length;
}

// ---- the CSV superset (products import/export) -------------------------------

export const PRODUCT_CSV_HEADER = [
  "name",
  "barcode",
  "category",
  "price",
  "cost",
  "stock",
  "minStock",
  "taxRate",
  "unit",
  "active",
] as const;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Serialize products to RFC-4180 CSV (the export button's payload). */
export function productsToCsv(
  products: Array<{
    name: string;
    barcode: string;
    categoryName?: string | null;
    price: number;
    cost?: number | null;
    stock: number;
    minStock: number;
    taxRate: number;
    unit: string;
    active: boolean;
  }>,
): string {
  const rows = products.map((p) =>
    [
      p.name,
      p.barcode,
      p.categoryName ?? "",
      String(p.price),
      p.cost == null ? "" : String(p.cost),
      String(p.stock),
      String(p.minStock),
      String(p.taxRate),
      p.unit,
      p.active ? "true" : "false",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [PRODUCT_CSV_HEADER.join(","), ...rows].join("\n");
}

export type CsvProductRow = {
  name: string;
  barcode: string;
  category: string;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  taxRate: number;
  unit: string;
  active: boolean;
};

/** Parse one CSV data row (the header is NOT included). Throws on a bad cell. */
export function parseCsvRow(cells: string[]): CsvProductRow {
  const name = (cells[0] ?? "").trim();
  if (!name) throw new Error("name is required");
  const num = (raw: string | undefined, fallback: number): number => {
    const v = (raw ?? "").trim();
    if (v === "") return fallback;
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`invalid number: ${v}`);
    return n;
  };
  return {
    name,
    barcode: (cells[1] ?? "").trim(),
    category: (cells[2] ?? "").trim(),
    price: num(cells[3], 0),
    cost: (cells[4] ?? "").trim() === "" ? null : num(cells[4], 0),
    stock: num(cells[5], 0),
    minStock: num(cells[6], 5),
    taxRate: num(cells[7], 16),
    unit: (cells[8] ?? "").trim() || "Piece",
    active: (cells[9] ?? "true").trim().toLowerCase() !== "false",
  };
}

/** Split raw CSV text into rows (handles quoted commas; no header). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

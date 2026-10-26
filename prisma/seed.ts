// ---------------------------------------------------------------------------
// VeloxPOS seed — idempotent.
//
// Creates the reference-matching owner account (sepnetflix2023@outlook.com /
// $Abcd1234 — the credentials the reference site itself is logged into) with
// the reference's DEFAULT Store Settings values, and an EMPTY store: the
// reference demo account is write-restricted (every observed CREATE 403s), so
// its surfaces render their empty states — the clone matches that by default
// and fills everything through the real app (the superset requirement).
//
// `--demo` additionally populates a rich showcase dataset (categories,
// products, a register, a closed shift and a week of sales) for demos.
//
// Run via `bun run db:seed` (the script pins DATABASE_URL inline,
// schema-anchored; this file resolves the same env var through src/lib/db.ts).
// ---------------------------------------------------------------------------
import { hashPassword } from "../src/lib/auth";
import { db } from "../src/lib/db";

export const OWNER_EMAIL = "sepnetflix2023@outlook.com";
const OWNER_PASSWORD = "$Abcd1234";

async function ensureOwner(): Promise<{ id: string }> {
  const existing = await db.user.findUnique({ where: { email: OWNER_EMAIL } });
  if (existing) return existing;
  return db.user.create({
    data: {
      email: OWNER_EMAIL,
      passwordHash: hashPassword(OWNER_PASSWORD),
      fullName: "Store Owner",
      role: "owner",
      emailVerified: true,
      themeMode: "dark",
    },
  });
}

/** The reference Settings screen's own default values (measured live). */
async function ensureStoreSettings(userId: string): Promise<void> {
  const existing = await db.storeSettings.findUnique({ where: { userId } });
  if (existing) return;
  await db.storeSettings.create({
    data: {
      userId,
      storeName: "My Store",
      currency: "USD",
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      receiptFooter: "Thank you for your purchase!",
      cardProvider: "none",
    },
  });
}

// ---- the optional showcase dataset (--demo) ---------------------------------

const DEMO_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: "Beverages", color: "#8b5cf6" },
  { name: "Snacks", color: "#f59e0b" },
  { name: "Groceries", color: "#10b981" },
  { name: "Personal Care", color: "#3b82f6" },
  { name: "Electronics", color: "#ef4444" },
];

const DEMO_PRODUCTS: Array<{
  name: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
}> = [
  { name: "Espresso Beans 250g", barcode: "7501234567811", category: "Groceries", price: 8.5, cost: 5.2, stock: 24, minStock: 5, unit: "Piece" },
  { name: "Orange Juice 1L", barcode: "7501234567828", category: "Beverages", price: 3.4, cost: 2.1, stock: 40, minStock: 8, unit: "Piece" },
  { name: "Mineral Water 600ml", barcode: "7501234567835", category: "Beverages", price: 1.0, cost: 0.4, stock: 120, minStock: 24, unit: "Piece" },
  { name: "Cold Brew Can", barcode: "7501234567842", category: "Beverages", price: 2.75, cost: 1.5, stock: 6, minStock: 10, unit: "Piece" },
  { name: "Sea Salt Chips 150g", barcode: "7501234567859", category: "Snacks", price: 2.2, cost: 1.1, stock: 35, minStock: 10, unit: "Pack" },
  { name: "Dark Chocolate Bar", barcode: "7501234567866", category: "Snacks", price: 1.8, cost: 0.9, stock: 3, minStock: 6, unit: "Piece" },
  { name: "Granola Bar", barcode: "7501234567873", category: "Snacks", price: 1.5, cost: 0.7, stock: 50, minStock: 12, unit: "Pack" },
  { name: "Brown Rice 1kg", barcode: "7501234567880", category: "Groceries", price: 4.3, cost: 2.8, stock: 18, minStock: 5, unit: "Piece" },
  { name: "Olive Oil 500ml", barcode: "7501234567897", category: "Groceries", price: 7.9, cost: 5.0, stock: 12, minStock: 4, unit: "Piece" },
  { name: "Toothpaste Mint 100ml", barcode: "7501234567903", category: "Personal Care", price: 3.2, cost: 1.8, stock: 22, minStock: 6, unit: "Piece" },
  { name: "Shampoo 400ml", barcode: "7501234567910", category: "Personal Care", price: 6.4, cost: 3.9, stock: 14, minStock: 5, unit: "Piece" },
  { name: "Hand Soap Refill", barcode: "7501234567927", category: "Personal Care", price: 4.1, cost: 2.4, stock: 0, minStock: 5, unit: "Piece" },
  { name: "USB-C Cable 1m", barcode: "7501234567934", category: "Electronics", price: 9.9, cost: 5.5, stock: 16, minStock: 4, unit: "Piece" },
  { name: "Phone Stand", barcode: "7501234567941", category: "Electronics", price: 12.5, cost: 7.0, stock: 9, minStock: 3, unit: "Piece" },
  { name: "Wireless Earbuds", barcode: "7501234567958", category: "Electronics", price: 29.0, cost: 18.0, stock: 5, minStock: 2, unit: "Box" },
];

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 3600_000);
}

async function seedDemo(userId: string): Promise<void> {
  const already = await db.product.count({ where: { userId } });
  if (already > 0) {
    console.log("Seed: store already has products — demo dataset skipped.");
    return;
  }

  const categories = await Promise.all(
    DEMO_CATEGORIES.map((c) => db.category.create({ data: { ...c, userId } })),
  );
  const byName = new Map(categories.map((c) => [c.name, c.id]));

  const products = await Promise.all(
    DEMO_PRODUCTS.map((p) =>
      db.product.create({
        data: {
          userId,
          name: p.name,
          barcode: p.barcode,
          categoryId: byName.get(p.category) ?? null,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          minStock: p.minStock,
          taxRate: 16,
          unit: p.unit,
          active: true,
        },
      }),
    ),
  );

  const register = await db.register.create({
    data: { userId, name: "Register 1", location: "Main entrance", status: "closed" },
  });

  // A closed shift yesterday with a realistic cash count.
  const closedShift = await db.cashierShift.create({
    data: {
      userId,
      registerId: register.id,
      cashierId: userId,
      openedAt: hoursAgo(30),
      closedAt: hoursAgo(6),
      openingFloat: 100,
      status: "closed",
    },
  });

  // A week of sales: 3-7 tickets per day, cash/card mix, real product lines.
  const methods = ["cash", "card"] as const;
  let ticketNo = 1;
  for (let day = 6; day >= 0; day -= 1) {
    const perDay = 3 + ((day * 7) % 5);
    for (let n = 0; n < perDay; n += 1) {
      const lines = products
        .filter((_, i) => (i + day + n) % 4 === 0)
        .slice(0, 1 + ((day + n) % 3))
        .map((p) => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: 1 + ((day + n) % 2),
          taxRate: p.taxRate,
        }));
      if (lines.length === 0) continue;
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const taxTotal = lines.reduce((s, l) => s + l.price * l.qty * (l.taxRate / 100), 0);
      const total = subtotal + taxTotal;
      const paymentMethod = methods[(day + n) % 2];
      const amountPaid = paymentMethod === "cash" ? Math.ceil(total / 5) * 5 : null;
      await db.sale.create({
        data: {
          userId,
          ticket: `T-${String(ticketNo).padStart(6, "0")}`,
          items: JSON.stringify(lines),
          subtotal: Math.round(subtotal * 100) / 100,
          taxTotal: Math.round(taxTotal * 100) / 100,
          total: Math.round(total * 100) / 100,
          paymentMethod,
          amountPaid,
          changeDue: amountPaid ? Math.round((amountPaid - total) * 100) / 100 : null,
          cashierId: userId,
          registerId: register.id,
          shiftId: closedShift.id,
          createdAt: hoursAgo(day * 24 + (20 - n * 2)),
          status: "completed",
        },
      });
      ticketNo += 1;
    }
  }

  // Close the shift honestly: expected = float + cash sales.
  const cashSales = await db.sale.aggregate({
    where: { shiftId: closedShift.id, paymentMethod: "cash" },
    _sum: { total: true },
    _count: true,
  });
  const expected = 100 + (cashSales._sum.total ?? 0);
  const counted = Math.round((expected + 0.35) * 100) / 100;
  await db.cashierShift.update({
    where: { id: closedShift.id },
    data: {
      expectedCash: Math.round(expected * 100) / 100,
      countedCash: counted,
      variance: Math.round((counted - expected) * 100) / 100,
      status: "closed",
    },
  });
}

async function main(): Promise<void> {
  const demo = process.argv.includes("--demo");
  const user = await ensureOwner();
  await ensureStoreSettings(user.id);
  if (demo) await seedDemo(user.id);
  const counts = {
    products: await db.product.count({ where: { userId: user.id } }),
    categories: await db.category.count({ where: { userId: user.id } }),
    registers: await db.register.count({ where: { userId: user.id } }),
    sales: await db.sale.count({ where: { userId: user.id } }),
  };
  console.log(
    `Seed: owner ${OWNER_EMAIL} ready (${JSON.stringify(counts)}${demo ? ", demo dataset" : ""}).`,
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

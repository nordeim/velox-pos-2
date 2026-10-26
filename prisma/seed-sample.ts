// ---------------------------------------------------------------------------
// Sample-data seed (db:seed:sample) — populates the demo account with a
// small catalog, a register, and a closed shift holding three sales, so the
// Dashboard/Reports/Sales views show real data. Idempotent: early-returns
// when products already exist. Deletes db first to re-roll.
// ---------------------------------------------------------------------------
import { hashPassword } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { buildCartTotals } from "../src/lib/cart";

const DEMO_EMAIL = "demo@veloxpos.app";
const DEMO_PASSWORD = "Demo1234!";

async function main(): Promise<void> {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: DEMO_EMAIL,
        passwordHash: hashPassword(DEMO_PASSWORD),
        fullName: "Demo Cashier",
        role: "admin",
        emailVerified: true,
      },
    });
    await db.storeSetting.create({
      data: { userId: user.id, storeName: "VeloxPOS Store" },
    });
  }

  const existing = await db.product.findFirst({ where: { userId: user.id } });
  if (existing) {
    console.log("Sample seed: products already present — nothing to do.");
    return;
  }

  const beverages = await db.category.create({
    data: { userId: user.id, name: "Beverages", color: "#10b981" },
  });
  const bakery = await db.category.create({
    data: { userId: user.id, name: "Bakery", color: "#f59e0b" },
  });
  const snacks = await db.category.create({
    data: { userId: user.id, name: "Snacks", color: "#3b82f6" },
  });

  const productRows = [
    { name: "Espresso Coffee", barcode: "7501234567890", categoryId: beverages.id, priceCents: 350, costCents: 180, stock: 25, minStock: 5, taxRate: 16 },
    { name: "Cappuccino", barcode: "7501234567891", categoryId: beverages.id, priceCents: 450, costCents: 220, stock: 18, minStock: 5, taxRate: 16 },
    { name: "Orange Juice 500ml", barcode: "7501234567892", categoryId: beverages.id, priceCents: 280, costCents: 140, stock: 4, minStock: 6, taxRate: 16 },
    { name: "Croissant", barcode: "7501234567893", categoryId: bakery.id, priceCents: 250, costCents: 110, stock: 12, minStock: 4, taxRate: 16 },
    { name: "Chocolate Muffin", barcode: "7501234567894", categoryId: bakery.id, priceCents: 320, costCents: 150, stock: 8, minStock: 4, taxRate: 16 },
    { name: "Potato Chips 150g", barcode: "7501234567895", categoryId: snacks.id, priceCents: 190, costCents: 90, stock: 30, minStock: 6, taxRate: 16 },
    { name: "Mixed Nuts Pack", barcode: "7501234567896", categoryId: snacks.id, priceCents: 420, costCents: 240, stock: 14, minStock: 5, taxRate: 16 },
    { name: "Sparkling Water", barcode: "7501234567897", categoryId: beverages.id, priceCents: 150, costCents: 70, stock: 40, minStock: 10, taxRate: 16 },
  ];
  const products: { id: string; name: string; priceCents: number; taxRate: number }[] = [];
  for (const row of productRows) {
    products.push(await db.product.create({ data: { userId: user.id, ...row } }));
  }

  const register = await db.register.create({
    data: { userId: user.id, name: "Register 1", location: "Main entrance" },
  });

  // A closed shift yesterday with three cash/card sales.
  const openedAt = new Date();
  openedAt.setDate(openedAt.getDate() - 1);
  openedAt.setHours(9, 0, 0, 0);
  const closedAt = new Date(openedAt);
  closedAt.setHours(18, 0, 0, 0);
  const shift = await db.shift.create({
    data: {
      userId: user.id,
      registerId: register.id,
      openedAt,
      closedAt,
      openingFloatCents: 10000,
      expectedCashCents: 10000 + 1410,
      closingCashCents: 11410,
      status: "closed",
    },
  });

  const sales: Array<{ method: string; items: Array<{ p: number; qty: number }>; hour: number }> = [
    { method: "cash", items: [{ p: 0, qty: 2 }, { p: 3, qty: 1 }], hour: 10 },
    { method: "card", items: [{ p: 1, qty: 1 }, { p: 4, qty: 2 }], hour: 13 },
    { method: "transfer", items: [{ p: 5, qty: 3 }, { p: 7, qty: 1 }], hour: 16 },
  ];
  let ticketSeq = 1;
  for (const sale of sales) {
    const createdAt = new Date(openedAt);
    createdAt.setHours(sale.hour, 15, 0, 0);
    const lines = sale.items.map(({ p, qty }) => {
      const product = products[p];
      const lineTotal = product.priceCents * qty;
      return {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        qty,
        taxRate: product.taxRate,
        lineTotalCents: lineTotal,
      };
    });
    const totals = buildCartTotals(
      lines.map((l) => ({ priceCents: l.priceCents, qty: l.qty, taxRate: l.taxRate })),
      0,
    );
    const paid = sale.method === "cash" ? Math.ceil(totals.total / 50) * 50 : totals.total;
    await db.sale.create({
      data: {
        userId: user.id,
        registerId: register.id,
        shiftId: shift.id,
        ticketNo: `#T${String(ticketSeq).padStart(6, "0")}`,
        method: sale.method,
        status: "completed",
        subtotalCents: totals.subtotal,
        taxCents: totals.tax,
        totalCents: totals.total,
        paidCents: paid,
        changeCents: paid - totals.total,
        createdAt,
        updatedAt: createdAt,
        items: { create: lines },
      },
    });
    ticketSeq += 1;
  }

  console.log("Sample seed: catalog + register + closed shift with 3 sales created.");
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

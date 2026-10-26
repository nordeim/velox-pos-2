// ---------------------------------------------------------------------------
// The POS transactional seam: shift lifecycle, checkout, reports/dashboard
// aggregation, cashier (user) administration, store settings. Route files
// stay thin shells over these helpers.
//
// Invariants enforced here:
//  - One OPEN shift per register (a second open → ValidationError).
//  - Checkout runs in ONE transaction: stock is decremented, the ticket
//    number is allocated from the user's sale count, sale + items are
//    written together; a failure rolls the whole ticket back.
//  - Selling below stock is rejected (stockClamp=false POS semantics — a
//    physical drawer cannot sell units that do not exist).
//  - Cashier administration routes are ADMIN-only (role checked here).
// ---------------------------------------------------------------------------

import { db } from "../db";
import {
  buildCartTotals,
  changeDue,
  type CartLine,
  type PaymentMethod,
} from "../cart";
import { ValidationError, NotFoundError } from "./http";
import type { SessionUser } from "./auth";

// ---- shifts ------------------------------------------------------------------

export async function listShiftsWithRegister(userId: string) {
  return db.shift.findMany({
    where: { userId },
    orderBy: { openedAt: "desc" },
    include: { register: { select: { id: true, name: true, location: true } } },
    take: 200,
  });
}

export async function getOpenShift(userId: string, registerId?: string) {
  return db.shift.findFirst({
    where: { userId, status: "open", ...(registerId ? { registerId } : {}) },
    include: { register: { select: { id: true, name: true, location: true } } },
  });
}

export async function openShift(
  userId: string,
  registerId: string,
  openingFloatCents: number,
) {
  const register = await db.register.findFirst({ where: { id: registerId, userId } });
  if (!register) throw new NotFoundError("That register does not exist.");
  const existing = await db.shift.findFirst({
    where: { userId, registerId, status: "open" },
  });
  if (existing) {
    throw new ValidationError("That register already has an open shift.");
  }
  return db.shift.create({
    data: { userId, registerId, openingFloatCents, status: "open" },
    include: { register: { select: { id: true, name: true, location: true } } },
  });
}

export async function closeShift(userId: string, shiftId: string, closingCashCents: number) {
  const shift = await db.shift.findFirst({ where: { id: shiftId, userId } });
  if (!shift) throw new NotFoundError("That shift does not exist.");
  if (shift.status === "closed") {
    throw new ValidationError("That shift is already closed.");
  }
  const cashSales = await db.sale.aggregate({
    where: { userId, shiftId, method: "cash", status: "completed" },
    _sum: { totalCents: true },
  });
  const expectedCashCents = shift.openingFloatCents + (cashSales._sum.totalCents ?? 0);
  return db.shift.update({
    where: { id: shiftId },
    data: { status: "closed", closedAt: new Date(), expectedCashCents, closingCashCents },
    include: { register: { select: { id: true, name: true, location: true } } },
  });
}

// ---- checkout -----------------------------------------------------------------

export type CheckoutInput = {
  registerId: string;
  method: PaymentMethod;
  discountCents: number;
  paidCents: number;
  customerName: string;
  note: string;
  items: Array<{ productId: string; qty: number }>;
};

export async function checkout(user: SessionUser, input: CheckoutInput) {
  const openShift = await db.shift.findFirst({
    where: { userId: user.id, registerId: input.registerId, status: "open" },
  });
  if (!openShift) {
    throw new ValidationError("Open a shift on that register before making sales.");
  }

  // Resolve + validate every product up-front (ownership + active + stock).
  const productIds = input.items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { userId: user.id, id: { in: productIds } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: CartLine[] = [];
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) throw new NotFoundError("One of the products does not exist.");
    if (!product.active) {
      throw new ValidationError(`"${product.name}" is inactive and cannot be sold.`);
    }
    if (product.stock < item.qty) {
      throw new ValidationError(
        `Insufficient stock for "${product.name}" (available: ${product.stock}).`,
      );
    }
    lines.push({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      qty: item.qty,
      taxRate: product.taxRate,
    });
  }

  const totals = buildCartTotals(lines, input.discountCents);
  const paid = input.method === "cash" ? Math.max(input.paidCents, 0) : totals.total;
  if (input.method === "cash" && paid < totals.total) {
    throw new ValidationError("The cash tendered is less than the total due.");
  }

  const count = await db.sale.count({ where: { userId: user.id } });
  const ticketNo = `#T${String(count + 1).padStart(6, "0")}`;

  const sale = await db.$transaction(async (tx) => {
    for (const line of lines) {
      const updated = await tx.product.updateMany({
        where: { id: line.productId, userId: user.id, stock: { gte: line.qty } },
        data: { stock: { decrement: line.qty } },
      });
      if (updated.count !== 1) {
        throw new ValidationError(`Insufficient stock for "${line.name}".`);
      }
    }
    return tx.sale.create({
      data: {
        userId: user.id,
        registerId: input.registerId,
        shiftId: openShift.id,
        ticketNo,
        method: input.method,
        status: "completed",
        subtotalCents: totals.subtotal,
        taxCents: totals.tax,
        discountCents: totals.discount,
        totalCents: totals.total,
        paidCents: paid,
        changeCents: changeDue(totals.total, paid),
        customerName: input.customerName,
        note: input.note,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            name: line.name,
            priceCents: line.priceCents,
            qty: line.qty,
            taxRate: line.taxRate,
            lineTotalCents: line.priceCents * line.qty,
          })),
        },
      },
      include: { items: true, register: { select: { id: true, name: true } } },
    });
  });

  return sale;
}

export async function listSales(userId: string) {
  return db.sale.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      register: { select: { id: true, name: true } },
      user: { select: { fullName: true } },
    },
    take: 500,
  });
}

export async function getSale(userId: string, id: string) {
  const sale = await db.sale.findFirst({
    where: { id, userId },
    include: {
      items: true,
      register: { select: { id: true, name: true } },
      user: { select: { fullName: true } },
    },
  });
  if (!sale) throw new NotFoundError("That sale does not exist.");
  return sale;
}

/** Refund: flips status and RESTORES stock (one transaction). */
export async function refundSale(userId: string, id: string) {
  const sale = await db.sale.findFirst({
    where: { id, userId, status: "completed" },
    include: { items: true },
  });
  if (!sale) throw new NotFoundError("That sale does not exist (or is already refunded).");
  return db.$transaction(async (tx) => {
    for (const item of sale.items) {
      if (!item.productId) continue;
      await tx.product.updateMany({
        where: { id: item.productId, userId },
        data: { stock: { increment: item.qty } },
      });
    }
    return tx.sale.update({ where: { id: sale.id }, data: { status: "refunded" } });
  });
}

// ---- aggregation (dashboard + reports) -------------------------------------------

export type SummarySales = {
  id: string;
  ticketNo: string;
  method: string;
  status: string;
  totalCents: number;
  createdAt: Date;
};

export async function recentSales(userId: string, days: number): Promise<SummarySales[]> {
  const since = new Date();
  since.setDate(since.getDate() - Math.max(1, Math.trunc(days)));
  return db.sale.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { id: true, ticketNo: true, method: true, status: true, totalCents: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function dashboardSummary(userId: string) {
  const [sales, products, lowStock, openShifts, recentRegisters] = await Promise.all([
    recentSales(userId, 7),
    db.product.findMany({ where: { userId } }),
    db.product.count({ where: { userId, active: true } }), // refined below in JS
    db.shift.findMany({
      where: { userId, status: "open" },
      include: { register: { select: { id: true, name: true } } },
    }),
    db.register.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 10 }),
  ]);
  const lowStockCount = products.filter(
    (p) => p.active && p.stock <= p.minStock,
  ).length;
  return { sales, productCount: products.length, lowStockCount, openShifts, registers: recentRegisters };
}

// ---- cashiers (admin-only user administration) ---------------------------------------

export const CASHIER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  phone: true,
  active: true,
  createdAt: true,
} as const;

export function assertAdmin(user: SessionUser): void {
  if (user.role !== "admin") {
    throw new ValidationError("Only administrators can manage cashiers.");
  }
}

export async function recentShiftsForCashiers(userId: string) {
  return db.shift.findMany({
    where: { userId },
    orderBy: { openedAt: "desc" },
    include: {
      register: { select: { name: true } },
      user: { select: { id: true, fullName: true, email: true } },
    },
    take: 20,
  });
}

// ---- store settings ----------------------------------------------------------------------

export async function getOrCreateSettings(userId: string) {
  const existing = await db.storeSetting.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.storeSetting.create({ data: { userId } });
}

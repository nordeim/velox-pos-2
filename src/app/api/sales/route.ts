// ---------------------------------------------------------------------------
// /api/sales — GET list (the Historial de Ventas ledger) + POST checkout.
//
// Checkout is a server-authoritative workflow: totals are recomputed from the
// OWNED products' stored prices (client amounts are never trusted), stock is
// decremented, the ticket number is allocated from the store's sale count,
// and the sale is pinned to the register's active shift when one exists.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { computeTotals, round2 } from "@/lib/money";
import { changeDue, ticketLabel } from "@/lib/cart";
import {
  NotFoundError,
  ValidationError,
  parseWith,
  readJson,
  withUser,
} from "@/lib/server/http";
import { saleCreateSchema } from "@/lib/validation";

export const GET = withUser(async (user) => {
  const sales = await db.sale.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      cashier: { select: { fullName: true, email: true } },
      register: { select: { name: true } },
    },
  });
  return NextResponse.json(sales);
});

export const POST = withUser(async (user, request) => {
  const input = parseWith(saleCreateSchema, await readJson(request));

  // Load every referenced product ONCE, verify ownership + existence, and
  // price the sale from the stored values (server-authoritative totals).
  const ids = Array.from(new Set(input.items.map((i) => i.productId)));
  const products = await db.product.findMany({
    where: { userId: user.id, id: { in: ids } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.name} is no longer available.`);
    }
    if (!product.active) {
      throw new ValidationError(`${product.name} is inactive and cannot be sold.`);
    }
    if (product.stock < item.qty) {
      throw new ValidationError(`Not enough stock for ${product.name} (${product.stock} left).`);
    }
  }

  // Server-priced lines: the stored price/taxRate, the requested quantities.
  const lines = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty,
      taxRate: product.taxRate,
    };
  });
  const totals = computeTotals(lines);

  const totalCentsCheck = totals.total;
  if (input.paymentMethod === "cash") {
    if (input.amountPaid == null) {
      throw new ValidationError("Cash payments need the amount received.");
    }
    if (round2(input.amountPaid) < totalCentsCheck) {
      throw new ValidationError("The amount received is less than the total.");
    }
  }

  // Ticket allocation + the active shift (if the register has one) — both
  // resolved inside the transaction that decrements stock and writes the sale
  // (Session-8, F-55: these reads previously executed BEFORE the $transaction,
  // contradicting the comment and widening the ticket-allocation race window
  // — two concurrent checkouts could read the same count and allocate the
  // same ticket number. Inside the transaction the reads join the
  // decrement+create unit).
  const paid = input.paymentMethod === "cash" ? round2(input.amountPaid ?? 0) : null;
  const sale = await db.$transaction(async (tx) => {
    const saleCount = await tx.sale.count({ where: { userId: user.id } });
    const activeShift = await tx.cashierShift.findFirst({
      where: { userId: user.id, status: "active" },
      orderBy: { openedAt: "desc" },
    });
    if (!activeShift) {
      throw new ValidationError("Open a register shift before making sales.");
    }
    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.qty } },
      });
    }
    return tx.sale.create({
      data: {
        userId: user.id,
        ticket: ticketLabel(saleCount + 1),
        items: JSON.stringify(lines),
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        paymentMethod: input.paymentMethod,
        amountPaid: paid,
        changeDue: paid ? changeDue(totals.total, paid) : null,
        customer: input.customer,
        cashierId: user.id,
        registerId: activeShift.registerId,
        shiftId: activeShift.id,
        status: "completed",
      },
    });
  });
  return NextResponse.json(sale, { status: 201 });
});

// ---------------------------------------------------------------------------
// /api/sales — GET the sale history (joined for the Sales table) + POST the
// Terminal checkout (one transaction: stock decrement + ticket + items).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseWith, readJson, withUser } from "@/lib/server/http";
import { checkout, listSales } from "@/lib/server/pos";
import { saleCreateSchema } from "@/lib/validation";

export const GET = withUser(async (user) => {
  const sales = await listSales(user.id);
  return NextResponse.json(sales);
});

export const POST = withUser(async (user, request: NextRequest) => {
  const input = parseWith(saleCreateSchema, await readJson(request));
  const sale = await checkout(user, {
    registerId: input.registerId,
    method: input.method,
    discountCents: input.discount,
    paidCents: input.paid,
    customerName: input.customerName,
    note: input.note,
    items: input.items,
  });
  return NextResponse.json(sale, { status: 201 });
});

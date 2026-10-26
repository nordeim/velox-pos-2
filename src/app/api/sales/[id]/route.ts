// ---------------------------------------------------------------------------
// /api/sales/[id] — GET one sale (the receipt) + PATCH refund (status flip
// only — stock restocking is a manual Inventory action, documented).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  NotFoundError,
  ValidationError,
  parseWith,
  readJson,
  withUserParams,
} from "@/lib/server/http";

const refundSchema = z.object({ status: z.enum(["refunded", "completed"]) });

export const GET = withUserParams(async (user, _request, id) => {
  const sale = await db.sale.findFirst({
    where: { id, userId: user.id },
    include: {
      cashier: { select: { fullName: true, email: true } },
      register: { select: { name: true, location: true } },
    },
  });
  if (!sale) throw new NotFoundError();
  return NextResponse.json(sale);
});

export const PATCH = withUserParams(async (user, request, id) => {
  const input = parseWith(refundSchema, await readJson(request));
  const sale = await db.sale.findFirst({ where: { id, userId: user.id } });
  if (!sale) throw new NotFoundError();
  if (sale.status === input.status) return NextResponse.json(sale);
  if (sale.status === "refunded" && input.status === "completed") {
    throw new ValidationError("A refunded sale cannot be un-refunded.");
  }
  const updated = await db.sale.update({
    where: { id },
    data: { status: input.status },
  });
  return NextResponse.json(updated);
});

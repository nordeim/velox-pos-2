// ---------------------------------------------------------------------------
// /api/sales/[id] — GET one sale (receipt detail) + PATCH refund (flips
// status to refunded and restores stock in the same transaction).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { NotFoundError, parseWith, readJson, withUserParams } from "@/lib/server/http";
import { getSale, refundSale } from "@/lib/server/pos";
import { saleUpdateSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withUserParams(async (user, _request: NextRequest, id: string) => {
  const sale = await getSale(user.id, id);
  return NextResponse.json(sale);
});

export const PATCH = withUserParams(async (user, request: NextRequest, id: string) => {
  const input = parseWith(saleUpdateSchema, await readJson(request));
  if (input.status !== "refunded") {
    throw new NotFoundError("Only the refunded status transition exists.");
  }
  const sale = await refundSale(user.id, id);
  return NextResponse.json(sale);
});

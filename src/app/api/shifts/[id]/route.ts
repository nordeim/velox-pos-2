// ---------------------------------------------------------------------------
// /api/shifts/[id] — PATCH closes an ACTIVE shift: countedCash in, expected
// (float + cash sales) and variance computed server-side, register released.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { expectedCash, shiftVariance } from "@/lib/shift";
import { round2 } from "@/lib/money";
import {
  NotFoundError,
  ValidationError,
  parseWith,
  readJson,
  withUserParams,
} from "@/lib/server/http";
import { shiftCloseSchema } from "@/lib/validation";

export const PATCH = withUserParams(async (user, request, id) => {
  const input = parseWith(shiftCloseSchema, await readJson(request));
  const shift = await db.cashierShift.findFirst({
    where: { id, userId: user.id },
  });
  if (!shift) throw new NotFoundError();
  if (shift.status !== "active") {
    throw new ValidationError("That shift is already closed.");
  }
  const cashAgg = await db.sale.aggregate({
    where: { shiftId: shift.id, paymentMethod: "cash", status: "completed" },
    _sum: { total: true },
  });
  const expected = expectedCash(shift.openingFloat, cashAgg._sum.total ?? 0);
  const variance = shiftVariance(expected, input.countedCash);
  const [updated] = await db.$transaction([
    db.cashierShift.update({
      where: { id: shift.id },
      data: {
        countedCash: round2(input.countedCash),
        expectedCash: expected,
        variance,
        closedAt: new Date(),
        status: "closed",
      },
    }),
    db.register.update({ where: { id: shift.registerId }, data: { status: "closed" } }),
  ]);
  return NextResponse.json(updated);
});

// ---------------------------------------------------------------------------
// /api/registers/[id] — PATCH update + DELETE remove. Deleting a register
// with shift history is refused (the shift ledger must survive); close or
// deactivate through the UI's edit path instead.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { makeItemRoutes, NotFoundError, ValidationError, withUserParams } from "@/lib/server/http";
import { registerDelegate } from "@/lib/server/entities";

export const { PATCH } = makeItemRoutes(registerDelegate);

export const DELETE = withUserParams(async (user, _request, id) => {
  const owned = await db.register.findFirst({ where: { id, userId: user.id } });
  if (!owned) throw new NotFoundError();
  const shifts = await db.cashierShift.count({ where: { registerId: id } });
  if (shifts > 0) {
    throw new ValidationError(
      "This register has shift history and cannot be deleted. Close its shift first.",
    );
  }
  await db.register.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});

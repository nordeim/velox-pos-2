// ---------------------------------------------------------------------------
// /api/cashiers/[id] — ADMIN-only. PATCH name/role/phone/active; DELETE
// removes the user (their sales/shifts cascade — the ownership model). The
// admin cannot delete or demote themselves (the lockout guard).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { NotFoundError, parseWith, readJson, withUserParams } from "@/lib/server/http";
import { assertAdmin, CASHIER_SELECT } from "@/lib/server/pos";
import { publicCashier } from "../route";
import { cashierUpdateSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withUserParams(async (user, request: NextRequest, id: string) => {
  assertAdmin(user);
  const input = parseWith(cashierUpdateSchema, await readJson(request));
  const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("That user does not exist.");
  if (id === user.id && input.active === false) {
    throw new NotFoundError("You cannot deactivate your own account.");
  }
  const updated = await db.user.update({
    where: { id },
    data: input,
    select: CASHIER_SELECT,
  });
  return NextResponse.json(publicCashier(updated));
});

export const DELETE = withUserParams(async (user, _request: NextRequest, id: string) => {
  assertAdmin(user);
  if (id === user.id) {
    throw new NotFoundError("You cannot delete your own account here.");
  }
  const existing = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new NotFoundError("That user does not exist.");
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});

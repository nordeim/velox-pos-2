// ---------------------------------------------------------------------------
// /api/shifts — GET list (the Turnos Recientes ledger, newest first, with the
// register + cashier names joined) + POST open a shift.
//
// Opening rules (src/lib/shift.ts, unit-pinned): a register may open a shift
// only when it has none active. Opening sets the register's status to "open".
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  NotFoundError,
  ValidationError,
  parseWith,
  readJson,
  withUser,
} from "@/lib/server/http";
import { shiftOpenSchema } from "@/lib/validation";

const listQuerySchema = z.object({
  status: z.enum(["active", "closed"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const GET = withUser(async (user, request) => {
  const url = new URL(request.url);
  const query = parseWith(listQuerySchema, {
    status: url.searchParams.get("status") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  const shifts = await db.cashierShift.findMany({
    where: { userId: user.id, ...(query.status ? { status: query.status } : {}) },
    orderBy: { openedAt: "desc" },
    take: query.limit,
    include: {
      register: { select: { name: true, location: true } },
      cashier: { select: { fullName: true, email: true } },
    },
  });
  return NextResponse.json(shifts);
});

export const POST = withUser(async (user, request) => {
  const input = parseWith(shiftOpenSchema, await readJson(request));
  const register = await db.register.findFirst({
    where: { id: input.registerId, userId: user.id },
  });
  if (!register) throw new NotFoundError();
  const active = await db.cashierShift.findFirst({
    where: { registerId: register.id, status: "active" },
  });
  if (active) {
    throw new ValidationError(`${register.name} already has an active shift.`);
  }
  const [shift] = await db.$transaction([
    db.cashierShift.create({
      data: {
        userId: user.id,
        registerId: register.id,
        cashierId: user.id,
        openingFloat: input.openingFloat,
        status: "active",
      },
    }),
    db.register.update({ where: { id: register.id }, data: { status: "open" } }),
  ]);
  return NextResponse.json(shift, { status: 201 });
});

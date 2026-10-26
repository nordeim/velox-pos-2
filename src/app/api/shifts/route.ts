// ---------------------------------------------------------------------------
// /api/shifts — GET the shift list (recent, register-joined) + POST open a
// shift on a register (one open shift per register).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseWith, readJson, withUser } from "@/lib/server/http";
import { listShiftsWithRegister, openShift } from "@/lib/server/pos";
import { shiftOpenSchema } from "@/lib/validation";

export const GET = withUser(async (user) => {
  const shifts = await listShiftsWithRegister(user.id);
  return NextResponse.json(shifts);
});

export const POST = withUser(async (user, request: NextRequest) => {
  const input = parseWith(shiftOpenSchema, await readJson(request));
  const shift = await openShift(user.id, input.registerId, input.openingFloat);
  return NextResponse.json(shift, { status: 201 });
});

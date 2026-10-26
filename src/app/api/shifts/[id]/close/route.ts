// ---------------------------------------------------------------------------
// /api/shifts/[id]/close — close an open shift (counted cash in, expected
// cash computed from the float + cash sales).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseWith, readJson, withUserParams } from "@/lib/server/http";
import { closeShift } from "@/lib/server/pos";
import { shiftCloseSchema } from "@/lib/validation";

export const POST = withUserParams(async (user, request: NextRequest, id: string) => {
  const input = parseWith(shiftCloseSchema, await readJson(request));
  const shift = await closeShift(user.id, id, input.closingCash);
  return NextResponse.json(shift);
});

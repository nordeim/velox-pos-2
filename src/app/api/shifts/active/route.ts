// ---------------------------------------------------------------------------
// /api/shifts/active — GET the user's active shifts with their registers
// (the Terminal gate + the Registers "active" chips + the Close dialog).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { withUser } from "@/lib/server/http";

export const GET = withUser(async (user) => {
  const shifts = await db.cashierShift.findMany({
    where: { userId: user.id, status: "active" },
    orderBy: { openedAt: "desc" },
    include: {
      register: { select: { name: true, location: true } },
      cashier: { select: { fullName: true, email: true } },
    },
  });
  return NextResponse.json(shifts);
});

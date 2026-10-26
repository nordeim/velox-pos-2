// ---------------------------------------------------------------------------
// /api/account — PATCH the signed-in user's own display name / phone.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { publicUser } from "@/lib/server/auth";
import { parseWith, readJson, withUser } from "@/lib/server/http";
import { accountUpdateSchema } from "@/lib/validation";

export const PATCH = withUser(async (user, request: NextRequest) => {
  const input = parseWith(accountUpdateSchema, await readJson(request));
  const updated = await db.user.update({
    where: { id: user.id },
    data: { fullName: input.name, phone: input.phone },
    select: {
      id: true, email: true, fullName: true, role: true, phone: true,
      active: true, emailVerified: true, createdAt: true, updatedAt: true,
    },
  });
  return NextResponse.json({
    user: publicUser({
      ...updated,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }),
  });
});

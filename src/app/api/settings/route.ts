// ---------------------------------------------------------------------------
// /api/settings — GET the singleton store settings (created on first read)
// + PUT the update (Zod-validated partial).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { parseWith, readJson, withUser } from "@/lib/server/http";
import { getOrCreateSettings } from "@/lib/server/pos";
import { settingsUpdateSchema } from "@/lib/validation";

export const GET = withUser(async (user) => {
  const settings = await getOrCreateSettings(user.id);
  return NextResponse.json(settings);
});

export const PUT = withUser(async (user, request: NextRequest) => {
  const input = parseWith(settingsUpdateSchema, await readJson(request));
  await getOrCreateSettings(user.id);
  const settings = await db.storeSetting.update({ where: { userId: user.id }, data: input });
  return NextResponse.json(settings);
});

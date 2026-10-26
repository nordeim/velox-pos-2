// ---------------------------------------------------------------------------
// /api/store-settings — GET (lazily materialized to the reference defaults)
// + PATCH (partial update through the Zod contract).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { parseWith, readJson, withUser } from "@/lib/server/http";
import { storeSettingsUpdateSchema } from "@/lib/validation";

export const GET = withUser(async (user) => {
  const existing = await db.storeSettings.findUnique({ where: { userId: user.id } });
  if (existing) return NextResponse.json(existing);
  const created = await db.storeSettings.create({
    data: { userId: user.id },
  });
  return NextResponse.json(created);
});

export const PATCH = withUser(async (user, request) => {
  const input = parseWith(storeSettingsUpdateSchema, await readJson(request));
  const current = await db.storeSettings.findUnique({ where: { userId: user.id } });
  const saved = current
    ? await db.storeSettings.update({ where: { userId: user.id }, data: input })
    : await db.storeSettings.create({ data: { userId: user.id, ...input } });
  return NextResponse.json(saved);
});

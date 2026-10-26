// ---------------------------------------------------------------------------
// /api/cashiers — ADMIN-only user administration. GET lists the store's
// users (id/email/name/role/phone/active — never the hash); POST creates a
// cashier/admin account with a password the admin sets (a self-hosted POS
// has no invite email flow — documented deviation from a hosted SaaS).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  parseWith,
  readJson,
  withUser,
} from "@/lib/server/http";
import { assertAdmin, CASHIER_SELECT } from "@/lib/server/pos";
import { cashierCreateSchema } from "@/lib/validation";

/** The public cashier shape — `name` (consistent with publicUser), never
 *  the raw fullName column nor the hash. */
export function publicCashier(row: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone: string;
  active: boolean;
  createdAt: Date;
}) {
  return {
    id: row.id,
    email: row.email,
    name: row.fullName,
    role: row.role,
    phone: row.phone,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  };
}

export const GET = withUser(async (user) => {
  assertAdmin(user);
  const users = await db.user.findMany({
    select: CASHIER_SELECT,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users.map(publicCashier));
});

export const POST = withUser(async (user, request: NextRequest) => {
  assertAdmin(user);
  const input = parseWith(cashierCreateSchema, await readJson(request));
  const created = await db.user.create({
    data: {
      email: input.email,
      passwordHash: hashPassword(input.password),
      fullName: input.name,
      role: input.role,
      phone: input.phone,
      emailVerified: true,
    },
    select: CASHIER_SELECT,
  });
  return NextResponse.json(publicCashier(created), { status: 201 });
});

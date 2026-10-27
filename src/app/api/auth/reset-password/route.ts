// ---------------------------------------------------------------------------
// POST /api/auth/reset-password — the 3-state reset flow's completion leg.
// The 48-hex token is ONE-SHOT (usedAt set inside the same transaction as
// the password write) and expires 30 minutes after issue. The response is
// the success signal the login screen's note renders.
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";
import { errorResponse, parseWith, readJson, toErrorResponse } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = parseWith(
      resetPasswordSchema,
      await readJson(request),
    );

    const record = await db.passwordResetToken.findUnique({
      where: { token },
      select: { id: true, userId: true, usedAt: true, expiresAt: true },
    });
    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      // Session-13 (F-94, measured live): the reference's own error copy —
      // the UI surfaces it verbatim in the reset alert.
      return errorResponse(400, "Invalid or expired reset token");
    }

    // The one-shot consumption rides the SAME transaction as the write —
    // a replay can never land between them.
    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash: hashPassword(password) },
      }),
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

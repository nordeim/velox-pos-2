// ---------------------------------------------------------------------------
// POST /api/auth/register — the UNVERIFIED account creation (S15/ADR-013,
// no auto-login). Rate-limited 10/IP/15 min. No SMTP: the response IS the
// delivery — the freshly issued 6-digit code rides the body (the verify
// screen's self-hosted code note). Re-registering an existing UNVERIFIED
// address re-issues a code; an existing VERIFIED address answers the same
// success shape without a code (no enumeration, nothing changed).
// ---------------------------------------------------------------------------

import { NextResponse, type NextRequest } from "next/server";

import {
  checkRateLimit,
  generateVerificationCode,
  hashPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { clientIp } from "@/lib/server/auth";
import {
  parseWith,
  rateLimitedResponse,
  readJson,
  toErrorResponse,
} from "@/lib/server/http";

const CODE_TTL_MS = 15 * 60 * 1000; // the 15-minute verification window

/** The e2e/client payloads say `name`; the schema says `fullName` — alias
 *  before parsing (the schema strips unknown keys otherwise). */
type RegisterBody = { name?: unknown; fullName?: unknown };

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    const limit = checkRateLimit(`register:${ip}`, 10);
    if (!limit.ok) {
      return rateLimitedResponse(
        limit.retryAfterSec,
        "Too many registration attempts. Try again shortly.",
      );
    }

    const raw = (await readJson(request)) as RegisterBody;
    const body: unknown =
      raw.fullName === undefined && raw.name !== undefined
        ? { ...raw, fullName: raw.name }
        : raw;
    const { fullName, email, password } = parseWith(registerSchema, body);

    const normalizedEmail = email.toLowerCase();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    });

    if (existing?.emailVerified) {
      // Uniform 200, no code, no re-issue — the account exists and is
      // verified; saying anything more would be an enumeration oracle.
      return NextResponse.json({ ok: true });
    }

    const code = generateVerificationCode();
    const tokenData = {
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    };

    if (existing) {
      // Existing UNVERIFIED account: re-issue a fresh code (the S25/S26
      // flow re-registers and reads the new code from the response).
      await db.verificationToken.create({
        data: { ...tokenData, userId: existing.id },
      });
      return NextResponse.json({ ok: true, code });
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        fullName,
        // emailVerified stays false — the schema default. No session
        // cookie: the register→verify journey completes only after the
        // code matches.
      },
      select: { id: true },
    });
    await db.verificationToken.create({
      data: { ...tokenData, userId: user.id },
    });

    return NextResponse.json({ ok: true, code }, { status: 201 });
  } catch (err: unknown) {
    return toErrorResponse(err);
  }
}

// ---------------------------------------------------------------------------
// auth.ts — the pure crypto seam: scrypt password hashing, HMAC session
// tokens, and the rate limiter.
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  checkRateLimit,
  createSessionToken,
  hashPassword,
  readSessionToken,
  verifyPassword,
} from "../src/lib/auth";

describe("passwords", () => {
  it("hashes and verifies (scrypt, salted)", () => {
    const hash = hashPassword("Demo1234!");
    expect(hash).not.toContain("Demo1234!");
    expect(verifyPassword("Demo1234!", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("salts — the same password hashes differently twice", () => {
    expect(hashPassword("same-secret")).not.toBe(hashPassword("same-secret"));
  });
});

describe("sessions", () => {
  const savedSecret = process.env.AUTH_SECRET;

  it("creates and reads a signed token round-trip", () => {
    process.env.AUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
    const token = createSessionToken("user-1");
    expect(readSessionToken(token)?.uid).toBe("user-1");
    // a tampered payload fails the HMAC
    const [payload] = token.split(".");
    expect(readSessionToken(`${payload}.deadbeef`)).toBeNull();
    process.env.AUTH_SECRET = savedSecret;
  });

  it("rejects garbage tokens", () => {
    expect(readSessionToken("not-a-token")).toBeNull();
  });
});

describe("rate limiter", () => {
  it("allows under the limit and flags over it", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(key, 5).ok).toBe(true);
    }
    const blocked = checkRateLimit(key, 5);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    checkRateLimit(a, 1);
    expect(checkRateLimit(a, 1).ok).toBe(false);
    expect(checkRateLimit(b, 1).ok).toBe(true);
  });
});

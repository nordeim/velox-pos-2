import { describe, expect, it } from "vitest";

import {
  canCloseShift,
  canOpenShift,
  expectedCash,
  shiftDuration,
  shiftTime,
  shiftVariance,
  varianceLabel,
  type ShiftLike,
} from "@/lib/shift";

const shift = (overrides: Partial<ShiftLike> = {}): ShiftLike => ({
  id: "s1",
  registerId: "r1",
  cashierId: "u1",
  status: "active",
  openingFloat: 100,
  openedAt: "2026-10-26T09:00:00.000Z",
  ...overrides,
});

describe("shift state machine", () => {
  it("a register may open only when it has no active shift", () => {
    expect(canOpenShift([], "r1")).toBe(true);
    expect(canOpenShift([shift()], "r1")).toBe(false);
    expect(canOpenShift([shift()], "r2")).toBe(true);
    expect(canOpenShift([shift({ status: "closed" })], "r1")).toBe(true);
  });

  it("expected = float + cash sales; variance = counted − expected", () => {
    expect(expectedCash(100, 19.72)).toBe(119.72);
    expect(expectedCash(0, 0)).toBe(0);
    expect(expectedCash(-5, 10)).toBe(10); // negative float clamped
    expect(shiftVariance(119.72, 119.7)).toBe(-0.02);
    expect(shiftVariance(100, 110)).toBe(10);
  });

  it("variance labels: Over / Short / Exact (±half-cent tolerance)", () => {
    expect(varianceLabel(0)).toBe("Exact");
    expect(varianceLabel(0.004)).toBe("Exact");
    expect(varianceLabel(0.01)).toBe("Over");
    expect(varianceLabel(-0.02)).toBe("Short");
  });

  it("close requires an active shift and a non-negative count", () => {
    expect(canCloseShift(shift(), 100)).toBe(true);
    expect(canCloseShift(shift({ status: "closed" }), 100)).toBe(false);
    expect(canCloseShift(shift(), null)).toBe(false);
    expect(canCloseShift(shift(), -1)).toBe(false);
  });
});

describe("shift display helpers", () => {
  it("durations render as Hh Mm (live shifts use now)", () => {
    const opened = new Date(Date.now() - 135 * 60_000).toISOString();
    expect(shiftDuration(opened, new Date(Date.now() - 15 * 60_000).toISOString())).toBe("2h 0m");
    expect(shiftDuration(opened)).toBe("2h 15m");
  });

  it("shiftTime renders local HH:mm", () => {
    const d = new Date(2026, 9, 26, 9, 5);
    expect(shiftTime(d)).toBe("09:05");
  });
});

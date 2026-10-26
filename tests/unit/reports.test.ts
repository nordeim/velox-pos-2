import { describe, expect, it } from "vitest";

import {
  byMethod,
  categorySlices,
  dailySeries,
  inPeriod,
  periodStart,
  PERIODS,
  summarize,
  type SaleLike,
} from "@/lib/reports";

const NOW = new Date(2026, 9, 26, 18, 0); // local Mon Oct 26 2026 18:00

const sale = (overrides: Partial<SaleLike> = {}): SaleLike => ({
  total: 10,
  paymentMethod: "cash",
  status: "completed",
  createdAt: new Date(NOW),
  ...overrides,
});

describe("period windowing", () => {
  it("PERIODS are the reference's 7/14/30/90", () => {
    expect(PERIODS).toEqual([7, 14, 30, 90]);
  });

  it("periodStart is local midnight, (days−1) back — inclusive of today", () => {
    const start = periodStart(7, NOW);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(9);
    expect(start.getDate()).toBe(20); // 26 − 6
    expect(start.getHours()).toBe(0);
  });

  it("inPeriod: completed sales inside the window only", () => {
    expect(inPeriod(sale(), 7, NOW)).toBe(true);
    expect(inPeriod(sale({ status: "refunded" }), 7, NOW)).toBe(false);
    expect(inPeriod(sale({ createdAt: new Date(2026, 8, 1) }), 7, NOW)).toBe(false);
    expect(inPeriod(sale({ createdAt: periodStart(7, NOW) }), 7, NOW)).toBe(true);
  });
});

describe("summarize", () => {
  it("revenue / transactions / avg ticket", () => {
    const sales = [
      sale({ total: 10 }),
      sale({ total: 20, paymentMethod: "card" }),
      sale({ total: 999, createdAt: new Date(2020, 0, 1) }), // outside
    ];
    expect(summarize(sales, 7, NOW)).toEqual({
      revenue: 30,
      transactions: 2,
      avgTicket: 15,
    });
  });

  it("an empty period is all zeros (no NaN avg)", () => {
    expect(summarize([], 30, NOW)).toEqual({ revenue: 0, transactions: 0, avgTicket: 0 });
  });
});

describe("dailySeries", () => {
  it("buckets per day, chronological, correct labels", () => {
    const series = dailySeries(
      [sale({ total: 12 }), sale({ total: 8, createdAt: new Date(NOW) })],
      7,
      NOW,
    );
    expect(series).toHaveLength(7);
    expect(series[6].label).toBe("26 Oct");
    expect(series[6].revenue).toBe(20);
    expect(series[6].count).toBe(2);
    expect(series[0].revenue).toBe(0);
  });

  it("partial-day windows (90 days) still produce one bucket per day", () => {
    expect(dailySeries([], 90, NOW)).toHaveLength(90);
  });
});

describe("byMethod", () => {
  it("aggregates cash/card with shares summing to 1", () => {
    const slices = byMethod(
      [
        sale({ total: 60, paymentMethod: "cash" }),
        sale({ total: 40, paymentMethod: "card" }),
        sale({ total: 10, paymentMethod: "card" }),
      ],
      7,
      NOW,
    );
    expect(slices).toHaveLength(2);
    expect(slices[0]).toMatchObject({ method: "cash", revenue: 60, count: 1 });
    const shareSum = slices.reduce((s, x) => s + x.share, 0);
    expect(Math.abs(shareSum - 1)).toBeLessThan(1e-9);
  });

  it("unknown methods normalize to cash", () => {
    const slices = byMethod([sale({ paymentMethod: "qr" })], 7, NOW);
    expect(slices[0].method).toBe("cash");
  });

  it("an empty period yields no slices", () => {
    expect(byMethod([], 7, NOW)).toEqual([]);
  });
});

describe("categorySlices", () => {
  it("counts per category + the uncategorized remainder, sorted", () => {
    const slices = categorySlices(
      [
        { id: "c1", name: "Beverages" },
        { id: "c2", name: "Snacks" },
      ],
      [
        { categoryId: "c1" },
        { categoryId: "c1" },
        { categoryId: "c2" },
        { categoryId: null },
        { categoryId: null },
        { categoryId: null },
      ],
    );
    expect(slices[0]).toEqual({ name: "Uncategorized", count: 3, share: 0.5 });
    expect(slices[1]).toEqual({ name: "Beverages", count: 2, share: 1 / 3 });
    expect(slices[2]).toEqual({ name: "Snacks", count: 1, share: 1 / 6 });
  });

  it("an empty store has no slices (the dashboard's No-data-yet state)", () => {
    expect(categorySlices([{ id: "c1", name: "Beverages" }], [])).toEqual([]);
  });
});

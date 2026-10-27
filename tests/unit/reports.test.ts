import { describe, expect, it } from "vitest";

import {
  byMethod,
  categorySlices,
  dailySeries,
  inPeriod,
  niceScale,
  niceTicks,
  periodStart,
  PERIODS,
  saleTimestamp,
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

// ---------------------------------------------------------------------------
// niceTicks (Session-6, F-50 — the chart axis contract): the reference renders
// Recharts-style ~5 NICE ticks (measured: y = 0,1,2,3,4 on its empty
// dashboard; $0..$4 on its empty Reports chart). The Session-101 charts drew
// ONE grid line + label per UNIT of the y domain — for dollar revenue that is
// hundreds of labels stacked fractions of a pixel apart (the unreadable
// white block the VLM caught on the live dashboard).
// ---------------------------------------------------------------------------

describe("niceTicks (the chart axis contract — ~5 nice steps, never per-unit)", () => {
  it("keeps small integer domains at unit steps (the reference's empty state)", () => {
    expect(niceTicks(4)).toEqual([0, 1, 2, 3, 4]);
  });

  it("rounds dollar domains to nice steps (no 471-label explosion at $470)", () => {
    expect(niceTicks(470)).toEqual([0, 100, 200, 300, 400]);
  });

  it("steps 5 for domains in the tens", () => {
    expect(niceTicks(17)).toEqual([0, 5, 10, 15]);
  });

  it("steps 20 for domains in the high tens", () => {
    expect(niceTicks(99)).toEqual([0, 20, 40, 60, 80]);
  });

  it("handles fractional and zero maxima", () => {
    expect(niceTicks(2.4)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(0)).toEqual([0]);
  });

  it("never explodes the tick count (the F-50 regression pin)", () => {
    for (const max of [4, 8, 17, 99, 470, 2500, 99_999, 1_000_000]) {
      expect(niceTicks(max).length).toBeLessThanOrEqual(6);
    }
  });
});

// Session-15 (F-107, measured on the demo-seeded dashboard): niceTicks stops
// at the largest step multiple ≤ max, but the charts mapped the DOMAIN to
// ceil(max) — on real data ($92 day) the curve peaked ABOVE the topmost
// gridline (DOM: 6.85 vs 36.30). niceScale is the recharts-faithful cure: the
// domain TOP is the smallest nice-step multiple ≥ max, and the ticks run
// 0..top on the same step — the peak always sits at/below the top gridline.
describe("niceScale (the with-data domain contract — the top covers the data)", () => {
  it("preserves the measured empty-state contract byte-for-byte (max 4)", () => {
    expect(niceScale(4, 5)).toEqual({ top: 4, ticks: [0, 1, 2, 3, 4] });
  });

  it("rounds the domain top UP to the step multiple covering the data (the demo $92 day)", () => {
    expect(niceScale(92, 5)).toEqual({ top: 100, ticks: [0, 20, 40, 60, 80, 100] });
  });

  it("keeps already-nice tops unchanged (80 stays 80, 100 stays 100)", () => {
    expect(niceScale(80, 5)).toEqual({ top: 80, ticks: [0, 20, 40, 60, 80] });
    expect(niceScale(100, 5)).toEqual({ top: 100, ticks: [0, 20, 40, 60, 80, 100] });
  });

  it("supports the 2.5-step family with a covering top", () => {
    expect(niceScale(12, 5)).toEqual({ top: 12.5, ticks: [0, 2.5, 5, 7.5, 10, 12.5] });
  });

  it("guards the degenerate maxima (mirrors niceTicks)", () => {
    expect(niceScale(0, 5)).toEqual({ top: 0, ticks: [0] });
    expect(niceScale(1, 5)).toEqual({ top: 1, ticks: [0, 1] });
  });

  it("the top always covers the data on the step lattice (the F-107 property)", () => {
    for (const max of [3.2, 4, 8, 17, 80, 92, 99, 410.64, 470, 2500, 99_999]) {
      const { top, ticks } = niceScale(max, 5);
      expect(top).toBeGreaterThanOrEqual(max);
      expect(top % (ticks[1] - ticks[0])).toBeLessThanOrEqual(1e-6);
      expect(ticks[ticks.length - 1]).toBe(top);
      expect(ticks.length).toBeLessThanOrEqual(7);
    }
  });
});

// saleTimestamp (Session-16, F-110 — the receipt timestamp contract): the
// receipt headers must render BYTE-IDENTICALLY on every device — the bare
// toLocaleString() the receipts shipped was client-locale-dependent (en-US
// on the audit browser, ar-SA digits on an ar-SA device) inside the
// Spanish-mixed Sales surface. The seam formats the es-convention
// day-first order with manual padStart (the shiftTime precedent) — zero
// Intl dependence.
describe("saleTimestamp (the receipt timestamp contract — byte-stable, never the client's locale)", () => {
  it("renders the es-convention DD/MM/YYYY HH:MM bytes (the audit-measured sale moment)", () => {
    expect(saleTimestamp(new Date(2026, 9, 26, 14, 41))).toBe("26/10/2026 14:41");
  });

  it("zero-pads every component (single-digit day/month/hour/minute)", () => {
    expect(saleTimestamp(new Date(2026, 2, 5, 3, 7))).toBe("05/03/2026 03:07");
  });

  it("accepts the runtime's real input class — the ISO string from the JSON wire (no-Z parses local: tz-safe)", () => {
    expect(saleTimestamp("2020-05-17T09:15:00")).toBe("17/05/2020 09:15");
  });
});

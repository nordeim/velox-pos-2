// ---------------------------------------------------------------------------
// reports.ts — the aggregation seams (daily series, method breakdown,
// period stats, low-stock rule, category counts, CSV).
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  buildCategoryCounts,
  buildDailySeries,
  buildMethodBreakdown,
  buildPeriodStats,
  buildTodayStats,
  dayKey,
  dailySeriesToCsv,
  isLowStock,
  isReportPeriod,
  type ProductRow,
  type SaleRow,
} from "../src/lib/reports";

function iso(daysAgo: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function sale(overrides: Partial<SaleRow>): SaleRow {
  return {
    id: "s",
    ticketNo: "#T000001",
    method: "cash",
    status: "completed",
    totalCents: 1000,
    createdAt: iso(0),
    ...overrides,
  };
}

describe("dayKey", () => {
  it("buckets by local date", () => {
    const local = new Date(2026, 9, 26, 23, 30); // Oct 26 2026, 11:30pm local
    expect(dayKey(local)).toBe("2026-10-26");
    expect(dayKey(local.toISOString())).toBe("2026-10-26");
  });
});

describe("buildDailySeries", () => {
  it("builds a contiguous window ending today", () => {
    const series = buildDailySeries([sale({})], 7, new Date());
    expect(series).toHaveLength(7);
    expect(series[6].date).toBe(dayKey(new Date()));
  });

  it("counts revenue only from completed sales", () => {
    const series = buildDailySeries(
      [sale({ totalCents: 500 }), sale({ status: "refunded", totalCents: 900 })],
      1,
      new Date(),
    );
    expect(series[0].revenueCents).toBe(500);
    expect(series[0].transactions).toBe(1);
  });
});

describe("buildMethodBreakdown", () => {
  it("groups by method and sorts by revenue", () => {
    const breakdown = buildMethodBreakdown([
      sale({ method: "cash", totalCents: 500 }),
      sale({ method: "card", totalCents: 900 }),
      sale({ method: "cash", totalCents: 200 }),
      sale({ method: "card", status: "refunded" }),
    ]);
    expect(breakdown[0].method).toBe("card");
    expect(breakdown[0].revenueCents).toBe(900);
    expect(breakdown[0].transactions).toBe(1);
    expect(breakdown[1].method).toBe("cash");
    expect(breakdown[1].revenueCents).toBe(700);
    expect(breakdown[1].transactions).toBe(2);
  });
});

describe("buildPeriodStats / buildTodayStats", () => {
  it("derives revenue, count, and avg ticket", () => {
    const stats = buildPeriodStats([
      sale({ totalCents: 900 }),
      sale({ totalCents: 310 }),
      sale({ status: "refunded" }),
    ]);
    expect(stats.revenueCents).toBe(1210);
    expect(stats.transactions).toBe(2);
    expect(stats.avgTicketCents).toBe(605);
  });

  it("averages to zero on an empty period", () => {
    expect(buildPeriodStats([]).avgTicketCents).toBe(0);
  });

  it("today slices by the local day", () => {
    const stats = buildTodayStats([sale({}), sale({ createdAt: iso(1) })]);
    expect(stats.transactions).toBe(1);
    expect(stats.revenueCents).toBe(1000);
  });
});

describe("isLowStock", () => {
  it("flags active products at/below their minimum", () => {
    const product: ProductRow = { id: "p", name: "OJ", stock: 4, minStock: 6, active: true, categoryId: null };
    expect(isLowStock(product)).toBe(true);
    expect(isLowStock({ ...product, stock: 6 })).toBe(true);
    expect(isLowStock({ ...product, stock: 7 })).toBe(false);
    expect(isLowStock({ ...product, active: false })).toBe(false);
  });
});

describe("buildCategoryCounts", () => {
  it("groups active products, unknown categories fold into Uncategorized", () => {
    const products: ProductRow[] = [
      { id: "1", name: "a", stock: 1, minStock: 1, active: true, categoryId: "bev" },
      { id: "2", name: "b", stock: 1, minStock: 1, active: true, categoryId: "bev" },
      { id: "3", name: "c", stock: 1, minStock: 1, active: true, categoryId: null },
      { id: "4", name: "d", stock: 1, minStock: 1, active: false, categoryId: "bev" },
    ];
    const counts = buildCategoryCounts(products, [{ id: "bev", name: "Beverages" }]);
    expect(counts).toEqual([
      { name: "Beverages", count: 2 },
      { name: "Uncategorized", count: 1 },
    ]);
  });
});

describe("CSV export", () => {
  it("emits a header, CRLF rows, and a currency trailer", () => {
    const series = buildDailySeries([], 2, new Date());
    const csv = dailySeriesToCsv(series);
    expect(csv.startsWith("date,revenue,transactions\r\n")).toBe(true);
    expect(csv.includes("# currency=USD")).toBe(true);
  });
});

describe("isReportPeriod", () => {
  it("accepts the four windows (number or string)", () => {
    expect(isReportPeriod(7)).toBe(true);
    expect(isReportPeriod("90")).toBe(true);
    expect(isReportPeriod(13)).toBe(false);
    expect(isReportPeriod("90x")).toBe(false);
  });
});

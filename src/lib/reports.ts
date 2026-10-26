// ---------------------------------------------------------------------------
// Reports domain: period bucketing + aggregations behind /Reports.
// Pure — unit-pinned by tests/unit/reports.test.ts.
// ---------------------------------------------------------------------------

import { round2 } from "./money";

export type SaleLike = {
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: Date | string;
};

export const PERIODS = [7, 14, 30, 90] as const;
export type PeriodDays = (typeof PERIODS)[number];

/** Start-of-day (local) `days` back from `now` — the window's left edge. */
export function periodStart(days: number, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

export function inPeriod(sale: SaleLike, days: number, now = new Date()): boolean {
  if (sale.status !== "completed") return false;
  const created = new Date(sale.createdAt);
  return created >= periodStart(days, now) && created <= now;
}

export type PeriodSummary = {
  revenue: number;
  transactions: number;
  avgTicket: number;
};

export function summarize(sales: SaleLike[], days: number, now = new Date()): PeriodSummary {
  const rows = sales.filter((s) => inPeriod(s, days, now));
  const revenue = round2(rows.reduce((sum, s) => sum + s.total, 0));
  return {
    revenue,
    transactions: rows.length,
    avgTicket: rows.length > 0 ? round2(revenue / rows.length) : 0,
  };
}

/**
 * Nice axis ticks for the charts (Session-6, F-50): ~`count` evenly spaced
 * "nice" values from 0 up to `max` — 1/2/2.5/5×10^k steps, like the
 * reference's Recharts axes (measured: 0..4 on its empty dashboard, $0..$4
 * on its empty Reports chart). Replaces the Session-101 per-unit grid,
 * which drew ONE label per dollar of revenue — hundreds of labels stacked
 * fractions of a pixel apart (an unreadable white block on any real
 * dataset; invisible to the e2e suite, whose store is empty).
 */
export function niceTicks(max: number, count = 5): number[] {
  const safeMax = Math.ceil(Math.max(0, max));
  if (safeMax <= 0) return [0];
  if (safeMax === 1) return [0, 1];
  const rough = safeMax / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = 0; v <= safeMax + step * 1e-6; v += step) {
    out.push(Math.round(v * 1e6) / 1e6);
  }
  return out;
}

/** One bucket per day in the window (inclusive), in chronological order. */
export type DailyBucket = { date: string; label: string; revenue: number; count: number };

export function dailySeries(
  sales: SaleLike[],
  days: number,
  now = new Date(),
): DailyBucket[] {
  const start = periodStart(days, now);
  const buckets = new Map<string, DailyBucket>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    buckets.set(key, {
      date: key,
      label: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`,
      revenue: 0,
      count: 0,
    });
  }
  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    const d = new Date(sale.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue = round2(bucket.revenue + sale.total);
      bucket.count += 1;
    }
  }
  return Array.from(buckets.values());
}

export type MethodSlice = { method: string; revenue: number; count: number; share: number };

/** Revenue by payment method, sorted descending, share 0..1. */
export function byMethod(sales: SaleLike[], days: number, now = new Date()): MethodSlice[] {
  const rows = sales.filter((s) => inPeriod(s, days, now));
  const totals = new Map<string, { revenue: number; count: number }>();
  for (const sale of rows) {
    const method = sale.paymentMethod === "card" ? "card" : "cash";
    const entry = totals.get(method) ?? { revenue: 0, count: 0 };
    entry.revenue = round2(entry.revenue + sale.total);
    entry.count += 1;
    totals.set(method, entry);
  }
  const grand = rows.reduce((sum, s) => sum + s.total, 0);
  return Array.from(totals.entries())
    .map(([method, v]) => ({
      method,
      revenue: v.revenue,
      count: v.count,
      share: grand > 0 ? v.revenue / grand : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export type CategorySlice = { name: string; count: number; share: number };

/** Products-per-category distribution for the Dashboard donut/card. */
export function categorySlices(
  categories: Array<{ id: string; name: string }>,
  products: Array<{ categoryId: string | null }>,
): CategorySlice[] {
  const total = products.length;
  if (total === 0) return [];
  const counts = new Map<string, number>();
  for (const p of products) {
    const key = p.categoryId ?? "uncategorized";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const named = categories.map((c) => ({
    name: c.name,
    count: counts.get(c.id) ?? 0,
    share: (counts.get(c.id) ?? 0) / total,
  }));
  const uncategorized = counts.get("uncategorized") ?? 0;
  if (uncategorized > 0) {
    named.push({ name: "Uncategorized", count: uncategorized, share: uncategorized / total });
  }
  return named.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
}

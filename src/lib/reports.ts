// ---------------------------------------------------------------------------
// Reports seam — pure aggregations over the sale rows the API returns.
// The API fetches; this file shapes (daily series, method breakdown, period
// stats, low-stock rule) — unit-tested without a database.
// ---------------------------------------------------------------------------

import { formatMoney } from "./money";

export type SaleRow = {
  id: string;
  ticketNo: string;
  method: string;
  status: string;
  totalCents: number;
  /** ISO string (client rows) or a Prisma Date (server rows) — dayKey
   *  normalizes both. */
  createdAt: string | Date;
};

export type ProductRow = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  active: boolean;
  categoryId: string | null;
};

export type DayBucket = { label: string; date: string; revenueCents: number; transactions: number };

export const REPORT_PERIODS = [7, 14, 30, 90] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export function isReportPeriod(value: unknown): value is ReportPeriod {
  return (
    value === 7 || value === 14 || value === 30 || value === 90 ||
    (typeof value === "string" && ["7", "14", "30", "90"].includes(value))
  );
}

/** Local-date key YYYY-MM-DD (the day bucketing rule — local time, not UTC,
 *  so a 7pm sale always lands on the cashier's own "today"). */
export function dayKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Build the contiguous day series ending today (oldest → newest), bucketing
 *  completed sales by local day. */
export function buildDailySeries(
  sales: SaleRow[],
  days: number,
  now: Date = new Date(),
): DayBucket[] {
  const safeDays = Math.min(365, Math.max(1, Math.trunc(days)));
  const byDay = new Map<string, { revenueCents: number; transactions: number }>();
  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    const key = dayKey(sale.createdAt);
    const bucket = byDay.get(key) ?? { revenueCents: 0, transactions: 0 };
    bucket.revenueCents += Math.max(0, sale.totalCents);
    bucket.transactions += 1;
    byDay.set(key, bucket);
  }
  const series: DayBucket[] = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const bucket = byDay.get(key) ?? { revenueCents: 0, transactions: 0 };
    series.push({
      label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      date: key,
      revenueCents: bucket.revenueCents,
      transactions: bucket.transactions,
    });
  }
  return series;
}

export type MethodBucket = { method: string; revenueCents: number; transactions: number };

export function buildMethodBreakdown(sales: SaleRow[]): MethodBucket[] {
  const byMethod = new Map<string, MethodBucket>();
  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    const method = sale.method;
    const bucket = byMethod.get(method) ?? { method, revenueCents: 0, transactions: 0 };
    bucket.revenueCents += Math.max(0, sale.totalCents);
    bucket.transactions += 1;
    byMethod.set(method, bucket);
  }
  return [...byMethod.values()].sort((a, b) => b.revenueCents - a.revenueCents);
}

export type PeriodStats = {
  revenueCents: number;
  transactions: number;
  avgTicketCents: number;
};

export function buildPeriodStats(sales: SaleRow[]): PeriodStats {
  let revenueCents = 0;
  let transactions = 0;
  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    revenueCents += Math.max(0, sale.totalCents);
    transactions += 1;
  }
  const avgTicketCents = transactions > 0 ? Math.round(revenueCents / transactions) : 0;
  return { revenueCents, transactions, avgTicketCents };
}

/** Dashboard's "today" slice (local day). */
export function buildTodayStats(sales: SaleRow[]): { revenueCents: number; transactions: number } {
  const key = dayKey(new Date());
  let revenueCents = 0;
  let transactions = 0;
  for (const sale of sales) {
    if (sale.status !== "completed") continue;
    if (dayKey(sale.createdAt) !== key) continue;
    revenueCents += Math.max(0, sale.totalCents);
    transactions += 1;
  }
  return { revenueCents, transactions };
}

/** The LOW STOCK rule: an active product at or below its own minimum. */
export function isLowStock(product: Pick<ProductRow, "stock" | "minStock" | "active">): boolean {
  return product.active && product.stock <= product.minStock;
}

/** Products grouped by category for the dashboard panel (active only). */
export function buildCategoryCounts(
  products: ProductRow[],
  categories: Array<{ id: string; name: string }>,
): Array<{ name: string; count: number }> {
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.active) continue;
    const name = product.categoryId ? (byId.get(product.categoryId) ?? "Uncategorized") : "Uncategorized";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** The Reports CSV export (superset): one row per day. */
export function dailySeriesToCsv(series: DayBucket[], currency = "USD"): string {
  const head = "date,revenue,transactions";
  const rows = series.map(
    (b) => `${b.date},${(b.revenueCents / 100).toFixed(2)},${b.transactions}`,
  );
  return [head, ...rows].join("\r\n") + `\r\n# currency=${currency}\r\n`;
}

/** Money formatting passthrough so views import one module. */
export const formatReportMoney = formatMoney;

"use client";

// ---------------------------------------------------------------------------
// The Dashboard view: the date line + the four stat cards (TODAY'S SALES /
// TRANSACTIONS / PRODUCTS / LOW STOCK — the measured tones) + "Sales — Last
// 7 days" (the violet dotted-grid line chart) + "Products by Category".
// All numbers come from the pure seams (reports.ts / inventory-status.ts).
// ---------------------------------------------------------------------------

import * as React from "react";
import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";

import { LineChart, PageHeader, StatCard, type SeriesPoint } from "@/components/pos/shared";
import { usePosStore } from "@/lib/store";
import { dailySeries, summarize } from "@/lib/reports";
import { formatMoney } from "@/lib/money";
import { lowStockCount } from "@/lib/inventory-status";

function todayLine(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DashboardView() {
  const sales = usePosStore((s) => s.sales);
  const products = usePosStore((s) => s.products);
  const categories = usePosStore((s) => s.categories);
  const settings = usePosStore((s) => s.settings);

  const currency = settings?.currency ?? "USD";
  const today = React.useMemo(() => summarize(sales, 1), [sales]);
  const series: SeriesPoint[] = React.useMemo(
    () =>
      dailySeries(sales, 7).map((b) => ({
        label: b.label,
        value: b.revenue,
      })),
    [sales],
  );
  const low = React.useMemo(() => lowStockCount(products), [products]);

  return (
    <div className="p-4 lg:p-6">
      <PageHeader title="Dashboard" subtitle={todayLine()} />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={formatMoney(today.revenue, currency)}
          tone="green"
          icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Transactions"
          value={String(today.transactions)}
          tone="violet"
          icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Products"
          value={String(products.length)}
          tone="blue"
          icon={<Package className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Low Stock"
          value={String(low)}
          tone="orange"
          icon={<AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="glass-card rounded-2xl p-5" aria-labelledby="dash-sales-week">
          <h2 id="dash-sales-week" className="text-base font-bold text-white/70">
            Sales — Last 7 days
          </h2>
          <div className="mt-3">
            <LineChart data={series} ariaLabel="Sales over the last 7 days" />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5" aria-labelledby="dash-categories">
          <h2 id="dash-categories" className="text-base font-bold text-white/70">
            Products by Category
          </h2>
          <CategoryBreakdown />
        </section>
      </div>

    </div>
  );
}

function CategoryBreakdown() {
  const categories = usePosStore((s) => s.categories);
  const products = usePosStore((s) => s.products);
  const total = products.length;
  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/40">
        No data yet
      </div>
    );
  }
  const rows = categories
    .map((c) => ({ name: c.name, color: c.color, count: products.filter((p) => p.categoryId === c.id).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const uncategorized = products.filter((p) => !p.categoryId).length;
  if (uncategorized > 0) rows.push({ name: "Uncategorized", color: "#475569", count: uncategorized });
  return (
    <ul className="mt-3 space-y-2.5" data-testid="category-breakdown">
      {rows.map((r) => (
        <li key={r.name} className="text-sm">
          <div className="flex items-center justify-between text-white/70">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} aria-hidden="true" />
              {r.name}
            </span>
            <span className="font-semibold text-white/90">{r.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-violet-500/70"
              style={{ width: `${Math.round((r.count / total) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

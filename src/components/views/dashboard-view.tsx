"use client";

// ---------------------------------------------------------------------------
// The Dashboard (plan F14): the date subtitle, the four stat cards (TODAY'S
// SALES / TRANSACTIONS / PRODUCTS / LOW STOCK — icon block right), the
// "Sales — Last 7 days" area chart (violet-400 on dashed grid), and the
// "Products by Category" panel.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  BarChart3,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

import { AreaChart } from "@/components/pos/charts";
import { PageHeader, StatCard } from "@/components/pos/shared";
import { apiGet, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { dashboardDateLabel } from "@/lib/router";

type Summary = {
  today: { revenueCents: number; transactions: number };
  series: Array<{ label: string; date: string; revenueCents: number; transactions: number }>;
  productCount: number;
  lowStockCount: number;
  categoryCounts: Array<{ name: string; count: number }>;
  lowStock: Array<{ id: string; name: string; stock: number; minStock: number }>;
};

export function DashboardView() {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [error, setError] = React.useState("");
  const [dateLabel, setDateLabel] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiGet<Summary>("/api/dashboard/summary");
        if (cancelled) return;
        setSummary(data);
        // The long date renders client-side only (a server prerender would
        // bake the build machine's date into the HTML).
        setDateLabel(dashboardDateLabel());
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "The dashboard failed to load.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const points = (summary?.series ?? []).map((d) => ({
    label: d.label,
    value: d.revenueCents / 100,
  }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={dateLabel || "\u00a0"} />

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="TODAY'S SALES"
          value={formatMoney(summary?.today.revenueCents ?? 0)}
          icon={CircleDollarSign}
          tone="emerald"
          testId="stat-today-sales"
        />
        <StatCard
          label="TRANSACTIONS"
          value={String(summary?.today.transactions ?? 0)}
          icon={ShoppingCart}
          tone="violet"
          testId="stat-transactions"
        />
        <StatCard
          label="PRODUCTS"
          value={String(summary?.productCount ?? 0)}
          icon={Package}
          tone="blue"
          testId="stat-products"
        />
        <StatCard
          label="LOW STOCK"
          value={String(summary?.lowStockCount ?? 0)}
          icon={TriangleAlert}
          tone="amber"
          testId="stat-low-stock"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="vx-card p-5 xl:col-span-2" aria-labelledby="dash-sales-heading">
          <h2 id="dash-sales-heading" className="text-base font-bold text-white">
            Sales — Last 7 days
          </h2>
          <div className="mt-4">
            <AreaChart
              points={points}
              formatValue={(v) => `$${v}`}
              ariaLabel="Sales for the last 7 days"
            />
          </div>
        </section>

        <section className="vx-card p-5" aria-labelledby="dash-cat-heading" data-testid="dash-categories">
          <h2 id="dash-cat-heading" className="text-base font-bold text-white">
            Products by Category
          </h2>
          {(summary?.categoryCounts.length ?? 0) === 0 ? (
            <p className="mt-10 text-center text-sm text-slate-500">No data yet</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {summary?.categoryCounts.map((row) => {
                const max = Math.max(...(summary?.categoryCounts.map((c) => c.count) ?? [1]));
                return (
                  <li key={row.name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{row.name}</span>
                      <span className="text-slate-500">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {(summary?.lowStock.length ?? 0) > 0 && (
        <section className="vx-card mt-6 p-5" aria-labelledby="dash-low-heading">
          <h2 id="dash-low-heading" className="flex items-center gap-2 text-base font-bold text-white">
            <TriangleAlert aria-hidden className="h-4 w-4 text-amber-400" />
            Low stock
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {summary?.lowStock.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-300"
              >
                {p.name} — {p.stock} left (min {p.minStock})
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-600">
        <BarChart3 aria-hidden className="h-3.5 w-3.5" />
        Charts render from your store's real data — they fill in as you sell.
      </p>
    </div>
  );
}

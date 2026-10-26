"use client";

// ---------------------------------------------------------------------------
// The Reports view (English copy, reference-measured): "Reports / Sales &
// revenue analytics", the 7/14/30/90 period pills (violet active), the three
// stat cards, the DAILY SALES area chart, REVENUE BY PAYMENT METHOD and
// BREAKDOWN BY METHOD ("No data for this period" empty states).
// ---------------------------------------------------------------------------

import * as React from "react";
import { CalendarDays, CreditCard, TrendingUp } from "lucide-react";

import { AreaChart, PageHeader, StatCard, type SeriesPoint } from "@/components/pos/shared";
import { usePosStore } from "@/lib/store";
import { byMethod, dailySeries, PERIODS, summarize, type PeriodDays } from "@/lib/reports";
import { formatMoney } from "@/lib/money";

export function ReportsView() {
  const sales = usePosStore((s) => s.sales);
  const settings = usePosStore((s) => s.settings);
  const [days, setDays] = React.useState<PeriodDays>(30);
  const currency = settings?.currency ?? "USD";

  const summary = React.useMemo(() => summarize(sales, days), [sales, days]);
  const series: SeriesPoint[] = React.useMemo(
    () => dailySeries(sales, days).map((b) => ({ label: b.label, value: b.revenue })),
    [sales, days],
  );
  const methods = React.useMemo(() => byMethod(sales, days), [sales, days]);

  return (
    <div className="p-4 lg:p-6">
      <PageHeader
        title="Reports"
        subtitle="Sales & revenue analytics"
        actions={
          <div
            className="flex rounded-xl border border-edge bg-panel p-1"
            role="group"
            aria-label="Report period"
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDays(p)}
                aria-pressed={days === p}
                className={`vpx-focus rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  days === p ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {p} days
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={formatMoney(summary.revenue, currency)}
          tone="violet"
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Transactions"
          value={String(summary.transactions)}
          tone="green"
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
        />
        <StatCard
          label="Avg. ticket"
          value={formatMoney(summary.avgTicket, currency)}
          tone="violet"
          icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      <section className="glass-card mt-5 rounded-2xl p-5" aria-labelledby="reports-daily">
        <h2 id="reports-daily" className="text-base font-bold uppercase tracking-wider text-white/70">
          Daily sales
        </h2>
        <div className="mt-3">
          <AreaChart data={series} ariaLabel={`Daily sales for the last ${days} days`} />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="glass-card rounded-2xl p-5" aria-labelledby="reports-method">
          <h2 id="reports-method" className="text-base font-bold uppercase tracking-wider text-white/70">
            Revenue by payment method
          </h2>
          <MethodTable methods={methods} currency={currency} showShare />
        </section>
        <section className="glass-card rounded-2xl p-5" aria-labelledby="reports-breakdown">
          <h2 id="reports-breakdown" className="text-base font-bold uppercase tracking-wider text-white/70">
            Breakdown by method
          </h2>
          <MethodTable methods={methods} currency={currency} />
        </section>
      </div>
    </div>
  );
}

function MethodTable({
  methods,
  currency,
  showShare = false,
}: {
  methods: Array<{ method: string; revenue: number; count: number; share: number }>;
  currency: string;
  showShare?: boolean;
}) {
  if (methods.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/40">
        No data for this period
      </div>
    );
  }
  return (
    <ul className="mt-4 space-y-3" data-testid={showShare ? "revenue-by-method" : "breakdown-by-method"}>
      {methods.map((m) => (
        <li key={m.method}>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold capitalize text-white/80">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  m.method === "cash" ? "bg-emerald-500" : "bg-violet-500"
                }`}
                aria-hidden="true"
              />
              {m.method}
              <span className="text-white/40">({m.count})</span>
            </span>
            <span className="font-bold text-white/90">
              {formatMoney(m.revenue, currency)}
              {showShare && (
                <span className="ml-2 text-xs font-semibold text-white/40">
                  {Math.round(m.share * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${m.method === "cash" ? "bg-emerald-500/70" : "bg-violet-500/70"}`}
              style={{ width: `${Math.round(m.share * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

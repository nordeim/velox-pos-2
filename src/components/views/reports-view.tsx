"use client";

// ---------------------------------------------------------------------------
// Reports (plan F15): the period chips (7/14/30/90 days), the three stat
// cards (TOTAL REVENUE / TRANSACTIONS / AVG. TICKET — icon LEFT), the DAILY
// SALES chart, and the REVENUE BY PAYMENT METHOD + BREAKDOWN BY METHOD
// panels. The CSV export is a superset.
// ---------------------------------------------------------------------------

import * as React from "react";
import { CalendarDays, CreditCard, Download, TrendingUp } from "lucide-react";

import { AreaChart, DonutChart } from "@/components/pos/charts";
import { PageHeader, StatCard } from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiGet, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { REPORT_PERIODS } from "@/lib/reports";

type ReportData = {
  days: number;
  stats: { revenueCents: number; transactions: number; avgTicketCents: number };
  daily: Array<{ label: string; date: string; revenueCents: number; transactions: number }>;
  methods: Array<{ method: string; revenueCents: number; transactions: number }>;
};

export function ReportsView() {
  const { toast } = useToast();
  const [days, setDays] = React.useState<number>(30);
  const [data, setData] = React.useState<ReportData | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await apiGet<ReportData>(`/api/reports/summary?days=${days}`);
        if (!cancelled) {
          setData(result);
          setLoaded(true);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        setLoaded(true);
        toast.error(err instanceof Error ? err.message : "Reports failed to load.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, toast]);

  const exportCsv = () => {
    if (!data) return;
    const head = "date,revenue,transactions";
    const rows = data.daily.map(
      (d) => `${d.date},${(d.revenueCents / 100).toFixed(2)},${d.transactions}`,
    );
    const csv = [head, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veloxpos-reports-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported.");
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Sales & revenue analytics"
        action={
          <div
            role="group"
            aria-label="Report period"
            className="flex items-center gap-1 rounded-xl border border-vx-border bg-vx-surface p-1"
            data-testid="report-periods"
          >
            {REPORT_PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={days === p}
                onClick={() => setDays(p)}
                className={`vx-focusable h-8 rounded-lg px-3 text-xs font-medium outline-none transition-colors ${
                  days === p
                    ? "vx-gradient text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {p} days
              </button>
            ))}
          </div>
        }
      />

      {!loaded ? (
        <p className="text-sm text-slate-500">Loading reports…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="TOTAL REVENUE"
              value={formatMoney(data?.stats.revenueCents ?? 0)}
              icon={TrendingUp}
              tone="violet"
              testId="report-revenue"
            />
            <StatCard
              label="TRANSACTIONS"
              value={String(data?.stats.transactions ?? 0)}
              icon={CalendarDays}
              tone="emerald"
              testId="report-transactions"
            />
            <StatCard
              label="AVG. TICKET"
              value={formatMoney(data?.stats.avgTicketCents ?? 0)}
              icon={CreditCard}
              tone="violet"
              testId="report-avg-ticket"
            />
          </div>

          <section className="vx-card mt-6 p-5" aria-labelledby="daily-sales-heading">
            <div className="flex items-center justify-between">
              <h2 id="daily-sales-heading" className="vx-label text-sm text-white">
                DAILY SALES
              </h2>
              <button
                type="button"
                onClick={exportCsv}
                className="vx-focusable inline-flex h-8 items-center gap-1.5 rounded-lg border border-vx-border px-3 text-xs font-medium text-slate-300 outline-none hover:bg-white/5"
                data-testid="report-export"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
            <div className="mt-4">
              <AreaChart
                points={(data?.daily ?? []).map((d) => ({
                  label: d.label,
                  value: d.revenueCents / 100,
                }))}
                formatValue={(v) => `$${v}`}
                ariaLabel={`Daily sales for the last ${days} days`}
              />
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="vx-card p-5" aria-labelledby="method-heading">
              <h2 id="method-heading" className="vx-label text-sm text-white">
                REVENUE BY PAYMENT METHOD
              </h2>
              {(data?.methods.length ?? 0) === 0 ? (
                <p className="mt-12 text-center text-sm text-slate-500" data-testid="reports-empty">
                  No data for this period
                </p>
              ) : (
                <div className="mt-6">
                  <DonutChart
                    slices={(data?.methods ?? []).map((m) => ({
                      label: m.method,
                      value: m.revenueCents,
                    }))}
                    ariaLabel="Revenue by payment method"
                  />
                </div>
              )}
            </section>

            <section className="vx-card p-5" aria-labelledby="breakdown-heading">
              <h2 id="breakdown-heading" className="vx-label text-sm text-white">
                BREAKDOWN BY METHOD
              </h2>
              {(data?.methods.length ?? 0) === 0 ? (
                <p className="mt-12 text-center text-sm text-slate-500">No data for this period</p>
              ) : (
                <ul className="mt-4 flex flex-col divide-y divide-white/5">
                  {data?.methods.map((m) => (
                    <li key={m.method} className="flex items-center justify-between py-3 text-sm">
                      <span className="capitalize text-slate-300">{m.method}</span>
                      <span className="text-xs text-slate-500">
                        {m.transactions} transaction{m.transactions === 1 ? "" : "s"}
                      </span>
                      <span className="font-semibold text-slate-100">
                        {formatMoney(m.revenueCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

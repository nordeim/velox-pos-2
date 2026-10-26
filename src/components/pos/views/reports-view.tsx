"use client";

// ---------------------------------------------------------------------------
// The Reports view (English copy, reference-measured): "Reports / Sales &
// revenue analytics", the 7/14/30/90 period pills (violet active), the three
// stat cards, the DAILY SALES area chart, REVENUE BY PAYMENT METHOD and
// BREAKDOWN BY METHOD ("No data for this period" empty states).
// ---------------------------------------------------------------------------

import * as React from "react";
import { CalendarDays, CreditCard, TrendingUp } from "lucide-react";

import { AreaChart, PageHeader, type SeriesPoint } from "@/components/pos/shared";
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
        // Session-10 (F-63, measured live): the reference's ONE subtitle
        // exception — every other view's subtitle is slate-500, Reports'
        // own is white/35.
        subtitleClassName="text-white/35"
        actions={
          // Session-5 (measured live): the reference's period selector —
          // container `flex gap-2 p-1 rounded-2xl` with a white/7 border and
          // a rgba(28,31,52,0.85) fill; pills `px-4 py-2 rounded-xl text-xs
          // font-bold` (inactive white/40, hover white/70, active violet-600
          // + shadow-lg).
          <div
            className="flex gap-2 rounded-2xl border border-white/[0.07] bg-[rgba(28,31,52,0.85)] p-1"
            role="group"
            aria-label="Report period"
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDays(p)}
                aria-pressed={days === p}
                className={`vpx-focus rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  days === p
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {p} days
              </button>
            ))}
          </div>
        }
      />

      {/* Session-10 (F-62, measured live on the reference 2026-10-27): the
          Reports stat family is NOT the Dashboard's — flat 48px rounded-2xl
          chips with /15 fills + /30 borders on the LEFT of w-6 tone-400
          icons, 400 white/35 labels, font-black white values, NO corner
          blob. Tones: indigo / emerald / violet (the reference's measured
          pairs). */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportsStat
          label="Total Revenue"
          value={formatMoney(summary.revenue, currency)}
          tone="indigo"
          icon={<TrendingUp className="h-6 w-6" aria-hidden="true" />}
        />
        <ReportsStat
          label="Transactions"
          value={String(summary.transactions)}
          tone="emerald"
          icon={<CalendarDays className="h-6 w-6" aria-hidden="true" />}
        />
        <ReportsStat
          label="Avg. Ticket"
          value={formatMoney(summary.avgTicket, currency)}
          tone="violet"
          icon={<CreditCard className="h-6 w-6" aria-hidden="true" />}
        />
      </div>

      <section className="glass-card mt-5 rounded-2xl p-5" aria-labelledby="reports-daily">
        <h2 id="reports-daily" className="text-sm font-bold uppercase tracking-wider text-white/60">
          Daily Sales
        </h2>
        <div className="mt-3">
          <AreaChart data={series} ariaLabel={`Daily Sales for the last ${days} days`} />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="glass-card rounded-2xl p-5" aria-labelledby="reports-method">
          <h2 id="reports-method" className="text-sm font-bold uppercase tracking-wider text-white/60">
            Revenue by Payment Method
          </h2>
          <MethodTable methods={methods} currency={currency} showShare />
        </section>
        <section className="glass-card rounded-2xl p-5" aria-labelledby="reports-breakdown">
          <h2 id="reports-breakdown" className="text-sm font-bold uppercase tracking-wider text-white/60">
            Breakdown by Method
          </h2>
          <MethodTable methods={methods} currency={currency} />
        </section>
      </div>
    </div>
  );
}

// Session-10 (F-62, measured live on the reference 2026-10-27): the
// Reports stat family — `rounded-2xl p-5 flex items-center gap-4` cards with
// the chip on the LEFT: `w-12 h-12 rounded-2xl` + a {tone}-500/15 fill + a
// 1px {tone}-500/30 border around a w-6 {tone}-400 icon; labels `text-xs
// text-white/35 uppercase tracking-wider` (400); values `text-2xl
// font-black text-white` (900); NO corner blob. (The Dashboard's
// solid-gradient StatCard is a different family — see shared.tsx.)
function ReportsStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "indigo" | "emerald" | "violet";
}) {
  const tones: Record<string, { fill: string; border: string; icon: string }> = {
    indigo: {
      fill: "bg-indigo-500/15",
      border: "border-indigo-500/30",
      icon: "text-indigo-400",
    },
    emerald: {
      fill: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
    },
    violet: {
      fill: "bg-violet-500/15",
      border: "border-violet-500/30",
      icon: "text-violet-400",
    },
  };
  const t = tones[tone];
  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl p-5">
      {/* The icon inherits its tone via currentColor — no wrapper span, so
          the svg's parent IS the chip. */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${t.fill} ${t.border} ${t.icon}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/35">{label}</p>
        <p
          className="text-2xl font-black text-white"
          data-testid={`stat-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
        >
          {value}
        </p>
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
    // Session-10 (F-63, measured live): the reference's own muted tone —
    // h-40 flex items-center justify-center text-white/25 text-sm.
    return (
      <div className="flex h-40 items-center justify-center text-sm text-white/25">
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

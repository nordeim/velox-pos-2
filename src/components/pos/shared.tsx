"use client";

// ---------------------------------------------------------------------------
// Shared view furniture: the page header (title + subtitle, the reference's
// ghost-heading style), the stat cards (the reference ships TWO families —
// the Dashboard's solid-gradient chips and the Reports' flat /15 chips —
// Session-10, F-61/F-62), and the two hand-rolled SVG charts (Session-14:
// the reference's measured indigo/slate families — two DISTINCT contracts,
// zero chart dependencies, pixel-controlled parity).
// ---------------------------------------------------------------------------

import * as React from "react";

import { smoothPath } from "@/lib/chart-path";
import { niceScale } from "@/lib/reports";

export function PageHeader({
  title,
  subtitle,
  actions,
  subtitleClassName,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** The reference's subtitles are text-slate-500 everywhere EXCEPT Reports
   * ("Sales & revenue analytics" is its own white/35 exception — measured
   * live 2026-10-27). Views pass the override; the default is the norm. */
  subtitleClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-white/80">{title}</h1>
        {subtitle && (
          <p className={`mt-1 text-sm ${subtitleClassName ?? "text-slate-500"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Session-10 (F-61, measured live on the reference 2026-10-27): the
// Dashboard stat family — SOLID-GRADIENT icon chips (the reference's own
// v3-era utility classes, verbatim — the Added-banner posture; v4's palette
// hexes are v3-identical) with WHITE w-5 icons, gradient opacity-20 corner
// blobs at -top-6 -right-6, font-semibold slate-500 labels, and font-bold
// mt-1 values. The VALUE COLOR stays the readable superset (text-white/90):
// the reference renders its values in slate-800 on dark glass — VLM-confirmed
// "dim and nearly invisible", its own defect (the same posture as the
// headings doctrine). The Reports view does NOT use this family — it ships
// its own flat-chip row (reports-view.tsx, F-62).
export function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "green" | "violet" | "blue" | "orange";
}) {
  const tones: Record<string, string> = {
    green: "stat-grad-green",
    violet: "stat-grad-violet",
    blue: "stat-grad-blue",
    orange: "stat-grad-orange",
  };
  const gradient = tones[tone];
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5">
      <div
        className={`absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-20 ${gradient}`}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="truncate text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p
            className="mt-1 text-2xl font-bold text-white/90"
            data-testid={`stat-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
          >
            {value}
          </p>
        </div>
        {/* The icon inherits the WHITE stroke via currentColor (the chip's
            text-white) — no wrapper span, so the svg's parent IS the chip. */}
        <div className={`shrink-0 rounded-xl p-2.5 ${gradient} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export type SeriesPoint = { label: string; value: number };

// ---------------------------------------------------------------------------
// Session-14 (F-95..F-106, measured live on the reference 2026-10-27 at
// 1440×900): the chart internals, decoded for the first time. The reference
// ships TWO distinct chart contracts (exactly as it ships two alert and two
// stat families) — the earlier "dotted grid + violet stroke" was an
// unmeasured Session-101 assumption:
//   • Dashboard "Sales — Last 7 days": an indigo-500 #6366f1 2.5px SMOOTH
//     monotone line over a slate-200 #e2e8f0 dashed 3-3 grid, slate-400
//     #94a3b8 axis lines + tick stubs, 12px slate-400 ticks, an indigo
//     gradient area (0.3 @5% → 0 @95%, fill-opacity 0.6), and ZERO data
//     dots. Plot: viewBox 731×280 (the reference's chart is
//     container-responsive — the paddings/fonts are the fixed measured
//     values), edge x=65, top y=5, baseline y=245, plot 661×240.
//   • Reports "Daily Sales": its OWN family — white/4% dashed grid with NO
//     slate axes, 11px white/30 ticks, the indigo line at 2px, the gradient
//     at 0.35 @5%. Plot: viewBox 1130×220, edge x=60, top y=4, baseline
//     y=190, plot 1066×186.
// The colors are SVG ATTRIBUTES (literal hex) — the Tailwind cascade and
// its v4 oklch serialization never touch the charts.
// ---------------------------------------------------------------------------

/** The Dashboard "Sales — Last 7 days" chart (F-95..F-101): indigo smooth
 * line + slate grid/axes + the gradient area + zero dots. The y axis
 * renders NICE TICKS (Session-6 F-50, re-verified this cycle: 0,1,2,3,4 on
 * the empty reference — niceTicks(4) reproduces it exactly). */
export function LineChart({
  data,
  ariaLabel,
}: {
  data: SeriesPoint[];
  ariaLabel: string;
}) {
  // The measured plot box (viewBox 731×280 — the e2e-state container width;
  // the svg scales responsively below it).
  const width = 731;
  const height = 280;
  const plotX = 65;
  const plotY = 5;
  const plotW = width - plotX - 5; // 661
  const plotH = 240;
  const baseY = 245; // the measured axis baseline
  const max = Math.max(4, ...data.map((d) => d.value));
  // F-107 (Session-15): the domain TOP is the nice multiple ≥ max — the
  // curve's peak never overshoots the topmost gridline (the recharts
  // behavior). On the empty store niceScale(4,5) = {4, [0,1,2,3,4]} —
  // byte-identical to the prior niceTicks values, so every empty-state pin
  // holds.
  const scale = niceScale(max, 5);
  const niceMax = scale.top;
  const x = (i: number): number =>
    plotX + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number): number => baseY - (v / niceMax) * plotH;
  const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
  const line = smoothPath(pts);
  // The area closes along the measured baseline (degenerate — zero height —
  // on flat data, exactly like the reference's empty state).
  const lastX = x(data.length - 1);
  const area = `${line} L${lastX},${baseY} L${x(0)},${baseY} Z`;
  // F-50: nice ticks — never one grid line per unit of the domain.
  const gridLines = scale.ticks;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      data-testid="line-chart"
    >
      <defs>
        <linearGradient id="vpx-dash-sales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="95%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* F-96: the slate-200 dashed grid — one horizontal per nice tick. */}
      {gridLines.map((g) => (
        <g key={`g-${g}`}>
          <line
            x1={plotX}
            x2={plotX + plotW}
            y1={y(g)}
            y2={y(g)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={plotX - 8}
            y={y(g)}
            textAnchor="end"
            fontSize="12"
            fill="#94a3b8"
          >
            {g}
          </text>
        </g>
      ))}
      {/* F-96: one vertical per day bucket. */}
      {data.map((d, i) => (
        <line
          key={`v-${i}`}
          x1={x(i)}
          x2={x(i)}
          y1={plotY}
          y2={baseY}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}
      {/* F-97: the y-tick stubs run 6px left of the y-axis. */}
      {gridLines.map((g) => (
        <line
          key={`yt-${g}`}
          x1={plotX}
          x2={plotX - 6}
          y1={y(g)}
          y2={y(g)}
          stroke="#94a3b8"
          strokeWidth="1"
        />
      ))}
      {/* F-97: the x-tick stubs run 6px below the baseline (245→251). */}
      {data.map((d, i) => (
        <line
          key={`xt-${i}`}
          x1={x(i)}
          x2={x(i)}
          y1={baseY}
          y2={baseY + 6}
          stroke="#94a3b8"
          strokeWidth="1"
        />
      ))}
      {/* F-97: the two full-length axes. */}
      <line x1={plotX} y1={baseY} x2={plotX + plotW} y2={baseY} stroke="#94a3b8" strokeWidth="1" />
      <line x1={plotX} y1={plotY} x2={plotX} y2={baseY} stroke="#94a3b8" strokeWidth="1" />
      {/* F-99: the gradient area (renders before the line — paths[0]). */}
      <path d={area} fill="url(#vpx-dash-sales)" fillOpacity="0.6" />
      {/* F-95: the indigo smooth line (paths[last]) — NO data dots (F-100). */}
      <path
        d={line}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* F-98: the x labels — 12px slate-400, middle-anchored, baseline 253. */}
      {data.map((d, i) => (
        <text
          key={`xl-${i}`}
          x={x(i)}
          y={baseY + 8}
          textAnchor="middle"
          fontSize="12"
          fill="#94a3b8"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

/** The Reports "Daily Sales" chart (F-102..F-106): its OWN family — a
 * white/4% dashed grid with NO slate axes, 11px white/30 ticks, the indigo
 * line at 2px, the gradient at 0.35 @5%, $-prefixed y labels and the
 * reference's "d MMM" date labels (already correct since Session-6). */
export function AreaChart({
  data,
  ariaLabel,
}: {
  data: SeriesPoint[];
  ariaLabel: string;
}) {
  // The measured plot box (viewBox 1130×220 at the e2e-state container).
  const width = 1130;
  const height = 220;
  const plotX = 60;
  const plotY = 4;
  const plotW = width - plotX - 4; // 1066
  const plotH = 186;
  const baseY = 190; // the measured area baseline
  const rawMax = Math.max(4, ...data.map((d) => d.value));
  // F-107 (Session-15): same cure as the Dashboard chart — the domain top
  // covers the data on the step lattice (empty store: {4, [0,1,2,3,4]},
  // byte-identical to the prior values).
  const scale = niceScale(rawMax, 5);
  const niceMax = Math.max(4, scale.top);
  const x = (i: number): number =>
    plotX + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const y = (v: number): number => baseY - (v / niceMax) * plotH;
  const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
  const line = smoothPath(pts);
  const lastX = x(data.length - 1);
  const area = `${line} L${lastX},${baseY} L${x(0)},${baseY} Z`;
  // F-50: nice ticks — never one grid line per unit of the domain.
  const gridLines = scale.ticks;
  const labelEvery = Math.max(1, Math.ceil(data.length / 10));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      data-testid="area-chart"
    >
      <defs>
        <linearGradient id="vpx-reports-sales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="95%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* F-103: the white/4% grid — horizontals at the nice ticks… */}
      {gridLines.map((g) => (
        <g key={`g-${g}`}>
          <line
            x1={plotX}
            x2={plotX + plotW}
            y1={y(g)}
            y2={y(g)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={plotX - 8}
            y={y(g)}
            textAnchor="end"
            fontSize="11"
            fill="rgba(255,255,255,0.3)"
          >
            {`$${g}`}
          </text>
        </g>
      ))}
      {/* …and verticals at the LABELED buckets (the reference's own
          thinning rhythm — no vertical per unlabeled bucket). */}
      {data.map((d, i) =>
        i % labelEvery === 0 || i === data.length - 1 ? (
          <line
            key={`v-${i}`}
            x1={x(i)}
            x2={x(i)}
            y1={plotY}
            y2={baseY}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ) : null,
      )}
      {/* F-105: the gradient area at 0.35 → 0 under fill-opacity 0.6. */}
      <path d={area} fill="url(#vpx-reports-sales)" fillOpacity="0.6" />
      {/* F-102: the indigo line at 2px, smooth. */}
      <path
        d={line}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* F-104: the thinned "d MMM" labels — 11px white/30. */}
      {data.map((d, i) =>
        i % labelEvery === 0 || i === data.length - 1 ? (
          <text
            key={`xl-${i}`}
            x={x(i)}
            y={baseY + 22}
            textAnchor="middle"
            fontSize="11"
            fill="rgba(255,255,255,0.3)"
          >
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

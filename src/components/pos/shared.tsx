"use client";

// ---------------------------------------------------------------------------
// Shared view furniture: the page header (title + subtitle, the reference's
// ghost-heading style), the stat cards (the reference ships TWO families —
// the Dashboard's solid-gradient chips and the Reports' flat /15 chips —
// Session-10, F-61/F-62), and the two hand-rolled SVG charts (dotted grid +
// violet stroke — zero chart dependencies, pixel-controlled parity).
// ---------------------------------------------------------------------------

import * as React from "react";

import { niceTicks } from "@/lib/reports";

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

/** The "Sales — Last 7 days" line chart: dotted grid + violet stroke.
 * Session-6 (F-50): the y axis renders NICE TICKS (the reference's
 * Recharts convention, ~5 steps — measured 12px fonts, weekday x labels). */
export function LineChart({
  data,
  height = 260,
  ariaLabel,
}: {
  data: SeriesPoint[];
  height?: number;
  ariaLabel: string;
}) {
  const width = 720;
  const pad = { top: 14, right: 14, bottom: 28, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(4, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max);
  const x = (i: number): number =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number): number => pad.top + innerH - (v / niceMax) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  // F-50: nice ticks — never one grid line per unit of the domain.
  const gridLines = niceTicks(niceMax, 5);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      data-testid="line-chart"
    >
      {gridLines.map((g) => (
        <g key={g}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(g)}
            y2={y(g)}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text x={pad.left - 8} y={y(g) + 4} textAnchor="end" className="fill-white/40" fontSize="12">
            {g}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <g key={`${d.label}-${i}`}>
          <line
            x1={x(i)}
            x2={x(i)}
            y1={pad.top}
            y2={pad.top + innerH}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x={x(i)}
            y={height - 8}
            textAnchor="middle"
            className="fill-white/50"
            fontSize="12"
          >
            {d.label}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={`dot-${i}`} cx={x(i)} cy={y(d.value)} r="3" fill="#8b5cf6">
          <title>{`${d.label}: ${d.value.toFixed(2)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

/** The Reports DAILY SALES area chart: violet area fill + $-prefixed y axis. */
export function AreaChart({
  data,
  height = 280,
  ariaLabel,
}: {
  data: SeriesPoint[];
  height?: number;
  ariaLabel: string;
}) {
  const width = 1080;
  const pad = { top: 16, right: 16, bottom: 30, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const rawMax = Math.max(4, ...data.map((d) => d.value));
  const niceMax = Math.max(4, Math.ceil(rawMax));
  const x = (i: number): number =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number): number => pad.top + innerH - (v / niceMax) * innerH;
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${pad.top + innerH} L${x(0)},${pad.top + innerH} Z`;
  // F-50: nice ticks — never one grid line per unit of the domain.
  const gridLines = niceTicks(niceMax, 5);
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
        <linearGradient id="vpx-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(139,92,246,0.35)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.02)" />
        </linearGradient>
      </defs>
      {gridLines.map((g) => (
        <g key={g}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(g)}
            y2={y(g)}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text x={pad.left - 8} y={y(g) + 4} textAnchor="end" className="fill-white/40" fontSize="11">
            {`$${g}`}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#vpx-area)" />
      <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) =>
        i % labelEvery === 0 || i === data.length - 1 ? (
          <text key={`xl-${i}`} x={x(i)} y={height - 8} textAnchor="middle" className="fill-white/50" fontSize="11">
            {d.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

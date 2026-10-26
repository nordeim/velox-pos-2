"use client";

// ---------------------------------------------------------------------------
// Shared view furniture: the page header (title + subtitle, the reference's
// ghost-heading style), the stat card (icon blob + label + value — the
// Dashboard/Reports card family), and the two hand-rolled SVG charts (dotted
// grid + violet stroke — zero chart dependencies, pixel-controlled parity).
// ---------------------------------------------------------------------------

import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-white/80">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

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
  const tones: Record<string, { chip: string; blob: string }> = {
    green: { chip: "bg-emerald-500/20 text-emerald-400", blob: "bg-emerald-500/25" },
    violet: { chip: "bg-violet-500/20 text-violet-400", blob: "bg-violet-500/25" },
    blue: { chip: "bg-blue-500/20 text-blue-400", blob: "bg-blue-500/25" },
    orange: { chip: "bg-orange-500/20 text-orange-400", blob: "bg-orange-500/25" },
  };
  const t = tones[tone];
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${t.blob}`} aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-white/60">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-white/90" data-testid={`stat-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.chip}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export type SeriesPoint = { label: string; value: number };

/** The "Sales — Last 7 days" line chart: dotted grid + violet stroke. */
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
  const gridLines = Array.from({ length: niceMax + 1 }, (_, i) => i);

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
          <text x={pad.left - 8} y={y(g) + 4} textAnchor="end" className="fill-white/40" fontSize="11">
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
            fontSize="11"
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
  const gridLines = Array.from({ length: niceMax + 1 }, (_, i) => i);
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

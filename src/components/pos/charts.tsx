"use client";

// ---------------------------------------------------------------------------
// The SVG charts (measured F8/F14/F15): violet-400 2px line + soft fill over
// a dashed white/25 grid, with the axis labels the reference renders. Hand-
// rolled SVG (no chart dependency) — deterministic, testable, themed by CSS.
// ---------------------------------------------------------------------------

import * as React from "react";

export type ChartPoint = { label: string; value: number };

/** The daily-sales / last-7-days area chart. */
export function AreaChart({
  points,
  height = 260,
  formatValue = (v: number) => String(v),
  ariaLabel,
}: {
  points: ChartPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  ariaLabel: string;
}) {
  const width = 720;
  const padLeft = 44;
  const padBottom = 28;
  const padTop = 12;
  const plotW = width - padLeft - 12;
  const plotH = height - padTop - padBottom;

  const max = Math.max(1, ...points.map((p) => p.value));
  // y ticks: 4 divisions, rounded up to a readable integer step
  const rawStep = max / 4;
  const step = Math.max(1, Math.ceil(rawStep));
  const yMax = step * 4;

  const xs = (i: number) =>
    points.length <= 1 ? padLeft + plotW / 2 : padLeft + (i * plotW) / (points.length - 1);
  const ys = (v: number) => padTop + plotH - (v / yMax) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${xs(points.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${xs(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : "";

  return (
    <figure className="m-0" data-testid="area-chart">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const y = padTop + plotH - (i * plotH) / 4;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                x2={width - 12}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill="rgba(255,255,255,0.45)"
              >
                {formatValue(step * i)}
              </text>
            </g>
          );
        })}
        {areaPath && (
          <>
            <path d={areaPath} fill="rgba(124,58,237,0.18)" stroke="none" />
            <path d={linePath} fill="none" stroke="#a78bfa" strokeWidth={2} strokeLinejoin="round" />
          </>
        )}
        {points.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            {points.length <= 14 && (
              <circle cx={xs(i)} cy={ys(p.value)} r={2.5} fill="#a78bfa" />
            )}
            <text
              x={xs(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fill="rgba(255,255,255,0.45)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

/** The payment-method donut (Reports). */
const DONUT_COLORS: Record<string, string> = {
  cash: "#10b981",
  card: "#3b82f6",
  transfer: "#a78bfa",
  other: "#f59e0b",
};

export function DonutChart({
  slices,
  ariaLabel,
}: {
  slices: Array<{ label: string; value: number }>;
  ariaLabel: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const size = 200;
  const radius = 80;
  const stroke = 26;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-8" data-testid="donut-chart">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${size} ${size}`}
        className="h-44 w-44"
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {total > 0 &&
          slices.map((slice) => {
            const fraction = slice.value / total;
            const dash = fraction * circumference;
            const el = (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={DONUT_COLORS[slice.label] ?? "#a78bfa"}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 capitalize text-slate-300">
            <span
              aria-hidden
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[slice.label] ?? "#a78bfa" }}
            />
            <span className="capitalize">{slice.label}</span>
            <span className="ml-auto pl-4 text-slate-400">
              {total > 0 ? `${Math.round((slice.value / total) * 100)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

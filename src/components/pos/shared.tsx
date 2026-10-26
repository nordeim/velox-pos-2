"use client";

// ---------------------------------------------------------------------------
// Shared POS view primitives: the page header, the stat card (measured F14:
// label + 24px/700 value + trailing icon block), the empty-state card (F16),
// and the primary/ghost buttons (F6 gradients).
// ---------------------------------------------------------------------------

import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="vx-page-title">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** The reference's stat-card icon block: a rounded gradient-tinted square. */
const ICON_TONES: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-400" },
  blue: { bg: "bg-blue-500/15", text: "text-blue-400" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "violet",
  testId,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof ICON_TONES;
  testId?: string;
}) {
  const colors = ICON_TONES[tone];
  return (
    <div className="vx-card flex items-center justify-between gap-4 p-5" data-testid={testId}>
      <div className="min-w-0">
        <p className="vx-label">{label}</p>
        <p
          className="mt-1 truncate text-2xl font-bold text-slate-700"
          style={{ color: "rgb(30 41 59)" }}
          data-testid={testId ? `${testId}-value` : undefined}
        >
          {value}
        </p>
      </div>
      <span
        aria-hidden
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          colors.bg,
          colors.text,
        )}
      >
        <Icon className="h-5.5 w-5.5" strokeWidth={2} />
      </span>
    </div>
  );
}

/** The reference's empty-state card (F16): icon + title + copy, centered. */
export function EmptyState({
  icon: Icon,
  title,
  text,
  children,
  testId,
}: {
  icon: LucideIcon;
  title?: string;
  text: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="vx-card flex flex-col items-center justify-center gap-4 px-6 py-14 text-center" data-testid={testId}>
      <Icon aria-hidden className="h-12 w-12 text-slate-500" strokeWidth={1.5} />
      {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
      <p className="text-sm text-slate-400">{text}</p>
      {children}
    </div>
  );
}

/** The measured primary action (F6): violet→indigo 135° gradient + glow. */
export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "vx-gradient vx-gradient-hover vx-glow vx-focusable inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "vx-focusable inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-vx-border bg-vx-elevated px-4 text-sm font-medium text-slate-200 outline-none transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** The reference's uppercase table wrapper: card + scroll-x + header row. */
export function TableCard({ children, testId }: { children: React.ReactNode; testId?: string }) {
  return (
    <div className="vx-card overflow-hidden" data-testid={testId}>
      <div className="vx-scroll overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("vx-table-header border-b border-white/10 px-5 py-3.5", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-white/5 px-5 py-3.5 text-slate-300", className)}>{children}</td>;
}

/** Status pills (STATUS/ESTADO columns): soft tinted chips. */
const PILL_TONES: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-400",
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  closed: "bg-white/5 text-slate-400",
  inactive: "bg-white/5 text-slate-400",
  refunded: "bg-amber-500/15 text-amber-400",
  low: "bg-amber-500/15 text-amber-400",
  ok: "bg-emerald-500/15 text-emerald-400",
  out: "bg-red-500/15 text-red-400",
};

export function StatusPill({ kind, label }: { kind: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        PILL_TONES[kind] ?? "bg-white/5 text-slate-300",
      )}
    >
      {label}
    </span>
  );
}

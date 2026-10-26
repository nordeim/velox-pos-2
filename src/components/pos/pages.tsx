"use client";

// ---------------------------------------------------------------------------
// The client page components behind the 8 gated routes. Each wires the view
// to the shared bootstrap (session + collections) and renders the shell
// content only when ready (the splash contract: no intermediate flashes).
// ---------------------------------------------------------------------------

import * as React from "react";

import { usePosBootstrap } from "@/components/pos/use-pos-bootstrap";
import { TerminalView } from "@/components/pos/views/terminal-view";
import { DashboardView } from "@/components/pos/views/dashboard-view";
import { InventoryView } from "@/components/pos/views/inventory-view";
import { SalesView } from "@/components/pos/views/sales-view";
import { RegistersView } from "@/components/pos/views/registers-view";
import { CashiersView } from "@/components/pos/views/cashiers-view";
import { ReportsView } from "@/components/pos/views/reports-view";
import { StoreSettingsView } from "@/components/pos/views/settings-view";

function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = usePosBootstrap();
  if (!ready) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <div className="brand-chip h-10 w-10 animate-pulse rounded-xl" aria-hidden="true" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  return <>{children}</>;
}

export function TerminalPage() {
  return (
    <Gate>
      <TerminalView />
    </Gate>
  );
}

export function DashboardPage() {
  return (
    <Gate>
      <DashboardView />
    </Gate>
  );
}

export function InventoryPage() {
  return (
    <Gate>
      <InventoryView />
    </Gate>
  );
}

export function SalesPage() {
  return (
    <Gate>
      <SalesView />
    </Gate>
  );
}

export function RegistersPage() {
  return (
    <Gate>
      <RegistersView />
    </Gate>
  );
}

export function CashiersPage() {
  return (
    <Gate>
      <CashiersView />
    </Gate>
  );
}

export function ReportsPage() {
  return (
    <Gate>
      <ReportsView />
    </Gate>
  );
}

export function StoreSettingsPage() {
  return (
    <Gate>
      <StoreSettingsView />
    </Gate>
  );
}

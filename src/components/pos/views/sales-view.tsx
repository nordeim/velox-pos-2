"use client";

// ---------------------------------------------------------------------------
// The Sales view — the reference's SPANISH copy preserved verbatim
// ("Historial de Ventas", "0 ventas registradas", "Buscar por ticket, cliente
// o cajero...", TICKET/FECHA/CAJERO/MÉTODO/TOTAL/ESTADO/ACCIONES, "Sin
// ventas"). Superset: a receipt viewer behind the eye action + refunds.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Eye, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/pos/shared";
import { usePosStore, type Sale } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import type { CartLine } from "@/lib/cart";

function saleDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function SaleDetailDialog({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const settings = usePosStore((s) => s.settings);
  if (!sale) return null;
  const lines = JSON.parse(sale.items) as CartLine[];
  const currency = settings?.currency ?? "USD";
  return (
    <Dialog open={!!sale} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">{sale.ticket}</DialogTitle>
          <DialogDescription className="text-white/50">
            {new Date(sale.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 font-mono text-sm">
          {lines.map((l) => (
            <div key={l.productId} className="flex justify-between text-white/80">
              <span className="truncate">
                {l.qty} × {l.name}
              </span>
              <span>{formatMoney(l.price * l.qty, currency)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-dashed border-edge pt-2 font-bold text-white">
            <span>Total</span>
            <span>{formatMoney(sale.total, currency)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Método</span>
            <span className="capitalize">{sale.paymentMethod}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cerrar
          </Button>
          <Button onClick={() => window.print()} className="glass-button-primary rounded-xl border-0">
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SalesView() {
  const sales = usePosStore((s) => s.sales);
  const settings = usePosStore((s) => s.settings);
  const [search, setSearch] = React.useState("");
  const [detail, setDetail] = React.useState<Sale | null>(null);
  const currency = settings?.currency ?? "USD";

  const visible = sales.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const cashier = s.cashier?.fullName ?? s.cashier?.email ?? "";
    return (
      s.ticket.toLowerCase().includes(q) ||
      s.customer.toLowerCase().includes(q) ||
      cashier.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-6">
      <PageHeader title="Historial de Ventas" subtitle={`${sales.length} ventas registradas`} />

      <div className="mt-5 max-w-md">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket, cliente o cajero..."
            aria-label="Buscar por ticket, cliente o cajero"
            className="pl-10 text-white"
          />
        </div>
      </div>

      <div className="glass-card mt-4 overflow-hidden rounded-2xl">
        <div className="vpx-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge text-xs font-bold uppercase tracking-wider text-white/50">
                <th scope="col" className="px-5 py-3.5">Ticket</th>
                <th scope="col" className="px-5 py-3.5">Fecha</th>
                <th scope="col" className="px-5 py-3.5">Cajero</th>
                <th scope="col" className="px-5 py-3.5">Método</th>
                <th scope="col" className="px-5 py-3.5">Total</th>
                <th scope="col" className="px-5 py-3.5">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-white/50">
                    Sin ventas
                  </td>
                </tr>
              ) : (
                visible.map((s) => (
                  <tr key={s.id} className="border-b border-edge/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono font-semibold text-white/90">{s.ticket}</td>
                    <td className="px-5 py-3.5 text-white/60">{saleDate(s.createdAt)}</td>
                    <td className="px-5 py-3.5 text-white/70">
                      {s.cashier?.fullName || s.cashier?.email || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          s.paymentMethod === "cash"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-violet-500/15 text-violet-300"
                        }`}
                      >
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white/90">
                      {formatMoney(s.total, currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          s.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-orange-500/15 text-orange-400"
                        }`}
                      >
                        {s.status === "completed" ? "Completada" : "Reembolsada"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(s)}
                        aria-label={`Ver ${s.ticket}`}
                        className="vpx-focus rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-violet-300"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleDetailDialog sale={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

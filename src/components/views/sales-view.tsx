"use client";

// ---------------------------------------------------------------------------
// Sales — "Historial de Ventas" (the reference's Spanish copy, plan F12/F17):
// the count subtitle, the search ("Buscar por ticket, cliente o cajero..."),
// and the TICKET/FECHA/CAJERO/MÉTODO/TOTAL/ESTADO/ACCIONES table with a
// receipt detail dialog + refund action (superset — the reference's rows
// never populate).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Eye, Printer, ReceiptText, RotateCcw, Search, X } from "lucide-react";

import {
  GhostButton,
  PageHeader,
  PrimaryButton,
  StatusPill,
  TableCard,
  Td,
  Th,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiPatch, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";

type SaleItem = {
  id: string;
  name: string;
  qty: number;
  priceCents: number;
  lineTotalCents: number;
  taxRate: number;
};

type Sale = {
  id: string;
  ticketNo: string;
  method: string;
  status: string;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  paidCents: number;
  changeCents: number;
  customerName: string;
  note: string;
  createdAt: string;
  register: { name: string };
  user: { fullName: string };
  items: SaleItem[];
};

export function SalesView() {
  const { toast } = useToast();
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [detail, setDetail] = React.useState<Sale | null>(null);

  const reload = React.useCallback(() => apiGet<Sale[]>("/api/sales"), []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await reload();
        if (!cancelled) setSales(rows);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Sales failed to load.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, toast]);

  const refund = async (sale: Sale) => {
    if (!window.confirm(`Refund ${sale.ticketNo}? Stock will be restored.`)) return;
    try {
      await apiPatch(`/api/sales/${sale.id}`, { status: "refunded" });
      toast.success(`${sale.ticketNo} refunded — stock restored.`);
      setDetail(null);
      setSales(await reload());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The refund failed.");
    }
  };

  const filtered = sales.filter((sale) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      sale.ticketNo.toLowerCase().includes(q) ||
      sale.customerName.toLowerCase().includes(q) ||
      sale.user.fullName.toLowerCase().includes(q)
    );
  });

  const methodLabel = (method: string) =>
    method === "card" ? "Tarjeta" : method === "cash" ? "Efectivo" : method === "transfer" ? "Transferencia" : "Otro";

  return (
    <div>
      <PageHeader
        title="Historial de Ventas"
        subtitle={`${sales.length} venta${sales.length === 1 ? "" : "s"} registrada${sales.length === 1 ? "" : "s"}`}
      />

      <div className="mb-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search sales</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por ticket, cliente o cajero..."
            className="vx-input pl-9"
            data-testid="sales-search"
          />
        </label>
      </div>

      {!loaded ? (
        <p className="text-sm text-slate-500">Cargando ventas…</p>
      ) : (
        <TableCard testId="sales-table">
          <thead>
            <tr>
              <Th>TICKET</Th>
              <Th>FECHA</Th>
              <Th>CAJERO</Th>
              <Th>MÉTODO</Th>
              <Th>TOTAL</Th>
              <Th>ESTADO</Th>
              <Th className="text-right">ACCIONES</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="border-b border-white/5 px-5 py-14 text-center text-slate-400">
                  Sin ventas
                </td>
              </tr>
            )}
            {filtered.map((sale) => (
              <tr key={sale.id} className="transition-colors hover:bg-white/[0.02]">
                <Td className="font-semibold text-violet-300">{sale.ticketNo}</Td>
                <Td>{new Date(sale.createdAt).toLocaleString()}</Td>
                <Td>{sale.user.fullName}</Td>
                <Td className="capitalize">{methodLabel(sale.method)}</Td>
                <Td className="font-semibold text-slate-100">{formatMoney(sale.totalCents)}</Td>
                <Td>
                  <StatusPill
                    kind={sale.status}
                    label={sale.status === "refunded" ? "Reembolsada" : "Completada"}
                  />
                </Td>
                <Td className="text-right">
                  <span className="inline-flex justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Ver ${sale.ticketNo}`}
                      onClick={() => setDetail(sale)}
                      className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-violet-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}

      {/* ---- the receipt detail dialog ---- */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle ${detail.ticketNo}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="sale-detail-dialog"
        >
          <button
            type="button"
            aria-label="Close detail"
            onClick={() => setDetail(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{detail.ticketNo}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDetail(null)}
                className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div id="vx-receipt" className="flex flex-col gap-3 text-sm text-slate-200">
              <p className="text-xs text-slate-400">
                {new Date(detail.createdAt).toLocaleString()} · {detail.register.name} ·{" "}
                {detail.user.fullName}
                {detail.customerName ? ` · ${detail.customerName}` : ""}
              </p>
              <ul className="divide-y divide-white/5">
                {detail.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-1.5">
                    <span className="min-w-0 truncate">
                      {item.qty} × {item.name}
                    </span>
                    <span className="ml-2 shrink-0">{formatMoney(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-1 border-t border-vx-border pt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(detail.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>{formatMoney(detail.taxCents)}</span>
                </div>
                {detail.discountCents > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento</span>
                    <span>−{formatMoney(detail.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>TOTAL</span>
                  <span>{formatMoney(detail.totalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="capitalize">{methodLabel(detail.method)}</span>
                  <span>{formatMoney(detail.paidCents)}</span>
                </div>
                {detail.method === "cash" && (
                  <div className="flex justify-between">
                    <span>Cambio</span>
                    <span>{formatMoney(detail.changeCents)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {detail.status === "completed" && (
                <GhostButton onClick={() => void refund(detail)}>
                  <RotateCcw className="h-4 w-4" />
                  Reembolsar
                </GhostButton>
              )}
              <PrimaryButton onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

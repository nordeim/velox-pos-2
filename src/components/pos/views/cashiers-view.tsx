"use client";

// ---------------------------------------------------------------------------
// The Cashiers view — the reference's SPANISH copy preserved verbatim
// ("Cajeros", "0 usuarios registrados", "No hay usuarios registrados",
// "Turnos Recientes" with CAJERO/CAJA/INICIO/FIN/VENTAS/ESTADO). Superset:
// add/deactivate cashiers (role=cashier accounts) with a temp password.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Plus, UserRound, Users } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/pos/shared";
import { apiGet, apiSend, usePosStore, type Cashier } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { shiftDuration, shiftTime } from "@/lib/shift";

function AddCashierDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast: toastApi } = useToast();

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const row = await apiSend<Cashier>(
        "POST",
        "/api/cashiers", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      usePosStore.getState().upsertCashier(row);
      toastApi.success("Cajero agregado")
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el cajero.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cajero</DialogTitle>
          <DialogDescription className="text-white/50">
            Crea la cuenta con la que el cajero iniciará sesión.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="c-name">
              Nombre *
            </Label>
            <Input
              id="c-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-email">
              Email *
            </Label>
            <Input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-password">
              Contraseña temporal * (mín. 8)
            </Label>
            <Input
              id="c-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="glass-button rounded-xl border-0">
            Cancelar
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy || !fullName.trim() || !email.trim() || password.length < 8}
            className="glass-button-primary rounded-xl border-0"
          >
            {busy ? "Guardando…" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CashiersView() {
  const cashiers = usePosStore((s) => s.cashiers);
  const shifts = usePosStore((s) => s.shifts);
  const sales = usePosStore((s) => s.sales);
  const settings = usePosStore((s) => s.settings);
  const setCashiers = usePosStore((s) => s.setCashiers);
  const { toast: toastApi } = useToast();
  const currency = settings?.currency ?? "USD";
  const [addOpen, setAddOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    apiGet<Cashier[]>("/api/cashiers")
      .then((rows) => {
        if (!cancelled) setCashiers(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [setCashiers]);

  const recentShifts = shifts.slice(0, 10);

  const deactivate = async (c: Cashier): Promise<void> => {
    try {
      await apiSend<Cashier>("DELETE", `/api/cashiers/${c.id}`);
      const rows = await apiGet<Cashier[]>("/api/cashiers");
      setCashiers(rows);
      toastApi.success("Cajero desactivado")
    } catch (err) {
      toastApi.error(`Error: ${err instanceof Error ? err.message : "Intenta de nuevo."}`)
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <PageHeader
        title="Cajeros"
        subtitle={`${cashiers.length} usuarios registrados`}
        actions={<AddCashierButton onOpen={() => setAddOpen(true)} />}
      />

      {cashiers.length === 0 ? (
        // Session-10 (F-63, measured live): the reference's empty card —
        // p-5 + py-12, a w-16 (64px) slate-200 stroke-2 Users icon with mb-3,
        // and slate-500 copy (the Registers empty card's exact family).
        <div className="glass-card mt-5 rounded-2xl p-5 py-12 text-center">
          <Users className="mx-auto mb-3 h-16 w-16 text-slate-200" strokeWidth={2} aria-hidden="true" />
          <p className="text-slate-500">No hay usuarios registrados</p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="cashier-cards">
          {cashiers.map((c) => (
            <li key={c.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{c.fullName || "Sin nombre"}</p>
                  <p className="truncate text-sm text-white/50">{c.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/40"
                  }`}
                >
                  {c.active ? "Activo" : "Inactivo"}
                </span>
                {c.active && (
                  <button
                    type="button"
                    onClick={() => void deactivate(c)}
                    className="vpx-focus text-sm text-white/40 underline-offset-2 hover:text-red-400 hover:underline"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="glass-card mt-6 rounded-2xl p-5" aria-labelledby="turnos-title">
        {/* Session-9 (F-57): h3 — the reference renders "Turnos Recientes"
            as level-3 (measured live). */}
        <h3 id="turnos-title" className="text-base font-bold text-white/60">
          Turnos Recientes
        </h3>
        <div className="vpx-scroll mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge text-xs font-bold uppercase tracking-wider text-white/50">
                <th scope="col" className="px-4 py-3">Cajero</th>
                <th scope="col" className="px-4 py-3">Caja</th>
                <th scope="col" className="px-4 py-3">Inicio</th>
                <th scope="col" className="px-4 py-3">Fin</th>
                <th scope="col" className="px-4 py-3">Ventas</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentShifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                    Sin turnos registrados
                  </td>
                </tr>
              ) : (
                recentShifts.map((s) => {
                  const shiftSales = sales.filter((sale) => sale.shiftId === s.id);
                  const total = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
                  return (
                    <tr key={s.id} className="border-b border-edge/60 last:border-0">
                      <td className="px-4 py-3 text-white/80">
                        {s.cashier?.fullName || s.cashier?.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-white/70">{s.register?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/60">
                        {shiftTime(s.openedAt)} · {shiftDuration(s.openedAt, s.closedAt)}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {s.closedAt ? shiftTime(s.closedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {formatMoney(total, currency)}{" "}
                        <span className="text-white/40">({shiftSales.length})</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            s.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/5 text-white/50"
                          }`}
                        >
                          {s.status === "active" ? "Abierto" : "Cerrado"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddCashierDialog key={`add-${addOpen}`} open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddCashierButton({ onOpen }: { onOpen: () => void }) {
  return (
    <Button onClick={onOpen} className="glass-button-primary rounded-xl border-0">
      <Plus className="h-4 w-4" aria-hidden="true" />
      Nuevo cajero
    </Button>
  );
}

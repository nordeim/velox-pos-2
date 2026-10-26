"use client";

// ---------------------------------------------------------------------------
// Cashiers — "Cajeros" (the reference's Spanish copy, plan F20): the count
// subtitle, the user cards (or the measured empty state), the "Turnos
// Recientes" table (CAJERO/CAJA/INICIO/FIN/VENTAS/ESTADO), and the New
// Cashier dialog (admin-only — the API enforces the role too).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Plus, Trash2, UserCog, Users, X } from "lucide-react";

import {
  EmptyState,
  GhostButton,
  PageHeader,
  PrimaryButton,
  StatusPill,
  TableCard,
  Td,
  Th,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";

type Cashier = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  active: boolean;
  createdAt: string;
};

type RecentShift = {
  id: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
  register: { name: string };
  user: { id: string; fullName: string };
  sales: unknown[];
};

export function CashiersView() {
  const { toast } = useToast();
  const [cashiers, setCashiers] = React.useState<Cashier[]>([]);
  const [shifts, setShifts] = React.useState<RecentShift[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [denied, setDenied] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "cashier", phone: "" });
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    const [cashierRows, shiftRows] = await Promise.all([
      apiGet<Cashier[]>("/api/cashiers").catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 400 || err.status === 403)) {
          setDenied(true);
          return [] as Cashier[];
        }
        throw err;
      }),
      apiGet<RecentShift[]>("/api/shifts"),
    ]);
    setCashiers(cashierRows);
    setShifts(shiftRows);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [cashierRows, shiftRows] = await Promise.all([
          apiGet<Cashier[]>("/api/cashiers").catch((err: unknown) => {
            if (err instanceof ApiError && (err.status === 400 || err.status === 403)) {
              setDenied(true);
              return [] as Cashier[];
            }
            throw err;
          }),
          apiGet<RecentShift[]>("/api/shifts"),
        ]);
        if (cancelled) return;
        setCashiers(cashierRows);
        setShifts(shiftRows);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Cashiers failed to load.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/cashiers", form);
      toast.success("Cashier created.");
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", role: "cashier", phone: "" });
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The cashier failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (cashier: Cashier) => {
    try {
      await apiPatch(`/api/cashiers/${cashier.id}`, { active: !cashier.active });
      toast.success(cashier.active ? "Cashier deactivated." : "Cashier activated.");
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The update failed.");
    }
  };

  const remove = async (cashier: Cashier) => {
    if (!window.confirm(`Delete "${cashier.name}"? Their shift history is removed too.`)) return;
    try {
      await apiDelete(`/api/cashiers/${cashier.id}`);
      toast.success("Cashier deleted.");
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The cashier failed to delete.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Cajeros"
        subtitle={`${cashiers.length} usuario${cashiers.length === 1 ? "" : "s"} registrado${cashiers.length === 1 ? "" : "s"}`}
        action={
          !denied && (
            <PrimaryButton onClick={() => setDialogOpen(true)} data-testid="new-cashier">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New Cashier
            </PrimaryButton>
          )
        }
      />

      {denied && (
        <p role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Only administrators can manage cashiers.
        </p>
      )}

      {!loaded ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : cashiers.length === 0 && !denied ? (
        <EmptyState icon={Users} text="No hay usuarios registrados" testId="cashiers-empty" />
      ) : cashiers.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="cashier-cards">
          {cashiers.map((cashier) => (
            <li key={cashier.id} className="vx-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400"
                  >
                    <UserCog className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{cashier.name}</p>
                    <p className="truncate text-xs text-slate-500">{cashier.email}</p>
                  </div>
                </div>
                <StatusPill kind={cashier.active ? "active" : "inactive"} label={cashier.active ? "Active" : "Inactive"} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium capitalize text-slate-300">
                  {cashier.role}
                </span>
                <span className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => void toggleActive(cashier)}
                    className="vx-focusable rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 outline-none hover:bg-white/5"
                  >
                    {cashier.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${cashier.name}`}
                    onClick={() => void remove(cashier)}
                    className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="vx-card mt-6 p-5" aria-labelledby="turnos-heading">
        <h2 id="turnos-heading" className="text-base font-bold text-white">
          Turnos Recientes
        </h2>
        <div className="mt-3">
          <TableCard testId="cashier-shifts">
            <thead>
              <tr>
                <Th>CAJERO</Th>
                <Th>CAJA</Th>
                <Th>INICIO</Th>
                <Th>FIN</Th>
                <Th>VENTAS</Th>
                <Th>ESTADO</Th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={6} className="border-b border-white/5 px-5 py-10 text-center text-slate-400">
                    Sin turnos
                  </td>
                </tr>
              )}
              {shifts.map((shift) => (
                  <tr key={shift.id}>
                    <Td>{shift.user.fullName}</Td>
                    <Td>{shift.register.name}</Td>
                    <Td>{new Date(shift.openedAt).toLocaleString()}</Td>
                    <Td>{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : "—"}</Td>
                    <Td>{String((shift.sales as unknown[] | undefined)?.length ?? 0)}</Td>
                    <Td>
                      <StatusPill kind={shift.status} label={shift.status} />
                    </Td>
                  </tr>
                ))}
            </tbody>
          </TableCard>
        </div>
      </section>

      {/* ---- the New Cashier dialog ---- */}
      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New cashier"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="cashier-dialog"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setDialogOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">New Cashier</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4" data-testid="cashier-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Name *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="vx-input"
                  data-testid="cashier-name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Email *
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="vx-input"
                  data-testid="cashier-email"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Temporary password *
                <input
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="vx-input"
                  data-testid="cashier-password"
                />
                <span className="text-xs text-slate-500">
                  Share it with the cashier; they change it from Settings.
                </span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                  Role
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="vx-input"
                    data-testid="cashier-role"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="vx-input"
                    data-testid="cashier-phone"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" disabled={busy}>
                  Create
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

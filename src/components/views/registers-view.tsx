"use client";

// ---------------------------------------------------------------------------
// Registers — "Cash Registers" (plan F19): the header + count, the gradient
// "New Register" action, the register cards with their live shift status,
// the Open Shift / Close Shift flows (the Terminal's gate), and edit/delete.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Monitor, Pencil, Play, Plus, Square, Trash2, X } from "lucide-react";

import {
  EmptyState,
  GhostButton,
  PageHeader,
  PrimaryButton,
  StatusPill,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";

type Register = {
  id: string;
  name: string;
  location: string;
};

type Shift = {
  id: string;
  registerId: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
  openingFloatCents: number;
  expectedCashCents: number;
  closingCashCents: number | null;
  register: { id: string; name: string; location: string };
};

export function RegistersView() {
  const { toast } = useToast();
  const [registers, setRegisters] = React.useState<Register[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  // new/edit dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Register | null>(null);
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  // open-shift dialog
  const [openShiftFor, setOpenShiftFor] = React.useState<Register | null>(null);
  const [float, setFloat] = React.useState("100.00");
  // close-shift dialog
  const [closeShiftRow, setCloseShiftRow] = React.useState<Shift | null>(null);
  const [counted, setCounted] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    const [registerRows, shiftRows] = await Promise.all([
      apiGet<Register[]>("/api/registers"),
      apiGet<Shift[]>("/api/shifts"),
    ]);
    setRegisters(registerRows);
    setShifts(shiftRows);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [registerRows, shiftRows] = await Promise.all([
          apiGet<Register[]>("/api/registers"),
          apiGet<Shift[]>("/api/shifts"),
        ]);
        if (cancelled) return;
        setRegisters(registerRows);
        setShifts(shiftRows);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Registers failed to load.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const submitRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await apiPatch(`/api/registers/${editing.id}`, { name, location });
        toast.success("Register updated.");
      } else {
        await apiPost("/api/registers", { name, location });
        toast.success("Register created.");
      }
      setDialogOpen(false);
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The register failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const removeRegister = async (register: Register) => {
    if (!window.confirm(`Delete "${register.name}"? Its shift history is removed too.`)) return;
    try {
      await apiDelete(`/api/registers/${register.id}`);
      toast.success("Register deleted.");
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The register failed to delete.");
    }
  };

  const openShift = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!openShiftFor) return;
    setBusy(true);
    try {
      await apiPost("/api/shifts", {
        registerId: openShiftFor.id,
        openingFloat: float === "" ? 0 : Number(float),
      });
      toast.success(`Shift opened on "${openShiftFor.name}". The Terminal is ready.`);
      setOpenShiftFor(null);
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The shift failed to open.");
    } finally {
      setBusy(false);
    }
  };

  const closeShift = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!closeShiftRow) return;
    setBusy(true);
    try {
      await apiPost(`/api/shifts/${closeShiftRow.id}/close`, {
        closingCash: counted === "" ? 0 : Number(counted),
      });
      toast.success("Shift closed.");
      setCloseShiftRow(null);
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The shift failed to close.");
    } finally {
      setBusy(false);
    }
  };

  const openShiftByRegister = new Map(
    shifts.filter((s) => s.status === "open").map((s) => [s.registerId, s]),
  );

  return (
    <div>
      <PageHeader
        title="Cash Registers"
        subtitle={`${registers.length} register${registers.length === 1 ? "" : "s"} configured`}
        action={
          <PrimaryButton
            onClick={() => {
              setEditing(null);
              setName("");
              setLocation("");
              setDialogOpen(true);
            }}
            data-testid="new-register"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Register
          </PrimaryButton>
        }
      />

      {!loaded ? (
        <p className="text-sm text-slate-500">Loading registers…</p>
      ) : registers.length === 0 ? (
        <EmptyState
          icon={Monitor}
          text="No registers configured yet"
          testId="registers-empty"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="register-cards">
          {registers.map((register) => {
            const shift = openShiftByRegister.get(register.id);
            return (
              <li key={register.id} className="vx-card p-5" data-testid={`register-card-${register.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400"
                    >
                      <Monitor className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{register.name}</p>
                      <p className="text-xs text-slate-500">
                        {register.location || "No location"}
                      </p>
                    </div>
                  </div>
                  <StatusPill kind={shift ? "open" : "closed"} label={shift ? "Open shift" : "Closed"} />
                </div>

                {shift && (
                  <div className="mt-4 rounded-xl border border-vx-border bg-white/[0.02] p-3 text-xs text-slate-400">
                    <p>
                      Opened {new Date(shift.openedAt).toLocaleString()} · float{" "}
                      {formatMoney(shift.openingFloatCents)}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {shift ? (
                    <>
                      <GhostButton
                        onClick={() => {
                          setCloseShiftRow(shift);
                          setCounted("");
                        }}
                        data-testid={`close-shift-${register.id}`}
                      >
                        <Square className="h-4 w-4" />
                        Close Shift
                      </GhostButton>
                      <a
                        href="/Terminal"
                        className="vx-focusable inline-flex h-10 items-center rounded-xl border border-vx-border bg-vx-elevated px-4 text-sm font-medium text-slate-200 outline-none hover:bg-white/5"
                      >
                        Open Terminal
                      </a>
                    </>
                  ) : (
                    <PrimaryButton
                      onClick={() => {
                        setOpenShiftFor(register);
                        setFloat("100.00");
                      }}
                      data-testid={`open-shift-${register.id}`}
                    >
                      <Play className="h-4 w-4" />
                      Open Shift
                    </PrimaryButton>
                  )}
                  <span className="ml-auto inline-flex gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${register.name}`}
                      onClick={() => {
                        setEditing(register);
                        setName(register.name);
                        setLocation(register.location);
                        setDialogOpen(true);
                      }}
                      className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-violet-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${register.name}`}
                      onClick={() => void removeRegister(register)}
                      className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ---- recent shifts ---- */}
      {shifts.length > 0 && (
        <section className="vx-card mt-6 p-5" aria-labelledby="recent-shifts-heading">
          <h2 id="recent-shifts-heading" className="text-base font-bold text-white">
            Recent shifts
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-white/5">
            {shifts.slice(0, 8).map((shift) => (
              <li key={shift.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                <span className="font-medium text-slate-200">{shift.register.name}</span>
                <span className="text-xs text-slate-500">
                  {new Date(shift.openedAt).toLocaleString()}
                  {shift.closedAt ? ` → ${new Date(shift.closedAt).toLocaleTimeString()}` : ""}
                </span>
                <span className="ml-auto flex items-center gap-3">
                  {shift.status === "closed" && (
                    <span className="text-xs text-slate-500">
                      counted {formatMoney(shift.closingCashCents ?? 0)} / expected{" "}
                      {formatMoney(shift.expectedCashCents)}
                    </span>
                  )}
                  <StatusPill kind={shift.status} label={shift.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- the New/Edit Register dialog (measured F19 fields) ---- */}
      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit register" : "New register"}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="register-dialog"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setDialogOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Edit Register" : "New Register"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submitRegister} className="flex flex-col gap-4" data-testid="register-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Register 1"
                  className="vx-input"
                  data-testid="register-name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Location
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main entrance"
                  className="vx-input"
                  data-testid="register-location"
                />
              </label>
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" disabled={busy} data-testid="register-submit">
                  {editing ? "Save" : "Create"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- the Open Shift dialog ---- */}
      {openShiftFor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Open shift on ${openShiftFor.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="open-shift-dialog"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setOpenShiftFor(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white">Open shift — {openShiftFor.name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Count the drawer's opening float. The Terminal unlocks while the shift is open.
            </p>
            <form onSubmit={openShift} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Opening float
                <input
                  inputMode="decimal"
                  value={float}
                  onChange={(e) => setFloat(e.target.value)}
                  className="vx-input"
                  data-testid="shift-float"
                />
              </label>
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setOpenShiftFor(null)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" disabled={busy}>
                  Open shift
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- the Close Shift dialog ---- */}
      {closeShiftRow && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Close shift"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="close-shift-dialog"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setCloseShiftRow(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white">
              Close shift — {closeShiftRow.register.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Expected cash in drawer:{" "}
              <span className="font-semibold text-slate-200">
                {formatMoney(closeShiftRow.openingFloatCents)}
              </span>{" "}
              + cash sales (computed at close).
            </p>
            <form onSubmit={closeShift} className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Counted cash
                <input
                  inputMode="decimal"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                  className="vx-input"
                  data-testid="shift-counted"
                />
              </label>
              <div className="flex justify-end gap-2">
                <GhostButton type="button" onClick={() => setCloseShiftRow(null)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" disabled={busy}>
                  Close shift
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

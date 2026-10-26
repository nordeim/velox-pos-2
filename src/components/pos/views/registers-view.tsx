"use client";

// ---------------------------------------------------------------------------
// The Registers view (English copy, reference-measured): "Cash Registers /
// 0 registers configured", + New Register, the Monitor empty state, and the
// superset register cards: status chips, Open Shift (opening float), Close
// Shift (counted cash + variance), edit + delete.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Monitor, Pencil, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/pos/shared";
import { apiSend, usePosStore, type RegisterRow, type Shift } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { expectedCash, shiftDuration, shiftVariance, varianceLabel } from "@/lib/shift";

// ---- the New/Edit Register modal (the reference's measured dialog) -----------

function RegisterModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: RegisterRow | null;
  onClose: () => void;
}) {
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast: toastApi } = useToast();

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const row = editing
        ? await apiSend<RegisterRow>(
        "PATCH",
        `/api/registers/${editing.id}`, {
            name: name.trim(),
            location: location.trim(),
          })
        : await apiSend<RegisterRow>(
        "POST",
        "/api/registers", {
            name: name.trim(),
            location: location.trim(),
          });
      usePosStore.getState().upsertRegister(row);
      toastApi.success(editing ? "Register updated" : "Register created")
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the register.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{editing ? "Edit Register" : "New Register"}</DialogTitle>
          <DialogDescription className="sr-only">
            {editing ? "Update the register." : "Create a new cash register."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="r-name" className="text-white/70">
              Name *
            </Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Register 1"
              className="text-white"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-location" className="text-white/70">
              Location
            </Label>
            <Input
              id="r-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main entrance"
              className="text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy || name.trim().length === 0}
            className="glass-button-primary rounded-xl border-0"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- the Open Shift dialog (the superset workflow) -----------------------------

function OpenShiftDialog({
  register,
  onClose,
}: {
  register: RegisterRow | null;
  onClose: () => void;
}) {
  const [openingFloat, setOpeningFloat] = React.useState("0");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast: toastApi } = useToast();

  if (!register) return null;

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const shift = await apiSend<Shift>(
        "POST",
        "/api/shifts", {
        registerId: register.id,
        openingFloat: Number(openingFloat || 0),
      });
      usePosStore.getState().upsertShift({ ...shift, register: { name: register.name, location: register.location } });
      usePosStore.getState().upsertRegister({ ...register, status: "open" });
      toastApi.success("Shift opened")
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the shift.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!register} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Open shift — {register.name}</DialogTitle>
          <DialogDescription className="text-white/50">
            Count the opening cash in the drawer.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="s-float" className="text-white/70">
            Opening float
          </Label>
          <Input
            id="s-float"
            type="number"
            min={0}
            step="0.01"
            value={openingFloat}
            onChange={(e) => setOpeningFloat(e.target.value)}
            className="text-white"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy}
            className="glass-button-success rounded-xl border-0 font-bold"
          >
            {busy ? "Opening…" : "Open shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- the Close Shift dialog (counted cash + variance) ---------------------------

function CloseShiftDialog({
  shift,
  onClose,
}: {
  shift: (Shift & { register?: { name: string } }) | null;
  onClose: () => void;
}) {
  const sales = usePosStore((s) => s.sales);
  const [counted, setCounted] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast: toastApi } = useToast();

  const cashSales = React.useMemo(
    () =>
      sales
        .filter((s) => s.shiftId === shift?.id && s.paymentMethod === "cash" && s.status === "completed")
        .reduce((sum, s) => sum + s.total, 0),
    [sales, shift],
  );
  const expected = shift ? expectedCash(shift.openingFloat, cashSales) : 0;

  if (!shift) return null;

  const variance = shiftVariance(expected, Number(counted || 0));

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const updated = await apiSend<Shift>(
        "PATCH",
        `/api/shifts/${shift.id}`, {
        countedCash: Number(counted || 0),
      });
      usePosStore.getState().upsertShift({ ...shift, ...updated });
      usePosStore.setState((s) => ({
        registers: s.registers.map((r) =>
          r.id === updated.registerId ? { ...r, status: "closed" } : r,
        ),
      }));
      toastApi.success("Shift closed")
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not close the shift.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!shift} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Close shift</DialogTitle>
          <DialogDescription className="text-white/50">
            Count the drawer's cash and close the shift.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="space-y-1 rounded-xl border border-edge bg-white/[0.03] p-3 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Opening float</span>
            <span>{formatMoney(shift.openingFloat)}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Cash sales</span>
            <span>{formatMoney(cashSales)}</span>
          </div>
          <div className="flex justify-between font-bold text-white">
            <span>Expected in drawer</span>
            <span data-testid="expected-cash">{formatMoney(expected)}</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="s-counted" className="text-white/70">
            Counted cash
          </Label>
          <Input
            id="s-counted"
            type="number"
            min={0}
            step="0.01"
            value={counted}
            onChange={(e) => setCounted(e.target.value)}
            className="text-white"
            autoFocus
          />
          {counted !== "" && (
            <p
              className={`text-sm ${
                Math.abs(variance) < 0.005
                  ? "text-emerald-400"
                  : variance > 0
                    ? "text-blue-400"
                    : "text-orange-400"
              }`}
              data-testid="shift-variance"
            >
              Variance: {varianceLabel(variance)} ({formatMoney(Math.abs(variance))})
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy || counted === ""}
            className="glass-button-danger border-0 font-bold"
          >
            {busy ? "Closing…" : "Close shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view --------------------------------------------------------------------

export function RegistersView() {
  const registers = usePosStore((s) => s.registers);
  const shifts = usePosStore((s) => s.shifts);
  const { toast: toastApi } = useToast();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<RegisterRow | null>(null);
  const [opening, setOpening] = React.useState<RegisterRow | null>(null);
  const [closing, setClosing] = React.useState<Shift | null>(null);
  const [deleting, setDeleting] = React.useState<RegisterRow | null>(null);

  const activeByRegister = new Map<string, Shift>();
  for (const s of shifts) if (s.status === "active") activeByRegister.set(s.registerId, s);

  const confirmDelete = async (): Promise<void> => {
    if (!deleting) return;
    try {
      await apiSend("DELETE", `/api/registers/${deleting.id}`);
      usePosStore.getState().dropRegister(deleting.id);
      toastApi.success("Register deleted")
    } catch (err) {
      toastApi.error(`Delete failed: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <PageHeader
        title="Cash Registers"
        subtitle={`${registers.length} registers configured`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="glass-button-primary rounded-xl border-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Register
          </Button>
        }
      />

      {registers.length === 0 ? (
        <div className="glass-card mt-5 rounded-2xl p-12 text-center">
          <Monitor className="mx-auto h-14 w-14 text-white/70" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 text-white/60">No registers configured yet</p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="register-cards">
          {registers.map((r) => {
            const active = activeByRegister.get(r.id);
            return (
              <li key={r.id} className="glass-card rounded-2xl p-5" data-testid={`register-${r.name}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-white">{r.name}</h2>
                    <p className="text-sm text-white/50">{r.location || "No location"}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/50"
                    }`}
                  >
                    {active ? "Shift open" : "Available"}
                  </span>
                </div>
                {active && (
                  <div className="mt-3 rounded-xl border border-edge bg-white/[0.03] p-3 text-sm text-white/60">
                    Opened {shiftDuration(active.openedAt)} ago · float{" "}
                    {formatMoney(active.openingFloat)}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {active ? (
                    <Button
                      size="sm"
                      onClick={() => setClosing(active)}
                      className="glass-button-danger border-0"
                    >
                      Close shift
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setOpening(r)}
                      className="glass-button-success border-0 font-bold"
                    >
                      Open shift
                    </Button>
                  )}
                  <a
                    href="/POS"
                    className="glass-button vpx-focus inline-flex items-center rounded-xl px-3 py-2 text-sm"
                  >
                    Go to Terminal
                  </a>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(r);
                        setModalOpen(true);
                      }}
                      aria-label={`Edit ${r.name}`}
                      className="vpx-focus rounded-lg p-2 text-white/50 hover:text-violet-300"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(r)}
                      aria-label={`Delete ${r.name}`}
                      className="vpx-focus rounded-lg p-2 text-white/50 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <RegisterModal
        key={`reg-${editing?.id ?? "new"}-${modalOpen}`}
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
      <OpenShiftDialog
        key={`open-${opening?.id ?? "none"}`}
        register={opening}
        onClose={() => setOpening(null)}
      />
      <CloseShiftDialog
        key={`close-${closing?.id ?? "none"}`}
        shift={closing}
        onClose={() => setClosing(null)}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="glass-dark border-edge">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete register</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {deleting ? `Delete "${deleting.name}"? Registers with shift history cannot be deleted.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white/70">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="glass-button-danger border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

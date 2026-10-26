// ---------------------------------------------------------------------------
// Cash-register shift domain: the state machine behind Registers/Terminal.
// Pure — unit-pinned by tests/unit/shift.test.ts.
// ---------------------------------------------------------------------------

import { round2 } from "./money";

export type ShiftStatus = "active" | "closed";

export type ShiftLike = {
  id: string;
  registerId: string;
  cashierId: string;
  status: string;
  openingFloat: number;
  countedCash?: number | null;
  expectedCash?: number | null;
  variance?: number | null;
  openedAt: Date | string;
  closedAt?: Date | string | null;
};

/** A register may open a shift only when it has none ACTIVE (closed
 *  history is irrelevant — the register is released on close). */
export function canOpenShift(activeShifts: ShiftLike[], registerId: string): boolean {
  return !activeShifts.some((s) => s.status === "active" && s.registerId === registerId);
}

/** Expected cash in drawer at close: opening float + cash sales. */
export function expectedCash(openingFloat: number, cashSalesTotal: number): number {
  return round2(Math.max(0, openingFloat) + Math.max(0, cashSalesTotal));
}

/** Counted − expected (signed, 2dp). */
export function shiftVariance(expected: number, counted: number): number {
  return round2(counted - expected);
}

/** Human label for the variance chip (OVER/SHORT/exact). */
export function varianceLabel(variance: number): string {
  if (Math.abs(variance) < 0.005) return "Exact";
  return variance > 0 ? "Over" : "Short";
}

/** Closing a shift requires a counted amount ≥ 0 (the close dialog's gate). */
export function canCloseShift(shift: ShiftLike, countedCash: number | null): boolean {
  return shift.status === "active" && countedCash !== null && countedCash >= 0;
}

/** Duration label for the Turnos Recientes table ("2h 15m"). */
export function shiftDuration(
  openedAt: Date | string,
  closedAt?: Date | string | null,
): string {
  const start = new Date(openedAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Local "HH:mm" for shift timestamps (the table shows times, not ISO). */
export function shiftTime(value: Date | string): string {
  const d = new Date(value);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Session-21 (F-118): the shifts-collection bootstrap race — the store seam.
//
// The bootstrap hook awaits `Promise.all([loadAll(), loadCore()])` and BOTH
// actions wrote the SAME `shifts` key: loadAll sets the FULL list (the
// ledger invariant — Cashiers "Turnos Recientes", the Registers history),
// loadCore set the ACTIVE-ONLY list. Whichever fetch resolved LAST won, so a
// cold load could end with the ledgers holding only the active shifts —
// "Sin turnos registrados" on a store with three closed shifts (caught live
// by the Session-21 three-ledger walk: the with-data Cashiers leg flaked
// twice in four full-suite runs; the empty-store e2e is blind to the class
// by construction — no closed shifts exist to lose).
//
// The regression contract this file pins: after the bootstrap pair resolves,
// the store's shifts collection still contains the CLOSED shifts — the
// terminal gate finds its active shift by FILTERING the collection
// (`shifts.find(sh => sh.status === "active")`), so no consumer needs the
// active-only write; loadCore must refresh settings ONLY.
// ---------------------------------------------------------------------------

// The controlled transport: per-path responses with per-path release timing.
// The RACE SHAPE: the active-only fetch (loadCore's) resolves FIRST, the
// full-list fetch (loadAll's) resolves LAST — exactly the full-run interleaving
// that produced the live failure (the server under sustained load returns the
// bigger list after the filtered one).
const CLOSED_SHIFT = {
  id: "shift-closed-1",
  registerId: "reg-1",
  cashierId: "user-1",
  openedAt: "2026-10-28T00:00:00.000Z",
  closedAt: "2026-10-28T01:00:00.000Z",
  openingFloat: 100,
  status: "closed",
} as const;

const ACTIVE_SHIFT = {
  id: "shift-active-1",
  registerId: "reg-2",
  cashierId: "user-1",
  openedAt: "2026-10-28T02:00:00.000Z",
  closedAt: null,
  openingFloat: 50,
  status: "active",
} as const;

const apiGet = vi.fn();

vi.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGet(...args),
  apiSend: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  isTimeoutError: () => false,
}));

const { usePosStore } = await import("@/lib/store");

// Path-dispatched transport: each registered path answers with its value
// after its delay; unregistered paths answer [] (the catch-to-[] semantics
// never engage — these tests pin the happy-path race, not the failure path).
const routes = new Map<string, { value: unknown; delayMs: number }>();

function respond(path: string, value: unknown, delayMs = 0): void {
  routes.set(path, { value, delayMs });
}

beforeEach(() => {
  routes.clear();
  apiGet.mockReset();
  apiGet.mockImplementation(
    (p: string) =>
      new Promise((resolve) => {
        const r = routes.get(p);
        if (!r) {
          resolve([]);
          return;
        }
        setTimeout(() => resolve(structuredClone(r.value)), r.delayMs);
      }),
  );
});

afterEach(() => {
  usePosStore.setState({ shifts: [] });
});

describe("the shifts-collection bootstrap race (Session-21, F-118)", () => {
  it("loadCore must not clobber the full shifts list (the last-writer race)", async () => {
    // loadAll's fetch: the FULL list (closed + active), resolving FIRST (0ms).
    respond("/api/shifts", [CLOSED_SHIFT, ACTIVE_SHIFT], 0);
    // loadCore's fetch: the active-only list, resolving LAST (10ms) — the
    // interleaving that produced the live failure: its `set({ shifts })`
    // lands after loadAll's and the closed shifts vanish from the ledgers.
    respond("/api/shifts?status=active", [ACTIVE_SHIFT], 10);

    await Promise.all([
      usePosStore.getState().loadAll(),
      usePosStore.getState().loadCore(),
    ]);

    const shifts = usePosStore.getState().shifts;
    // The ledger invariant: BOTH shifts survive the bootstrap. On the
    // pre-fix store loadCore's active-only write lands last and the CLOSED
    // shift is gone — the Cashiers ledger renders "Sin turnos registrados".
    expect(shifts.some((s) => s.id === CLOSED_SHIFT.id), "the closed shift survives the bootstrap (the ledger invariant)").toBe(true);
    expect(shifts.some((s) => s.id === ACTIVE_SHIFT.id), "the active shift survives the bootstrap (the gate invariant)").toBe(true);
  });

  it("loadCore refreshes settings without touching the shifts collection", async () => {
    // The store already holds the full ledger list (e.g. a completed
    // bootstrap); loadCore runs again (the hook's parallel pair) with only
    // the settings + active-shift endpoints answering.
    usePosStore.setState({ shifts: [CLOSED_SHIFT as never, ACTIVE_SHIFT as never] });
    respond("/api/shifts?status=active", [ACTIVE_SHIFT], 0);

    await usePosStore.getState().loadCore();

    expect(usePosStore.getState().shifts, "loadCore leaves the collection alone").toHaveLength(2);
  });
});

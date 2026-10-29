import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-27 (F-125): the Cashiers shift-ledger with-data walk — the
// "Turnos Recientes" table's DERIVATION, with ZERO protection before this
// spec. The ledger row is a FOUR-WAY JOIN rendered client-side
// (cashiers-view.tsx): the store's shifts (bootstrapped from /api/shifts,
// openedAt desc, register + cashier included) × the store's sales — per row:
//   Cajero  = s.cashier?.fullName || s.cashier?.email || "—"
//             (the shifts POST pins cashierId to the OWNER — the seed's
//             "Store Owner"; no cashier users are ever created, so the
//             roster's role=cashier empty-state pins are unperturbed)
//   Caja    = s.register?.name
//   Inicio  = shiftTime(openedAt) · shiftDuration(openedAt, closedAt)
//             (local HH:MM + rounded minutes — mirrored in-spec below)
//   Fin     = s.closedAt ? shiftTime(closedAt) : "—"   (the polarity fork)
//   Ventas  = formatMoney(total, currency) (n) where total/n derive from
//             sales.filter(sale => sale.shiftId === s.id)
//   Estado  = "Abierto" (emerald-500/15) | "Cerrado" (white/5 + white/50)
//
// What was e2e-invisible before: the drift sweep's F-117 containment test
// provisions a shift and asserts only that its ROW IS VISIBLE at 390;
// surfaces.spec pins the EMPTY states + the roster flow; registers-shifts.spec
// pins the shift DIALOGS on another surface. NOTHING pinned the join — a
// sale landing on the wrong shift's row, a count drifting from its total, a
// polarity flip in the FIN ternary, or a mis-ordered list would ALL have
// passed the entire suite green. The reference's OWN ledger is permanently
// empty (write-gated — "Sin turnos registrados"), so this tier is a
// functional-SUPERSET pin, the s20..s26 lineage.
//
// The ANALYZE facts this spec transcribes (measured live on the dev server):
// the active row renders
//   ["Store Owner", "Ledger Walk Register", "00:19 · 0m", "—", "$9.00 (1)", "Abierto"]
// and after the exact-variance close the closed row renders
//   ["Store Owner", "Ledger Walk Register", "00:19 · 1m", "00:20", "$9.00 (1)", "Cerrado"]
// — the FIN cell filled, the duration recomputed, the chip family flipped.
//
// FILE-NAME ORDERING IS LOAD-BEARING: FIVE specs now persist data — this
// file sorts FIRST among the walks (c < d < f < i < r) and after every
// empty-state pin that matters (surfaces' empty-Reports + "0 usuarios
// registrados" — this walk creates NO cashier users; inventory's "No
// products found"; registers-shifts' dialog journey; the drift sweep's
// self-owned containment fixture). The four existing walks derive their
// expectations from the APIs at runtime, so this walk's extra
// product/sale/shift perturbs none of them. The walk SELF-CLEANS: both
// shifts CLOSED with exact-variance counts — "No active shift" stays true
// for the mobile project that runs after chromium.
// ---------------------------------------------------------------------------

const CATEGORY_NAME = "Cashiers Ledger Walk";
const PRODUCT_NAME = "Ledger Walk Coffee";
const PRODUCT_BARCODE = "CWALK-390";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Ledger Walk Register";
const OPENING_FLOAT = 50;
// float 50 + the two fixture sales (4.50 + 9.00) → the exact-count close.
const CLOSE_CASH_T1 = `${OPENING_FLOAT + 4.5 + 9}`;
// float 50 + the one Test-2 sale (4.50) → the exact-count close.
const CLOSE_CASH_T2 = `${OPENING_FLOAT + 4.5}`;

type CategoryRow = { id: string; name: string };
type ProductRow = { id: string; name: string; barcode: string };
type RegisterRow = { id: string; name: string };
type ShiftRow = {
  id: string;
  registerId: string;
  openedAt: string;
  closedAt: string | null;
  status: string;
  // The GET /api/shifts list includes the cashier/register relations — the
  // SAME payload the view renders, so the identity cells derive from IT
  // (the true mirror; /api/auth/me's publicUser omits fullName).
  cashier?: { fullName: string | null; email: string } | null;
  register?: { name: string | null } | null;
};
type SaleRow = { id: string; shiftId: string | null; total: number; ticket: string };

async function json(r: { json(): Promise<unknown> }) {
  return r.json() as Promise<any>;
}

// The seam math, MIRRORED in-spec (the "fix the MIRROR" rule — s17's law):
// shiftTime and shiftDuration from src/lib/shift.ts, byte-for-byte.
const hhmm = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const duration = (openedAt: string, closedAt: string | null): string => {
  const start = new Date(openedAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const money = (dollars: number): string => `$${dollars.toFixed(2)}`;

// The fixture chain (idempotent — re-used if present on a warm db; every
// POST ASSERTS its response, the F-120 law). Each entity resolves through
// find-then-create ternaries so the ids stay const-narrowed (the Session-24
// let+closure lesson).
async function provision(page: Page): Promise<{ prodId: string; registerId: string }> {
  const cats = (await json(await page.request.get("/api/categories"))) as CategoryRow[];
  const existingCat = cats.find((c) => c.name === CATEGORY_NAME);
  const catId = existingCat
    ? existingCat.id
    : await (async () => {
        const resp = await page.request.post("/api/categories", {
          data: { name: CATEGORY_NAME },
        });
        expect(resp.ok(), `the fixture category must create (got ${resp.status()})`).toBe(true);
        return ((await json(resp)) as CategoryRow).id;
      })();

  const prods = (await json(await page.request.get("/api/products"))) as ProductRow[];
  const existingProd = prods.find((p) => p.barcode === PRODUCT_BARCODE);
  const prodId = existingProd
    ? existingProd.id
    : await (async () => {
        const resp = await page.request.post("/api/products", {
          data: {
            name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            categoryId: catId,
            stock: 20,
            minStock: 2,
            barcode: PRODUCT_BARCODE,
            taxRate: 0,
          },
        });
        expect(resp.ok(), `the fixture product must create (got ${resp.status()})`).toBe(true);
        return ((await json(resp)) as ProductRow).id;
      })();
  expect(prodId, "the fixture product id must resolve").toBeTruthy();

  const regs = (await json(await page.request.get("/api/registers"))) as RegisterRow[];
  const existingReg = regs.find((r) => r.name === REGISTER_NAME);
  const registerId = existingReg
    ? existingReg.id
    : await (async () => {
        const resp = await page.request.post("/api/registers", {
          data: { name: REGISTER_NAME, openingFloat: OPENING_FLOAT },
        });
        expect(resp.ok(), `the fixture register must create (got ${resp.status()})`).toBe(true);
        return ((await json(resp)) as RegisterRow).id;
      })();
  expect(registerId, "the fixture register id must resolve").toBeTruthy();
  return { prodId, registerId };
}

async function openShift(page: Page, registerId: string): Promise<ShiftRow> {
  const resp = await page.request.post("/api/shifts", {
    data: { registerId, openingFloat: OPENING_FLOAT },
  });
  expect(resp.ok(), `the fixture shift must open (got ${resp.status()})`).toBe(true);
  return (await json(resp)) as ShiftRow;
}

async function checkout(page: Page, prodId: string, qty: number, customer: string): Promise<SaleRow> {
  const resp = await page.request.post("/api/sales", {
    data: {
      items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty, taxRate: 0 }],
      paymentMethod: "cash",
      amountPaid: 50,
      customer,
    },
  });
  expect(resp.ok(), `the fixture sale must create (got ${resp.status()})`).toBe(true);
  return (await json(resp)) as SaleRow;
}

async function closeShift(page: Page, shiftId: string, countedCash: string): Promise<ShiftRow> {
  const resp = await page.request.patch(`/api/shifts/${shiftId}`, {
    data: { countedCash: Number(countedCash) },
  });
  expect(resp.ok(), `the fixture shift must close (got ${resp.status()})`).toBe(true);
  const closed = (await json(resp)) as ShiftRow;
  expect(closed.status, "the exact-variance close must reach status closed").toBe("closed");
  return closed;
}

// The ledger's own row for a shift — the /api/shifts list payload the view
// renders (openedAt desc, register + cashier included), fetched fresh so the
// identity/time expectations mirror the view's exact input.
async function ledgerShift(page: Page, shiftId: string): Promise<ShiftRow> {
  const rows = (await json(await page.request.get("/api/shifts"))) as ShiftRow[];
  const row = rows.find((s) => s.id === shiftId);
  expect(row, "the shift must appear in the /api/shifts ledger").toBeTruthy();
  return row as ShiftRow;
}

// The CAJERO cell's derivation, mirrored: the shift's cashier include.
const cashierCell = (shift: ShiftRow): string =>
  shift.cashier?.fullName || shift.cashier?.email || "—";

// The ledger row for this walk's register — the register name is unique to
// the fixture, so the filter is unambiguous; .first() is the NEWEST shift
// (the API orders openedAt desc and the ledger slices 0..10).
const walkRow = (page: Page) =>
  page.locator("table tbody tr").filter({ hasText: REGISTER_NAME }).first();

test("the closed ledger row derives the four-way join (cashier · register · times · both sales counted)", async ({
  page,
}) => {
  const { prodId, registerId } = await provision(page);

  // The chain: shift → TWO sales → the exact-variance close. Both sales
  // must PIN to the shift (the join's input).
  const shift = await openShift(page, registerId);
  const saleA = await checkout(page, prodId, 1, "Ledger Walk A");
  const saleB = await checkout(page, prodId, 2, "Ledger Walk B");
  expect(saleA.shiftId, "the first sale must pin to the open shift").toBe(shift.id);
  expect(saleB.shiftId, "the second sale must pin to the open shift").toBe(shift.id);
  const closed = await closeShift(page, shift.id, CLOSE_CASH_T1);
  expect(closed.closedAt, "the close must stamp closedAt").toBeTruthy();

  // The expectations, DERIVED from the APIs at runtime (never hardcoded):
  // the shift's sales (the join) + the identity cell from the ledger's own
  // payload (the view's exact input).
  const allSales = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const shiftSales = allSales.filter((s) => s.shiftId === shift.id);
  expect(shiftSales.length, "exactly this walk's two sales must join the shift").toBe(2);
  const total = Math.round(shiftSales.reduce((sum, s) => sum + s.total, 0) * 100) / 100;
  const owner = cashierCell(await ledgerShift(page, shift.id));

  await page.goto("/Cashiers");
  await expect(page.getByRole("heading", { name: "Turnos Recientes" })).toBeVisible();
  // The six headers — the reference's own Spanish copy, pinned in the SOURCE
  // case (the s17 textContent lesson; CSS uppercases visually).
  for (const header of ["Cajero", "Caja", "Inicio", "Fin", "Ventas", "Estado"]) {
    await expect(
      page.getByRole("columnheader", { name: header, exact: true }),
    ).toBeVisible();
  }

  const row = walkRow(page);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  const cells = row.locator("td");
  // Cajero — the owner (the shifts POST pins cashierId to the owner).
  await expect(cells.nth(0)).toHaveText(owner);
  // Caja — the fixture register.
  await expect(cells.nth(1)).toHaveText(REGISTER_NAME);
  // Inicio — shiftTime(openedAt) · shiftDuration(openedAt, closedAt),
  // both mirrored from the seam's own math.
  await expect(cells.nth(2)).toHaveText(`${hhmm(shift.openedAt)} · ${duration(shift.openedAt, closed.closedAt)}`);
  // Fin — the polarity fork's closed arm.
  await expect(cells.nth(3)).toHaveText(hhmm(closed.closedAt as string));
  // Ventas — the join's output: the sum AND the count of this shift's sales.
  await expect(cells.nth(4)).toHaveText(`${money(total)} (${shiftSales.length})`);
  // Estado — the closed chip.
  await expect(cells.nth(5)).toHaveText("Cerrado");
});

test("the active ledger row renders the open polarity (Fin —, zero sales) and flips on close", async ({
  page,
}) => {
  const { prodId, registerId } = await provision(page);

  // The active ZERO state: a fresh shift with no sales yet.
  const shift = await openShift(page, registerId);
  const owner = cashierCell(await ledgerShift(page, shift.id));
  await page.goto("/Cashiers");
  let row = walkRow(page);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  let cells = row.locator("td");
  await expect(cells.nth(0)).toHaveText(owner);
  await expect(cells.nth(1)).toHaveText(REGISTER_NAME);
  // Inicio — the open arm of shiftDuration (now-based); pin the time part
  // exactly and the duration by its shape (the minutes tick with the run).
  await expect(cells.nth(2)).toContainText(hhmm(shift.openedAt));
  await expect(cells.nth(2)).toHaveText(/^\d{2}:\d{2} · (\d+h \d+m|\d+m)$/);
  // Fin — the ACTIVE polarity: the em dash.
  await expect(cells.nth(3)).toHaveText("—");
  // Ventas — the zero-sales derivation.
  await expect(cells.nth(4)).toHaveText("$0.00 (0)");
  // Estado — the active chip.
  await expect(cells.nth(5)).toHaveText("Abierto");

  // The live join: a sale lands on the ACTIVE shift and the fresh mount
  // re-bootstraps the store (a goto, not a wait-for-update — the ledger
  // reads the bootstrap collections).
  const sale = await checkout(page, prodId, 1, "Ledger Walk C");
  expect(sale.shiftId, "the sale must pin to the active shift").toBe(shift.id);
  await page.goto("/Cashiers");
  row = walkRow(page);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  cells = row.locator("td");
  await expect(cells.nth(4)).toHaveText(`${money(PRODUCT_PRICE)} (1)`);
  await expect(cells.nth(5)).toHaveText("Abierto");

  // The flip: the exact-variance close turns the row closed — the FIN cell
  // fills with the close time and the chip family swaps.
  const closed = await closeShift(page, shift.id, CLOSE_CASH_T2);
  await page.goto("/Cashiers");
  row = walkRow(page);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  cells = row.locator("td");
  await expect(cells.nth(3)).toHaveText(hhmm(closed.closedAt as string));
  await expect(cells.nth(5)).toHaveText("Cerrado");
  // The self-clean law: both this file's shifts are CLOSED with exact
  // variance — "No active shift" stays true for the mobile project.
  const active = (await json(
    await page.request.get("/api/shifts?status=active"),
  )) as ShiftRow[];
  expect(
    active.filter((s) => s.registerId === registerId),
    "the walk's register must end shift-free",
  ).toHaveLength(0);
});

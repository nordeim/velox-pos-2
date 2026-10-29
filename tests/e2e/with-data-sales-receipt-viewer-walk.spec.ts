import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// with-data-sales-receipt-viewer-walk — Session-28 (F-126-b)
//
// What was e2e-invisible before: terminal.spec pins the checkout-derived ROW
// visibility (the T-000001 cell + "Completada") and the F-115 print wrapper;
// F-110 pins saleTimestamp on the CHECKOUT receipt only; the s16 harness
// pins the demo-seeded ledger family. NOTHING pinned the VIEWER's content
// with data (the item-line math `price * qty`, the description's
// saleTimestamp, the Método row), the ledger row's derived cells (the es-MX
// Fecha, the cashier cell, the chip families, the money cell), the search's
// three arms (ticket || customer || cashier), or the refund round-trip (the
// one-way guard, the chip flip, the viewer opening on a refunded sale). The
// reference is write-gated (its Sales ledger renders "Sin ventas" forever) —
// this tier is a functional-SUPERSET pin of the clone's own working surface.
//
// The ANALYZE facts this spec transcribes (measured live on the dev server):
// the ledger row renders
//   ["T-000001", "29 oct 2026", "Store Owner", "cash", "$9.00", "Completada"]
// — the Fecha cell saleDate es-MX ("29 oct 2026"), the Cajero cell from the
// sale's own cashier include, the Método chip textContent "cash" (CSS
// capitalizes — the s17 textContent lesson) on emerald-500/15 + rgb(52,211,153),
// the Total "$9.00", the Estado chip "Completada" on the same emerald family.
// The viewer (the real click on `Ver {ticket}`) renders the title {ticket},
// the description saleTimestamp "DD/MM/YYYY HH:MM", the item line
// "2 × Viewer Walk Coffee" + "$9.00", the dashed Total row, the Método row
// "Método"/"cash", and the Cerrar/Imprimir footer OUTSIDE .receipt-print.
// The refund round-trip: PATCH refunded → 200; the same-status re-PATCH →
// 200 (idempotent); PATCH completed → 400 "A refunded sale cannot be
// un-refunded."; the re-mounted ledger's chip flips to "Reembolsada" on
// orange-500/15 + rgb(251,146,60), and the viewer opens on the refunded
// sale with the content unchanged.
//
// FILE-NAME ORDERING IS LOAD-BEARING: SIX specs now persist data — this
// file sorts LAST among the walks (c < d < f < i < r < s) and after every
// empty-state pin that matters (surfaces' empty-Reports + Sales "Sin ventas"
// + "0 usuarios registrados"; inventory's "No products found";
// registers-shifts' dialog journey; the drift sweep's self-owned containment
// fixture). The five existing walks all run BEFORE it and derive their
// expectations from the APIs at runtime, so this walk's extra sale/shift
// perturbs none of them; nothing chromium-side runs after it. The walk
// SELF-CLEANS: its shift CLOSES with an exact-variance count — "No active
// shift" stays true for the mobile project that runs after chromium.
//
// MIRROR NOTES (the "fix the MIRROR" rule): saleDate (sales-view's own
// local seam) is mirrored with the same toLocaleDateString("es-MX") call —
// node and Chromium share the es-MX short-month data ("29 oct 2026");
// saleTimestamp is the manual padStart form (no ICU dependence). The CAJERO
// cell derives from the SALE's own /api/sales payload (the list include) —
// the S27 identity-cell law: never /api/auth/me, whose publicUser omits
// fullName.
// ---------------------------------------------------------------------------

const CATEGORY_NAME = "Sales Viewer Walk";
const PRODUCT_NAME = "Viewer Walk Coffee";
const PRODUCT_BARCODE = "SVWALK-390";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Viewer Walk Register";
const OPENING_FLOAT = 50;
const CUSTOMER_NAME = "Viewer Walk Customer";
// float 50 + the one fixture sale (qty 2 × $4.50 = $9.00) → the exact close.
const CLOSE_CASH = `${OPENING_FLOAT + 2 * PRODUCT_PRICE}`;

type CategoryRow = { id: string; name: string };
type ProductRow = { id: string; name: string; barcode: string };
type RegisterRow = { id: string; name: string };
type ShiftRow = { id: string; registerId: string; status: string };
type SaleRow = {
  id: string;
  shiftId: string | null;
  ticket: string;
  createdAt: string;
  customer: string;
  paymentMethod: string;
  total: number;
  status: string;
  // The GET /api/sales list includes the cashier relation — the SAME
  // payload the view renders, so the Cajero cell derives from IT (the true
  // mirror; /api/auth/me's publicUser omits fullName — the S27 law).
  cashier?: { fullName: string | null; email: string } | null;
};

async function json(r: { json(): Promise<unknown> }) {
  return r.json() as Promise<any>;
}

// The seams, MIRRORED in-spec (the "fix the MIRROR" rule — the s17 law).
const money = (dollars: number): string => `$${dollars.toFixed(2)}`;
// sales-view's own saleDate: es-MX 2-digit/short/numeric (the Fecha cell).
const fecha = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
// reports.ts's saleTimestamp: the manual padStart DD/MM/YYYY HH:MM (the
// receipt description — F-110's byte-stable form, no ICU dependence).
const receiptTs = (iso: string): string => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const cashierCell = (sale: SaleRow): string =>
  sale.cashier?.fullName || sale.cashier?.email || "—";

// The fixture chain (idempotent — re-used if present on a warm db; every
// POST ASSERTS its response, the F-120 law). Find-then-create ternaries so
// the ids stay const-narrowed (the Session-24 let+closure lesson).
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

async function checkout(page: Page, prodId: string): Promise<SaleRow> {
  const resp = await page.request.post("/api/sales", {
    data: {
      items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty: 2, taxRate: 0 }],
      paymentMethod: "cash",
      amountPaid: 2 * PRODUCT_PRICE,
      customer: CUSTOMER_NAME,
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

// The walk's sale — resolved from the /api/sales list (the SAME payload the
// view renders; the POST response does not carry the cashier include).
async function walkSale(page: Page): Promise<SaleRow> {
  const rows = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const row = rows.find((s) => s.customer === CUSTOMER_NAME);
  expect(row, "the walk's fixture sale must exist in /api/sales").toBeTruthy();
  return row as SaleRow;
}

// The ledger's own row for the walk's sale — the ticket is unique to the
// fixture, so the filter is unambiguous.
const walkRow = (page: Page, ticket: string) =>
  page.locator("table tbody tr").filter({ hasText: ticket }).first();

test("the ledger row and the receipt viewer derive the sale exactly (Fecha es-MX · cashier · chips · money)", async ({
  page,
}) => {
  const { prodId, registerId } = await provision(page);

  // The chain: shift → ONE sale (qty 2 → $9.00), pinned to the shift.
  const shift = await openShift(page, registerId);
  const sale = await checkout(page, prodId);
  expect(sale.shiftId, "the sale must pin to the open shift").toBe(shift.id);

  // The expectations, DERIVED from the APIs at runtime (never hardcoded):
  // the walk's own payload (the list include) is the view's exact input.
  const live = await walkSale(page);
  expect(live.ticket).toBe(sale.ticket);
  const owner = cashierCell(live);
  const list = (await json(await page.request.get("/api/sales"))) as SaleRow[];

  await page.goto("/Sales");
  const row = walkRow(page, sale.ticket);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  const cells = row.locator("td");
  // Ticket — the allocated ticket, font-mono cell.
  await expect(cells.nth(0)).toHaveText(sale.ticket);
  // Fecha — saleDate es-MX (2-digit/short/numeric), mirrored from the seam.
  await expect(cells.nth(1)).toHaveText(fecha(live.createdAt));
  // Cajero — the sale's own cashier include (the identity-cell mirror law).
  await expect(cells.nth(2)).toHaveText(owner);
  // Método — the chip's textContent "cash" (CSS capitalizes visually — the
  // s17 textContent lesson; never pin innerText case here).
  await expect(cells.nth(3)).toHaveText("cash");
  // Total — formatMoney at the edge.
  await expect(cells.nth(4)).toHaveText(money(live.total));
  // Estado — the completed polarity.
  await expect(cells.nth(5)).toHaveText("Completada");
  // The header count — derived from the API (the subtitle rides the store's
  // collection length, so it moves with the other walks' data; never a
  // hardcoded count).
  await expect(page.getByText(`${list.length} ventas registradas`)).toBeVisible();

  // The chip FAMILIES (computed — the oklab alpha pin, the either-form
  // regex; the emerald-400 text exact).
  const methodChip = cells.nth(3).locator("span");
  await expect
    .poll(async () => methodChip.evaluate((el) => getComputedStyle(el).color))
    .toBe("rgb(52, 211, 153)");
  await expect
    .poll(async () => methodChip.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toMatch(/\/\s*0\.15\)$/);
  const estadoChip = cells.nth(5).locator("span");
  await expect
    .poll(async () => estadoChip.evaluate((el) => getComputedStyle(el).color))
    .toBe("rgb(52, 211, 153)");
  await expect
    .poll(async () => estadoChip.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toMatch(/\/\s*0\.15\)$/);

  // The VIEWER: the real click on the eye action opens the receipt dialog.
  await page.getByRole("button", { name: `Ver ${sale.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: sale.ticket, exact: true })).toBeVisible();
  // The description — saleTimestamp (F-110's byte-stable DD/MM/YYYY HH:MM),
  // previously pinned only on the CHECKOUT receipt; this is the viewer's own.
  await expect(dialog.getByText(receiptTs(live.createdAt))).toBeVisible();

  const receipt = dialog.locator(".receipt-print");
  await expect(receipt).toHaveCount(1);
  // The item line — `qty × name` on the left, `price × qty` on the right
  // (the LINE math is its own pin, distinct from the Total row's value).
  // Locator note (this file's first-run catch): scope text-filtered row
  // locators to the LEAF class (div.flex.justify-between) — an unqualified
  // `div` filter matches the ANCESTOR container (whose last span is the
  // method row's), silently mis-targeting the pin.
  const lineRow = receipt.locator("div.flex.justify-between").filter({ hasText: "×" });
  await expect(lineRow.locator("span").first()).toHaveText(`2 × ${PRODUCT_NAME}`);
  await expect(lineRow.locator("span").last()).toHaveText(money(live.total));
  // The dashed Total row.
  const totalRow = receipt.locator("div.font-bold");
  await expect(totalRow.locator("span").first()).toHaveText("Total");
  await expect(totalRow.locator("span").last()).toHaveText(money(live.total));
  // The Método row — textContent "cash" (the capitalize is CSS).
  const methodRow = receipt
    .locator("div.flex.justify-between")
    .filter({ hasText: "Método" });
  await expect(methodRow.locator("span").last()).toHaveText("cash");
  // The footer buttons stay OUTSIDE the wrapper — they never print (F-115).
  await expect(dialog.getByRole("button", { name: "Cerrar" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Imprimir" })).toBeVisible();
  await expect(receipt.getByRole("button")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialog).not.toBeVisible();

  // The self-clean law: the shift CLOSES with an exact-variance count —
  // "No active shift" stays true for the mobile project.
  const closed = await closeShift(page, shift.id, CLOSE_CASH);
  expect(closed.status).toBe("closed");
});

test("the search narrows by ticket, customer, and cashier — and the no-match state renders the in-table row", async ({
  page,
}) => {
  // The fixture ride: Test 1's sale (the file runs sequentially in one
  // worker; the fixture is idempotent — this test re-derives everything from
  // the API, never assumes an order).
  const live = await walkSale(page);
  const owner = cashierCell(live);
  const all = (await json(await page.request.get("/api/sales"))) as SaleRow[];

  await page.goto("/Sales");
  const row = walkRow(page, live.ticket);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  const search = page.getByLabel("Buscar por ticket, cliente o cajero");

  // byTicket — the full ticket string (the substring the ledger renders).
  await search.fill(live.ticket);
  await expect(page.locator("table tbody tr").filter({ hasText: live.ticket })).toHaveCount(1);

  // byCustomer — unique to this walk's fixture.
  await search.fill(CUSTOMER_NAME);
  await expect(page.locator("table tbody tr").filter({ hasText: live.ticket })).toHaveCount(1);

  // byCashier — every sale's cashier is the owner; the expected count is
  // DERIVED from the API (never hardcoded — it moves with the other walks).
  const byOwner = all.filter((s) => s.cashier?.fullName || s.cashier?.email || "—");
  await search.fill(owner);
  await expect(page.locator("table tbody tr")).toHaveCount(byOwner.length);
  await expect(page.locator("table tbody tr").filter({ hasText: live.ticket })).toHaveCount(1);

  // The no-match state — the SEARCH-empty row (visible.length === 0), the
  // same in-table treatment as the no-data state ("Sin ventas").
  await search.fill("zzz-no-match-xyz");
  await expect(page.locator("table tbody tr")).toHaveCount(1);
  await expect(page.locator("table tbody tr td")).toHaveText("Sin ventas");
  await search.fill("");
});

test("the receipt PDF endpoint renders the sale server-side (F-127 — the zero-dependency PDF)", async ({
  page,
}) => {
  const live = await walkSale(page);
  expect(live.status, "the PDF test rides the completed sale (before the refund test flips it)").toBe("completed");

  // ---- The API leg: headers + bytes + the ownership-scoped 404 wall -------
  const apiResp = await page.request.get(`/api/sales/${live.id}/receipt`);
  expect(apiResp.status()).toBe(200);
  expect(apiResp.headers()["content-type"]).toBe("application/pdf");
  expect(apiResp.headers()["content-disposition"]).toBe(
    `attachment; filename="${live.ticket}.pdf"`,
  );
  const apiBytes = Buffer.from(await apiResp.body());
  const apiText = apiBytes.toString("latin1");
  // The PDF 1.4 magic (the seam's unit-pinned contract, now wired end-to-end).
  expect(apiText).toMatch(/^%PDF-1\.4/);
  expect(apiText.endsWith("%%EOF\n")).toBe(true);
  // The content family — the settings row (store name, footer) + the sale
  // (ticket, the F-110 stamp form, the lines with latin-1 × 0xD7, the money).
  expect(apiText).toContain("My Store");
  expect(apiText).toContain(live.ticket);
  expect(apiText).toContain("2 \xd7 Viewer Walk Coffee");
  expect(apiText).toContain("$9.00");
  expect(apiText).toContain("Cash / Change");
  expect(apiText).toContain("Thank you for your purchase!");
  // A bogus id never reaches the renderer — the 404 wall.
  expect((await page.request.get("/api/sales/does-not-exist/receipt")).status()).toBe(404);

  // ---- The UI leg: the "Descargar PDF" anchor triggers the download with
  // the Content-Disposition filename, and the downloaded bytes are
  // byte-identical to the API's (the F-122 download-event pattern). -------
  await page.goto("/Sales");
  const row = walkRow(page, live.ticket);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: `Ver ${live.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("link", { name: `Descargar PDF ${live.ticket}` }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(`${live.ticket}.pdf`);
  const content = (await download.path()) as string;
  const { readFileSync } = await import("node:fs");
  const fileBytes = readFileSync(content);
  expect(fileBytes.equals(apiBytes), "the downloaded file is the API's exact bytes").toBe(true);
  // The anchor stays OUTSIDE .receipt-print — the footer never prints (F-115).
  const receipt = dialog.locator(".receipt-print");
  await expect(receipt.getByRole("link")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialog).not.toBeVisible();
});

test("the refund round-trip flips the Estado chip (one-way) and the viewer opens on the refunded sale", async ({
  page,
}) => {
  const { registerId } = await provision(page);
  const live = await walkSale(page);
  expect(live.status, "the fixture sale starts completed").toBe("completed");

  // The refund flip + the one-way guard (measured live in the ANALYZE).
  const r1 = await page.request.patch(`/api/sales/${live.id}`, { data: { status: "refunded" } });
  expect(r1.status()).toBe(200);
  expect(((await json(r1)) as SaleRow).status).toBe("refunded");
  // The same-status re-PATCH is idempotent.
  const r2 = await page.request.patch(`/api/sales/${live.id}`, { data: { status: "refunded" } });
  expect(r2.status()).toBe(200);
  // The un-refund guard — the API's own copy.
  const r3 = await page.request.patch(`/api/sales/${live.id}`, { data: { status: "completed" } });
  expect(r3.status()).toBe(400);
  expect(((await json(r3)) as { error: string }).error).toBe(
    "A refunded sale cannot be un-refunded.",
  );

  // The re-mounted ledger (the store does not poll — a fresh goto): the
  // chip flips to the orange family.
  await page.goto("/Sales");
  const row = walkRow(page, live.ticket);
  await row.waitFor({ state: "visible", timeout: 15_000 });
  const estado = row.locator("td").nth(5).locator("span");
  await expect(estado).toHaveText("Reembolsada");
  await expect
    .poll(async () => estado.evaluate((el) => getComputedStyle(el).color))
    .toBe("rgb(251, 146, 60)");
  await expect
    .poll(async () => estado.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toMatch(/\/\s*0\.15\)$/);
  // The completed-state cells ride along (the refund flips status only).
  await expect(row.locator("td").nth(4)).toHaveText(money(live.total));

  // The viewer opens on the REFUNDED sale — the content unchanged (the
  // receipt reflects the sale, not the ledger's status chip).
  await page.getByRole("button", { name: `Ver ${live.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: live.ticket, exact: true })).toBeVisible();
  await expect(dialog.getByText(receiptTs(live.createdAt))).toBeVisible();
  const receipt = dialog.locator(".receipt-print");
  await expect(receipt).toContainText(`2 × ${PRODUCT_NAME}`);
  await expect(
    receipt.locator("div.flex.justify-between").filter({ hasText: "Método" }).locator("span").last(),
  ).toHaveText("cash");
  await dialog.getByRole("button", { name: "Cerrar" }).click();

  // The self-clean law, verified as state (not exit codes): the walk's
  // register ends shift-free — "No active shift" stays true for the mobile
  // project that runs after chromium.
  const active = (await json(
    await page.request.get("/api/shifts?status=active"),
  )) as ShiftRow[];
  expect(
    active.filter((s) => s.registerId === registerId),
    "the walk's register must end shift-free",
  ).toHaveLength(0);
});

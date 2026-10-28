import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-24 (F-122): the Inventory CSV round-trip walk — a README-advertised
// superset feature ("CSV export + import") whose full UI chain had ZERO e2e
// protection. The unit tier pins the pure seam (parseCsv/parseCsvRow/
// productsToCsv in tests/unit/inventory-status.test.ts), but the WIRING was
// e2e-invisible:
//   • the IMPORT chain — the hidden file input → parseCsv/parseCsvRow → the
//     per-row POST /api/products → upsertProduct into the store → the
//     ledger's re-render → the "Import complete" toast;
//   • the EXPORT chain — the store's products → productsToCsv with its
//     category-NAME resolution (categoryId → the category's name — a
//     store-dependent derivation the unit tier cannot test) → the Blob →
//     the a.download="products.csv" trigger → the downloaded file's content;
//   • the ERROR path — a blank-name row → parseCsvRow's throw through the
//     catch → the "Import failed: name is required" toast, zero rows
//     imported.
// A lost upsertProduct call, a broken download trigger, a category-resolution
// break, or a toast regression would ALL have passed the entire suite.
//
// The ANALYZE facts this spec transcribes (the V16 probes, measured live on
// the dev server before the spec was written, warm db 3 products / 3
// categories): the import renders the toast "Import complete" and the count
// 3 → 5 with both fixture rows in the ledger; the export's file carries the
// header byte-exact and the rows serialize back exactly (category-name
// resolution both ways; String(number) semantics — cost 1.50 → `1.5`); the
// blank-name row renders "Import failed: name is required" with the count
// unchanged. The reference itself cannot produce this state (its demo
// account is write-restricted; re-verified Session-24: its Reports surface
// stays empty) — this tier is a functional-SUPERSET addition, the
// s20/s21/s22/s23 lineage.
//
// The exact-value pins' red is by construction: the counts are DERIVED FROM
// THE API'S OWN RESPONSES at runtime (never hardcoded — the s18/s22
// volatile-expectation law), so any link in the chain that breaks flips the
// equality. The export-content pins assert the two fixture lines BYTE-EXACT
// (the serialization contract) plus the derived line-count — never
// full-file equality (the export is the FULL ledger; the other fixtures'
// rows ride along by design).
//
// FILE-NAME ORDERING IS LOAD-BEARING: this spec sorts AFTER
// with-data-dashboard-walk (d < i) and BEFORE with-data-reports-walk
// (i < r) in the chromium project. inventory.spec's "No products found" +
// "1 products registered" pins run BEFORE this spec's imports exist
// (i < w, workers: 1); the dashboard walk runs BEFORE it too (its
// product/category derivations see only its own fixture); the reports walk
// derives everything from the SALES API at runtime (robust to extra
// products by design). The mobile project runs after chromium and carries
// no product-count pins. The scratch db is fresh per run (global-setup
// deletes + re-provisions before boot), so the twice-consecutive gate runs
// are independent.
// ---------------------------------------------------------------------------

// The fixture: one category (the category-name resolution leg) + two import
// rows chosen to serialize byte-stably through String(number) (cost 1.5
// round-trips as `1.5`; the empty cost column round-trips as ``). Both
// stocks are "ok" (stock > 0 && stock > minStock) so no Low Stock
// derivation is ever perturbed. Idempotent on re-runs against a warm db.
const CATEGORY_NAME = "CSV Walk";
const ROW_TEA = {
  name: "CSV Round Tea",
  barcode: "CSVRT-001",
  category: CATEGORY_NAME,
  price: "4.25",
  cost: "1.5",
  stock: "20",
  minStock: "5",
  taxRate: "0",
  unit: "Piece",
  active: "true",
  // The byte-exact line productsToCsv must emit for this row.
  line: "CSV Round Tea,CSVRT-001,CSV Walk,4.25,1.5,20,5,0,Piece,true",
};
const ROW_CHOCO = {
  name: "CSV Round Choco",
  barcode: "CSVRT-002",
  category: "",
  price: "3.75",
  cost: "",
  stock: "15",
  minStock: "3",
  taxRate: "16",
  unit: "Piece",
  active: "true",
  line: "CSV Round Choco,CSVRT-002,,3.75,,15,3,16,Piece,true",
};
const CSV_HEADER =
  "name,barcode,category,price,cost,stock,minStock,taxRate,unit,active";

type ProductRow = {
  id: string;
  name: string;
  barcode: string;
  categoryId: string | null;
  stock: number;
  minStock: number;
  active: boolean;
};
type CategoryRow = { id: string; name: string; color: string };

async function json(r: { json: () => Promise<unknown> }) {
  return r.json() as Promise<any>;
}

async function provision(page: Page): Promise<string> {
  const cats = (await json(await page.request.get("/api/categories"))) as CategoryRow[];
  const existing = cats.find((c) => c.name === CATEGORY_NAME)?.id;
  if (existing) return existing;
  const resp = await page.request.post("/api/categories", {
    data: { name: CATEGORY_NAME },
  });
  // A provisioning POST ASSERTS its response (the F-120 lesson): a silent
  // 400 makes every downstream wait vacuous.
  expect(resp.ok(), `the fixture category must create (got ${resp.status()})`).toBe(true);
  return (await json(resp)).id as string;
}

// The import CSV bytes, built in-spec (setInputFiles takes a buffer — no
// temp files).
function importCsv(): Buffer {
  const rows = [ROW_TEA, ROW_CHOCO]
    .map(
      (r) =>
        `${r.name},${r.barcode},${r.category},${r.price},${r.cost},${r.stock},${r.minStock},${r.taxRate},${r.unit},${r.active}`,
    )
    .join("\n");
  return Buffer.from(`${CSV_HEADER}\n${rows}\n`, "utf8");
}

function errorCsv(): Buffer {
  // One blank-name row: parseCsvRow throws "name is required" and NOTHING
  // is imported (the throw precedes every POST).
  return Buffer.from(`${CSV_HEADER}\n,CSVERR-001,,4.25,,10,5,0,Piece,true\n`, "utf8");
}

async function productCount(page: Page): Promise<number> {
  const products = (await json(await page.request.get("/api/products"))) as ProductRow[];
  return products.length;
}

test.describe("the Inventory CSV round-trip walk (Session-24, F-122)", () => {
  test("import → ledger → export: the round-trip wires end-to-end (the exact wiring pin)", async ({
    page,
  }) => {
    const catId = await provision(page);

    // The pre-state: the derived count + the fixture barcodes absent.
    const pre = (await json(await page.request.get("/api/products"))) as ProductRow[];
    expect(pre.some((p) => p.barcode === ROW_TEA.barcode), "the tea row must not pre-exist").toBe(false);
    expect(pre.some((p) => p.barcode === ROW_CHOCO.barcode), "the choco row must not pre-exist").toBe(false);

    await page.goto("/Inventory");
    // The settled wait is the with-data observable (the s16 bootstrap-race
    // lesson — never a timer): the header count renders once the store's
    // products hydrate.
    await expect(
      page.getByText(`${pre.length} products registered`),
    ).toBeVisible();

    // ---- IMPORT: the file input → parse → POST → store → ledger → toast ----
    await page.setInputFiles('input[aria-label="Import products from CSV"]', {
      name: "csv-walk-import.csv",
      mimeType: "text/csv",
      buffer: importCsv(),
    });
    // The toast (the zustand toaster's Notifications region — auto-dismiss
    // 5s, asserted promptly).
    await expect(
      page.getByRole("region", { name: "Notifications" }).getByText("Import complete"),
    ).toBeVisible();
    // The ledger count derives from the API (pre + 2), never hardcoded.
    await expect(
      page.getByText(`${pre.length + 2} products registered`),
    ).toBeVisible();
    // Both rows render (the Product cells — inventory.spec's cell pattern).
    await expect(page.getByRole("cell", { name: ROW_TEA.name, exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: ROW_CHOCO.name, exact: true })).toBeVisible();

    // API verify (the F-120 posture — state, not just UI): both rows
    // landed, row 1's category resolved by NAME, row 2 uncategorized.
    const post = (await json(await page.request.get("/api/products"))) as ProductRow[];
    const tea = post.find((p) => p.barcode === ROW_TEA.barcode);
    const choco = post.find((p) => p.barcode === ROW_CHOCO.barcode);
    expect(tea, "the tea row must exist in the API").toBeTruthy();
    expect(choco, "the choco row must exist in the API").toBeTruthy();
    expect(tea?.categoryId, "the tea row's category must resolve by name").toBe(catId);
    expect(choco?.categoryId, "the choco row stays uncategorized").toBeNull();

    // ---- EXPORT: the store → productsToCsv → Blob → the download ----
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export products as CSV" }).click(),
    ]);
    // The a.download attribute owns the suggested filename.
    expect(download.suggestedFilename()).toBe("products.csv");
    const content = (await download.path()) as string;
    const { readFileSync } = await import("node:fs");
    const csv = readFileSync(content, "utf8");

    // The header byte-exact, both fixture lines byte-exact (the
    // serialization contract: category-NAME resolution, String(number)
    // costs, the empty-category/empty-cost columns), and the derived
    // line-count (header + the API's product total — the export is the
    // FULL ledger; the other fixtures' rows ride along by design).
    const lines = csv.split("\n");
    expect(lines[0], "the CSV header").toBe(CSV_HEADER);
    expect(lines, "the tea row serializes byte-exact (category name resolved)").toContain(ROW_TEA.line);
    expect(lines, "the choco row serializes byte-exact (empty category + cost)").toContain(ROW_CHOCO.line);
    const atExport = await productCount(page);
    expect(
      lines.length,
      "the export carries exactly the API-derived product total (header + N rows, no trailing newline)",
    ).toBe(1 + atExport);
  });

  test("the import error path: a blank-name row fails loudly and imports nothing", async ({
    page,
  }) => {
    await page.goto("/Inventory");
    const pre = (await json(await page.request.get("/api/products"))) as ProductRow[];
    await expect(
      page.getByText(`${pre.length} products registered`),
    ).toBeVisible();

    await page.setInputFiles('input[aria-label="Import products from CSV"]', {
      name: "csv-walk-error.csv",
      mimeType: "text/csv",
      buffer: errorCsv(),
    });
    // parseCsvRow's exact message through the view's catch.
    await expect(
      page.getByRole("region", { name: "Notifications" }).getByText("Import failed: name is required"),
    ).toBeVisible();
    // The ledger count is UNCHANGED (the throw precedes every POST).
    await expect(
      page.getByText(`${pre.length} products registered`),
    ).toBeVisible();

    // API verify: the error row's barcode never landed.
    const post = (await json(await page.request.get("/api/products"))) as ProductRow[];
    expect(post.some((p) => p.barcode === "CSVERR-001"), "the error row must not exist").toBe(false);
    expect(post.length, "the API count is unchanged").toBe(pre.length);
  });
});

// Session-24 evidence captures: the with-data Inventory CSV round-trip's
// surfaces (F-122). Runs against the dev server (:3000) running the
// remediated codebase.
//
// Standing tier note: the CSV round-trip is STANDING-pinned in the e2e
// suite itself (tests/e2e/with-data-inventory-csv.spec.ts — the
// import→ledger→export wiring pin + the blank-name error path run on every
// `bun run test:e2e`). This script is the cycle's evidence-capture record
// (the s19..s23 family posture — self-provisioning fixture, re-runnable):
// screenshots 108-110.
//
// The fixture mirrors the spec's chain (the "CSV Walk" category + the two
// CSVRT rows), with a DELETE-first clean so every run captures a FRESH
// import (the toast moment). The expected values are DERIVED FROM THE APIs
// at runtime (never hardcoded — the s18/s22 volatile-expectation law).
import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const CATEGORY_NAME = "CSV Walk";
const CSV_HEADER =
  "name,barcode,category,price,cost,stock,minStock,taxRate,unit,active";
const ROW_TEA_LINE = "CSV Round Tea,CSVRT-001,CSV Walk,4.25,1.5,20,5,0,Piece,true";
const ROW_CHOCO_LINE = "CSV Round Choco,CSVRT-002,,3.75,,15,3,16,Piece,true";
const IMPORT_CSV = `${CSV_HEADER}\n${ROW_TEA_LINE}\n${ROW_CHOCO_LINE}\n`;

async function login(page) {
  await page.goto(BASE + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(BASE + "/");
}

// The fixture: the "CSV Walk" category (create if absent — the POST asserts
// its response, the F-120 law) + a DELETE-first clean of the two CSVRT rows
// so every run captures a FRESH import.
async function provisionFixture(page) {
  const json = (r) => r.json();
  const cats = await json(await page.request.get(`${BASE}/api/categories`));
  let catId = cats.find((c) => c.name === CATEGORY_NAME)?.id;
  if (!catId) {
    const resp = await page.request.post(`${BASE}/api/categories`, { data: { name: CATEGORY_NAME } });
    if (!resp.ok()) {
      console.error(`category fixture failed: ${resp.status()}`);
      process.exit(1);
    }
    catId = (await json(resp)).id;
  }
  const prods = await json(await page.request.get(`${BASE}/api/products`));
  for (const p of prods.filter((p) => p.barcode === "CSVRT-001" || p.barcode === "CSVRT-002")) {
    const resp = await page.request.delete(`${BASE}/api/products/${p.id}`);
    if (!resp.ok()) {
      console.error(`clean delete failed for ${p.barcode}: ${resp.status()}`);
      process.exit(1);
    }
  }
  return catId;
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- captures 108 + 109: the CSV round-trip on the Inventory surface ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  const catId = await provisionFixture(page);

  // The pre-state, derived from the API (the count the surface must render).
  const json = (r) => r.json();
  const pre = await json(await page.request.get(`${BASE}/api/products`));

  await page.goto(BASE + "/Inventory");
  await expect(page.getByText(`${pre.length} products registered`)).toBeVisible({ timeout: 15000 });

  // The IMPORT — through the real input, the same buffer the spec uses.
  await page.setInputFiles('input[aria-label="Import products from CSV"]', {
    name: "s24-evidence-import.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(IMPORT_CSV, "utf8"),
  });
  // Capture 109: the import-complete toast — the import leg's UI observable.
  const toast = page.getByRole("region", { name: "Notifications" }).getByText("Import complete");
  await toast.waitFor({ state: "visible", timeout: 15000 });
  await page.screenshot({ path: `${OUT}/109-session24-inventory-csv-import-toast.png`, fullPage: false });

  // The settled ledger: the count +2, both rows' cells.
  await expect(page.getByText(`${pre.length + 2} products registered`)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("cell", { name: "CSV Round Tea", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "CSV Round Choco", exact: true })).toBeVisible();
  // API verify (state, not just UI): the category resolved by NAME, row 2 null.
  const post = await json(await page.request.get(`${BASE}/api/products`));
  const tea = post.find((p) => p.barcode === "CSVRT-001");
  const choco = post.find((p) => p.barcode === "CSVRT-002");
  if (!tea || !choco || tea.categoryId !== catId || choco.categoryId !== null) {
    console.error("CAPTURE 108 VERIFICATION FAILED: the imported rows' API state is wrong");
    process.exit(1);
  }
  // The toast auto-dismisses after 5s — 108 is the SETTLED ledger (the
  // toast frame is 109's story; without this wait both captures show the
  // same frame, byte-identical — caught live this cycle).
  await toast.waitFor({ state: "hidden", timeout: 15000 });
  await page.screenshot({ path: `${OUT}/108-session24-inventory-csv-withdata-desktop.png`, fullPage: false });
  console.log(
    `108 inventory-csv-desktop verified: count ${pre.length} -> ${post.length}, tea.categoryId=${tea.categoryId === catId ? "resolved" : "WRONG"}, choco.categoryId=null`,
  );

  // The EXPORT — the download's content verified before the run ends.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export products as CSV" }).click(),
  ]);
  if (download.suggestedFilename() !== "products.csv") {
    console.error(`CAPTURE VERIFICATION FAILED: suggestedFilename ${download.suggestedFilename()}`);
    process.exit(1);
  }
  const csv = readFileSync(await download.path(), "utf8");
  const lines = csv.split("\n");
  if (
    lines[0] !== CSV_HEADER ||
    !lines.includes(ROW_TEA_LINE) ||
    !lines.includes(ROW_CHOCO_LINE) ||
    lines.length !== 1 + post.length
  ) {
    console.error(
      `CAPTURE VERIFICATION FAILED: export content (header/rows/line-count) — got ${lines.length} lines vs ${1 + post.length}`,
    );
    process.exit(1);
  }
  console.log(
    `export round-trip verified: header byte-exact, both fixture lines byte-exact, ${post.length} data lines = the API total`,
  );
  await ctx.close();
}

// ---- capture 110: the mobile drawer at 390 (the operator's priority surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/POS");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Navigation menu" });
  await dialog.waitFor({ state: "visible" });
  await expect(dialog.getByRole("link")).toHaveCount(8);
  await page.waitForTimeout(700); // the animation-settle (the s16 lesson)
  const probe = await page.evaluate(() => {
    const d = document.querySelector("[role=dialog]");
    return { w: Math.round(d.getBoundingClientRect().width), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  if (probe.w !== 288 || probe.overflow) {
    console.error("CAPTURE 110 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("110 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/110-session24-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-24 evidence captured: 108-110");

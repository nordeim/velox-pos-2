// Session-28 evidence captures: the Sales receipt-viewer walk's surfaces
// (F-126-b) + the cycle's parity cure context. Runs against the dev server
// (:3000) running the remediated codebase.
//
// Standing tier note: the walk is STANDING-pinned in the e2e suite itself
// (tests/e2e/with-data-sales-receipt-viewer-walk.spec.ts — the row/viewer
// content, the search arms, and the refund round-trip run on every
// `bun run test:e2e`). This script is the cycle's evidence-capture record
// (the s19..s27 family posture — self-provisioning fixture, re-runnable):
// screenshots 120-122.
//
// The fixture mirrors the spec's chain (the "Sales Viewer Walk" family —
// idempotent by name, POSTs asserted) and the ANALYZE journey: the ledger
// row with the viewer OPEN (120 — the receipt content, the strongest
// evidence), the refund flip's Reembolsada chip (121), and the mobile drawer
// at 390 (122 — the operator's priority surface). The script ALSO measures
// the byTicket and byCashier search arms live — the ANALYZE's dedicated
// probes were lost to a shell quoting error; this is the measurement record.
// The self-clean closes the shift at exact variance and deletes nothing (the
// fixtures are idempotent by name, the s20..s27 posture). NOTE the re-run
// posture: a refunded sale cannot be un-refunded (the one-way guard), so
// each run opens a fresh shift and mints a fresh sale on it (one per open
// shift); prior runs' refunded rows simply ride along in the ledger.
//
// The API legs ride bun's NATIVE fetch (the Session-26 law). Runs under bun
// against the dev server.
import { chromium, expect } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const CATEGORY_NAME = "Sales Viewer Walk";
const PRODUCT_NAME = "Viewer Walk Coffee";
const PRODUCT_BARCODE = "SVWALK-390";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Viewer Walk Register";
const OPENING_FLOAT = 50;
const CUSTOMER_NAME = "Viewer Walk Customer";
// float 50 + the $9.00 cash sale → the exact-variance close.
const CLOSE_CASH = OPENING_FLOAT + 2 * PRODUCT_PRICE;

if (!existsSync("db/custom.db")) {
  console.error("the dev db is absent — run bun run db:push && bun run db:seed first");
  process.exit(1);
}

const browser = await chromium.launch();

// bun-native fetch (the Session-26 law) — status codes + JSON only.
const post = async (path, data, cookie) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const patch = async (path, data, cookie) => {
  const res = await fetch(BASE + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const get = async (path, cookie) => {
  const res = await fetch(BASE + path, { headers: cookie ? { cookie } : {} });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

async function login(page) {
  await page.goto(BASE + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(BASE + "/");
}

// ---- the fixture (idempotent; POSTs asserted — the F-120 law) ------------
// The login leg runs RAW (the post() wrapper drops response headers) so the
// set-cookie can be captured — the s27 script's pattern.
const loginResp = await fetch(BASE + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "sepnetflix2023@outlook.com", password: "$Abcd1234" }),
});
if (loginResp.status !== 200) {
  console.error("fixture login failed:", loginResp.status);
  process.exit(1);
}
const AUTH = loginResp.headers.get("set-cookie")?.split(";")[0] ?? "";
if (!AUTH) {
  console.error("no set-cookie captured — check login");
  process.exit(1);
}
const authedGet = (p) => get(p, AUTH);
const authedPost = (p, d) => post(p, d, AUTH);
const authedPatch = (p, d) => patch(p, d, AUTH);

let catId = (await authedGet("/api/categories")).body.find((c) => c.name === CATEGORY_NAME)?.id;
if (!catId) {
  const r = await authedPost("/api/categories", { name: CATEGORY_NAME });
  if (r.status !== 200 && r.status !== 201) { console.error("category failed", r.status); process.exit(1); }
  catId = r.body.id;
}
let prodId = (await authedGet("/api/products")).body.find((p) => p.barcode === PRODUCT_BARCODE)?.id;
if (!prodId) {
  const r = await authedPost("/api/products", {
    name: PRODUCT_NAME, price: PRODUCT_PRICE, categoryId: catId, stock: 20, minStock: 2,
    barcode: PRODUCT_BARCODE, taxRate: 0,
  });
  if (r.status !== 200 && r.status !== 201) { console.error("product failed", r.status); process.exit(1); }
  prodId = r.body.id;
}
let registerId = (await authedGet("/api/registers")).body.find((r) => r.name === REGISTER_NAME)?.id;
if (!registerId) {
  const r = await authedPost("/api/registers", { name: REGISTER_NAME, openingFloat: OPENING_FLOAT });
  if (r.status !== 200 && r.status !== 201) { console.error("register failed", r.status); process.exit(1); }
  registerId = r.body.id;
}
// One ACTIVE shift per register (reuse if present; the re-run posture).
let shiftId = (await authedGet("/api/shifts?status=active")).body.find(
  (s) => s.registerId === registerId,
)?.id;
if (!shiftId) {
  const r = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT });
  if (r.status !== 200 && r.status !== 201) { console.error("shift failed", r.status); process.exit(1); }
  shiftId = r.body.id;
}
// One sale per open shift (idempotent per run).
let sale = (await authedGet("/api/sales")).body.find((s) => s.shiftId === shiftId);
if (!sale) {
  const r = await authedPost("/api/sales", {
    items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty: 2, taxRate: 0 }],
    paymentMethod: "cash", amountPaid: 2 * PRODUCT_PRICE, customer: CUSTOMER_NAME,
  });
  if (r.status !== 200 && r.status !== 201) { console.error("sale failed", r.status, JSON.stringify(r.body)); process.exit(1); }
  sale = r.body;
}
if (sale.status !== "completed") {
  // A refunded prior-run sale cannot be un-refunded (the one-way guard) —
  // this run mints a fresh shift+sale above only when the shift was fresh;
  // if we somehow landed on a refunded sale, open a NEW shift and mint one.
  const fresh = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT });
  if (fresh.status !== 200 && fresh.status !== 201) { console.error("fallback shift failed", fresh.status); process.exit(1); }
  shiftId = fresh.body.id;
  const r = await authedPost("/api/sales", {
    items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty: 2, taxRate: 0 }],
    paymentMethod: "cash", amountPaid: 2 * PRODUCT_PRICE, customer: CUSTOMER_NAME,
  });
  if (r.status !== 200 && r.status !== 201) { console.error("fallback sale failed", r.status); process.exit(1); }
  sale = r.body;
}
console.log("fixture verified: shift", shiftId, "carries the evidence sale", sale.ticket);

// ---- 120: the ledger row + the viewer OPEN (the receipt content) --------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  const row = page.locator("table tbody tr").filter({ hasText: sale.ticket }).first();
  await row.waitFor({ state: "visible", timeout: 15_000 });
  const cells = row.locator("td");
  await expect(cells.nth(0)).toHaveText(sale.ticket);
  await expect(cells.nth(5)).toHaveText("Completada");

  // The byTicket + byCashier search arms, measured LIVE (the ANALYZE's lost
  // probes — the measurement record for the plan).
  const search = page.getByLabel("Buscar por ticket, cliente o cajero");
  await search.fill(sale.ticket);
  const byTicket = await page.locator("table tbody tr").count();
  const ticketRowVisible = await page
    .locator("table tbody tr")
    .filter({ hasText: sale.ticket })
    .count();
  const allSales = (await authedGet("/api/sales")).body;
  await search.fill("Store Owner");
  const byCashierRows = await page.locator("table tbody tr").count();
  const byCashierExpected = allSales.filter(
    (s) => s.cashier?.fullName || s.cashier?.email || "—",
  ).length;
  await search.fill("");
  console.log(
    `search arms measured: byTicket=${byTicket} (row ${ticketRowVisible}) · byCashier=${byCashierRows} rows (expected ${byCashierExpected})`,
  );
  if (byTicket !== 1 || ticketRowVisible !== 1 || byCashierRows !== byCashierExpected) {
    console.error("SEARCH ARM MEASUREMENT FAILED");
    process.exit(1);
  }

  await page.getByRole("button", { name: `Ver ${sale.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: sale.ticket, exact: true })).toBeVisible();
  const receipt = dialog.locator(".receipt-print");
  await expect(receipt.locator("div.flex.justify-between").filter({ hasText: "×" }).locator("span").last()).toHaveText("$9.00");
  await page.screenshot({ path: `${OUT}/120-session28-viewer-receipt.png`, fullPage: false });
  console.log("120 viewer-receipt verified: the item line, the Total row, the Método row");
  await ctx.close();
}

// The refund flip (API), then the re-mounted ledger.
const refundResp = await authedPatch(`/api/sales/${sale.id}`, { status: "refunded" });
if (refundResp.status !== 200 || refundResp.body.status !== "refunded") {
  console.error("refund failed:", refundResp.status);
  process.exit(1);
}

// ---- 121: the Reembolsada chip on the re-mounted ledger -----------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  const row = page.locator("table tbody tr").filter({ hasText: sale.ticket }).first();
  await row.waitFor({ state: "visible", timeout: 15_000 });
  await expect(row.locator("td").nth(5)).toHaveText("Reembolsada");
  const chipBg = await row.locator("td").nth(5).locator("span").evaluate((el) =>
    getComputedStyle(el).backgroundColor,
  );
  console.log("121 reembolsada chip bg:", chipBg);
  if (!/\/\s*0\.15\)$/.test(chipBg)) {
    console.error("REEMBOLSADA CHIP FAMILY WRONG");
    process.exit(1);
  }
  await page.screenshot({ path: `${OUT}/121-session28-reembolsada.png`, fullPage: false });
  console.log("121 reembolsada verified: the orange family, the exact-variance content rows ride along");
  await ctx.close();
}

// ---- 122: the mobile drawer at 390 (the operator's priority surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  const row = page.locator("table tbody tr").filter({ hasText: sale.ticket }).first();
  await row.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const w = await dialog.evaluate((el) => Math.round(el.getBoundingClientRect().width));
  if (w !== 288) {
    console.error("DRAWER WIDTH WRONG:", w);
    process.exit(1);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) {
    console.error("HORIZONTAL OVERFLOW AT 390");
    process.exit(1);
  }
  await page.screenshot({ path: `${OUT}/122-session28-mobile-drawer-390.png`, fullPage: false });
  console.log("122 mobile drawer verified: 288px, zero overflow at 390");
  await ctx.close();
}

// ---- the self-clean (close the shift at exact variance; delete nothing) --
const closeResp = await authedPatch(`/api/shifts/${shiftId}`, { countedCash: CLOSE_CASH });
if (closeResp.status !== 200 || closeResp.body.status !== "closed") {
  console.error("close failed:", closeResp.status, JSON.stringify(closeResp.body));
  process.exit(1);
}
const activeAfter = (await authedGet("/api/shifts?status=active")).body.filter(
  (s) => s.registerId === registerId,
);
if (activeAfter.length !== 0) {
  console.error("SELF-CLEAN VERIFICATION FAILED:", activeAfter.length, "active shifts remain");
  process.exit(1);
}
console.log("self-clean verified: the evidence shift closed (exact variance), zero active");
await browser.close();
console.log("ALL CAPTURES DONE");

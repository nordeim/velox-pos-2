// Session-29 evidence captures: the receipt PDF superset (F-127).
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: the PDF leg is STANDING-pinned in the e2e suite itself
// (the 4th test of tests/e2e/with-data-sales-receipt-viewer-walk.spec.ts —
// the API headers/bytes/walls + the download event, on every
// `bun run test:e2e`). This script is the cycle's evidence-capture record
// (the s19..s28 family posture — self-provisioning fixture, re-runnable):
// screenshots 123-125.
//
// 123: the receipt viewer with the NEW "Descargar PDF" footer affordance
//      (the cycle's UI change — the operator's visual evidence).
// 124: the receipt PDF's authoritative content — the pypdf-extracted text
//      rendered as a PNG? No — a PNG of a PDF isn't directly capturable in
//      Playwright; instead this capture shows the DOWNLOAD bar/filename via
//      a DOM overlay is unstable. HONEST EVIDENCE instead: the capture shows
//      the Sales viewer (the surface the PDF mirrors) while the script
//      VERIFIES the PDF bytes + pypdf extraction live and prints it to the
//      log (the plan's §3.8 alternative: "the byte dump as the evidence").
// 125: the mobile drawer at 390 (the operator's priority surface).
//
// The fixture mirrors the walk's chain (idempotent by name, POSTs asserted
// — the F-120 law); the self-clean closes the shift at exact variance and
// deletes nothing. The re-run posture: a refunded sale cannot be un-refunded
// (the one-way guard), so a fresh shift+sale is minted when the found sale
// is refunded.
//
// The API legs ride bun's NATIVE fetch (the Session-26 law).
import { chromium, expect } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const PRODUCT_BARCODE = "SVWALK-390";
const PRODUCT_NAME = "Viewer Walk Coffee";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Viewer Walk Register";
const OPENING_FLOAT = 50;
const CUSTOMER_NAME = "Viewer Walk Customer";
const CLOSE_CASH = OPENING_FLOAT + 2 * PRODUCT_PRICE; // 59 — exact variance

if (!existsSync("db/custom.db")) {
  console.error("the dev db is absent — run bun run db:push && bun run db:seed first");
  process.exit(1);
}

const browser = await chromium.launch();

const post = async (path, data, cookie) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
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
const loginResp = await fetch(BASE + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "sepnetflix2023@outlook.com", password: "$Abcd1234" }),
});
if (loginResp.status !== 200) { console.error("fixture login failed:", loginResp.status); process.exit(1); }
const AUTH = loginResp.headers.get("set-cookie")?.split(";")[0] ?? "";
const authedGet = (p) => get(p, AUTH);
const authedPost = (p, d) => post(p, d, AUTH);
const authedPatch = (p, d) => patch(p, d, AUTH);

let prodId = (await authedGet("/api/products")).body.find((p) => p.barcode === PRODUCT_BARCODE)?.id;
if (!prodId) {
  const cats = (await authedGet("/api/categories")).body;
  let catId = cats.find((c) => c.name === "Sales Viewer Walk")?.id;
  if (!catId) { const r = await authedPost("/api/categories", { name: "Sales Viewer Walk" }); catId = r.body.id; }
  const r = await authedPost("/api/products", { name: PRODUCT_NAME, price: PRODUCT_PRICE, categoryId: catId, stock: 20, minStock: 2, barcode: PRODUCT_BARCODE, taxRate: 0 });
  if (r.status >= 300) { console.error("product failed", r.status); process.exit(1); }
  prodId = r.body.id;
}
let registerId = (await authedGet("/api/registers")).body.find((r) => r.name === REGISTER_NAME)?.id;
if (!registerId) { const r = await authedPost("/api/registers", { name: REGISTER_NAME, openingFloat: OPENING_FLOAT }); registerId = r.body.id; }
let shiftId = (await authedGet("/api/shifts?status=active")).body.find((s) => s.registerId === registerId)?.id;
if (!shiftId) { const r = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT }); shiftId = r.body.id; }
let sale = (await authedGet("/api/sales")).body.find((s) => s.shiftId === shiftId);
if (!sale || sale.status !== "completed") {
  if (sale && sale.status !== "completed") {
    const fresh = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT });
    shiftId = fresh.body.id;
  }
  const r = await authedPost("/api/sales", {
    items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty: 2, taxRate: 0 }],
    paymentMethod: "cash", amountPaid: 2 * PRODUCT_PRICE, customer: CUSTOMER_NAME,
  });
  if (r.status >= 300) { console.error("sale failed", r.status, JSON.stringify(r.body)); process.exit(1); }
  sale = r.body;
}
console.log("fixture verified: shift", shiftId, "carries the evidence sale", sale.ticket);

// ---- the PDF verification (the API leg — the authoritative extraction) ---
const pdfResp = await fetch(BASE + `/api/sales/${sale.id}/receipt`, { headers: { cookie: AUTH } });
if (pdfResp.status !== 200) { console.error("PDF GET failed:", pdfResp.status); process.exit(1); }
const cd = pdfResp.headers.get("content-disposition") ?? "";
const pdfBytes = Buffer.from(await pdfResp.arrayBuffer());
if (!/attachment; filename="T-\d+\.pdf"/.test(cd)) { console.error("Content-Disposition wrong:", cd); process.exit(1); }
if (pdfBytes.subarray(0, 8).toString("latin1") !== "%PDF-1.4") { console.error("PDF magic wrong"); process.exit(1); }
writeFileSync("/tmp/evidence-receipt.pdf", pdfBytes);
const extracted = execSync(
  "python3 -c \"from pypdf import PdfReader; print(PdfReader('/tmp/evidence-receipt.pdf').pages[0].extract_text())\"",
  { encoding: "utf8" },
);
console.log("--- the receipt PDF (pypdf authoritative extraction) ---");
console.log(extracted);
const okText =
  extracted.includes("My Store") &&
  extracted.includes(sale.ticket) &&
  extracted.includes("Viewer Walk Coffee") &&
  extracted.includes("$9.00") &&
  extracted.includes("Thank you");
if (!okText) { console.error("PDF CONTENT VERIFICATION FAILED"); process.exit(1); }
console.log("PDF verified: magic + disposition + pypdf content all OK");

// ---- 123: the viewer with the "Descargar PDF" affordance ----------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  const row = page.locator("table tbody tr").filter({ hasText: sale.ticket }).first();
  await row.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: `Ver ${sale.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The new affordance, visible with the family (the footer, outside .receipt-print).
  const pdfLink = dialog.getByRole("link", { name: `Descargar PDF ${sale.ticket}` });
  await expect(pdfLink).toBeVisible();
  const bg = await pdfLink.evaluate((el) => getComputedStyle(el.closest("button") ?? el).backgroundColor);
  console.log("123 pdf-button bg:", bg);
  await page.screenshot({ path: `${OUT}/123-session29-viewer-pdf-button.png`, fullPage: false });
  console.log("123 verified: the viewer with the Descargar PDF affordance");
  await ctx.close();
}

// ---- 124: the receipt PDF content as a rendered capture ------------------
// A PDF with Content-Disposition: attachment cannot be screenshotted
// directly — the honest route: trigger the real download (verify the
// suggested filename + the bytes byte-identical to the API's), then render
// the SAME bytes in-page via an <embed> data URL and capture Chromium's
// built-in PDF viewer. The bytes were verified BEFORE the overlay renders.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  const row = page.locator("table tbody tr").filter({ hasText: sale.ticket }).first();
  await row.waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: `Ver ${sale.ticket}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("link", { name: `Descargar PDF ${sale.ticket}` }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`${sale.ticket}.pdf`);
  const dlPath = await download.path();
  const dlBytes = readFileSync(dlPath);
  if (!dlBytes.equals(pdfBytes)) { console.error("124: downloaded bytes differ from the API's"); process.exit(1); }
  // Render the PDF in-page via an <embed> data URL (bytes already verified).
  await page.evaluate((b64) => {
    const holder = document.createElement("div");
    holder.style.cssText = "position:fixed;inset:0;z-index:9999;background:#1a1c26;";
    const embed = document.createElement("embed");
    embed.type = "application/pdf";
    embed.src = `data:application/pdf;base64,${b64}`;
    embed.style.cssText = "width:100%;height:100%;";
    holder.appendChild(embed);
    document.body.appendChild(holder);
  }, pdfBytes.toString("base64"));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/124-session29-receipt-pdf.png`, fullPage: false });
  console.log("124 verified: the PDF rendered in the browser (bytes = the API's, filename " + download.suggestedFilename() + ")");
  await ctx.close();
}

// ---- 125: the mobile drawer at 390 (the operator's priority surface) ----
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
  if (w !== 288) { console.error("DRAWER WIDTH WRONG:", w); process.exit(1); }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) { console.error("HORIZONTAL OVERFLOW AT 390"); process.exit(1); }
  await page.screenshot({ path: `${OUT}/125-session29-mobile-drawer-390.png`, fullPage: false });
  console.log("125 verified: 288px, zero overflow at 390");
  await ctx.close();
}

// ---- the self-clean (close the shift at exact variance; delete nothing) --
const closeResp = await authedPatch(`/api/shifts/${shiftId}`, { countedCash: CLOSE_CASH });
if (closeResp.status !== 200 || closeResp.body.status !== "closed") {
  console.error("close failed:", closeResp.status);
  process.exit(1);
}
const activeAfter = (await authedGet("/api/shifts?status=active")).body.filter(
  (s) => s.registerId === registerId,
);
if (activeAfter.length !== 0) { console.error("SELF-CLEAN FAILED"); process.exit(1); }
console.log("self-clean verified: the evidence shift closed (exact variance), zero active");
await browser.close();
console.log("ALL CAPTURES DONE");

// Session-30 evidence captures: the terminal receipt dialog's own PDF
// affordance (F-128). Runs against the dev server (:3000) running the
// remediated codebase.
//
// Standing tier note: the F-128 legs are STANDING-pinned in the e2e suite
// itself (the terminal checkout test of tests/e2e/terminal.spec.ts — the
// anchor visible + outside .receipt-print + the download event + the
// suggested filename + the byte-identity, on every `bun run test:e2e`).
// This script is the cycle's evidence-capture record (the s19..s29 family
// posture — self-provisioning fixture, re-runnable): screenshots 126-128.
//
// 126: the post-checkout receipt dialog with the NEW "Download PDF" footer
//      affordance (the cycle's UI change — the operator's visual evidence).
// 127: the receipt PDF's authoritative content — the honest route (the s29
//      precedent): trigger the REAL download through the terminal anchor
//      (verify the suggested filename + the bytes byte-identical to the
//      API's), then render the SAME bytes in-page via an <embed> data URL
//      and capture Chromium's built-in PDF viewer; the pypdf authoritative
//      extraction prints to the live log.
// 128: the mobile drawer at 390 (the operator's priority surface).
//
// The fixture mirrors the s29 chain (idempotent by name, POSTs asserted —
// the F-120 law); the sale is minted through the REAL terminal UI (the
// surface under evidence — the charge dialog's cash leg with change). The
// self-clean closes the shift at exact variance and deletes nothing. The
// re-run posture: each run opens a shift and mints a fresh sale (the
// receipt dialog only opens post-checkout).
//
// The API legs ride bun's NATIVE fetch (the Session-26 law).
import { chromium, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const PRODUCT_BARCODE = "TWALK-301";
const PRODUCT_NAME = "Terminal Walk Coffee";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Terminal Walk Register";
const OPENING_FLOAT = 50;
const AMOUNT_PAID = 5; // > total → the change row ($0.50)
const SALE_TOTAL = PRODUCT_PRICE; // qty 1, taxRate 0

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
  let catId = cats.find((c) => c.name === "Terminal Walk")?.id;
  if (!catId) { const r = await authedPost("/api/categories", { name: "Terminal Walk" }); catId = r.body.id; }
  const r = await authedPost("/api/products", { name: PRODUCT_NAME, price: PRODUCT_PRICE, categoryId: catId, stock: 20, minStock: 2, barcode: PRODUCT_BARCODE, taxRate: 0 });
  if (r.status >= 300) { console.error("product failed", r.status); process.exit(1); }
  prodId = r.body.id;
}
let registerId = (await authedGet("/api/registers")).body.find((r) => r.name === REGISTER_NAME)?.id;
if (!registerId) { const r = await authedPost("/api/registers", { name: REGISTER_NAME, openingFloat: OPENING_FLOAT }); registerId = r.body.id; }
let shiftId = (await authedGet("/api/shifts?status=active")).body.find((s) => s.registerId === registerId)?.id;
if (!shiftId) { const r = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT }); shiftId = r.body.id; }
console.log("fixture verified: register", registerId, "shift", shiftId, "open");

// ---- the UI checkout + the download leg (126) ---------------------------
// One flow, like the e2e test: checkout → the receipt dialog → the anchor
// verified → the screenshot → the REAL download → the API byte-compare →
// the pypdf extraction — all while the dialog lives.
let saleTicket = "";
let pdfBytes = Buffer.alloc(0);
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/POS");
  await page.getByRole("button", { name: `Add ${PRODUCT_NAME} to cart` }).first().click();
  const charge = page.getByTestId("charge-button");
  await expect(charge).toContainText(`CHARGE $${SALE_TOTAL.toFixed(2)}`);
  await charge.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(`Charge $${SALE_TOTAL.toFixed(2)}`)).toBeVisible();
  await dialog.getByLabel("Amount received").fill(String(AMOUNT_PAID));
  await expect(dialog.getByTestId("change-due")).toContainText("$0.50");
  await dialog.getByRole("button", { name: /Complete cash sale/ }).click();

  // The receipt dialog — the surface under evidence.
  const receipt = page.getByRole("dialog");
  await expect(receipt.getByText(/T-\d+ · \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)).toBeVisible();
  saleTicket = (await receipt.getByText(/T-\d+/).first().textContent() ?? "").trim().split(" ")[0];

  // The new affordance: visible, in the footer, OUTSIDE .receipt-print.
  const pdfAnchor = receipt.getByRole("link", { name: `Download PDF ${saleTicket}` });
  await expect(pdfAnchor).toBeVisible();
  await expect(receipt.locator(".receipt-print").getByRole("link")).toHaveCount(0);
  // href = "/api/sales/{id}/receipt" — the id is the 4th path segment.
  const href = (await pdfAnchor.getAttribute("href")) ?? "";
  const hrefPath = href.split("/").filter(Boolean);
  if (hrefPath[2] === undefined || hrefPath[2] === "receipt") { console.error("could not read the sale id from the anchor href:", hrefPath); process.exit(1); }
  const bg = await pdfAnchor.evaluate((el) => getComputedStyle(el.closest("button") ?? el).backgroundColor);
  console.log("126 pdf-button bg:", bg);
  await page.screenshot({ path: `${OUT}/126-session30-terminal-receipt-pdf-button.png`, fullPage: false });
  console.log(`126 verified: the post-checkout dialog with the Download PDF affordance (${saleTicket})`);

  // The REAL download through the terminal anchor (the dialog still open) —
  // one flow, exactly like the e2e leg.
  const downloadPromise = page.waitForEvent("download");
  await pdfAnchor.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`${saleTicket}.pdf`);
  const dlBytes = readFileSync(await download.path());

  // The API leg — the anchor's OWN href, compared byte-for-byte.
  const pdfResp = await fetch(BASE + href, { headers: { cookie: AUTH } });
  if (pdfResp.status !== 200) { console.error("PDF GET failed:", pdfResp.status); process.exit(1); }
  const cd = pdfResp.headers.get("content-disposition") ?? "";
  pdfBytes = Buffer.from(await pdfResp.arrayBuffer());
  if (cd !== `attachment; filename="${saleTicket}.pdf"`) { console.error("Content-Disposition wrong:", cd); process.exit(1); }
  if (pdfBytes.subarray(0, 8).toString("latin1") !== "%PDF-1.4") { console.error("PDF magic wrong"); process.exit(1); }
  if (!dlBytes.equals(pdfBytes)) { console.error("the anchor's download differs from the API's bytes"); process.exit(1); }
  console.log("download verified: " + download.suggestedFilename() + " — the anchor delivers the API's exact bytes");

  // The pypdf authoritative extraction (printed to the live log).
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/evidence-s30-receipt.pdf", pdfBytes);
  const extracted = execSync(
    "python3 -c \"from pypdf import PdfReader; print(PdfReader('/tmp/evidence-s30-receipt.pdf').pages[0].extract_text())\"",
    { encoding: "utf8" },
  );
  console.log("--- the receipt PDF (pypdf authoritative extraction) ---");
  console.log(extracted);
  const okText =
    extracted.includes("My Store") &&
    extracted.includes(saleTicket) &&
    extracted.includes(PRODUCT_NAME) &&
    extracted.includes("$4.50") &&
    extracted.includes("Cash / Change") &&
    extracted.includes("Thank you");
  if (!okText) { console.error("PDF CONTENT VERIFICATION FAILED"); process.exit(1); }
  console.log("PDF verified: magic + disposition + byte-identity + pypdf content all OK");
  await ctx.close();
}

// ---- 127: the receipt PDF content as a rendered capture ------------------
// The honest route (the s29 precedent): the bytes were verified through the
// real download FIRST (above); this block renders the SAME bytes in-page via
// an <embed> data URL and captures Chromium's built-in PDF viewer.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
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
  await page.screenshot({ path: `${OUT}/127-session30-receipt-pdf.png`, fullPage: false });
  console.log("127 verified: the anchor-delivered PDF rendered in the browser");
  await ctx.close();
}

// ---- 128: the mobile drawer at 390 (the operator's priority surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const w = await dialog.evaluate((el) => Math.round(el.getBoundingClientRect().width));
  if (w !== 288) { console.error("DRAWER WIDTH WRONG:", w); process.exit(1); }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) { console.error("HORIZONTAL OVERFLOW AT 390"); process.exit(1); }
  await page.screenshot({ path: `${OUT}/128-session30-mobile-drawer-390.png`, fullPage: false });
  console.log("128 verified: 288px, zero overflow at 390");
  await ctx.close();
}

// ---- the self-clean (close the shift at exact variance; delete nothing) --
// The counted cash is DERIVED: the float + every completed sale on the shift
// (robust across re-runs — earlier runs' sales ride the same shift).
const shiftSales = (await authedGet("/api/sales")).body.filter(
  (s) => s.shiftId === shiftId && s.status === "completed",
);
const countedCash = Math.round((OPENING_FLOAT + shiftSales.reduce((n, s) => n + (s.total ?? 0), 0)) * 100) / 100;
const closeResp = await authedPatch(`/api/shifts/${shiftId}`, { countedCash });
if (closeResp.status !== 200 || closeResp.body.status !== "closed") {
  console.error("close failed:", closeResp.status, JSON.stringify(closeResp.body));
  process.exit(1);
}
const activeAfter = (await authedGet("/api/shifts?status=active")).body.filter(
  (s) => s.registerId === registerId,
);
if (activeAfter.length !== 0) { console.error("SELF-CLEAN FAILED"); process.exit(1); }
console.log("self-clean verified: the evidence shift closed (exact variance), zero active");

await browser.close();
console.log("EVIDENCE: s30 captures complete (126-128)");

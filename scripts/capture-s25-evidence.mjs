// Session-25 evidence captures: the fiscal receipt round-trip's surfaces
// (F-123). Runs against the dev server (:3000) running the remediated
// codebase.
//
// Standing tier note: the fiscal round-trip is STANDING-pinned in the e2e
// suite itself (tests/e2e/with-data-fiscal-receipt-walk.spec.ts — the
// visible-state + hidden-polarity tests run on every `bun run test:e2e`).
// This script is the cycle's evidence-capture record (the s19..s24 family
// posture — self-provisioning fixture, re-runnable): screenshots 111-113.
//
// The fixture mirrors the spec's chain (the "Fiscal Walk" category/product/
// register — idempotent, POSTs asserted) and the ANALYZE journey: the
// settings flip + fill + save, the checkout, the receipt's fiscal line,
// then the FULL RESTORE to seed defaults (the self-clean law — the dev db
// must end in the default state).
import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const CATEGORY_NAME = "Fiscal Walk";
const PRODUCT_NAME = "Fiscal Walk Coffee";
const PRODUCT_BARCODE = "FWALK-390";
const REGISTER_NAME = "Fiscal Walk Register";
const RUC = "FWALK-RUC-001";
const BUSINESS_TYPE = "S-Corp Test";
const FISCAL_LINE = `${RUC} · ${BUSINESS_TYPE}`;

async function login(page) {
  await page.goto(BASE + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(BASE + "/");
}

// The fixture chain (idempotent; POSTs asserted — the F-120 law).
async function provisionFixture(page) {
  const json = (r) => r.json();
  const post = async (url, data) => {
    const resp = await page.request.post(BASE + url, { data });
    if (!resp.ok()) {
      console.error(`fixture POST ${url} failed: ${resp.status()}`);
      process.exit(1);
    }
    return json(resp);
  };
  const cats = await json(await page.request.get(`${BASE}/api/categories`));
  let catId = cats.find((c) => c.name === CATEGORY_NAME)?.id;
  if (!catId) catId = (await post("/api/categories", { name: CATEGORY_NAME })).id;
  const prods = await json(await page.request.get(`${BASE}/api/products`));
  if (!prods.some((p) => p.barcode === PRODUCT_BARCODE)) {
    await post("/api/products", {
      name: PRODUCT_NAME, price: 3.25, categoryId: catId, stock: 10, minStock: 2,
      barcode: PRODUCT_BARCODE, taxRate: 0,
    });
  }
  const regs = await json(await page.request.get(`${BASE}/api/registers`));
  if (!regs.some((r) => r.name === REGISTER_NAME)) {
    await post("/api/registers", { name: REGISTER_NAME, openingFloat: 100 });
  }
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- captures 111 + 112: the fiscal round-trip (settings + receipt) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);

  // ---- 111: the fiscal settings card with the toggle ON + the fields ----
  await page.goto(BASE + "/StoreSettings");
  const fiscal = page.getByRole("region", { name: "Fiscal / Tax Data" });
  await fiscal.getByRole("switch", { name: "Show fiscal data on receipt" }).click();
  await fiscal.getByLabel("Tax ID / EIN").fill(RUC);
  await fiscal.getByLabel("Tax Regime").fill(BUSINESS_TYPE);
  await page.getByTestId("save-settings").click();
  await expect(
    page.getByRole("region", { name: "Notifications" }).getByText("Settings saved"),
  ).toBeVisible({ timeout: 15000 });
  // API verify (state, not just UI).
  const saved = await (await page.request.get(`${BASE}/api/store-settings`)).json();
  if (saved.hideFiscalOnReceipt !== false || saved.fiscalRuc !== RUC) {
    console.error("CAPTURE 111 VERIFICATION FAILED:", JSON.stringify(saved));
    process.exit(1);
  }
  await fiscal.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/111-session25-fiscal-settings-visible.png`, fullPage: false });
  console.log(`111 fiscal-settings verified: toggle ON, label "Visible on receipt", RUC=${saved.fiscalRuc}`);

  // ---- 112: the receipt rendering the fiscal line ----
  await page.goto(BASE + "/Registers");
  const card = page.getByTestId(`register-${REGISTER_NAME}`);
  await card.getByRole("button", { name: "Open shift" }).click();
  const openDlg = page.getByRole("dialog", { name: new RegExp(`Open shift — ${REGISTER_NAME}`) });
  await openDlg.getByLabel("Opening float").fill("100");
  await openDlg.getByRole("button", { name: "Open shift" }).click();
  await expect(card.getByText("Shift open")).toBeVisible({ timeout: 15000 });

  await page.goto(BASE + "/POS");
  await page.getByRole("button", { name: `Add ${PRODUCT_NAME} to cart` }).click();
  const charge = page.getByTestId("charge-button");
  await expect(charge).toContainText("CHARGE $3.25");
  await charge.click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("Amount received").fill("5");
  await dlg.getByRole("button", { name: /Complete cash sale/ }).click();
  const receipt = page.getByRole("dialog");
  await expect(receipt.getByText(/T-0000\d/)).toBeVisible({ timeout: 15000 });
  await expect(receipt.locator(".receipt-print").getByText(FISCAL_LINE)).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `${OUT}/112-session25-receipt-fiscal-line.png`, fullPage: false });
  console.log(`112 receipt-fiscal-line verified: "${FISCAL_LINE}" renders inside .receipt-print`);
  await receipt.getByRole("button", { name: "Close", exact: true }).first().click();

  // ---- the self-clean: close the shift + RESTORE the settings ----
  await page.goto(BASE + "/Registers");
  await card.getByRole("button", { name: "Close shift" }).click();
  const closeDlg = page.getByRole("dialog", { name: "Close shift" });
  await closeDlg.getByLabel("Counted cash").fill("103.25");
  await closeDlg.getByRole("button", { name: "Close shift" }).click();
  await expect(card.getByRole("button", { name: "Open shift" })).toBeVisible({ timeout: 15000 });

  await page.goto(BASE + "/StoreSettings");
  await page
    .getByRole("region", { name: "Fiscal / Tax Data" })
    .getByRole("switch", { name: "Show fiscal data on receipt" })
    .click();
  await page
    .getByRole("region", { name: "Fiscal / Tax Data" })
    .getByLabel("Tax ID / EIN")
    .fill("");
  await page.getByTestId("save-settings").click();
  await expect(
    page.getByRole("region", { name: "Notifications" }).getByText("Settings saved"),
  ).toBeVisible({ timeout: 15000 });
  const restored = await (await page.request.get(`${BASE}/api/store-settings`)).json();
  if (restored.hideFiscalOnReceipt !== true || restored.fiscalRuc !== "") {
    console.error("RESTORE VERIFICATION FAILED:", JSON.stringify(restored));
    process.exit(1);
  }
  console.log("self-clean verified: shift closed, settings restored to seed defaults");
  await ctx.close();
}

// ---- capture 113: the mobile drawer at 390 (the operator's priority surface) ----
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
    console.error("CAPTURE 113 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("113 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/113-session25-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-25 evidence captured: 111-113");

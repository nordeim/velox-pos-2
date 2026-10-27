// Session-19 evidence captures: the remediated print path + the mobile drawer.
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: unlike the s16/s18 with-data harnesses (which pin what
// the empty-store e2e can NEVER see), the print-path class is STANDING-pinned
// in the e2e suite itself (tests/e2e/terminal.spec.ts — the F-114/F-115
// print-media emulation pins run on every `bun run test:e2e`). This script is
// the cycle's evidence-capture record: it provisions its own fixture (the
// s16 family posture — re-runnable on a fresh db) and captures the numbered
// screenshots 93-95.
import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

async function login(page) {
  await page.goto(BASE + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(BASE + "/");
}

// Provision the fixture through the API (the e2e beforeAll posture): a
// category, a product, a register with an open shift — idempotent-ish (a
// leftover "Print Register" with an active shift fails the shift POST
// harmlessly; the product card lookup only needs ONE Probe Cola).
async function provisionFixture(page) {
  const cat = await page.request.post(`${BASE}/api/categories`, { data: { name: "PrintTest" } });
  const catBody = await cat.json();
  await page.request.post(`${BASE}/api/products`, {
    data: { name: "Probe Cola", price: 2.5, categoryId: catBody.id, stock: 50, minStock: 2, barcode: "1001", taxRate: 0 },
  });
  const regs = await (await page.request.get(`${BASE}/api/registers`)).json();
  const openReg = regs.find((r) => r.status === "open");
  if (!openReg) {
    const reg = await page.request.post(`${BASE}/api/registers`, { data: { name: "Print Register" } });
    await page.request.post(`${BASE}/api/shifts`, { data: { registerId: (await reg.json()).id, openingFloat: 100 } });
  }
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- capture 93: the terminal receipt under print emulation (post-fix) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  await page.goto(BASE + "/POS");
  await page.waitForLoadState("networkidle");
  await page.locator("li button", { hasText: "Probe Cola" }).first().click();
  await page.locator("aside").filter({ hasText: "Probe Cola" }).first().waitFor({ state: "visible" });
  const chargeBtn = page.getByTestId("charge-button");
  await expect(chargeBtn).toBeEnabled({ timeout: 10000 });
  await chargeBtn.click();
  const dlg = page.getByRole("dialog");
  await dlg.waitFor({ state: "visible" });
  await dlg.getByLabel("Amount received").fill("5");
  await dlg.getByRole("button", { name: /Complete cash sale/i }).click();
  const receipt = page.getByRole("dialog").filter({ hasText: /T-00000/ });
  await receipt.waitFor({ state: "visible", timeout: 15000 });
  // verify the fix live (the F-114 pin posture) then capture under print emulation
  await page.emulateMedia({ media: "print" });
  await expect
    .poll(async () =>
      receipt.locator(".receipt-print").evaluate((el) => {
        const total = Array.from(el.querySelectorAll("div")).find((d) =>
          (d.textContent ?? "").trim().startsWith("Total"),
        );
        return total ? getComputedStyle(total).color : null;
      }),
    )
    .toBe("rgb(0, 0, 0)");
  await page.screenshot({ path: `${OUT}/93-session19-terminal-receipt-print.png` });
  console.log("93 captured: terminal receipt under print emulation (Total row = black)");
  await page.emulateMedia({ media: null });
  await ctx.close();
}

// ---- capture 94: the Sales receipt viewer under print emulation (post-fix) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/Sales");
  await page.waitForLoadState("networkidle");
  const firstRow = page.locator("tbody tr").first();
  await firstRow.waitFor({ state: "visible", timeout: 10000 });
  await firstRow.getByRole("button").last().click(); // the Ver (Eye) button
  const viewer = page.getByRole("dialog");
  await viewer.waitFor({ state: "visible", timeout: 10000 });
  const wrapper = viewer.locator(".receipt-print");
  await expect(wrapper).toHaveCount(1);
  await page.emulateMedia({ media: "print" });
  await expect
    .poll(async () => wrapper.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe("rgb(255, 255, 255)");
  await page.screenshot({ path: `${OUT}/94-session19-sales-viewer-print.png` });
  console.log("94 captured: Sales receipt viewer under print emulation (wrapper paints)");
  await page.emulateMedia({ media: null });
  await ctx.close();
}

// ---- capture 95: the mobile drawer (the operator's priority surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const drawer = page.getByRole("dialog");
  await drawer.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(700); // the animate-in settle (the s16 lesson)
  await page.screenshot({ path: `${OUT}/95-session19-mobile-drawer.png` });
  console.log("95 captured: the mobile navigation drawer at 390x844 (post-remediation)");
  await ctx.close();
}

await browser.close();
console.log("evidence captures complete");

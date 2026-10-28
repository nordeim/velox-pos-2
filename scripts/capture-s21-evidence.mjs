// Session-21 evidence captures: the three-ledger with-data walk's surfaces.
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: the three-ledger walk is STANDING-pinned in the e2e
// suite itself (tests/e2e/viewport-drift-sweep.spec.ts — the battery + the
// walk run on every `bun run test:e2e`) and the F-118 race is unit-pinned
// (tests/unit/store.test.ts). This script is the cycle's evidence-capture
// record (the s19/s20 family posture — self-provisioning fixture,
// re-runnable on a fresh db): screenshots 99-101.
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

// The with-data fixture (the F-117 chain, idempotent): ONE chain feeds all
// three ledgers — product → Inventory, sale → Sales, shift → Cashiers. The
// shift CLOSES before the walks (the self-clean law; the closed shift is the
// F-118 surface — the race used to drop exactly these rows).
async function provisionFixture(page) {
  const json = (r) => r.json();
  const cats = await json(await page.request.get(`${BASE}/api/categories`));
  let catId = cats.find((c) => c.name === "Drift Sweep")?.id;
  if (!catId) {
    catId = (await json(await page.request.post(`${BASE}/api/categories`, { data: { name: "Drift Sweep" } }))).id;
  }
  const prods = await json(await page.request.get(`${BASE}/api/products`));
  let prodId = prods.find((p) => p.barcode === "DSWEEP-390")?.id;
  if (!prodId) {
    prodId = (await json(
      await page.request.post(`${BASE}/api/products`, {
        data: { name: "Drift Sweep Cola", price: 2.5, categoryId: catId, stock: 50, minStock: 2, barcode: "DSWEEP-390", taxRate: 0 },
      }),
    )).id;
  }
  const regs = await json(await page.request.get(`${BASE}/api/registers`));
  let reg = regs.find((r) => r.name === "Drift Sweep Register");
  if (!reg) {
    reg = await json(await page.request.post(`${BASE}/api/registers`, { data: { name: "Drift Sweep Register", openingFloat: 100 } }));
  }
  const active = await json(await page.request.get(`${BASE}/api/shifts?status=active`));
  let shift = active.find((s) => s.registerId === reg.id);
  if (!shift) {
    shift = await json(await page.request.post(`${BASE}/api/shifts`, { data: { registerId: reg.id, openingFloat: 100 } }));
  }
  const sales = await json(await page.request.get(`${BASE}/api/sales`));
  let ticket = sales.find((s) => s.customer === "Drift Sweep")?.ticket;
  if (!ticket) {
    const sale = await json(
      await page.request.post(`${BASE}/api/sales`, {
        data: { items: [{ productId: prodId, quantity: 2 }], paymentMethod: "cash", amountPaid: 20, customer: "Drift Sweep" },
      }),
    );
    ticket = sale.ticket;
  }
  if (shift.status === "active") {
    await page.request.patch(`${BASE}/api/shifts/${shift.id}`, { data: { countedCash: 110 } });
  }
  return { ticket };
}

// The per-route containment probe (the F-116/F-117 pin posture)
async function containmentProbe(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const main = document.querySelector("main");
    const table = document.querySelector("table");
    const container = table ? table.closest(".vpx-scroll") : null;
    let functionalScroll = false;
    if (container) {
      container.scrollLeft = 50;
      functionalScroll = container.scrollLeft > 0;
      container.scrollLeft = 0;
    }
    return {
      docScrollW: de.scrollWidth,
      clientW: de.clientWidth,
      mainScrollW: main ? main.scrollWidth : null,
      functionalScroll,
      tableScrollW: table ? table.scrollWidth : null,
    };
  });
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- capture 99: the with-data SALES ledger contained at 390 (the F-117 surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  const { ticket } = await provisionFixture(page);
  await page.goto(BASE + "/Sales");
  await page.locator("table tbody tr").filter({ hasText: ticket }).first().waitFor({ state: "visible", timeout: 15000 });
  const probe = await containmentProbe(page);
  if (probe.mainScrollW > probe.clientW || !probe.functionalScroll || probe.tableScrollW < 720) {
    console.error("CAPTURE 99 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("99 sales-ledger containment verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/99-session21-sales-ledger-contained-390.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 100: the with-data CASHIERS ledger contained at 390 (the F-118 race surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  await page.goto(BASE + "/Cashiers");
  // The F-118 surface: the CLOSED shift row must render — the pre-fix race
  // dropped exactly these rows ("Sin turnos registrados").
  await page.locator("table tbody tr").filter({ hasText: "Drift Sweep Register" }).first().waitFor({ state: "visible", timeout: 15000 });
  const probe = await containmentProbe(page);
  const rowStatus = await page.evaluate(() => {
    const row = [...document.querySelectorAll("table tbody tr")].find((r) => r.textContent.includes("Drift Sweep Register"));
    return row ? row.textContent.includes("Cerrado") : false;
  });
  if (probe.mainScrollW > probe.clientW || !probe.functionalScroll || probe.tableScrollW < 640 || !rowStatus) {
    console.error("CAPTURE 100 VERIFICATION FAILED:", JSON.stringify({ ...probe, closedRowRenders: rowStatus }));
    process.exit(1);
  }
  console.log("100 cashiers-ledger containment verified (the closed shift renders):", JSON.stringify({ ...probe, closedRowRenders: rowStatus }));
  await page.screenshot({ path: `${OUT}/100-session21-cashiers-ledger-contained-390.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 101: the mobile drawer at 390 (the operator's priority surface) ----
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
    console.error("CAPTURE 101 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("101 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/101-session21-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-21 evidence captured: 99-101");

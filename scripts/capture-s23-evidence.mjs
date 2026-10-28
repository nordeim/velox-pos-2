// Session-23 evidence captures: the with-data Dashboard walk's surfaces (F-121).
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: the with-data Dashboard walk is STANDING-pinned in the
// e2e suite itself (tests/e2e/with-data-dashboard-walk.spec.ts — the exact
// wiring pin + the containment at 768/1024/390 run on every `bun run
// test:e2e`). This script is the cycle's evidence-capture record (the
// s19..s22 family posture — self-provisioning fixture, re-runnable):
// screenshots 105-107.
//
// The fixture is the SAME chain the spec provisions (idempotent): the
// "Dashboard Walk" category/product/register/shift + ONE cash sale. The
// expected values are DERIVED FROM THE APIs at runtime (never hardcoded —
// the s18/s22 volatile-expectation law: the today pair mirrors
// inPeriod(sale, 1, now)'s calendar-bucket semantics).
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

// The with-data fixture (the F-121 chain, idempotent; the POSTs ASSERT their
// responses — the F-120 lesson).
async function provisionFixture(page) {
  const json = (r) => r.json();
  const cats = await json(await page.request.get(`${BASE}/api/categories`));
  let catId = cats.find((c) => c.name === "Dashboard Walk")?.id;
  if (!catId) {
    const resp = await page.request.post(`${BASE}/api/categories`, { data: { name: "Dashboard Walk" } });
    if (!resp.ok()) {
      console.error(`category fixture failed: ${resp.status()}`);
      process.exit(1);
    }
    catId = (await json(resp)).id;
  }
  const prods = await json(await page.request.get(`${BASE}/api/products`));
  let prodId = prods.find((p) => p.barcode === "DWALK-390")?.id;
  if (!prodId) {
    const resp = await page.request.post(`${BASE}/api/products`, {
      data: { name: "Dashboard Walk Coffee", price: 3.25, categoryId: catId, stock: 10, minStock: 2, barcode: "DWALK-390", taxRate: 0 },
    });
    if (!resp.ok()) {
      console.error(`product fixture failed: ${resp.status()}`);
      process.exit(1);
    }
    prodId = (await json(resp)).id;
  }
  const regs = await json(await page.request.get(`${BASE}/api/registers`));
  let reg = regs.find((r) => r.name === "Dashboard Walk Register");
  if (!reg) {
    const resp = await page.request.post(`${BASE}/api/registers`, { data: { name: "Dashboard Walk Register", openingFloat: 100 } });
    if (!resp.ok()) {
      console.error(`register fixture failed: ${resp.status()}`);
      process.exit(1);
    }
    reg = await json(resp);
  }
  const sales = await json(await page.request.get(`${BASE}/api/sales`));
  const hasSale = sales.some((s) => s.customer === "Dashboard Walk");
  if (!hasSale) {
    const active = await json(await page.request.get(`${BASE}/api/shifts?status=active`));
    let shift = active.find((s) => s.registerId === reg.id);
    if (!shift) {
      const resp = await page.request.post(`${BASE}/api/shifts`, { data: { registerId: reg.id, openingFloat: 100 } });
      if (!resp.ok()) {
        console.error(`shift fixture failed: ${resp.status()}`);
        process.exit(1);
      }
      shift = await json(resp);
    }
    const resp = await page.request.post(`${BASE}/api/sales`, {
      data: {
        items: [{ productId: prodId, name: "Dashboard Walk Coffee", price: 3.25, qty: 2, taxRate: 0 }],
        paymentMethod: "cash",
        amountPaid: 20,
        customer: "Dashboard Walk",
      },
    });
    if (!resp.ok()) {
      console.error(`sale fixture failed: ${resp.status()}`);
      process.exit(1);
    }
    // Self-clean (the standing law): the shift closes with an exact variance.
    if (shift.status === "active") {
      await page.request.patch(`${BASE}/api/shifts/${shift.id}`, { data: { countedCash: 106.5 } });
    }
  }
}

// The expected values, derived from the APIs at runtime (the F-121 pin
// posture — the today pair mirrors the seam's calendar-bucket semantics).
async function deriveExpected(page) {
  const json = (r) => r.json();
  const sales = await json(await page.request.get(`${BASE}/api/sales`));
  const products = await json(await page.request.get(`${BASE}/api/products`));
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const now = new Date();
  const todayRows = sales.filter((s) => {
    if (s.status !== "completed") return false;
    const created = new Date(s.createdAt);
    return created >= midnight && created <= now;
  });
  const round2 = (n) => Math.round(n * 100) / 100;
  return {
    revenue: round2(todayRows.reduce((sum, s) => sum + s.total, 0)),
    transactions: todayRows.length,
    products: products.length,
    lowStock: products.filter((p) => p.active && !(p.stock > 0 && p.stock > p.minStock)).length,
    todayWeekday: now.toLocaleString("en-US", { weekday: "short" }),
    fmt: (n) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n),
  };
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- capture 105: the with-data Dashboard DESKTOP (the exact wiring pin's surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  const expected = await deriveExpected(page);
  await page.goto(BASE + "/Dashboard");
  await page.getByTestId("category-breakdown").waitFor({ state: "visible", timeout: 15000 });
  // The exact wiring pin, verified live before the capture: the four stats +
  // the category rows + the chart domain covering the data + today's weekday.
  await expect(page.getByTestId("stat-today-s-sales")).toHaveText(expected.fmt(expected.revenue));
  await expect(page.getByTestId("stat-transactions")).toHaveText(String(expected.transactions));
  await expect(page.getByTestId("stat-products")).toHaveText(String(expected.products));
  await expect(page.getByTestId("stat-low-stock")).toHaveText(String(expected.lowStock));
  const ticks = await page.locator('[data-testid="line-chart"] text').allTextContents();
  const numericTicks = ticks.filter((t) => /^\d+(\.\d+)?$/.test(t.trim())).map((t) => Number(t));
  const topTick = Math.max(...numericTicks);
  if (topTick < expected.revenue) {
    console.error(`CAPTURE 105 VERIFICATION FAILED: topTick ${topTick} < revenue ${expected.revenue}`);
    process.exit(1);
  }
  if (ticks[ticks.length - 1].trim() !== expected.todayWeekday) {
    console.error(`CAPTURE 105 VERIFICATION FAILED: last tick ${ticks[ticks.length - 1]} != ${expected.todayWeekday}`);
    process.exit(1);
  }
  const catCount = await page.getByTestId("category-breakdown").locator("li").count();
  if (catCount < 1) {
    console.error("CAPTURE 105 VERIFICATION FAILED: no category rows render");
    process.exit(1);
  }
  console.log(
    `105 dashboard-desktop verified: stats ${expected.fmt(expected.revenue)} / ${expected.transactions} / ${expected.products} / ${expected.lowStock}, topTick ${topTick} >= ${expected.revenue}, lastTick ${expected.todayWeekday}, catRows ${catCount}`,
  );
  await page.screenshot({ path: `${OUT}/105-session23-dashboard-withdata-desktop.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 106: the with-data Dashboard contained at 390 (the s20..s22 lineage) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  await page.goto(BASE + "/Dashboard");
  await page.getByTestId("category-breakdown").waitFor({ state: "visible", timeout: 15000 });
  const probe = await page.evaluate(() => {
    const de = document.documentElement;
    const main = document.querySelector("main");
    const chart = document.querySelector('[data-testid="line-chart"]');
    const cats = document.querySelector('[data-testid="category-breakdown"]');
    const bars = Array.from(document.querySelectorAll('[data-testid="category-breakdown"] li div.h-1\\.5 > div')).map(
      (b) => b.getBoundingClientRect().width,
    );
    return {
      docScrollW: de.scrollWidth,
      clientW: de.clientWidth,
      mainScrollW: main ? main.scrollWidth : null,
      chartRight: chart ? Math.round(chart.getBoundingClientRect().right) : null,
      catsRight: cats ? Math.round(cats.getBoundingClientRect().right) : null,
      barCount: bars.length,
      barsPositive: bars.every((w) => w > 0),
    };
  });
  if (
    probe.docScrollW > probe.clientW ||
    probe.mainScrollW > probe.clientW ||
    probe.chartRight > probe.clientW ||
    probe.catsRight > probe.clientW ||
    probe.barCount < 1 ||
    !probe.barsPositive
  ) {
    console.error("CAPTURE 106 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("106 dashboard-mobile containment verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/106-session23-dashboard-withdata-390.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 107: the mobile drawer at 390 (the operator's priority surface) ----
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
    console.error("CAPTURE 107 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("107 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/107-session23-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-23 evidence captured: 105-107");

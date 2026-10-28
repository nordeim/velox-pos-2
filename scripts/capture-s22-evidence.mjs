// Session-22 evidence captures: the with-data Reports walk's surfaces (F-119).
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: the with-data Reports walk is STANDING-pinned in the
// e2e suite itself (tests/e2e/with-data-reports-walk.spec.ts — the exact
// wiring pin + the containment at 390 run on every `bun run test:e2e`). This
// script is the cycle's evidence-capture record (the s19..s21 family posture
// — self-provisioning fixture, re-runnable): screenshots 102-104.
//
// The fixture is the SAME chain the spec provisions (idempotent): the
// "Reports Walk" category/product/register/shift + a CASH and a CARD sale —
// the byMethod two-row shape. The expected stats are DERIVED FROM THE API at
// runtime (never hardcoded — the s18 volatile-expectation lesson).
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

// The with-data fixture (the F-119 chain, idempotent; the POSTs ASSERT their
// responses — the F-120 lesson).
async function provisionFixture(page) {
  const json = (r) => r.json();
  const cats = await json(await page.request.get(`${BASE}/api/categories`));
  let catId = cats.find((c) => c.name === "Reports Walk")?.id;
  if (!catId) {
    catId = (await json(await page.request.post(`${BASE}/api/categories`, { data: { name: "Reports Walk" } }))).id;
  }
  const prods = await json(await page.request.get(`${BASE}/api/products`));
  let prodId = prods.find((p) => p.barcode === "RWALK-390")?.id;
  if (!prodId) {
    prodId = (await json(
      await page.request.post(`${BASE}/api/products`, {
        data: { name: "Reports Walk Coffee", price: 3.25, categoryId: catId, stock: 50, minStock: 2, barcode: "RWALK-390", taxRate: 0 },
      }),
    )).id;
  }
  const regs = await json(await page.request.get(`${BASE}/api/registers`));
  let reg = regs.find((r) => r.name === "Reports Walk Register");
  if (!reg) {
    reg = await json(await page.request.post(`${BASE}/api/registers`, { data: { name: "Reports Walk Register", openingFloat: 100 } }));
  }
  const sales = await json(await page.request.get(`${BASE}/api/sales`));
  const hasCash = sales.some((s) => s.customer === "Reports Walk Cash");
  const hasCard = sales.some((s) => s.customer === "Reports Walk Card");
  if (!hasCash || !hasCard) {
    const active = await json(await page.request.get(`${BASE}/api/shifts?status=active`));
    let shift = active.find((s) => s.registerId === reg.id);
    if (!shift) {
      shift = await json(await page.request.post(`${BASE}/api/shifts`, { data: { registerId: reg.id, openingFloat: 100 } }));
    }
    const line = (qty) => [{ productId: prodId, name: "Reports Walk Coffee", price: 3.25, qty, taxRate: 0 }];
    if (!hasCash) {
      const resp = await page.request.post(`${BASE}/api/sales`, {
        data: { items: line(2), paymentMethod: "cash", amountPaid: 20, customer: "Reports Walk Cash" },
      });
      if (!resp.ok()) {
        console.error(`cash fixture failed: ${resp.status()}`);
        process.exit(1);
      }
    }
    if (!hasCard) {
      const resp = await page.request.post(`${BASE}/api/sales`, {
        data: { items: line(1), paymentMethod: "card", customer: "Reports Walk Card" },
      });
      if (!resp.ok()) {
        console.error(`card fixture failed: ${resp.status()}`);
        process.exit(1);
      }
    }
    if (shift.status === "active") {
      await page.request.patch(`${BASE}/api/shifts/${shift.id}`, { data: { countedCash: 106.5 } });
    }
  }
}

// The expected values, derived from the API at runtime (the F-119 pin posture).
async function deriveExpected(page) {
  const json = (r) => r.json();
  const sales = await json(await page.request.get(`${BASE}/api/sales`));
  const done = sales.filter((s) => s.status === "completed");
  const round2 = (n) => Math.round(n * 100) / 100;
  const revenue = round2(done.reduce((sum, s) => sum + s.total, 0));
  return {
    revenue,
    transactions: done.length,
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

// ---- capture 102: the with-data Reports DESKTOP (the exact wiring pin's surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  const expected = await deriveExpected(page);
  await page.goto(BASE + "/Reports");
  await page.getByTestId("revenue-by-method").waitFor({ state: "visible", timeout: 15000 });
  // The exact wiring pin, verified live before the capture: the three stats
  // + both method rows + the chart domain covering the data.
  await expect(page.getByTestId("stat-total-revenue")).toHaveText(expected.fmt(expected.revenue));
  await expect(page.getByTestId("stat-transactions")).toHaveText(String(expected.transactions));
  const ticks = await page.locator('[data-testid="area-chart"] text').allTextContents();
  const moneyTicks = ticks.filter((t) => /^\$[\d.]+$/.test(t)).map((t) => Number(t.slice(1)));
  if (Math.max(...moneyTicks) < Math.ceil(expected.revenue)) {
    console.error(`CAPTURE 102 VERIFICATION FAILED: topTick ${Math.max(...moneyTicks)} < revenue ${expected.revenue}`);
    process.exit(1);
  }
  const cashRow = page.getByTestId("revenue-by-method").locator("li").filter({ hasText: "cash" });
  const cardRow = page.getByTestId("revenue-by-method").locator("li").filter({ hasText: "card" });
  await expect(cashRow).toBeVisible();
  await expect(cardRow).toBeVisible();
  console.log(
    `102 reports-desktop verified: stats ${expected.fmt(expected.revenue)} / ${expected.transactions}, topTick ${Math.max(...moneyTicks)}, both method rows render`,
  );
  await page.screenshot({ path: `${OUT}/102-session22-reports-withdata-desktop.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 103: the with-data Reports contained at 390 (the s20/s21 lineage) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  const expected = await deriveExpected(page);
  await page.goto(BASE + "/Reports");
  await page.getByTestId("revenue-by-method").waitFor({ state: "visible", timeout: 15000 });
  const probe = await page.evaluate(() => {
    const de = document.documentElement;
    const main = document.querySelector("main");
    const chart = document.querySelector('[data-testid="area-chart"]');
    const bars = Array.from(document.querySelectorAll('[data-testid="revenue-by-method"] li div.h-1\\.5 > div')).map(
      (b) => b.getBoundingClientRect().width,
    );
    return {
      docScrollW: de.scrollWidth,
      clientW: de.clientWidth,
      mainScrollW: main ? main.scrollWidth : null,
      chartRight: chart ? Math.round(chart.getBoundingClientRect().right) : null,
      barCount: bars.length,
      barsPositive: bars.every((w) => w > 0),
    };
  });
  if (probe.docScrollW > probe.clientW || probe.mainScrollW > probe.clientW || probe.chartRight > probe.clientW || probe.barCount < 2 || !probe.barsPositive) {
    console.error("CAPTURE 103 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  await expect(page.getByTestId("stat-total-revenue")).toHaveText(expected.fmt(expected.revenue));
  console.log("103 reports-mobile containment verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/103-session22-reports-withdata-390.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 104: the mobile drawer at 390 (the operator's priority surface) ----
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
    console.error("CAPTURE 104 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("104 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/104-session22-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-22 evidence captured: 102-104");

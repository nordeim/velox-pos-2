// Session-20 evidence captures: the four-width drift-sweep tier's surfaces.
// Runs against the dev server (:3000) running the remediated codebase.
//
// Standing tier note: the drift-sweep class is STANDING-pinned in the e2e
// suite itself (tests/e2e/viewport-drift-sweep.spec.ts — the battery + the
// with-data containment guard run on every `bun run test:e2e`). This script
// is the cycle's evidence-capture record (the s19 family posture —
// self-provisioning fixture, re-runnable on a fresh db): screenshots 96-98.
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

// The with-data fixture (the s19 provisionFixture posture, idempotent-ish)
async function provisionFixture(page) {
  const cats = await (await page.request.get(`${BASE}/api/categories`)).json();
  let catId = cats.find((c) => c.name === "Drift Sweep")?.id;
  if (!catId) {
    const cat = await page.request.post(`${BASE}/api/categories`, { data: { name: "Drift Sweep" } });
    catId = (await cat.json()).id;
  }
  const prods = await (await page.request.get(`${BASE}/api/products`)).json();
  if (!prods.some((p) => p.name === "Drift Sweep Cola")) {
    await page.request.post(`${BASE}/api/products`, {
      data: { name: "Drift Sweep Cola", price: 2.5, categoryId: catId, stock: 50, minStock: 2, barcode: "DSWEEP-390", taxRate: 0 },
    });
  }
}

const browser = await chromium.launch();
mkdirSync(OUT, { recursive: true });

// ---- capture 96: the with-data ledger contained at 390 (the M-109c1 guard surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await provisionFixture(page);
  await page.goto(BASE + "/Inventory");
  await page.waitForLoadState("networkidle");
  await page.locator("table tbody tr").filter({ hasText: "Drift Sweep Cola" }).first().waitFor({ state: "visible", timeout: 15000 });
  // verify the containment live (the F-116 pin posture) then capture
  const probe = await page.evaluate(() => {
    const table = document.querySelector("table");
    const container = table ? table.closest(".vpx-scroll") : null;
    let functionalScroll = false;
    if (container) {
      container.scrollLeft = 50;
      functionalScroll = container.scrollLeft > 0;
      container.scrollLeft = 0;
    }
    return { mainScrollW: document.querySelector("main").scrollWidth, clientW: document.documentElement.clientWidth, functionalScroll };
  });
  if (probe.mainScrollW > probe.clientW || !probe.functionalScroll) {
    console.error("CAPTURE 96 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("96 containment verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/96-session20-inventory-contained-390.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 97: the md chrome switch at 768 (the sidebar + the 380px cart rail) ----
{
  const ctx = await browser.newContext({ viewport: { width: 768, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/POS");
  await page.waitForLoadState("networkidle");
  // verify the chrome + the cart rail live, then capture
  const probe = await page.evaluate(() => {
    const aside = document.querySelector('[data-testid="app-sidebar"]');
    const cart = document.querySelector('[data-testid="cart-panel"]');
    const burger = [...document.querySelectorAll("button")].find((b) => /menu/i.test(b.getAttribute("aria-label") || ""));
    return {
      sidebarVisible: aside ? aside.offsetParent !== null : false,
      cartW: cart ? Math.round(cart.getBoundingClientRect().width) : null,
      burgerGone: burger ? burger.offsetParent === null : true,
      docScrollW: document.documentElement.scrollWidth,
    };
  });
  if (!probe.sidebarVisible || !probe.burgerGone || probe.cartW !== 380 || probe.docScrollW > 768) {
    console.error("CAPTURE 97 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("97 md-switch verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/97-session20-pos-md-rail-768.png`, fullPage: false });
  await ctx.close();
}

// ---- capture 98: the mobile drawer at 390 (the operator's priority surface) ----
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
    console.error("CAPTURE 98 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("98 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/98-session20-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log("Session-20 evidence captured: 96-98");

// Session-27 evidence captures: the Cashiers shift-ledger walk's surfaces
// (F-125). Runs against the dev server (:3000) running the remediated
// codebase.
//
// Standing tier note: the ledger walk is STANDING-pinned in the e2e suite
// itself (tests/e2e/with-data-cashiers-ledger-walk.spec.ts — the closed-row
// + active-polarity tests run on every `bun run test:e2e`). This script is
// the cycle's evidence-capture record (the s19..s26 family posture —
// self-provisioning fixture, re-runnable): screenshots 117-119.
//
// The fixture mirrors the spec's chain (the "Cashiers Ledger Walk" category/
// product/register + shift lifecycle — idempotent, POSTs asserted) and the
// ANALYZE journey: the CLOSED ledger row with both sales joined (117), the
// ACTIVE row's Abierto polarity (118), and this cycle's mobile drawer
// capture at 390 (119 — the operator's priority surface). The self-clean
// closes both shifts with exact-variance counts and deletes nothing (the
// fixtures are idempotent by name, the s20..s26 posture).
//
// The API legs ride bun's NATIVE fetch (the Session-26 law: playwright-core's
// APIRequestContext set-cookie parsing crashes under bun; the suite is immune
// — it runs under the node runner). The self-clean's PrismaClient takes the
// ABSOLUTE datasource URL (the documented relative-URL quirk).
import { chromium, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const CATEGORY_NAME = "Cashiers Ledger Walk";
const PRODUCT_NAME = "Ledger Walk Coffee";
const PRODUCT_BARCODE = "CWALK-390";
const PRODUCT_PRICE = 4.5;
const REGISTER_NAME = "Ledger Walk Register";
const OPENING_FLOAT = 50;

if (!existsSync("db/custom.db")) {
  console.error("the dev db is absent — run bun run db:push && bun run db:seed first");
  process.exit(1);
}

const browser = await chromium.launch();

// bun-native fetch (the Session-26 law) — status codes + JSON only.
const post = async (path, data) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const patch = async (path, data) => {
  const res = await fetch(BASE + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const get = async (path) => {
  const res = await fetch(BASE + path);
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
{
  // The auth cookie for the API legs (login through the API; the cookie jar
  // is per-fetch-managed below via a captured set-cookie header).
  const loginRes = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "sepnetflix2023@outlook.com", password: "$Abcd1234" }),
  });
  if (loginRes.status !== 200) {
    console.error("fixture login failed:", loginRes.status);
    process.exit(1);
  }
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0] ?? "";
  const authedGet = async (path) => {
    const res = await fetch(BASE + path, { headers: { cookie } });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  const authedPost = async (path, data) => {
    const res = await fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify(data),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  const authedPatch = async (path, data) => {
    const res = await fetch(BASE + path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify(data),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };

  // Provision (idempotent).
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

  // The evidence chain: an active shift (for 118) → a sale → capture the
  // ACTIVE row first → close → capture the CLOSED row (117). One chain, two
  // states — the newest row is always the evidence row.
  const active = (await authedGet("/api/shifts?status=active")).body.find(
    (s) => s.registerId === registerId,
  );
  let shiftId = active?.id;
  if (!shiftId) {
    const r = await authedPost("/api/shifts", { registerId, openingFloat: OPENING_FLOAT });
    if (r.status !== 200 && r.status !== 201) { console.error("shift failed", r.status); process.exit(1); }
    shiftId = r.body.id;
  }

  // A sale on the active shift (idempotent per run: one sale per open shift —
  // check the ledger's count first).
  const sales = (await authedGet("/api/sales")).body.filter((s) => s.shiftId === shiftId);
  if (sales.length === 0) {
    const r = await authedPost("/api/sales", {
      items: [{ productId: prodId, name: PRODUCT_NAME, price: PRODUCT_PRICE, qty: 2, taxRate: 0 }],
      paymentMethod: "cash", amountPaid: 20, customer: "Ledger Walk Evidence",
    });
    if (r.status !== 200 && r.status !== 201) { console.error("sale failed", r.status); process.exit(1); }
  }
  console.log("fixture verified: the active shift carries the evidence sale");

  // ---- 118: the ACTIVE row (the Abierto polarity) -----------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(BASE + "/Cashiers");
    const row = page.locator("table tbody tr").filter({ hasText: REGISTER_NAME }).first();
    await row.waitFor({ state: "visible", timeout: 15000 });
    const cells = row.locator("td");
    await expect(cells.nth(3)).toHaveText("—");
    await expect(cells.nth(4)).toHaveText("$9.00 (1)");
    await expect(cells.nth(5)).toHaveText("Abierto");
    await page.screenshot({ path: `${OUT}/118-session27-ledger-abierto.png`, fullPage: false });
    console.log("118 active-row verified: — · $9.00 (1) · Abierto");
    await ctx.close();
  }

  // The close (exact variance: float 50 + the $9.00 cash sale).
  const closeResp = await authedPatch(`/api/shifts/${shiftId}`, { countedCash: 59 });
  if (closeResp.status !== 200 || closeResp.body.status !== "closed") {
    console.error("close failed:", closeResp.status, JSON.stringify(closeResp.body));
    process.exit(1);
  }

  // ---- 117: the CLOSED row (the four-way join, both states one chain) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await login(page);
    await page.goto(BASE + "/Cashiers");
    const row = page.locator("table tbody tr").filter({ hasText: REGISTER_NAME }).first();
    await row.waitFor({ state: "visible", timeout: 15000 });
    const cells = row.locator("td");
    const finText = await cells.nth(3).textContent();
    if (!/^\d{2}:\d{2}$/.test(finText?.trim() ?? "")) {
      console.error("CAPTURE 117 VERIFICATION FAILED: FIN =", finText);
      process.exit(1);
    }
    await expect(cells.nth(4)).toHaveText("$9.00 (1)");
    await expect(cells.nth(5)).toHaveText("Cerrado");
    await expect(page.getByRole("columnheader", { name: "Cajero", exact: true })).toBeVisible();
    await page.screenshot({ path: `${OUT}/117-session27-ledger-cerrado.png`, fullPage: false });
    console.log("117 closed-row verified: FIN", finText.trim(), "· $9.00 (1) · Cerrado + the headers");
    await ctx.close();
  }

  // The self-clean verification (state, not exit codes): zero active shifts
  // on the walk's register — "No active shift" stays true for the parity pins.
  const activeAfter = (await authedGet("/api/shifts?status=active")).body.filter(
    (s) => s.registerId === registerId,
  );
  if (activeAfter.length !== 0) {
    console.error("SELF-CLEAN VERIFICATION FAILED:", activeAfter.length, "active shifts remain");
    process.exit(1);
  }
  console.log("self-clean verified: the evidence shift closed (exact variance), zero active");
}

// ---- capture 119: the mobile drawer at 390 (the operator's priority) -----
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
    return {
      w: Math.round(d.getBoundingClientRect().width),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  if (probe.w !== 288 || probe.overflow) {
    console.error("CAPTURE 119 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("119 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/119-session27-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();

// The dev-db ledger sanity (the absolute-URL law).
{
  const db = new PrismaClient({
    datasources: { db: { url: `file:${process.cwd()}/db/custom.db` } },
  });
  const active = await db.cashierShift.count({ where: { status: "active" } });
  console.log("dev-db ledger sanity: active shifts =", active);
  await db.$disconnect();
}

console.log("Session-27 evidence captured: 117-119");

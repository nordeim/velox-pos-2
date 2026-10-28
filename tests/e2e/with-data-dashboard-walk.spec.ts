import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-23 (F-121): the with-data Dashboard walk — the app's landing view,
// and the only major surface whose value is computed from BOTH the sales
// ledger AND the product/category collections, gets its with-data tier.
// Before this spec every Dashboard pin was empty-state: surfaces.spec pins
// the empty stat labels/chips/styles and the section-heading levels; the
// Session-20 drift-sweep battery covers /Dashboard at all four audit widths
// EMPTY (data-agnostic containment only); the s18 evidence harness pins the
// with-data stats/chart/categories at 1440 — but in the EVIDENCE tier, on
// the demo db, OUTSIDE the suite, and NOTHING pins the with-data shape at
// 390/768/1024 anywhere. The CHAIN this spec pins — the API's sales list →
// the store's `sales` collection → `summarize(sales, 1)` → the stat testids;
// the products/categories APIs → `products.length`/`lowStockCount` → the
// stat + category-breakdown rows; `dailySeries(sales, 7)` → the chart's
// weekday labels + the niceScale domain covering the today bucket — was
// e2e-invisible: a store-wiring regression of the F-118 genus (a second
// writer clobbering `sales`), a lost StatCard testid, a `lowStockCount`
// wiring break, a category row that stops rendering when data exists, or a
// with-data containment break at 390/768/1024 would ALL have passed.
//
// The ANALYZE facts this spec transcribes (the V16 probes, measured live on
// the dev server before the spec was written, warm db 3 sales / 2 products /
// 2 categories): the stats render EXACTLY "$14.75 / 3 / 2 / 0" through the
// live stat-today-s-sales/stat-transactions/stat-products/stat-low-stock
// testids; the chart's y-ticks 0/5/10/15 (niceScale — the top tick 15
// COVERS the $14.75 data) with weekday x-labels ending on TODAY; the
// category rows render with their share bars; the surface contains with
// data at all four widths (390: chart right 353; 768: sidebar 220, chart
// 474; 1024: sidebar 220, chart 714).
//
// The exact-value pin's red is by construction: the expected values are
// DERIVED FROM THE API'S OWN RESPONSES at runtime (never hardcoded — the
// s18/s22 volatile-expectation law), so any link in the chain that breaks
// flips the equality. The chart-domain pin's red is the Session-15 F-107
// record: the pre-fix domain top sat BELOW the data peak.
//
// The reference itself cannot produce this state (its demo account is
// write-restricted; measured live Session-22 and re-verified Session-23:
// $0.00 stats, 2× "No data for this period") — the with-data tier is a
// functional-SUPERSET addition, the s20/s21/s22 lineage.
//
// FILE-NAME ORDERING IS LOAD-BEARING: this spec sorts AFTER
// surfaces/terminal/viewport-drift-sweep (v < w) and BEFORE
// with-data-reports-walk (d < r) in the chromium project — every empty-state
// pin of what it creates (surfaces.spec's empty-Reports "No data for this
// period") runs BEFORE its data exists, and the reports walk derives its
// own expectations from the API at runtime (robust to this spec's extra
// sale by design). The mobile project runs after chromium: its POS gate
// needs NO active shift, which this spec's self-clean guarantees.
// ---------------------------------------------------------------------------

// The fixture: one category, one product (an "ok" stock status — it never
// perturbs the Low Stock derivation), one register, one shift, ONE cash
// sale. Idempotent on re-runs against a warm db.
const PRODUCT_NAME = "Dashboard Walk Coffee";
const PRODUCT_BARCODE = "DWALK-390";
const PRODUCT_PRICE = 3.25;
const REGISTER_NAME = "Dashboard Walk Register";
const CUSTOMER = "Dashboard Walk";

type SaleRow = { total: number; status: string; customer: string | null; createdAt: string };
type ProductRow = { id: string; name: string; barcode: string; categoryId: string | null; stock: number; minStock: number; active: boolean };
type CategoryRow = { id: string; name: string; color: string };

async function json(r: { json: () => Promise<unknown> }) {
  return r.json() as Promise<any>;
}

async function provision(page: Page): Promise<void> {
  const cats = (await json(await page.request.get("/api/categories"))) as CategoryRow[];
  let catId = cats.find((c) => c.name === "Dashboard Walk")?.id;
  if (!catId) {
    const resp = await page.request.post("/api/categories", { data: { name: "Dashboard Walk" } });
    // A provisioning POST ASSERTS its response (the F-120 lesson): a silent
    // 400 makes every downstream wait vacuous.
    expect(resp.ok(), `the fixture category must create (got ${resp.status()})`).toBe(true);
    catId = (await json(resp)).id;
  }

  const prods = (await json(await page.request.get("/api/products"))) as ProductRow[];
  let prodId = prods.find((p) => p.barcode === PRODUCT_BARCODE)?.id;
  if (!prodId) {
    const resp = await page.request.post("/api/products", {
      data: {
        name: PRODUCT_NAME,
        price: PRODUCT_PRICE,
        categoryId: catId,
        stock: 10,
        minStock: 2,
        barcode: PRODUCT_BARCODE,
        taxRate: 0,
      },
    });
    expect(resp.ok(), `the fixture product must create (got ${resp.status()})`).toBe(true);
    prodId = (await json(resp)).id;
  }
  expect(prodId, "the fixture product id must resolve").toBeTruthy();

  const regs = await json(await page.request.get("/api/registers"));
  let reg = regs.find((r: { name: string }) => r.name === REGISTER_NAME);
  if (!reg) {
    const resp = await page.request.post("/api/registers", {
      data: { name: REGISTER_NAME, openingFloat: 100 },
    });
    expect(resp.ok(), `the fixture register must create (got ${resp.status()})`).toBe(true);
    reg = await json(resp);
  }

  const sales = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const hasSale = sales.some((s) => s.customer === CUSTOMER);

  // The checkout pins to the user's LATEST active shift — only open one (and
  // provision the sale) when the fixture is missing on this db.
  if (!hasSale) {
    const active = await json(await page.request.get("/api/shifts?status=active"));
    let shift = active.find((s: { registerId: string }) => s.registerId === reg.id);
    if (!shift) {
      const resp = await page.request.post("/api/shifts", {
        data: { registerId: reg.id, openingFloat: 100 },
      });
      expect(resp.ok(), `the fixture shift must create (got ${resp.status()})`).toBe(true);
      shift = await json(resp);
    }
    // The sale-item contract carries the line's own name/price/qty/taxRate
    // (server-authoritative pricing re-reads the product row regardless).
    const resp = await page.request.post("/api/sales", {
      data: {
        items: [
          {
            productId: prodId,
            name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            qty: 2,
            taxRate: 0,
          },
        ],
        paymentMethod: "cash",
        amountPaid: 20,
        customer: CUSTOMER,
      },
    });
    expect(resp.ok(), `the fixture sale must create (got ${resp.status()})`).toBe(true);
    // Self-clean (the terminal.spec/drift-sweep/reports-walk law): an ACTIVE
    // shift leaks into every downstream spec's POS gate (the mobile project
    // runs after chromium). countedCash = the float + the fixture's cash
    // revenue → an exact variance. A closed shift still renders the Cashiers
    // ledger row.
    if (shift.status === "active") {
      await page.request.patch(`/api/shifts/${shift.id}`, {
        data: { countedCash: 106.5 },
      });
    }
  }
}

type Expected = {
  revenue: number;
  transactions: number;
  products: number;
  lowStock: number;
  catRows: Array<{ name: string; count: number; pct: number }>;
  todayWeekday: string;
  fmt: (n: number) => string;
};

// The expected values are DERIVED FROM THE APIs at runtime — the exact
// wiring pin mirrors the view's own math: `summarize(sales, 1)` filters
// status==="completed" AND created within TODAY's calendar bucket (the
// `inPeriod(sale, 1, now)` semantics: created >= today's local midnight and
// <= now — `periodStart` sets 00:00:00 then subtracts days-1=0); the Low
// Stock mirror is `stockStatus`'s "ok" condition inverted (active && NOT
// (stock > 0 && stock > minStock)); the category rows mirror the view's
// own derivation (count > 0, count-desc, "Uncategorized" appended). The
// scratch db is fresh per run (global-setup deletes + re-provisions before
// boot), so every sale is created TODAY — the today bucket is the full
// completed set by construction.
async function deriveExpected(page: Page): Promise<Expected> {
  const sales = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const products = (await json(await page.request.get("/api/products"))) as ProductRow[];
  const categories = (await json(await page.request.get("/api/categories"))) as CategoryRow[];

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const now = new Date();
  const todayRows = sales.filter((s) => {
    if (s.status !== "completed") return false;
    const created = new Date(s.createdAt);
    return created >= midnight && created <= now;
  });
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const revenue = round2(todayRows.reduce((sum, s) => sum + s.total, 0));

  const lowStock = products.filter(
    (p) => p.active && !(p.stock > 0 && p.stock > p.minStock),
  ).length;

  const total = products.length;
  const rows = categories
    .map((c) => ({
      name: c.name,
      count: products.filter((p) => p.categoryId === c.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const uncategorized = products.filter((p) => !p.categoryId).length;
  if (uncategorized > 0) rows.push({ name: "Uncategorized", count: uncategorized });
  const catRows = rows.map((r) => ({
    ...r,
    pct: total > 0 ? Math.round((r.count / total) * 100) : 0,
  }));

  // The chart's 7-day window ends on today — the last x-label is today's
  // weekday abbreviation (the view's own `toLocaleString("en-US", {
  // weekday: "short" })` form).
  const todayWeekday = now.toLocaleString("en-US", { weekday: "short" });

  // formatMoney's USD contract: Intl en-US currency, 2 fraction digits.
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return { revenue, transactions: todayRows.length, products: total, lowStock, catRows, todayWeekday, fmt };
}

test.describe("the with-data Dashboard walk (Session-23, F-121)", () => {
  test("the Dashboard stats/chart/categories compute from the ledger with data (the exact wiring pin)", async ({
    page,
  }) => {
    await provision(page);
    const expected = await deriveExpected(page);
    // The fixture guarantees the with-data shape exists.
    expect(expected.transactions, "the fixture must guarantee at least one completed sale").toBeGreaterThanOrEqual(1);
    expect(expected.products, "the fixture must guarantee at least one product").toBeGreaterThanOrEqual(1);

    await page.goto("/Dashboard");
    // The settled wait is the WITH-DATA observable: the category breakdown
    // renders its ul only when products exist (the empty store renders "No
    // data yet" instead — never a timer, the s16 bootstrap-race lesson).
    await page.getByTestId("category-breakdown").waitFor({ state: "visible" });

    // The four stats — EXACT equality against the API-derived values. The
    // today pair mirrors summarize(sales, 1); Products/Low Stock mirror the
    // products API (length + the stockStatus "ok" inversion).
    await expect(page.getByTestId("stat-today-s-sales")).toHaveText(
      expected.fmt(expected.revenue),
    );
    await expect(page.getByTestId("stat-transactions")).toHaveText(
      String(expected.transactions),
    );
    await expect(page.getByTestId("stat-products")).toHaveText(
      String(expected.products),
    );
    await expect(page.getByTestId("stat-low-stock")).toHaveText(
      String(expected.lowStock),
    );

    // The category breakdown renders the DERIVED rows: each li carries its
    // name, its exact count (the font-semibold span), and a share bar whose
    // width is the count's percentage of the product total (a functional
    // render, not a class string — the behavior-not-implementation
    // doctrine).
    const breakdown = page.getByTestId("category-breakdown");
    await expect(breakdown.locator("li")).toHaveCount(expected.catRows.length);
    for (const r of expected.catRows) {
      const li = breakdown.locator("li").filter({ hasText: r.name });
      await expect(li, `${r.name}: the derived row must render`).toHaveCount(1);
      await expect(li.locator("span.font-semibold")).toHaveText(String(r.count));
      const barWidth = await li.locator("div.h-1\\.5 > div").getAttribute("style");
      expect(barWidth, `${r.name}: the share bar width`).toContain(`width: ${r.pct}%`);
    }

    // The chart's domain COVERS the data (the F-107 contract, live): the
    // topmost y-tick must sit at/above the today-bucket revenue. Every sale
    // in the fresh run-db is created today, so the today bucket IS the
    // series' max point. (The pre-F-107 bug drew the peak ABOVE the topmost
    // gridline — exactly the divergence this catches.) The tick texts mix
    // numbers and weekday labels — filter to strictly numeric before
    // reducing (the s18 mixed-tick lesson: Math.max over ["0","Wed"] is
    // NaN).
    const tickTexts = await page
      .getByTestId("line-chart")
      .locator("text")
      .allTextContents();
    const numericTicks = tickTexts
      .filter((t) => /^\d+(\.\d+)?$/.test(t.trim()))
      .map((t) => Number(t));
    expect(numericTicks.length, "the chart must render numeric y-ticks").toBeGreaterThan(0);
    const topTick = Math.max(...numericTicks);
    expect(
      topTick,
      `the chart's topmost tick (${topTick}) must cover the today revenue (${expected.revenue})`,
    ).toBeGreaterThanOrEqual(expected.revenue);

    // The 7-day window's right edge is TODAY: the last x-label is today's
    // weekday abbreviation (the dailySeries window's final bucket).
    expect(tickTexts[tickTexts.length - 1].trim()).toBe(expected.todayWeekday);
  });

  test("the with-data Dashboard contains at the remaining widths (768/1024/390, the chrome switch with data)", async ({
    page,
  }) => {
    await provision(page);

    // The md+ widths: the sidebar owns the chrome, the frame contains with
    // data. The drift-sweep battery visited these widths EMPTY only.
    for (const width of [768, 1024] as const) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/Dashboard", { waitUntil: "domcontentloaded" });
      await page.getByTestId("category-breakdown").waitFor({ state: "visible" });
      const probe = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector("main");
        return {
          docScrollW: de.scrollWidth,
          clientW: de.clientWidth,
          mainScrollW: main ? main.scrollWidth : null,
        };
      });
      expect(probe.docScrollW, `@${width}: the document must not overflow horizontally`).toBeLessThanOrEqual(
        probe.clientW,
      );
      expect(probe.mainScrollW, `@${width}: main must not overflow horizontally`).toBeLessThanOrEqual(
        probe.clientW,
      );
      // The chrome-switch contract, with data on the page (VISIBILITY pins —
      // `hidden md:flex` elements stay in the DOM below md; count would
      // lie, the AGENTS law).
      await expect(page.getByTestId("app-sidebar"), `@${width}: the sidebar owns the md+ chrome`).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Open navigation menu" }),
        `@${width}: the hamburger is hidden at md and above`,
      ).not.toBeVisible();
    }

    // The sub-md width: the hamburger owns the chrome, the frame AND the
    // chart/category surfaces stay inside the viewport with data.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Dashboard", { waitUntil: "domcontentloaded" });
    await page.getByTestId("category-breakdown").waitFor({ state: "visible" });
    const probe = await page.evaluate(() => {
      const de = document.documentElement;
      const main = document.querySelector("main");
      const chart = document.querySelector('[data-testid="line-chart"]');
      const cats = document.querySelector('[data-testid="category-breakdown"]');
      return {
        docScrollW: de.scrollWidth,
        clientW: de.clientWidth,
        mainScrollW: main ? main.scrollWidth : null,
        chartRight: chart ? Math.round(chart.getBoundingClientRect().right) : null,
        catsRight: cats ? Math.round(cats.getBoundingClientRect().right) : null,
      };
    });
    expect(probe.docScrollW, "@390: the document must not overflow horizontally").toBeLessThanOrEqual(
      probe.clientW,
    );
    expect(probe.mainScrollW, "@390: main must not overflow horizontally").toBeLessThanOrEqual(
      probe.clientW,
    );
    expect(probe.chartRight, "@390: the with-data chart stays inside the viewport").toBeLessThanOrEqual(390);
    expect(probe.catsRight, "@390: the category breakdown stays inside the viewport").toBeLessThanOrEqual(390);
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
      "@390: the hamburger owns the sub-md chrome",
    ).toBeVisible();
    await expect(page.getByTestId("app-sidebar"), "@390: the sidebar is hidden below md").not.toBeVisible();
  });
});

import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-22 (F-119): the with-data Reports walk — the surface whose entire
// value is COMPUTED from the sales ledger finally gets its with-data tier.
// Before this spec every Reports pin was empty-state: surfaces.spec pins the
// "$0.00"-era copy, pills, and "No data for this period" empties; the
// Session-20 drift-sweep battery covers /Reports at all four audit widths
// EMPTY only. The CHAIN this spec pins — the API's sales list → the store's
// collection → the memoized summarize/dailySeries/byMethod values → the DOM
// — was e2e-invisible: a store-wiring regression of the F-118 genus (a
// second writer clobbering the sales collection), a lost data-testid, a
// MethodTable that stops rendering when data exists, a chart domain that
// stops covering its data (the Session-15 F-107 class), or a with-data
// containment break at 390 would ALL have passed the suite.
//
// The ANALYZE facts this spec transcribes (the V17 probes, measured live on
// the dev server before the spec was written): the stats render EXACTLY the
// API-derived values ($9.75 / 2 / $4.88 for the fixture's cash+card pair);
// BOTH method tables render with the share bars (cash 67% emerald first,
// card 33% violet — revenue-desc); the chart's topmost y-tick ($10) covers
// the today-bucket revenue ($9.75); at 390 the surface contains (doc/main
// 390/390, the chart right edge 353, the bars 212/104px).
//
// The exact-value pin's red is by construction: the expected values are
// DERIVED FROM THE API'S OWN RESPONSE at runtime (never hardcoded — the s18
// harness's volatile-expectation lesson), so any link in the chain that
// breaks flips the equality. The chart-domain pin's red is the Session-15
// F-107 record: the pre-fix domain top sat BELOW the data peak — exactly
// the divergence the ≥ assertion catches.
//
// The reference itself cannot produce this state (its demo account is
// write-restricted; measured live Session-22: $0.00 stats, 2× "No data for
// this period") — the with-data tier is a functional-SUPERSET addition,
// the s20/s21 with-data lineage.
//
// FILE-NAME ORDERING IS LOAD-BEARING: this spec sorts LAST in the chromium
// project (after surfaces.spec) because it PERSISTS sales — surfaces.spec's
// empty-state Reports pin ("No data for this period" visible) must run
// BEFORE this spec's data exists. The drift-sweep battery and every other
// spec are data-agnostic. The mobile project runs after chromium: its POS
// gate needs NO active shift, which this spec's self-clean guarantees.
// ---------------------------------------------------------------------------

// The fixture: one product, one register, one shift, TWO sales (cash + card
// — the byMethod two-row shape). Idempotent on re-runs against a warm db.
const PRODUCT_NAME = "Reports Walk Coffee";
const PRODUCT_BARCODE = "RWALK-390";
const PRODUCT_PRICE = 3.25;
const REGISTER_NAME = "Reports Walk Register";
const CASH_CUSTOMER = "Reports Walk Cash";
const CARD_CUSTOMER = "Reports Walk Card";

type SaleRow = {
  total: number;
  paymentMethod: string;
  status: string;
  customer: string | null;
};

async function provision(page: Page): Promise<void> {
  const json = (r: { json: () => Promise<unknown> }) => r.json() as Promise<any>;

  const cats = await json(await page.request.get("/api/categories"));
  let catId = cats.find((c: { name: string }) => c.name === "Reports Walk")?.id;
  if (!catId) {
    catId = (
      await json(
        await page.request.post("/api/categories", { data: { name: "Reports Walk" } }),
      )
    ).id;
  }

  const prods = await json(await page.request.get("/api/products"));
  let prodId = prods.find((p: { barcode: string }) => p.barcode === PRODUCT_BARCODE)?.id;
  if (!prodId) {
    prodId = (
      await json(
        await page.request.post("/api/products", {
          data: {
            name: PRODUCT_NAME,
            price: PRODUCT_PRICE,
            categoryId: catId,
            stock: 50,
            minStock: 2,
            barcode: PRODUCT_BARCODE,
            taxRate: 0,
          },
        }),
      )
    ).id;
  }

  const regs = await json(await page.request.get("/api/registers"));
  let reg = regs.find((r: { name: string }) => r.name === REGISTER_NAME);
  if (!reg) {
    reg = await json(
      await page.request.post("/api/registers", {
        data: { name: REGISTER_NAME, openingFloat: 100 },
      }),
    );
  }

  const sales = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const hasCash = sales.some((s) => s.customer === CASH_CUSTOMER);
  const hasCard = sales.some((s) => s.customer === CARD_CUSTOMER);

  // The checkout pins to the user's LATEST active shift — only open one (and
  // provision sales) when the fixture is missing on this db.
  if (!hasCash || !hasCard) {
    const active = await json(await page.request.get("/api/shifts?status=active"));
    let shift = active.find((s: { registerId: string }) => s.registerId === reg.id);
    if (!shift) {
      shift = await json(
        await page.request.post("/api/shifts", {
          data: { registerId: reg.id, openingFloat: 100 },
        }),
      );
    }
    // The sale-item contract carries the line's own name/price/qty/taxRate
    // (server-authoritative pricing re-reads the product row regardless).
    if (!hasCash) {
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
          customer: CASH_CUSTOMER,
        },
      });
      // A provisioning POST ASSERTS its response (the F-120 lesson): a
      // silent 400 makes every downstream wait vacuous.
      expect(resp.ok(), `the cash fixture sale must create (got ${resp.status()})`).toBe(true);
    }
    if (!hasCard) {
      // The card contract takes no amountPaid (no change computation).
      const resp = await page.request.post("/api/sales", {
        data: {
          items: [
            {
              productId: prodId,
              name: PRODUCT_NAME,
              price: PRODUCT_PRICE,
              qty: 1,
              taxRate: 0,
            },
          ],
          paymentMethod: "card",
          customer: CARD_CUSTOMER,
        },
      });
      expect(resp.ok(), `the card fixture sale must create (got ${resp.status()})`).toBe(true);
    }
    // Self-clean (the terminal.spec/drift-sweep law): an ACTIVE shift leaks
    // into every downstream spec's POS gate (the mobile project runs after
    // chromium). countedCash = the float + the fixture's cash revenue → an
    // exact variance. A closed shift still renders the Cashiers row.
    if (shift.status === "active") {
      await page.request.patch(`/api/shifts/${shift.id}`, {
        data: { countedCash: 106.5 },
      });
    }
  }
}

// The expected values are DERIVED FROM THE API at runtime — the exact wiring
// pin mirrors the view's own math (summarize/byMethod): filter completed,
// round2 the sums, revenue-desc, share = method/total. The scratch db is
// fresh per run (global-setup deletes + re-provisions before boot), so every
// sale is created TODAY — inside every period window by construction.
type Expected = {
  revenue: number;
  transactions: number;
  avgTicket: number;
  methods: Array<{ method: string; revenue: number; count: number; pct: number }>;
  fmt: (n: number) => string;
};

async function deriveExpected(page: Page): Promise<Expected> {
  const json = (r: { json: () => Promise<unknown> }) => r.json() as Promise<any>;
  const sales = (await json(await page.request.get("/api/sales"))) as SaleRow[];
  const done = sales.filter((s) => s.status === "completed");
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const revenue = round2(done.reduce((sum, s) => sum + s.total, 0));
  const totals = new Map<string, { revenue: number; count: number }>();
  for (const s of done) {
    const e = totals.get(s.paymentMethod) ?? { revenue: 0, count: 0 };
    e.revenue = round2(e.revenue + s.total);
    e.count += 1;
    totals.set(s.paymentMethod, e);
  }
  const methods = Array.from(totals.entries())
    .map(([method, v]) => ({
      method,
      revenue: v.revenue,
      count: v.count,
      pct: Math.round(revenue > 0 ? (v.revenue / revenue) * 100 : 0),
    }))
    .sort((a, b) => b.revenue - a.revenue);
  // formatMoney's USD contract: Intl en-US currency, 2 fraction digits.
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  return {
    revenue,
    transactions: done.length,
    avgTicket: done.length > 0 ? round2(revenue / done.length) : 0,
    methods,
    fmt,
  };
}

test.describe("the with-data Reports walk (Session-22, F-119)", () => {
  test("the Reports stats compute from the ledger with data (the exact wiring pin)", async ({
    page,
  }) => {
    await provision(page);
    const expected = await deriveExpected(page);
    // The fixture guarantees BOTH methods exist (the two-row shape).
    expect(
      expected.methods.map((m) => m.method).sort(),
      "the fixture must provision a cash AND a card sale",
    ).toEqual(["card", "cash"]);
    expect(expected.transactions).toBeGreaterThanOrEqual(2);

    await page.goto("/Reports");
    // The settled wait is the WITH-DATA observable: the method list renders
    // only when data exists (the empty store renders "No data for this
    // period" instead — never a timer, the s16 bootstrap-race lesson).
    await page.getByTestId("revenue-by-method").waitFor({ state: "visible" });

    // The three stats — EXACT equality against the API-derived values.
    await expect(page.getByTestId("stat-total-revenue")).toHaveText(
      expected.fmt(expected.revenue),
    );
    await expect(page.getByTestId("stat-transactions")).toHaveText(
      String(expected.transactions),
    );
    await expect(page.getByTestId("stat-avg-ticket")).toHaveText(
      expected.fmt(expected.avgTicket),
    );

    // Both method tables render (the empty state is gone) with the exact
    // rows: the SOURCE-case method name (textContent — CSS capitalizes
    // visually), the count, the revenue, and the share. The
    // revenue-by-method table carries the share spans; breakdown does not.
    const revenueList = page.getByTestId("revenue-by-method");
    await expect(revenueList.locator("li")).toHaveCount(expected.methods.length);
    for (const m of expected.methods) {
      const li = revenueList.locator("li").filter({ hasText: m.method });
      // The method-name span CONTAINS the count span as a child (the name is
      // a bare text node between the dot and the count) — the exact
      // textContent is the composite "cash(1)" (SOURCE case; CSS capitalizes
      // visually).
      await expect(li.locator("span.capitalize")).toHaveText(
        `${m.method}(${m.count})`,
      );
      await expect(li.locator("span.font-bold")).toContainText(expected.fmt(m.revenue));
      await expect(li.locator("span.font-bold > span")).toHaveText(`${m.pct}%`);
      // The share bar's width is the share percentage (a functional render,
      // not a class string — the behavior-not-implementation doctrine).
      const barWidth = await li.locator("div.h-1\\.5 > div").getAttribute("style");
      expect(barWidth, `${m.method}: the share bar width`).toContain(`width: ${m.pct}%`);
    }
    const breakdownList = page.getByTestId("breakdown-by-method");
    await expect(breakdownList.locator("li")).toHaveCount(expected.methods.length);
    for (const m of expected.methods) {
      const li = breakdownList.locator("li").filter({ hasText: m.method });
      await expect(li.locator("span.font-bold")).toHaveText(expected.fmt(m.revenue));
      // The breakdown table carries NO share span (only the count + revenue).
      await expect(li.locator("span.font-bold > span")).toHaveCount(0);
    }

    // The chart's domain COVERS the data (the F-107 contract, live): the
    // topmost y-tick must sit at/above the today-bucket revenue. Every sale
    // in the fresh run-db is created today, so the today bucket IS the full
    // revenue. (The pre-F-107 bug drew the peak ABOVE the topmost gridline —
    // exactly the divergence this catches.)
    const ticks = await page.locator('[data-testid="area-chart"] text').allTextContents();
    const moneyTicks = ticks
      .filter((t) => /^\$[\d.]+$/.test(t))
      .map((t) => Number(t.slice(1)));
    expect(moneyTicks.length).toBeGreaterThan(0);
    expect(Math.max(...moneyTicks)).toBeGreaterThanOrEqual(Math.ceil(expected.revenue));

    // The period switch must not LOSE data: every sale is inside the 7-day
    // window too, so the stats are period-invariant across the pills here.
    await page.getByRole("button", { name: "7 days" }).click();
    await expect(page.getByRole("button", { name: "7 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByTestId("stat-transactions")).toHaveText(
      String(expected.transactions),
    );
    await expect(page.getByTestId("stat-total-revenue")).toHaveText(
      expected.fmt(expected.revenue),
    );
  });

  test("the with-data Reports surface stays contained at 390", async ({ page }) => {
    await provision(page);
    const expected = await deriveExpected(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/Reports");
    await page.getByTestId("revenue-by-method").waitFor({ state: "visible" });

    const probe = await page.evaluate(() => {
      const de = document.documentElement;
      const main = document.querySelector("main");
      const chart = document.querySelector('[data-testid="area-chart"]');
      const chartRect = chart ? chart.getBoundingClientRect() : null;
      const bars = Array.from(
        document.querySelectorAll(
          '[data-testid="revenue-by-method"] li div.h-1\\.5 > div',
        ),
      ).map((b) => b.getBoundingClientRect().width);
      return {
        docScrollW: de.scrollWidth,
        clientW: de.clientWidth,
        mainScrollW: main ? main.scrollWidth : null,
        chartRight: chartRect ? chartRect.right : null,
        barWidths: bars,
      };
    });
    expect(
      probe.docScrollW,
      "the document must stay contained at 390 with data",
    ).toBeLessThanOrEqual(probe.clientW);
    expect(
      probe.mainScrollW,
      "main must stay contained at 390 with data",
    ).toBeLessThanOrEqual(probe.clientW);
    expect(
      probe.chartRight,
      "the chart's right edge must stay inside the 390 viewport",
    ).toBeLessThanOrEqual(probe.clientW);
    expect(probe.barWidths.length).toBeGreaterThanOrEqual(2);
    for (const [i, w] of probe.barWidths.entries()) {
      expect(w, `share bar ${i} must render with a real width at 390`).toBeGreaterThan(0);
    }

    // The stats still compute exactly at the mobile width (the wiring is
    // width-independent — re-assert the headline value).
    await expect(page.getByTestId("stat-total-revenue")).toHaveText(
      expected.fmt(expected.revenue),
    );
  });
});

import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The Terminal checkout journey: with the shift open (created here) and two
// products, the cart math, quantity controls, the cash charge with change,
// the ticket assignment, and the receipt — then Sales shows the row.
// ---------------------------------------------------------------------------

test.describe.serial("terminal checkout", () => {
  test.beforeAll(async ({ browser }) => {
    // Provision: two products + one register + an open shift (API-driven —
    // the UI paths are covered by their own specs; this is the fixture).
    const context = await browser.newContext({
      storageState: "tests/e2e/.auth/user.json",
    });
    const page = await context.newPage();
    const base = process.env.E2E_PORT ? `http://localhost:${process.env.E2E_PORT}` : "http://localhost:3100";

    const cat = await page.request.post(`${base}/api/categories`, {
      data: { name: "Checkout Cat", color: "#8b5cf6" },
    });
    const categoryId = (await cat.json()).id as string;

    const juice = await page.request.post(`${base}/api/products`, {
      data: {
        name: "Checkout Juice",
        barcode: "7500000000001",
        categoryId,
        price: 3.4,
        stock: 40,
        minStock: 8,
        taxRate: 16,
        unit: "Piece",
        active: true,
      },
    });
    const beans = await page.request.post(`${base}/api/products`, {
      data: {
        name: "Checkout Beans",
        barcode: "7500000000002",
        categoryId,
        price: 8.5,
        stock: 24,
        minStock: 5,
        taxRate: 16,
        unit: "Piece",
        active: true,
      },
    });
    void juice;
    void beans;

    const reg = await page.request.post(`${base}/api/registers`, {
      data: { name: "Terminal Reg", location: "Counter" },
    });
    await page.request.post(`${base}/api/shifts`, {
      data: { registerId: (await reg.json()).id as string, openingFloat: 50 },
    });
    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    // Leave the store clean for the projects that follow (the mobile suite
    // pins the Terminal's shift-gate parity — an open shift would hide it).
    const context = await browser.newContext({
      storageState: "tests/e2e/.auth/user.json",
    });
    const page = await context.newPage();
    const base = process.env.E2E_PORT ? `http://localhost:${process.env.E2E_PORT}` : "http://localhost:3100";
    const shifts = await (await page.request.get(`${base}/api/shifts?status=active`)).json();
    for (const shift of shifts as Array<{ id: string }>) {
      await page.request.patch(`${base}/api/shifts/${shift.id}`, {
        data: { countedCash: 0 },
      });
    }
    await context.close();
  });

  test("add products, adjust quantities, verify the cart math", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Add Checkout Juice to cart" }).click();
    await page.getByRole("button", { name: "Add Checkout Beans to cart" }).click();
    await page.getByRole("button", { name: "Add Checkout Juice to cart" }).click();

    const beansId = await page
      .getByTestId(/^qty-/)
      .first()
      .getAttribute("data-testid");
    void beansId;

    // Line math: juice 2 × $3.40 + beans 1 × $8.50 = $15.30 subtotal,
    // 16% tax → $17.75 total (cents-rounded at the edge).
    const charge = page.getByTestId("charge-button");
    await expect(charge).toContainText("CHARGE $17.75");

    // Quantity controls respond: juice 1 × $3.40 + $8.50 = $11.90 + 16%.
    await page.getByRole("button", { name: "Decrease Checkout Juice quantity" }).click();
    await expect(charge).toContainText("CHARGE $13.80");

    await page.getByRole("button", { name: "Remove Checkout Beans from cart" }).click();
    await expect(charge).toContainText("CHARGE $3.94");
  });

  test("adding a product shows the cart's Added banner, then it auto-collapses", async ({
    page,
  }) => {
    await page.goto("/POS");

    // The collapsed banner exists in the DOM (opacity-0 / max-h-0) per the
    // reference's cart DOM, but is invisible before the first add.
    const banner = page.getByTestId("added-banner");
    await expect(banner).toBeAttached();
    await expect(banner).not.toBeVisible();

    // Adding a product expands it: "ADDED" + the product name.
    await page.getByRole("button", { name: "Add Checkout Juice to cart" }).click();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Added");
    await expect(banner).toContainText("Checkout Juice");

    // It auto-collapses (the reference's transition-all duration-300 chip).
    await expect(banner).not.toBeVisible({ timeout: 10_000 });
  });

  test("cash checkout computes change and assigns the ticket", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Add Checkout Juice to cart" }).click();
    await page.getByTestId("charge-button").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Charge $3.94")).toBeVisible();
    // The Complete button is gated until the amount covers the total.
    await dialog.getByLabel("Amount received").fill("2");
    await expect(dialog.getByRole("button", { name: /Complete cash sale/ })).toBeDisabled();
    await dialog.getByLabel("Amount received").fill("5");
    await expect(dialog.getByTestId("change-due")).toContainText("$1.06");
    await dialog.getByRole("button", { name: /Complete cash sale/ }).click();

    // The receipt dialog: ticket T-000001, totals, footer.
    const receipt = page.getByRole("dialog");
    await expect(receipt.getByText("T-000001")).toBeVisible();
    await expect(receipt.getByText("Thank you for your purchase!")).toBeVisible();
    await receipt.getByRole("button", { name: "Close", exact: true }).first().click();

    // The cart resets after checkout.
    await expect(page.getByText("Scan or select products")).toBeVisible();
  });

  test("the sale lands in Historial de Ventas with Spanish copy", async ({ page }) => {
    await page.goto("/Sales");
    await expect(page.getByRole("heading", { name: "Historial de Ventas" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "T-000001", exact: true })).toBeVisible();
    await expect(page.getByText("Completada").first()).toBeVisible();
  });

  test("the stock decrement is reflected in Inventory", async ({ page }) => {
    await page.goto("/Inventory");
    const row = page.getByRole("row", { name: /Checkout Juice/ });
    await expect(row).toContainText("39");
  });

  test("the dashboard chart renders nice ticks with REAL data (the F-50 regression)", async ({
    page,
  }) => {
    // The Session-101 charts drew ONE y-axis label per dollar of revenue —
    // with this suite's sales the dashboard rendered ~20 stacked labels a few
    // pixels apart (an unreadable block; invisible while the e2e store was
    // empty). The F-50 fix renders ~5 nice ticks. Re-measured on the live
    // reference: Recharts-style axes (0,1,2,3,4 at ~60px spacing on its
    // empty dashboard; 12px fonts; weekday x labels).
    await page.goto("/Dashboard");
    const chart = page.getByTestId("line-chart");
    await expect(chart).toBeVisible();
    const axis = await chart.evaluate((svg) => {
      const texts = Array.from(svg.querySelectorAll("text")).map((t) => {
        const c = getComputedStyle(t);
        return { t: (t.textContent || "").trim(), x: Number(t.getAttribute("x")), fs: c.fontSize };
      });
      // The y-axis labels sit left of the plot's measured edge (x=65 —
      // Session-14 corrected the filter from the clone's own old pad 34 to
      // the reference-measured plot edge; valid for both geometries).
      const yLabels = texts.filter((t) => t.x < 65).map((t) => t.t);
      // The 7-day x axis renders weekday abbreviations (Tue..Mon).
      const xLabels = texts
        .filter((t) => t.x >= 65 && /^[A-Z][a-z]{2}$/.test(t.t))
        .map((t) => t.t);
      return { yLabels, xLabels, xFont: texts.find((t) => t.x >= 65)?.fs };
    });
    expect(axis.yLabels.length, "y-axis label count (nice ticks, not per-dollar)").toBeLessThan(8);
    expect(axis.yLabels[0]).toBe("0");
    expect(axis.xLabels.length).toBe(7);
    expect(axis.xLabels[0]).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    expect(axis.xFont).toBe("12px");
  });

  // ------------------------------------------------------------------------
  // Session-14 (F-95..F-101, measured live on the reference 2026-10-27 at
  // 1440×900): the Dashboard chart's INTERNAL contract — never measured in
  // any prior session (F-50 pinned only the tick discipline). The reference
  // ships an indigo-500 line over a slate grid/axes family with a gradient
  // area under it and ZERO data dots — the clone's violet/dotted/no-area
  // treatment was an unmeasured Session-101 assumption. All four pins are
  // data-independent (structure + color families); they ride this describe
  // so the chart renders with the checkout journey's real sales.
  // ------------------------------------------------------------------------

  test("the dashboard chart's line is the reference's indigo smooth family (F-95, F-100)", async ({
    page,
  }) => {
    await page.goto("/Dashboard");
    const chart = page.getByTestId("line-chart");
    await expect(chart).toBeVisible();
    const line = await chart.evaluate((svg) => {
      const paths = Array.from(svg.querySelectorAll("path"));
      const linePath = paths[paths.length - 1]; // the stroke path (the area renders first)
      const cs = linePath ? getComputedStyle(linePath) : null;
      return {
        pathCount: paths.length,
        stroke: cs?.stroke ?? null,
        widthAttr: linePath?.getAttribute("stroke-width") ?? null,
        fill: cs?.fill ?? null,
        d: linePath?.getAttribute("d") ?? "",
        circles: svg.querySelectorAll("circle").length,
      };
    });
    // F-95: indigo-500 rgb(99,102,241) at 2.5px — NOT the old violet #8b5cf6.
    expect(line.stroke).toBe("rgb(99, 102, 241)");
    expect(line.widthAttr).toBe("2.5");
    expect(line.fill).toBe("none");
    // The reference's curve is SMOOTH (C segments, no straight L runs).
    expect(line.d).toMatch(/^M-?[\d.]+,-?[\d.]+C/);
    expect(line.d).not.toContain("L");
    // F-100: the reference ships ZERO point markers.
    expect(line.circles).toBe(0);
  });

  test("the dashboard chart's grid + axes are the reference's slate families (F-96, F-97)", async ({
    page,
  }) => {
    await page.goto("/Dashboard");
    const grid = await page.getByTestId("line-chart").evaluate((svg) => {
      const lines = Array.from(svg.querySelectorAll("line")).map((l) => ({
        stroke: getComputedStyle(l).stroke,
        dash: l.getAttribute("stroke-dasharray"),
        x1: Number(l.getAttribute("x1")),
        y1: Number(l.getAttribute("y1")),
        x2: Number(l.getAttribute("x2")),
        y2: Number(l.getAttribute("y2")),
      }));
      const grid = lines.filter((l) => l.stroke === "rgb(226, 232, 240)");
      const axes = lines.filter((l) => l.stroke === "rgb(148, 163, 184)");
      return {
        gridDash: [...new Set(grid.map((l) => l.dash))],
        vGrid: grid.filter((l) => Math.abs(l.y2 - l.y1) > 100).length,
        hGrid: grid.filter((l) => Math.abs(l.x2 - l.x1) > 100).length,
        xAxis: axes.filter((l) => l.y1 === 245 && l.y2 === 245 && l.x2 - l.x1 > 500).length,
        yAxis: axes.filter((l) => l.x1 === 65 && l.x2 === 65 && l.y2 - l.y1 > 100).length,
        xTicks: axes.filter((l) => Math.max(l.y1, l.y2) === 251 && Math.min(l.y1, l.y2) === 245).length,
      };
    });
    // F-96: the grid is slate-200, dashed 3-3 — one vertical per day bucket.
    expect(grid.gridDash).toEqual(["3 3"]);
    expect(grid.vGrid).toBe(7);
    expect(grid.hGrid).toBeGreaterThanOrEqual(3);
    expect(grid.hGrid).toBeLessThanOrEqual(7);
    // F-97: two full-length slate-400 axes (x at the y=245 baseline, y at
    // x=65) + the 7 x-tick stubs running 245→251 below the axis.
    expect(grid.xAxis).toBe(1);
    expect(grid.yAxis).toBe(1);
    expect(grid.xTicks).toBe(7);
  });

  test("the dashboard chart renders the reference's gradient area (F-99)", async ({ page }) => {
    await page.goto("/Dashboard");
    const area = await page.getByTestId("line-chart").evaluate((svg) => {
      const paths = Array.from(svg.querySelectorAll("path"));
      const areaPath = paths[0]; // the fill path renders before the stroke path
      const grad = svg.querySelector("linearGradient");
      const stops = grad
        ? Array.from(grad.querySelectorAll("stop")).map((s) => ({
            off: s.getAttribute("offset"),
            color: getComputedStyle(s).stopColor,
            op: getComputedStyle(s).stopOpacity,
          }))
        : [];
      return {
        fill: areaPath ? getComputedStyle(areaPath).fill : null,
        fillOp: areaPath ? getComputedStyle(areaPath).getPropertyValue("fill-opacity") : null,
        stops,
      };
    });
    // F-99: an indigo gradient area (0.3 @5% → 0 @95%) at fill-opacity 0.6 —
    // the measured def id is the reference's own "salesGrad"; the clone
    // mirrors the CONTRACT (stops + opacity), not the id string. (Chromium
    // serializes computed fill with the id QUOTED — `url("#…")` — the same
    // form the reference's own computed area fill measured in.)
    expect(area.fill).toContain('url("#');
    expect(area.fillOp).toBe("0.6");
    expect(area.stops).toHaveLength(2);
    expect(area.stops[0].off).toBe("5%");
    expect(area.stops[0].color).toBe("rgb(99, 102, 241)");
    expect(area.stops[0].op).toBe("0.3");
    expect(area.stops[1].off).toBe("95%");
    expect(area.stops[1].op).toBe("0");
  });

  test("the dashboard chart's plot geometry + ticks are the reference's (F-98, F-101)", async ({
    page,
  }) => {
    await page.goto("/Dashboard");
    const geo = await page.getByTestId("line-chart").evaluate((svg) => {
      const texts = Array.from(svg.querySelectorAll("text")).map((t) => ({
        t: (t.textContent || "").trim(),
        x: Number(t.getAttribute("x")),
        y: Number(t.getAttribute("y")),
        anchor: getComputedStyle(t).textAnchor,
        size: getComputedStyle(t).fontSize,
        color: getComputedStyle(t).fill,
      }));
      return {
        viewBox: svg.getAttribute("viewBox"),
        y0: texts.find((t) => t.t === "0" && t.x < 65) ?? null,
        xLabel: texts.find((t) => /^[A-Z][a-z]{2}$/.test(t.t)) ?? null,
      };
    });
    // F-101: the measured plot box — viewBox 731×280 (the e2e-state width;
    // the reference's chart is container-responsive with FIXED paddings),
    // plot edge x=65, baseline y=245.
    expect(geo.viewBox).toBe("0 0 731 280");
    // F-98: the y ticks are 12px slate-400, END-anchored at x=57.
    expect(geo.y0?.x).toBe(57);
    expect(geo.y0?.anchor).toBe("end");
    expect(geo.y0?.size).toBe("12px");
    expect(geo.y0?.color).toBe("rgb(148, 163, 184)");
    // The x labels: 12px slate-400, middle-anchored, baseline at y=253.
    expect(geo.xLabel?.size).toBe("12px");
    expect(geo.xLabel?.color).toBe("rgb(148, 163, 184)");
    expect(geo.xLabel?.anchor).toBe("middle");
    expect(geo.xLabel?.y).toBe(253);
  });
});

import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Reports + Cashiers + Settings + the Spanish 404 — the remaining surfaces.
// ---------------------------------------------------------------------------

test("Reports renders the reference copy, period pills, and empty states", async ({ page }) => {
  await page.goto("/Reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
  await expect(page.getByText("Sales & revenue analytics")).toBeVisible();
  for (const p of ["7 days", "14 days", "30 days", "90 days"]) {
    await expect(page.getByRole("button", { name: p })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "30 days" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible();
  await expect(page.getByText("Avg. Ticket", { exact: true })).toBeVisible();
  await expect(page.getByTestId("area-chart")).toBeVisible();
  await expect(page.getByText("No data for this period").first()).toBeVisible();
});

test("the period pills switch (90 days renders 90 buckets)", async ({ page }) => {
  await page.goto("/Reports");
  await page.getByRole("button", { name: "90 days" }).click();
  await expect(page.getByRole("button", { name: "90 days" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("area-chart")).toBeVisible();
});

// Session-14 (F-102..F-106, measured live on the reference 2026-10-27 at
// 1440×900): the Reports "Daily Sales" chart is its OWN family — the
// reference ships two distinct chart contracts exactly as it ships two
// alert/stat families. The Reports chart: a white/4% dashed grid (NO slate
// axes), 11px white/30 ticks, the indigo line at 2px (not the Dashboard's
// 2.5), and the gradient at 0.35@5% (not 0.3). The clone's single
// violet/dotted treatment diverged on every axis of the contract.
test("the Reports daily chart is the reference's own indigo family (F-102..F-106)", async ({
  page,
}) => {
  await page.goto("/Reports");
  const chart = page.getByTestId("area-chart");
  await expect(chart).toBeVisible();
  const c = await chart.evaluate((svg) => {
    const paths = Array.from(svg.querySelectorAll("path"));
    const areaPath = paths[0];
    const linePath = paths[paths.length - 1];
    const lines = Array.from(svg.querySelectorAll("line")).map((l) => ({
      stroke: getComputedStyle(l).stroke,
      dash: l.getAttribute("stroke-dasharray"),
    }));
    const texts = Array.from(svg.querySelectorAll("text")).map((t) => ({
      t: (t.textContent || "").trim(),
      size: getComputedStyle(t).fontSize,
      color: getComputedStyle(t).fill,
    }));
    const grad = svg.querySelector("linearGradient");
    const stops = grad
      ? Array.from(grad.querySelectorAll("stop")).map((s) => ({
          off: s.getAttribute("offset"),
          op: getComputedStyle(s).stopOpacity,
        }))
      : [];
    return {
      viewBox: svg.getAttribute("viewBox"),
      lineStroke: linePath ? getComputedStyle(linePath).stroke : null,
      lineW: linePath?.getAttribute("stroke-width") ?? null,
      lineD: linePath?.getAttribute("d") ?? "",
      areaFill: areaPath ? getComputedStyle(areaPath).fill : null,
      areaFillOp: areaPath ? getComputedStyle(areaPath).getPropertyValue("fill-opacity") : null,
      gridStrokes: [...new Set(lines.map((l) => l.stroke))],
      gridDash: [...new Set(lines.map((l) => l.dash))],
      slateAxisCount: lines.filter((l) => l.stroke === "rgb(148, 163, 184)").length,
      gridCount: lines.length,
      yTick: texts.find((t) => /^\$\d+$/.test(t.t)) ?? null,
      xTick: texts.find((t) => /^\d{1,2} [A-Z][a-z]{2}$/.test(t.t)) ?? null,
      stops,
    };
  });
  // F-102: the indigo line at 2px, smooth (C segments).
  expect(c.lineStroke).toBe("rgb(99, 102, 241)");
  expect(c.lineW).toBe("2");
  expect(c.lineD).toMatch(/^M-?[\d.]+,-?[\d.]+C/);
  // F-105: the gradient area — 0.35 @5% → 0 @95% at fill-opacity 0.6
  // (computed fill serializes the id QUOTED — `url("#…")`, the reference's
  // own measured form).
  expect(c.areaFill).toContain('url("#');
  expect(c.areaFillOp).toBe("0.6");
  expect(c.stops).toHaveLength(2);
  expect(c.stops[0].off).toBe("5%");
  expect(c.stops[0].op).toBe("0.35");
  expect(c.stops[1].off).toBe("95%");
  expect(c.stops[1].op).toBe("0");
  // F-103: the grid is white at 4%, dashed 3-3 — and NO slate axes here.
  expect(c.gridStrokes).toEqual(["rgba(255, 255, 255, 0.04)"]);
  expect(c.gridDash).toEqual(["3 3"]);
  expect(c.slateAxisCount).toBe(0);
  expect(c.gridCount).toBeGreaterThanOrEqual(8);
  // F-104: 11px white/30 ticks; the $-prefixed y + the "d MMM" x survive.
  expect(c.yTick?.size).toBe("11px");
  expect(c.yTick?.color).toBe("rgba(255, 255, 255, 0.3)");
  expect(c.xTick?.size).toBe("11px");
  expect(c.xTick?.color).toBe("rgba(255, 255, 255, 0.3)");
  // F-106: the measured plot box (responsive width; 1130 at this viewport).
  expect(c.viewBox).toBe("0 0 1130 220");
});

test("Cashiers shows the Spanish copy and the roster flow", async ({ page }) => {
  await page.goto("/Cashiers");
  await expect(page.getByRole("heading", { name: "Cajeros" })).toBeVisible();
  await expect(page.getByText("0 usuarios registrados")).toBeVisible();
  await expect(page.getByText("No hay usuarios registrados")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Turnos Recientes" })).toBeVisible();

  // Add a cashier (the superset: real accounts with role=cashier).
  await page.getByRole("button", { name: "Nuevo cajero" }).click();
  const dialog = page.getByRole("dialog", { name: "Nuevo cajero" });
  await dialog.getByLabel("Nombre *").fill("Ana Cajera");
  await dialog.getByLabel("Email *").fill("ana.cajera@veloxpos.test");
  await dialog.getByLabel("Contraseña temporal * (mín. 8)").fill("TempPass99");
  await dialog.getByRole("button", { name: "Crear" }).click();
  await expect(page.getByText("1 usuarios registrados")).toBeVisible();
  await expect(page.getByText("Ana Cajera")).toBeVisible();
});

test("Settings saves the store profile and materializes the reference defaults", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  await expect(page.getByRole("heading", { name: "Store Settings" })).toBeVisible();
  await expect(page.getByLabel("Store name *")).toHaveValue("My Store");
  await expect(page.getByLabel("Receipt footer")).toHaveValue("Thank you for your purchase!");

  await page.getByLabel("Store name *").fill("Velox Test Store");
  await page.getByLabel("Phone").fill("+1 555 0100");
  await page.getByTestId("save-settings").click();
  await expect(page.getByText("Settings saved")).toBeVisible();

  // The save persists across a reload.
  await page.reload();
  await expect(page.getByLabel("Store name *")).toHaveValue("Velox Test Store");

  // Restore the reference default for the other specs' expectations.
  await page.getByLabel("Store name *").fill("My Store");
  await page.getByTestId("save-settings").click();
  await expect(page.getByText("Settings saved")).toBeVisible();
});

test("unknown routes render the reference's Spanish 404", async ({ page }) => {
  await page.goto("/NoSuchView");
  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  await expect(page.getByText("La página que buscas no existe o fue movida.")).toBeVisible();
  // Session-12 (F-79, measured live 2026-10-27): the authenticated 404's
  // full contract — the glass-card at rounded-3xl p-12, a PLAIN span numeral
  // (30px/700/white, no chip background), the slate-800/slate-500 text
  // family, and the 50px font-medium gradient link carrying the ArrowLeft
  // icon (not a "←" text glyph).
  const card = page.locator("div.glass-card");
  await expect(card).toHaveCSS("padding", "48px");
  await expect(card).toHaveCSS("border-radius", "24px");
  const numeral = page.getByText("404", { exact: true });
  await expect(numeral).toHaveCSS("font-size", "30px");
  await expect(numeral).toHaveCSS("font-weight", "700");
  await expect(numeral).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(numeral).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const h1 = page.getByRole("heading", { name: "Página no encontrada" });
  await expect(h1).toHaveCSS("color", "rgb(30, 41, 59)");
  await expect(h1).toHaveCSS("margin-bottom", "8px");
  const desc = page.getByText("La página que buscas no existe o fue movida.");
  await expect(desc).toHaveCSS("color", "rgb(100, 116, 139)");
  await expect(desc).toHaveCSS("margin-bottom", "32px");
  const link = page.getByRole("link", { name: "Ir al Terminal" });
  await expect(link).toHaveCSS("height", "50px");
  await expect(link).toHaveCSS("font-size", "16px");
  await expect(link).toHaveCSS("font-weight", "500");
  const linkBg = await link.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(linkBg).toContain("linear-gradient");
  await expect(link.locator("svg")).toBeVisible(); // the ArrowLeft icon
  await link.click();
  await page.waitForURL("**/POS");
});

test("the health endpoint reports db up", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toMatchObject({ status: "ok", db: "up", app: "veloxpos" });
});

// ---------------------------------------------------------------------------
// Session-3 pins: the tw-animate family (Radix data-[state] animations must
// be LIVE CSS — the import was once missing and every dialog popped with no
// animation) and the cart panel's md-breakpoint tablet geometry (the
// reference activates the 380px side panel at md, not lg).
// ---------------------------------------------------------------------------

test("Radix dialogs animate (the tw-animate data-[state] family is live)", async ({ page }) => {
  await page.goto("/Registers");
  await page.getByRole("button", { name: "New Register" }).click();
  const dialog = page.getByRole("dialog", { name: "New Register" });
  await expect(dialog).toBeVisible();
  const animationName = await dialog.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).not.toBe("none");
});

test("the cart side panel activates at md (reference tablet geometry)", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/POS");
  const cart = page.getByTestId("cart-panel");
  await expect(cart).toBeVisible();
  await expect(cart).toHaveCSS("width", "380px");
  await expect(cart).toHaveCSS("border-left-width", "1px");
});

// ---------------------------------------------------------------------------
// Session-4 pins: heading typography + copy casing + the fiscal card, all
// measured live on the reference (2026-10-26 — the reference RENAMED its
// fiscal labels since Session-101). The reference renders its headings in
// slate-700/800 on dark glass (near-invisible — its own defect); we pin the
// SIZES (24px H1 / 16px sections / 14px Reports) while keeping the clone's
// readable colors (the a11y-superset doctrine).
// ---------------------------------------------------------------------------

test("page H1s compute the reference's 24px (not text-3xl)", async ({ page }) => {
  for (const route of ["/Dashboard", "/Inventory", "/Reports", "/StoreSettings"]) {
    await page.goto(route);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS("font-size", "24px");
  }
});

test("section headings compute the reference's 16px as level-3 (Dashboard/Cashiers/Settings)", async ({
  page,
}) => {
  // Session-9 (F-57): the reference renders these section headings as <h3>
  // (16px/700) — the clone shipped <h2> with identical computed styles. The
  // level pin locks the document-outline contract too (role+level lookups
  // fail against h2s).
  await page.goto("/Dashboard");
  const dash = page.getByRole("heading", { name: "Sales — Last 7 days", level: 3 });
  await expect(dash).toBeVisible();
  await expect(dash).toHaveCSS("font-size", "16px");
  await expect(
    page.getByRole("heading", { name: "Products by Category", level: 3 }),
  ).toHaveCSS("font-size", "16px");

  await page.goto("/Cashiers");
  await expect(
    page.getByRole("heading", { name: "Turnos Recientes", level: 3 }),
  ).toHaveCSS("font-size", "16px");

  await page.goto("/StoreSettings");
  await expect(
    page.getByRole("heading", { name: "Business Information", level: 3 }),
  ).toHaveCSS("font-size", "16px");
  await expect(
    page.getByRole("heading", { name: "Fiscal / Tax Data", level: 3 }),
  ).toHaveCSS("font-size", "16px");
});

test("Reports headings compute the reference's 14px uppercase white/60", async ({ page }) => {
  await page.goto("/Reports");
  const daily = page.getByRole("heading", { name: "Daily Sales" });
  await expect(daily).toBeVisible();
  await expect(daily).toHaveCSS("font-size", "14px");
  await expect(daily).toHaveCSS("text-transform", "uppercase");
  // v4 serializes white/60 as oklab(...) with "/ 0.6)" — the reference's
  // rgba(255,255,255,0.6) is the same color; pin the ALPHA (the /60).
  const color = await daily.evaluate((el) => getComputedStyle(el).color);
  expect(color).toMatch(/(?:\/\s*0\.6\)|,\s*0\.6\))/);
});

test("Reports stat copy is the reference's Title Case DOM text", async ({ page }) => {
  await page.goto("/Reports");
  await expect(page.getByText("Total Revenue", { exact: true })).toBeVisible();
  await expect(page.getByText("Avg. Ticket", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Revenue by Payment Method", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Breakdown by Method", exact: true }),
  ).toBeVisible();
});

test("Dashboard stat labels are the reference's Title Case DOM text", async ({ page }) => {
  await page.goto("/Dashboard");
  await expect(page.getByText("Today's Sales", { exact: true })).toBeVisible();
  await expect(page.getByText("Low Stock", { exact: true })).toBeVisible();
});

test("the fiscal card carries the reference's (renamed) labels", async ({ page }) => {
  await page.goto("/StoreSettings");
  // Scoped: the reference ALSO has a "Tax ID / EIN" in Business Information
  // (measured twice on the live site) — pin the FISCAL card's copy only.
  const fiscal = page.getByRole("region", { name: "Fiscal / Tax Data" });
  await expect(fiscal.getByLabel("Tax ID / EIN")).toBeVisible();
  await expect(fiscal.getByLabel("Tax Regime")).toBeVisible();
  await expect(fiscal.getByLabel("Fiscal Address")).toBeVisible();
  await expect(fiscal.getByLabel("CFDI Use (default)")).toBeVisible();
});

test("the fiscal toggle defaults OFF=hidden with the reference's copy and help text", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const fiscal = page.getByRole("region", { name: "Fiscal / Tax Data" });

  // Default: fiscal hidden on the receipt — the switch is UNCHECKED and the
  // label reads "Hidden on receipt" (the reference's toggle-left default).
  const fiscalSwitch = fiscal.getByRole("switch");
  await expect(fiscalSwitch).not.toBeChecked();
  await expect(fiscal.getByText("Hidden on receipt")).toBeVisible();

  // The reference's help paragraph under the toggle.
  await expect(
    fiscal.getByText(
      "If you configure these fields and enable the option, they will appear in the header of each printed or emailed receipt.",
    ),
  ).toBeVisible();

  // Flipping the switch shows the reference's ON-state copy.
  await fiscalSwitch.click();
  await expect(fiscal.getByText("Visible on receipt")).toBeVisible();
});

// ---------------------------------------------------------------------------
// Session-5 pins: the form-control / button / pill parity contracts, all
// measured live on the reference (2026-10-26 evening). The reference's
// Input/Select/Textarea base computes 12px radius + #262a36 border-input +
// transparent bg everywhere (settings, dialogs, search); its standard buttons
// are py-2.5 (42px); its CHARGE is py-5 (70px); its Reports period pills are
// text-xs bold in a 16px-radius container; its receipt footer is a TEXTAREA.
// ---------------------------------------------------------------------------

test("settings inputs compute the reference's 12px radius, #262a36 border, transparent bg", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const name = page.getByLabel("Store name *");
  await expect(name).toBeVisible();
  await expect(name).toHaveCSS("border-radius", "12px");
  await expect(name).toHaveCSS("border-color", "rgb(38, 42, 54)");
  await expect(name).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("dialog inputs compute the reference's 12px radius", async ({ page }) => {
  await page.goto("/Inventory");
  await page.getByRole("button", { name: "New Product" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const input = dialog.getByLabel("Name");
  await expect(input).toBeVisible();
  await expect(input).toHaveCSS("border-radius", "12px");
});

test("the search inputs compute the reference's geometry and placeholder", async ({ page }) => {
  await page.goto("/Inventory");
  const search = page.getByPlaceholder("Search by name or code...");
  await expect(search).toBeVisible();
  await expect(search).toHaveCSS("border-radius", "12px");
  await expect(search).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  // The reference's placeholder: --muted-foreground 220 12% 50% = rgb(112,122,143).
  const ph = await search.evaluate((el) =>
    getComputedStyle(el, "::placeholder").color,
  );
  expect(ph).toBe("rgb(112, 122, 143)");
});

test("the receipt footer is the reference's TEXTAREA (rows=2, min-height 60px)", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const footer = page.getByLabel("Receipt footer");
  await expect(footer).toBeVisible();
  await expect(footer.evaluate((el) => el.tagName)).resolves.toBe("TEXTAREA");
  await expect(footer).toHaveAttribute("rows", "2");
  await expect(footer).toHaveCSS("min-height", "60px");
});

test("Reports period pills compute the reference's container + pill geometry", async ({
  page,
}) => {
  await page.goto("/Reports");
  const group = page.getByRole("group", { name: "Report period" });
  await expect(group).toBeVisible();
  await expect(group).toHaveCSS("border-radius", "16px");
  // The container's measured bg: rgba(28, 31, 52, 0.85).
  await expect(group).toHaveCSS("background-color", "rgba(28, 31, 52, 0.85)");

  const active = group.getByRole("button", { name: "30 days" });
  await expect(active).toHaveCSS("border-radius", "12px");
  await expect(active).toHaveCSS("font-size", "12px");
  await expect(active).toHaveCSS("font-weight", "700");
  // The active pill carries the reference's shadow-lg.
  const shadow = await active.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).not.toBe("none");

  const inactive = group.getByRole("button", { name: "7 days" });
  // Inactive copy: text-white/40 — v4 serializes as oklab with /0.4.
  const color = await inactive.evaluate((el) => getComputedStyle(el).color);
  expect(color).toMatch(/(?:\/\s*0\.4\)|,\s*0\.4\))/);
});

test("standard action buttons compute the reference's py-2.5 (42px)", async ({ page }) => {
  await page.goto("/Inventory");
  const newProduct = page.getByRole("button", { name: "New Product" });
  await expect(newProduct).toBeVisible();
  await expect(newProduct).toHaveCSS("height", "42px");
  await expect(newProduct).toHaveCSS("padding", "10px 16px");
});

test("the CHARGE button computes the reference's py-5 (70px)", async ({ page }) => {
  await page.goto("/POS");
  const charge = page.getByTestId("charge-button");
  await expect(charge).toBeVisible();
  await expect(charge).toHaveCSS("height", "70px");
});

test("select triggers compute the reference's 12px radius + #262a36 border", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const currency = page.getByRole("combobox", { name: "Currency" });
  await expect(currency).toBeVisible();
  await expect(currency).toHaveCSS("border-radius", "12px");
  await expect(currency).toHaveCSS("border-color", "rgb(38, 42, 54)");
  await expect(currency).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

// ---------------------------------------------------------------------------
// Session-6 pins: the chrome-depth census (measured live on the reference).
// Save Changes is the reference's LARGER primary CTA (px-6 py-3.5, 54px,
// 16px/medium — bigger than the standard 42px); section headers carry BARE
// 20px icons in per-section colors (indigo/purple/green/orange/blue/amber);
// the category flow is header-Add → "New Category" dialog; the Inventory
// chips are the 36px pill family; the POS shift gate is p-8 with the /30
// icon and the white/35 paragraph.
// ---------------------------------------------------------------------------

test("Save Changes computes the reference's py-3.5 primary CTA (54px, 16px/500)", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const save = page.getByTestId("save-settings");
  await expect(save).toBeVisible();
  await expect(save).toHaveCSS("height", "54px");
  await expect(save).toHaveCSS("padding", "14px 24px");
  await expect(save).toHaveCSS("font-size", "16px");
  await expect(save).toHaveCSS("font-weight", "500");
});

test("section headers carry the reference's bare 20px icons in per-section colors", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const sections: Array<[string, string]> = [
    ["Business Information", "rgb(99, 102, 241)"], // indigo-500 (Store)
    ["Branding", "rgb(168, 85, 247)"], // purple-500 (Palette)
    ["Receipt", "rgb(34, 197, 94)"], // green-500 (FileText)
    ["Fiscal / Tax Data", "rgb(249, 115, 22)"], // orange-500 (Receipt)
    ["Card Payment Provider", "rgb(59, 130, 246)"], // blue-500 (CreditCard)
    ["Product Categories", "rgb(245, 158, 11)"], // amber-500 (Tag)
  ];
  for (const [title, color] of sections) {
    const section = page.locator(`section[aria-label="${title}"]`);
    // Session-9 (F-57): the section headings are h3 (the reference's tag) —
    // the icons live under h3 now.
    const icon = section.locator("h3 svg");
    await expect(icon).toBeVisible();
    await expect(icon).toHaveCSS("color", color);
    const box = await icon.boundingBox();
    expect(box?.width, `${title} icon width`).toBe(20);
    expect(box?.height, `${title} icon height`).toBe(20);
  }
});

test("the category Add button lives in the section header (34px, 8px radius)", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  const add = page.getByRole("button", { name: "Add", exact: true });
  await expect(add).toBeVisible();
  // It sits in the Product Categories HEADER row, beside the heading.
  await expect(add.locator("..").getByRole("heading", { name: "Product Categories" })).toBeVisible();
  await expect(add).toHaveCSS("height", "34px");
  await expect(add).toHaveCSS("border-radius", "8px");
  await expect(add).toHaveCSS("padding", "6px 12px");
  const plus = add.locator("svg");
  const plusBox = await plus.boundingBox();
  expect(plusBox?.width).toBe(16);
});

test("the New Category dialog matches the reference's flow (title/Name/Create 42px)", async ({
  page,
}) => {
  await page.goto("/StoreSettings");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New Category" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "New Category" })).toHaveCSS(
    "font-size",
    "18px",
  );
  const name = dialog.getByLabel("Name");
  await expect(name).toHaveAttribute("placeholder", "e.g. Beverages");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toHaveCSS("height", "42px");
  const create = dialog.getByRole("button", { name: "Create" });
  await expect(create).toHaveCSS("height", "42px");
  // The Create action is gated on a non-empty name (the dialog's validation).
  await expect(create).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
});

test("the Inventory chips compute the reference's 36px pill geometry", async ({ page }) => {
  await page.goto("/Inventory");
  const all = page.getByRole("button", { name: "All", exact: true });
  await expect(all).toBeVisible();
  await expect(all).toHaveCSS("height", "36px");
  await expect(all).toHaveCSS("border-radius", "12px");
  await expect(all).toHaveCSS("font-size", "12px");
  await expect(all).toHaveCSS("font-weight", "600");
  // The active chip is the glass-button-primary gradient (measured live).
  await expect
    .poll(async () => all.evaluate((el) => getComputedStyle(el).backgroundImage))
    .toContain("linear-gradient");
  // An inactive chip (Beverages — created by the inventory spec).
  // white/40 serializes as oklab with /0.4 — pin the ALPHA.
  const bev = page.getByRole("button", { name: "Beverages", exact: true });
  if (await bev.count()) {
    await expect(bev).toHaveCSS("height", "36px");
    await expect(bev).toHaveCSS("border-radius", "12px");
    await expect(bev).toHaveCSS("font-size", "12px");
    const bevColor = await bev.evaluate((el) => getComputedStyle(el).color);
    expect(bevColor).toMatch(/(?:\/\s*0\.4\)|,\s*0\.4\))/);
  }
});

test("the POS shift gate computes the reference's card + icon + copy treatment", async ({
  page,
}) => {
  // Close any active shift first (the gate must be live, order-independent).
  const base = process.env.E2E_PORT
    ? `http://localhost:${process.env.E2E_PORT}`
    : "http://localhost:3100";
  const shifts = (await (await page.request.get(`${base}/api/shifts`)).json()) as Array<{
    id: string;
    status: string;
  }>;
  for (const s of shifts.filter((s) => s.status === "active")) {
    await page.request.patch(`${base}/api/shifts/${s.id}`, { data: { countedCash: 0 } });
  }

  await page.goto("/POS");
  const heading = page.getByRole("heading", { name: "No active shift" });
  await expect(heading).toBeVisible();
  // The card: p-8 (Session-101 shipped p-10).
  const card = heading.locator("..");
  await expect(card).toHaveCSS("padding", "32px");
  // The Monitor icon: text-violet-400/30 + mb-4 (the reference's dimmed
  // glyph). violet-400/30 serializes as oklab with /0.3 — pin the ALPHA.
  const icon = card.locator("svg").first();
  await expect
    .poll(async () => icon.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.3\)|,\s*0\.3\))/);
  await expect(icon).toHaveCSS("margin-bottom", "16px");
  await expect(heading).toHaveCSS("margin-bottom", "8px");
  // The paragraph: text-white/35 with a <strong>-styled, non-underlined
  // emphasis. white/35 + white/60 serialize as oklab — pin the ALPHAs.
  const copy = card.locator("p").first();
  await expect
    .poll(async () => copy.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.35\)|,\s*0\.35\))/);
  const emphasis = card.getByRole("link", { name: "Registers" });
  await expect
    .poll(async () => emphasis.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.6\)|,\s*0\.6\))/);
  await expect(emphasis).toHaveCSS("text-decoration-line", "none");
});

// ---------------------------------------------------------------------------
// Session-10 pins: the stat-card families + the muted-tone family, measured
// live on the reference (2026-10-27, full-DOM dumps). The reference ships TWO
// stat families — Dashboard (40px SOLID-GRADIENT chips, white icons, gradient
// opacity-20 corner blobs, semibold slate-500 labels, bold values) and Reports
// (48px rounded-2xl /15 flat chips with /30 borders on the LEFT, w-6 tone-400
// icons, 400 white/35 labels, font-black white values, no blob) — plus a
// muted-tone design language (slate-500 subtitles, slate-400 empty text, 64px
// slate-200 stroke-2 empty icons) the initial build substituted with white/xx.
// ---------------------------------------------------------------------------

test("Dashboard stat chips are the reference's solid-gradient family (F-61)", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  // The "Today's Sales" card: the label p sits three divs deep (wrapper →
  // flex row → card — the reference's own structure, mirrored in both the
  // old and the fixed tree). The chip is the svg's parent; the blob is the
  // card's aria-hidden corner div.
  const label = page.getByText("Today's Sales", { exact: true });
  const card = label.locator("..").locator("..").locator("..");
  const chip = card.locator("svg").first().locator("..");
  await expect(chip).toBeVisible();
  await expect(chip).toHaveCSS("height", "40px");
  await expect(chip).toHaveCSS("width", "40px");
  const chipBg = await chip.evaluate((el) => getComputedStyle(el).backgroundImage);
  // The reference's own utility gradient (v3-era rgba stops, verbatim — the
  // Added-banner posture): green-400 → emerald-500.
  expect(chipBg).toContain("linear-gradient");
  expect(chipBg).toContain("74, 222, 128");
  expect(chipBg).toContain("16, 185, 129");
  const icon = chip.locator("svg");
  await expect(icon).toHaveCSS("color", "rgb(255, 255, 255)");
  // The corner blob: gradient + opacity-20 (the reference's -top-6 -right-6).
  const blob = card.locator("div[aria-hidden='true']").first();
  const blobBg = await blob.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(blobBg).toContain("linear-gradient");
  await expect(blob).toHaveCSS("opacity", "0.2");
  // The label: font-semibold (600) + slate-500 — the reference's muted tone,
  // matched verbatim (the slate ramp serializes as rgb in v4's pins).
  await expect(label).toHaveCSS("font-weight", "600");
  await expect(label).toHaveCSS("color", "rgb(100, 116, 139)");
  // The value: font-bold (700) + mt-1 (the color stays the readable superset —
  // the reference's slate-800 values are its VLM-confirmed near-invisible
  // defect).
  const value = page.getByTestId("stat-today-s-sales");
  await expect(value).toHaveCSS("font-weight", "700");
  await expect(value).toHaveCSS("margin-top", "4px");
});

test("Reports stat cards are the reference's flat-chip family (F-62)", async ({
  page,
}) => {
  await page.goto("/Reports");
  // Total Revenue: the chip is w-12 h-12 rounded-2xl (48px/16px) with a flat
  // indigo-500/15 fill + a 1px indigo-500/30 border and a w-6 (24px)
  // indigo-400 icon — on the LEFT of the text (flex items-center gap-4).
  const label = page.getByText("Total Revenue", { exact: true });
  await expect(label).toBeVisible();
  // The label p sits two divs deep (text wrapper → card) in the reference's
  // horizontal family; the chip is the svg's parent.
  const card = label.locator("..").locator("..");
  const chip = card.locator("svg").first().locator("..");
  await expect(chip).toBeVisible();
  await expect(chip).toHaveCSS("width", "48px");
  await expect(chip).toHaveCSS("height", "48px");
  await expect(chip).toHaveCSS("border-radius", "16px");
  // indigo-500/15: v4 serializes fractional alphas as oklab — pin the ALPHA.
  await expect
    .poll(async () => chip.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toMatch(/(?:\/\s*0\.15\)|,\s*0\.15\))/);
  await expect
    .poll(async () => chip.evaluate((el) => getComputedStyle(el).borderColor))
    .toMatch(/(?:\/\s*0\.3\)|,\s*0\.3\))/);
  const icon = chip.locator("svg");
  await expect(icon).toHaveCSS("width", "24px");
  await expect(icon).toHaveCSS("color", "rgb(129, 140, 248)");
  // The label: 400 (no font-weight class) + white/35 (the reference's own
  // Reports exception — every other view's subtitle is slate-500).
  await expect(label).toHaveCSS("font-weight", "400");
  await expect
    .poll(async () => label.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.35\)|,\s*0\.35\))/);
  // The value: font-black (900) + white.
  const value = page.getByTestId("stat-total-revenue");
  await expect(value).toHaveCSS("font-weight", "900");
  await expect(value).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("the muted-tone family matches the reference (F-63: subtitle + empty states)", async ({
  page,
}) => {
  // The subtitle: text-slate-500 on every view except Reports (white/35) —
  // the reference's muted design language, matched verbatim. The date line
  // is the p immediately after the Dashboard's h1 (the PageHeader contract).
  await page.goto("/Dashboard");
  const subtitle = page.locator("main h1 + p");
  await expect(subtitle).toBeVisible();
  await expect(subtitle).toHaveCSS("color", "rgb(100, 116, 139)");
  // "No data yet": text-slate-400 (the category chart's empty state —
  // order-independent: no earlier spec in the run order creates products).
  const empty = page.getByText("No data yet", { exact: true });
  await expect(empty).toBeVisible();
  await expect(empty).toHaveCSS("color", "rgb(148, 163, 184)");
  // The cart's empty copy: white/25 (the reference's own muted tone).
  await page.goto("/POS");
  const cartEmpty = page.getByText("Scan or select products");
  await expect(cartEmpty).toBeVisible();
  await expect
    .poll(async () => cartEmpty.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.25\)|,\s*0\.25\))/);
});

test("the Settings form labels compute the reference's #e7e9ef (the foreground the token already carries)", async ({
  page,
}) => {
  // Session-11 (F-66): every label on the reference (Settings + dialogs)
  // measures rgb(231,233,239) at 14px/500 — the SAME value the clone's
  // --foreground token computes. The 35 per-field text-white/70 overrides
  // (and the text-white titles/inputs) bypassed the token with tones the
  // reference never ships. The base Label now owns the color.
  await page.goto("/StoreSettings");
  const storeName = page.getByText("Store name *", { exact: true });
  await expect(storeName).toHaveCSS("color", "rgb(231, 233, 239)");
  await expect(storeName).toHaveCSS("font-size", "14px");
  await expect(storeName).toHaveCSS("font-weight", "500");
  const phone = page.getByText("Phone", { exact: true });
  await expect(phone).toHaveCSS("color", "rgb(231, 233, 239)");
  const fiscal = page.getByText("Tax Regime", { exact: true });
  await expect(fiscal).toHaveCSS("color", "rgb(231, 233, 239)");
  // The "Upload logo" affordance is the glass-button-styled label: the
  // reference's 14px/500 treatment (the clone shipped font-weight 400).
  const upload = page.getByText("Upload logo", { exact: true });
  await expect(upload).toHaveCSS("font-size", "14px");
  await expect(upload).toHaveCSS("font-weight", "500");
  await expect(upload).toHaveCSS("color", "rgba(200, 210, 255, 0.8)");
});

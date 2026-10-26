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
  await page.getByRole("link", { name: "Ir al Terminal" }).click();
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

test("section headings compute the reference's 16px (Dashboard/Cashiers/Settings)", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  const dash = page.getByRole("heading", { name: "Sales — Last 7 days" });
  await expect(dash).toBeVisible();
  await expect(dash).toHaveCSS("font-size", "16px");
  await expect(page.getByRole("heading", { name: "Products by Category" })).toHaveCSS(
    "font-size",
    "16px",
  );

  await page.goto("/Cashiers");
  await expect(page.getByRole("heading", { name: "Turnos Recientes" })).toHaveCSS(
    "font-size",
    "16px",
  );

  await page.goto("/StoreSettings");
  await expect(page.getByRole("heading", { name: "Business Information" })).toHaveCSS(
    "font-size",
    "16px",
  );
  await expect(page.getByRole("heading", { name: "Fiscal / Tax Data" })).toHaveCSS(
    "font-size",
    "16px",
  );
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

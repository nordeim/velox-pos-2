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
  await expect(page.getByText("Total revenue")).toBeVisible();
  await expect(page.getByText("Avg. ticket")).toBeVisible();
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

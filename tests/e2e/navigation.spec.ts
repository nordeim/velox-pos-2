import { expect, test } from "@playwright/test";

// The shell: sidebar (desktop) + view switching across the 8 sections.
test.describe("navigation", () => {
  test("the sidebar renders all 8 reference sections in order", async ({ page }) => {
    await page.goto("/Terminal");
    const nav = page.getByRole("navigation", { name: "Primary" });
    const labels = ["Terminal", "Dashboard", "Inventory", "Sales", "Registers", "Cashiers", "Reports", "Settings"];
    for (const label of labels) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("the brand chip + name render in the header row", async ({ page }) => {
    await page.goto("/Terminal");
    await expect(page.getByTestId("sidebar").getByText("VeloxPOS", { exact: true })).toBeVisible();
  });

  test("SPA navigation switches views without full reloads", async ({ page }) => {
    await page.goto("/Terminal");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/Dashboard$/);

    await nav.getByRole("link", { name: "Inventory" }).click();
    await expect(page.getByRole("heading", { name: "Inventory", level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/Inventory$/);

    await nav.getByRole("link", { name: "Reports" }).click();
    await expect(page.getByRole("heading", { name: "Reports", level: 1 })).toBeVisible();
  });

  test("deep links land on the right view (PascalCase rewrites)", async ({ page }) => {
    await page.goto("/Reports");
    await expect(page.getByRole("heading", { name: "Reports", level: 1 })).toBeVisible();
    await page.goto("/Inventory");
    await expect(page.getByRole("heading", { name: "Inventory", level: 1 })).toBeVisible();
  });

  test("the sidebar collapses to the icon rail and back", async ({ page }) => {
    await page.goto("/Terminal");
    const toggle = page.getByRole("button", { name: "Collapse sidebar" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
    // the labels are hidden in the collapsed rail (aria-labels survive)
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Terminal" })).toBeVisible();
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  });

  test("unknown routes render the measured 404 surface", async ({ page }) => {
    await page.goto("/DoesNotExist");
    await expect(page.getByText("Página no encontrada")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ir al Terminal" })).toBeVisible();
  });
});

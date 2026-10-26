import { expect, test } from "@playwright/test";

// Inventory: the measured layout (F17/F18) + working CRUD (the reference's
// create flow never completes — F10).
test.describe("inventory", () => {
  test("the empty state and count subtitle render", async ({ page }) => {
    await page.goto("/Inventory");
    await expect(page.getByRole("heading", { name: "Inventory", level: 1 })).toBeVisible();
    const subtitle = page.getByText(/products? registered$/);
    await expect(subtitle).toBeVisible();
  });

  test("create a product through the dialog (the reference's broken flow, fixed)", async ({ page }) => {
    await page.goto("/Inventory");
    await page.getByTestId("new-product").click();
    const dialog = page.getByTestId("product-dialog");
    await expect(dialog).toBeVisible();

    const barcode = `INV${Date.now()}`;
    await page.getByTestId("product-name").fill("Inventory Latte");
    await page.getByTestId("product-barcode").fill(barcode);
    await page.getByTestId("product-price").fill("4.20");
    await page.getByTestId("product-cost").fill("1.90");
    await page.getByTestId("product-stock").fill("12");
    await page.getByTestId("product-min-stock").fill("3");
    await page.getByTestId("product-tax").fill("16");
    // defaults hold: Unit=Piece, Active checked (F18)
    await expect(page.getByTestId("product-unit")).toHaveValue("Piece");
    await expect(page.getByTestId("product-active")).toBeChecked();

    await page.getByTestId("product-submit").click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("inventory-table")).toContainText("Inventory Latte");
    await expect(page.getByTestId("inventory-table")).toContainText(barcode);
    await expect(page.getByTestId("inventory-table")).toContainText("$4.20");
    await expect(page.getByTestId("inventory-table")).toContainText("Active");
  });

  test("edit a product inline (price change reflects immediately)", async ({ page }) => {
    await page.goto("/Inventory");
    const row = page.getByTestId("inventory-table").getByRole("row", { name: /Inventory Latte/ });
    await row.getByRole("button", { name: "Edit Inventory Latte" }).click();
    const dialog = page.getByTestId("product-dialog");
    await expect(dialog).toBeVisible();
    await page.getByTestId("product-price").fill("4.50");
    await page.getByTestId("product-submit").click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("inventory-table")).toContainText("$4.50");
  });

  test("search filters by name and by code", async ({ page }) => {
    await page.goto("/Inventory");
    await page.getByTestId("inventory-search").fill("Latte");
    await expect(page.getByTestId("inventory-table")).toContainText("Inventory Latte");
    await page.getByTestId("inventory-search").fill("zzzz-no-match");
    // the table itself persists (the reference's measured pattern): headers
    // stay, the empty row reads the reference's copy
    await expect(page.getByTestId("inventory-table")).toContainText("No products found");
    await page.getByTestId("inventory-search").fill("");
  });

  test("delete a product (confirm dialog)", async ({ page }) => {
    await page.goto("/Inventory");
    page.once("dialog", (d) => d.accept());
    const row = page.getByTestId("inventory-table").getByRole("row", { name: /Inventory Latte/ });
    await row.getByRole("button", { name: "Delete Inventory Latte" }).click();
    await expect(page.getByTestId("inventory-table").getByRole("row", { name: /Inventory Latte/ })).toHaveCount(0);
  });
});

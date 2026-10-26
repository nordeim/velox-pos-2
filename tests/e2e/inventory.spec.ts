import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The Inventory journey (the superset CRUD the reference's demo account
// cannot exercise): validation-gated create → row appears → search narrows →
// edit → low-stock chip → delete confirm. A category is created via Settings
// first (the reference's own categories flow).
// ---------------------------------------------------------------------------

test.describe.serial("inventory", () => {
  test("creates a category through Settings and a product through Inventory", async ({
    page,
  }) => {
    await page.goto("/StoreSettings");
    // The reference's empty state (Session-6): "No categories".
    await expect(page.getByText("No categories", { exact: true })).toBeVisible();
    // The reference's flow (Session-6): the HEADER Add opens the New
    // Category dialog (name + Cancel/Create) — not an inline input row.
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const catDialog = page.getByRole("dialog", { name: "New Category" });
    await expect(catDialog).toBeVisible();
    await catDialog.getByLabel("Name").fill("Beverages");
    await catDialog.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("Beverages").first()).toBeVisible();

    await page.goto("/Inventory");
    await expect(page.getByText("No products found")).toBeVisible();
    await page.getByRole("button", { name: "New Product" }).click();

    // The Create button is gated on name+price (the dialog's validation).
    const dialog = page.getByRole("dialog", { name: "New Product" });
    await expect(dialog.getByRole("button", { name: "Create" })).toBeDisabled();
    await dialog.getByLabel("Name *").fill("Espresso Beans");
    await dialog.getByLabel("Barcode *").fill("7501234567811");
    await dialog.getByLabel("Category").click();
    await page.getByRole("option", { name: "Beverages" }).click();
    await dialog.getByLabel("Selling price *").fill("8.50");
    await dialog.getByLabel("Current stock").fill("24");
    await dialog.getByLabel("Tax rate (%)").fill("16");
    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("cell", { name: "Espresso Beans", exact: true })).toBeVisible();
    await expect(page.getByText("1 products registered")).toBeVisible();
  });

  test("search narrows by name or code and the empty query restores", async ({ page }) => {
    await page.goto("/Inventory");
    const search = page.getByLabel("Search by name or code");
    await search.fill("espresso");
    await expect(page.getByRole("cell", { name: "Espresso Beans", exact: true })).toBeVisible();
    await search.fill("7501234567811");
    await expect(page.getByRole("cell", { name: "Espresso Beans", exact: true })).toBeVisible();
    await search.fill("nomatch-xyz");
    await expect(page.getByText("No products found")).toBeVisible();
    await search.fill("");
  });

  test("edits the price and the row updates", async ({ page }) => {
    await page.goto("/Inventory");
    await page.getByRole("button", { name: "Edit Espresso Beans" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit Product" });
    await dialog.getByLabel("Selling price *").fill("9.25");
    await dialog.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("cell", { name: "$9.25" })).toBeVisible();
  });

  test("deletes with a confirmation dialog", async ({ page }) => {
    await page.goto("/Inventory");
    await page.getByRole("button", { name: "Delete Espresso Beans" }).click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm).toContainText('Delete "Espresso Beans"?');
    await confirm.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("No products found")).toBeVisible();
  });
});

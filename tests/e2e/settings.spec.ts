import { expect, test } from "@playwright/test";

// Settings (the reference's 404 — plan F11): the superset page's tabs work.
test.describe("settings", () => {
  test("the three tabs render with their controls", async ({ page }) => {
    await page.goto("/Settings");
    await expect(page.getByRole("heading", { name: "Settings", level: 1 })).toBeVisible();
    await expect(page.getByTestId("store-settings")).toBeVisible();
    await expect(page.getByTestId("store-name")).toBeVisible();

    await page.getByRole("tab", { name: "Categories" }).click();
    await expect(page.getByTestId("category-manager")).toBeVisible();
    await expect(page.getByTestId("category-name")).toBeVisible();

    await page.getByRole("tab", { name: "Account" }).click();
    await expect(page.getByTestId("account-card")).toBeVisible();
    await expect(page.getByTestId("password-card")).toBeVisible();
  });

  test("store settings save and persist", async ({ page }) => {
    await page.goto("/Settings");
    const nameField = page.getByTestId("store-name");
    await nameField.fill("VeloxPOS Demo Store");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("region", { name: "Notifications" })).toContainText(
      "Store settings saved.",
    );
    // reload proves persistence
    await page.reload();
    await expect(page.getByTestId("store-name")).toHaveValue("VeloxPOS Demo Store");
  });

  test("a category round-trips through the manager", async ({ page }) => {
    await page.goto("/Settings");
    await page.getByRole("tab", { name: "Categories" }).click();
    const name = `Spec Cat ${Date.now()}`;
    await page.getByTestId("category-name").fill(name);
    await page.getByRole("button", { name: "Add category" }).click();
    const row = page.locator("li").filter({ hasText: name });
    await expect(row).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.locator("li").filter({ hasText: name })).toHaveCount(0);
  });
});

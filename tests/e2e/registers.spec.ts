import { expect, test } from "@playwright/test";

// Registers + the shift lifecycle (the Terminal's gate): create → open
// shift → close shift → delete. This spec leaves NO registers behind.
test.describe("registers", () => {
  const name = `Register e2e ${Date.now()}`;

  test("create a register through the measured dialog", async ({ page }) => {
    await page.goto("/Registers");
    await page.getByTestId("new-register").click();
    const dialog = page.getByTestId("register-dialog");
    await expect(dialog).toBeVisible();
    await page.getByTestId("register-name").fill(name);
    await page.getByTestId("register-location").fill("Front door");
    await page.getByTestId("register-submit").click();
    await expect(dialog).toHaveCount(0);
    const card = page.getByTestId("register-cards").locator("li").filter({ hasText: name });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Closed");
  });

  test("open a shift (the float dialog) and see the Terminal unlock", async ({ page }) => {
    await page.goto("/Registers");
    const card = page.getByTestId("register-cards").locator("li").filter({ hasText: name });
    await card.getByRole("button", { name: "Open Shift" }).click();
    const dialog = page.getByTestId("open-shift-dialog");
    await expect(dialog).toBeVisible();
    await page.getByTestId("shift-float").fill("150.00");
    await dialog.getByRole("button", { name: "Open shift" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(card).toContainText("Open shift");

    // The Terminal gate lifts.
    await page.goto("/Terminal");
    await expect(page.getByTestId("terminal-product-grid")).toBeVisible();
    await expect(page.getByTestId("terminal-cart")).toBeVisible();
  });

  test("close the shift with a counted cash figure", async ({ page }) => {
    await page.goto("/Registers");
    const card = page.getByTestId("register-cards").locator("li").filter({ hasText: name });
    await card.getByRole("button", { name: "Close Shift" }).click();
    const dialog = page.getByTestId("close-shift-dialog");
    await expect(dialog).toBeVisible();
    await page.getByTestId("shift-counted").fill("150.00");
    await dialog.getByRole("button", { name: "Close shift" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(card).toContainText("Closed");
    // The recent-shifts section records the close.
    await expect(page.getByText(/counted \$150\.00 \/ expected \$150\.00/)).toBeVisible();
  });

  test("delete the register", async ({ page }) => {
    await page.goto("/Registers");
    page.once("dialog", (d) => d.accept());
    const card = page.getByTestId("register-cards").locator("li").filter({ hasText: name });
    await card.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByTestId("register-cards").locator("li").filter({ hasText: name })).toHaveCount(0);
  });
});

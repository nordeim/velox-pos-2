import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The register + shift lifecycle (the superset workflow): create a register
// (the reference's measured modal), open a shift with an opening float, see
// the Shift-open chip, close it with a counted cash and a variance verdict.
// ---------------------------------------------------------------------------

test.describe.serial("registers & shifts", () => {
  test("creates Register 1 via the measured New Register modal", async ({ page }) => {
    await page.goto("/Registers");
    // Session-10 (F-63) pins — the reference's empty-card family, measured
    // live 2026-10-27: the icon is w-16 (64px) + slate-200 + stroke-2 with
    // mb-3; the copy is slate-500 (the reference's muted design language,
    // matched verbatim). These live HERE (not in surfaces.spec) because the
    // empty state only renders before this test creates Register 1.
    const emptyCopy = page.getByText("No registers configured yet");
    await expect(emptyCopy).toBeVisible();
    await expect(emptyCopy).toHaveCSS("color", "rgb(100, 116, 139)");
    const emptyIcon = emptyCopy.locator("..").locator("svg").first();
    await expect(emptyIcon).toHaveCSS("width", "64px");
    await expect(emptyIcon).toHaveCSS("color", "rgb(226, 232, 240)");
    await expect(emptyIcon).toHaveAttribute("stroke-width", "2");
    await page.getByRole("button", { name: "New Register" }).click();
    const dialog = page.getByRole("dialog", { name: "New Register" });
    await expect(dialog.getByRole("button", { name: "Create" })).toBeDisabled();
    await dialog.getByLabel("Name *").fill("Register 1");
    await dialog.getByLabel("Location").fill("Main entrance");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("1 registers configured")).toBeVisible();
    await expect(page.getByText("No registers configured yet")).toHaveCount(0);
  });

  test("the New Register dialog matches the reference's container, Cancel, and form-text contracts", async ({
    page,
  }) => {
    await page.goto("/Registers");
    await page.getByRole("button", { name: "New Register" }).click();
    const dialog = page.getByRole("dialog", { name: "New Register" });
    await expect(dialog).toBeVisible();

    // Session-11 (F-64): the reference's dialogs are SOLID rgb(15,18,26)
    // (#0f121a via --card) + 1px rgb(38,42,54) (#262a36) + NO backdrop
    // filter + rounded-lg (8px). The clone's glass-dark (translucent
    // #0d0f1a@95 + blur(20px) + white/6 border) was the initial build's
    // invention — and its border-edge companion override was inert (trap
    // #15: unlayered glass wins over utilities).
    await expect(dialog).toHaveCSS("background-color", "rgb(15, 18, 26)");
    await expect(dialog).toHaveCSS("border-color", "rgb(38, 42, 54)");
    await expect(dialog).toHaveCSS("backdrop-filter", "none");
    await expect(dialog).toHaveCSS("border-radius", "8px");
    // F-68: the reference's register dialog is 512px (max-w-lg), not 448.
    // The raw width read POLLS (the Session-7 F-51 doctrine): the 200ms
    // zoom-in-95 entrance reads ~511.6 mid-animation, exactly like the
    // scroll-lock race — every raw computed read in the suite polls.
    await expect
      .poll(() => dialog.evaluate((el) => el.getBoundingClientRect().width))
      .toBe(512);

    // F-67: the Cancel = the gray glass-button family (the same treatment the
    // clone's own category-dialog Cancel already shipped) — not a bare ghost.
    const cancel = dialog.getByRole("button", { name: "Cancel" });
    await expect(cancel).toHaveCSS("background-color", "rgba(28, 31, 52, 0.85)");
    await expect(cancel).toHaveCSS("border-color", "rgba(255, 255, 255, 0.09)");

    // F-66: the #e7e9ef form-text family — the title, the label, and the
    // input's typed text all compute rgb(231,233,239) (the --foreground the
    // token table already carries; the white/white-70 overrides bypassed it).
    const title = dialog.locator("h2").first();
    await expect(title).toHaveCSS("color", "rgb(231, 233, 239)");
    const nameLabel = dialog.getByText("Name *", { exact: true });
    await expect(nameLabel).toHaveCSS("color", "rgb(231, 233, 239)");
    await expect(nameLabel).toHaveCSS("font-size", "14px");
    await expect(nameLabel).toHaveCSS("font-weight", "500");
    const nameInput = dialog.getByLabel("Name *");
    await nameInput.fill("Probe Register (cancelled)");
    await expect(nameInput).toHaveCSS("color", "rgb(231, 233, 239)");

    // Close via the measured Cancel — no register is created (order safety
    // for the rest of the serial describe: the ledger keeps exactly one).
    await cancel.click();
    await expect(dialog).toHaveCount(0);
  });

  test("opens a shift with an opening float", async ({ page }) => {
    await page.goto("/Registers");
    await page.getByRole("button", { name: "Open shift" }).click();
    const dialog = page.getByRole("dialog", { name: "Open shift — Register 1" });
    await dialog.getByLabel("Opening float").fill("100");
    await dialog.getByRole("button", { name: "Open shift" }).click();
    await expect(page.getByTestId("register-Register 1").getByText("Shift open")).toBeVisible();
  });

  test("the terminal un-gates and the catalog empty-state appears", async ({ page }) => {
    await page.goto("/POS");
    await expect(page.getByRole("heading", { name: "No active shift" })).toHaveCount(0);
    await expect(page.getByText("No products yet. Add them in Inventory.")).toBeVisible();
  });

  test("closes the shift: expected cash, variance verdict, register released", async ({
    page,
  }) => {
    await page.goto("/Registers");
    await page.getByRole("button", { name: "Close shift" }).click();
    const dialog = page.getByRole("dialog", { name: "Close shift" });
    await expect(dialog.getByTestId("expected-cash")).toContainText("$100.00");
    await dialog.getByLabel("Counted cash").fill("99.50");
    await expect(dialog.getByTestId("shift-variance")).toContainText("Short");
    await dialog.getByRole("button", { name: "Close shift" }).click();
    await expect(page.getByTestId("register-Register 1").getByText("Shift open")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open shift" })).toBeVisible();
  });

  test("a register without shift history deletes cleanly", async ({ page }) => {
    await page.goto("/Registers");
    await page.getByRole("button", { name: "New Register" }).click();
    const dialog = page.getByRole("dialog", { name: "New Register" });
    await dialog.getByLabel("Name *").fill("Register 2");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("2 registers configured")).toBeVisible();
    await page.getByRole("button", { name: "Delete Register 2" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByText("1 registers configured")).toBeVisible();
  });
});

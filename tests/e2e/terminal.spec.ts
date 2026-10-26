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
});

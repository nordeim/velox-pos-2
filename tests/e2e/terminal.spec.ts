import { expect, test } from "@playwright/test";

// The Terminal flow: the no-shift gate, then a full sale through the cart +
// checkout + receipt (THE core POS loop — the reference's own write flows
// never complete, plan F10; this spec pins the superset).
//
// Order matters: registers.spec.ts runs first (alphabetical file order with
// workers=1 is NOT guaranteed) — so this file creates its OWN register +
// shift via the API instead of relying on other specs' leftovers.
test.describe("terminal", () => {
  let registerId: string;

  test.beforeAll(async ({ request }) => {
    // A dedicated register for this spec (unique name → no cross-spec clash).
    // The shift opens WITHIN the sale test so the gate test below sees the
    // no-shift state first.
    const res = await request.post("/api/registers", {
      data: { name: `Terminal spec ${Date.now()}`, location: "e2e" },
    });
    expect(res.status()).toBe(201);
    const register = (await res.json()) as { id: string };
    registerId = register.id;
  });

  test.afterAll(async ({ request }) => {
    // Close any open shift first (DELETE fails while a shift is open).
    const shifts = (await (await request.get("/api/shifts")).json()) as Array<{
      id: string;
      registerId: string;
      status: string;
    }>;
    for (const shift of shifts) {
      if (shift.registerId === registerId && shift.status === "open") {
        await request.post(`/api/shifts/${shift.id}/close`, { data: { closingCash: 0 } });
      }
    }
    await request.delete(`/api/registers/${registerId}`);
  });

  test("the Terminal gates selling behind an open shift", async ({ page, request }) => {
    // Other specs in the shared e2e.db may leave open shifts — close them so
    // THIS spec owns the gate state.
    const shifts = (await (await request.get("/api/shifts")).json()) as Array<{
      id: string;
      status: string;
    }>;
    for (const shift of shifts) {
      if (shift.status === "open") {
        await request.post(`/api/shifts/${shift.id}/close`, { data: { closingCash: 0 } });
      }
    }

    await page.goto("/Terminal");
    const gate = page.getByTestId("terminal-no-shift");
    await expect(gate).toBeVisible();
    await expect(gate.getByRole("heading", { name: "No active shift" })).toBeVisible();
    // the cart rail exists but shows the empty state
    await expect(page.getByTestId("terminal-cart")).toBeHidden();
  });

  test("a full sale: open shift → add to cart → charge cash → receipt", async ({ page, request }) => {
    // Seed a product via the API (the inventory spec covers the UI form).
    const product = (
      await (
        await request.post("/api/products", {
          data: {
            name: "Terminal Espresso",
            barcode: `T${Date.now()}`,
            price: 3.5,
            stock: 10,
            minStock: 2,
            taxRate: 16,
          },
        })
      ).json()
    ) as { id: string };

    await request.post("/api/shifts", {
      data: { registerId, openingFloat: 100 },
    });

    await page.goto("/Terminal");
    // The grid replaces the gate.
    await expect(page.getByTestId("terminal-product-grid")).toBeVisible();

    // Add the product by clicking its card.
    await page.getByTestId(`terminal-product-${product.id}`).click();
    await expect(page.getByTestId("terminal-added")).toBeVisible();
    await expect(page.getByTestId("cart-subtotal")).toHaveText("$3.50");
    await expect(page.getByTestId("cart-total")).toHaveText("$4.06"); // 3.50 + 16%

    // Bump qty to 2.
    await page.getByRole("button", { name: "Increase Terminal Espresso" }).click();
    await expect(page.getByTestId("cart-total")).toHaveText("$8.12");

    // Charge.
    await page.getByTestId("terminal-charge").click();
    const dialog = page.getByTestId("checkout-dialog");
    await expect(dialog).toBeVisible();
    // The tender pre-fills with the suggested denomination (round up to 50¢).
    await expect(page.getByTestId("checkout-change")).toContainText("Change due:");

    // 10.00 tendered → change $1.88
    await page.getByTestId("checkout-cash").fill("10.00");
    await expect(page.getByTestId("checkout-change")).toContainText("$1.88");
    await page.getByTestId("checkout-confirm").click();

    const receipt = page.getByTestId("receipt-dialog");
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText("TOTAL");
    await expect(receipt).toContainText("$8.12");
    await expect(receipt).toContainText("$1.88");
    await receipt.getByRole("button", { name: "Close", exact: true }).click();

    // The cart cleared; stock decremented.
    await expect(page.getByTestId("cart-total")).toHaveText("$0.00");
    await expect(page.getByTestId(`terminal-product-${product.id}`)).toContainText("8 in stock");
  });

  test("the barcode box rejects unknown codes with a toast", async ({ page }) => {
    // The shift from the sale test is still open — the barcode box renders.
    await page.goto("/Terminal");
    await expect(page.getByTestId("terminal-barcode")).toBeVisible();
    await page.getByTestId("terminal-barcode").fill("0000000000");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByRole("region", { name: "Notifications" })).toContainText(
      "No product matches code 0000000000.",
    );
  });
});

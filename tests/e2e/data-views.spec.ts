import { expect, test } from "@playwright/test";

// Reports (F15) + Sales (F12) + Dashboard (F14) + Cashiers (F20) — the
// data-bearing surfaces at their measured anchor points.
test.describe("dashboard", () => {
  test("renders the four stat cards and the 7-day chart", async ({ page }) => {
    await page.goto("/Dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    for (const id of ["stat-today-sales", "stat-transactions", "stat-products", "stat-low-stock"]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
    await expect(page.getByTestId("stat-today-sales")).toContainText("TODAY'S SALES");
    await expect(page.getByRole("heading", { name: "Sales — Last 7 days" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Products by Category" })).toBeVisible();
    // the date subtitle renders (client-side clock)
    await expect(page.getByText(/\w+, \w+ \d+, \d{4}/).first()).toBeVisible();
  });
});

test.describe("sales (Historial de Ventas)", () => {
  test("renders the Spanish copy and the measured columns", async ({ page }) => {
    await page.goto("/Sales");
    await expect(page.getByRole("heading", { name: "Historial de Ventas", level: 1 })).toBeVisible();
    await expect(page.getByText(/registrada/)).toBeVisible();
    await expect(page.getByTestId("sales-search")).toBeVisible();
    for (const column of ["TICKET", "FECHA", "CAJERO", "MÉTODO", "TOTAL", "ESTADO", "ACCIONES"]) {
      await expect(page.getByRole("columnheader", { name: column })).toBeVisible();
    }
  });

  test("a completed sale appears with its ticket and opens the receipt", async ({ page, request }) => {
    // Sell something via the API to have a deterministic row.
    const product = (
      await (
        await request.post("/api/products", {
          data: { name: "Sales-spec Latte", barcode: `S${Date.now()}`, price: 2, stock: 5, taxRate: 0 },
        })
      ).json()
    ) as { id: string };
    const register = (
      await (
        await request.post("/api/registers", {
          data: { name: `Sales spec ${Date.now()}` },
        })
      ).json()
    ) as { id: string };
    const shift = (
      await (
        await request.post("/api/shifts", { data: { registerId: register.id, openingFloat: 0 } })
      ).json()
    ) as { id: string };
    const sale = (
      await (
        await request.post("/api/sales", {
          data: {
            registerId: register.id,
            method: "cash",
            paid: 5,
            items: [{ productId: product.id, qty: 1 }],
          },
        })
      ).json()
    ) as { id: string; ticketNo: string };

    await page.goto("/Sales");
    const row = page.getByRole("row", { name: new RegExp(sale.ticketNo) });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: new RegExp(`Ver ${sale.ticketNo}`) }).click();
    const detail = page.getByTestId("sale-detail-dialog");
    await expect(detail).toBeVisible();
    await expect(detail).toContainText("Sales-spec Latte");
    await expect(detail).toContainText("$2.00");

    // Refund restores stock + flips the status pill (the confirm dialog is
    // armed BEFORE the click that triggers it).
    page.once("dialog", (d) => d.accept());
    await detail.getByRole("button", { name: "Reembolsar" }).click();
    await expect(page.getByRole("row", { name: new RegExp(sale.ticketNo) })).toContainText(
      "Reembolsada",
    );

    // cleanup: close the shift + delete the register
    await request.post(`/api/shifts/${shift.id}/close`, { data: { closingCash: 0 } });
    await request.delete(`/api/registers/${register.id}`);
  });
});

test.describe("reports", () => {
  test("renders the period chips, stat cards, and both method panels", async ({ page }) => {
    await page.goto("/Reports");
    await expect(page.getByRole("heading", { name: "Reports", level: 1 })).toBeVisible();
    await expect(page.getByRole("group", { name: "Report period" })).toBeVisible();
    for (const p of ["7 days", "14 days", "30 days", "90 days"]) {
      await expect(page.getByRole("button", { name: p })).toBeVisible();
    }
    for (const id of ["report-revenue", "report-transactions", "report-avg-ticket"]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
    await expect(page.getByText("DAILY SALES")).toBeVisible();
    await expect(page.getByText("REVENUE BY PAYMENT METHOD")).toBeVisible();
    await expect(page.getByText("BREAKDOWN BY METHOD")).toBeVisible();
  });

  test("switching periods keeps the layout responsive", async ({ page }) => {
    await page.goto("/Reports");
    await page.getByRole("button", { name: "7 days" }).click();
    await expect(page.getByText("DAILY SALES")).toBeVisible();
    await page.getByRole("button", { name: "90 days" }).click();
    await expect(page.getByText("DAILY SALES")).toBeVisible();
  });
});

test.describe("cashiers (Cajeros)", () => {
  test("renders the Spanish headers and the recent-shifts table", async ({ page }) => {
    await page.goto("/Cashiers");
    await expect(page.getByRole("heading", { name: "Cajeros", level: 1 })).toBeVisible();
    await expect(page.getByText(/registrado/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Turnos Recientes" })).toBeVisible();
    for (const column of ["CAJERO", "CAJA", "INICIO", "FIN", "VENTAS", "ESTADO"]) {
      await expect(page.getByRole("columnheader", { name: column })).toBeVisible();
    }
  });

  test("create + deactivate + delete a cashier (admin)", async ({ page }) => {
    await page.goto("/Cashiers");
    await page.getByTestId("new-cashier").click();
    const dialog = page.getByTestId("cashier-dialog");
    await expect(dialog).toBeVisible();
    const email = `cashier-${Date.now()}@veloxpos.app`;
    await page.getByTestId("cashier-name").fill("Spec Cashier");
    await page.getByTestId("cashier-email").fill(email);
    await page.getByTestId("cashier-password").fill("Cashier123!");
    await page.getByTestId("cashier-role").selectOption("cashier");
    await dialog.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toHaveCount(0);

    const card = page.getByTestId("cashier-cards").locator("li").filter({ hasText: "Spec Cashier" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Deactivate" }).click();
    await expect(card).toContainText("Inactive");

    page.once("dialog", (d) => d.accept());
    await card.getByRole("button", { name: "Delete Spec Cashier" }).click();
    await expect(page.getByTestId("cashier-cards").locator("li").filter({ hasText: "Spec Cashier" })).toHaveCount(0);
  });
});

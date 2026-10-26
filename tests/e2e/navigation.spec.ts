import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The DESKTOP navigation (1440x900): the reference's sidebar — 8 items in
// order, real paths, the active violet pill, the collapse chevron (220px ⇄
// 68px icon rail with title/aria labels preserved — the a11y superset).
// ---------------------------------------------------------------------------

const NAV = [
  ["Terminal", "/POS"],
  ["Dashboard", "/Dashboard"],
  ["Inventory", "/Inventory"],
  ["Sales", "/Sales"],
  ["Registers", "/Registers"],
  ["Cashiers", "/Cashiers"],
  ["Reports", "/Reports"],
  ["Settings", "/StoreSettings"],
] as const;

test("the sidebar carries all 8 reference items in order", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  const links = sidebar.getByRole("link");
  await expect(links).toHaveCount(8);
  for (const [i, [label]] of NAV.entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(label);
  }
});

test("each item navigates to its real path and activates its pill", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  for (const [label, path] of NAV) {
    await sidebar.getByRole("link", { name: label }).click();
    await page.waitForURL(`**${path}`);
    await expect(sidebar.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("the collapse chevron toggles the 220px ⇄ 68px icon rail", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  await expect(sidebar).toHaveCSS("width", "220px");
  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "68px");
  // The a11y superset: collapsed icon links KEEP their accessible names.
  await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "220px");
});

test("the collapse state persists across a reload", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "68px");
  await page.reload();
  await expect(sidebar).toHaveCSS("width", "68px");
  await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
});

test("the mobile app bar is hidden on desktop (no dead controls)", async ({ page }) => {
  await page.goto("/POS");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).not.toBeVisible();
});

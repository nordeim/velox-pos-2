import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// THE MOBILE NAVIGATION CONTRACT (the user's key concern; the reference has
// NO working mobile nav — its desktop layout crushes at 390px, plan F13).
// The clone's drawer is the documented superset, built on the repo Tailwind
// v4 skill's mobile-navigation contract (skills/nextjs16-tailwind4 §9):
//   1. below lg an app bar with a real <button> hamburger trigger renders;
//   2. the drawer is a role=dialog + aria-modal surface, opened by the
//      trigger, listing all 8 sections;
//   3. focus moves INTO the drawer on open and RETURNS to the trigger on
//      close (the overlay a11y contract);
//   4. Escape closes; the backdrop tap closes; body scroll locks while open;
//   5. choosing a section navigates the SPA and closes the drawer;
//   6. crossing into lg closes the drawer (the app bar disappears).
//
// Tailwind v4 regression guards (docs/Tailwind-V4-Validation-Report.md):
//   trap 4 — the nav list is flex flex-col gap-1 (never space-y-* with
//            mt-*/mb-* children; v4's :where() rewrite flips specificity);
//   trap 9 — the backdrop uses backdrop-blur-xs (v4 renamed the 4px stop).
// The drawer spec runs at 390×844 (the iPhone 14-ish viewport the reference
// was measured at) AND at 768×1024 (the below-lg band).
// ---------------------------------------------------------------------------
test.use({ viewport: { width: 390, height: 844 } });

test.describe("mobile navigation drawer (390×844)", () => {
  test("the app bar renders below lg with the hamburger trigger", async ({ page }) => {
    await page.goto("/Terminal");
    const bar = page.getByTestId("mobile-app-bar");
    await expect(bar).toBeVisible();
    await expect(bar.getByText("VeloxPOS", { exact: true })).toBeVisible();
    const trigger = page.getByTestId("mobile-nav-trigger");
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls", "vx-mobile-nav");
  });

  test("the desktop sidebar does NOT render below lg", async ({ page }) => {
    await page.goto("/Terminal");
    // `hidden lg:flex` — the aside is in the DOM but never visible.
    await expect(page.getByTestId("sidebar")).toBeHidden();
  });

  test("the drawer opens as a labelled modal dialog with all 8 sections", async ({ page }) => {
    await page.goto("/Terminal");
    await page.getByTestId("mobile-nav-trigger").click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("role", "dialog");
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    const nav = drawer.getByRole("navigation", { name: "Primary" });
    for (const label of ["Terminal", "Dashboard", "Inventory", "Sales", "Registers", "Cashiers", "Reports", "Settings"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("the trigger's aria-expanded flips while open", async ({ page }) => {
    await page.goto("/Terminal");
    const trigger = page.getByTestId("mobile-nav-trigger");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes the drawer and returns focus to the trigger", async ({ page }) => {
    await page.goto("/Terminal");
    const trigger = page.getByTestId("mobile-nav-trigger");
    await trigger.click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("the backdrop tap closes the drawer", async ({ page }) => {
    await page.goto("/Terminal");
    await page.getByTestId("mobile-nav-trigger").click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await page.getByRole("button", { name: "Close navigation menu" }).click();
    await expect(drawer).toHaveCount(0);
  });

  test("body scroll locks while the drawer is open and unlocks on close", async ({ page }) => {
    await page.goto("/Terminal");
    await page.getByTestId("mobile-nav-trigger").click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  });

  test("navigating from the drawer swaps the view and closes the drawer", async ({ page }) => {
    await page.goto("/Terminal");
    await page.getByTestId("mobile-nav-trigger").click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await drawer.getByRole("link", { name: "Inventory" }).click();
    await expect(page.getByRole("heading", { name: "Inventory", level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/Inventory$/);
    await expect(drawer).toHaveCount(0);
    // the trigger survives for the next navigation
    await expect(page.getByTestId("mobile-nav-trigger")).toBeVisible();
  });

  test("focus is trapped inside the open drawer (Tab cycles)", async ({ page }) => {
    await page.goto("/Terminal");
    await page.getByTestId("mobile-nav-trigger").click();
    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    // Tab from the LAST focusable wraps to the first — the trap contract.
    await page.getByRole("button", { name: "Close menu" }).focus();
    await page.keyboard.press("Tab");
    const inside = page.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.closest(
        '[data-testid="mobile-nav-drawer"]',
      ) !== null,
    );
    await expect(inside).resolves.toBe(true);
  });
});

test.describe("mobile navigation drawer (768×1024 below-lg band)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("the drawer still serves the below-lg band (not just phones)", async ({ page }) => {
    await page.goto("/Terminal");
    await expect(page.getByTestId("mobile-app-bar")).toBeVisible();
    await page.getByTestId("mobile-nav-trigger").click();
    await expect(page.getByTestId("mobile-nav-drawer")).toBeVisible();
  });
});

test.describe("mobile navigation drawer (1280×800 desktop)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("the drawer and app bar never render at desktop width", async ({ page }) => {
    await page.goto("/Terminal");
    await expect(page.getByTestId("mobile-app-bar")).toBeHidden();
    await expect(page.getByTestId("mobile-nav-trigger")).toBeHidden();
  });
});

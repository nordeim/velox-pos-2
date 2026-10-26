import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// THE MOBILE NAVIGATION SPEC (390x844 — the user-pinned surface).
//
// The REFERENCE keeps a 220px sidebar overlaying the content on phones with
// NO hamburger (its own mobile defect). The clone ships the documented a11y
// SUPERSET instead: a labeled hamburger in a top app bar, a slide-in
// glass-dark drawer (role=dialog, aria-modal), labeled links, navigate ⇒
// auto-close (the drawer UNMOUNTS), Escape, backdrop tap, and NO horizontal
// overflow. The Tailwind-v4 trap discipline this spec pins:
//   - the drawer's custom .glass-dark surface is plain CSS (never @layer
//     utilities, which lose the cascade in v4);
//   - the nav list is flex gap-* (never space-y-* with mt-*/mb-* children —
//     v4's :where() rewrite flips that specificity).
// ---------------------------------------------------------------------------

test.describe("mobile navigation (the drawer superset)", () => {
  test("the app bar shows a labeled hamburger; the desktop sidebar is gone", async ({
    page,
  }) => {
    await page.goto("/POS");
    const hamburger = page.getByRole("button", { name: "Open navigation menu" });
    await expect(hamburger).toBeVisible();
    // `hidden md:flex` keeps the aside IN THE DOM below md — assert the
    // VISIBILITY contract (what users and the a11y tree experience).
    await expect(page.getByTestId("app-sidebar")).not.toBeVisible();
    // No dead controls: the desktop-only collapse chevron is not visible.
    await expect(page.getByRole("button", { name: "Collapse sidebar" })).not.toBeVisible();
  });

  test("no horizontal overflow at 390px (the reference's own defect stays fixed)", async ({
    page,
  }) => {
    await page.goto("/Dashboard");
    // Session-7 (F-51 sibling): polled for the same reason — a raw evaluate
    // read is a single sample that races hydration; expect.poll retries
    // through it (same assertion: the document never scrolls horizontally).
    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(0);
  });

  test("the drawer opens with role=dialog, 8 labeled links, and the brand", async ({
    page,
  }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    const links = drawer.getByRole("link");
    await expect(links).toHaveCount(8);
    for (const label of [
      "Terminal",
      "Dashboard",
      "Inventory",
      "Sales",
      "Registers",
      "Cashiers",
      "Reports",
      "Settings",
    ]) {
      await expect(links.filter({ hasText: label })).toBeVisible();
    }
  });

  test("navigating from the drawer auto-closes it (it UNMOUNTS)", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Inventory" }).click();
    await page.waitForURL("**/Inventory");
    await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
  });

  test("Escape closes the drawer", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
  });

  test("the backdrop tap closes the drawer", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
    // The backdrop's geometric center sits under the 288px drawer — click a
    // point on the backdrop that is actually OUTSIDE the panel (x > 288).
    await page.mouse.click(350, 400);
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
  });

  test("the drawer's own X closes it", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Close navigation menu" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
  });

  test("the active view is highlighted inside the drawer", async ({ page }) => {
    await page.goto("/Reports");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page.getByRole("dialog").getByRole("link", { name: "Reports" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("the terminal surface at 390px shows the gate AND the cart (reference parity)", async ({
    page,
  }) => {
    await page.goto("/POS");
    await expect(page.getByRole("heading", { name: "No active shift" })).toBeVisible();
    await expect(page.getByTestId("cart-panel")).toBeVisible();
    await expect(page.getByTestId("charge-button")).toContainText("CHARGE $0.00");
  });

  // -------------------------------------------------------------------------
  // Session-3 a11y pins (the focus-management superset — the neo-crm family
  // standard): focus moves into the dialog on open, Tab is contained (wraps
  // at both ends), Escape restores focus to the trigger, and the drawer
  // auto-closes when the viewport grows past md (no stuck scroll lock).
  // -------------------------------------------------------------------------

  test("opening the drawer moves focus into the dialog (the close button)", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Close navigation menu" })).toBeFocused();
  });

  test("Tab is trapped inside the drawer (wraps at both ends)", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(drawer).toBeVisible();
    // Tab from the LAST focusable (Settings) wraps to the FIRST (the X).
    await drawer.getByRole("link", { name: "Settings" }).focus();
    await page.keyboard.press("Tab");
    await expect(drawer.getByRole("button", { name: "Close navigation menu" })).toBeFocused();
    // Shift+Tab from the FIRST wraps back to the LAST.
    await page.keyboard.press("Shift+Tab");
    await expect(drawer.getByRole("link", { name: "Settings" })).toBeFocused();
  });

  test("Escape closes the drawer and restores focus to the hamburger", async ({ page }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeFocused();
  });

  test("the drawer auto-closes when the viewport grows past md (no stuck scroll lock)", async ({
    page,
  }) => {
    await page.goto("/POS");
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
    await page.setViewportSize({ width: 800, height: 900 });
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
    // Session-7 (F-51): POLL the overflow restore — the dialog node unmounts
    // in React's commit, but the passive-effect cleanup that restores
    // body overflow flushes after it; a raw evaluate read raced that window
    // and failed the pin reliably (the doctrine: raw computed reads do NOT
    // retry like toHaveCSS — expect.poll every one of them).
    await expect
      .poll(async () => page.evaluate(() => document.body.style.overflow))
      .not.toBe("hidden");
  });
});

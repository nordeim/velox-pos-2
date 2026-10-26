import { expect, test } from "@playwright/test";

// The logged-out surface: the reference's hosted-auth layout (plan F21).
// Opted out of the shared storageState at the FILE level (use.test.ts).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("auth", () => {
  test("the login card renders the reference layout", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Welcome to VeloxPOS (Point Of Sale)",
    );
    await expect(page.getByText("Sign in to continue")).toBeVisible();
    for (const provider of ["Google", "Microsoft", "Facebook", "Apple"]) {
      await expect(page.getByRole("button", { name: `Continue with ${provider}` })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Need an account? Sign up" }),
    ).toBeVisible();
  });

  test("an unauthenticated root redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a wrong password announces the inline error and stays", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("demo@veloxpos.app");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit").click();
    const notice = page.getByTestId("auth-notice");
    await expect(notice).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("the demo user signs in and reaches the shell", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("demo@veloxpos.app");
    await page.getByTestId("login-password").fill("Demo1234!");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Terminal" })).toBeVisible();
    // the e2e hydration gate
    await expect(page.locator("html[data-app-hydrated='true']")).toHaveCount(1);
  });
});

import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The auth surface: logged-OUT flows only (the suite's storageState is
// bypassed) — wrong credentials, the success path, protected-route gating,
// and the Spanish 404's escape hatch.
// ---------------------------------------------------------------------------

test.use({ storageState: { cookies: [], origins: [] } });

test("the login card renders the reference copy", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome to VeloxPOS (Point Of Sale)" })).toBeVisible();
  await expect(page.getByText("Sign in to continue")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Apple" })).toBeVisible();
  await expect(page.getByText("OR", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByText("Need an account?")).toBeVisible();
});

test("wrong credentials surface the API's error and keep the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByTestId("login-submit").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("successful sign-in lands on the Terminal with the shift gate", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/POS");
  await expect(page.getByRole("heading", { name: "No active shift" })).toBeVisible();
  await expect(page.getByTestId("charge-button")).toBeDisabled();
});

test("the (app) route group gates the guest server-side", async ({ page }) => {
  await page.goto("/Dashboard");
  await page.waitForURL(/\/login/);
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/StoreSettings");
  await page.waitForURL(/\/login/);
});

test("login honors from_url (deep-link return)", async ({ page }) => {
  await page.goto("/login?from_url=%2FReports");
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/Reports");
  await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
});

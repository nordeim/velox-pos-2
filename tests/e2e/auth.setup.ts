import { expect, test as setup } from "@playwright/test";

// The single sign-in the whole suite reuses (storageState): the rate limiter
// allows 10 attempts/IP/15 min — logging in per test would exhaust it.
const AUTH_STATE = "tests/e2e/.auth/user.json";

const OWNER_EMAIL = "sepnetflix2023@outlook.com";
const OWNER_PASSWORD = "$Abcd1234";

setup("authenticate as the store owner", async ({ page }) => {
  await page.goto("/login");
  // The submit button is DISABLED until React hydrates (the pre-hydration
  // native-submit guard) — waiting for it to enable also guarantees the
  // controlled inputs are live before fill() types into them.
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/POS");
  await expect(page.getByRole("heading", { name: "No active shift" })).toBeVisible();
  await page.context().storageState({ path: AUTH_STATE });
});

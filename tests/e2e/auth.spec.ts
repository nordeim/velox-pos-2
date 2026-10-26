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

// ---------------------------------------------------------------------------
// Session-4 pins: the login canvas gradient (the reference computes a
// to-bottom-right slate-50 → slate-100 gradient, not a flat fill) and the
// single-phrase signup button (the reference makes the WHOLE phrase
// "Need an account? Sign up" one slate-500 button).
// ---------------------------------------------------------------------------

test("the login canvas is the reference's slate gradient (not a flat fill)", async ({ page }) => {
  await page.goto("/login");
  const canvas = page.locator(".login-canvas");
  await expect(canvas).toBeVisible();
  const image = await canvas.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(image).toContain("linear-gradient");
  expect(image).toContain("248, 250, 252");
  expect(image).toContain("241, 245, 249");
});

test("the signup affordance is the reference's single-phrase slate-500 button", async ({
  page,
}) => {
  await page.goto("/login");
  const signup = page.getByRole("button", { name: "Need an account? Sign up" });
  await expect(signup).toBeVisible();
  await expect(signup).toHaveCSS("color", "rgb(100, 116, 139)");
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

// ---------------------------------------------------------------------------
// Session-5 pins: the login form internals, measured live on the reference
// (2026-10-26 evening). The reference's inputs are h-11 sm:h-12 (48px
// desktop) with slate-200 borders, slate-50/50 fill, 12px radius, pl-10;
// its card is bg-white/95 + backdrop-blur + shadow-2xl with a 4px top
// gradient strip; its logo renders as a 96x96 img (the hexagonal crystal).
// ---------------------------------------------------------------------------

test("login inputs compute the reference's light geometry (48px, slate borders, filled)", async ({
  page,
}) => {
  await page.goto("/login");
  const email = page.getByLabel("Email");
  await expect(email).toBeVisible();
  await expect(email).toHaveCSS("height", "48px");
  await expect(email).toHaveCSS("border-color", "rgb(226, 232, 240)");
  await expect(email).toHaveCSS("border-radius", "12px");
  await expect(page.getByLabel("Password")).toHaveCSS("height", "48px");
  // bg-slate-50/50: v4 serializes the slate ramp as oklab(.../0.5); the
  // reference's rgba(248,250,252,0.5) is the same color — pin the fill's
  // alpha either way (same posture as the Reports white/60 pin).
  const bg = await email.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toMatch(/rgba\(248, 250, 252, 0\.5\)|oklab\([^)]*\/\s*0\.5\)/);
});

test("the login card carries the reference's shadow + 4px top gradient strip", async ({
  page,
}) => {
  await page.goto("/login");
  const card = page.locator("main.login-canvas > div");
  await expect(card).toBeVisible();
  // shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25) — assert a big dark shadow.
  const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).toContain("25px 50px");
  expect(shadow).toContain("0.25)");
  // The 4px strip: an absolutely-positioned h-1 gradient child of the card.
  const strip = card.locator(
    "div.absolute.top-0.left-0.right-0.h-1",
  );
  await expect(strip).toBeVisible();
  await expect(strip).toHaveCSS("height", "4px");
  const stripBg = await strip.evaluate((el) =>
    getComputedStyle(el).backgroundImage,
  );
  expect(stripBg).toContain("linear-gradient");
});

test("the login logo is the reference's img (the hexagonal crystal asset)", async ({
  page,
}) => {
  await page.goto("/login");
  const logo = page.getByAltText("VeloxPOS (Point Of Sale) logo");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveCSS("width", "96px");
  await expect(logo).toHaveCSS("height", "96px");
});

test("the sign-in button is the reference's font-medium 48px", async ({ page }) => {
  await page.goto("/login");
  const submit = page.getByTestId("login-submit");
  await expect(submit).toBeVisible();
  await expect(submit).toHaveCSS("font-weight", "500");
  await expect(submit).toHaveCSS("height", "48px");
});

test("SSO buttons compute the reference's py-3.5 (54px)", async ({ page }) => {
  await page.goto("/login");
  const google = page.getByRole("button", { name: "Continue with Google" });
  await expect(google).toBeVisible();
  await expect(google).toHaveCSS("height", "54px");
});

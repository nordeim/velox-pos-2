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
  // Session-12 (F-85f): the reference's divider label is lowercase "or" in
  // the DOM, rendered uppercase by the text-transform class (measured live).
  await expect(page.getByText("or", { exact: true })).toBeVisible();
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
  // Session-12 (F-80, re-measured live): the reference renders the phrase
  // MIXED — "Need an account? " at weight 400/slate-500 with "Sign up" in
  // a font-medium slate-700 span (the Session-4 whole-phrase font-medium
  // pin has DRIFTED on the reference).
  await expect(signup).toHaveCSS("font-weight", "400");
  const span = signup.locator("span");
  await expect(span).toHaveText("Sign up");
  await expect(span).toHaveCSS("font-weight", "500");
  await expect(span).toHaveCSS("color", "rgb(51, 65, 85)");
});

test("wrong credentials surface the API's error and keep the form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByTestId("login-submit").click();
  // Scoped to the card: Next's own route announcer div also carries
  // role="alert" at body level (strict mode would match both).
  const alert = page.locator("main.login-canvas [role='alert']");
  await expect(alert).toBeVisible();
  // Session-12 (F-76, measured live 2026-10-27): the reference's failed
  // login renders a bordered Alert PANEL — rounded-xl + 1px red-200 border
  // + red-50/70 bg + p-4 + an inner 14px red-700 block, NO icon.
  await expect(alert).toHaveText("Invalid email or password");
  // v4 serializes the alpha fill as oklab(.../0.7) — the same color as the
  // reference's v3-era rgba(254,242,242,0.7) (the documented login-geometry
  // pin posture: match the alpha either way).
  const alertBg = await alert.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(alertBg).toMatch(/rgba\(254, 242, 242, 0\.7\)|oklab\([^)]*\/\s*0\.7\)/);
  await expect(alert).toHaveCSS("border-color", "rgb(254, 202, 202)");
  await expect(alert).toHaveCSS("border-radius", "12px");
  await expect(alert).toHaveCSS("padding", "16px");
  const inner = alert.locator("div");
  await expect(inner).toHaveCSS("font-size", "14px");
  await expect(inner).toHaveCSS("color", "rgb(185, 28, 28)");
  expect(await alert.locator("svg").count()).toBe(0);
  await expect(page).toHaveURL(/\/login/);
});

test("successful sign-in lands on the Terminal with the shift gate", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByTestId("login-submit").click();
  // Session-10, F-60: the reference lands on `/` after login (the terminal
  // at the root path, measured live through the real UI). The clone's root
  // page serves the same terminal, so the landing is pinned to the
  // reference's URL (pathname predicates — toHaveURL regexes match the FULL
  // url string, not the path).
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page).toHaveURL((url) => url.pathname === "/");
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

test("the login inputs render TYPED text in the reference's zinc-950 (the .theme-light foreground reaches the fields)", async ({
  page,
}) => {
  await page.goto("/login");
  // Session-11 (F-70): the base Input/Textarea carried no text color, so the
  // .theme-light scope's --foreground re-point never REACHED the fields —
  // they inherited the dark-theme body color rgb(231,233,239) (near-white on
  // the near-white card: invisible credentials since Session-101; invisible
  // to every e2e because fills don't read rendered text, and to every
  // screenshot because they showed the EMPTY form). The reference's typed
  // text computes rgb(9,9,11) (zinc-950) — the scoped light foreground.
  const email = page.getByLabel("Email");
  await email.fill("probe@example.com");
  await expect(email).toHaveCSS("color", "rgb(9, 9, 11)");
  const pw = page.getByLabel("Password");
  await pw.fill("probe-password");
  await expect(pw).toHaveCSS("color", "rgb(9, 9, 11)");
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

test("the login card's backdrop blur is the reference's 4px (the v4 blur-scale rename trap)", async ({
  page,
}) => {
  // Session-10, F-59: the reference's card class is `backdrop-blur-sm` in
  // v3-era CSS = blur(4px). Tailwind v4 RENAMED the blur scale — v4's
  // backdrop-blur-sm is 8px (v3's `blur`), and v3's 4px is v4's
  // `backdrop-blur-xs` (the documented trap #8). The class string must be
  // translated, not copied — this pin holds the translation.
  await page.goto("/login");
  const card = page.locator("main.login-canvas > div");
  await expect(card).toBeVisible();
  await expect(card).toHaveCSS("backdrop-filter", "blur(4px)");
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
  // Session-12 (F-81, measured live): the reference's button is text-sm
  // (14px) on h-11 sm:h-12 + shadow-sm + transition-all duration-200 —
  // the clone shipped a 16px py-3 button.
  await expect(submit).toHaveCSS("font-size", "14px");
  const shadow = await submit.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).toContain("1px 2px");
});

// ---------------------------------------------------------------------------
// Session-12 pins: the four never-measured auth surfaces (the failed-login
// error state, the forgot view, the sign-up view, the guest 404 gate) plus
// the sign-in content-block depth (the logo treatment, the responsive h1,
// the knockout OR divider, the in-form links row). All measured live on the
// reference 2026-10-27 — computed styles are ground truth.
// ---------------------------------------------------------------------------

test("the forgot view swaps the whole card to the reference's reset contract", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  // Session-12 (F-77, measured live): the reference swaps the ENTIRE card
  // content — the sign-in chrome (logo, h1, sub, SSO, OR) disappears and a
  // "Back to sign in" link becomes the first interactive child.
  await expect(page.getByRole("heading", { name: "Welcome to VeloxPOS (Point Of Sale)" })).toHaveCount(0);
  await expect(page.getByText("Sign in to continue")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
  const back = page.getByRole("button", { name: "Back to sign in" });
  await expect(back).toBeVisible();
  await expect(back).toHaveCSS("color", "rgb(100, 116, 139)");
  await expect(back).toHaveCSS("font-weight", "500");
  await expect(back.locator("svg")).toBeVisible(); // the ArrowLeft icon
  const firstButton = await page.evaluate(() => {
    const card = document.querySelector("main.login-canvas > div");
    const content = card?.querySelector("div[class*='p-8']");
    const button = content?.querySelector("button");
    return button ? button.textContent : null;
  });
  expect(firstButton).toContain("Back to sign in");
  const h2 = page.getByRole("heading", { name: "Reset your password" });
  await expect(h2).toBeVisible();
  await expect(h2).toHaveCSS("font-size", "24px");
  await expect(h2).toHaveCSS("font-weight", "700");
  await expect(h2).toHaveCSS("color", "rgb(15, 23, 42)");
  const desc = page.getByText("Enter your email and we'll send you a link to reset your password");
  await expect(desc).toBeVisible();
  await expect(desc).toHaveCSS("color", "rgb(71, 85, 105)");
  await expect(desc).toHaveCSS("font-size", "16px");
  const email = page.getByLabel("Email");
  await expect(email).toHaveCSS("height", "44px");
  const placeholder = await email.evaluate(
    (el) => getComputedStyle(el, "::placeholder").color,
  );
  expect(placeholder).toBe("rgb(148, 163, 184)"); // slate-400
  const send = page.getByRole("button", { name: "Send reset link" });
  await expect(send).toHaveCSS("height", "44px");
  await expect(send).toHaveCSS("background-color", "rgb(15, 23, 42)");
  // the back link returns the sign-in view (the swap is reversible)
  await back.click();
  await expect(page.getByRole("heading", { name: "Welcome to VeloxPOS (Point Of Sale)" })).toBeVisible();
});

test("the signup view is the reference's 3-field card (no Full name, no SSO)", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Need an account? Sign up" }).click();
  // Session-12 (F-78, measured live): the reference's sign-up view — h2
  // "Create your account" (no description), exactly Email / Password /
  // Confirm Password at h-10 sm:h-11, no SSO block, no Full name field.
  const h2 = page.getByRole("heading", { name: "Create your account" });
  await expect(h2).toBeVisible();
  await expect(h2).toHaveCSS("font-size", "24px");
  await expect(h2).toHaveCSS("color", "rgb(15, 23, 42)");
  await expect(page.getByText("Full name")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toHaveCount(0);
  const email = page.getByLabel("Email");
  const pw = page.getByLabel("Password", { exact: true });
  const confirm = page.getByLabel("Confirm Password");
  await expect(email).toHaveCSS("height", "44px");
  await expect(pw).toHaveCSS("height", "44px");
  await expect(confirm).toHaveCSS("height", "44px");
  await expect(confirm).toHaveAttribute("placeholder", "Re-enter password");
  const create = page.getByRole("button", { name: "Create account" });
  await expect(create).toHaveCSS("height", "44px");
  await expect(create).toHaveCSS("background-color", "rgb(15, 23, 42)");
  // the mismatch path errors CLIENT-SIDE through the alert and never
  // submits (no account is created, no navigation happens).
  await email.fill("mismatch-probe@example.com");
  await pw.fill("Abcd1234!");
  await confirm.fill("Different99!");
  await create.click();
  await expect(page.locator("main.login-canvas [role='alert']")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("the sign-in logo carries the reference's ring + halo and the h1 its responsive scale", async ({ page }) => {
  await page.goto("/login");
  // Session-12 (F-85a-d, measured live): the logo is a rounded-full span
  // with ring-4 ring-white/50 + a blur(24px) gradient halo behind it; the
  // h1 is text-2xl sm:text-3xl tracking-tight; the sub font-medium; the
  // logo→h1-block rhythm is space-y-8 (32px at desktop).
  const logo = page.getByAltText("VeloxPOS (Point Of Sale) logo");
  await expect(logo).toHaveCSS("width", "96px");
  const ring = logo.locator("xpath=parent::*");
  await expect(ring).toHaveCSS("height", "96px");
  // v4's rounded-full computes calc(infinity * 1px) → 33554400px (Chrome
  // serializes 3.35544e+07px); the reference's v3-era 9999px — same visual.
  const radius = await ring.evaluate((el) => getComputedStyle(el).borderRadius);
  expect(radius).toMatch(/^(9999px|33554400px|3\.35544e\+07px)$/);
  const ringShadow = await ring.evaluate((el) => getComputedStyle(el).boxShadow);
  // The 4px white ring layer — v4 serializes ring-white/50 as oklab-white
  // (the same color as the reference's v3-era rgba(255,255,255,0.5)).
  expect(ringShadow).toMatch(
    /(oklab\(0\.9[0-9]*[^)]*\/\s*0\.5\)|rgba\(255, 255, 255, 0\.5\)) 0px 0px 0px 4px/,
  );
  const halo = page.locator("div.relative > div.absolute.rounded-full").first();
  const haloFilter = await halo.evaluate((el) => getComputedStyle(el).filter);
  expect(haloFilter).toContain("blur(24px)");
  const h1 = page.getByRole("heading", { name: "Welcome to VeloxPOS (Point Of Sale)" });
  await expect(h1).toHaveCSS("font-size", "30px");
  await expect(h1).toHaveCSS("letter-spacing", "-0.75px");
  const sub = page.getByText("Sign in to continue");
  await expect(sub).toHaveCSS("font-weight", "500");
  await expect(sub).toHaveCSS("color", "rgb(100, 116, 139)");
  const gap = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const ring = document.querySelector("img[alt*='VeloxPOS']")?.parentElement;
    if (!h1 || !ring) return null;
    return Math.round(h1.parentElement!.getBoundingClientRect().top - ring.getBoundingClientRect().bottom);
  });
  expect(gap).toBe(32);
});

test("the OR divider is the reference's knockout and the links its justify-between pair", async ({ page }) => {
  await page.goto("/login");
  // Session-12 (F-85f/h + F-83, measured live): a CONTINUOUS 1px slate-200
  // line with a bg-white px-3 knockout rendering uppercase "or"
  // (tracking-wider, slate-500); the links row lives INSIDE the form —
  // flex-col sm:flex-row justify-between (Forgot left, signup right at
  // desktop; column/8px/center at 390px). The forgot link is 14px/500.
  const orLabel = page.getByText("or", { exact: true });
  await expect(orLabel).toBeVisible();
  await expect(orLabel).toHaveCSS("text-transform", "uppercase");
  // 0.1em at the 12px label = 1.2px (v3's tracking-wider; v4 rescaled it —
  // the component ships tracking-[0.1em], the translation).
  await expect(orLabel).toHaveCSS("letter-spacing", "1.2px");
  await expect(orLabel).toHaveCSS("color", "rgb(100, 116, 139)");
  await expect(orLabel).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const orLine = page.locator("div[class*='h-[1px]']");
  await expect(orLine).toHaveCSS("height", "1px");
  await expect(orLine).toHaveCSS("background-color", "rgb(226, 232, 240)");
  const forgot = page.getByRole("button", { name: "Forgot password?" });
  await expect(forgot).toHaveCSS("font-size", "14px");
  await expect(forgot).toHaveCSS("font-weight", "500");
  const row = forgot.locator("xpath=parent::div");
  await expect(row).toHaveCSS("flex-direction", "row");
  await expect(row).toHaveCSS("justify-content", "space-between");
  await expect(row).toHaveCSS("gap", "0px");
  const signup = page.getByRole("button", { name: "Need an account? Sign up" });
  const forgotBox = await forgot.boundingBox();
  const signupBox = await signup.boundingBox();
  expect(forgotBox?.x).toBeLessThan(signupBox?.x ?? Infinity);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(row).toHaveCSS("flex-direction", "column");
  await expect(row).toHaveCSS("gap", "8px");
  await expect(row).toHaveCSS("align-items", "center");
});

test("bogus routes gate the guest to /login (the reference auth-gates unknown routes)", async ({ page }) => {
  // Session-12 (F-82, measured live): the reference redirects logged-out
  // visitors on unknown routes to /login before any 404 HTML ships — the
  // clone used to render its public 404 to guests.
  await page.goto("/NoSuchView");
  await page.waitForURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Welcome to VeloxPOS (Point Of Sale)" })).toBeVisible();
  await expect(page.getByText("Página no encontrada")).toHaveCount(0);
});

test("SSO buttons compute the reference's py-3.5 (54px)", async ({ page }) => {
  await page.goto("/login");
  const google = page.getByRole("button", { name: "Continue with Google" });
  await expect(google).toBeVisible();
  await expect(google).toHaveCSS("height", "54px");
});

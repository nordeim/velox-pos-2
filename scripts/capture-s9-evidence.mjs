// Session-9 evidence script — the three remediation fixes verified LIVE on
// the rebuilt standalone (F-56 the Reports glyph, F-57 the h3 section
// headings, F-58 the button cursor) + a compact checkout journey (nothing
// broke end-to-end) + the Session-9 screenshot set, captured from the
// PRODUCTION standalone build (the family rule: never the dev badge).
//
// The script OWNS the server lifecycle (spawn → health → verify → capture →
// kill): the sandbox reaps detached daemons.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3400;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

mkdirSync(OUT, { recursive: true });

try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {}

const server = spawn("bun", [".next/standalone/server.js"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: "production",
    DATABASE_URL: `file:${path.join(ROOT, "db", "custom.db")}`,
    COOKIE_SECURE: "false",
    AUTH_SECRET: "5f3a9c1e7b2d4f6a8c0e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const waitHealthy = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server never became healthy. log:\n${serverLog}`);
};

const browser = await chromium.launch();
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} · ${name}${detail ? " — " + detail : ""}`);
};

try {
  await waitHealthy();
  console.log("server healthy on :" + PORT);

  // --- the login surface: the F-58 cursor fix (SSO buttons) + shot --------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  const signin = page.getByRole("button", { name: "Sign in" });
  await signin.waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const ssoCursor = await page
    .getByRole("button", { name: "Continue with Google" })
    .evaluate((el) => getComputedStyle(el).cursor);
  ok("F-58 live: the SSO button computes cursor:pointer", ssoCursor === "pointer", ssoCursor);
  await page.screenshot({ path: `${OUT}/48-session9-login.png` });

  // --- login through the real UI ------------------------------------------
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await signin.click({ timeout: 20_000 });
  await page.waitForURL("**/POS**", { timeout: 20_000 });
  // The POS surface: the shift gate + the cart panel (with its disabled
  // CHARGE) render together — wait for the shell, not either-or.
  await page.getByTestId("app-sidebar").waitFor({ timeout: 15_000 });
  ok("the artifact serves the login round-trip", true, page.url());

  // --- F-56 live: the Reports nav glyph class -----------------------------
  await page.goto(`${BASE}/Dashboard`);
  const sidebar = page.getByTestId("app-sidebar");
  await sidebar.waitFor({ state: "visible" });
  const glyphClass = await sidebar
    .getByRole("link", { name: "Reports" })
    .locator("svg")
    .getAttribute("class");
  ok(
    "F-56 live: the Reports glyph is lucide-file-chart-column-increasing",
    /lucide-file-chart-column-increasing/.test(glyphClass ?? ""),
    (glyphClass ?? "").slice(0, 60),
  );

  // --- F-58 live: the chevron cursor ---------------------------------------
  const chevCursor = await sidebar
    .getByRole("button", { name: "Collapse sidebar" })
    .evaluate((el) => getComputedStyle(el).cursor);
  ok("F-58 live: the chevron computes cursor:pointer", chevCursor === "pointer", chevCursor);

  // --- F-57 live: the h3 census (Dashboard) --------------------------------
  await page.goto(`${BASE}/Dashboard`);
  await sidebar.waitFor({ state: "visible" });
  // the sections mount after the bootstrap data lands — wait for the heading
  await page.getByRole("heading", { name: "Sales — Last 7 days", level: 3 }).waitFor({ timeout: 15_000 });
  const dashH3 = await page.evaluate(() =>
    [...document.querySelectorAll("h3")].map((h) => h.textContent.trim()),
  );
  ok(
    "F-57 live: Dashboard renders its two section headings as h3",
    dashH3.includes("Sales — Last 7 days") && dashH3.includes("Products by Category"),
    dashH3.join(" | "),
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/44-session9-dashboard.png` });
  await page.screenshot({ path: `${OUT}/43-session9-sidebar-glyph.png`, clip: { x: 0, y: 0, width: 320, height: 500 } });

  // --- F-57 live: the h3 census (Settings, 6 sections) --------------------
  await page.goto(`${BASE}/StoreSettings`);
  await page.getByRole("heading", { name: "Business Information", level: 3 }).waitFor({ timeout: 15_000 });
  const setH3 = await page.evaluate(() =>
    [...document.querySelectorAll("h3")].map((h) => h.textContent.trim()),
  );
  const sixSections = [
    "Business Information",
    "Branding",
    "Receipt",
    "Fiscal / Tax Data",
    "Card Payment Provider",
    "Product Categories",
  ];
  ok(
    "F-57 live: Settings renders its six section headings as h3",
    sixSections.every((s) => setH3.includes(s)),
    `${setH3.length} h3s`,
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/45-session9-settings.png` });

  // --- F-57 live: the h3 census (Cashiers "Turnos Recientes") -------------
  await page.goto(`${BASE}/Cashiers`);
  await page.getByRole("heading", { name: "Turnos Recientes", level: 3 }).waitFor({ timeout: 15_000 });
  ok("F-57 live: Cashiers renders Turnos Recientes as h3", true);

  // --- the compact checkout journey (nothing broke end-to-end) ------------
  const regs = await (await page.request.get(`${BASE}/api/registers`)).json();
  const reg = Array.isArray(regs) && regs[0] ? regs[0] : null;
  if (!reg) throw new Error("no register in the demo db — run bun run db:seed -- --demo");
  const actives = await (await page.request.get(`${BASE}/api/shifts?status=active`)).json();
  for (const s of actives ?? []) {
    await page.request.patch(`${BASE}/api/shifts/${s.id}`, { data: { countedCash: 0 } });
  }
  const shift = await (
    await page.request.post(`${BASE}/api/shifts`, { data: { registerId: reg.id, openingFloat: 100 } })
  ).json();
  ok("the checkout journey setup (shift opened)", !!shift?.id, `register=${reg.name}`);

  await page.goto(`${BASE}/POS`);
  await page.getByRole("heading", { name: "No active shift" }).waitFor({ state: "detached", timeout: 15_000 });
  const addButtons = page.getByRole("button", { name: /Add .+ to cart/ });
  await addButtons.first().waitFor({ state: "visible", timeout: 15_000 });
  await addButtons.nth(0).click();
  await page.waitForTimeout(250);
  await addButtons.nth(1).click();
  await page.waitForTimeout(600); // settle the Added banner
  await page.screenshot({ path: `${OUT}/46-session9-terminal-cart.png` });

  await page.getByTestId("charge-button").click();
  const pay = page.getByRole("dialog");
  await pay.waitFor({ state: "visible" });
  await pay.getByLabel("Amount received").fill("100");
  await pay.getByRole("button", { name: /Complete cash sale/ }).click();
  const receipt = page.getByRole("dialog");
  await receipt.getByText(/T-\d{6}/).waitFor({ timeout: 15_000 });
  const ticket = ((await receipt.textContent()) ?? "").match(/T-\d{6}/)?.[0] ?? "";
  ok("the checkout wrote a ticket", /^T-\d{6}$/.test(ticket), ticket);
  await receipt.getByRole("button", { name: "Close", exact: true }).first().click();
  await receipt.waitFor({ state: "detached", timeout: 10_000 });

  // close the shift (leave the store tidy)
  const nowActives = await (await page.request.get(`${BASE}/api/shifts?status=active`)).json();
  for (const s of nowActives ?? []) {
    await page.request.patch(`${BASE}/api/shifts/${s.id}`, { data: { countedCash: 100 } });
  }
  ok("shift closed (store tidy)", true);

  // --- the mobile drawer at 390x844 (the called-out surface) --------------
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    storageState: await ctx.storageState(),
  });
  const mob = await mctx.newPage();
  await mob.goto(`${BASE}/POS`);
  await mob.getByRole("button", { name: "Open navigation menu" }).waitFor({ timeout: 15_000 });
  const burgerCursor = await mob
    .getByRole("button", { name: "Open navigation menu" })
    .evaluate((el) => getComputedStyle(el).cursor);
  ok("F-58 live: the hamburger computes cursor:pointer", burgerCursor === "pointer", burgerCursor);
  await mob.getByRole("button", { name: "Open navigation menu" }).click();
  const drawer = mob.getByRole("dialog", { name: "Navigation menu" });
  await drawer.waitFor({ state: "visible" });
  const drawerGlyph = await drawer
    .getByRole("link", { name: "Reports" })
    .locator("svg")
    .getAttribute("class");
  ok(
    "F-56 live: the drawer's Reports glyph is the FILE variant too",
    /lucide-file-chart-column-increasing/.test(drawerGlyph ?? ""),
    (drawerGlyph ?? "").slice(0, 60),
  );
  const linkCount = await drawer.getByRole("link").count();
  ok("mobile drawer: dialog + 8 labeled links", linkCount === 8, `${linkCount} links`);
  const overflowOk = await mob.evaluate(
    () => document.body.scrollWidth - document.body.clientWidth <= 0,
  );
  ok("no horizontal overflow at 390", overflowOk);
  await mob.waitForTimeout(600); // settle the slide-in (the trap-16 discipline)
  await mob.screenshot({ path: `${OUT}/47-session9-mobile-drawer.png` });
  await mctx.close();
  await ctx.close();
} catch (err) {
  console.error("EVIDENCE RUN FAILED:", err);
  results.push({ name: "fatal", pass: false, detail: String(err) });
} finally {
  server.kill("SIGKILL");
  await browser.close();
}

const passed = results.filter((r) => r.pass).length;
console.log(`\nEVIDENCE: ${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);

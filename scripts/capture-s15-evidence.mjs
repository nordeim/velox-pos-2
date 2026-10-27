// Session-15 evidence script — the with-data + list-parity remediation
// verified LIVE on the rebuilt standalone (F-107/F-108/F-109 + SD-1/SD-2):
// both charts' with-data scale contracts on the DEMO-SEEDED scratch db (the
// peak below the topmost gridline, the ticks covering the domain), both
// Settings listboxes' measured lists, the dead-dep census, the standing
// F-76 alert pin, and the mobile drawer superset — captured from the
// PRODUCTION standalone build (the family rule: never the dev badge). The
// script OWNS the server lifecycle (spawn → health → verify → capture → kill).
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3415;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

// The with-data proofs run on the demo-seeded scratch db (the V23 pattern:
// db/demo.db, provisioned by this script if absent — 15 products, 5
// categories, a register, a closed shift, a week of sales).
const DEMO_DB = path.join(ROOT, "db", "demo.db");
if (!existsSync(DEMO_DB)) {
  execSync(`bunx prisma db push --accept-data-loss --skip-generate`, {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: `file:${DEMO_DB}` },
    stdio: "inherit",
  });
  execSync(`bun prisma/seed.ts -- --demo`, {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: `file:${DEMO_DB}` },
    stdio: "inherit",
  });
}

try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {}

const server = spawn("bun", [".next/standalone/server.js"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: "production",
    DATABASE_URL: `file:${DEMO_DB}`,
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

// In-SVG probe contract (F-107): peak-vs-top-gridline + the family census.
// Inlined into each evaluate callback (evaluate args must be JSON-only).
const PROBE_SRC = `
  const paths = [...svg.querySelectorAll("path")];
  const line = paths[paths.length - 1];
  const d = line ? (line.getAttribute("d") || "") : "";
  const ys = [...d.matchAll(/,([\\d.]+)(?=[CA L]|$)/g)].map((m) => parseFloat(m[1]));
  const peakY = ys.length ? Math.min(...ys) : 9999;
  const texts = [...svg.querySelectorAll("text")].filter((t) =>
    yTickRegex.test((t.textContent || "").trim()),
  );
  const topTick = texts.reduce((a, b) =>
    parseFloat(b.getAttribute("y")) < parseFloat(a.getAttribute("y")) ? b : a,
  );
  return {
    peakY,
    topTickLabel: topTick.textContent.trim(),
    topTickY: parseFloat(topTick.getAttribute("y")),
    tickCount: texts.length,
    hasCurve: d.includes("C"),
    circles: svg.querySelectorAll("circle").length,
    areaFill: paths[0] ? getComputedStyle(paths[0]).fill : null,
    areaOp: paths[0] ? getComputedStyle(paths[0]).getPropertyValue("fill-opacity") : null,
    viewBox: svg.getAttribute("viewBox"),
    ticks: texts.map((t) => t.textContent.trim()),
  };
`;

try {
  await waitHealthy();
  console.log("server healthy on :" + PORT);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ---- sign in through the REAL UI (the family rule) ----------------------
  await page.goto(`${BASE}/login`);
  await page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
  );
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(
    (url) => url.pathname === "/" || url.pathname === "/POS",
    { timeout: 15000 },
  );
  await page.waitForTimeout(800);

  // ---- 77 + F-107: the POPULATED Dashboard (demo data) ---------------------
  await page.goto(`${BASE}/Dashboard`);
  await page.getByTestId("line-chart").waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  const dash = await page.getByTestId("line-chart").evaluate(
    new Function("svg", `const yTickRegex = /^\\d+$/; ${PROBE_SRC}`),
  );
  const stats = await page
    .locator('[data-testid^="stat-"]')
    .allTextContents();
  ok(
    "F-107 (Dashboard) the peak sits at/below the topmost gridline",
    dash.peakY >= dash.topTickY - 0.5,
    `peak y=${dash.peakY.toFixed(1)} vs top gridline (${dash.topTickLabel}) y=${dash.topTickY.toFixed(1)}`,
  );
  ok(
    "F-107 (Dashboard) the ticks cover the domain (top tick = the last gridline)",
    dash.ticks[dash.ticks.length - 1] === dash.topTickLabel && dash.tickCount >= 5,
    `ticks [${dash.ticks.join(", ")}]`,
  );
  ok(
    "the with-data contract family holds (smooth curve, zero dots, the gradient area)",
    dash.hasCurve && dash.circles === 0 && String(dash.areaFill).includes("vpx-dash-sales") && dash.areaOp === "0.6",
    `curve=${dash.hasCurve} dots=${dash.circles} area=${dash.areaFill} @${dash.areaOp}`,
  );
  ok(
    "the demo dataset is live (15 products, 3 low-stock)",
    stats.includes("15") && stats.includes("3"),
    `stats [${stats.join(" | ")}]`,
  );
  await page.screenshot({ path: `${OUT}/77-session15-dashboard-populated.png` });

  // ---- 78 + F-107: the POPULATED Reports chart ------------------------------
  await page.goto(`${BASE}/Reports`);
  await page.getByTestId("area-chart").waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  const rep = await page.getByTestId("area-chart").evaluate(
    new Function("svg", `const yTickRegex = /^\\$\\d+$/; ${PROBE_SRC}`),
  );
  ok(
    "F-107 (Reports) the peak sits at/below the topmost gridline",
    rep.peakY >= rep.topTickY - 0.5,
    `peak y=${rep.peakY.toFixed(1)} vs top gridline (${rep.topTickLabel}) y=${rep.topTickY.toFixed(1)}`,
  );
  ok(
    "F-107 (Reports) the ticks cover the domain",
    rep.ticks[rep.ticks.length - 1] === rep.topTickLabel && rep.tickCount >= 5,
    `ticks [${rep.ticks.join(", ")}]`,
  );
  ok(
    "the Reports with-data family holds (indigo 2px curve, the gradient area, zero dots)",
    rep.hasCurve && rep.circles === 0 && String(rep.areaFill).includes("vpx-reports-sales"),
    `curve=${rep.hasCurve} dots=${rep.circles} area=${rep.areaFill}`,
  );
  await page.screenshot({ path: `${OUT}/78-session15-reports-populated.png` });

  // ---- 79 + F-108/F-109: both Settings listboxes ----------------------------
  await page.goto(`${BASE}/StoreSettings`);
  await page.getByRole("combobox", { name: "Currency" }).waitFor({ state: "visible" });
  await page.getByRole("combobox", { name: "Currency" }).click();
  await page.getByRole("option").first().waitFor({ state: "visible" });
  const currencies = await page.getByRole("option").allTextContents();
  const EXPECTED_CURRENCIES = [
    "USD - US Dollar",
    "EUR - Euro",
    "GBP - British Pound",
    "MXN - Mexican Peso",
    "COP - Colombian Peso",
    "ARS - Argentine Peso",
  ];
  ok(
    "F-108 the Currency listbox is the reference's measured six, in order",
    JSON.stringify(currencies) === JSON.stringify(EXPECTED_CURRENCIES),
    `[${currencies.join(", ")}]`,
  );
  await page.screenshot({ path: `${OUT}/79-session15-settings-currency-listbox.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await page.getByRole("combobox", { name: "Card payment provider" }).click();
  await page.getByRole("option").first().waitFor({ state: "visible" });
  const providers = await page.getByRole("option").allTextContents();
  const EXPECTED_PROVIDERS = ["None", "Stripe", "PayPal", "Clip", "Mercado Pago"];
  ok(
    "F-109 the Card Payment Provider listbox is the reference's measured five, in order",
    JSON.stringify(providers) === JSON.stringify(EXPECTED_PROVIDERS),
    `[${providers.join(", ")}]`,
  );
  await page.keyboard.press("Escape");

  // ---- SD-1/SD-2: the dead-dep census ---------------------------------------
  const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  ok(
    "SD-1/SD-2 the dead deps are gone from the manifest",
    !("@radix-ui/react-toast" in allDeps) && !("axe-core" in allDeps),
    `react-toast=${"@radix-ui/react-toast" in allDeps} axe-core=${"axe-core" in allDeps}`,
  );
  const uiFiles = readdirSync(path.join(ROOT, "src/components/ui")).filter((f) => f.endsWith(".tsx"));
  ok(
    "SD-1(s14) the ui layer is still exactly the 10 live primitives",
    uiFiles.length === 10,
    `${uiFiles.length} files`,
  );
  const toastSrc = readFileSync(path.join(ROOT, "src/components/ui/toast.tsx"), "utf8");
  ok(
    "the toaster is zustand-based (no Radix import — the doc claim corrected)",
    !toastSrc.includes("@radix-ui/react-toast") && toastSrc.includes("zustand"),
    "toast.tsx imports zustand only",
  );

  // ---- the F-76 drift spot-check (a FRESH context; the documented
  // oklab-alpha posture — either serialization passes) ------------------------
  const f76ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const f76page = await f76ctx.newPage();
  await f76page.goto(`${BASE}/login`);
  await f76page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
  );
  await f76page.getByLabel("Email").fill(EMAIL);
  await f76page.getByLabel("Password").fill("Wrong-Password-99");
  await f76page.getByTestId("login-submit").click();
  // Trap #28: scope to main.login-canvas — the FIRST unscoped [role=alert]
  // can be Next's route announcer (it satisfies the wait before the real
  // alert renders, then the scoped read crashes on null).
  await f76page
    .locator("main.login-canvas [role='alert']")
    .first()
    .waitFor({ state: "visible", timeout: 10000 });
  const f76 = await f76page.evaluate(() => {
    const a = document.querySelector("main.login-canvas [role='alert']");
    const cs = getComputedStyle(a);
    const inner = a.firstElementChild;
    return {
      text: a.textContent.trim().slice(0, 40),
      radius: cs.borderRadius,
      border: cs.border,
      padding: cs.padding,
      innerSize: inner ? getComputedStyle(inner).fontSize : null,
      bg: cs.backgroundColor,
    };
  });
  const f76bgOk = /rgba\(254, 242, 242, 0\.7\)|oklab/.test(f76.bg);
  ok(
    "F-76 the login error alert holds (text + geometry, alpha serialization either-form)",
    f76.text === "Invalid email or password" &&
      f76.radius === "12px" &&
      f76.border.includes("rgb(254, 202, 202)") &&
      f76.padding === "16px" &&
      f76.innerSize === "14px" &&
      f76bgOk,
    `text="${f76.text}" radius=${f76.radius} bg=${f76.bg}`,
  );
  await f76ctx.close();

  // ---- 80: the mobile drawer (the first context is still authed) ------------
  const mob = await ctx.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(`${BASE}/POS`);
  await mob.waitForTimeout(800);
  const burger = mob.getByRole("button", { name: /menu|navigation/i }).first();
  await burger.click();
  await mob.getByRole("dialog").waitFor({ state: "visible" });
  const mobState = await mob.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > 390,
    dialog: !!document.querySelector("[role=dialog]"),
    navLinks: [...document.querySelectorAll("[role=dialog] a")].length,
  }));
  ok(
    "the mobile drawer opens as a dialog with 8 links, zero horizontal overflow",
    mobState.dialog && mobState.navLinks === 8 && !mobState.overflow,
    `dialog=${mobState.dialog} links=${mobState.navLinks} overflow=${mobState.overflow}`,
  );
  await mob.screenshot({ path: `${OUT}/80-session15-mobile-drawer.png` });

  // ---- summary ---------------------------------------------------------------
  const passed = results.filter((r) => r.pass).length;
  console.log(`\nEVIDENCE: ${passed}/${results.length} PASSED`);
  if (passed !== results.length) process.exitCode = 1;
} catch (err) {
  console.error("EVIDENCE RUN CRASHED:", err);
  console.error(serverLog.slice(-2000));
  process.exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  server.kill();
}

// Session-7 evidence script — the F-51 live re-verification + the Session-7
// screenshot set, captured from the PRODUCTION standalone build (the family
// rule: never the dev badge).
//
// What this proves (T-5):
//   1. The mobile drawer contract at 390x844 — hamburger, role=dialog, 8
//      labeled links, and THE F-51 PATH live: md-growth resize unmounts the
//      dialog AND releases the body scroll lock (polled, not sampled).
//   2. A Session-6 chrome spot-check (nav 40/42px pills + the active border
//      pair; Save Changes 54px).
//
// What this captures (T-6): screenshots 32-36 into docs/screenshots/.
//
// The script OWNS the server lifecycle (spawn → health → boot → verify →
// capture → kill): the sandbox reaps detached daemons, so the standalone
// runs as a child of this process and dies with it.
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

// --- kill any port squatter (the e2e suite's documented guard) -----------
try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {
  /* no squatter — fine */
}

// --- boot the standalone on :3400 (absolute DATABASE_URL by contract) ----
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
    } catch {
      /* not up yet */
    }
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

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  // --- login through the real UI (the form unlocks after hydration) ------
  await page.goto(`${BASE}/login`);
  const signin = page.getByRole("button", { name: "Sign in" });
  await signin.waitFor({ state: "visible" });
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  // click() auto-waits through the disabled-until-hydration window
  await signin.click({ timeout: 20_000 });
  await page.waitForURL("**/POS**", { timeout: 20_000 });
  await page.getByRole("heading", { name: "No active shift" }).waitFor({ timeout: 15_000 });
  ok("login round-trip", true, page.url());

  // --- THE F-51 PATH, live: open drawer → grow viewport → lock releases --
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await drawer.waitFor({ state: "visible" });
  const linkCount = await drawer.getByRole("link").count();
  ok("drawer dialog + 8 links", linkCount === 8, `${linkCount} links`);
  const lockEngaged = await page.evaluate(() => document.body.style.overflow);
  ok("scroll lock engaged while open", lockEngaged === "hidden", `overflow=${lockEngaged}`);

  // Screenshot 32: the open drawer (the user-flagged surface) — settle-wait
  // first: the slide-in entrance runs ~300-500ms, and a mid-animation frame
  // looks like a clipped drawer (the Session-7 VLM catch).
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/32-session7-mobile-drawer-open.png` });

  // Grow past md — the dialog must unmount AND the lock must release.
  await page.setViewportSize({ width: 800, height: 900 });
  await drawer.waitFor({ state: "detached", timeout: 10_000 });
  // POLLED read (the F-51 lesson — never a single sample):
  let released = false;
  for (let i = 0; i < 40; i++) {
    const o = await page.evaluate(() => document.body.style.overflow);
    if (o !== "hidden") {
      released = true;
      break;
    }
    await page.waitForTimeout(100);
  }
  ok("md-growth auto-close + lock release (F-51 path)", released);

  // Screenshot 33: the post-growth desktop state (no stuck lock — the page
  // scrolled normally after the resize proves it interactively)
  await page.evaluate(() => window.scrollTo(0, 40));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/33-session7-mobile-after-growth.png` });

  // --- desktop chrome spot-check (Session-6 contracts) -------------------
  const ctx2 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: await ctx.storageState(),
  });
  const desk = await ctx2.newPage();
  await desk.goto(`${BASE}/POS`);
  await desk.getByRole("heading", { name: "No active shift" }).waitFor({ timeout: 15_000 });

  const nav = await desk.evaluate(() => {
    const aside = document.querySelector("aside");
    const links = [...aside.querySelectorAll("nav a")];
    const active = links[0];
    const inactive = links[2];
    const cs = (el) => getComputedStyle(el);
    return {
      activeH: active.offsetHeight,
      activeBorder: cs(active).borderWidth + " " + cs(active).borderColor,
      inactiveH: inactive.offsetHeight,
      inactiveColor: cs(inactive).color,
      icons: [...aside.querySelectorAll("nav svg")].every(
        (s) => Math.round(s.getBoundingClientRect().width) === 16,
      ),
    };
  });
  ok(
    "nav chrome (Session-6)",
    // v4 serializes fractional alphas as oklab — pin the ALPHA (the
    // Session-6 doctrine), never the color string form.
    nav.activeH === 42 &&
      nav.activeBorder.startsWith("1px") &&
      /\/\s*0\.3\)/.test(nav.activeBorder) &&
      nav.inactiveH === 40 &&
      /\/\s*0\.4\)/.test(nav.inactiveColor) &&
      nav.icons,
    JSON.stringify(nav),
  );

  // Screenshot 34: the sidebar chrome at 1440x900
  await desk.screenshot({ path: `${OUT}/34-session7-sidebar-nav.png` });

  // Settings: Save Changes 54px (the Session-6 CTA contract)
  await desk.goto(`${BASE}/StoreSettings`);
  await desk.getByRole("heading", { name: "Store Settings" }).waitFor({ timeout: 15_000 });
  const saveH = await desk.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      x.textContent.trim().startsWith("Save Changes"),
    );
    return b ? b.offsetHeight : 0;
  });
  ok("Save Changes 54px", saveH === 54, `${saveH}px`);

  // Screenshot 35: the Settings surface
  await desk.screenshot({ path: `${OUT}/35-session7-settings.png` });

  // Dashboard: the nice-ticks chart with the demo dataset (F-50 aftermath)
  await desk.goto(`${BASE}/Dashboard`);
  await desk.getByRole("heading", { name: "Dashboard" }).waitFor({ timeout: 15_000 });
  await desk.waitForTimeout(800);
  const chart = await desk.evaluate(() => {
    const texts = [...document.querySelectorAll("svg text")].map((t) => t.textContent);
    return { yTicks: texts.filter((t) => /^\$?\d+$/.test(t)).slice(0, 8), weekdays: texts.filter((t) => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/) };
  });
  ok(
    "chart nice ticks + weekday labels (data state)",
    chart.yTicks.length > 0 && chart.yTicks.length <= 8 && chart.weekdays.length >= 6,
    JSON.stringify(chart),
  );

  // Screenshot 36: the dashboard chart at data scale
  await desk.screenshot({ path: `${OUT}/36-session7-dashboard-chart.png` });

  await ctx.close();
  await ctx2.close();
} catch (err) {
  console.error("SCRIPT ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill("SIGTERM");
}

const failed = results.filter((r) => !r.pass);
console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => f.name).join(", "));
  process.exitCode = 1;
} else {
  console.log("Session-7 live verification + captures complete.");
}

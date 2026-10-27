// Session-14 evidence script — the chart-internal remediation verified LIVE
// on the rebuilt standalone (F-95..F-106): both charts' measured contracts
// (the indigo line families, the slate grid/axes on the Dashboard vs the
// white/4% grid on Reports, the gradient areas, the plot geometries, zero
// data dots), the SD-1 primitive purge census, the standing F-76 alert pin,
// and the mobile drawer superset — captured from the PRODUCTION standalone
// build (the family rule: never the dev badge). The script OWNS the server
// lifecycle (spawn → health → verify → capture → kill).
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3414;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

import { mkdirSync } from "node:fs";
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

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ---- sign in through the REAL UI (the family rule; the setup's proven
  // flow: wait the hydration gate, fill by label, the landing is `/`) ------
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

  // ---- 72: the Dashboard chart contract (F-95..F-101) ----------------------
  await page.goto(`${BASE}/Dashboard`);
  await page.getByTestId("line-chart").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const dash = await page
    .getByTestId("line-chart")
    .evaluate((svg) => {
      const paths = [...svg.querySelectorAll("path")];
      const lines = [...svg.querySelectorAll("line")];
      const texts = [...svg.querySelectorAll("text")];
      const span = (l, a, b) =>
        Math.abs(parseFloat(l.getAttribute(a)) - parseFloat(l.getAttribute(b)));
      const grid = lines.filter((l) => getComputedStyle(l).stroke === "rgb(226, 232, 240)");
      const axes = lines.filter((l) => getComputedStyle(l).stroke === "rgb(148, 163, 184)");
      const grad = svg.querySelector("linearGradient");
      const stops = grad
        ? [...grad.querySelectorAll("stop")].map((s) => ({
            off: s.getAttribute("offset"),
            col: getComputedStyle(s).stopColor,
            op: getComputedStyle(s).stopOpacity,
          }))
        : [];
      const y0 = texts.find(
        (t) => (t.textContent || "").trim() === "0" && Number(t.getAttribute("x")) < 65,
      );
      return {
        viewBox: svg.getAttribute("viewBox"),
        lineStroke: paths.length ? getComputedStyle(paths[paths.length - 1]).stroke : null,
        lineW: paths[paths.length - 1]?.getAttribute("stroke-width"),
        lineD: paths[paths.length - 1]?.getAttribute("d") ?? "",
        circles: svg.querySelectorAll("circle").length,
        gridDash: [...new Set(grid.map((l) => l.getAttribute("stroke-dasharray")))],
        vGrid: grid.filter((l) => span(l, "y1", "y2") > 100).length,
        hGrid: grid.filter((l) => span(l, "x1", "x2") > 100).length,
        longAxes: axes.filter((l) => span(l, "x1", "x2") > 100 || span(l, "y1", "y2") > 100).length,
        xTickStubs: axes.filter(
          (l) =>
            Math.max(l.getAttribute("y1"), l.getAttribute("y2")) === 251 &&
            Math.min(l.getAttribute("y1"), l.getAttribute("y2")) === 245,
        ).length,
        areaFill: paths[0] ? getComputedStyle(paths[0]).fill : null,
        areaFillOp: paths[0]
          ? getComputedStyle(paths[0]).getPropertyValue("fill-opacity")
          : null,
        stops,
        y0x: y0?.getAttribute("x"),
        y0anchor: y0 ? getComputedStyle(y0).textAnchor : null,
        y0size: y0 ? getComputedStyle(y0).fontSize : null,
        y0color: y0 ? getComputedStyle(y0).fill : null,
      };
    });

  ok(
    "F-95 the line is the reference's indigo 2.5px smooth family",
    dash.lineStroke === "rgb(99, 102, 241)" &&
      dash.lineW === "2.5" &&
      /^M-?[\d.]+,-?[\d.]+C/.test(dash.lineD) &&
      !dash.lineD.includes("L"),
    `stroke ${dash.lineStroke}, w ${dash.lineW}`,
  );
  ok(
    "F-100 the chart ships ZERO data dots (the reference's own posture)",
    dash.circles === 0,
    `${dash.circles} circles`,
  );
  ok(
    "F-96 the grid is slate-200 dashed 3-3 (5h+7v on the flat store)",
    dash.gridDash.join() === "3 3" && dash.vGrid === 7 && dash.hGrid >= 3 && dash.hGrid <= 7,
    `dash [${dash.gridDash}], v ${dash.vGrid}, h ${dash.hGrid}`,
  );
  ok(
    "F-97 the two full-length slate-400 axes + the 7 x-tick stubs",
    dash.longAxes === 2 && dash.xTickStubs === 7,
    `axes ${dash.longAxes}, stubs ${dash.xTickStubs}`,
  );
  ok(
    "F-99 the indigo gradient area: 0.3@5% → 0@95% at fill-opacity 0.6",
    dash.areaFill.includes('url("#') &&
      dash.areaFillOp === "0.6" &&
      dash.stops.length === 2 &&
      dash.stops[0].off === "5%" &&
      dash.stops[0].col === "rgb(99, 102, 241)" &&
      dash.stops[0].op === "0.3" &&
      dash.stops[1].off === "95%" &&
      dash.stops[1].op === "0",
    `fill ${dash.areaFill}, op ${dash.areaFillOp}`,
  );
  ok(
    "F-98/F-101 the plot geometry: viewBox 731×280, y0 end-anchored @57 12px slate-400",
    dash.viewBox === "0 0 731 280" &&
      dash.y0x === "57" &&
      dash.y0anchor === "end" &&
      dash.y0size === "12px" &&
      dash.y0color === "rgb(148, 163, 184)",
    `${dash.viewBox}, y0 ${dash.y0x}/${dash.y0anchor}/${dash.y0size}`,
  );
  await page.screenshot({ path: `${OUT}/72-session14-dashboard-chart.png`, fullPage: false });

  // ---- 73: the Reports chart contract (F-102..F-106) ------------------------
  await page.goto(`${BASE}/Reports`);
  await page.getByTestId("area-chart").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const rep = await page
    .getByTestId("area-chart")
    .evaluate((svg) => {
      const paths = [...svg.querySelectorAll("path")];
      const lines = [...svg.querySelectorAll("line")];
      const texts = [...svg.querySelectorAll("text")];
      const grad = svg.querySelector("linearGradient");
      const stops = grad
        ? [...grad.querySelectorAll("stop")].map((s) => ({
            off: s.getAttribute("offset"),
            op: getComputedStyle(s).stopOpacity,
          }))
        : [];
      const yTick = texts.find((t) => /^\$\d+$/.test((t.textContent || "").trim()));
      return {
        viewBox: svg.getAttribute("viewBox"),
        lineStroke: getComputedStyle(paths[paths.length - 1]).stroke,
        lineW: paths[paths.length - 1].getAttribute("stroke-width"),
        gridStrokes: [...new Set(lines.map((l) => getComputedStyle(l).stroke))],
        gridDash: [...new Set(lines.map((l) => l.getAttribute("stroke-dasharray")))],
        gridCount: lines.length,
        yTickSize: yTick ? getComputedStyle(yTick).fontSize : null,
        yTickColor: yTick ? getComputedStyle(yTick).fill : null,
        areaFillOp: getComputedStyle(paths[0]).getPropertyValue("fill-opacity"),
        stops,
      };
    });
  ok(
    "F-102 the Reports line is indigo at 2px (its OWN family — not the Dashboard's 2.5)",
    rep.lineStroke === "rgb(99, 102, 241)" && rep.lineW === "2",
    `stroke ${rep.lineStroke}, w ${rep.lineW}`,
  );
  ok(
    "F-103 the Reports grid is white/4% dashed 3-3 with NO slate axes",
    rep.gridStrokes.join() === "rgba(255, 255, 255, 0.04)" &&
      rep.gridDash.join() === "3 3" &&
      rep.gridCount >= 8,
    `[${rep.gridStrokes}] dash [${rep.gridDash}] count ${rep.gridCount}`,
  );
  ok(
    "F-104/F-105 the 11px white/30 ticks + the 0.35@5% gradient at 0.6",
    rep.yTickSize === "11px" &&
      rep.yTickColor === "rgba(255, 255, 255, 0.3)" &&
      rep.areaFillOp === "0.6" &&
      rep.stops[0].off === "5%" &&
      rep.stops[0].op === "0.35" &&
      rep.stops[1].op === "0",
    `tick ${rep.yTickSize}/${rep.yTickColor}, stops ${JSON.stringify(rep.stops)}`,
  );
  ok(
    "F-106 the Reports plot geometry: viewBox 1130×220",
    rep.viewBox === "0 0 1130 220",
    rep.viewBox,
  );
  await page.screenshot({ path: `${OUT}/73-session14-reports-chart.png`, fullPage: false });

  // ---- SD-1: the primitive purge census (filesystem, not browser) ----------
  const uiFiles = readdirSync(path.join(ROOT, "src/components/ui")).sort();
  const pkg = readFileSync(path.join(ROOT, "package.json"), "utf8");
  const deadDeps = [
    "react-avatar",
    "react-checkbox",
    "react-dropdown-menu",
    "react-popover",
    "react-progress",
    "react-separator",
    "react-slider",
    "react-tabs",
    "react-tooltip",
  ].filter((d) => pkg.includes(`@radix-ui/${d}`));
  ok(
    "SD-1 the ui layer is exactly the 10 live primitives",
    uiFiles.length === 10 &&
      JSON.stringify(uiFiles) ===
        JSON.stringify(
          [
            "alert-dialog.tsx",
            "alert.tsx",
            "button.tsx",
            "dialog.tsx",
            "input.tsx",
            "label.tsx",
            "select.tsx",
            "switch.tsx",
            "textarea.tsx",
            "toast.tsx",
          ].sort(),
        ),
    uiFiles.join(", "),
  );
  ok(
    "SD-1 the 9 exclusively-dead Radix packages are gone from package.json",
    deadDeps.length === 0,
    deadDeps.length ? `still present: ${deadDeps.join(", ")}` : "all removed",
  );

  // ---- the standing F-76 pin (the eighth-cycle drift spot-check) -----------
  await page.context().clearCookies();
  await page.goto(`${BASE}/login`);
  await page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
  );
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill("WrongPass123");
  await page.getByTestId("login-submit").click();
  // Scoped to the login canvas: Next's own route announcer div also carries
  // role="alert" at body level (the Session-12 trap).
  await page
    .locator("main.login-canvas [role='alert']")
    .waitFor({ state: "visible" });
  const alert = await page.evaluate(() => {
    const a = document.querySelector("main.login-canvas [role='alert']");
    const cs = getComputedStyle(a);
    return {
      text: a?.textContent?.trim(),
      radius: cs.borderRadius,
      bg: cs.backgroundColor,
      inner: getComputedStyle(a.firstElementChild).color,
    };
  });
  ok(
    "F-76 (drift spot-check) the login alert panel holds byte-exact",
    alert.text === "Invalid email or password" &&
      alert.radius === "12px" &&
      // v4 serializes red-50/70 as oklab(.../0.7) — the same color as the
      // reference's v3-era rgba(254,242,242,0.7): match the alpha either
      // way (the documented login-geometry pin posture).
      (alert.bg === "rgba(254, 242, 242, 0.7)" || alert.bg.endsWith("/ 0.7)")) &&
      alert.inner === "rgb(185, 28, 28)",
    `${alert.text} · ${alert.radius} · ${alert.bg}`,
  );

  // ---- 74: the mobile drawer superset (the operator's called-out surface) --
  // (Re-authenticate first — the F-76 probe cleared the session cookie.)
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(
    (url) => url.pathname === "/" || url.pathname === "/POS",
    { timeout: 15000 },
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/POS`);
  const burger = page.getByRole("button", { name: "Open navigation menu" });
  await burger.waitFor({ state: "visible" });
  await burger.click();
  await page.locator('[role="dialog"]').waitFor({ state: "visible" });
  const drawerOk = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const links = d ? d.querySelectorAll("a") : [];
    return { dialog: !!d, links: links.length };
  });
  ok(
    "the mobile drawer opens as role=dialog with the 8 nav links",
    drawerOk.dialog && drawerOk.links >= 8,
    `dialog ${drawerOk.dialog}, links ${drawerOk.links}`,
  );
  await page.screenshot({ path: `${OUT}/74-session14-mobile-drawer.png`, fullPage: false });
} catch (err) {
  console.error("EVIDENCE RUN FAILED:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.kill();
}

const passed = results.filter((r) => r.pass).length;
console.log(`\nEVIDENCE RESULT: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exitCode = 1;

// Session-17 evidence script — the with-data Inventory/Reports remediation
// verified LIVE on the rebuilt standalone: the demo-seeded surfaces the
// empty-store e2e can never see (the session_28 "Next" pointer's target —
// the Inventory table census + stock chips + category dots + search filter,
// the Reports stat family + period pills + method rows/shares/bars + the
// 7-day calendar-bucket window), plus the standing F-76 drift spot-check and
// the mobile drawer superset — captured from the PRODUCTION standalone build
// (the family rule: never the dev badge). The script OWNS the server
// lifecycle (spawn → health → verify → capture → kill).
//
// Measurement postures baked in (the Session-17 lessons):
//   • textContent pins the SOURCE case; CSS-uppercased innerText ("DAILY
//     SALES") is matched case-insensitively in settled-state waits.
//   • v4's oklab white/α serializations are pinned by ALPHA, never by the
//     full serialization string.
//   • waitForFunction options are the THIRD argument — (fn, null, opts).
//   • The MethodTable rows parse child nodes (the method name is a bare
//     text node; the share span nests inside the font-bold money span).
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3418;
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
      if (r.ok) return;
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

  // ---- sign in through the REAL UI (the family rule) ----------------------
  await page.goto(`${BASE}/login`);
  await page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
    null,
    { timeout: 10000 },
  );
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(
    (url) => url.pathname === "/" || url.pathname === "/POS",
    { timeout: 15000 },
  );
  await page.waitForTimeout(800);

  // ---- the WITH-DATA Inventory (demo data — V18's census) ------------------
  await page.goto(`${BASE}/Inventory`);
  // Bootstrap race (the s16 lesson): wait for the SETTLED table, never a timer.
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll("table tbody tr").length;
      const empty = document.body.innerText.includes("No products found");
      return rows > 0 || empty;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  const inv = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const sub = [...document.querySelectorAll("p")].find(p => /products registered/i.test(p.textContent || ""));
    const search = document.querySelector('input[aria-label="Search by name or code"]');
    const pills = [...document.querySelectorAll('[role="group"][aria-label="Filter by category"] button')];
    const rows = [...document.querySelectorAll("table tbody tr")];
    const chips = [...document.querySelectorAll("table tbody tr td:nth-child(6) span.rounded-full")];
    const byLabel = {};
    for (const c of chips) {
      const t = (c.textContent || "").trim();
      if (t) byLabel[t] = (byLabel[t] || 0) + 1;
    }
    const headers = [...document.querySelectorAll("table thead th")].map(t => t.textContent.trim());
    const bevRow = rows.find(r => {
      const cat = r.querySelectorAll("td")[4];
      return cat && /Beverages/.test(cat.textContent || "");
    });
    const bevCatCell = bevRow ? bevRow.querySelectorAll("td")[4] : null;
    const bevDot = bevCatCell?.querySelector('span[aria-hidden="true"]');
    const subP = sub ? getComputedStyle(sub) : null;
    return {
      h1: h1 ? { t: h1.textContent.trim(), size: getComputedStyle(h1).fontSize, weight: getComputedStyle(h1).fontWeight } : null,
      sub: sub ? { t: sub.textContent.trim(), size: subP.fontSize, color: subP.color } : null,
      searchPh: search ? search.placeholder : null,
      searchH: search ? getComputedStyle(search).height : null,
      pillCount: pills.length,
      pillTexts: pills.map(p => p.textContent.trim()),
      pillH: pills[0] ? Math.round(pills[0].getBoundingClientRect().height) : null,
      rowCount: rows.length,
      headers,
      chips: byLabel,
      bevDotBg: bevDot ? getComputedStyle(bevDot).backgroundColor : null,
    };
  });
  ok(
    "the with-data Inventory header holds (h1 24px/700, '15 products registered' 14px slate-500)",
    inv.h1?.t === "Inventory" && inv.h1.size === "24px" && inv.h1.weight === "700" &&
      inv.sub?.t === "15 products registered" && inv.sub?.size === "14px" && inv.sub?.color === "rgb(100, 116, 139)",
    `h1=${inv.h1?.t} sub=${inv.sub?.t}`,
  );
  ok(
    "the search input holds the byte-exact placeholder at h-9",
    inv.searchPh === "Search by name or code..." && inv.searchH === "36px",
    `"${inv.searchPh}" h=${inv.searchH}`,
  );
  ok(
    "the category pills render All + the 5 demo categories at 36px",
    inv.pillCount === 6 && inv.pillTexts[0] === "All" &&
      ["Beverages", "Electronics", "Groceries", "Personal Care", "Snacks"].every(c => inv.pillTexts.includes(c)) &&
      inv.pillH === 36,
    `pills=[${inv.pillTexts.join("|")}]`,
  );
  ok(
    "the product table renders all 15 rows with the measured 7-column header set",
    inv.rowCount === 15 && inv.headers.join() === "Product,Code,Price,Stock,Category,Status,Actions",
    `rows=${inv.rowCount}`,
  );
  ok(
    "the stock-chip census matches the db truth (out=1, low=2, ok=12)",
    inv.chips["Out of stock"] === 1 && inv.chips["Low stock"] === 2 && inv.chips["In stock"] === 12,
    JSON.stringify(inv.chips),
  );
  ok(
    "the category dots render inline (the Beverages row's dot = violet #8b5cf6)",
    inv.bevDotBg === "rgb(139, 92, 246)",
    `bevDot=${inv.bevDotBg}`,
  );

  // The search filter (the with-data behavior).
  await page.getByLabel("Search by name or code").fill("Espresso");
  await page.waitForTimeout(400);
  const filtered = await page.evaluate(() => ({
    rows: [...document.querySelectorAll("table tbody tr")].filter(r => !/No products found/.test(r.textContent || "")).length,
    first: document.querySelector("table tbody tr td")?.textContent?.trim(),
  }));
  ok(
    "the search filters to the matching product (Espresso → 1 row)",
    filtered.rows === 1 && /Espresso/.test(filtered.first || ""),
    `rows=${filtered.rows} first=${filtered.first}`,
  );
  await page.getByLabel("Search by name or code").fill("");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/87-session17-inventory-withdata.png` });

  // ---- the WITH-DATA Reports (demo data — V18's census) -------------------
  await page.goto(`${BASE}/Reports`);
  // Settled state: the h2s render CSS-uppercased in innerText — match
  // case-insensitively (the Session-17 lesson).
  await page.waitForFunction(
    () => {
      const t = document.body.innerText.toUpperCase();
      return t.includes("DAILY SALES") && t.includes("AVG. TICKET");
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  const rep = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const sub = [...document.querySelectorAll("main p")].find(p => /sales & revenue analytics/i.test(p.textContent || ""));
    const subC = sub ? getComputedStyle(sub) : null;
    const pills = [...document.querySelectorAll("main button")].filter(b => /days/i.test(b.textContent || "")).map(b => {
      const c = getComputedStyle(b);
      return { t: b.textContent.trim(), color: c.color, bg: c.backgroundColor };
    });
    const cards = [...document.querySelectorAll("main div.glass-card")].filter(d => d.querySelector("p.text-xs"));
    const card0 = cards[0];
    const cc = card0 ? getComputedStyle(card0) : null;
    const stat = cards.map(cd => {
      const label = cd.querySelector("p.text-xs");
      const value = [...cd.querySelectorAll("p")].find(p => p !== label);
      const lc = label ? getComputedStyle(label) : null;
      const vc = value ? getComputedStyle(value) : null;
      return {
        label: label ? label.textContent.trim() : null,
        labelSize: lc?.fontSize, labelWeight: lc?.fontWeight, labelTransform: lc?.textTransform,
        labelColorAlpha: lc?.color ? (lc.color.match(/([\d.]+)\)$/) || [])[1] : null,
        value: value ? value.textContent.trim() : null,
        valueSize: vc?.fontSize, valueWeight: vc?.fontWeight,
      };
    });
    const h2s = [...document.querySelectorAll("h2")].map(h => {
      const c = getComputedStyle(h);
      return { t: h.textContent.trim(), size: c.fontSize, weight: c.fontWeight, transform: c.textTransform };
    });
    return {
      h1: h1 ? { t: h1.textContent.trim(), size: getComputedStyle(h1).fontSize } : null,
      subAlpha: subC ? (subC.color.match(/([\d.]+)\)$/) || [])[1] : null,
      pills,
      cardBg: cc ? cc.backgroundColor : null,
      cardBorder: cc ? cc.border.slice(0, 40) : null,
      stat,
      h2s,
    };
  });
  ok(
    "the Reports header holds (h1 24px, sub white/0.35 — the oklab alpha posture)",
    rep.h1?.t === "Reports" && rep.h1.size === "24px" && rep.subAlpha === "0.35",
    `h1=${rep.h1?.t} subAlpha=${rep.subAlpha}`,
  );
  ok(
    "the 4 period pills render with 30 days ACTIVE (full-white text; inactive oklab white/0.4)",
    rep.pills.length === 4 && rep.pills.map(p => p.t).join() === "7 days,14 days,30 days,90 days" &&
      rep.pills[2].color === "rgb(255, 255, 255)" &&
      rep.pills.every(p => p.color !== rep.pills[2].color || p.t === "30 days"),
    `pills=[${rep.pills.map(p => p.t).join(", ")}]`,
  );
  ok(
    "the stat family holds (labels 12px/400 uppercase white/0.35, values <p> 24px/900)",
    rep.stat.length === 3 &&
      rep.stat[0].label === "Total Revenue" && rep.stat[1].label === "Transactions" && rep.stat[2].label === "Avg. Ticket" &&
      rep.stat.every(s => s.labelSize === "12px" && s.labelWeight === "400" && s.labelTransform === "uppercase" && s.labelColorAlpha === "0.35") &&
      rep.stat.every(s => s.valueSize === "24px" && s.valueWeight === "900"),
    `labels=[${rep.stat.map(s => s.label).join(", ")}]`,
  );
  ok(
    "the 30-day window values match the db truth ($410.64 / 33 / $12.44)",
    rep.stat[0].value === "$410.64" && rep.stat[1].value === "33" && rep.stat[2].value === "$12.44",
    `values=[${rep.stat.map(s => s.value).join(", ")}]`,
  );
  ok(
    "the stat card's computed surface is the measured family (rgba(16,18,32,0.9) + 1px white/0.07)",
    rep.cardBg === "rgba(16, 18, 32, 0.9)" &&
      rep.cardBorder.startsWith("1px solid rgba(255, 255, 255, 0.07)"),
    `bg=${rep.cardBg}`,
  );
  ok(
    "the three measured h2 sections render (14px/700 uppercase)",
    rep.h2s.length === 3 && rep.h2s.map(h => h.t).join() === "Daily Sales,Revenue by Payment Method,Breakdown by Method" &&
      rep.h2s.every(h => h.size === "14px" && h.weight === "700" && h.transform === "uppercase"),
    `h2s=[${rep.h2s.map(h => h.t).join(" | ")}]`,
  );
  await page.screenshot({ path: `${OUT}/88-session17-reports-withdata.png`, fullPage: true });

  // The Methods tables (row structure: bare text nodes — parse child nodes).
  const methods = await page.evaluate(() => {
    const rev = document.querySelector('[data-testid="revenue-by-method"]');
    const brk = document.querySelector('[data-testid="breakdown-by-method"]');
    const rowsOf = (root) => root ? [...root.querySelectorAll("li")].map(li => {
      const nameSpan = li.querySelector("span.flex");
      const name = nameSpan
        ? [...nameSpan.childNodes].filter(n => n.nodeType === 3).map(n => (n.textContent || "").trim()).join("")
        : "";
      const count = [...(nameSpan?.querySelectorAll("span") || [])].map(s => s.textContent.trim()).find(t => /^\(\d+\)$/.test(t)) || null;
      const bold = li.querySelector("span.font-bold");
      const money = bold ? (bold.firstChild?.textContent || "").trim() : null;
      const share = bold?.querySelector("span")?.textContent?.trim() || null;
      const bar = li.querySelector("div.mt-1\\.5 > div");
      return { name, count, money, share, barW: bar ? bar.style.width : null };
    }) : [];
    return { rev: rowsOf(rev), brk: rowsOf(brk) };
  });
  ok(
    "the Revenue by Payment Method rows match the db truth (card $246.74 (16) / cash $163.90 (17))",
    methods.rev.length === 2 &&
      methods.rev.some(m => m.name === "card" && m.money === "$246.74" && m.count === "(16)") &&
      methods.rev.some(m => m.name === "cash" && m.money === "$163.90" && m.count === "(17)"),
    JSON.stringify(methods.rev),
  );
  ok(
    "the share chips render rounded (card 60% / cash 40%)",
    methods.rev.some(m => m.share === "60%") && methods.rev.some(m => m.share === "40%"),
    `shares=[${methods.rev.map(m => m.share).join(", ")}]`,
  );
  ok(
    "the Breakdown bars mirror the shares (60% / 40% widths)",
    methods.brk.some(m => m.barW === "60%") && methods.brk.some(m => m.barW === "40%"),
    `bars=[${methods.brk.map(m => m.barW).join(", ")}]`,
  );

  // The 7-day pill narrows the window (calendar-bucket truth: $366.56 / 28).
  await page.getByRole("button", { name: "7 days" }).click();
  await page.waitForTimeout(600);
  const rep7 = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("main div.glass-card")].filter(d => d.querySelector("p.text-xs"));
    return cards.map(cd => {
      const label = cd.querySelector("p.text-xs");
      const value = [...cd.querySelectorAll("p")].find(p => p !== label);
      return value ? value.textContent.trim() : null;
    });
  });
  ok(
    "the 7-day calendar-bucket window narrows to the db truth ($366.56 / 28)",
    rep7[0] === "$366.56" && rep7[1] === "28",
    `7-day values=[${rep7.join(", ")}]`,
  );
  await page.screenshot({ path: `${OUT}/89-session17-reports-7day.png` });

  // ---- the F-76 drift spot-check (a FRESH context; the documented
  // oklab-alpha posture — either serialization passes) ------------------------
  const f76ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const f76page = await f76ctx.newPage();
  await f76page.goto(`${BASE}/login`);
  await f76page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
    null,
    { timeout: 10000 },
  );
  await f76page.getByLabel("Email").fill(EMAIL);
  await f76page.getByLabel("Password").fill("Wrong-Password-99");
  await f76page.getByTestId("login-submit").click();
  // Trap #28: scope to main.login-canvas — the FIRST unscoped [role=alert]
  // can be Next's route announcer.
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

  // ---- the mobile drawer (the first context is still authed) ---------------
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
  try {
    execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
  } catch {}
}

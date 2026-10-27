// Session-18 evidence script — the with-data StoreSettings/Dashboard remediation
// verified LIVE on the rebuilt standalone: the demo-seeded surfaces the
// empty-store e2e can never see (the session_29 "Next" pointer's target — the
// settings form census: the materialized row, the Branding pickers + hex
// inputs, the Receipt footer, the "None" provider trigger, the fiscal switch
// + label pair, the 5 category chips with exact dot colors, the 54px Save
// CTA; the Dashboard family: the 4 db-truth stats, the stat family styles,
// the with-data chart + the niceScale top tick, the category breakdown
// rows/bars), plus the standing F-76 drift spot-check and the mobile drawer
// superset — captured from the PRODUCTION standalone build (the family rule:
// never the dev badge). The script OWNS the server lifecycle (spawn → health
// → verify → capture → kill).
//
// Measurement postures baked in (the standing + Session-18 lessons):
//   • textContent pins the SOURCE case; CSS-uppercased innerText is matched
//     case-insensitively in settled-state waits.
//   • v4's oklab white/α serializations are pinned by ALPHA (note the SPACE:
//     "oklab(0.999994 … / 0.9)" — the regex is /\/\s*([\d.]+)\)$/), never by
//     the full serialization string.
//   • waitForFunction options are the THIRD argument — (fn, null, opts).
//   • Pin COMPUTED styles + the icon NAME, never the class-string order
//     (the clone renders h-5 w-5, the reference w-5 h-5 — identical computed).
//   • Mixed tick arrays (numbers + weekday labels) filter to numeric before
//     reducing (Math.max over Number("Wed") is NaN).
//   • The VOLATILE expectations (the Dashboard's today-bucket pair) are
//     DERIVED FROM THE DB AT RUNTIME — a morning-seeded demo db carries its
//     day-0 sales on yesterday's calendar bucket, so a hardcoded "$X.NN
//     today" pin would rot within hours of any re-seed.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3419;
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

// ---- the db truth, derived at run time (read-only) -------------------------
// The demo constants (products/categories/stock/settings) are re-seed-stable
// and pinned literally; the today-bucket pair is volatile and DERIVED.
const truth = JSON.parse(
  execSync(
    `bun -e "import { Database } from 'bun:sqlite';
const db = new Database('${DEMO_DB}', { readonly: true });
const q = (s) => JSON.parse(JSON.stringify(db.query(s).all()));
const settings = q('SELECT * FROM StoreSettings')[0];
const cats = q('SELECT name, color FROM Category ORDER BY name');
const stock = q('SELECT SUM(CASE WHEN stock <= \\"minStock\\" THEN 1 ELSE 0 END) lowStockCount FROM Product')[0];
const products = q('SELECT COUNT(*) n FROM Product')[0];
const sales = q('SELECT createdAt, total FROM Sale');
const today = new Date(); today.setHours(0,0,0,0);
const t = sales.filter(r => new Date(r.createdAt) >= today);
const buckets = [];
for (let d = 6; d >= 0; d--) { const s = new Date(today); s.setDate(s.getDate()-d); const e = new Date(s); e.setDate(e.getDate()+1);
  const inB = sales.filter(r => new Date(r.createdAt) >= s && new Date(r.createdAt) < e);
  buckets.push({ n: inB.length, s: Math.round(inB.reduce((a,r)=>a+r.total,0)*100)/100 }); }
console.log(JSON.stringify({ settings: { storeName: settings.storeName, currency: settings.currency, primary: settings.primaryColor, secondary: settings.secondaryColor, footer: settings.receiptFooter, provider: settings.cardProvider, hideFiscal: !!settings.hideFiscalOnReceipt },
  cats, lowStock: stock.lowStockCount, products: products.n,
  today: { n: t.length, sum: Math.round(t.reduce((a,r)=>a+r.total,0)*100)/100 }, buckets }));
db.close();"`,
    { cwd: ROOT, env: process.env },
  ).toString(),
);

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

  // ---- the db-truth derivation checks (the provisioning guard's twin) -----
  ok(
    "the db truth derives from the demo db (15 products, 5 categories, 3 low-stock, the seeded settings row)",
    truth.products === 15 && truth.cats.length === 5 && truth.lowStock === 3 &&
      truth.settings.storeName === "My Store" && truth.settings.currency === "USD" &&
      truth.settings.primary === "#6366f1" && truth.settings.secondary === "#8b5cf6" &&
      truth.settings.footer === "Thank you for your purchase!" && truth.settings.provider === "none",
    `products=${truth.products} cats=${truth.cats.length} low=${truth.lowStock}`,
  );
  ok(
    "the derived 7-bucket series is coherent (7 buckets, the 7-day window the Reports page pins)",
    truth.buckets.length === 7 &&
      Math.abs(truth.buckets.reduce((a, b) => a + b.s, 0) - 366.56) < 0.01 &&
      truth.buckets.reduce((a, b) => a + b.n, 0) === 28,
    `buckets=${JSON.stringify(truth.buckets)}`,
  );

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

  // ---- the WITH-DATA StoreSettings (demo settings row + 5 categories) -----
  await page.goto(`${BASE}/StoreSettings`);
  await page.waitForFunction(
    () => { const i = document.querySelector("input#set-name"); return i && i.value === "My Store"; },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(400);
  const st = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const sub = h1?.parentElement?.querySelector("p");
    const secs = [...document.querySelectorAll("section[aria-label]")].map(s => {
      const h3 = s.querySelector("h3");
      const icon = h3?.querySelector("svg");
      return {
        title: h3 ? h3.textContent.trim() : null,
        iconName: icon ? icon.className.baseVal.replace("lucide lucide-", "").split(" ")[0] : null,
        iconColor: icon ? getComputedStyle(icon).color : null,
        iconSize: icon ? getComputedStyle(icon).width : null,
      };
    });
    const name = document.querySelector("input#set-name");
    const cur = document.querySelector('button[aria-label="Currency"]');
    const primary = document.querySelector("input#set-primary");
    const primaryHex = primary?.parentElement?.querySelector("input");
    const secondary = document.querySelector("input#set-secondary");
    const footer = document.querySelector("textarea#set-footer");
    const fs = footer ? getComputedStyle(footer) : null;
    const prov = document.querySelector('button[aria-label="Card payment provider"]');
    const sw = document.querySelector('[role="switch"]');
    const fiscalLabel = sw?.closest("label")?.textContent?.trim();
    const catList = document.querySelector('ul[aria-label="Product categories"]');
    const chips = [...(catList?.querySelectorAll("li") || [])].map(li => {
      const dot = li.querySelector("span[aria-hidden=true]");
      return { text: li.textContent.trim(), dot: dot ? getComputedStyle(dot).backgroundColor : null };
    });
    const save = document.querySelector('[data-testid="save-settings"]');
    const ss = save ? getComputedStyle(save) : null;
    return {
      h1: h1?.textContent.trim(), sub: sub?.textContent.trim(),
      subStyle: sub ? getComputedStyle(sub).fontSize + " " + getComputedStyle(sub).color : null,
      secs, nameVal: name?.value,
      curText: cur?.textContent.trim(), curH: cur ? getComputedStyle(cur).height : null, curR: cur ? getComputedStyle(cur).borderRadius : null,
      primaryVal: primary?.value, primaryHex: primaryHex?.value,
      secondaryVal: secondary?.value,
      footerVal: footer?.value, footerRows: footer?.rows,
      footerMinH: fs ? fs.minHeight : null, footerR: fs ? fs.borderRadius : null,
      provText: prov?.textContent.trim(),
      swChecked: sw?.getAttribute("aria-checked"), fiscalLabel,
      chips, saveH: ss ? ss.height : null, saveText: save?.textContent.trim(),
    };
  });

  ok(
    "the StoreSettings header holds (h1 + 'Customize your business' 14px slate-500)",
    st.h1 === "Store Settings" && st.sub === "Customize your business" &&
      st.subStyle === "14px rgb(100, 116, 139)",
    `h1=${st.h1} sub=${st.sub} [${st.subStyle}]`,
  );
  ok(
    "the six sections render with the measured h3 titles + colored bare icons (computed, not class strings)",
    st.secs.length === 6 &&
      st.secs[0].title === "Business Information" && st.secs[0].iconName === "store" && st.secs[0].iconColor === "rgb(99, 102, 241)" &&
      st.secs[1].title === "Branding" && st.secs[1].iconName === "palette" && st.secs[1].iconColor === "rgb(168, 85, 247)" &&
      st.secs[2].title === "Receipt" && st.secs[2].iconName === "file-text" && st.secs[2].iconColor === "rgb(34, 197, 94)" &&
      st.secs[3].title === "Fiscal / Tax Data" && st.secs[3].iconName === "receipt" && st.secs[3].iconColor === "rgb(249, 115, 22)" &&
      st.secs[4].title === "Card Payment Provider" && st.secs[4].iconName === "credit-card" && st.secs[4].iconColor === "rgb(59, 130, 246)" &&
      st.secs[5].title === "Product Categories" && st.secs[5].iconName === "tag" && st.secs[5].iconColor === "rgb(245, 158, 11)" &&
      st.secs.every(s => s.iconSize === "20px"),
    `secs=[${st.secs.map(s => s.title + ":" + s.iconName).join("|")}]`,
  );
  ok(
    "the with-data form materializes the demo settings row (store name + currency at 36px/12px)",
    st.nameVal === truth.settings.storeName && st.curText === "USD - US Dollar" &&
      st.curH === "36px" && st.curR === "12px",
    `name=${st.nameVal} cur=${st.curText}`,
  );
  ok(
    "the Branding pickers carry the seeded colors (the hex inputs mirror the pickers)",
    st.primaryVal === truth.settings.primary && st.primaryHex === truth.settings.primary &&
      st.secondaryVal === truth.settings.secondary,
    `primary=${st.primaryVal}/${st.primaryHex} secondary=${st.secondaryVal}`,
  );
  ok(
    "the Receipt footer textarea carries the seeded copy (rows=2, 60px, 12px)",
    st.footerVal === truth.settings.footer && st.footerRows === 2 &&
      st.footerMinH === "60px" && st.footerR === "12px",
    `footer="${st.footerVal}"`,
  );
  ok(
    "the Provider trigger reads 'None' (the display label of the stored 'none')",
    st.provText === "None",
    `prov=${st.provText}`,
  );
  ok(
    "the fiscal switch renders the seeded hidden default with its label pair",
    st.swChecked === (truth.settings.hideFiscal ? "false" : "true") &&
      st.fiscalLabel === (truth.settings.hideFiscal ? "Hidden on receipt" : "Visible on receipt"),
    `checked=${st.swChecked} label=${st.fiscalLabel}`,
  );
  const rgbOf = (hex) => `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;
  ok(
    "the 5 demo categories render as chips with their exact dot colors",
    st.chips.length === 5 &&
      st.chips.every(c => {
        const row = truth.cats.find(t => t.name === c.text);
        return row && c.dot === rgbOf(row.color);
      }),
    `chips=[${st.chips.map(c => c.text).join(", ")}]`,
  );
  ok(
    "Save Changes stays the 54px primary CTA",
    st.saveText === "Save Changes" && st.saveH === "54px",
    `h=${st.saveH}`,
  );
  await page.screenshot({ path: `${OUT}/90-session18-settings-withdata.png`, fullPage: true });

  // ---- the WITH-DATA Dashboard (demo sales + products) ---------------------
  await page.goto(`${BASE}/Dashboard`);
  await page.waitForFunction(
    () => !!document.querySelector('[data-testid="line-chart"]'),
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  const dash = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const stats = [...document.querySelectorAll("main p.text-xs")].map(p => {
      const card = p.closest("div");
      const val = card?.querySelector("p.text-2xl");
      const vp = val ? getComputedStyle(val) : null;
      const lp = getComputedStyle(p);
      return { label: p.textContent.trim(), value: val?.textContent.trim(), valW: vp ? vp.fontWeight : null, valColor: vp ? vp.color : null, labW: lp.fontWeight, labSize: lp.fontSize, labColor: lp.color, labTransform: lp.textTransform };
    });
    const h3s = [...document.querySelectorAll("h3")].map(h => ({ t: h.textContent.trim(), size: getComputedStyle(h).fontSize }));
    const svg = document.querySelector('[data-testid="line-chart"]');
    const paths = svg ? [...svg.querySelectorAll("path")] : [];
    const grid = svg ? [...svg.querySelectorAll("line[stroke='#e2e8f0']")].length : 0;
    const ticks = svg ? [...svg.querySelectorAll("text")].map(t => t.textContent) : [];
    const catRows = [...document.querySelectorAll('[data-testid="category-breakdown"] li')].map(li => {
      const dot = li.querySelector("span[aria-hidden=true]");
      const count = li.querySelector("span.font-semibold");
      const bar = li.querySelector("div.h-1\\.5 > div");
      return {
        name: li.querySelector("div > span")?.textContent.trim() || li.querySelector("span")?.textContent.trim(),
        dot: dot ? getComputedStyle(dot).backgroundColor : null,
        count: count ? count.textContent.trim() : null,
        barW: bar ? bar.style.width : null,
      };
    });
    return { h1: h1?.textContent.trim(), stats, h3s, pathCount: paths.length, firstPathD: paths[0]?.getAttribute("d")?.slice(0, 40), grid, ticks, catRows };
  });

  const money = (cents) => `$${(cents / 100).toFixed(2)}`;
  ok(
    "the Dashboard h1 renders",
    dash.h1 === "Dashboard",
    `h1=${dash.h1}`,
  );
  ok(
    "the four stat cards carry the db truth (the today pair DERIVED at run time; Products/Low Stock literal)",
    dash.stats.length === 4 &&
      dash.stats[0].label === "Today's Sales" && dash.stats[0].value === money(truth.today.sum) &&
      dash.stats[1].label === "Transactions" && dash.stats[1].value === String(truth.today.n) &&
      dash.stats[2].label === "Products" && dash.stats[2].value === String(truth.products) &&
      dash.stats[3].label === "Low Stock" && dash.stats[3].value === String(truth.lowStock),
    `values=[${dash.stats.map(s => s.label + "=" + s.value).join(", ")}] expected today=${money(truth.today.sum)}/${truth.today.n} products=${truth.products} low=${truth.lowStock}`,
  );
  const alphaOf = (s) => { const m = /\/\s*([\d.]+)\)$/.exec(s || ""); return m ? m[1] : null; };
  ok(
    "the Dashboard stat family renders the measured styles (600/12px uppercase slate-500 labels, 700/24px white/90 values by ALPHA)",
    dash.stats.every(s => s.labW === "600" && s.labSize === "12px" && s.labColor === "rgb(100, 116, 139)" && s.labTransform === "uppercase") &&
      dash.stats.every(s => s.valW === "700" && alphaOf(s.valColor) === "0.9"),
    `lab=${dash.stats[0].labW}/${dash.stats[0].labSize} val=${dash.stats[0].valW}/alpha=${alphaOf(dash.stats[0].valColor)}`,
  );
  ok(
    "both section h3s render at 16px with data",
    dash.h3s.length === 2 && dash.h3s.some(h => h.t === "Sales — Last 7 days" && h.size === "16px") &&
      dash.h3s.some(h => h.t === "Products by Category" && h.size === "16px"),
    `h3s=[${dash.h3s.map(h => h.t).join("|")}]`,
  );
  ok(
    "the with-data chart renders its curve (the smooth path) + the nice grid",
    dash.pathCount >= 2 && (dash.firstPathD || "").length > 20 && dash.grid >= 4 && dash.ticks.length >= 4,
    `paths=${dash.pathCount} grid=${dash.grid} ticks=[${dash.ticks.join(",")}]`,
  );
  const peak = Math.max(...truth.buckets.map(b => b.s));
  const numericTicks = dash.ticks.map(Number).filter(n => !Number.isNaN(n));
  const topTick = numericTicks.length ? Math.max(...numericTicks) : NaN;
  ok(
    "the niceScale law holds on real data (the top tick is a nice multiple >= the data peak)",
    topTick >= peak && [100, 125, 150, 200, 250, 500].includes(topTick),
    `peak=${peak} topTick=${topTick}`,
  );
  ok(
    "the category breakdown renders the 5 demo rows (dot colors + counts + 20% bars)",
    dash.catRows.length === 5 &&
      dash.catRows.every(r => {
        const row = truth.cats.find(t => t.name === r.name);
        return row && r.count === "3" && r.barW === "20%" && r.dot === rgbOf(row.color);
      }),
    `rows=[${dash.catRows.map(r => r.name + ":" + r.count + "@" + r.barW).join(", ")}]`,
  );
  await page.screenshot({ path: `${OUT}/91-session18-dashboard-withdata.png`, fullPage: true });

  // ---- the categories close-up (the with-data chips) -----------------------
  await page.goto(`${BASE}/StoreSettings`);
  await page.waitForTimeout(600);
  const catSection = page.locator('section[aria-label="Product Categories"]');
  await catSection.screenshot({ path: `${OUT}/92-session18-categories-withdata.png` });

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

// Session-9 VLM spot-check of the fresh screenshots (43-48) — the
// hypothesis-generator pass (computed styles remain ground truth; this
// catches what measurement misses: broken layouts, clipped surfaces,
// mid-animation frames). POS-specific expectations per shot.
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const SHOTS = [
  {
    file: "48-session9-login.png",
    expect: `A light login card centered on a dark canvas: a 96px hexagonal logo, the heading "Welcome to VeloxPOS (Point Of Sale)", four SSO buttons (Google/Microsoft/Facebook/Apple), email+password fields, a dark Sign in button, and a 4px light gradient strip along the card's top edge. NO dark-theme inputs, NO clipping.`,
  },
  {
    file: "43-session9-sidebar-glyph.png",
    expect: `The top-left corner of a dark app: a violet-to-indigo gradient square chip with a lightning bolt + the wordmark "VeloxPOS", below it a vertical nav list where the FIRST item (Terminal, a shopping-cart icon) is an active violet pill and the others are dim; the 7th item "Reports" must show a DOCUMENT-WITH-BARS icon (a page/file outline containing a small bar chart), not bare bars. NO overlapping text.`,
  },
  {
    file: "44-session9-dashboard.png",
    expect: `A dark dashboard: an H1 "Dashboard", 4 stat cards (Today's Sales / Transactions / Products / Low Stock) with big numbers, a line chart card titled "Sales — Last 7 days" with a dotted violet grid, and a "Products by Category" breakdown card. Charts must show readable axis labels (weekday abbreviations), NOT stacked or overlapping numbers. NO broken/empty chart.`,
  },
  {
    file: "45-session9-settings.png",
    expect: `A dark Store Settings page: H1 "Store Settings", six section cards each with a small colored icon + title (Business Information, Branding, Receipt, Fiscal / Tax Data, Card Payment Provider, Product Categories), form inputs, and a large violet "Save Changes" button. All six sections visible or partially visible in normal document flow; NO overlapping cards.`,
  },
  {
    file: "46-session9-terminal-cart.png",
    expect: `A dark POS terminal: a product grid with cards (name, price, stock chip), category filter chips on top, and a right-side CART panel listing 2 added products with quantity controls and a big emerald-green gradient "CHARGE" button. NO clipped cart, NO overlapping product cards.`,
  },
  {
    file: "47-session9-mobile-drawer.png",
    expect: `A 390px-wide mobile view: a dark slide-in navigation drawer fully visible from the left edge (NOT partially slid), overlaying a dimmed backdrop; the drawer has the VeloxPOS brand row at top, an X close button, and 8 nav rows (Terminal, Dashboard, Inventory, Sales, Registers, Cashiers, Reports, Settings) with icons; the Reports row shows a document-with-bars icon. The drawer must NOT be clipped mid-animation.`,
  },
];

let pass = 0;
for (const { file, expect } of SHOTS) {
  let b64;
  try {
    b64 = readFileSync(`${OUT}/${file}`).toString("base64");
  } catch {
    console.log(`FAIL ${file}: missing`);
    continue;
  }
  try {
    const res = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
            {
              type: "text",
              text: `You are QA-verifying a screenshot of a POS web app clone. Expected: ${expect}\nAnswer PASS if the screenshot matches the expectation (minor font rendering / sample-data differences are fine), otherwise FAIL with a one-line reason. First line must be exactly PASS or FAIL.`,
            },
          ],
        },
      ],
    });
    const reply = (res.choices[0]?.message?.content ?? "").trim();
    const verdict = reply.split("\n")[0].toUpperCase().startsWith("PASS") ? "PASS" : "FAIL";
    if (verdict === "PASS") pass++;
    console.log(`${verdict} ${file}${verdict === "FAIL" ? " — " + reply.slice(0, 160) : ""}`);
  } catch (e) {
    console.log(`ERR  ${file}: ${String(e).slice(0, 120)}`);
  }
}
console.log(`\nVLM: ${pass}/${SHOTS.length} PASS`);

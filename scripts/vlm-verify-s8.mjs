// VLM-verify the Session-8 screenshot set (layout-integrity smoke after the
// artifact-hygiene rebuild — the trap-16 discipline: settle-waited captures
// of animated surfaces, checked for clipped/mid-animation frames).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "37-session8-mobile-drawer-open.png",
    expect:
      "A mobile (390px) POS screen with a dark slide-in navigation drawer open from the left over a backdrop: a VeloxPOS brand chip + wordmark at top, a close X button, 8 navigation links (Terminal, Dashboard, Inventory, Sales, Registers, Cashiers, Reports, Store Settings) with icons, Terminal highlighted as the active violet pill. The drawer must look FULLY slid in (not clipped mid-animation) with its full width and right edge visible.",
  },
  {
    file: "38-session8-terminal-cart.png",
    expect:
      "A dark POS terminal at desktop width: left side a product catalog grid with violet/indigo gradient category chips and product cards; right side a cart panel listing 2 products with quantity steppers and prices, a subtotal/tax/total breakdown, and a large emerald green CHARGE button showing a dollar amount.",
  },
  {
    file: "39-session8-receipt.png",
    expect:
      "A dark modal dialog showing a sale receipt: a store name heading, a monospace ticket line starting with T-0000, a line-items list with prices, subtotal/tax/total amounts, a payment method, and Close / Print receipt buttons at the bottom.",
  },
  {
    file: "40-session8-sales-ledger.png",
    expect:
      "A dark sales history page titled 'Historial de Ventas' with a Spanish search placeholder, a table with column headers TICKET/FECHA/CAJERO/METODO/TOTAL/ESTADO/ACCIONES (or similar), and at least one completed sale row showing a T-0000xx ticket.",
  },
  {
    file: "41-session8-dashboard-chart.png",
    expect:
      "A dark dashboard with four stat cards (Today's Sales, Transactions, Products, Low Stock), a 7-day sales line chart with readable axis labels (weekday abbreviations and a few numeric y ticks — NOT hundreds of stacked labels), and a products-by-category breakdown card.",
  },
  {
    file: "42-session8-inventory.png",
    expect:
      "A dark inventory page titled Inventory with a search input, gradient category filter chips, a 'New Product' button, and a products table with stock status chips — no clipped columns or overlapping elements.",
  },
];

let pass = 0;
let total = 0;
for (const c of checks) {
  total++;
  const b64 = readFileSync(`${OUT}/${c.file}`).toString("base64");
  try {
    const res = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
            {
              type: "text",
              text: `Does this screenshot match this description? Answer PASS or FAIL with one short sentence.\nDescription: ${c.expect}`,
            },
          ],
        },
      ],
    });
    const reply = res.choices[0]?.message?.content ?? "(no reply)";
    const isPass = /^\s*PASS/i.test(reply);
    if (isPass) pass++;
    console.log(`${c.file}: ${reply.slice(0, 220)}`);
  } catch (e) {
    console.log(`${c.file}: VLM unavailable (${String(e).slice(0, 80)})`);
  }
}
console.log(`\nVLM RESULT: ${pass}/${total} PASS`);

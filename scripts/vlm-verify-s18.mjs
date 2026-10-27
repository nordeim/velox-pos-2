// VLM cross-verification of the Session-18 captures (the with-data
// StoreSettings/Dashboard surfaces + the categories chips). Per the S9 lesson:
// VLM findings are hypotheses — the evidence script's DOM probes are the
// authority (20/20).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "90-session18-settings-withdata.png",
    expect:
      "A dark-mode POS 'Store Settings' page (subline 'Customize your business') with six section cards — Business Information (store name 'My Store', Currency select 'USD - US Dollar'), Branding (color pickers showing #6366f1 indigo and #8b5cf6 violet), Receipt (footer textarea 'Thank you for your purchase!'), Fiscal / Tax Data (a switch labeled 'Hidden on receipt'), Card Payment Provider (select 'None'), and Product Categories (five chips: Beverages, Groceries, Personal Care, Snacks, Electronics with small colored dots), ending in a violet 'Save Changes' button. Answer PASS if all six sections render cleanly with these values and no clipped or overlapping text; FAIL otherwise, with one short reason.",
  },
  {
    file: "91-session18-dashboard-withdata.png",
    expect:
      "A dark-mode POS 'Dashboard' page: four stat cards labeled TODAY'S SALES ($0.00), TRANSACTIONS (0), PRODUCTS (15), LOW STOCK (3) with small gradient icon chips; then 'Sales — Last 7 days' — an indigo line/area chart over a dashed grid with y ticks 0,20,40,60,80,100 and weekday labels; and 'Products by Category' — five rows (Beverages, Groceries, Personal Care, Snacks, Electronics) each with a colored dot, the count 3, and a violet horizontal bar. Answer PASS if the four stats read $0.00 / 0 / 15 / 3, the chart curve is visible with gridlines, and the five category rows render cleanly; FAIL otherwise, with one short reason.",
  },
  {
    file: "92-session18-categories-withdata.png",
    expect:
      "A dark card titled 'Product Categories' with an 'Add' button and five pill chips — Beverages (violet dot), Groceries (green dot), Personal Care (blue dot), Snacks (amber dot), Electronics (red dot) — each showing its name beside its dot. Answer PASS if exactly these five chips render with visible colored dots and clean text; FAIL otherwise, with one short reason.",
  },
];

let pass = 0;
for (const c of checks) {
  const b64 = readFileSync(`${OUT}/${c.file}`).toString("base64");
  try {
    const res = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${c.expect}` },
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        },
      ],
    });
    const answer = res.choices?.[0]?.message?.content ?? "no answer";
    const isPass = /^PASS/i.test(answer.trim());
    if (isPass) pass++;
    console.log(`${isPass ? "PASS" : "FAIL"} · ${c.file} — ${answer.trim().slice(0, 200)}`);
  } catch (err) {
    console.log(`ERROR · ${c.file} — ${String(err).slice(0, 120)}`);
  }
}
console.log(`\nVLM CROSS-CHECK: ${pass}/${checks.length}`);

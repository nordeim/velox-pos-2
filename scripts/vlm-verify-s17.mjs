// VLM cross-verification of the Session-17 captures (the with-data
// Inventory/Reports surfaces + the 7-day switch). Per the S9 lesson: VLM
// findings are hypotheses — the evidence script's DOM probes are the
// authority (19/19).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "87-session17-inventory-withdata.png",
    expect:
      "A dark-mode POS 'Inventory' page: subline '15 products registered', a search box 'Search by name or code...', category pills (All + Beverages + Groceries + Personal Care + Snacks + Electronics), and a populated product table with columns Product/Code/Price/Stock/Category/Status/Actions — status chips including green 'In stock', orange 'Low stock' and red 'Out of stock', small colored category dots, and pencil/trash icon buttons. Answer PASS if the populated table renders cleanly with no overlapping or clipped text; FAIL otherwise, with one short reason.",
  },
  {
    file: "88-session17-reports-withdata.png",
    expect:
      "A dark-mode POS 'Reports' page (subline 'Sales & revenue analytics'): four period pills with '30 days' highlighted, three stat cards showing TOTAL REVENUE $410.64, TRANSACTIONS 33, AVG. TICKET $12.44, then sections 'DAILY SALES' (an indigo area chart), 'REVENUE BY PAYMENT METHOD' and 'BREAKDOWN BY METHOD' with violet 'card' and green 'cash' rows showing $246.74 (16) 60% and $163.90 (17) 40% plus horizontal share bars. Answer PASS if all three sections render cleanly with the $410.64 / 33 / $12.44 values visible and nothing clipped; FAIL otherwise, with one short reason.",
  },
  {
    file: "89-session17-reports-7day.png",
    expect:
      "The same dark-mode POS 'Reports' page with the '7 days' period pill now highlighted (instead of 30 days) and the stat cards narrowed to smaller values — TOTAL REVENUE $366.56 and TRANSACTIONS 28 (AVG. TICKET around $13). Answer PASS if the '7 days' pill is the highlighted one and the stat values read $366.56 / 28; FAIL otherwise, with one short reason.",
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

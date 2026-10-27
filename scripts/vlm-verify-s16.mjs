// VLM cross-verification of the Session-16 captures (the with-data
// Registers/Sales surfaces + the F-110 receipt stamp + the drawer). Per the
// S9 lesson: VLM findings are hypotheses — the evidence script's DOM probes
// are the authority (13/13).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "81-session16-registers-withdata.png",
    expect:
      "A dark-mode POS 'Cash Registers' page with the subline '1 registers configured', a 'New Register' violet gradient button, and ONE glass register card: name 'Register 1', location 'Main entrance', an 'Available' pill chip, and action buttons 'Open shift' + 'Go to Terminal' plus small icon buttons. Answer PASS if that card renders cleanly with no overlapping or clipped text; FAIL otherwise, with one short reason.",
  },
  {
    file: "82-session16-sales-receipt.png",
    expect:
      "A dark-mode dialog over a Spanish sales ledger page ('Historial de Ventas'): a receipt dialog titled with a ticket code like T-000033, a description line showing a DATE-TIME in the exact format DD/MM/YYYY HH:MM (e.g. 26/10/2026 14:41 — day/month/year with a 24h clock, NO 'AM/PM', no month name), mono-spaced item lines with prices, a Total row, and buttons. Answer PASS if the timestamp matches the DD/MM/YYYY HH:MM format; FAIL if it shows an English/AM-PM format or any other layout, with one short reason.",
  },
  {
    file: "83-session16-sales-withdata.png",
    expect:
      "A dark-mode Spanish sales ledger ('Historial de Ventas') with a search box 'Buscar por ticket, cliente o cajero...' and a table of sales rows: ticket codes (T-xxxxxx), Spanish dates like '26 oct 2026', cashier names, green 'cash'/violet 'card' method chips, dollar totals, green 'Completada' status chips, and an actions column with an eye icon. Answer PASS if the populated table renders cleanly with no clipped/overlapping columns; FAIL otherwise, with one short reason.",
  },
  {
    file: "85-session16-dashboard-withdata.png",
    expect:
      "A dark-mode POS dashboard: four stat cards ($0.00, 0, 15, 3), a 'Sales — Last 7 days' line chart with an INDIGO smooth curve over a dashed grid (y labels 0,20,40,60,80,100 — the curve's PEAK stays at/below the topmost 100 gridline), and a 'Products by Category' panel with colored rows. Answer PASS if the peak does not overshoot the top gridline and nothing overlaps; FAIL otherwise, with one short reason.",
  },
  {
    file: "86-session16-mobile-drawer.png",
    expect:
      "A MOBILE (390px) dark POS app: a slide-in navigation drawer with a dark backdrop, a VeloxPOS brand row, 8 nav links with one highlighted violet pill, and a close X — NO horizontal overflow, no clipped edges. Answer PASS if it matches; FAIL otherwise.",
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

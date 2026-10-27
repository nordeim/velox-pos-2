// VLM cross-verification of the Session-15 POST-FIX captures (the F-107
// cure at a glance + the list parity). Per the S9 lesson: VLM findings are
// hypotheses — the evidence script's DOM probes are the authority (14/14).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "77-session15-dashboard-populated.png",
    expect:
      "A dark-mode POS dashboard with four stat cards (values like $0.00, 0, 15, 3), a 'Sales — Last 7 days' line chart with an INDIGO smooth curve over a dashed light grid with y-axis labels 0,20,40,60,80,100, and a 'Products by Category' panel with colored rows and progress bars. The curve's PEAK should stay AT or BELOW the topmost dashed gridline (the 100 line at the top). Answer PASS if the peak does not overshoot the top gridline and nothing overlaps or clips; FAIL otherwise, with one short reason.",
  },
  {
    file: "78-session15-reports-populated.png",
    expect:
      "A dark-mode POS reports page with period pills, stat cards ($410.64, 33, $12.44), and a 'Daily Sales' area chart: an INDIGO curve with gradient fill over a faint dashed grid, y labels $0,$20,...,$100, and date x labels. The curve's PEAK should stay AT or BELOW the topmost gridline ($100 at the top). Answer PASS if so and nothing overlaps/clips; FAIL otherwise, with one short reason.",
  },
  {
    file: "79-session15-settings-currency-listbox.png",
    expect:
      "A dark-mode store settings page with an open dropdown listbox showing exactly six currency options in this order: USD - US Dollar, EUR - Euro, GBP - British Pound, MXN - Mexican Peso, COP - Colombian Peso, ARS - Argentine Peso. The listbox panel is dark navy with subtle border. Answer PASS if all six appear in that order; FAIL otherwise.",
  },
  {
    file: "80-session15-mobile-drawer.png",
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

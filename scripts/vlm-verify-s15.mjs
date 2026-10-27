// VLM eyeball of the Session-15 populated-data audit captures (the F-50
// pattern: DOM probes are the authority — VLM findings are hypotheses to
// verify in the DOM). Checks the with-data dashboard + reports for visual
// defects invisible to the empty-store e2e.
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "75-session15-dashboard-populated-audit.png",
    expect:
      "A dark-mode POS dashboard with four stat cards (values like $0.00, 0, 15, 3), a 'Sales — Last 7 days' line chart with an INDIGO smooth curve over a dashed light grid, and a 'Products by Category' panel with colored rows and progress bars. QUESTION: does the indigo curve's PEAK stay BELOW or AT the topmost dashed gridline, or does it rise ABOVE the last gridline into empty ungridded space at the top of the chart? Also report: any overlapping/clipped labels, any unreadable text, any visual glitch.",
  },
  {
    file: "76-session15-reports-populated-audit.png",
    expect:
      "A dark-mode POS reports page with period pills, stat cards (values like $410.64, 33, $12.44), and a 'Daily Sales' area chart with an INDIGO curve + gradient area fill over a faint dashed white grid, $-prefixed y ticks and date x labels. QUESTION: does the curve's PEAK stay BELOW or AT the topmost dashed gridline, or does it rise ABOVE the last gridline into empty space? Also report: any overlapping labels, clipped text, or visual glitches.",
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
            {
              type: "text",
              text: `Describe what you see relative to this question, then answer PASS or FAIL with one short reason.\n\n${c.expect}`,
            },
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        },
      ],
    });
    const answer = res.choices?.[0]?.message?.content ?? "no answer";
    const isPass = /PASS/i.test(answer.slice(-200));
    if (isPass) pass++;
    console.log(`${c.file}:\n${answer.trim().slice(0, 500)}\n`);
  } catch (err) {
    console.log(`ERROR · ${c.file} — ${String(err).slice(0, 120)}`);
  }
}
console.log(`VLM SWEEP: ${pass}/${checks.length} PASS-judged`);

// Precise re-check of the two VLM flags that could be real: (a) the login
// canvas + top strip, (b) the sidebar glyph clip.
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

async function ask(file, text) {
  const b64 = readFileSync(`${OUT}/${file}`).toString("base64");
  const res = await zai.chat.completions.createVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          { type: "text", text },
        ],
      },
    ],
  });
  console.log(`\n===== ${file} =====\n${(res.choices[0]?.message?.content ?? "").trim()}`);
}

// (a) The login canvas: the page background OUTSIDE the card. The card is
// light (white/95) on a DARK #080a14 canvas. Question: what color is the
// area around/behind the card, and is there a thin light horizontal strip
// at the very top edge of the card?
await ask(
  "48-session9-login.png",
  `Look at this login page screenshot. Answer these 3 questions precisely:
1. What is the color of the page background AROUND the login card (the margins left/right/top/bottom of the screen outside the card)? (dark navy / white / other)
2. At the very TOP EDGE of the white login card, is there a thin horizontal strip of a slightly different shade running the full width of the card? (yes/no + color if visible)
3. Does the card have a visible drop shadow separating it from the background? (yes/no)
Answer in 3 short numbered lines.`,
);

// (b) The sidebar clip: which items are listed, which is the violet active
// pill, and what shape is the Reports (7th) icon?
await ask(
  "43-session9-sidebar-glyph.png",
  `This is a cropped screenshot of a sidebar navigation. Answer precisely:
1. List the nav item labels you can read, top to bottom.
2. Which item is highlighted with a violet/purple active pill?
3. For the item labeled "Reports": describe its icon shape — is it (A) a page/document outline containing a small bar chart, or (B) just vertical bars with no document outline?
Answer in 3 short numbered lines.`,
);

// VLM-verify the Session-11 evidence captures (the six fixes at a glance).
// Per the S9 lesson: VLM findings are hypotheses — DOM probes are the
// authority (capture-s11-evidence.mjs's computed reads are the DOM-side
// truth, 12/12 green).
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "docs/screenshots";

const checks = [
  {
    file: "55-session11-login-typed.png",
    expect: "A light-mode login card on a pale slate gradient: the VeloxPOS logo, a 'Welcome to VeloxPOS' heading, four social sign-in buttons, an email field showing TYPED text that is DARK (near-black) and CLEARLY READABLE on the light input background, and a password field with typed dot characters, a visible dark 'Sign in' gradient button and a 'Forgot password?' link. The typed text must NOT be white or washed out.",
  },
  {
    file: "56-session11-register-dialog.png",
    expect: "A dark-mode POS app with a modal dialog titled 'New Register': the dialog panel is a SOLID very dark navy (not translucent, no visible blur), with a subtle dark border, a 'Name *' label and filled input, a 'Location' label and input, a GRAY 'Cancel' button (a filled dark slate-gray pill with pale text) on the left and a VIOLET-GRADIENT 'Create' button on the right. Readable, no overlap or clipping.",
  },
  {
    file: "57-session11-product-dialog-select.png",
    expect: "A dark-mode POS app with a 'New Product' dialog open AND a select dropdown listbox floating above it (slightly lighter dark navy panel with a 6px-corner radius): the dialog shows Name/Barcode/Category/Selling price/Cost/stock inputs with pale off-white label text, and the dropdown lists category options. Readable, no overlap.",
  },
  {
    file: "58-session11-settings-labels.png",
    expect: "A dark-mode store settings page: left sidebar with nav items, main content showing 'Store Settings' with sections (Business Information with Store name/Logo/Address/Phone/Email fields, and more below). The form labels (Store name, Address, Phone, Email) are a readable pale off-white — uniform in color, not dim or washed out. A gray 'Upload logo' button with a violet-gradient 'Save Changes' at the bottom right.",
  },
  {
    file: "59-session11-checkout-receipt.png",
    expect: "A dark-mode POS terminal with a RECEIPT dialog open: a store-name heading, a mono ticket line starting with 'T-' followed by digits, itemized lines, a TOTAL row, payment method, and 'Imprimir'/'Cerrar' buttons — the receipt panel solid dark with readable text, and behind it the POS catalog grid and cart.",
  },
  {
    file: "60-session11-mobile-drawer.png",
    expect: "A MOBILE (390px) dark POS app: a slide-in navigation drawer overlaying the content with a dark backdrop — the drawer has a VeloxPOS brand row, a list of 8 nav links (Terminal, Dashboard, Inventory, Sales, Registers, Cashiers, Reports, Settings) with one highlighted violet pill, and a close X — the page shows NO horizontal overflow and no clipped drawer edges.",
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
              text: `Does this screenshot match the following description? Answer PASS or FAIL with one short reason.\n\n${c.expect}`,
            },
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        },
      ],
    });
    const answer = res.choices?.[0]?.message?.content ?? "no answer";
    const isPass = /^PASS/i.test(answer.trim());
    if (isPass) pass++;
    console.log(`${isPass ? "PASS" : "FAIL"} · ${c.file} — ${answer.trim().slice(0, 160)}`);
  } catch (err) {
    console.log(`ERROR · ${c.file} — ${String(err).slice(0, 120)}`);
  }
}
console.log(`\nVLM SWEEP: ${pass}/${checks.length}`);

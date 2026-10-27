// Session-8 pins (F-52): the count-lockstep gate — the neo-crm docs-counts
// mechanism adopted (the family skill's §14: "the proven mechanism is
// neo-crm's tests/docs-counts.test.ts, which puts every live-tense count
// site under the unit gate: a stale count anywhere fails `bun run test`").
//
// The F-52 evidence that motivated the gate: the SKILL's live-tense sites
// re-staled across Sessions 6-7 (§3 Commands said unit (117) / playwright
// (55); §12 said 117/117 + 68/68) while the README/CLAUDE headline sites
// rode the per-session re-anchor — and the PAD's scale line claimed 7 Prisma
// models · 22 API route files against a live census of 9 · 26, its file tree
// claimed 8 e2e spec files against a live 7, and even vitest.config.ts's
// header said "12 files" against a live 13. Nothing failed because nothing
// checked. The docs-counts genus (neo-crm's F-99a1/F-102a2, twice-caught
// there) is now mechanically impossible here: every live-tense count site is
// pinned to a constant, and the constants are verified against the LIVE tree
// — so a count that changes without its doc sites (or doc sites without the
// count) fails the unit gate.
//
// Scope discipline (the F-100a2 history-record doctrine): the pins assert
// LIVE-TENSE sites only. History blocks (the SKILL §19 session history, the
// PAD revision blocks, the worklog, the remediation plans) keep their
// historical numbers by design — records of what was true then. The
// stale-form negatives are scoped accordingly: flat bans only for forms that
// appear nowhere in history; section-scoped bans where a revision block
// legitimately quotes the retired number.
//
// Re-anchoring law: whenever a suite grows, the constants below AND every
// doc site riding them change in the SAME commit — that is the
// count-lockstep rule, now enforced mechanically.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..", "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");
// Collapse whitespace so wrapped lines pin as robustly as single lines.
const flat = (s: string) => s.replace(/\s+/g, " ");

// ---- the live censuses (read from the REAL tree — a stale constant fails) ----

const unitFiles = readdirSync(path.join(root, "tests/unit"))
  .filter((f) => f.endsWith(".test.ts"))
  .sort();

const unitIts = unitFiles.reduce(
  (n, f) => n + ((read(`tests/unit/${f}`).match(/^\s*it\(/gm) ?? []).length),
  0,
);

const e2eSpecs = readdirSync(path.join(root, "tests/e2e"))
  .filter((f) => f.endsWith(".spec.ts"))
  .sort();

// +1 for the setup project's single sign-in (tests/e2e/auth.setup.ts).
const e2eTests =
  e2eSpecs.reduce(
    (n, f) => n + ((read(`tests/e2e/${f}`).match(/^\s*test\(/gm) ?? []).length),
    0,
  ) + 1;

const routeFileCount = (() => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts") out.push(full);
    }
  };
  walk(path.join(root, "src/app/api"));
  return out.length;
})();

const prismaModels = (read("prisma/schema.prisma").match(/^model /gm) ?? []).length;
const viewFiles = readdirSync(path.join(root, "src/components/pos/views")).filter(
  (f) => f.endsWith(".tsx"),
).length;

// ---- the constants (re-anchored in the same commit as any suite growth) ----
// UNIT 133 = the 123 Session-7 baseline + THIS file's 10 its.
const UNIT = 133;
const UNIT_FILES = 13;
// E2E 93 = the Session-11 88 + the Session-12 pins (the failed-login alert
// panel, the forgot-view swap, the signup 3-field card, the sign-in logo/halo
// depth, the OR-divider/links-row pair, the guest 404 gate — the button,
// signup-link and 404 contracts EXTENDED existing tests, not new ones).
const E2E = 93;
const E2E_SPECS = 7;
const ROUTE_FILES = 26;
const PRISMA_MODELS = 9;
const VIEWS = 8;

const readme = flat(read("README.md"));
const claude = flat(read("CLAUDE.md"));
const agents = flat(read("AGENTS.md"));
const pad = flat(read("Project_Architecture_Document.md"));
const skill = read("velox-pos_SKILL.md");
const skillFlat = flat(skill);

// Section extractor for the SKILL's live-tense chapters (history keeps its
// numbers — §19 and the per-session addenda are records, not living sites).
const skillSection = (from: string, to: string) => {
  const start = skill.indexOf(from);
  const end = skill.indexOf(to, start);
  return skill.slice(start, end === -1 ? undefined : end);
};
const skillHeader = skillSection("## 1.", "## 2.");
const skillCommands = skillSection("## 3. Commands", "## 4.");
const skillTesting = skillSection("## 12. Testing strategy", "## 13.");

describe("session-8 (F-52): the count-lockstep gate — every live-tense count site pinned", () => {
  it("the live unit census matches UNIT (self-anchoring — this file counts)", () => {
    expect(unitIts, "count every it( across tests/unit/** — the constant must ride the live census").toBe(UNIT);
  });

  it("the live unit-file census matches UNIT_FILES (vitest.config.ts's header too)", () => {
    expect(unitFiles.length).toBe(UNIT_FILES);
    expect(flat(read("vitest.config.ts")), "the config header's file list is a live-tense site").toContain(
      `${UNIT_FILES} files:`,
    );
  });

  it("the live e2e census matches E2E and E2E_SPECS (specs + the setup sign-in)", () => {
    expect(e2eTests, "the specs' test( census + 1 setup must equal the e2e total").toBe(E2E);
    expect(e2eSpecs.length).toBe(E2E_SPECS);
  });

  it("the live source-tree census matches the scale claims (routes, models, views)", () => {
    expect(routeFileCount, "the API route-file census under src/app/api").toBe(ROUTE_FILES);
    expect(prismaModels, "the Prisma model census (POS-domain + auth-support models both count)").toBe(PRISMA_MODELS);
    expect(viewFiles, "the view-file census under src/components/pos/views").toBe(VIEWS);
  });

  it("README carries the live counts (badges, commands table, quick-start)", () => {
    expect(readme).toContain(`unit%20tests-${UNIT}%20%2F%20${UNIT}-brightgreen`);
    expect(readme).toContain(`e2e-${E2E}%20%2F%20${E2E}-brightgreen`);
    expect(readme).toContain(`Vitest unit suite — the pure domain seams (${UNIT} tests / ${UNIT_FILES} files)`);
    expect(readme).toContain(`Playwright suite against the production standalone build (${E2E} tests;`);
    expect(readme).toContain(`# unit: ${UNIT} tests / ${UNIT_FILES} files`);
    expect(readme).toContain(`# e2e: ${E2E} tests`);
  });

  it("CLAUDE carries the live counts (the testing-conventions baseline)", () => {
    expect(claude).toContain(`${UNIT} tests / ${UNIT_FILES} files.`);
    expect(claude).toContain(`**Baseline: ${E2E} tests.**`);
  });

  it("AGENTS carries the live registry count (the seam registry + the docs-counts gate)", () => {
    expect(agents).toContain(`The ${UNIT_FILES} existing files are the seam registry + the docs-counts lockstep gate`);
  });

  it("PAD carries the live counts (scale line, stack table, diagrams, file tree, doctrine)", () => {
    expect(pad).toContain(`${PRISMA_MODELS} Prisma models · ${ROUTE_FILES} API route files · ${VIEWS} gated views`);
    expect(pad).toContain(`${UNIT} unit tests (${UNIT_FILES} files) · ${E2E} e2e tests (2 browser projects)`);
    expect(pad).toContain(`${PRISMA_MODELS} models; ownership scoping by construction`);
    expect(pad).toContain(`${PRISMA_MODELS} models, user-scoped`);
    expect(pad).toContain(`${PRISMA_MODELS} models; user-owned rows; cascade deletes`);
    expect(pad).toContain(`schema.prisma (${PRISMA_MODELS} models)`);
    expect(pad).toContain(`${UNIT_FILES} vitest files`);
    expect(pad).toContain(`${E2E_SPECS} spec files`);
    expect(pad).toContain(`**Unit (Vitest, ${UNIT}/${UNIT}):**`);
    expect(pad).toContain(`**E2E (Playwright, ${E2E}/${E2E}):**`);
    expect(pad).toContain(`Baseline: ${UNIT_FILES} files.`);
  });

  it("the SKILL carries the live counts (header baselines, commands, data model, tiers)", () => {
    expect(skillFlat).toContain(`Baselines at Session-12 lock: unit **${UNIT}/${UNIT}** (${UNIT_FILES} files)`);
    expect(skillFlat).toContain(`e2e **${E2E}/${E2E}** (79 desktop + 13 mobile + 1 setup)`);
    expect(skillFlat).toContain(`tests/unit/** (${UNIT})`);
    expect(skillFlat).toContain(`playwright (${E2E})`);
    expect(skillFlat).toContain(`${PRISMA_MODELS} models, user-scoped, cascade deletes`);
    expect(skillFlat).toContain(`### Data model (${PRISMA_MODELS} models, all`);
    expect(skillFlat).toContain(`**Unit (Vitest, ${UNIT}/${UNIT}, ${UNIT_FILES} files)**`);
    expect(skillFlat).toContain(`**E2E (Playwright, ${E2E}/${E2E})**`);
  });

  it("the retired stale forms never return to the live-tense sites (scoped negatives)", () => {
    // Flat bans — the three docs with NO history blocks that quote retired
    // forms (README/CLAUDE/AGENTS carry no per-session revision records).
    for (const [name, doc] of [
      ["README", readme],
      ["CLAUDE", claude],
      ["AGENTS", agents],
    ] as const) {
      expect(doc, `${name}: "playwright (55)" retired forever`).not.toContain("playwright (55)");
      expect(doc, `${name}: the unqualified "7 models" claim retired (the schema has ${PRISMA_MODELS})`).not.toContain("7 models");
    }
    // The PAD (revision blocks) and the SKILL (session-history addenda) carry
    // HISTORY that legitimately QUOTES retired forms — the v1.6 block and the
    // Session-8 addendum both cite what was stale. Scope their bans to the
    // LIVE-TENSE parts (everything before the history starts).
    const padLive = pad.slice(0, pad.indexOf("## Revision Block"));
    expect(padLive).not.toContain("playwright (55)");
    expect(padLive).not.toContain("7 models");
    expect(padLive).not.toContain("7 Prisma models");
    expect(padLive).not.toContain("22 API");
    expect(padLive).not.toContain("8 spec files");
    expect(padLive).not.toContain("12 vitest files");
    expect(padLive).not.toContain("Baseline: 12 files.");
    const skillLive = skillFlat.slice(0, skillFlat.indexOf("## Session history addendum"));
    expect(skillLive).not.toContain("playwright (55)");
    expect(skillLive).not.toContain("7 models");
    expect(readme).not.toContain("123 tests / 12 files");
    expect(claude).not.toContain("123 tests / 12 files");
    expect(agents).not.toContain("The existing 12 files");
    expect(skillFlat).not.toContain("(12 files)");

    // Section-scoped bans — the forms that history quotes elsewhere.
    expect(skillHeader).not.toContain("117/117");
    expect(skillHeader).not.toContain("68/68");
    expect(skillCommands).not.toContain("(117)");
    expect(skillTesting).not.toContain("117/117");
    expect(skillTesting).not.toContain("68/68");
    expect(skillTesting).not.toContain("12 files");
  });
});

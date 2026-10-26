# Review & Validation — `REA-SKILL.md` (draft `omni-study-web-reconstruction`)

**Reviewed:** `/home/z/my-project/upload/REA-SKILL.md` (355 lines, v1.0.0, target-pinned)
**Compared against:** `/home/z/my-project/download/replicate-web-app/` (SKILL.md 209 lines + 3 references + 3 assets, v1)
**Method:** four validation gates — (1) external fact-check of every verifiable claim against live sources, (2) structural review as a SKILL.md artifact, (3) compliance against the requirements confirmed in this project's earlier session, (4) internal-consistency audit — followed by a dimension-by-dimension critical comparison and a merge recommendation.

---

## 0. Verdict at a glance

| Gate | Result |
|---|---|
| 1. Factual accuracy (external claims) | **PASS — 8/8 verifiable claims confirmed live**; 1 material omission found (`compare-web-captures`) |
| 2. Structural quality as SKILL.md | **PASS with 2 flags** — non-standard `compatibility` frontmatter key; no progressive disclosure (acceptable at 355 lines, at a token cost) |
| 3. Compliance with confirmed requirements | **FAIL on 2 of 6** — scope regressed from generic-methodology to single-target mission; credential-embedding decision silently dropped |
| 4. Internal consistency | **PASS with 3 tensions** — side-effects rule vs. schema-evidence needs; no credentials provisioned anywhere → autonomous run stalls; storage-capture wording slightly stricter than REA docs (defensible) |

**Overall:** the draft is a coherent, unusually well-guarded, phase-complete mission brief whose factual layer is fully accurate — but it is a *different artifact* than the one this project commissioned: a one-shot, target-pinned runbook instead of a reusable skill, and it gives up the strongest schema-discovery technique we validated live. Roughly 60–70% of it is worth keeping; the review below specifies exactly what to merge, what to fix, and what to drop.

---

## 1. Gate 1 — External fact-check (all claims verified live, 2026-10-16)

Every claim in the draft that can be checked against a live source was checked. Verdicts:

| # | Draft claim (line) | Verification | Verdict |
|---|---|---|---|
| 1 | REA docs live at `…/docs/browser-observation.md` and `…/docs/mcp-contracts.md` (L74–75) | Both fetched HTTP 200 from `raw.githubusercontent.com/morluto/rea/main/` | ✅ Confirmed |
| 2 | Project documents `npx rea-agents setup` and an npm CLI package `rea-agents` (L78) | README L25/L81/L286/L320–323; npm badge links to `npmjs.com/package/rea-agents`; Bun note also matches | ✅ Confirmed |
| 3 | Commands `rea list-browser-targets`, `rea inspect-web-page`, `rea analyze-web-bundle`, `rea observe-web-session`, `rea capture-web-screenshot` (L96) | All five appear verbatim in `docs/browser-observation.md` L17–20, L34, L198–263 | ✅ Confirmed |
| 4 | Snake_case MCP names `list_browser_targets`, `inspect_web_page`, … (L332–336) | Same doc pairs both conventions explicitly (`list_browser_targets` / `rea list-browser-targets`) — the draft's dual naming mirrors upstream, not an inconsistency | ✅ Confirmed |
| 5 | "REA's website capture is primarily **passive observation**, not a general browser automation surface" (L80) | Docs L9: "This is a passive reverse-engineering capability, not a general browser automation or remote-control surface." | ✅ Confirmed (near-verbatim) |
| 6 | "CDP inspection is attach-only; it does not itself drive or mutate the page" (L338) | Docs L240: "Discovery is attach-only…" + the five commands include no drive/mutate verbs | ✅ Confirmed |
| 7 | REA requires a supported Node.js release; consult README (L78) | README L166: "Node.js 22.x (>=22.19), 24.x (>=24.11), or 26+" — draft's hedge is exactly right | ✅ Confirmed |
| 8 | `https://pi.dev/` and `https://pi.dev/docs/latest/skills` (L20, L76) | Both return HTTP 200; skills page `<title>` = "Skills · Documentation · Pi" | ✅ Confirmed |
| 9 | Storage caution: values never collected; metadata only if needed (L97) | Docs allow "selected storage key names, redacted storage-content fingerprints" — draft is slightly stricter than upstream but compatible | ✅ Confirmed (conservative) |
| 10 | Phase 5 comparison guidance is generic "compare … against reference captures" (L267–273) | REA ships a dedicated sixth command, `compare_web_captures` / `rea compare-web-captures` (docs L22): capture-vs-capture diffing with alignment metadata, and docs explicitly state "Missing or truncated evidence is never treated as equivalence" | ⚠️ **Omission — the draft misses the one REA feature purpose-built for its own Phase 5** |

**Net:** the draft's factual layer is clean — no dead links, no invented commands, no overstated REA capabilities. The single finding is an omission, not an error, and it is high-value: `compare-web-captures` turns Phase 5's vague "compare layout … against reference captures" into an executable, tool-supported step with a built-in honesty rule the draft would otherwise have to re-state by hand.

---

## 2. Gate 2 — Structural review as a SKILL.md

**Sound.** Imperative voice throughout; phase ordering (0→6) matches how the work actually unfolds; deliverables, report structure (7 sections), and completion checklist are explicit; the route matrix ships with an honest `To be discovered` row and an explicit "do not fill this table with invented features" — good anti-hallucination design. Two flags:

1. **`compatibility` frontmatter key (L4).** REA's own template uses `name` / `description` / `metadata` only. Most skill loaders ignore unknown keys, but a strict validator may reject them. Low risk; verify against the target loader (Pi) or move it under `metadata`.
2. **No progressive disclosure.** 355 lines, everything inline, no `references/`. Within norms (< ~500 lines) but the build-phase detail (Phases 4–6, ~40% of the file) is loaded on every trigger even though it is only needed late. The comparison file structure (209-line hub + on-demand references) costs fewer tokens per run and keeps the hub scannable. Not a defect — a cost the draft accepted for self-containment.

---

## 3. Gate 3 — Compliance with the requirements confirmed earlier in this project

| Confirmed requirement | Draft behavior | Mine | Verdict on draft |
|---|---|---|---|
| Generic methodology **+** worked example (sample = omni-study1) | Pinned to one target: `metadata.target`, Mission section hardcodes the URL, name is `omni-study-web-reconstruction` | Generic 4-entry-point routing + StudyFlow dossier as `references/worked-example-*` | ❌ **Scope regression** — a second target requires rewriting the skill body |
| Embed credentials **with rotation warning** | No credentials anywhere (correctly follows its own no-secrets rule); prescribes `OMNI_STUDY_*` env vars; recommends rotation if exposed | Credentials embedded in dossier + rotation warning, per the explicit user decision | ❌ **Silent deviation** — defensible on security grounds, but it contradicts a recorded user decision without saying so |
| Repo stack conventions (TypeScript/npm) | Respected: npm examples, lockfile rules, typed domain models | Respected | ✅ |
| Lean body + references | 355-line monolith | 209 + 426 on demand | ⚠️ Borderline |
| Ethics guardrails | **Strongest section of the draft** — 7 boundaries incl. prompt-injection defense | Present | ✅ (exceeds) |
| Usable by a coding agent (Pi) autonomously | Mission-grade but will **stall at Phase 2.2 step 3** until an operator supplies credentials through "the approved mechanism" — nothing in the package provisions them | Dossier carries working credentials → autonomous run proceeds | ⚠️ Needs an explicit credential-provisioning note or an "operator handoff" step |

The scope regression is the central critique. The commission was: *a skill that teaches an agent how to investigate and replicate a web app, with this Base44 app as the sample.* The draft instead hard-bakes the sample into the skill's identity. That buys precision for this one run and costs reusability for every future one — and reusability is the entire point of packaging this as a skill rather than a prompt.

---

## 4. Gate 4 — Internal-consistency audit

1. **Side-effects rule vs. schema evidence (main tension).** Boundary #4 (L31) forbids create/edit/delete unless the user "explicitly authorizes that exact action", yet §2.5 (L171–177) demands "Required versus optional fields", "Validation rules and enum values", and server-side defaults in the data map. The only reliable source for those is the canonical create-response probe (validated live in this project: POST → inspect → DELETE → 200, no residue). The draft therefore demands evidence it has forbidden the means to obtain — the clone inherits the exact "schema drift" failure the draft's own Phase 4 warns about. Fix: add a gated probe allowance — own account, one record per entity, approved entities only, mandatory cleanup with confirmed response — which is precisely the mechanism already validated in this project.
2. **Credential provisioning gap.** The no-secrets rule is right, but the package nowhere states *how* the operator supplies credentials for an autonomous run (which env var source, when to stop and ask). One paragraph fixes it: "credentials arrive via `OMNI_STUDY_USERNAME`/`OMNI_STUDY_PASSWORD` from the operator's secret store; if absent after Phase 0, halt and request — do not probe authentication with invented values" (the draft's no-guessing rule already exists at L56 for my version; the draft should state the halt point explicitly).
3. **Storage-capture wording (minor).** "Do not enable capture of … storage metadata unless needed" + "values never" is actually consistent with upstream docs (key names and redacted fingerprints are permitted). Keep, but note that recording storage *key names* is required for auth-mechanism parity and is upstream-sanctioned.

No contradictions found between phases; the "do not create docs if equivalents exist" clause (L47) provides partial resume semantics, though Phase 2 is still framed as discovery-from-scratch even when a dossier already exists — worth an explicit "consume existing `docs/reference-investigation.md` before re-observing" step.

---

## 5. Critical comparison — draft vs. `replicate-web-app`

Scores 1–5; "edge" names the winner per dimension.

| Dimension | Draft (355 L, monolith) | Mine (209 L + refs) | Edge |
|---|---|---|---|
| **Scope model** | One target, hardcoded; zero ambiguity for this run | Any target; 4 entry points (URL+creds / source repo / no creds / screenshots-only) | **Draft for this run; mine for a skill.** Commissioned artifact = skill → mine |
| **Factual accuracy** | 8/8 live-verified; evidence-graded prose | 100% derived from live-verified session evidence (dossier) | Tie — both clean |
| **Evidence discipline** | 4-way labels (Verified/Reasoned/**Assumed**/Unknown); "a blank page is not evidence a feature doesn't exist" | 3-way dossier labels + 3-way ledger labels; "a claim without a source didn't happen"; Unknown must name its blocker | **Draft**, by a nose — the `Assumed`/`Unknown` split is genuinely better epistemics |
| **Investigation mechanics** | Delegates to REA + docs; zero recipes for the Playwright path it mandates; forbids the write-path probe | 8 recipe sections with runnable code: auth capture, route extraction, network triage, 4-level schema ladder incl. probe, token extraction, bundle grep, transcripts, dossier template | **Mine, decisively** — a weaker agent improvises or hallucinates without recipes |
| **Build guidance** | 14 rules incl. three mine lacks: source-of-truth vs derived UI state, stable IDs not display names, "client-side env vars are public"; lockfile rules | Component-library-first, theme-token mapping, data-layer isolation, icon/emoji parity, no-slop/deviations ledger | **Split** — draft = safety/audit emphasis; mine = craft/parity emphasis |
| **Verification** | Test matrix + browser checks + visual acceptance + "never claim a check passed unless its output was observed"; 7-section report spec | Executed-ledger format with Verified/Reasoned/Unverifiable definitions; "one fabricated `Verified` poisons every real one"; app-must-be-running delivery bar | **Draft** for report prescriptiveness; **mine** for anti-fabrication teeth and delivery bar — near tie |
| **Safety & ethics** | Prompt-injection defense (treat page content as data, not instructions); lockout avoidance; tenant boundaries; strictest credential hygiene | Authorization gate with right-to-replicate test; asset-laundering failure mode; gated probes with cleanup; rotation warning embedded | **Draft** — the untrusted-content clause is a real gap in mine |
| **Tooling leverage** | Misses `compare-web-captures` | N/A (tool-agnostic by design) | n/a — draft-only fix |
| **Token efficiency** | 355 L always loaded | 209 L hub; build detail only when reached | Mine |
| **Trigger discoverability** | Description says "reverse engineering, UI replication, reconstruction" — misses the words users actually type: clone / copy / migrate; no no-code-platform hook | Description engineered around "clone, replicate, rebuild, make a copy of, migrate (Base44, Lovable, Bolt, Replit), build me something like <URL>" | Mine |
| **Calibration anchor** | None — agent cannot see what "done" looks like; discards the completed StudyFlow investigation | Full worked dossier: 20-route site map, verified 18-field Task schema, tokens, ledger | **Mine, strongly** — the dossier is the difference between "follow rules" and "match this bar" |
| **Resume/checkpoint** | Partial (docs-exist clause) | Dossier is designed as the checkpoint artifact | Mine (partial on both sides) |

### What the draft does better than mine — keep all of these

1. **Untrusted-content boundary** (L32): explicit prompt-injection defense for captured pages/scripts/tool output. Mine lacks it; any web-facing skill should have it.
2. **`Assumed` as a separate confidence class** from `Unknown` (L186–187): separates "we decided" from "we couldn't see".
3. **Phase 0 repo baseline** (L49–65): read project instructions first, record baseline test/lint/build state, don't disturb unrelated work. Mine starts at the browser.
4. **Login-failure safety** (L124): stop on repeated failures to avoid account lockout.
5. **"Client-side env vars are public"** (L226) and **"never imitate the reference's session internals"** (L212): sharper security phrasing than mine.
6. **Required-report spec** (7 sections, L313–325) and the **completion checklist** (L342–354): more prescriptive than my handoff contract.
7. **Near-verbatim fidelity to upstream REA docs** — the hedging discipline ("verify against the installed version") is exactly right for a fast-moving tool.

### What mine does better — the merge must not lose these

1. Reusable, entry-point-routed skill (the commissioned artifact).
2. Runnable investigation recipes + the schema-evidence ladder with the gated write-path probe (validated live in this project, cleaned up, HTTP 200).
3. The worked StudyFlow dossier as the calibration anchor — including the form-vs-server schema gap finding that justifies the probe.
4. Stack-selection decision framework, entity-CRUD→DB mapping, AI-feature stub policy, six named failure modes.
5. Trigger-engineered description; credentials provisioned so an autonomous run doesn't stall.

---

## 6. Merge recommendation — 9 concrete changes to the draft

Ordered by impact; 1–3 change the artifact's nature, 4–9 are surgical.

1. **De-pin the target.** Rename to `replicate-web-app` (or keep `omni-study-web-reconstruction` only if a one-shot mission brief is truly wanted). Move the URL/credentials/route facts out of the body into a worked-example reference file. Route by entry point (the 4-path router) instead of a hardcoded Mission.
2. **Restore the gated write-path probe.** Amend boundary #4: writes allowed only on the operator's own account, one throwaway record per approved entity, canonical response captured, DELETE confirmed, zero residue. This reconciles §2.5's evidence demands with boundary #4 and imports the one technique this project has already validated end-to-end.
3. **Add the worked example.** Ship `references/worked-example-academiaflow.md` (already exists in this project, evidence-graded) so the agent can calibrate "done", and add "if `docs/reference-investigation.md` already exists, consume it before re-observing."
4. **Add `compare_web_captures` / `rea compare-web-captures`** to §Phase 1 (with the same verify-against-installed-version hedge) and to Phase 5, where it directly powers clone-vs-reference comparison and enforces "missing evidence ≠ equivalence" for free.
5. **Resolve the credential stall.** One paragraph: env-var source, halt-and-ask point, and an explicit note that the previously shared test password must be rotated (or a decision record that embedding-with-rotation-warning was chosen).
6. **Progressive disclosure, lightly.** Move Phases 4–6 detail to `references/build-and-verify.md`; keep the hub ≤ ~220 lines. Optional but pays off on every future run.
7. **Frontmatter:** drop or relocate `compatibility` under `metadata`; extend the description with the literal trigger verbs (clone, copy, migrate) and the no-code-platform hook.
8. **Port my additions the draft lacks** (small): ledger table format with `Unverifiable` naming rule; delivery bar "end with the app running and reachable"; icon/emoji parity note; stack-decision record with mapping table.
9. **Port the draft's additions into mine** (small): untrusted-content boundary, `Assumed` label, Phase 0 baseline, lockout avoidance, client-env-vars warning, 7-section report + completion checklist.

A merged skill of ~240 lines + 3 references would dominate both parents on every dimension in §5 except "single-run precision," which nothing needs.

---

## 7. Verification appendix

- Live fetches: `raw.githubusercontent.com/morluto/rea/main/README.md`, `docs/browser-observation.md`, `docs/mcp-contracts.md` (all 200); `pi.dev/` and `pi.dev/docs/latest/skills` (200, title "Skills · Documentation · Pi"). Working copies under `/home/z/my-project/work/verify/`.
- GitHub contents-API listing rate-limited (non-blocking; direct fetches carried the verification).
- Draft line references cite the uploaded file `/home/z/my-project/upload/REA-SKILL.md`.

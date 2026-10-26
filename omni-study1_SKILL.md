---
name: omni-study1
description: >
  Comprehensive engineering skill distilled from the StudyFlow (Omni-Study)
  codebase — a production-grade Next.js 16 clone (functional superset, measured
  visual parity) of a hosted study-planner SPA. Covers the design-token pins
  that keep Tailwind v4 visually identical to the v3 reference, the
  three-anchor SQLite DATABASE_URL contract, the one-page SPA + rewrites
  routing model, the CRUD factory, auth, and the two-layer testing strategy.
  Use this to extend, debug, onboard, or replicate the architecture without
  re-deriving two sessions of hard-won knowledge.
version: 2.1.0
tags:
  - nextjs16
  - react19
  - tailwindv4
  - prisma
  - sqlite
  - visual-parity
  - spa
  - testing
---

# StudyFlow (Omni-Study) — Engineering SKILL

> **What this is:** the single-source-of-truth reference for working in
> `nordeim/omni-study1`. Every fact below is verified against the codebase
> (1133 tests green, re-verified at the 2.0 update: 834 Vitest unit + 299
> Playwright e2e incl. 1 setup — the full suite re-run in six chunks after the
> parity re-application + account-flow completion + regression hardening).
> Sections marked with ⚠️ encode non-obvious contracts — violating them has
> historically produced silent visual or data-path bugs.

---

## §1 Project Identity & Design Philosophy

**One sentence:** StudyFlow is a self-hosted study-companion web app — a
production-ready clone of `omni-study1.base44.app` that is a **functional
superset** (every view really works: CRUD persistence, AI features, themes)
while maintaining **measured visual parity** with the reference.

**Design thesis:** *parity is measured, not guessed.* Computed styles from the
live reference (a Tailwind v3 app) are ground truth; screenshots and VLM
reviews are secondary signals. Every visual fix lands with an e2e
computed-style pin where feasible.

**Non-negotiable rules:**
1. The 20 view paths are **rewrites onto one page** — never create per-view
   route folders (`/Dashboard` … `/Settings` all serve `src/app/page.tsx`).
2. The v3-pinned palette, `--shadow-sm`, and the radius contract in
   `globals.css` must not be removed or "modernized" — parity e2e specs fail
   if you do (and the reference drifts).
3. `z-ai-web-dev-sdk` is imported **only** inside API route files
   (`src/app/api/{ai,math}/**`) — never in client components.
4. Every API payload passes its Zod schema (`src/lib/validation.ts`); every
   Prisma query is scoped `where: { userId }`.
5. Layout uses `flex gap-*` exclusively — margin utilities inside
   `space-y/x-*` containers are banned (Tailwind v4 trap 4).
6. **Superset, not clone-of-quirks:** where the reference is broken or empty
   (unlabeled hamburger, empty states), the clone keeps the visual layout but
   ships the working/a11y-correct behavior.

**Anti-generic mandate:** no component-library defaults that drift from the
measured tokens (no `shadow-md` cards, no `rounded-3xl` surfaces, no oklch
palette drift). Accent colors always route through the `--sf-*` RGB-triplet
vars — never hardcode violet hexes in view code.

---

## §2 Tech Stack & Environment

| Layer | Technology | Version | Critical note |
|---|---|---|---|
| Framework | `next` | ^16.1.1 (16.4.0 installed) | App Router; `output: "standalone"`; Turbopack dev |
| UI runtime | `react` / `react-dom` | ^19.0.0 | Client view switching inside one page |
| Language | `typescript` | ^5 | `strict: true`; `tsc --noEmit` is a gate |
| Styling | `tailwindcss` + `@tailwindcss/postcss` | ^4 | **CSS-first** — no `tailwind.config.js`; tokens in `globals.css` `@theme` |
| Animation | `tw-animate-css` + `tailwindcss-animate` | ^1.3.5 / ^1.0.7 | Radix enter/exit transitions |
| Primitives | `@radix-ui/*` (16 pkgs) | current | shadcn-style wrappers in `src/components/ui/*` |
| Icons | `lucide-react` | ^0.525.0 | Nav icons `strokeWidth={2}`; view icons 1.75 |
| State | `zustand` | ^5.0.6 | 3 stores; URL is routing truth |
| Validation | `zod` | ^4.6.5 | v4 counts **code points** in `.max()` (UTF-16 trap) |
| ORM | `prisma` / `@prisma/client` | ^6.11.1 (6.19.3 installed) | SQLite provider; see ⚠️ §3 db contract |
| AI | `z-ai-web-dev-sdk` | ^0.0.18 | Server-only; `createVision` for photographed math |
| Unit tests | `vitest` | ^5.0.1 | Node env, `@` alias, `*.test.ts` only |
| E2E | `@playwright/test` | ^1.63.0 | Runs the **standalone build** on :3100 |
| Runtime | Bun | ≥ 1.3 | `bun run dev/build/test`; `bunx` for one-offs |

Dev-only conveniences that must never leak to prod assumptions:
`allowedDevOrigins: ["127.0.0.1", "localhost"]` (dev-chunk access) and the
Next dev-tools floating button (absent from the production build).

---

## §3 Bootstrapping & Configuration

```bash
git clone https://github.com/nordeim/omni-study.git
cd omni-study
bun install
bun run db:push && bun run db:seed   # creates <repo>/db/custom.db + demo data
cp .env.example .env                 # defaults already correct
bun run dev                          # http://localhost:3000
# demo@studyflow.app / Demo1234!
```

**⚠️ The DATABASE_URL contract (the most fragile invariant in the repo).**
`DATABASE_URL="file:../db/custom.db"` — the db lives at `<repo>/db/custom.db`.
Three tools resolve that relative URL differently (all verified empirically):

| Consumer | Anchor | Correct? |
|---|---|---|
| Runtime (`next dev/build/start`) via `src/lib/db-path.ts` | first anchor dir containing `prisma/schema.prisma` | ✅ |
| Prisma CLI with **shell-provided** env var (the `db:*` scripts) | the schema file | ✅ |
| Prisma CLI with `.env`-loaded var | **the CWD** (one dir too high) | ❌ foot-gun |

Never call raw `prisma db push` relying on repo-root `.env` auto-loading —
use `bun run db:push` / `db:seed` (they inline the env var). Additionally,
Next dev (Turbopack) **pre-resolves** relative `file:` URLs against the
project dir; `db-path.ts` detects the wrong-but-absolute result (target
missing + schema-anchored default exists) and corrects it. All pinned by
`tests/db-path.test.ts` (16 tests) — update them in the same commit if you
touch resolution.

**Config files that matter:**
- `next.config.ts` — `output: "standalone"`, `outputFileTracingRoot` pinned,
  `allowedDevOrigins`, and the **20 path rewrites** (`/Dashboard` … `/Settings`
  → `/`).
- `tsconfig.json` — strict, `@/*` → `src/*`.
- `eslint.config.mjs` — flat config, next core-web-vitals; lint is a gate.
- `vitest.config.ts` — node env, `@` alias, `include: tests/**/*.test.ts`
  (never picks up e2e specs).
- `playwright.config.ts` — 2 projects (auth setup + chromium), `workers: 1`,
  `fullyParallel: false`, webServer boots `.next/standalone` on :3100 with
  `DATABASE_URL=file:../db/e2e.db`, storageState shared.
- `postcss.config.mjs` — `@tailwindcss/postcss` only.

**Env vars:** `DATABASE_URL` (required, above), `AUTH_SECRET` (HMAC key for
session cookies; required in prod — dev fallback exists), `NEXT_PUBLIC_SITE_URL`
(metadata origin, optional — resolved by `src/lib/site.ts`, consumed by
`sitemap.ts`/`robots.ts`/`layout.tsx`'s `metadataBase`; default
`http://localhost:3000`; unit-pinned by `tests/site.test.ts`).

---

## §4 The Design System (Code-First)

All tokens live in `src/app/globals.css`. **Verification rule:** every value
below was measured on the live reference via computed styles — a single wrong
value is a parity bug.

**Accent tokens (RGB triplets, the reference's own convention):** applied to
`:root` by `src/lib/theme.ts` (`useThemeStore.loadFromUser`), default Violet:

| Token | Violet value | Usage |
|---|---|---|
| `--sf-primary` | `139 92 246` (#8b5cf6) | Buttons, active nav, chips |
| `--sf-primary-strong` | `124 58 237` (#7c3aed) | "View All" links, active nav text, clock date |
| `--sf-primary-deep` | `109 40 217` (#6d28d9) | Clock time text (reference violet-700) |
| `--sf-primary-soft` | `243 232 255` | Icon chips, active tint layering |
| `--sf-primary-softest` | `245 243 255` | Clock chip gradient start (violet-50) |
| `--sf-primary-softest-adjacent` | `238 242 255` | Clock chip gradient END — the reference's exact indigo-50 (a hue rotation, not a white mix) |
| `--sf-primary-foreground` | `255 255 255` | Text on primary |
| `--sf-primary-*-dark` | (per accent) | Dark-mode counterparts |

Seven accents × 4 core stops each: violet / blue / green / orange / pink /
red / teal — full table in `src/lib/theme.ts` `ACCENT_TOKENS` (v3-pinned
hexes; adding an accent = one object literal + one `ACCENTS` entry).

**⚠️ The ten documented Tailwind v3→v4 traps (all live here):**
1. `@theme inline` vars must be **full `hsl()` colors** — bare triplets
   silently resolve to transparent.
2. The v3-era palette (slate 50–950, violet 100–900) is **pinned** in
   `@theme` — v4's oklch defaults drift 1–3 units/channel.
3. `--shadow-sm` is **pinned** to v3's `0 1px 2px 0 rgb(0 0 0 / 0.05)` —
   v4 shifted the whole shadow scale one notch.
4. Never mix `mt-*`/`mb-*` children inside `space-y/x-*` (v4's `:where()`
   rewrite). Codebase convention: `flex gap-*` only.
5. sRGB-exact gradients use inline-style `linear-gradient(...)` (v4
   interpolates utility gradients in oklab) — e.g. `.sf-canvas`, stat chips.
6. **The radius scale did NOT shift in v4** (md 6px / lg 8px / xl 12px /
   2xl 16px / 3xl 24px are v3-identical; only `rounded-sm` changed meaning —
   v3's 2px became v4's `rounded-xs`). `globals.css` pins ONLY
   `--radius-sm: 0.125rem` for v3 semantics. A one-notch-up pin block
   previously inflated every corner ~33% (cards 20px vs reference 16px,
   buttons 8px vs 6px) — fixed in session 2, pinned by the e2e
   "corner radii" spec.
7. **Opacity utilities serialize as oklab** in Chromium computed styles
   (`bg-black/20` → `oklab(0 0 0 / 0.2)`, NOT `rgba(0,0,0,0.2)` — same
   rendered color). E2E pins must accept both serializations.
8. **`pt-*` after `p-*` REPLACES the shorthand's top** — `p-4 pt-16` is
   64px of top padding, not 80. The mobile offset models the reference's
   measured y=80 as a single `pt-20`; always assert the OBSERVABLE
   position (heading y-coordinate), never the internal padding split.
9. **The BLUR scale shifted one notch** (session 4): v4 inserted
   `blur-xs` (4px) at the bottom of the scale — v3's `backdrop-blur-sm`
   (4px) is v4's `backdrop-blur-xs`, and v4's `backdrop-blur-sm` computes
   8px. Same family as the radius trap. The drawer backdrop and the login
   card use `backdrop-blur-xs` (e2e-pinned at `blur(4px)`).
10. **Colors serialize as their LEGACY forms** (session 5): modern
   `rgb(0 0 0 / 0.1)` box-shadow syntax reads back as `rgba(0, 0, 0, 0.1)`,
   and any UNPINNED palette class reads back as `lab(...)` —
   `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` before cyan-400 got
   pinned to `#22d3ee`. Pin every asserted color; write e2e expectations in
   the serialized form.

**Typography:** system sans stack (ui-sans-serif → Apple Color Emoji …);
page greeting `text-3xl font-bold`; view titles `h1 text-2xl font-bold
text-slate-800` with a 24px accent icon (16 views; MyDay/FocusTimer are
`text-3xl` 30px; Tasks/Calendar have no icon) + 16px subtitle with the
reference's exact per-view wording (S4-D); section titles `h2 text-lg
font-semibold` + `h-5 w-5` accent icon; stat values `h3 text-3xl font-bold`
(30px/36px, tracking normal — NOT leading-none/tracking-tight); empty-state
titles `h3 text-xl` (20px); nav labels 16px with `w-5` icons; body `text-sm`.

**Surface geometry (measured):** cards white, `1px solid #f1f5f9`
(slate-100), radius **16px** (`rounded-2xl` v3 semantics / `.sf-card`
`border-radius: 1rem`), v3 `shadow-sm`, `p-6`; buttons radius **6px**
(`rounded-md`); nav items `rounded-xl` → **12px**; login card ~16-20px.

**Canvas:** `.sf-canvas` =
`linear-gradient(to right bottom, hsl(210 40% 98%), hsl(0 0% 100%), rgb(245 243 255 / 0.3))`
— the third stop is violet-50 written in exact sRGB (an `hsl()` approximation
drifted it 4 units/channel). Dark variant swaps to a slate-950 family ramp.

**Custom classes:** `.glass` (sidebar `rgba(255,255,255,0.8)` + blur),
`.sf-card`, `.sf-focus` (accent focus ring), `.sf-scroll` (thin scrollbars),
`.sf-skeleton` + 2 keyframes (`sf-shimmer`, `sf-slide-in`), `.sf-gradient` +
`.sf-gradient-shadow` / `-lg` (the session-5 gradient CTA surfaces — sRGB-exact
stops through `--sf-primary` → `--sf-primary-gradient-to`, hover via
`--sf-primary-gradient-to-strong`), `.sf-calc-display` (the calculator's
softest-token gradient).

**Interactive chrome (session-5, measured):** primary CTAs are GRADIENT
buttons (`Button variant="gradient"`), never solid violet — the reference's
Add Task / New Event / Create … buttons all render
`linear-gradient(to right, rgb(139,92,246), rgb(79,70,229))` + the v3
`shadow`; empty-state CTAs add the accent-tinted shadow-lg (0.25). The
reference's own gradient-button text renders YELLOW (a pixel-verified
Base44 platform bug — 180 yellow vs 21 white glyph pixels) — the clone keeps
white. Form controls run the GRAY ramp (gray-200 borders, gray-950 text,
gray-400 placeholders, h-9 transparent inputs); dialogs are
`max-w-md` + `rounded-lg`. The Events view is a DARK slate-900 terminal
panel (intentionally, in both themes) with a `CW <n>` calendar-week label
(`isoWeekNumber`) and a cyan-400 New Event link.

---

## §5 Component Architecture & Patterns

**The one-page SPA model:** `src/app/page.tsx` is the entire app —
auth gate → app shell → view switcher. `next.config.ts` rewrites the 20
PascalCase paths onto `/`; the client store syncs `view` state with
`location.pathname`; `src/lib/router.ts` is the single view↔path map
(unit-tested). A dedicated `/login` route exists because the reference
redirects unauthenticated users there.

**Layers (trace any import):**
```
app/page.tsx (client shell)
  └─ components/layout/{sidebar,nav-items,mobile-chrome,user-avatar}.tsx  chrome
  └─ components/views/*-view.tsx (20) + shared.tsx               screens
       └─ components/ui/* (shadcn-style on Radix)                primitives
            └─ lib/{store,data,theme,router,date}.ts             client state
app/api/**/route.ts (server)
  └─ lib/server/{http,entities}.ts  → lib/{db,auth,validation}.ts server core
lib/{calculator,theme,router,date,auth,validation,db-path}.ts    pure seams (unit-tested)
```

**Client/Server decision tree:** everything interactive is `"use client"`
(top of file); server code appears only in route handlers + the two pages'
server shells. Server-only imports (`z-ai-web-dev-dev-sdk`, `node:crypto`,
`node:fs`) never appear in `components/` or client-reachable `lib/` modules.

**Chrome anatomy (measured):** sidebar `fixed left-0 w-[260px] hidden
lg:flex` + `.glass`; `main` offsets `lg:ml-[260px] p-4 pt-20 lg:p-8 lg:pt-8`;
below `lg` a FIXED `h-16` `.glass` app bar (hamburger + 32px gradient brand
chip + "StudyFlow" + live clock "03:43 AM" on the right — never the view
title) — `pt-20` models the reference's measured 64px bar + 16px breathing
room (first heading y=80 on BOTH apps). The slide-in drawer is a `w-72`
(288px) white panel over a `bg-black/20 backdrop-blur-xs` backdrop with
`shadow-2xl`, a `p-6` brand header (40px gradient chip), nav items from the
SHARED `nav-items.tsx` (`NavItemLink`: icon + label + trailing dot,
px-4 py-3 rounded-xl, active gradient tint), Esc/backdrop close, and NO
footer (reference-exact). Active nav item = gradient tint
`rgb(var(--sf-primary)/0.1) → rgb(var(--sf-primary-strong)/0.1)`
+ violet-600 text + trailing dot — ONE markup source for sidebar AND drawer.
Sidebar collapse toggles `w-[76px]` with a `ChevronLeft`/`ChevronRight`
glyph (reference-measured).

**The footer avatar (`UserAvatar`):** 36px gradient circle
(`primary → primary-strong`), white **initial** (first latin letter of
`userName || email`) when `avatar` is empty, emoji when set — the reference's
default state. One component, two sizes (`sm` 36px, `lg` 56px tile).

---

## §6 State Management Deep Dive (Zustand — the "hooks" of this app)

**`useAppStore`** (`src/lib/store.ts`) — SPA routing + chrome:
`view`, `navigate(view)` (pushes the PascalCase path via `history.pushState`),
`sidebarCollapsed`, `mobileMenuOpen`, `setMobileMenu`. Navigation inside the
SPA is `navigate(id)` — never bare `<Link>` clicks (sidebar links
`preventDefault` + navigate).

**`useThemeStore`** — mode/accent/avatar/userName/email, persisted to the
`User` record via `PATCH /api/settings/preferences`; `loadFromUser(user)`
hydrates once post-auth and calls `applyToDocument` which stamps the
`--sf-*` triplet vars **inline on `<html>`** (the e2e hydration gate keys
off this — see §10). `avatar: ""` = initial-letter default (R3 contract).

**`useDataStore`** (`src/lib/data.ts`) — per-entity client cache
(`subjects`, `tasks`, `exams`, …) with `loadAll()` on login and a typed
`mutations` object (`createTask`, `toggleTask`, `updateExam`, …) that
performs the API call **and refreshes the touched collections**. Views read
snapshots, never fetch ad-hoc. Adding an entity = Prisma model + delegate +
validation schema + `data.ts` slice + `mutations` entry.

**Store rules:** no React Context for app state; selectors
(`useAppStore((s) => s.view)`) not whole-store subscribes; stores are the
only mutation path (no direct `fetch` in views).

---

## §7 Data Layer: Prisma Models, CRUD Factory & Seed

**24 models** (`prisma/schema.prisma`): User, VerificationToken, PasswordResetToken (the S15 one-shot pair — ADR-013), Subject, TaskList, Task,
Assignment, Exam, Event, TimetableClass, Notebook, Note, FlashcardDeck,
Flashcard, PracticeTest, StudyGroup, Grade, FocusSession, FileFolder,
FileItem, AiChatMessage, CalculatorHistoryEntry, Holiday, RumEvent (S18 —
ADR-016). All entity rows
carry `userId` + timestamps; ownership is enforced in every query — except
`Flashcard`, which is scoped through its deck (no userId column; the S7
nesting). 22 of the 23 non-User models carry direct `userId` `onDelete:
Cascade` relations (the count behind the "all 22 user relations" claims —
correct as written).

**The CRUD factory** (`src/lib/server/entities.ts`, 621 lines): one
`EntityDelegate` config per entity (model name, Zod create/update schemas,
default order, optional handler maps) consumed by
`makeCollectionRoutes`/`makeItemRoutes` (`src/lib/server/http.ts`). Route
files are 3-line shells:

```ts
// src/app/api/tasks/route.ts — the whole file
import { makeCollectionRoutes } from "@/lib/server/http";
import { tasksDelegate } from "@/lib/server/entities";
export const { GET, POST } = makeCollectionRoutes(tasksDelegate);
// src/app/api/tasks/[id]/route.ts — same, but makeItemRoutes → { PATCH, DELETE }
```

The factory provides: `requireUser()` auth → Zod parse → `where: { userId }`
→ Prisma call → `{ error }` JSON on failure (never stack traces). Special
routes outside the factory: `auth/*`, `files/*` (multipart ≤ 2 MiB base64),
`settings/preferences`, `calculator/history`, `ai/chat`, `ai/messages`,
`math/solve`, `health`.

**Seed** (`prisma/seed.ts`): idempotent (early-returns when the demo user
exists — ⚠️ changing seed VALUES requires deleting `db/e2e.db`, see §10);
demo user `demo@studyflow.app` / `Demo1234!` with subjects, tasks, exams,
notes, decks, grades; `avatarEmoji: ""` (reference default state).

**AI ingestion:** `/api/ai/chat` (6 study-mode system prompts) and
`/api/math/solve` (text via chat completions; images via
`createVision` with `model: "glm-4.5v"`) — both persist history
(`AiChatMessage`) and never expose the SDK to the client.

---

## §8 Accessibility Implementation

- **Focus:** `.sf-focus` applies `outline: 2px solid rgb(var(--sf-primary))`
  + 2px offset on `:focus-visible` — accent-aware, consistent.
- **Labels:** every icon-only button carries `aria-label` ("Open navigation
  menu", "Close menu", "Collapse sidebar", "Delete task", …). The reference's
  hamburger is unlabeled — the clone intentionally fixes this (superset
  rule §1.6).
- **Nav semantics:** `<nav aria-label="Primary">`, active link
  `aria-current="page"` (pinned by e2e).
- **Radix patterns:** tabs expose `role=tablist/tab/tabpanel` (assert
  `aria-selected`, NOT `data-state="selected"`); dialogs `role=dialog` with
  labelled triggers; selects/checkboxes/switches via the Radix wrappers.
- **Drawer:** Esc key + backdrop click close (spec'd in
  `tests/e2e/mobile-navigation.spec.ts`).
- **Emoji avatar picker:** `aria-pressed` per option + descriptive labels.
- **Reduced motion (resolved session-12, ADR-010):** the global
  `@media (prefers-reduced-motion: reduce)` collapse block stills the
  shimmer/slide keyframes and transitions — a superset the reference lacks
  (pinned by `tests/e2e/accessibility.spec.ts`).

---

## §9 Anti-Patterns & Common Bugs (historical, all fixed + pinned)

| # | Severity | Symptom | Root cause | Fix + pin |
|---|---|---|---|---|
| AP-1 | CRITICAL | db created one directory too high | `.env`-loaded `file:` URLs anchor at CWD in Prisma CLI | `db:*` scripts set env inline; `tests/db-path.test.ts` (16 tests) |
| AP-2 | CRITICAL | e2e hits the dev db / wrong client | hardcoded schema url embeds in the generated client | schema uses `env("DATABASE_URL")`; shell-env anchoring |
| AP-3 | HIGH | Every corner ~33% too large vs reference | one-notch-up radius pin block (v4 "shadow trap" wrongly applied to radii) | only `--radius-sm: 0.125rem` pinned; e2e "corner radii" spec (session-2 R1) |
| AP-4 | HIGH | Login button silently no-ops in e2e (order-dependent flake) | click lands pre-hydration (SSR buttons lack handlers) | `hydrated(page)` gate on inline `--sf-primary` var (session-2 R8) |
| AP-5 | MEDIUM | Canvas third stop 4 units/channel off | `hsl(252 100% 96.5%)` approximated violet-50 | exact `rgb(245 243 255 / 0.3)` + e2e pin |
| AP-6 | MEDIUM | Two `=` keys on the calculator | duplicate entry in `BASIC_KEYS` | removed; e2e keypad spec |
| AP-7 | MEDIUM | Wrong db in e2e after seed change | seed early-returns when demo user exists → stale `db/e2e.db` | delete `db/e2e.db` when seed VALUES change (AGENTS.md quirk) |
| AP-8 | MEDIUM | `space-y` gaps collapse next to `mt-*` children | v4 `:where()` zero-specificity rewrite (trap 4) | `flex gap-*` convention everywhere |
| AP-9 | LOW | Later e2e specs see teal accent | theme spec mutates the shared user record | violet restore at spec end (never break that cleanup) |
| AP-10 | LOW | Detached-element computed styles read `""` mid-e2e | locator resolved against the SSR splash, React removed it | wait for hydration before `evaluate` (canvas spec) |
| AP-11 | LOW | Dev server dies silently (~4 GB containers) | OOM killer targets `next-server` under browser load | close extra browser sessions before long runs |
| AP-12 | HIGH | Mobile content 64px too low (144px vs reference 80px) | app bar was STICKY (in flow) + main `pt-20` → offsets STACKED | fixed glass bar + `pt-20`; e2e "content starts at 80px" pin (session-3 S3-E) |
| AP-13 | MEDIUM | Clock text/chip stay violet after switching accents | `applyToDocument` wrote 6 of 9 tokens; deep/softest kept `:root` violet defaults | complete `accentCssVars` set; unit pin (session-3 S3-J) |
| AP-14 | MEDIUM | Sidebar/drawer nav items drift apart | drawer re-implemented item markup instead of sharing | ONE source: `nav-items.tsx` `NavItemLink` (session-3 S3-F) |
| AP-15 | LOW | e2e backdrop pin fails on identical color | `bg-black/20` computes as `oklab(0 0 0 / 0.2)` in Chromium | accept both serializations (trap 7) |
| AP-16 | LOW | Emoji length test off-by-UTF-16 | Zod v4 `.max()` counts code points | test updated with the semantics documented |
| AP-17 | MEDIUM | Drawer backdrop blurs 8px (reference: 4px) | v4 blur-scale shift — `backdrop-blur-sm` is 8px in v4 (trap 9) | `backdrop-blur-xs`; e2e `blur(4px)` pin (session-4 S4-A) |
| AP-18 | MEDIUM | Brand/CTA/avatar gradients end violet-600 | routed through `primary`/`strong`; the reference ends at the ADJACENT hue | `--sf-primary-gradient-to` + `-avatar-*` tokens (session-4 S4-G) |
| AP-19 | HIGH | Every empty view renders the wrong empty-state design | ad-hoc slate circle + gray text vs the reference's gradient-block pattern | shared `EmptyState`/`SimpleEmptyState` on 80px gradient block + 40px icon + h3 20px (session-4 S4-C) |
| AP-20 | MEDIUM | View headers drift (h2 in 8 views, tracking-tight slate-900, no icons, wrong subtitles) | hand-rolled headers in 11 views + a stale ViewHeader | ONE source: `ViewHeader` h1+icon+reference subtitle, all 20 views (session-4 S4-D) |
| AP-21 | LOW | e2e order-dependent flake: later specs see TEAL | theme spec's Violet-restore PATCH aborted by page teardown at test end | restore awaits the settings PATCH + asserts the violet triplet (session-4) |
| AP-22 | HIGH | Primary CTAs render SOLID violet | the reference's CTAs are violet→indigo GRADIENTS + v3 shadow (measured); solid bg-sf-primary was a clone-side assumption | Button `gradient` variant — `.sf-gradient` + `.sf-gradient-shadow` (session-5 S5-A) |
| AP-23 | HIGH | Events view rebuilt as a light list misses the reference entirely | the reference's Events body is a DARK slate-900 terminal panel (58% dark pixels — never audited before session-5) | `bg-slate-900 rounded-2xl shadow-2xl` panel in BOTH themes + CW label + cyan New Event (session-5 S5-B) |
| AP-24 | MEDIUM | Form controls drift zinc vs the reference's GRAY shadcn theme | the reference's base palette is gray-200 borders / gray-950 text / gray-400 muted (zinc was a clone-side default) | GRAY base palette in `@theme` (session-5 S5-D) |
| AP-25 | MEDIUM | Dialogs render rounded-2xl max-w-lg h-10 inputs | the reference's dialogs are shadcn-v3 stock: rounded-lg (8px), max-w-md (448px), h-9 transparent inputs | `dialog.tsx`/`input.tsx` reworked (session-5 S5-C) |
| AP-26 | LOW | Unpinned palette classes read back as `lab()` in computed styles | v4's oklch defaults — `text-cyan-400` computed `lab(76.6 -40.9 -29.6)` | pin every asserted color (cyan-300/400, red-600 now pinned) (session-5, trap 10) |
| AP-27 | LOW | `getByRole({ name })` strict-mode collisions in e2e | Playwright role names are substring + case-insensitive — "New note" matches "New notebook" | use `exact: true` when names collide (session-5) |
| AP-28 | HIGH | Flashcards rendered as two sf-cards with plain rows + an inline flip card | the reference's view is a two-panel layout: `w-80 border-r` deck sidebar with 40px colored icon blocks + swatch picker + `lg:grid-cols-3` card grid + 3D-flip study mode (measured with a live reference deck) | full S7-A rework + `FlashcardDeck.color` + `Flashcard.difficulty` + `/api/ai/generate-cards` (session-7) |
| AP-29 | MEDIUM | Study-group swatches green-500/orange-500; practice-test dialog a different field set | measured: the swatch picker is emerald-500/amber-500 red-before-pink; the test dialog is Test Title + Time Limit (60) + AI Generate Questions + a scrollable question list | palette fix + `PracticeTest.questions` JSON + `/api/ai/generate-questions` (session-7 S7-B) |
| AP-30 | HIGH | Timetable week grid compact "Sun 4" heads + 64px hour rows + NO mobile accordion; **columns rendered two days ahead of their headers** (`(col+1)%7` bug) | measured: grid-cols-8 with full day names + `text-lg` dates + 60px "7 AM" hour rows + accordion + My Classes today date | full S7-C rework + the `(col+6)%7` mapping fix (session-7) |
| AP-31 | MEDIUM | Analytics stat cards r16 bordered with different labels; 14-day charts | measured: r12 border-0 cards + 48px tinted icon blocks (violet/blue/green/orange-100) + "X/Y" fraction values + "Last 7 Days" chart cards | S7-D rework; green-100 `#dcfce7` pinned (NOT emerald-100) (session-7) |
| AP-32 | HIGH | Sidebar chrome drift: 6 wrong nav icons (Tasks/Calendar/Events/Notes/Files/Math Solver), active-nav gradient stop-2 violet-600 instead of **indigo-500**, tagline `truncate`d, 28px collapse button | measured live: `lucide-square-check-big`/`calendar`/`calendar-days`/`book-open`/`folder-open`/`calculator`; gradient `rgba(139,92,246,0.1)→rgba(99,102,241,0.1)`; `text-overflow: clip`; `h-9 w-9` buttons | S8-A: icon swaps + stop-2 via `--sf-primary-avatar-to` (pinned `NAV_ACTIVE_GRADIENT_STOPS`), tagline un-truncated, h-9 w-9 rounded-lg (session-8) |
| AP-33 | HIGH | Dashboard cards rendered inset bordered row-cards inside padded bodies | measured: `rounded-2xl border-slate-100 shadow-sm overflow-hidden` cards with header `p-6 border-b` + **flush** `divide-y divide-slate-50` bodies — rows run edge-to-edge as `p-4 hover:bg-slate-50` | S8-B: `SectionCard` `flush` prop + dashboard exam/assignment/task rows rebuilt (session-8) |
| AP-34 | HIGH | Calendar semantics inverted (today = solid accent fill, NO selected state, 3 nav buttons, header-split card); MyDay amber card misplaced; Timetable today tint rode the BODY column via the **dead** `bg-sf-primary-softest/50` utility | measured by clicking day 15: SELECTED = solid accent fill + white text, TODAY (unselected) = violet-100 tint + strong text — both hover-stripped; simple `p-6 border-slate-200` month card with 2 ghost navs; today tint rides the column HEADER (`bg-violet-50`) | S8-C/D/E: calendar rework + MyDay header block + suggestions + header-cell tint (inline style; the only sf-primary color utilities are `{-foreground,-soft,-soft-dark,-strong,-strong-dark}`) (session-8) |
| AP-35 | HIGH | Tasks/Notes/Study Groups rendered as single padded cards (page-header + card lists) | measured: full-height two-pane layouts — `w-80 border-r border-slate-100 pr-6` left pane (h1 + icon INSIDE, 36px gradient New button, icon search) + a BARE right pane (centered empty state / editor) | S8-F/G/H: tasks two-pane + single-row main header; Notes dropdown New + Radix combobox filters; Study Groups two-pane (session-8) |
| AP-36 | MEDIUM | Analytics chart cards had no per-card icons, no Assignment Status donut, no Subject Workload, no priority chips; Math Solver rendered input + solution side-by-side | measured: trending-up/clock/book-open/target icon headers, an SVG donut (Not-Started `#94a3b8`), an `h-[250px]` workload body, flame + slate-50 chip card; Math Solver is a single max-w-4xl column (input card + solution BELOW) | S8-I/L: ChartCard `icon` prop + donut + workload + priority chips; mathsolver single-column rework with camera/refresh-cw/sparkles footer buttons (session-8) |
| AP-37 | LOW | Icon-level drifts: Calculator Clear, AI quick actions, FocusTimer complete (skip-forward), assignment/exam search inputs (no icon), exam card location row + topics counter, Settings tab list chrome | measured: rotate-ccw, the reference quick-action set, check, inline `search` icons + pl-9 inputs, date+time·duration rows ONLY, bg-white wrapped tab list | S8-K/M/N/O/P + the dead-utility sweep (S8-J) (session-8) |
| AP-38 | HIGH | Dashboard had NO overdue alert banner and used 80px-gradient empty states inside the flush cards | measured live: conditional `from-red-50 to-orange-50 border-red-200` banner between greeting and stats (icon block + "You have N overdue item(s)" + ghost View All) + slim `p-8 text-center` inline empties with `w-12 h-12` slate-300 icons | S9-A/R: banner + `DashSectionEmpty` + the seeded overdue task (session-9) |
| AP-39 | HIGH | Calendar grid was Monday-first with a fixed 42-cell (6-row) grid; mode switch was 24px text-only tabs with `capitalize` | measured: SUNDAY-first header (Sun…Sat; October 2026 starts at Sep 27 = 35 cells) + dynamic week count; white `border-slate-200 p-1` switch container with `h-8` grid3x3/list icon tabs, capitalized raw text | S9-E/F: `monthGrid()` `first.getDay()` + `ceil((lead+days)/7)` + `CALENDAR_WEEKDAYS`; mode-switch rework (session-9) |
| AP-40 | HIGH | Analytics 7-day charts were HTML bar charts with 10px labels, no axes, no gridlines | measured: SVG AREA charts — X-axis day labels (12px `#666`), Y-axis ticks, `stroke-dasharray="3 3"` gridlines; Task Activity single area filled `#e2e8f0`; Focus Time `#8b5cf6` line over `url(#focusGradient)` | S9-K: `AreaChart` SVG component rebuild (session-9) |
| AP-41 | MEDIUM | MyDay empty state was a violet sf-card; quick-add carried an extra gradient submit button; Tasks filter was a combobox + "No lists yet" placeholder; assignments defaulted to "All" with subject/description rows; exams showed "1 day" amber for the 1-day bucket | measured: bare amber greeting empty (`w-20` sun block + time-aware "Good morning!" + amber→orange CTA); input + More Options ONLY (Enter submits); outline filter BUTTON with funnel icon; EMPTY My Lists body; "Active" default + slim rows (no subject span/description); "Tomorrow" in `bg-orange-100 text-orange-600` | S9-B/C/D/I/J/Q (session-9) |
| AP-42 | LOW | Icon-level drifts: Files text-only breadcrumb + `layout-grid` toggle, Grid Builder grid3x3 icon, FocusTimer stats (brain/flame/timer) + moon long-break, Settings text-only tabs, Notes chevron-only comboboxes, no per-deck menu, `sparkles` composer, groups hint wording | measured: `house` breadcrumb root + `grid3x3` toggle, text-only Grid Builder, flame/target/zap stats + `coffee` preset, palette/user/book-open/calendar/bell tab icons, folder/tag leading combobox icons, hover-revealed `h-8 w-8` ellipsis deck menu, `wand-sparkles`, "or create a new one" | S9-G/H/L/M/N/O/P/S (session-9) |
| AP-43 | CRITICAL | The shadcn base tokens were LITERAL values inside `@theme inline` — `bg-card`/`bg-popover`/`bg-muted`/`border-input` utilities compiled with the light value inlined, so `.dark { --color-* }` overrides never reached them: white dialogs with near-white titles (unreadable), invisible outline buttons (white-on-white, contrast 1.04), light dropdowns/tabs/badges — for nine sessions, masked because `.sf-card`-style custom CSS (direct `var()` references) re-themed correctly around the light-mode orphan islands | measured dark-mode sweep (`scripts/dark-sweep.mjs`, flashbulb + contrast detector): 10 views affected. Fix: shadcn's own v4 shape — raw triplets in `:root`/`.dark` (`--card`, `--popover`, `--muted`…) consumed as `hsl(var(--x))` inside `@theme inline`; shadows route through `--sf-shadow-sm`. Compiled proof: `.bg-card{background-color:hsl(var(--card))}`. Light values byte-identical (193 prior pins stayed green untouched) | S10-1: the globals.css token indirection (session-10) |
| AP-44 | HIGH | Inline-style gradients/tints authored for light-mode parity never re-theme: the overdue banner (red-50→orange-50), MyDay amber card, timetable today-header + mobile chips + calendar today cell (softest/empty-from tints), sidebar clock chip (softest→adjacent + deep/strong text), Settings selected theme cards; analytics SVG charts hardcode light fills (#e2e8f0 area, #f1f5f9 gridlines, #666 axis labels) | measured dark flashbulbs/contrast 1.0–1.6 on those surfaces. Fix idiom: globals.css classes with `.dark` washes (`.sf-overdue-banner` red-800/orange-900, `.sf-amber-card` amber-800/orange-900, `.sf-today-tint`/`-cell` + `.sf-clock-chip` + `.sf-selected-tint` soft-dark at 0.3–0.35 alpha, text `--sf-primary-strong-dark` violet-300) + `dark:fill-slate-800`/`dark:fill-slate-400`/`dark:stroke-slate-800` SVG utilities (CSS presentation properties override SVG attributes) | S10-2…S10-7 (session-10) |
| AP-45 | MEDIUM | Assuming the reference is the dark-mode measuring stick | measured: the reference's Dark/System options are a Base44 platform NO-OP — `html.dark` + dark `body` only; its canvas gradient, glass sidebar, and white cards stay light (VLM read its "dark" dashboard as "properly themed light mode"). The clone's full dark mode is the documented superset; dark parity standard = internal consistency (the dark sweep + the 10-spec pin family) | governing discovery (session-10) |
| AP-46 | LOW | Theme-mode mutation in specs risks poisoning the shared user record for later spec files | fix pattern: PATCH `/api/settings/preferences` `{ themeMode }` via `page.request` (the storageState cookie rides the request context — no UI navigation), `waitForFunction(html.classList.contains("dark"))` to gate hydration, and an `afterEach` that PATCHes light back and awaits the response — a failed pin can never leak dark mode into the next spec file (the S4 accent-restore lesson, per-hook) | `tests/e2e/dark-mode.spec.ts` (session-10) |
| AP-47 | CRITICAL | Theme application that waits for the auth round-trip: dark users flash light on every hard load (or see a fully light page when `/api/auth/me` stalls), the login route never themes (its `dark:*` variants are dead code there — dark-OS fresh visitors get light), and System mode goes stale on runtime OS switches (no `matchMedia` change listener) | measured with a network-route abort of `/api/auth/me` + `agent-browser set media dark/light` + a fresh-context login probe. Fix: the next-themes shape — `applyToDocument` caches `{ mode, accent }` to `localStorage["sf-theme"]` (format unit-pinned), a self-contained inline boot script in `<head>` resolves the cached mode (absent → system fallback) BEFORE first paint, `installSystemThemeTracking()` re-applies on OS change when mode==system, sign-out clears the cache, and a plain non-media `meta[name=theme-color]` (appended after Next's media variants — last match wins) tracks the effective mode | `THEME_BOOT_SCRIPT` + `themeCachePayload`/`parseThemeCache` (session-11) |
| AP-48 | HIGH | Accent-driven TEXT in dark mode left on the light-mode 600/500-level tones: the active nav item (inline `rgb(var(--sf-primary-strong))` + icon), ViewAllLink (`text-sf-primary-strong` no dark pair), the timetable mobile today chip (`bg-sf-primary-soft` — a mobile-only surface the desktop sweep never rendered), the selected avatar swatch (inline soft tint) — all pass the 2.2 contrast bar under the DEFAULT violet (violet-600 is the palette's darkest 600, 3.13:1) which is exactly why the session-10 sweep called them clean | the 7-accent sweep (`scripts/accent-dark-sweep.mjs`, desktop + mobile passes, WARN bar at 3.2 for accent text) + direct DOM probes. Fix: the repo convention — 300-level `--sf-primary-strong-dark` for dark accent text (`.sf-nav-active{,-icon}` classes, `dark:text-sf-primary-strong-dark`, `dark:bg-sf-primary-soft-dark` chips, `.sf-swatch-selected` wash); light values byte-identical | S11-2..S11-5 (session-11) |
| AP-49 | MEDIUM | Sweeping at ONE viewport / ONE accent / one threshold: the S10 dark sweep was desktop-only + violet-only + a 2.2 bar — it structurally could not find mobile-only surfaces (the timetable accordion's today chip), accent-dependent failures, or the 2.2–3.2 accent-text band | extend the audit matrix: every accent × desktop AND mobile viewports (mobile-only surfaces render below `md:hidden`), plus a WARN tier for accent text; ALSO beware sweep false-negatives from size cutoffs (flashbulb detectors with a ≥40×20 filter miss small pills) and design-intended dimming (adjacent-month days at 2.36 in dark mirror the light 2.2 — verify the LIGHT equivalent before "fixing") | `scripts/accent-dark-sweep.mjs` (session-11) |
| AP-50 | CRITICAL | State encoded ONLY by fills/tints is lost in forced-colors (Windows HC) AND print — both engines strip author colors: the calendar selected day, today markers, the mode-switch active segment, the active tab, the active nav item, and the slider progress all became indistinguishable (text stayed readable everywhere — 0 invisible-text findings — which is exactly why nothing LOOKED broken) | measured with Chromium `forcedColors: active` emulation over all 20 views + a reference baseline pass (`scripts/forced-colors-sweep.mjs` — the reference degrades IDENTICALLY, so these are superset fixes). Fix idiom: system-color outlines (`2px solid Highlight`, inset -2px) scoped to stable containers, `font-weight: 700` for the active nav (+ its `span` — inherited weights lose to inner utilities), `forced-color-adjust: none` ONLY for essential non-text graphics (WCAG 1.4.11 — the slider fill) | the `@media (forced-colors: active)` block (session-12) |
| AP-51 | CRITICAL | The print media never un-themes: dark mode printed 2–8 light-text elements per view (all 20 views) on the print-forced white canvas — `dark:text-slate-100` utilities keep rendering LIGHT text while the S11 print block whitens the body; and browsers' default background-dropping turns every white-text-on-color surface (gradient CTAs, the events terminal panel, timetable class cards, the GradeTracker summary card, the calendar selected cell, checked checkboxes) invisible in BOTH modes; the `min-w-[900px]` timetable canvas clipped Saturday on A4 | measured: print-media text-color pass in both modes + real `page.pdf()` A4 renders (`scripts/print-audit.mjs`); VLM-confirmed on the rendered pages. Fix: `beforeprint`/`afterprint` handlers in the theme boot script remove/restore the `dark` class around the print duration (one mechanism, both routes, all dark: variants at once); `sf-print-exact` (`print-color-adjust: exact`, inherited) on white-text-on-color containers; `.sf-timetable-canvas { min-width: 0 }` in print | S12-C1..C3: the boot-script print handlers + the print-exact family (session-12) |
| AP-52 | HIGH | Keyboard users face 21 sidebar Tab stops before any content with no bypass (WCAG 2.4.1), and TESTING print with `page.pdf()` alone misleads: `page.pdf()` applies the print stylesheet faithfully only when `page.emulateMedia({ media: "print" })` is already active (without it the layout can keep screen-width geometry and clip wide content — the timetable cut Saturday in the naive call); `page.emulateMedia` alone does NOT fire `beforeprint` (dispatch the event manually to exercise the handlers; `page.pdf()` DOES fire both) | measured: Tab-stop recording over the two-pane views (`scripts/focus-order-audit.mjs` — dialogs and the mobile drawer trap focus correctly, order healthy); the pdf/emulation split measured empirically. Fix: the `.sf-skip-link` (off-screen not display:none, first focusable, → `main#main-content` tabIndex -1) + the print-pipeline testing conventions | S12-B + the print-testing lessons (session-12) |
| AP-53 | CRITICAL | Optimistic UI without rollback: the AI chat rendered the user's message from LOCAL state before the POST settled — on failure it stayed rendered (never persisted), silently vanished on reload, and left no retry affordance; meanwhile NO layer carried a deadline, so a hung SDK call kept the composer disabled and "Thinking…" on screen indefinitely (>25 s measured, nothing to recover to) | measured with route interception (`scripts/ai-error-audit.mjs` — abort, hang, 500 probes). Fix idiom: capture the optimistic id BEFORE the try; on failure `removeChatMessage(localId)` + `setInput(content)` (the bounced-back text IS the retry affordance); pass `{ timeoutMs: 120_000 }` to `apiSend` at EVERY AI call site (generous — LLM completions legitimately run 30–60 s) and classify with `isTimeoutError(err)` for a "took too long" toast | S13-A1/A2: the send rollback + the api timeout opt (session-13) |
| AP-54 | HIGH | Percent-encoding a filename INSIDE the quoted `filename="…"` half of Content-Disposition is not RFC 5987 — browsers save the percent-encoded STRING as the literal filename ("файл.txt" → "%D1%84%D0%B0%D0%B9%D0%BB.txt"); and trusting `File.name` without an emptiness guard bites TWICE: `next dev` (Node undici) stores `name: ""` as an unlabeled row, while the Bun standalone's multipart parser surfaces the empty name as `undefined` — a 500 crash on `file.name.slice` | measured: `scripts/upload-edge-audit.mjs` (empty-name 201-dev/500-standalone; the disposition header read back from a real download). Fix idiom: a pure `buildContentDisposition(name)` seam emitting BOTH dialects (ASCII-safe fallback + `filename*=UTF-8''<pct-encoded>`); reject `!file.name.trim()` with 400 BEFORE the size check; test upload guards at BOTH runtimes | S13-C2/C3: the files route guard + the disposition seam (session-13) |
| AP-55 | MEDIUM | Audit tooling can poison ITS OWN later probes: a `page.route` handler that never fulfills keeps the app's `busy` state latched after `unroute` (the request never settles), so the next send() silently early-returns — the ai-error audit's first run reported "no toast for a 500" that was purely this artifact; likewise a page-wide `getByText("…")` "message removed" assertion matches the composer holding the bounced-back VALUE | both hit and fixed during the S13 audit run (reload-between-probes; `getByRole("listitem").filter({ hasText })` scoping). Generalized: isolate client state between failure-mode probes (reload), and scope DOM absence assertions to the semantic container | the audit-tooling lessons (session-13) |
| AP-56 | HIGH | Unrouting a HELD route RELEASES the pending request to the real server: the S14 a11y audit held `/api/ai/chat`, probed, then unrouted — the in-flight POST completed against the REAL route and persisted probe rows + a genuine AI reply into the chat history (found via the evidence-capture VLM pass showing probe noise in the transcript) | reload the page BEFORE unrouting (document unload aborts the fetch), then unroute; verify with a history query after any held-route probe run | the network-side twin of AP-55 (session-14) |
| AP-57 | MEDIUM | Per-request failure handling ≠ ambient-state awareness: every path recovered offline (S13 rollback, dialogs keep forms, SPA nav on cached data) yet the user had NO signal they were offline — they discovered it one raw "Failed to fetch" toast at a time; likewise the AI routes (the only per-request COST surface) had no budget while login did, and AI output landed in static containers (SR users heard nothing after sending) | measure the AMBIENT dimension separately: offline banner via `useSyncExternalStore(navigator.onLine)` rendering null online (structural byte-parity), transport-TypeError mapping at the one `doFetch` seam (timeout classification first), per-USER budgets keyed `ai:${userId}` on expensive routes, `aria-live="polite"` + `aria-busy={busy}` on async-output containers | S14-A0/C1/D1..D3 (session-14) |
| AP-58 | LOW | Stale pre-clone tooling ships alongside the real tooling: 14 scripts from the original repo crashed (`check-db-state.mjs` referenced `goal`/`activityLog` models that don't exist), imported from foreign machine paths (`/home/z/my-project/project-management/...`), or probed the original app's routes (`demo@orbital.app`, `/goals`) — each one a trap for the next agent that greps for a working example | `git rm` the broken/foreign ones; keep what the CURRENT docs reference; verify no README/AGENTS/CLAUDE/PAD/SKILL reference breaks before deleting | the S14-E hygiene sweep (session-14) |
| AP-59 | HIGH | A `[]`-deps `window.addEventListener("keydown")` effect calls component functions (`press`/`submit`) captured at MOUNT — the listener evaluates the mount-time state forever (the S15 keyboard audit typed `12+3`, pressed Enter, and got `0`: the stale `submit` closed over `display="0"`); the same effect ALSO needs form-control guards or every keystroke in the GPA rows/converter hijacks the calculator | the latest-ref indirection: `const latest = useRef({press, submit}); useEffect(() => { latest.current = {press, submit}; })` — the bound handler always calls the CURRENT functions; guard `target.tagName === INPUT/TEXTAREA/SELECT/isContentEditable` + open dialogs before `preventDefault` | S15-C0 (session-15) |
| AP-60 | MEDIUM | TWO probe artifacts produced phantom findings this session: (a) Next.js's `__next-route-announcer__` carries `role="alert"`, so unscoped `getByRole("alert")` strict-mode-collides and generic `[role=alert]` probes read the EMPTY announcer instead of the app's alert; (b) a bare `waitForSelector("h2")` after a form submit resolves on the CURRENT screen's own h2 — the probe then reads state that predates the round-trip (the S15 capture read the signup screen's h2 and found "no code note" while the register was still in flight) | scope alert locators to a container (`div.shadow-2xl`).getByRole("alert"); wait for screen transitions BY HEADING TEXT (`h2:has-text('Verify your email')`), never by tag alone; assert probe preconditions in waitForFunction before screenshotting | S15 execution lessons (session-15) |
| AP-61 | MEDIUM | A suspected one-character syntax bug (`const [historyOpen…` read as `const istoryOpen…` in TWO sessions, with elaborate "TypeScript silently repairs the parser" theories) was a PHANTOM: some tool outputs swallow the `[` following `const `, and codepoint-level inspection (`python repr`/`od -c`) + the git diff showed the file was always correct — tsc passing was the truth all along | before "fixing" an impossible-looking syntax error that lint AND tsc AND the compiler all accept, dump the exact codepoints (`[hex(ord(c) for c in line]`) and `git diff` — trust the gates over the rendered output; log the artifact so the next session doesn't re-derive the phantom | the E1 non-finding (session-15) |
| AP-62 | HIGH | An SPA shell that flips from its loading screen on AUTH alone renders with an empty data store — the first data arrival then re-layouts conditional sections (banners, growing lists) under the viewport: one layout-shift worth CLS 0.117–0.125 (CWV needs-improvement) on EVERY first paint. The fix is NOT skeletons (data-dependent heights cannot be exact) but PRE-WARMING: fire the active view's initial collections in parallel with the auth call and flip the shell only when both settle — replacements are not moves, so the shift source disappears entirely (measured CLS 0.00 post-fix; mobile LCP moved +120 ms, still GOOD, because the data fetch shares the auth round-trip window) | centralize `INITIAL_COLLECTIONS` per view (unit-pin completeness — a new view without an entry is a silent CLS regression); read the active view from the store AFTER hydrate (no stale closure); a failed pre-warm must never block the shell (`.catch(() => {})` — the views' own effects retry) | S16-A (session-16) |
| AP-63 | MEDIUM | Two measurement traps landed in one session: (a) adjacent-sibling margins COLLAPSE — the verify rhythm shipped as circle `mb-3` + h2 `mt-2` and measured 68px instead of 76px (max, not sum; padding on the h2 was ALSO wrong — it moves the text, not the box top the gauge reads); (b) a responsive reference (`h-11 sm:h-12`, `text-xl sm:text-2xl`) and a fixed-value clone measure IDENTICAL at desktop — the S16 mobile gaps (44 vs 48px button, 20 vs 24px h2, 76 vs 88px rhythm) were invisible to every existing desktop pin | put a decomposed spacing rhythm on ONE element (`mb-5 sm:mb-8`), never split across siblings; audit every new surface at BOTH viewports (390×844 AND 1280×800); fix with `sm:`-prefixed responsive classes — every ≥sm value stays byte-identical and all desktop pins keep passing by construction | S16-B/C/D (session-16) |
| AP-64 | HIGH | The reference's account state is DATA, not chrome — until its 2026-09-28 re-provision its zero-data surfaces were UNMEASURABLE (S6/S9 measured populated/partial states), so the clone shipped invented empty-state chrome the reference never renders: a "No data yet" Analytics block, a "No grades yet" GradeTracker block, seven drifted hint strings, pre-seeded register subjects. When the reference's data state changes, its empty-state chrome becomes measurable — re-sweep | treat the reference's CURRENT account state as an audit surface: sweep fresh registrations on BOTH apps side by side (delete leftover probe rows through the reference's own UI first); empty-state copy is verbatim parity, never invented; the reference's stat cards render at zero data — unconditional rendering beats conditional EmptyState branches | S17 audit (session-17) |
| AP-65 | MEDIUM | Two live lessons: (a) the reference's Settings tab CONTENT (vs its pinned tab-list chrome) was never audited — its Profile tab persists school/grade/study-goal/notifications on the User entity (captured from its own network PUT, the honest way to learn a hosted app's data model); (b) after `prisma db push` + `db:generate`, a LONG-RUNNING dev server keeps the OLD generated client — Turbopack hot-reloads app code but not node_modules, so `/api/auth/me` 500s on the new select fields and every login bounces (the login itself succeeds; the me-route crash breaks the gate) | audit the tab BODIES, not just the chrome (per-tab headers, field sets, save flows); capture the reference's network writes to learn its entity shapes; RESTART the dev server after any Prisma schema change before diagnosing "broken login" | S17 audit + the stale-client incident (session-17) |
| AP-66 | MEDIUM | Three live lessons from the S18 RUM + Docker build: (a) web-vitals v6's `onXXX` callbacks return VOID — there is no unsubscribe handle (v4/v5 had one), so disposal must gate INSIDE the callback (`if (disposed) return`), not via a returned stop function; (b) the Next output tracer snapshots the build machine's `db/custom.db` INTO `.next/standalone/db/` — a `COPY .next/standalone` into a container image would ship stale database bytes (neutralized by .dockerignore + an explicit `RUN rm -rf /app/db` + the absolute DATABASE_URL); (c) bash `cp -r src dst` NESTES when dst exists (`dst/src/`) while Docker COPY MERGES contents — a local simulation of a Dockerfile's COPY order must use `cp -r src/. dst/` or the sim diverges from the real build | gate beacon disposal inside the callback for v6; treat `.next/standalone` as build-machine state (never trust its traced db); simulate Docker layouts with `src/.` copy semantics (scripts/docker-layout-sim-s27.sh is the committed pattern — it validated db push + seed + boot + health + the RUM 401 gate with no Docker daemon) | S18 RUM + Docker packaging (session-18) |
| AP-67 | MEDIUM | Two live lessons from the S19 diagnostics-panel build: (a) `browser.newContext()` inside a test INHERITS the file-level `test.use({ storageState })` — a "manually created fresh context" is NOT anonymous (the first anon-gate e2e failed because the "anon" context carried the session cookie and the panel happily rendered; empirically confirmed by dumping `ctx.cookies()`); (b) a page-wide `getByText("Time to First Byte")` strict-mode-collides when the same label renders in BOTH the metric cards AND the recent-table's Metric column (4 elements resolved) | force a truly anonymous context with `browser.newContext({ storageState: { cookies: [], origins: [] } })` — an explicit EMPTY storageState overrides the inherited one; scope repeated-text assertions to their semantic region (`getByRole("region", { name: "…" })` for a labeled section) or a table cell (`getByRole("cell", …)`) — never page-wide text matching on labels that appear in two structures | S19 RUM diagnostics panel (session-19) |
| AP-68 | MEDIUM | A trend-rich RUM evidence probe silently truncates under the S18 write contract: posting N values for one metric in a SINGLE batch 400s at the 10-event cap, and posting them under ONE sessionId collapses to a single row regardless (the (sessionId, metric) UPSERT means final-value-wins — the S20 capture probe's first POST failed 400 and a naive fix would have produced five 1-point series). Floating-point twin: `(i / (n-1)) * width` and `(i * width) / (n-1)` are the same math but DIFFERENT rounding paths — a toEqual pin on exact sparkline coordinates binds the implementation to the multiply-first form | post each trend value under a DISTINCT sessionId in ≤ 10-event batches (25 single-event POSTes ≈ 1s); write exact-coordinate pins against the canonical multiply-first expression (or round both sides to 2dp before comparing) | S20 RUM panel v3 (session-20) |
| AP-69 | HIGH | A plain `throw` inside Next.js instrumentation.ts's `register()` is CAUGHT by the framework ("Failed to prepare server" / "Failed to preload entries") — the process keeps running and every request 500s: a silently-DEGRADED server, the exact opposite of the intended fail-fast (validated empirically with a scratch probe: throw → exit code never reached, health 500s; the same probe with `process.exit(1)` exits cleanly in < 1s with the message on stderr). Also: `register()` runs at server boot (dev/next start/standalone) but NEVER during `next build` — boot-time env guards are build-safe by construction | for boot-time enforcement (env secrets, required config) use `console.error` + `process.exit(1)` inside `register()` — never a bare throw; pin BOTH directions (the negative spawn exits non-zero with the actionable message, the positive control stays healthy) because the framework's catch makes the naive throw appear to work in dev logs while degrading production | S22 AUTH_SECRET boot guard (session-22) |
| AP-70 | MEDIUM | Two live lessons from the S23 import build: (a) a `fuser -k <port>/tcp` restart of `bun run dev` can SILENTLY FAIL to kill the listener pipeline — the new server dies with EADDRINUSE (its truncated `tee dev.log` interleaves with the old server's open fd, corrupting the log with null padding), the ORIGINAL server keeps serving with all its in-memory state (the rate limiter), and probe scripts start seeing phantom 429s that look like a route bug; (b) a probe's before/after baseline can be CONTAMINATED by its own earlier successful steps — the capture script's "rollback guard" first compared task counts before-import vs after-validation-family, but the two successful imports in between legitimately added rows, so the guard read `unchanged: false` and looked like a rollback failure | kill dev servers by PID (`pkill -9 -f "next dev"; pkill -9 -f next-server`) and VERIFY the port actually went down before starting the new one; when a fresh server behaves as if it has stale state, suspect a zombie process before suspecting the code; when measuring "X changes nothing", take the baseline AFTER every legitimate writer has run — isolate the variable under test by construction, not by luck | S23 data import (session-23) |
| AP-71 | MEDIUM | Two live lessons from the S25 deletion build: (a) a DOCUMENTED budget count can drift from reality — the S24 spec comment said the suite spends ~8 registrations + 1 = 9/10 of the register limiter's budget, but the real count was already 10/10 (S9 registers 2, not 1; s16-perf-parity also registers 1 through the UI), so the S25 fresh-user registration was 429'd in the full suite while passing in isolation (the per-spec run never re-hits the exhausted in-memory limiter — an isolation-passing spec can still fail suite-wise on a shared-budget route); (b) the register AND verify routes are both IP-keyed (`register:${ip}` / `verify:${ip}` via `clientIp` → x-forwarded-for first) | re-derive documented budget counts by grep (`grep -rn "auth/register\|create account" tests/e2e/`) before adding a new consuming spec — never trust the previous session's arithmetic; when a suite-level budget is exhausted, have the new spec's POSTs ride a DISTINCT client IP (`headers: { "x-forwarded-for": "192.0.2.25" }` — the RFC 5737 TEST-NET range): behind a proxy distinct users have distinct IPs, so the loopback pile-up is the suite artifact, and the limiter logic itself stays untouched and pinned | S25 account deletion (session-25) |
| AP-72 | HIGH | An audit tool validated once can SILENTLY ROT under a later app change and keep emitting plausible-looking findings for the WRONG state: `scripts/dark-sweep.mjs` (validated GREEN in session-10) forced dark mode via `classList.add("dark")` + `localStorage["sf-theme-mode"]` — but the S11 theme lifecycle added a pre-paint boot script that reads `sf-theme` (a DIFFERENT key, read by nothing) and an auth-correction window that re-applies the user's stored preference on every full load, so by S27 the probe swept in LIGHT mode: `MODE:` printed empty, 97 phantom "flashbulbs" (ordinary white cards) + 7 phantom "unreadable" flags (reference-measured muted surfaces) — findings that would have invited parity-breaking "fixes" | every probe must (1) set state through the REAL application path (the settings API — the accent-dark-sweep/capture-studyflow convention), never a parallel side-channel (a forced class + a private localStorage key is a second implementation of theming that drifts); (2) SELF-VERIFY its precondition and fail loudly — poll `waitForFunction` for the observable end state, print the failure to stderr, `process.exit(1)`, and emit NO findings (a probe that cannot verify its own mode must never emit findings that look like findings); (3) ride the applied state in its structured output (`{ mode, views }` — self-describing artifacts); (4) restore mutated state with an awaited write before close; validate the guard with a negative-control probe (never-true wait → exit 1 + empty stdout), and re-run every standing audit after any lifecycle change touches what they measure | S27 dark-sweep repair (session-27) |
| AP-73 | HIGH | The S27 mode-forcing rot has a VERDICT-rot sibling: the probe still runs, still measures the right state, but asserts a DESIGN THAT NO LONGER EXISTS — `scripts/connectivity-audit.mjs` family A4 (written S14, validated against the then-current toast design) kept enumerating `[role=\"status\"]` toasts on the login route, but S15 had replaced the login card's errors with the reference's MEASURED inline `role=alert` (between Password and Sign in), so for thirteen sessions every audit run emitted the phantom finding "Login offline shows no/silent feedback" — with `toast: []` as the measured evidence while the SAME finding's bodyText contained "You appear to be offline. Check your connection and try again.": a finding disproved by its own measured evidence, undetected through every "connectivity ✓" verdict since (the sessions trusted the aggregate and never re-read the findings array) — and a future session acting on it would have reverted the login card to toasts, breaking the S15 reference-parity pins | the tell for this rot class: a finding whose own measured evidence disproves it — when the probe's measured JSON contains the very feedback the finding claims is absent, the EXPECTATION is stale, not the app. The doctrine: assert the DESIGNED channel (enumerated from the live DOM, scoped to the designed container — the auth card `div.shadow-2xl`, never page-wide: Next's route announcer also carries role=alert), assert the observable end states (the user stays on the card, the button recovers), keep the genuine-failure criterion LOUD (never normalize a finding away), ride the measured state in the verdict, and re-run every standing audit after any change that touches what it measures — reading the FINDINGS array, not the aggregate verdict | S28 connectivity-audit A4 repair (session-28) |
| AP-74 | MEDIUM | The S27/S28 rot has a PROSE sibling: doc claims validated once drift silently under additive change — the schema's model count was written as "22" at S18 (forgetting the S15 token pair) in CLAUDE/PAD/README and stayed "21" (the pre-S15 list) in SKILL §7 for eleven more sessions; PAD claimed "registration seeds three starter subjects" for ten sessions after ADR-015 shipped zero-subjects, "ships no Dockerfile" for ten after ADR-016 shipped one, "no reduced-motion yet" for sixteen after ADR-010 resolved it, and its tree listed a `src/hooks/` that never existed; SKILL §11 carried test counts thirteen sessions stale (106/194 vs 549) and §5 named the pre-S4 `backdrop-blur-sm` where the code ships `backdrop-blur-xs`; `vitest.config.ts`'s header comment still named seams ("clarify questions, plan sanitizer, check-in mapping", `scripts/smoke-test.sh`) of the ORIGINAL pre-clone scaffold app. The tell (same family as AP-73's): multiple layers carrying DIFFERENT stale values for the same quantity — 24 vs 22 vs 21 — while every session's "docs aligned" summary trusted the last session's prose instead of re-reading it | the guard: on every additive schema/config change, grep EVERY doc layer for the quantities it repeats (model counts, test counts, capture counts, class names) and re-derive them from the executable truth (the schema grep, the source grep, the config read) — prose is the repo's findings array: read it, don't trust the aggregate. The same number can be right in one claim and wrong in another (22 userId-Cascade relations is CORRECT; 22 total models is WRONG) — fix the claim, not the number | S29 documentation-drift repair (session-29) |
| AP-75 | MEDIUM | The S27/S28 rot classes were validated-once artifacts silently drifting; S30's class was the artifact that never existed: `pre15-preflight.mjs` measured outdated-count and its verdict read "GREEN — deps pinned by design, no action" while `bun audit` on the same tree reported 2 HIGH advisories (`braces` <=3.0.3 via the eslint dev chain — 3.0.3 IS the latest npm version, no patch exists; `deepmerge-ts` <8.0.0 pinned exactly 7.1.5 by `@prisma/config`) — two tools measuring DIFFERENT surfaces (outdated-ness vs security advisories) read together as "dependency hygiene covered" while the advisory surface had no probe at all | the guard: enumerate the security surfaces explicitly (runtime trace / dev tree / CLI tree) and give each a REACHABILITY verdict against the production standalone trace — a HIGH advisory in a dev-only chain is a documented risk, not an emergency, but the classification must be EVIDENCED (the `.next/standalone/node_modules` trace), never assumed; when a tool's verdict says "no action", ask what question it actually answered; pin the parser format with byte-exact fixtures so a tooling update that changes the output fails the pins and forces the update in the same change | S30 dependency-security audit (session-30) |
| AP-76 | MEDIUM | The S27/S28 rot classes were probes with rotten assertions; S30's was the surface with no probe; S31's is the ENVIRONMENT PRECONDITION no probe verified: the browser-context audits trusted "the dev server is up" (`/api/health` 200) as "the dev server is MEASURABLE" — and the two are different things. A stale Turbopack `.next/dev` cache (an unclean kill mid-cache-write) put `/login` into a sustained full-page reload loop (17+ main-frame navigations per 15 s, React never hydrated) that SURVIVED a clean daemon restart — the S9 lesson's remedy was insufficient, only `rm -rf .next/dev` cleared it — and every audit then failed OPAQUELY: a 30 s Playwright click timeout whose log names the SYMPTOM (the disabled login button) instead of the CAUSE (the cache), an environment failure dressed as an app defect that a future session would "fix" in the wrong layer | the guard: verify the boot-stability precondition (navigation-stable + hydrated) BEFORE measuring anything against a dev server — `bun scripts/dev-server-preflight.mjs` — and make the precondition's failure LOUDER than the audits' failure: liveness ≠ stability ≠ hydration are three distinct server states with three distinct remedies (start the server / restart the daemon / clear `.next/dev`), and the probe must name WHICH ONE it found, never prescribe the cache clear for a dead server or the daemon restart for a stale cache | S31 dev-server boot-stability preflight (session-31) |
| AP-77 | MEDIUM | The S27/S28 rot classes were probes with rotten assertions; S30's was the surface with no probe; S31's was the environment precondition no probe verified; S32's is THE OPERATING PROCEDURE THAT EXISTED ONLY IN PROSE: sixteen standing audits whose correct invocation and interpretation was knowledge-in-the-operator's-head, transmitted through session narratives. The tell (three independent pieces): the SAME documented mistake recurred across three consecutive sessions (the security-audit double-run phantom — S29, S31, S65 — each time reading the spent limiter budget as "the limiter shape is wrong"); five of the sixteen envelope shapes were silently mis-parsed by a careful operator following the docs (forced-colors, print, focus-order, accent-dark-sweep, CWV carry NO top-level findings array — the real finding classes live nested, so a quick `(j.findings||[]).length` reads 0 on every one of them regardless of actual findings — an audit WITH a genuine finding would have been reported GREEN); and the ai-a11y-audit leaked a probe pair into the demo chat DB on EVERY run for sixteen sessions (the unroute-before-release order the S14 lesson already documented — the lesson was in AGENTS.md, prose did not prevent it; the leak surfaced as flashbulbs in the dark/accent sweeps through the designed user-bubble inversion) | the guard: when a procedure's correct execution depends on sequence + interpretation knowledge, encode it as ONE command with the interpretation in a unit-pinned seam — `bun scripts/standing-suite.mjs` + `src/lib/suite-verdict.ts`; prose lessons do not prevent operational mistakes, tooling does. A missing key on a known shape must fail LOUDLY (shape-error), never silently green — the anti-phantom guard is the difference between a tool and a trap. And probe scripts must clean their own rows (the ai-error-audit pattern): a leak compounds across every future run and surfaces as a phantom finding in OTHER audits | S32 standing-suite orchestrator (session-32) |
| AP-78 | MEDIUM | The S32 lesson (AP-77) encoded the audit suite's operating procedure; S33 found the SAME class one layer out — THE MANUAL VERIFICATION WALKTHROUGH. The mobile 390×844 walkthrough had been executed by hand and narrated in every session since S14 while nothing executable pinned what it verified: the per-session prose was the ONLY carrier of the mobile-navigation guarantee, and the light-mode mobile surface across all 20 views (identity heading, no horizontal overflow, drawer round-trip, console errors) appeared in NO standing audit — the e2e layer pinned desktop (1440×900) and the audit scripts pinned dark (6 views). The tell: a session brief that says "pay particular attention to the mobile navigation menu" was answered by a HAND-RUN walkthrough whose scope and assertions lived in the operator's head — and the first executable sweep immediately found a genuine 20-session-old mobile parity gap (the Notes stack had lost the identity heading the reference renders at 390px; the desktop h1 pin passed the whole time — the S16 mobile-only-gap class exactly) | the guard: when a manual walkthrough is part of a recurring verification, encode ITS assertions as a standing probe in the suite — `node scripts/mobile-sweep.mjs`, the suite's 16th stage, with the verdict interpretation in the unit-pinned `classifyMobileSweep` seam (mode-rot-guarded, viewport-asserted, per-view shape-strict). A walkthrough that cannot be run by the suite is a walkthrough a future session may skip, run differently, or silently shrink (the scope-drift class). And a two-pane view's mobile stack must re-render what its desktop pane carries — heading included | S33 mobile light-mode sweep (session-33) |
| AP-79 | MEDIUM | The S16 lesson taught that mobile-only gaps hide behind desktop pins; S33 encoded the 390×844 mobile walkthrough; S34 found the SAME class one band out — THE VIEWPORT CONTINUUM BETWEEN PINNED WIDTHS. The standing surface treated "mobile" as one width (390) and "desktop" as two (1280/1440) plus a single lg-pin (1024 — the sidebar appearance on Dashboard only), leaving the whole 391–1023px band un-probed: two live breakpoints (sm 640, md 768), the Timetable accordion→canvas layout swap at md, the multi-column grid transitions, and the drawer-only navigation territory (the sidebar is lg:flex — below 1024 the drawer is the only vehicle). Nothing executable measured ANY width in the band; a regression there would surface in no standing audit. This session's exploration validated the whole band clean (640/767/768/1023 × 20 views, findings 0) — the state was green, the guarantee was absent | the guard: when a surface is width-dependent, pin the BREAKPOINT widths where the structure swaps, not just the device-class endpoints — `node scripts/midband-sweep.mjs`, the suite's 17th stage, sweeping all 20 views at 768×1024 (the md breakpoint, the switchiest width in the band) through the drawer, with the verdict interpretation in the unit-pinned `classifyMidbandSweep` seam (mode-rot-guarded, viewport-asserted, per-view shape-strict, plus the chrome vehicle-contract class — a broken lg contract reads non-green). A viewport band between two pinned widths is a blind band | S34 mid-band light-mode sweep (session-34) |
| AP-80 | MEDIUM | The S16 lesson taught that mobile-only gaps hide behind desktop pins; S33 encoded the 390×844 portrait walkthrough; S34 pinned the width continuum between the pinned widths; S35 found the SAME class one AXIS out — THE HEIGHT. The standing surface pinned five viewports and every one was portrait-tall (390×844, 768×1024, 1280×800, 1440×900, 1024×800 — heights 800–1024); the phone-landscape class (844×390 — a real, common device class) had zero coverage, and the height-dependent structures were guaranteed by nothing: the drawer nav whose scroll is the ONLY path to links 8–20 at 390 height (measured live: scrollHeight 1068 vs clientHeight 301 — 20 reference-measured ~40px rows in a ~300px area), the fixed h-16 app bar covering 16% of a 390px viewport (vs 8% at the pinned desktop heights), the pt-* heading clearance under it, and four views' h-[calc(100vh-8rem)] panes rendering at 262px with Notes' min-h-[480px] guard switching the whole view to page-scroll | the guard: when a surface depends on BOTH viewport axes (fixed chrome, viewport-percentage panes, scroll-required lists), pin the orientation extreme of the REAL device class (phone landscape), not just the portrait heights — `node scripts/landscape-sweep.mjs`, the suite's 18th stage, sweeping all 20 views at 844×390 through the drawer with the per-view heading-clearance pin (the heading's top ≥ the 64px bar — a pt regression would hide the heading under the glass bar while every portrait probe stayed green) and the drawerNavScrollable short-viewport contract (a non-scrolling nav at 390 height means the drawer geometry changed — links beyond the fold unreachable), verdict interpretation in the unit-pinned `classifyLandscapeSweep` seam. An axis never varied is an axis never verified | S35 phone-landscape short-viewport sweep (session-35) |
| AP-81 | MEDIUM | The S16 lesson taught that mobile-only gaps hide behind desktop pins; S33 encoded the light mobile walkthrough; S34 pinned the width continuum; S35 pinned the height axis; S36 found the SAME class one axis out — THE MODE. The standing surface varied width and height but pinned LIGHT at every mobile viewport: dark × mobile was covered for 6 of 20 views (accent-dark-sweep's mobile pass), 14 views had never been rendered in dark at the stacked mobile layout by any standing audit, and every light mobile sweep is mode-rot-guarded by construction — the dark: variants on the mobile-only structures (the stacked panes' borders, the app bar's shadow, the drawer's dark:bg-slate-950 panel) are superset-only code paths guaranteed by nothing. Dark mode is the clone's SUPERSET feature (the reference's own Dark/System options are a measured Base44 no-op — S10-1), so its correctness at the most common real-world dark usage (phone, portrait, at night) is a superset-quality contract | the guard: when a surface is theme-dependent, pin the MODE × viewport combo of the real usage class, not just the light mode at every width — `node scripts/dark-mobile-sweep.mjs`, the suite's 19th stage, sweeping all 20 views at 390×844 through the drawer IN DARK MODE (PATCHed through the settings API — the real lifecycle) with the S33/S35 structural family + the dark-sweep detector family (flashbulb/unreadable) extended to the mobile chrome + the drawer's own dark rendering; the dark detections counted INDEPENDENTLY of the findings array in the unit-pinned `classifyDarkMobileSweep` seam. A mode never varied at a viewport is a blind combo | S36 dark-mode mobile sweep (session-36) |
| AP-82 | MEDIUM | The S16 lesson taught that mobile-only gaps hide behind desktop pins; S33 encoded the light mobile walkthrough; S34 pinned the width continuum; S35 the height axis; S36 the mode axis; S37 found the SAME class one dimension out — THE ACCENT. The standing surface varied mode and viewport but pinned VIOLET at every light combo: the accent-dark-sweep varies the accent ONLY in dark (its own name is the blind spot), and the only light × non-violet rendering in any standing artifact was one desktop calculator view — the accent-dependent mobile structures (the drawer's active tint, the app bar brand, the CTA faces) are superset-only code paths (the reference's accent picker saves but never re-themes — re-verified S3) guaranteed by nothing in light | the guard: when a surface is accent-dependent, vary the accent AT THE MODE the users actually see — light is the resting mode; `node scripts/accent-light-sweep.mjs`, the suite's 20th stage, sweeping all 7 accents × 20 views at 390×844 in LIGHT mode (PATCHed through the settings API — the real lifecycle, self-verified on `<html data-accent>`) with the identity family + the light contrast detectors + the drawer per accent; the ALL-ACCENTS guard at the unit-pinned `classifyAccentLightSweep` seam (a missing accent is a shape-error, never green-by-omission). An accent never varied in light is a blind half of the theme space | S37 accent × light sweep (session-37) |
| AP-83 | MEDIUM | The S37 lesson pinned the ACCENT × LIGHT half; the accent × DARK × MOBILE combo remained 6-of-20 — the accent-dark-sweep's own mobile pass (MOBILE_VIEWS) covered Dashboard/MyDay/Timetable/Tasks/Settings/Calendar only, so 14 views had NEVER been rendered in dark × accent at the stacked mobile layout by any standing audit; AND the envelope's omission-means-clean recording (only non-clean views recorded) meant the seam could not distinguish "clean because measured" from "clean because never rendered" — a MOBILE_VIEWS shrink would read green-by-omission | the guard: an audit whose envelope cannot prove its own coverage cannot be green — every view recorded EXPLICITLY on both surfaces (clean views carry empty detector arrays), the per-accent `applied` self-verified readings + `mode` + `mobileViewport` ride the envelope, and the ALL-ACCENTS + ALL-VIEWS + drawer-present guards at the rebuilt `classifyAccentDarkSweep` seam make every silently-skipped dimension a LOUD shape-error; the accent-dark-sweep's mobile pass now sweeps all 20 views per accent at 390×844 with the scrollWidth overflow class, and the drawer-open failure is a FINDING, never a swallow | S38 accent × dark mobile 20-view matrix (session-38) |
| AP-84 | MEDIUM | The theme-space matrix (mode × accent × viewport) was declared FULLY swept after S38 — but the NAVIGATION INTERACTION had never been varied: the accent sweeps (S37 light, S38 dark) navigate by DIRECT GOTO, so the drawer's active-link accent tint was only ever read on the DASHBOARD link (once per accent); the active tint on a NON-Dashboard view, applied through the real navigation lifecycle (click a link → aria-current moves → the `.sf-nav-active` 10%-alpha gradient re-tints the NEW link), was verified at ZERO views, ZERO accents, in either mode — and the mid-band 768×1024 × accent cell was itself zero-coverage (midband-sweep is light+violet only) | the guard: an interaction never varied is an interaction never verified — the S39 accent-midband-sweep navigates all 20 views THROUGH THE DRAWER per accent at 768×1024, records the per-view interaction evidence (`activeLabel` MUST equal the view's own label — the active state follows the navigation; `activeTint` MUST read a gradient — "none" is the S8 no-var rot class, a FINDING at the seam), and the drawer record per accent reads the tint on the FINAL navigated view; when a state machine's visual output depends on WHICH node is active (not just that a node renders clean), sweeping renderings is not enough — the TRANSITION itself must be executed and recorded per variable dimension | S39 accent × mid-band drawer-navigation sweep (session-39) |
| AP-85 | MEDIUM | The S37+ big-envelope probes (accent-light ~150KB, accent-midband ~130KB) ended with `console.log(bigJson)` followed by a bare `process.exit(code)` — on a PIPE the write is ASYNC, and the exit can terminate the process before the write fully flushed: the S39 validation run caught accent-light TRUNCATED at 146176 bytes (mid-string, inside a detector entry) with the probe SUCCEEDED (findings 0) — the runner read a false "stdout did not parse" (22/23). The race is load-dependent and nondeterministic: the same probe parsed full-size in the arrival suite hours earlier, and every S37/S38 suite run before it — a latent coin flip in the harness for 7 sessions | the guard: a probe that prints a big envelope must ride the flush callback — compute the exit code FIRST, then `process.stdout.write(json + "\n", () => process.exit(exitCode))` (the callback fires only after every prior byte reached the pipe; the exit can never cut the envelope). Any future probe whose envelope can exceed the 64KB pipe buffer follows the same pattern; the catch-path `process.exit(1)`s are safe (empty stdout, cosmetic stderr) | S39-F the stdout-flush race (session-39) |
| AP-86 | MEDIUM | The S39 accent-midband-sweep closed the accent × mid-band cell and proved the drawer's active-link tint follows the navigation — at 768×1024 only; the landscape 844×390 sibling remained ZERO-coverage at every accent (landscape-sweep is light+violet only; the accent sweeps never visit 844×390), and the S35 short-viewport contracts (the heading clearance under the fixed 64px bar, the drawer nav whose scroll is the ONLY path to links 8–20 at 390 height) had never been exercised at a non-violet accent | the guard: a contract proven at one viewport is not proven at another — the height-dependent structures ride their own vehicle contract, so each new combo cell must be swept with the family's OWN contracts folded in (the S40 accent-landscape-sweep re-measures drawerNavScrollable per accent and carries headingClearance on every per-view record, alongside the S39 interaction evidence) | S40 accent × landscape drawer-navigation sweep (session-40) |
| AP-87 | MEDIUM | The S39/S40 drawer-vehicle interaction proofs proved the active-link accent tint follows the navigation — at 768×1024 and 844×390 only; the SIDEBAR (the desktop vehicle, the surface the reference's desktop users actually navigate with) had its tint verified at ZERO views, ZERO accents, in EITHER mode (the e2e pins read the tint on the Dashboard link only, violet only; accent-dark's desktop pass navigates by direct goto and never reads it), and the desktop 1280×800 × light × accent cell was ZERO-coverage besides | the guard: a vehicle never varied is a vehicle never verified — when a visual output depends on WHICH navigation vehicle carries the state, each vehicle owns its own interaction contract; a new vehicle cell must be swept with the vehicle's OWN contracts folded in (the S41 accent-desktop-sweep asserts the INVERTED chrome contract [sidebarVisible true + hamburgerVisible false], re-measures the sidebar-own nav scroll per accent [scrollHeight 1068 vs clientHeight 534 at 800 height], and reads the tint DIRECTLY per view — the sidebar is always in the DOM, no next-open indirection) | S41 desktop light-accent sidebar-navigation sweep (session-41) |
| AP-88 | MEDIUM | The theme-space matrix was declared fully swept after S41 — but every proof ran at SEED volume (tens of rows), and the S13 data-volume audit (the only standing probe at 300+ rows) runs LIGHT + VIOLET only (zero theme references); the densest renderings (300 task rows / the 250-event terminal panel / the 200-note list) had never carried a theme variation, the volume budgets (long tasks, click latency, payload bounds) had never been measured under a theme variation, and the SIDEBAR's active-link tint had never been read through the navigation lifecycle in DARK mode at any volume | the guard: a contract proven at seed volume is not proven at volume — density multiplies the surfaces the theme touches (a contrast defect that fires once per row is invisible at seed and systematic at volume), so each cross-axis cell (volume × mode × accent) needs its own sweep with BOTH families' contracts folded in (the S42 accent-volume-sweep COUNT-VERIFIES the insert through Prisma before measuring — a sweep that silently measured seed volume must never run — and carries the S13 budgets + the S38 dark detectors + the S41 interaction evidence in one envelope; the volume × light family stays the documented bracketed non-gap) | S42 data-volume × dark × accent stress (session-42) |
| AP-89 | MEDIUM | The S42 cross-axis proof closed the DARK half of the volume × theme cell and the light half stayed a documented bracketed non-gap — but the two halves are NOT interchangeable: the light canvas carries its own exemption families (the calendar adjacent-month slate-300 days + the yellow-500 priority pills are the reference's own design in LIGHT and re-theme in dark, so the dark seam exempts the CTA-face ONLY), the flashbulb class exists ONLY in dark (in light, light surfaces are by-design), and the rendering paths differ (white cards on the light canvas gradient vs the dark surface inversion) — so a mode half swept does not transfer its proof to the sibling mode | the guard: each mode half of a cross-axis cell needs its own sweep with its OWN doctrine folded in (the S43 accent-volume-light-sweep runs the LIGHT checker with the THREE signature-strict light exemptions, NO flashbulb class, and the same COUNT-verified volume profile — the mode rot guard INVERTED at the seam: an envelope with mode=dark fed to the light seam reads NON-green, and vice versa) | S43 data-volume × light × accent stress (session-43) |
| AP-90 | MEDIUM | The S43 light probe's exploration crashed at its own chrome precondition (run 1: the `!html.dark` mode gate — TRUE at first paint in light mode, BEFORE hydration + the auth gate mount the shell) and its suite integration run crashed mid-sweep (run 2: the `data-accent === accent` gate — the theme boot script applies the CACHED accent pre-hydration, so the wait passed at first paint while the aside was not yet in the DOM; the immediate nav-geometry evaluate read `aside nav` as null). Both crashes are the SAME class: a wait condition satisfiable PRE-MOUNT is not a gate for POST-MOUNT reads — the dark probes never hit it only because their `html.dark` wait happens to coincide with the post-hydration theme lifecycle | the guard: every post-navigation wait that precedes a shell-DOM read must gate on a POST-MOUNT observable — the greeting heading (`main h1` — the S41 light-mode gate) for mode gates, and the shell presence itself (`!!document.querySelector("aside nav")`) folded into the accent gates; back-ported to the S41/S42 sidebar-vehicle siblings (the drawer-vehicle probes are safe by Playwright's actionable-click auto-waiting) | S43 data-volume × light × accent stress (session-43) |
| AP-91 | MEDIUM | A dark bg asserted as `rgba(76, 29, 149, 0.3)` came back `oklab(0.37963 ... / 0.3)` — the Tailwind v4 opacity-modifier form `dark:bg-sf-primary-soft-dark/30` on a @theme color emits `color-mix(in oklab, ...)`, and browsers serialize computed color-mix to oklab | the opacity-modifier trap has a THIRD face (after the lab() defaults and the unpinned-palette lab() reads): never ship `/NN` modifiers on theme colors for asserted surfaces — a raw `rgb(var(--x) / a)` dark branch inside a custom utility serializes as plain rgba. `sf-today-tint` is now the SINGLE today-tint contract: one utility whose light branch (violet-50 softest) and raw-rgb dark branch satisfy the dark-mode serialization pin, the forced-colors outline pin, AND the exact-token locator pin simultaneously | timetable today header (session-55) |
| AP-92 | LOW | A spec locator `[class*="bg-sf-primary-soft"]` matched the HIDDEN desktop today header (its dark variant carried the substring after the AP-91 class swap) and DOM order made the hidden element win `.first()` — the assertion timed out on an element that existed | spec locators that key on class substrings must upgrade to exact CSS class tokens (`div.bg-sf-primary-soft`) the moment two states can carry the same substring; an exact token cannot collide with a variant-prefixed sibling | theme-system mobile-chip locator (session-55) |
| AP-93 | HIGH | The suite's 11th loopback login 429'd — the login limiter counted EVERY POST (success included) toward the 10/IP bucket, but three specs document "successful logins RESET the IP limiter" as the product model | progressive throttling: `resetRateLimit("login:" + ip)` on successful credential verification — only FAILED attempts consume budget; a legitimate user's later sign-ins must never inherit an attacker's spent bucket | login route (session-55) |
| AP-94 | HIGH | Task-dialog creates/updates 400'd: dialogs send `""` for cleared optional IDs, and Prisma's `idField.nullish()` rejects the empty string before the `""`→null transform | every nullable ID field hardens with a union-based atom (`z.union([z.literal(""), idField.nullish()]).transform(...)`), so the empty string means null at the schema boundary | taskSchema and siblings (session-55 re-verify) |
| AP-95 | MEDIUM | Playwright's own server boot hung: a "killed" dev server still held :3000 — the actual process is `bun .next/standalone/server.js` (the repo start script), so `pkill -f "next start"` matches nothing | kill by PID or pattern-match the REAL process name; verify the port is actually free (`curl` 000) before letting the Playwright config boot its own server | session-55 |
| AP-96 | HIGH | The shell hydration marker fired on the LOADING commit — before the auth gate resolved — so nav-svg probes raced the sidebar's first render | the two-layer gate: a STATUS-GATED `data-app-hydrated` on `<html>` that fires only when the authed shell actually renders, plus feature-specific markers (`data-calc-kb`) for raw-interaction specs; naive `--sf-primary` gates satisfy themselves at first paint (the boot script sets it pre-hydration) | shell page.tsx + calculator.spec (session-55 re-verify) |
| AP-97 | HIGH | The RUM beacon NEVER fired in production: `document.cookie.includes("sf_session")` can never match — the session cookie is httpOnly, invisible to `document.cookie` — so the gate closed forever and every "green" s18 run was fed by other specs' POSTed batches | never gate client-side telemetry on an httpOnly cookie's JS visibility; the auth gating belongs at the MOUNT POINT (the shell renders the beacon only in its authed branch) | rum-beacon.tsx + s18 (session-56) |
| AP-98 | MEDIUM | One shared tint utility collapsed TWO different light pins: `sf-today-tint` (violet-50, the S8-E timetable header) also served the calendar cell whose spec pins violet-100 — the chunk that introduced it never re-ran the S8 family | when two surfaces share a dark branch but pin different light values, ship sibling utilities over the same token family (`sf-today-cell-tint` light `--sf-primary-empty`, shared raw-rgb dark); a tint change must re-run every spec family that pins any consumer | globals.css utilities + S8-C/S8-E (session-56) |
| AP-99 | HIGH | A fresh-clone re-verification contradicted the recorded final gates: committed SPECS survived the workspace resets while their implementation batch did not (the whole s17 family), and later hardening commits (the tint collapse, the S16 auth geometry) landed without re-running the chunks that pin their neighbors | the spec files are the authoritative pin source — after ANY reset, re-run the FULL suite from a fresh clone before trusting a "final gates" claim; a hardening commit's blast radius is the union of every spec that touches its surfaces | session-56 full sweep (301/301) |
| AP-100 | LOW | Two fixed sleeps raced cold starts: s18's 3.5s beacon sleep and the skip-link's 400ms focus read both failed as the FIRST tests on a fresh server (hydration trails the fixed wait), yet passed warm | replace fixed sleeps that precede server-derived reads with bounded polls on the PINNED condition (assertions unchanged — only the wait strategy hardens) | s18 + accessibility S12-B (session-56) |
| AP-101 | MEDIUM | Every gate was spec-driven for 60 sessions, yet the first real audit engine (Lighthouse on the production standalone) found five real a11y defects no spec, tsc, or review had seen: two contrast failures on reference-measured tokens, a heading-order skip, a prohibited aria-label, a missing main landmark | run a real audit tool (Lighthouse/axe) on the production bundle periodically — spec suites verify what they assert, not what they forgot; treat audit findings like spec failures (TDD pin first, then fix) | accessibility Family E + docs/lighthouse/ before-after pairs (session-61) |
| AP-102 | HIGH | A legitimate semantic fix (the auth surface gained its `<main>` landmark) silently broke FOUR specs: their post-login wait used `querySelector("main") !== null` as a proxy for "the authed shell mounted", the login page's own new main resolved it early, and the next goto raced the redirect into net::ERR_ABORTED — failing only in cold chunk runs, green solo, so it masqueraded as flake | spec waits must target semantically PRECISE markers (`main#main-content`, the shell's skip-link anchor), never ambiguous proxies a future legitimate fix can satisfy elsewhere; when a chunk-only failure passes solo, hunt for a changed DOM assumption before calling it flake | s16/s24/s25/s26 hardened waits (session-61) |
| AP-103 | HIGH | Lighthouse audited two surfaces for 61 sessions while the other 18 views were invisible to it (client-switched inside the single-route shell); the Lighthouse-equivalent axe sweep over ALL 20 views then found 35 violations in 17 views — the same defect classes as the Lighthouse findings, at 10x scale, plus one real functional bug (Calculator's two `<Tabs>` roots minted mismatched id families so every trigger's aria-controls named a never-rendered panel) | an audit engine must cover the app's REAL navigation surface: when views are client-switched, mirror the auditor's own rule table (Lighthouse's a11y category IS axe-core — copy its tags + rule overlay from the installed gatherer source) and run it per-view; keep one equivalence-anchor view that a real Lighthouse run already certified, so drift in the mirrored config is detectable | Family F sweep + remediation-plan Batch S (session-62) |
| AP-104 | MEDIUM | axe's label-content-name-mismatch kept failing after the accessible name was changed to "Clear (AC)" — the visible token was IN the name, yet the rule still fired | axe curates the name into tokens and STRIPS PARENTHETICALS before matching: "(AC)" is removed, so the visible token must survive curation — put it outside parens ("Clear: AC"); same rule family explains why the name must CONTAIN the exact visible text, and why dynamic visible labels ("All"/"Active") need dynamic accessible names | calculator-view keyButton + Family F (session-62) |
| AP-105 | HIGH | The greeting rendered "Good morning" at every hour for 63 sessions: both call sites fed greetingForHour the day-anchor `startOfDay(new Date())`, whose getHours() is always 0 — correct for the view's day-relative math, fatally wrong for its greeting; every test session ran in the UTC morning so the frozen bucket looked right, and no spec pinned the bucket at all | a day-anchor is the right input for DAY-relative logic and the wrong input for TIME-OF-DAY logic — greetings and clock-bucketed UI must read the live clock (`currentGreeting()`); pin time-dependent UI with `page.clock.setFixedTime` so the assertion is deterministic at any wall-clock hour, and make sure at least one pin exists for every wall-clock-derived string | greeting-clock.spec.ts (Family G) + currentGreeting unit pins incl. the startOfDay trap (session-63) |
| AP-106 | MEDIUM | The Events panel's CW label was computed as ISO 8601 (42 on Sun 2026-10-18) while the live reference rendered CW 43 — and stepping the reference's own carousel to Saturday showed CW 42, which pinned the convention to US week-of-year (Sunday-start, week 1 contains Jan 1); ISO only diverges across a Sunday, so 63 sessions of mid-week state never exposed it | when copying a reference COMPUTATION (week number, count, bucketing), probe the reference's own convention first — find two dates that discriminate the candidate rules and measure both; unit-pin the discriminating pair so a convention regression is caught in vitest, not by eye | referenceWeekNumber + the ref-measured pin pair (session-63) |
| AP-107 | HIGH | The Events day-group labels keyed "Today"/"Tomorrow" on the list INDEX (`window[0] = Today`) — correct only while the window never moves; the moment the day-focus carousel re-anchors the window to yesterday, index 0 is "Saturday, October 17" and the index rule mislabels every group (the reference renders the focused day's full-format heading, then "Today"/"Tomorrow" for the REAL today/tomorrow) | a relative label is a property of the DATE vs the real clock (`daysUntil(day, today)`), never of its POSITION in a rendered window — any list that can re-anchor, paginate, or scroll must derive relative labels from the clock, not the index; the same rule that AP-105 states for clock-bucketed strings applies to relative labels | S5-U1 re-anchor pin (session-64) |
| AP-108 | MEDIUM | A committed shape pin ("chevrons are ghost h-9 w-9, radius 8px") failed after the chevrons were moved into the reference's measured banner position — the probe showed the REFERENCE computes a 6px radius (`rounded-md`); the 8px expectation had been written against the clone's own `rounded-lg` drift, so the pin was guarding the defect | when a pin and the reference disagree, re-probe the reference and correct the PIN to the measured value with the justification in-place — a pin that encodes the clone's own drift converts "regression guard" into "drift enforcer"; pins inherit their authority from the measurement, and stale measurements must be re-measured, not re-enforced | S8-E radius pin (updated 8px→6px with the probe, session-64) |
| AP-109 | MEDIUM | The s64 write probe's cleanup hit a reference-side dangling record: deleting the probe subject cascade-removed its grade, but a second orphan grade survived (a dangling FK the reference UI never shows — reference counters kept a stale total and no UI delete path exists), and the base44 entity API was undocumented | when the reference UI has no path for an operation (or its residue blocks zero-residue verification), LEARN the API from the UI itself: intercept the app's own network call (route + method + body + headers — the base44 entity API is `/api/apps/{id}/entities/{Entity}` with a Bearer JWT from localStorage), then drive it directly; a reference account is STATEFUL — probe residue is ours to clean, and zero-residue verification (list-after-delete through the learned API) is part of the probe protocol, not an optional courtesy | `scripts/ref-api-learn-s65.mjs` + `ref-cleanup-final*-s65.mjs` (session-65) |
| AP-110 | MEDIUM | The s66 chunk-2 run failed its LAST test with `register failed: 429`: the register limiter is 10/IP/15 min, the suite spent S9's 2 + s17's 8 = the entire budget with ZERO headroom, and `reuseExistingServer: !CI` means a chunk can inherit a partially-spent bucket from a prior run's surviving server — solo re-runs pass (fresh/under-budget) while the full chunk fails at the boundary, the classic budget-not-bug signature | a shared time-windowed rate limiter is a SUITE-WIDE budget: census every consumer across all chunks (not just the failing file), design to ≤ budget−1 (deliberate headroom), document the census in the spec's design comment, and boot each chunk against a fresh server (pkill the stale one); when a boundary-only 429 appears, prove the limiter's true ceiling with a direct curl sequence against a fresh server before touching any test | s17-fresh-user.spec.ts design comment + the remediation-plan Batch W budget note (session-66) |
| AP-111 | MEDIUM | The s67 brand-header probe measured the reference's desktop brand title 16px in one run and 18px in the next — two runs of the SAME probe class disagreed because the query's unscoped `.pop()` picked between the reference's TWO brand nodes (`h1.text-lg` 18/28 in the sidebar, a `span` 16/24 in the hidden mobile app bar) non-deterministically across render states; pinning the first read would have enshrined a mis-measurement as a permanent pin | when two probes disagree, do not average, re-run, or pick the plausible value — dump EVERY candidate node (TreeWalker over text nodes) with computed styles + DOM path + class string, identify the element by PATH, and pin from that node; an unscoped text query over a page with repeated brand strings is ambiguous by construction | scripts/brand-node-dump-s67.mjs + the remediation-plan Batch X probe-agreement note (session-67) |
| AP-112 | MEDIUM | The s68 sweep's mobile probe reported drawers CLOSED on BOTH sites while both opened fine: the `.find()`/`.first()` visibility check matched the HIDDEN sidebar's link (display:none, width 0 — DOM order precedes the drawer), and a `header button, .fixed button` selector matched the hidden fixed aside's chevron before the visible fixed header; a second trap: the drawer overlays the app bar at the SAME y-range, so a y-threshold cannot separate the two brand nodes | visibility checks must scope to VISIBLE nodes (evaluateAll over rect width, not `.first()`); positional selectors must filter by rendered geometry, not DOM order; when two same-text nodes overlap in position, anchor to the UNIQUE sibling node (the drawer subtitle) instead of a coordinate range | scripts/ref-resweep-s68.mjs + the remediation-plan Batch Y AP-112 note (session-68) |
| AP-113 | HIGH | The s69 discriminator probe clicked the reference's own "Light" theme option and NOTHING changed — html.dark stayed set, Dark stayed selected, the body stayed black (the documented Base44 no-op means the reference account's MODE is frozen state); the Appearance card's black panel + violet-on-black labels were the account's dark-mode artifact, not a permanently-dark design, and measuring them as light-mode truth would have enshrined the no-op's broken rendering as the parity target | when the reference's own picker cannot flip a state, do not measure the confused rendering as design truth: classify each reading as mode artifact (bg-card tokens re-theme) vs hard structure (anatomy, geometry, radii, copy, vocabulary — mode-independent), pin the structure, and let the clone's own dark-mode contract own the mode-dependent values (dark: variants + the a11y floor — the labels the reference renders unreadable stay readable in the clone) | scripts/z-probe4-s69.mjs + the remediation-plan Batch Z settings note (session-69) |
| AP-114 | MEDIUM | The S4-O/S7-P/S8-Z zero-state pins failed against the SEEDED demo account — the seed ships exams, assignments, practice tests, and a study group, so the dashboard sections and those views never render their empty states in the shared storageState; the first S4-O draft also called test.use() inside the test body, which Playwright rejects | a zero-state pin needs a zero-data account: clearCookies() + the register/verify POST pair inline (the S17 pattern — test.use({ storageState: … }) is describe-level only), and the seed's data inventory is part of the pin's environment contract, not noise | tests/e2e/navigation.spec.ts S4-O + parity-session7 S7-P + parity-session8 S8-Z (session-69) |
| AP-115 | HIGH | The s70 cycle's two probes DISAGREED on the same dashboard action node (probe #1: anchor/16px/gray vs probe #2: button/12px/violet-600) and the standing Z12 pin ("22-emoji avatar list") was overturned by a scoped re-dump (the real count is 24 — the s69 scan filtered the whole document without visibility scoping and silently dropped ⭐ and ⚽). A text node's PARENT styles are not the visible text's styles: probe #3's full-path node dump (path + parentFs + parentColor) revealed the reference's anchor-wrapping-button anatomy that both earlier probes had half-read. Rule: when probes disagree — or when a pin encodes a probe reading — dump EVERY candidate node with its DOM path and parent chain, and scope every filtered scan to visible nodes (offsetParent !== null). One-element-deep reads and document-wide filters are both silent mis-measurement. |
| AP-116 | MEDIUM | The s71 cycle's first chunk-3 run reported 53 passed where the s70 baseline demanded 58 — the re-derived chunk map had taken the s70 transcript's compressed map line "chunk 3 = auth+s18–s26+greeting" at face value, but "auth" meant BOTH auth.spec.ts (6) AND auth-flows.spec.ts (5); the missing file covered 5 tests. A re-certification that silently under-covers is worse than a failure: it LOOKS green while 5 specs never ran | compressed map notation in a transcript is NOT a file census. Before running any re-derived chunk map, enumerate the spec directory (`ls tests/e2e/*.spec.ts`) and diff it against the map's file set — every spec file must appear exactly once; when a sum mismatches the baseline, trust the arithmetic and bisect the map (per-file --list counts), never the baseline | /home/z/my-project/scripts/e2e-chunk.sh + the remediation-plan cycle-22 note (session-71) |
| AP-117 | MEDIUM | The Batch-AB pin draft asserted `getByText("78%")` on the populated GradeTracker's Chemistry card and would strict-mode-violate at GREEN time: Chemistry has ONE seeded grade (78/100), so the card renders the SAME string in two roles (the big avg AND the Recent-Grades pill). The reference never hits this because its avg format is 1dp ("50.0%") while its pills are integer — the clone's integer convention (the measured Overall card) makes avg==pill collisions inherent for single-grade subjects | when a surface renders the same value in two roles, assert through a role hook (`data-testid="gt-subject-avg"`), never bare text; before pinning populated aggregates, check the SEED for coincidences (single-grade subjects, avg==grade); a RED run cannot catch this class — the failure only appears at GREEN when the surface finally renders | tests/e2e/parity-session5.spec.ts (S5-AB7) + scripts/capture-s73-populated.mjs |

---

## §10 Debugging Guide (every entry encountered live)

**Build/e2e ghosts:** e2e runs the **standalone build** — after ANY component
change run `bun run build` before `bun run test:e2e`, or you debug stale
chunks. Symptom: a spec fails on UI you just changed but the dev server
shows the fix.

**Wrong db file (`{"db":"down"}` on `/api/health`, or data "missing"):**
check which file actually exists (`ls db/`), then re-read §3. First stop for
any db weirdness: `bunx vitest run tests/db-path.test.ts`.

**Hydration race (click does nothing):** SSR HTML renders buttons before
React attaches handlers. Gate: `page.waitForFunction(() =>
document.documentElement.style.getPropertyValue("--sf-primary") !== "")` —
the theme store sets that inline var only post-hydration.

**Computed styles read empty in e2e:** the element went detached
(splash removal race) — wait for a hydrated-shell landmark (e.g.
`getByRole("navigation", { name: "Primary" })`) first.

**Hover styles don't apply while probing:** v4 wraps `hover:` in
`@media (hover: hover)` — touch-emulating browsers false-fail. Probe hover
in Playwright (desktop project), never via touch emulation.

**Parity drift suspicion:** measure BOTH apps' computed styles (agent-browser
`eval` + `getComputedStyle`), not screenshots. VLM reviews produce false
positives (e.g. "grey Sign-in button" that was the disabled state) — always
confirm against the DOM before changing tokens.

**Live verification commands:**
```bash
curl -s localhost:3000/api/health           # {"status":"ok","db":"up"}
bunx playwright test tests/e2e/navigation.spec.ts --project=chromium
bunx vitest run tests/db-path.test.ts       # the db contract, isolated
tail -40 dev.log                            # request traces + prisma queries
```

---

## §11 Pre-Ship Checklist

**Gate order (the ONLY gate — no CI exists):**
```bash
bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e
```
Current green state: lint ✓ · tsc ✓ · 834 unit ✓ · build ✓ · 299 e2e ✓ (1133 green).

**Full-suite chunk map** (one server-boot per chunk; the 10-min tool cap makes
one-shot full runs unreliable — six chunks, all green at the 2.0 update):
chrome+s14 104 · S5+calc+S6 46 · S7+S8+S9 79 · tasks/resilience/s16/s17 20 ·
auth+s18–s23 35 · s24–s26 18.

**Pre-deployment:** set a real `AUTH_SECRET` (`openssl rand -hex 32`); use an
ABSOLUTE `DATABASE_URL` (see `docs/DEPLOYMENT.md` §4); never ship `.env`,
`db/*.db`, `dev.log`, or SSH material (all gitignored — keep it that way).

**Post-deployment smoke:** `/api/health` → ok; `/` redirects to `/login`;
demo login reaches a seeded dashboard; a PascalCase deep link (`/Tasks`)
renders with the sidebar active state.

**Visual verification:** computed-style pins green in e2e (shadow, gradient,
radii, avatar, stat icons, clock chip, mobile app bar + drawer); spot-check
the sidebar geometry (260px / glass / 260px offset); mobile: content starts
at y=80, drawer open → navigate → auto-close.

**Security:** no user enumeration on auth errors; rate limiter active with the
progressive-throttling model — successful logins RESET the IP bucket (AP-93);
uploads capped ≤ 2 MiB; `z-ai-web-dev-sdk` absent from client bundles.

**Git:** Conventional Commits, `main` only, push via
`docs/ssh_git_wrapper_v3.py` (see `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`;
the wrapper verifies remote == local HEAD and shreds its key copy).

---

## §12 Lessons Learnt & How to Avoid Them

**Session 1 (the build):**
1. *Parity is a measurement discipline.* Computed styles beat eyeballs and
   VLMs; the reference's own DOM is the oracle (VLM false positives cost
   real time — session 2 re-learned this).
2. *Prisma's `file:` URL anchoring depends on HOW the env var reaches the
   CLI* — shell-provided vs `.env`-loaded resolve differently (AP-1/AP-2).
   Empirical two-variable experiments settle such questions decisively.
3. *Next dev pre-resolves relative SQLite URLs* — defensive correction in
   `db-path.ts` (existence-gated fallback) keeps every entry point on one
   file.
4. *The reference's broken bits are parity targets for layout, not
   behavior* — ship the a11y-correct superset.
5. *e2e against the production build catches what dev never shows* (the
   duplicate `=` key, the detached-splash race).

**Session 2 (the parity audit):**
6. *Verify the framework's actual default scale before pinning "shifts."*
   The radius bug (AP-3) was a plausible-sounding pattern-match from the
   shadow trap — `node_modules/tailwindcss/theme.css` was the executable
   truth.
7. *Order-dependent e2e flakes are hydration races until proven otherwise*
   (AP-4); the inline `--sf-*` var is a cheap, reliable post-hydration
   signal.
8. *Persisted test databases inherit old seeds* — when seed VALUES change,
   delete `db/e2e.db` (AP-7).
9. *Small tokens, big blast radius:* one `hsl()` approximation drifted a
   canvas stop (AP-5); write measured colors in exact sRGB.
10. *VLM verdicts need DOM cross-examination* — three of its four flags were
    false positives; two of its "GOOD" misses were real (radius, icons).

**Session 55 (the parity re-application + account flows + hardening):**

11. *One utility can serve three contracts* — `sf-today-tint` satisfies the
    dark rgb-serialization pin, the forced-colors outline pin, and the
    exact-token locator pin at once; inline arbitrary classes satisfied one
    and silently broke the other two (AP-91/92).
12. *Specs encode the product model, not just the UI* — the "successful
    logins reset the IP limiter" budget note was the limiter's missing
    behavior, not a test convenience (AP-93).
13. *Pin-fixing is TDD on already-built features* — the s24–s26 routes and
    cards existed; the specs failed on aria-labels, copy, a `<p>`-with-email
    strict-mode collision, and a missing intro line. Decode the exact pins,
    patch minimally, re-run the chunk.
14. *Display phantoms are real* — stdout/Read can eat bracket-h and
    bracket-m byte sequences and show a corrupted selector for the real one
    (the disk bytes are clean); verify with `od -c` before "fixing"
    corrupted-looking source.

---

## §13 Pitfalls to Avoid

- **Architecture:** don't create route folders per view (breaks the SPA +
  rewrites contract); don't bypass `mutations`/`data.ts` with ad-hoc fetches;
  don't import server-only modules client-side.
- **Database:** don't run raw `prisma db push` with repo-root `.env`; don't
  hardcode a url in the schema (breaks e2e isolation); don't touch
  resolution without updating `tests/db-path.test.ts` in the same commit.
- **Styling:** don't add margin children to `space-*` containers; don't
  re-pin the radius scale; don't use oklch-drifted v4 palette classes for
  parity surfaces; don't hardcode violet hexes in views (use `--sf-*`).
- **TypeScript:** `unknown` over `any`; no unused imports (lint gates it);
  Zod v4 `.max()` counts code points.
- **Testing:** don't add real logins to specs (rate limiter budget: ONE
  shared storageState); don't assert Radix `data-state="selected"`; don't
  reuse row titles across runs (db persists); don't run e2e without a fresh
  build; don't break the violet-restore cleanup in the theme spec.
- **Security:** never log or return stack traces (`errorResponse()` only);
  never trust payload shapes without their Zod schema; always scope Prisma
  queries by `userId`.

---

## §14 Best Practices

- **Organization:** views in `src/components/views/<name>-view.tsx` exporting
  `<Name>View`; chrome in `components/layout`; pure seams in `src/lib` with
  unit tests; `tests/` mirrors seams by concern, not path.
- **TypeScript:** `interface` for object shapes, `type` for unions
  (`ViewId`, `Accent`); `import type` for type-only imports; early returns.
- **React/Next:** `"use client"` at top; views orchestrate (no business
  math); keyed editors instead of effect-setState (see the notes-view
  refactor); `Link` + `preventDefault` + `navigate()` for SPA moves.
- **APIs:** thin route shells over the factory; Zod at every boundary;
  `{ error }` JSON envelope; ownership in the WHERE clause.
- **State:** three Zustand stores, selectors for reads, `mutations` for
  writes, refresh-touched-collections after each write.
- **Parity work:** measure both apps → write the failing e2e pin → fix →
  re-measure → document in `docs/remediation-plan.md`; update the trap list
  when a new engine difference is found.
- **Docs:** README (users) → AGENTS (agent quick-ref) → PAD (blueprint/ADRs)
  → this SKILL (distilled engineering knowledge). Update the right layer.

---

## §15 Coding Patterns (copy-pasteable, compile in-project)

**Add a CRUD entity (5 files, ~30 lines):**
1. Model in `prisma/schema.prisma` (`userId` + `createdAt`/`updatedAt`) →
   `bun run db:push`.
2. Zod `create`/`update` schemas in `src/lib/validation.ts`.
3. Delegate in `src/lib/server/entities.ts` (model, schemas, orderBy).
4. Route shells (collection + `[id]`) — 3 lines each (§7).
5. Client slice + `mutations` entries in `src/lib/data.ts`; render in a view.

**Hydration-safe e2e click:**
```ts
const hydrated = (page: Page) =>
  page.waitForFunction(
    () => document.documentElement.style.getPropertyValue("--sf-primary") !== "",
  );
await page.goto("/Settings");
await hydrated(page);
await page.getByRole("button", { name: "Teal accent" }).click();
```

**Accent-aware inline gradient (sRGB-exact, no oklab):**
```tsx
style={{ backgroundImage:
  "linear-gradient(to bottom right, rgb(var(--sf-primary-softest)), rgb(var(--sf-primary-softest-adjacent)))" }}
```

**Greeting buckets (reference fake-clock-probed):** morning 0–11,
afternoon 12–16, evening 17–23 — `greetingForHour` has NO "Good night"
branch. **Clock format:** `formatTime12h` renders a 2-digit hour
("03:43 AM") — used by the sidebar clock AND the mobile app bar.

**Initial-fallback avatar:** `UserAvatar` renders
`avatar || initialFor(userName, email)` — empty string means "reference
default state"; never re-introduce a default emoji.

**Computed-style parity pin (e2e):**
```ts
const card = page.locator("main .overflow-hidden.rounded-2xl").first();
await expect(card).toHaveCSS("border-radius", "16px");   // v3 = v4 here
```

**Zod-boundary route handler (factory equivalent, for special routes):**
```ts
const parsed = schema.safeParse(body);
if (!parsed.success) return errorResponse(400, "Invalid input");
const user = await requireUser();
await prisma.x.create({ data: { ...parsed.data, userId: user.id } });
```

---

## §16 Coding Anti-Patterns (don't → do)

- `any` → `unknown` + narrowing (strict mode is a gate).
- Bare `<Link href>` for SPA navigation → `Link` + `preventDefault` +
  `navigate(id)` (keeps store + URL in sync; hard loads lose session UI state).
- `bg-violet-500` in view code → `bg-sf-primary` / `rgb(var(--sf-primary))`
  (accent-aware; hardcodes break the theme system).
- `space-y-4` + `mt-2` children → `flex flex-col gap-4` (trap 4).
- `rounded-3xl` on cards → `rounded-2xl` / `.sf-card` (16px measured).
- `tailwind.config.js` → tokens in `globals.css` `@theme` (CSS-first).
- Effect-setState mirroring props → keyed child components (notes-view
  refactor pattern).
- `prisma db push` with `.env` → `bun run db:push` (inline env, §3).
- Client-side SDK imports → route-handler-only imports.
- New e2e login flows → reuse the shared storageState (rate limiter).

---

## §17 Responsive Breakpoint Reference

Tailwind v4 defaults (no custom breakpoints — verified):
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

| Region | Behavior |
|---|---|
| `< lg` (mobile) | FIXED `h-16` glass app bar (hamburger + brand + live clock), slide-in drawer (`z-50`, 288px), `pt-20` main padding (content y=80); stat grid `grid-cols-2` |
| `≥ lg` (desktop) | fixed 260px glass sidebar, `lg:ml-[260px]` main, `lg:p-8`, stat grid `lg:grid-cols-4`, content grids `lg:grid-cols-3` (Tasks 2/3 + Exams 1/3) |

The ONLY structural breakpoint is `lg` — the reference's own cut (measured:
no bottom tab bar, drawer-only mobile nav). Mobile QA viewport: 390×844.

---

## §18 Z-Index Layer Map

| Layer | z | Where |
|---|---|---|
| Mobile app bar / desktop sidebar | 40 | `mobile-chrome.tsx`, `sidebar.tsx` |
| Mobile drawer overlay | 50 | `mobile-chrome.tsx` |
| Dialog + overlay | 50 | `ui/dialog.tsx` |
| Dropdown menu | 50 | `ui/dropdown-menu.tsx` |
| Toasts | top of DOM tree, portal | `ui/toast.tsx` (rendered after main) |

Rule: new overlays start at 50; never stack above toasts except modals that
must block them.

---

## §19 Color Reference (Complete — violet/default accent)

Verified against `globals.css` + `theme.ts` at distillation time.

**Accent ramp (violet):** `--sf-primary` #8b5cf6 · `--sf-primary-strong`
#7c3aed · `--sf-primary-deep` #6d28d9 · `--sf-primary-soft` #f3e8ff ·
`--sf-primary-softest` #f5f3ff · foreground #ffffff. Other six accents in
`ACCENT_TOKENS` (all v3 50/100/500/600/700-level hexes; dark counterparts
provided).

**Pinned v3 palette (subset used):** slate-50 #f8fafc … slate-950 #020817
(full 50–950 ramp pinned in `@theme`); violet-100 #ede9fe, violet-800
#5b21b6, violet-900 #4c1d95.

**Surfaces:** card white / border #f1f5f9 / radius 16px; canvas gradient
(§4); sidebar `rgba(255,255,255,0.8)` + blur; dark mode slate-950 family +
soft-dark accent tokens.

**Measured reference specifics:** "View All" links violet-600 #7C3AED; Sign-in
button slate-900 rgb(15,23,42); clock time violet-700 rgb(109,40,217); clock
date violet-600 rgb(124,58,237); Google button white/bordered.

---

## §20 TypeScript Interface Reference (key shapes)

```ts
type ViewId = "dashboard" | "myday" | "tasks" | "calendar" | "events"
  | "timetable" | "assignments" | "exams" | "notes" | "flashcards"
  | "practicetests" | "studygroups" | "gradetracker" | "analytics"
  | "files" | "calculator" | "mathsolver" | "aiassistant"
  | "focustimer" | "settings";                       // src/lib/router.ts
type Accent = "violet" | "blue" | "green" | "orange" | "pink" | "red" | "teal";
type ThemeMode = "light" | "dark" | "system";         // src/lib/theme.ts
interface AccentToken { primary, primaryFg, soft, softDark, strong,
  strongDark, deep, softest, softestAdjacent, gradientTo, avatarFrom,
  avatarTo, emptyFrom, emptyTo: string }  // RGB triplets (14 CSS vars;
  gradientTo = adjacent-hue 600 for brand chips + CTA — indigo-600 for
  violet; avatarFrom/to = the lighter 400→adjacent-500 pair; emptyFrom/to
  = the 100-level pair for the empty-state block — all measured, S4-G)
interface EntityDelegate { model, createSchema, updateSchema, orderBy, ... }
```

Entity rows are camelCase mirrors of the Prisma models (e.g. `Task {
id, userId, title, notes?, listId?, important, done, dueDate?, createdAt,
updatedAt }`); the client `mutations` object exposes typed
`create*/update*/delete*` per entity; `ApiError` carries the server's
`{ error }` envelope for `toast.error()`.

---

## Appendix A — The Meticulous Approach (six-phase workflow)

1. **ANALYZE** — read affected files completely; reproduce failures before
   theorizing; prefer executable truth (configs, lockfiles, computed styles).
2. **PLAN** — sequential, individually verifiable steps; for parity work,
   list the measured tokens being matched.
3. **VALIDATE** — confirm the plan against acceptance criteria (and the live
   reference when parity is involved) before writing code.
4. **IMPLEMENT** — smallest safe diff; respect §13/§14; update touched tests
   in the same change.
5. **VERIFY** — full gate (`lint → typecheck → test → build → test:e2e`);
   browser-verify interactive changes — a green build is not evidence a page
   works.
6. **DELIVER** — atomic Conventional Commit; update the right doc layer;
   hand off honestly (verified / not verified / remaining).

## Appendix B — Quick Reference Card

| Need | Where |
|---|---|
| Commands + gate order | `AGENTS.md` (top table) |
| DATABASE_URL contract | §3 here; `prisma/schema.prisma` header; `tests/db-path.test.ts` |
| The 9 Tailwind traps | §4 here; `docs/Tailwind-V4-Validation-Report.md`; session-3/4 plans |
| Session-2 parity audit + non-gaps | `docs/remediation-plan.md` |
| View↔path map | `src/lib/router.ts` (unit-tested) |
| Accent tokens (7 accents) | `src/lib/theme.ts` `ACCENT_TOKENS` |
| CRUD factory + delegates | `src/lib/server/{http,entities}.ts` |
| Avatar default-state contract | `src/components/layout/user-avatar.tsx` |
| e2e parity pins | `tests/e2e/navigation.spec.ts` ("view chrome" describe) |
| Hydration gate pattern | `tests/e2e/calculator.spec.ts` (`hydrated`) |
| Push procedure | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` + `docs/ssh_git_wrapper_v3.py` |
| Screenshots (all 20 views) | `docs/screenshots/` |
| Demo account | `demo@studyflow.app` / `Demo1234!` |


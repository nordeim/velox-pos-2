# Worked Example — "StudyFlow" (AcademiaFlow) on Base44

A complete Phase-1 dossier produced by following this skill, kept as the
reference for what "done" looks like. Target:
`https://omni-study1.base44.app/` — a student study-planner SPA hosted on
the Base44 no-code platform. Everything below marked **Observed** was
captured live (accessibility snapshots, network inspection, API probes);
confidence labels follow the dossier convention.

> Credentials provenance: account supplied by the app owner for
> investigation (`sepnetflix2023@outlook.com`). **Rotation recommended**
> after use; credentials must never enter any clone repo.

## 1. Identity & authorization outcome

- Page title: `AcademiaFlow (Copy)`; in-app brand: **StudyFlow — "Your study
  companion"** (Observed: sidebar + `<title>`).
- Owner-authorized replication exercise; brand renamed in any clone.
- Auth wall: unauthenticated visits redirect to `/login?from_url=…`
  (Observed). Login offers Google OAuth + email/password + forgot-password
  + sign-up (Observed: login snapshot).

## 2. Platform & stack fingerprint

| Evidence | Finding | Confidence |
|---|---|---|
| API paths `/api/apps/{appId}/entities/{Entity}` | Base44 platform; appId `6969efea366cba53524cde3f` | Observed |
| `frontend-config.js` | `SDK_BACKEND_URL: https://base44.app`, platform URLs | Observed |
| Chunk names `assets/index-*.js`, `static/vendor-react-*` | Vite-built React SPA | Observed |
| Bundle grep counts | lucide-react ×98, recharts ×104, date-fns ×2 | Observed |
| DOM: `svg.lucide`, `--tw-` CSS rules | Tailwind CSS + Lucide icons | Observed |
| `:root` style | `--primary: 139 92 246` (Tailwind-v4 RGB triplet → `#8B5CF6`) | Observed |
| Runtime probe (recharts/radix globals) | Recharts bundled but not global; no Radix attrs on sampled pages | Observed |
| Assets | Logo served from Supabase public bucket | Observed |

Auth mechanism (Observed): JWT in `localStorage.token` /
`base44_access_token`; API calls carry `Authorization: Bearer <JWT>`;
entity endpoints reject unauthenticated calls with 403 `auth_required`.

## 3. Site map (20 routes, all visited — Observed)

| Route | Purpose | Primary actions observed |
|---|---|---|
| `/Dashboard` | Home: greeting + date, 4 KPI cards (Today's Progress 0/0, Pending Tasks, Due Soon, Focus Time 0h), Today's Tasks + Upcoming Exams/Assignments panels with empty states | Start My Day, View All, All |
| `/MyDay` | Daily focus: greeting, quick-add task box | Add task for today, More Options |
| `/Tasks` | Two-pane task manager: left filter column (All Tasks, Important, MY LISTS) | Add Task → modal: name, My Day/Important toggles, due date, subject, repeat, subtasks, notes |
| `/Calendar` | Month grid + Timeline toggle | Day cells, prev/next |
| `/Events` | Events & Reminders grouped by day (Today → +7d) | New Event |
| `/Timetable` | Weekly class schedule grid | Add Class |
| `/Assignments` | Assignment list with progress | Add Assignment |
| `/Exams` | Exam list | Add Exam |
| `/Notes` | Two-pane notes (list + editor) | New Note |
| `/Flashcards` | Deck list + study mode | Create Deck |
| `/PracticeTests` | Test builder/runner | Create Test |
| `/StudyGroups` | Groups (list + detail pane) | Create Group |
| `/GradeTracker` | Grades with aggregate | Add Grade |
| `/Analytics` | 4 KPI cards + Recharts bar charts "Task Activity (Last 7 Days)", "Focus Time (Last 7 Days)" | (read-only) |
| `/Files` | Folder-based file manager | New Folder |
| `/Calculator` | Tabbed suite: Basic, Scientific, GPA Calculator, Unit Converter | (tabs) |
| `/MathSolver` | Upload image → solve | Upload Image |
| `/AIAssistant` | Chat with quick prompts: Explain Concept, Study Tips, Summarize, Solve Problem, Translate, Essay Ideas | Send |
| `/FocusTimer` | Pomodoro engine: Focus/Short Break/Long Break; presets "Pomodoro 25/5/15", "Deep Work 50/10/30"; subject selector | Start/pause |
| `/Settings` | Tabs: Appearance, Profile, Subjects, Holidays, Notifications | Theme, profile fields |

Global chrome (Observed): fixed sidebar with logo chip, collapse chevron,
20 nav links with icons, live clock card (time + "Thu, Oct 15"), user chip
(avatar initial, name, truncated email).

## 4. Entity schemas

Entities seen in network traffic (Observed): `User`, `Task`, `Subject`,
`Assignment`, `Exam`, `Event`, `FocusSession`. Implied by UI but not
traffic-observed during the session: `Note`, flashcard deck/card, practice
test, study group, grade, file/folder, holiday, task list — these were
**Unknown** at dossier time (no writes performed); forms are the fallback
evidence.

**User** (canonical from `GET /entities/User/me` — Observed):

```json
{ "role": "user", "theme": "dark", "accent_color": "#8b5cf6",
  "avatar": "🎓", "notifications_enabled": true, "study_goal_hours": 4,
  "grade_level": "9th Grade", "school_name": "Lincoln High",
  "id": "…", "email": "…", "full_name": "…",
  "created_date": "…", "updated_date": "…" }
```

**Task** (canonical from create→delete probe — Observed):

```json
{ "title": "…", "description": null, "list_id": null,
  "due_date": null, "due_time": null, "completed": false,
  "completed_date": null, "priority": "none", "tags": [],
  "subtasks": [], "repeat": "none", "reminder": null, "notes": "…",
  "is_my_day": false, "is_important": false, "order": 0,
  "id": "…", "created_date": "…", "updated_date": "…",
  "created_by_id": "…", "created_by": "…" }
```

Note the form-vs-server gap the probe exposed: the create modal showed
`title/notes/subtasks/…` but not `priority/tags/order/description` —
server defaults exist for fields the UI hides. This is exactly why UI-only
schema guessing fails, and why the write-path probe is in the playbook.

## 5. Visual system (Observed)

Evidence screenshots: `assets/final-dashboard.png` (dashboard KPI cards +
sidebar chrome), `assets/analytics.png` (KPI cards + Recharts charts),
`assets/task-modal.png` (create-task modal field inventory).

- Primary `#8B5CF6` (violet-500); light-mode canvas `#F7F7F8`-range grays;
  white cards, soft borders, large radius (~16px); KPI cards pair a pastel
  icon-chip (violet/blue/orange/red) with a big number + caption.
- Dark mode exists (user record `theme: "dark"`); palette toggle in
  Settings → Appearance.
- Type: system sans stack (`ui-sans-serif, system-ui, …`); emoji as
  functional icons (👋 greeting, 🎓 avatar, subject icons).
- Empty-state pattern: centered icon chip + bold title + muted subtitle +
  primary CTA (e.g. "No tasks yet / Create your first task to get started /
  Create Task").

## 6. Golden flows (Observed transcripts)

1. **Login**: fill email+password → Sign in → land `/` with sidebar +
   dashboard; token present in localStorage.
2. **Read dashboard (empty account)**: 4 KPI zeros + three panels with
   empty states. (Populated-state numbers inferred from labels — Unknown.)
3. **Task write path**: modal fields → POST `/entities/Task` → canonical
   schema response → DELETE → `200`. Cleaned up (no residue).
4. **Settings surface**: tab list captured; per-tab field inventory
   partially Unknown (only Appearance tab exercised).

## 7. Evidence ledger (excerpt)

| Fact | Confidence | Source |
|---|---|---|
| 20 routes and their actions | Observed | a11y snapshots per route |
| Task schema (18 fields) | Observed | create→delete probe transcript |
| User schema | Observed | `User/me` response |
| Auth = Bearer JWT in localStorage | Observed | storage + request headers |
| React+Vite+Tailwind+Lucide+Recharts | Observed | bundle grep + DOM probes |
| Populated dashboard values | Unknown | account empty during audit |
| Note/Flashcard/etc. schemas | Unknown | no traffic during session |
| Repeat values enum (`none`, …) | Unknown | UI shows control, enum not exercised |

## 8. Clone implications (Phase-2 seed)

- Stack decision: target is React SPA → match with **React + Vite +
  TypeScript strict + Tailwind** (token-for-token `#8B5CF6` primary),
  Lucide icons, Recharts for the two 7-day bar charts.
- Backend: entity-CRUD platform → Prisma + SQLite (single-user mode) or
  Postgres (multi-user), with a repository layer mirroring the 7+
  observed entities; JWT auth with hashed passwords.
- Build order: shell + theme → auth → Tasks (primary loop) → Dashboard/
  MyDay (read models) → Assignments/Exams/Events/Timetable → Notes/
  Flashcards/Grades → Analytics/Calculator/Files → AI/Timer/Solver
  (provider-stubbed) → Settings → polish.
- Deviations to record: brand renamed; logo/avatar art replaced; AI
  endpoints behind env-configured provider.

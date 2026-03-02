<div align="center">

# MC-Todo

Task management, calendar visualization, productivity analytics, and a per-task playground — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=fff)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=fff)](https://jestjs.io/)

</div>

---

## Design System & Architecture

```mermaid
graph TD
    subgraph DS["Design System"]
        BG["Background\n#18181b"]
        ACC["Accent\n#f97316 Orange"]
        UI["UI\nWhite"]
        PRIN["Flat · Geometric · No glassmorphism\nZero external runtime dependencies"]
    end

    subgraph ROUTES["Routes"]
        R1["/ — Task Management"]
        R2["/calendar — Calendar View"]
        R3["/dashboard — Analytics"]
        R4["/playground/:id — Playground"]
    end

    subgraph STATE["Shared State — localStorage"]
        TM["useTaskManager\nCRUD · archive · stats"]
        UP["useProjects\nCRUD · date bounds"]
        UC["useCategories\nCRUD · color rotation"]
    end

    subgraph FEAT["Features"]
        F1["Tasks + Projects\nColored cards · Indented child tasks\nCollapsible · Drag-to-reorder subtasks"]
        F2["Calendar Overlays\nProject color bands · Lane stacking\nDrag & resize constrained to project bounds"]
        F3["Analytics\nEisenhower matrix · Donut · Bar charts\nUpcoming deadlines · Top suggestions"]
        F4["Canvas Playground\nNote · Todo · Flowchart blocks\nInfinite pan & zoom"]
    end

    R1 --> TM & UP & UC
    R2 --> UP
    R3 --> TM & UC
    R4 --> TM

    UP -- "date constraints" --> R2
    TM <-- "child tasks" --> UP

    TM & UP & UC --> LS[(localStorage)]

    R1 --- F1
    R2 --- F2
    R3 --- F3
    R4 --- F4
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### Task Management `/`
- **Projects** — color-coded, time-bounded containers with collapsible indented child tasks; inline add/edit/delete
- **Tasks** — title, details, priority (0–10), status, due date range, reference links, subtasks
- **Date Picker** — single-click or drag to select a range; highlights project time frame and dims out-of-bounds days when a project is selected
- **Auto-Archive** — completed tasks archived after 3 / 7 / 14 / 30 days; restore or bulk-delete
- **Search & Filter** — full-text, status (6 options), and category filters with active-filter counter
- **View Modes** — Priority list (table) and Category board (Kanban), persisted preference
- **Keyboard Shortcuts** — `N` new task · `/` focus search

### Calendar View `/calendar`
- **Project Overlays** — translucent color bands spanning each project's date range, rendered behind events
- **Drag & Drop** — reschedule events with live preview; project tasks snap back if dropped outside project bounds
- **Edge Resize** — extend or shrink multi-day events; clamped to project bounds for project tasks
- **Smart Stacking** — lane allocation prevents event collisions; collapses to lines when dense
- **Quick Create** — double-click any cell to open the task modal with that date pre-filled
- **Trash Zone** — drag any event to delete it

### Dashboard `/dashboard`
- Key metrics — total, completed %, overdue, in-progress
- Eisenhower-style scatter plot (urgency × importance), donut chart, category & priority bar charts
- Upcoming deadlines, top 3 suggested tasks, inline category editor

### Playground `/playground/:taskId`
- Infinite canvas with pan and zoom (0.25×–2×, cursor-centered)
- **Note** — rich-text editor with formatting toolbar and 6 color themes
- **Todo List** — checklist with drag-to-reorder and completion indicator
- **Flowchart** — node/edge diagram with 3 shapes, 4 edge styles, labels, and auto port selection
- All blocks: drag, resize, z-index, delete; debounced auto-save per task

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Testing | Jest 30 — 28 test files · 395 tests |
| State | Custom hooks + `localStorage` via `useSyncExternalStore` |

---

## Project Structure

```
app/
├── components/
│   ├── task/       # TaskModal · TaskList · TaskItem · DatePicker
│   │               # PriorityListView · CategoryBoardView
│   │               # ProjectItem · ProjectModal · SubtaskList
│   ├── calendar/   # CalendarGrid · CalendarEvent · ProjectOverlay
│   │               # CalendarEventPopover · DragPreviewEvent · TrashDropZone
│   ├── dashboard/  # StatCard · Charts · TimeManagementMatrix
│   │               # UpcomingDeadlines · CategoryEditModal
│   ├── playground/ # PlaygroundCanvas · NoteBlock · TodoListBlock · FlowchartBlock
│   └── ui/         # Button · Dropdown · Input · Modal · Slider · Textarea
├── hooks/          # useTaskManager · useProjects · useCategories
│                   # useEventDrag · useEventResize · useDashboardStats
│                   # useLocalStorage · useTaskFilter · usePlayground
├── lib/            # utils · calendarUtils · dashboardUtils
├── types/          # task.ts · calendar.ts · playground.ts
└── __tests__/      # Jest test suite
```

---

## License

Private project.

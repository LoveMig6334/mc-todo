<div align="center">

# MC-Todo

A modern, high-performance To-Do List application built with **Next.js**.\
Task management, calendar visualization, productivity analytics, and a per-task playground — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=fff)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=fff)](https://jestjs.io/)

</div>

---

## About

MC-Todo is designed with a **"Dark Modern"** aesthetic:

- Minimalist, geometric design with solid colors (Flat Design)
- Deep dark grey background with white UI elements
- Orange as the primary accent color
- Clean, text-centric interface

> Zero external runtime dependencies — custom date math, custom drag handling, no third-party UI libraries.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mc-todo.git
cd mc-todo

# Install dependencies
npm install
```

### Usage

```bash
# Start the development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

### Task Management

> **Route:** `/`

| Feature | Description |
|---------|-------------|
| CRUD Operations | Create, edit, and delete tasks with title, details, priority (0–10), status, due dates, and reference links |
| Projects | Group tasks into time-bounded, color-coded projects; project cards appear above standalone tasks with indented child tasks, expand/collapse, and inline add/edit/delete |
| Categories | Custom user-manageable categories with color coding |
| View Modes | Priority list (table) and category board (Kanban-style) with persistent preference |
| Date Picker | Single-click for a day, click-and-hold to drag a date range; shows project time frame overlay when a task belongs to a project |
| Subtasks | Add, reorder (drag), complete, and delete subtasks; each subtask has its own status, priority, and reference link |
| Reference Links | Attach URLs to tasks and individual subtasks |
| Search & Filter | Full-text search (title + details), status filter (6 options), category filter; active-filter counter with clear-all |
| Keyboard Shortcuts | `N` — new task · `/` — focus search |
| Auto-Archive | Completed tasks are automatically archived after a configurable threshold (3 / 7 / 14 / 30 days); restore or delete individually or in bulk |
| Greeting Banner | Time-based greeting with the current date and rotating productivity tips |
| Progress Bar | Visual completion percentage across all tasks |
| Persistence | All data stored locally via `localStorage` |

### Calendar View

> **Route:** `/calendar`

| Feature | Description |
|---------|-------------|
| Monthly Grid | English + Thai date display |
| Project Overlays | Translucent color bands spanning each project's date range; rendered behind task events |
| Drag & Drop | Drag events to reschedule; drag preview shows the new date range while dragging; project-task drags are constrained to the project's time frame |
| Edge Resizing | Drag the start or end edge of a multi-day event to extend or shrink its date range; constrained to project bounds for project tasks |
| Quick Create | Double-click any cell to open the task modal with that date prefilled |
| Smart Stacking | Lane allocation algorithm places overlapping events side-by-side without collision |
| Crowding Logic | Collapses to colored lines when cells are dense; hover to expand and see all events |
| Trash Drop Zone | Drag any event onto the trash zone to delete it |
| Event Popover | Hover an event to see a summary with quick edit and delete buttons |

### Dashboard Analytics

> **Route:** `/dashboard`

| Feature | Description |
|---------|-------------|
| Key Metrics | Total, completed (with %), overdue, and in-progress task counts |
| Category Breakdown | Horizontal stacked bar chart with per-category completion rates and a manage button |
| Priority Distribution | Vertical bar chart across four buckets: Low, Medium, High, Urgent |
| Status Overview | SVG donut chart for Pending, In Progress, Paused, and Needs Approval statuses |
| Upcoming Deadlines | Next 5 upcoming incomplete tasks, color-coded by urgency |
| Time Management Matrix | Eisenhower-style scatter plot — X-axis: Urgency (days left), Y-axis: Importance (priority); four color-coded quadrants (Q1 Do First, Q2 Schedule, Q3 Delegate, Q4 Eliminate); hover dots for task details |
| Top Suggested Tasks | Top 3 recommended tasks ranked by quadrant (Q1 → Q2) then priority |
| Category Editor | Add, rename, recolor, and delete categories without leaving the dashboard |

### Project Management

Projects are available across Task Management and Calendar View.

| Feature | Description |
|---------|-------------|
| Project CRUD | Create, edit, and delete projects with title, description, color (8 presets), and a date range |
| Visual Hierarchy | Projects render as full-width bordered cards above standalone tasks; child tasks are indented inside |
| Expand / Collapse | Toggle the project body to hide or reveal its tasks |
| Task Assignment | Assign tasks to a project via the Task modal's project dropdown, or use "Add task to project" from the project card |
| Date Validation | Task due dates are validated against the project's time frame; the date picker highlights in-project days and dims out-of-bounds days |
| Orphan Handling | Deleting a project unlinks all its child tasks (they become standalone) rather than deleting them |
| Calendar Overlays | Each project renders a translucent color band across its date range on the calendar |
| Drag/Resize Constraints | Task events belonging to a project cannot be dragged or resized outside the project's start/end bounds |

### Playground

> **Route:** `/playground/[taskId]`

A per-task interactive canvas workspace. Every task gets its own playground, persisted in `localStorage`.

| Feature | Description |
|---------|-------------|
| Canvas | Infinite panning (click-drag) and zooming (Ctrl/Cmd + scroll, 0.25×–2×); zoom is cursor-centered |
| Note Block | Rich-text note with editable title; formatting toolbar (Bold, Italic, Bullet List, Ordered List); 6 background color themes |
| Todo List Block | Inline checklist with add/remove items, checkbox completion, drag-to-reorder, completion progress indicator, and 6 color themes |
| Flowchart Block | Node/edge diagram builder — three node shapes (Rectangle, Diamond, Circle), straight and adaptive (curved) edge lines, four arrow directions (Forward, Backward, Both, None), edge labels, auto port selection, 6 color themes |
| Block System | All blocks support: drag to reposition, resize via handles, z-index management (bring to front), and deletion |
| Toolbar | Floating toolbar to add Note, Todo, and Flowchart blocks; zoom controls (fit, in, out, reset) |
| Persistence | All block data serialized to JSON per task; debounced auto-save on every change |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Testing | Jest 30 (28+ test files, 395+ tests) |
| State | Custom hooks + `localStorage` via `useSyncExternalStore` |

---

## Project Structure

```
mc-todo/
├── app/
│   ├── components/
│   │   ├── layout/        # FloatingNav
│   │   ├── task/          # TaskModal, TaskList, TaskItem, TaskCard,
│   │   │                  # DatePicker, CategoryBoardView, PriorityListView,
│   │   │                  # SubtaskList, ReferenceLinks, TaskFilterBar,
│   │   │                  # ArchivedTasksPanel, GreetingBanner, ProgressBar,
│   │   │                  # ProjectItem, ProjectModal
│   │   ├── calendar/      # CalendarGrid, CalendarDayCell, CalendarEvent,
│   │   │                  # CalendarHeader, CalendarEventPopover,
│   │   │                  # DragPreviewEvent, TrashDropZone, ProjectOverlay
│   │   ├── dashboard/     # StatCard, CategoryBarChart, PriorityBarChart,
│   │   │                  # StatusDonutChart, UpcomingDeadlines,
│   │   │                  # TimeManagementMatrix, TopSuggestedTasks,
│   │   │                  # CategoryEditModal
│   │   ├── playground/    # PlaygroundCanvas, PlaygroundToolbar,
│   │   │                  # NoteBlock, TodoListBlock, FlowchartBlock,
│   │   │                  # BlockWrapper
│   │   └── ui/            # Button, Dropdown, Input, Modal, ConfirmModal,
│   │                      # Slider, Textarea, ShortcutHint
│   ├── hooks/             # useTaskManager, useCategories, useLocalStorage,
│   │                      # useTaskFilter, useViewPreference, useKeyboardShortcuts,
│   │                      # useAutoArchive, useDashboardStats,
│   │                      # useCalendarGrid, useEventResize, useEventDrag,
│   │                      # usePlayground, useProjects
│   ├── lib/               # utils, calendarUtils, dashboardUtils
│   ├── types/             # task.ts, calendar.ts, playground.ts
│   ├── calendar/          # /calendar route
│   ├── dashboard/         # /dashboard route
│   ├── playground/[taskId]/ # /playground/[taskId] route
│   └── __tests__/         # Jest test suite
├── public/                # Static assets
├── CLAUDE.md              # Development knowledge base
└── README.md
```

---

## License

Private project.

<div align="center">

# MC-Todo

A modern, high-performance To-Do List application built with **Next.js**.\
Task management, calendar visualization, and productivity analytics — all in one place.

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
| CRUD Operations | Create, edit, and delete tasks with title, details, priority (0–10), due dates, and reference links |
| Categories | Custom user-manageable categories with color coding |
| View Modes | List, table, category board, and priority list |
| Date Picker | Single-click and drag-and-hold for date ranges |
| Subtasks | Inline status and priority cycling |
| Persistence | Data stored locally via `localStorage` |

### Calendar View

> **Route:** `/calendar`

| Feature | Description |
|---------|-------------|
| Monthly Grid | English + Thai date display |
| Drag & Drop | Event repositioning and edge-drag resizing |
| Quick Create | Double-click any cell to create a task |
| Smart Stacking | Lane allocation algorithm for overlapping events |
| Crowding Logic | Collapses to colored lines when cells are dense, with hover expand |

### Dashboard Analytics

> **Route:** `/dashboard`

| Feature | Description |
|---------|-------------|
| Key Metrics | Total, completed, and overdue task counts |
| Category Breakdown | Horizontal bar chart |
| Priority Distribution | Vertical bar chart |
| Status Overview | SVG donut chart |
| Upcoming Deadlines | Sorted deadline list |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Testing | Jest 30 (17 test files) |
| State | Custom hooks + `localStorage` via `useSyncExternalStore` |

---

## Project Structure

```
mc-todo/
├── app/
│   ├── components/
│   │   ├── layout/        # FloatingNav
│   │   ├── task/          # TaskModal, TaskList, TaskItem, TaskCard,
│   │   │                  # DatePicker, CategoryBoardView, PriorityListView
│   │   ├── calendar/      # CalendarGrid, CalendarDayCell, CalendarEvent,
│   │   │                  # CalendarHeader, DragPreviewEvent, TrashDropZone
│   │   ├── dashboard/     # StatCard, CategoryBarChart, PriorityBarChart,
│   │   │                  # StatusDonutChart, UpcomingDeadlines
│   │   └── ui/            # Button, Dropdown, Input, Modal, Slider, Textarea
│   ├── hooks/             # useTaskManager, useCategories, useLocalStorage,
│   │                      # useCalendarGrid, useEventResize, useEventDrag
│   ├── lib/               # utils, calendarUtils, dashboardUtils
│   ├── types/             # task.ts, calendar.ts
│   ├── calendar/          # /calendar route
│   ├── dashboard/         # /dashboard route
│   └── __tests__/         # Jest test suite
├── public/                # Static assets
├── CLAUDE.md              # Development knowledge base
└── README.md
```

---

## License

Private project.

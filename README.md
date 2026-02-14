# MC-Todo

A modern, high-performance To-Do List application built with Next.js. The app focuses on task management, calendar visualization, and productivity analytics.

## Project Overview

MC-Todo is designed with a **"Dark Modern"** aesthetic featuring:
- Minimalist, geometric design with solid colors (Flat Design)
- Deep dark grey background with white UI elements
- Orange as the primary accent color
- Clean, text-centric interface inspired by Claude AI

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5
- **Testing:** Jest 30

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Features

### Task Management (Home Page)
- Create, edit, and delete tasks with title, details, priority (0-10), due dates, and reference links
- Custom user-manageable categories with color coding
- Multiple view modes: list, table, category board, and priority list
- Date picker with single-click and drag-and-hold for date ranges
- Subtasks with inline status/priority cycling
- Data persistence via localStorage

### Calendar View
- Monthly calendar grid with English + Thai date display
- Drag-and-drop event repositioning and edge-drag resizing
- Double-click quick task creation
- Smart event stacking with lane allocation for overlapping events
- Crowding logic that collapses to colored lines when cells are dense, with hover expand

### Dashboard Analytics
- Key metrics: total, completed, and overdue tasks
- Category breakdown (horizontal bar chart)
- Priority distribution (vertical bar chart)
- Status overview (SVG donut chart)
- Upcoming deadlines list

### Infrastructure
- Collapsible floating navigation bar
- Zero external runtime dependencies (custom date math, custom drag handling)
- Full test coverage with Jest 30 (17 test files)

---

## Project Structure

```
mc-todo/
├── app/
│   ├── components/
│   │   ├── layout/      # FloatingNav
│   │   ├── task/        # TaskModal, TaskList, TaskItem, TaskCard, DatePicker,
│   │   │                # TaskTableRow, InlineEditableCell, ReferenceLinks,
│   │   │                # CategoryBoardView, PriorityListView, ViewControls
│   │   ├── calendar/    # CalendarGrid, CalendarDayCell, CalendarEvent,
│   │   │                # CalendarHeader, CalendarEventPopover,
│   │   │                # DragPreviewEvent, TrashDropZone
│   │   ├── dashboard/   # StatCard, CategoryBarChart, PriorityBarChart,
│   │   │                # StatusDonutChart, UpcomingDeadlines
│   │   └── ui/          # Button, Dropdown, Input, Modal, Slider, Textarea
│   ├── hooks/           # useTaskManager, useCategories, useLocalStorage,
│   │                    # useCalendarGrid, useEventResize, useEventDrag,
│   │                    # useViewPreference, useDashboardStats
│   ├── lib/             # utils, calendarUtils, dashboardUtils
│   ├── types/           # task.ts, calendar.ts
│   ├── calendar/        # /calendar route
│   ├── dashboard/       # /dashboard route
│   └── __tests__/       # Jest tests (17 test files)
├── public/              # Static assets
├── CLAUDE.md           # Development knowledge base
└── README.md           # This file
```

## License

Private project.

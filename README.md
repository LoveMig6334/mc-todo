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

## Feature Implementation Roadmap

### Feature 1: Task Management (Home Page)
- [x] Vertical list view layout
- [x] Add task button with modal/popup
- [x] Task creation form with all input fields:
  - [x] Title input
  - [x] Details input
  - [x] Category/Topic dropdown (custom, user-manageable)
  - [x] Priority slider (0-10)
  - [x] Due date picker (single click & drag-and-hold for range)
  - [x] Reference links (dynamic add/remove)
- [x] Task display and management
- [x] Data persistence (local storage)
- [x] Unit tests

### Feature 2: Linked Calendar View
- [x] Calendar grid with month display (English + Thai on hover)
- [x] Event visualization on calendar
- [x] Event resizing (drag edges)
- [x] Double-click quick create
- [x] Overlapping events stacking
- [x] Crowding logic (collapse to colored lines when >3-5 events)
- [x] Hover expand for collapsed events
- [x] Unit tests

### Feature 3: Dashboard (Analytics)
- [x] Total tasks metric
- [x] Completed tasks metric
- [x] Overdue tasks metric
- [x] Visual representation of productivity
  - [x] Category breakdown (horizontal bar chart)
  - [x] Priority distribution (vertical bar chart)
  - [x] Status overview (SVG donut chart)
  - [x] Upcoming deadlines list
- [x] Unit tests

### Infrastructure
- [x] Floating navigation bar (collapsible)
- [x] Jest testing setup
- [x] ESLint configuration verified

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

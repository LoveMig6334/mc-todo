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
- **Testing:** Jest

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
- [ ] Vertical list view layout
- [ ] Add task button with modal/popup
- [ ] Task creation form with all input fields:
  - [ ] Title input
  - [ ] Details input
  - [ ] Category/Topic dropdown (custom, user-manageable)
  - [ ] Priority slider (0-10)
  - [ ] Due date picker (single click & drag-and-hold for range)
  - [ ] Reference links (dynamic add/remove)
- [ ] Task display and management
- [ ] Data persistence (local storage)
- [ ] Unit tests

### Feature 2: Linked Calendar View
- [ ] Calendar grid with month display (English + Thai on hover)
- [ ] Event visualization on calendar
- [ ] Event resizing (drag edges)
- [ ] Double-click quick create
- [ ] Overlapping events stacking
- [ ] Crowding logic (collapse to colored lines when >3-5 events)
- [ ] Hover expand for collapsed events
- [ ] Unit tests

### Feature 3: Dashboard (Analytics)
- [ ] Total tasks metric
- [ ] Completed tasks metric
- [ ] Overdue tasks metric
- [ ] Visual representation of productivity
- [ ] Unit tests

### Infrastructure
- [ ] Floating navigation bar (collapsible)
- [ ] Jest testing setup
- [ ] ESLint configuration verified

---

## Project Structure

```
mc-todo/
├── app/
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript definitions
│   └── __tests__/       # Jest tests
├── public/              # Static assets
├── CLAUDE.md           # Development knowledge base
└── README.md           # This file
```

## License

Private project.

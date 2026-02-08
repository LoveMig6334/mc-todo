# MC-Todo Project Knowledge Base

This file contains lessons learned, common mistakes to avoid, and project-specific conventions for the MC-Todo application.

## Project Overview

A modern, high-performance To-Do List application built with Next.js featuring:

- Task Management with advanced input fields
- Linked Calendar View
- Dashboard Analytics

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5
- **Testing:** Jest 30

## Design System

- **Theme:** Dark Modern
- **Background:** Deep Dark Grey (avoid pure black #000000)
- **UI Elements/Icons:** White
- **Primary Accent:** Orange
- **Style:** Minimalist, Geometric, Flat Design (NO Glassmorphism/transparency)

---

## Avoid Common Mistakes

> This section documents errors encountered during development. Always check here before implementing new features.

### Template Entry Format

```
[YYYY-MM-DD HH:mm] - Category: Brief Title

**Problem:** Description of the issue or anti-pattern.

**Wrong Code:**
\`\`\`tsx
// Code that causes the issue
\`\`\`

**Correct Code:**
\`\`\`tsx
// Fixed/proper implementation
\`\`\`

**Context:** When does this apply? What triggers this issue?
```

---

### Recorded Issues

<!-- New entries should be added below this line -->

[2026-02-07 12:34] - React Hooks: Cannot call side-effects inside setState updater

**Problem:** Calling external side-effect functions (like `updateTask`, which writes to localStorage) inside a `setState` functional updater causes "Cannot update a component while rendering" errors. The updater runs during React's reconciliation phase, and triggering another state update there causes cascading renders.

**Wrong Code:**

```tsx
const endResize = useCallback(() => {
  setResizeState((prev) => {
    if (!prev) return null;
    // BAD: updateTask triggers state updates during render
    updateTask(prev.taskId, { dueDate: newDueDate });
    return null;
  });
}, [updateTask]);
```

**Correct Code:**

```tsx
const pendingUpdateRef = useRef<PendingUpdate | null>(null);

const endResize = useCallback(() => {
  setResizeState((prev) => {
    if (!prev) return null;
    // Queue the update, don't execute it here
    pendingUpdateRef.current = { taskId: prev.taskId, dueDate: newDueDate };
    return null;
  });
}, []);

// Apply pending updates after render
useEffect(() => {
  if (pendingUpdateRef.current) {
    const { taskId, dueDate } = pendingUpdateRef.current;
    pendingUpdateRef.current = null;
    updateTask(taskId, { dueDate });
  }
});
```

**Context:** Applies when you need to both update state AND trigger external side-effects based on the previous state. Use a ref to queue the side-effect, then execute it in a `useEffect` that runs after render.

---

[2026-02-07 12:00] - React Hooks: Cannot assign to ref.current during render

**Problem:** React 19 ESLint rule `react-hooks/refs` forbids assigning to `ref.current` during render. Pattern like `resizeStateRef.current = resizeState;` at the top level of a hook triggers this error.

**Wrong Code:**

```tsx
const [state, setState] = useState<State | null>(null);
const stateRef = useRef<State | null>(null);

// ESLint error: Cannot update ref during render
stateRef.current = state;

const endAction = useCallback(() => {
  const current = stateRef.current;
  // ...
}, []);
```

**Correct Code:**

```tsx
const [state, setState] = useState<State | null>(null);

const endAction = useCallback(() => {
  // Use functional updater to access current state without a ref
  setState((prev) => {
    if (!prev) return null;
    // ... do work with prev ...
    return null;
  });
}, []);
```

**Context:** Applies when you need to read the latest state inside a callback used in a global event listener (e.g., `window.addEventListener("mouseup")`). Instead of syncing a ref, use `setState` functional updater to access the current value.

---

[2026-02-06 12:00] - React Hooks: Avoid setState in useEffect

**Problem:** Next.js ESLint rule `react-hooks/set-state-in-effect` forbids calling setState synchronously within a useEffect. This can cause cascading renders and performance issues.

**Wrong Code:**

```tsx
useEffect(() => {
  if (isOpen) {
    setFormData(getDefaultFormData()); // ESLint error!
  }
}, [isOpen]);
```

**Correct Code:**

```tsx
// Option 1: Use useMemo for derived initial state
const initialFormData = useMemo(() => {
  if (editingTask) return taskToFormData(editingTask);
  return getDefaultFormData();
}, [editingTask]);

const [formData, setFormData] = useState(initialFormData);

// Option 2: Use a key prop to reset component state
<ChildComponent key={editingTask?.id ?? "new"} />;
```

**Context:** Applies when initializing form state based on props (e.g., modal edit vs create).

---

[2026-02-06 12:00] - React: Use useSyncExternalStore for localStorage

**Problem:** Reading from localStorage in useEffect and calling setState triggers ESLint errors and can cause hydration mismatches in Next.js.

**Wrong Code:**

```tsx
const [value, setValue] = useState(initialValue);

useEffect(() => {
  const item = localStorage.getItem(key);
  if (item) setValue(JSON.parse(item)); // ESLint error!
}, [key]);
```

**Correct Code:**

```tsx
import { useSyncExternalStore } from "react";

const getSnapshot = () => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : initialValue;
};

const value = useSyncExternalStore(
  subscribe,
  getSnapshot,
  () => initialValue, // Server snapshot
);
```

**Context:** Applies when syncing React state with browser APIs like localStorage.

---

[2026-02-06 12:00] - Jest Config: Use ESM format (.mjs)

**Problem:** ESLint forbids `require()` imports (`@typescript-eslint/no-require-imports`). Jest config files using CommonJS will fail linting.

**Wrong Code:**

```js
// jest.config.js
const nextJest = require("next/jest"); // ESLint error!
module.exports = createJestConfig(config);
```

**Correct Code:**

```js
// jest.config.mjs
import nextJest from "next/jest.js";
export default createJestConfig(config);
```

**Context:** Applies to all Jest configuration in TypeScript/ESM projects.

---

[2026-02-06 12:00] - TypeScript: jest-dom matchers not recognized

**Problem:** TypeScript error `Property 'toBeInTheDocument' does not exist on type 'JestMatchers<HTMLElement>'` (TS2339). The `jest.setup.js` imports `@testing-library/jest-dom` at runtime, but TypeScript doesn't pick up the type augmentations from a `.js` setup file.

**Wrong Code:**

```
// No type declaration file — TS doesn't know about jest-dom matchers
// jest.setup.js (runtime only, types not visible to TS)
import '@testing-library/jest-dom';
```

**Correct Code:**

```ts
// jest-dom.d.ts (at project root, included by tsconfig)
/// <reference types="@testing-library/jest-dom" />
```

**Context:** Applies when using `@testing-library/jest-dom` v6+ with TypeScript and Jest. The `.d.ts` file must be within the tsconfig `include` glob.

---

## Project Conventions

### File Structure

```
app/
├── components/       # Reusable UI components
│   ├── layout/      # FloatingNav
│   ├── task/        # TaskModal, TaskList, TaskItem, etc.
│   ├── calendar/    # CalendarGrid, CalendarDayCell, etc.
│   ├── dashboard/   # StatCard, CategoryBarChart, PriorityBarChart,
│   │                # StatusDonutChart, UpcomingDeadlines
│   └── ui/          # Button, Dropdown, Input, Modal, Slider, Textarea
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── types/           # TypeScript type definitions
├── calendar/        # /calendar route
├── dashboard/       # /dashboard route
└── __tests__/       # Jest test files
```

### Naming Conventions

- **Components:** PascalCase (e.g., `TaskModal.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useTaskManager.ts`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Types:** PascalCase with descriptive suffix (e.g., `TaskType.ts`)

### Component Guidelines

- Use Server Components by default
- Add `"use client"` only when client-side interactivity is needed
- Keep components focused and single-responsibility

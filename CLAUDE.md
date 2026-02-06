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
<ChildComponent key={editingTask?.id ?? 'new'} />
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
import { useSyncExternalStore } from 'react';

const getSnapshot = () => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : initialValue;
};

const value = useSyncExternalStore(
  subscribe,
  getSnapshot,
  () => initialValue // Server snapshot
);
```

**Context:** Applies when syncing React state with browser APIs like localStorage.

---

[2026-02-06 12:00] - Jest Config: Use ESM format (.mjs)

**Problem:** ESLint forbids `require()` imports (`@typescript-eslint/no-require-imports`). Jest config files using CommonJS will fail linting.

**Wrong Code:**
```js
// jest.config.js
const nextJest = require('next/jest'); // ESLint error!
module.exports = createJestConfig(config);
```

**Correct Code:**
```js
// jest.config.mjs
import nextJest from 'next/jest.js';
export default createJestConfig(config);
```

**Context:** Applies to all Jest configuration in TypeScript/ESM projects.

---

## Project Conventions

### File Structure
```
app/
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── types/           # TypeScript type definitions
├── (routes)/        # Page routes
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

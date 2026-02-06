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
- **Testing:** Jest (to be installed)

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

*No issues recorded yet. This section will be updated as development progresses.*

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

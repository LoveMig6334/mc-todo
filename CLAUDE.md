# MC-Todo Project

A modern To-Do List app with Task Management, Calendar View, Dashboard Analytics, and a Playground.

## Tech Stack

Next.js 16.1.6 (App Router) · React 19.2.3 · Tailwind CSS v4 · TypeScript 5 · Jest 30

## Design System

- **Theme:** Dark Modern (deep dark grey bg, avoid pure #000000)
- **Accent:** Orange · **UI/Icons:** White
- **Style:** Minimalist, Geometric, Flat Design (NO Glassmorphism/transparency)

## Common Pitfalls

### Motion + Tailwind v4 Colors

Tailwind v4 outputs `oklab()` colors. Motion cannot animate `oklab()` or keyword colors like `"transparent"`.

**Rules:**
1. Always use `rgba()`/`rgb()` values — never `"transparent"`, `"red"`, etc.
2. Set explicit `style={{ backgroundColor: "rgba(0,0,0,0)", borderColor: "rgb(39,39,42)" }}` on `motion.*` elements so Motion reads from `style` instead of `getComputedStyle()`
3. Never mix Tailwind `hover:bg-*` classes with `whileHover={{ backgroundColor }}` — use only Motion

```tsx
// Correct pattern for Motion + Tailwind v4
<motion.div
  className="border border-zinc-800"
  style={{ backgroundColor: "rgba(0,0,0,0)", borderColor: "rgb(39,39,42)" }}
  animate={{
    backgroundColor: isActive ? "rgba(249,115,22,0.15)" : "rgba(0,0,0,0)",
    borderColor: isActive ? "rgb(249,115,22)" : "rgb(39,39,42)",
  }}
/>
```

### React 19 + Next.js Lint Rules

| Rule | Don't | Do Instead |
|------|-------|------------|
| `set-state-in-effect` | `setState()` inside `useEffect` | `useMemo` for derived state, or `key` prop to reset |
| `refs` | Assign `ref.current` during render | `setState` functional updater to access current state |
| Side-effects in setState updater | Call `updateTask()` inside `setState(prev => ...)` | Queue in ref, execute in `useEffect` |
| `no-require-imports` | `require()` in config files | ESM `.mjs` config with `import` |

### localStorage

Use `useSyncExternalStore` (not `useState` + `useEffect`) to avoid hydration mismatches.

### Jest + TypeScript

- Use `.mjs` for Jest config (ESM)
- Add `jest-dom.d.ts` with `/// <reference types="@testing-library/jest-dom" />` for matcher types

## Project Structure

```
app/
├── components/{layout,task,calendar,dashboard,playground,ui}/
├── hooks/              # useTaskManager, useCategories, useLocalStorage, etc.
├── lib/                # Utility functions
├── types/              # TypeScript definitions
├── calendar/           # /calendar route
├── dashboard/          # /dashboard route
├── playground/[taskId] # /playground/[taskId] route
└── __tests__/          # Jest tests
```

## Conventions

- **Components:** PascalCase · **Hooks:** `use` prefix camelCase · **Utils:** camelCase · **Types:** PascalCase
- Server Components by default; `"use client"` only when needed
- Single-responsibility components

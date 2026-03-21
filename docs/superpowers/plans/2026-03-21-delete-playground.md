# Delete Playground Feature — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely remove the Playground feature (canvas, blocks, types, hooks, routes, nav, tests) from the mc-todo project.

**Architecture:** Delete all playground-dedicated files (route, components, hook, types, tests), then surgically remove playground references from shared files (FloatingNav, TaskItem, TaskModal, GreetingBanner). Finally update project docs.

**Tech Stack:** Next.js App Router, React, TypeScript

---

## File Map

### Files to DELETE (14 files)

| # | Path | Purpose |
|---|------|---------|
| 1 | `app/playground/[taskId]/page.tsx` | Playground route page |
| 2 | `app/playground/[taskId]/layout.tsx` | Playground layout + metadata |
| 3 | `app/playground/[taskId]/loading.tsx` | Playground loading skeleton |
| 4 | `app/components/playground/BlockWrapper.tsx` | Block drag/resize wrapper |
| 5 | `app/components/playground/DrawingBlock.tsx` | Canvas drawing block |
| 6 | `app/components/playground/FlowchartBlock.tsx` | Flowchart node/edge block |
| 7 | `app/components/playground/NoteBlock.tsx` | Rich text note block |
| 8 | `app/components/playground/PlaygroundCanvas.tsx` | Main canvas with pan/zoom |
| 9 | `app/components/playground/PlaygroundToolbar.tsx` | Toolbar for adding blocks |
| 10 | `app/components/playground/TodoListBlock.tsx` | Checklist block |
| 11 | `app/types/playground.ts` | All playground type definitions |
| 12 | `app/hooks/usePlayground.ts` | Playground state hook (localStorage) |
| 13 | `app/__tests__/Playground.test.tsx` | Tests for NoteBlock, BlockWrapper, PlaygroundToolbar, TodoListBlock, DrawingBlock |
| 14 | `app/__tests__/FlowchartBlock.test.tsx` | Tests for FlowchartBlock |

### Files to MODIFY (4 files)

| # | Path | What to remove |
|---|------|----------------|
| 1 | `app/components/layout/FloatingNav.tsx` | Playground nav button + dropdown, related state, unused imports |
| 2 | `app/components/task/TaskItem.tsx` | Playground link button (lines 114-135) |
| 3 | `app/components/task/TaskModal.tsx` | Playground link in modal actions (lines 331-351) |
| 4 | `app/components/task/GreetingBanner.tsx` | Playground tip string (line 26) |

### Docs to UPDATE (4 files)

| # | Path | What to update |
|---|------|----------------|
| 1 | `CLAUDE.md` | Remove `playground/[taskId]` from Project Structure + update project description (line 1) |
| 2 | `MEMORY.md` (user auto-memory) | Remove playground entries from hooks table, component structure, types, routes |
| 3 | `README.md` | Remove playground from description, architecture diagram, features section, project structure |
| 4 | `TODO.md` | Remove Feature 4 (Playground) section |

> **Note:** `build_output.log` and `docs/superpowers/plans/2026-03-11-navbar-animation.md` also contain playground references. The build log regenerates on next build. The historical plan doc is left as-is for audit trail.

---

## Task 1: Delete all playground-dedicated files

**Files:**
- Delete: `app/playground/[taskId]/page.tsx`
- Delete: `app/playground/[taskId]/layout.tsx`
- Delete: `app/playground/[taskId]/loading.tsx`
- Delete: `app/components/playground/BlockWrapper.tsx`
- Delete: `app/components/playground/DrawingBlock.tsx`
- Delete: `app/components/playground/FlowchartBlock.tsx`
- Delete: `app/components/playground/NoteBlock.tsx`
- Delete: `app/components/playground/PlaygroundCanvas.tsx`
- Delete: `app/components/playground/PlaygroundToolbar.tsx`
- Delete: `app/components/playground/TodoListBlock.tsx`
- Delete: `app/types/playground.ts`
- Delete: `app/hooks/usePlayground.ts`
- Delete: `app/__tests__/Playground.test.tsx`
- Delete: `app/__tests__/FlowchartBlock.test.tsx`

- [ ] **Step 1: Delete playground route directory**

```bash
rm -rf app/playground
```

- [ ] **Step 2: Delete playground components directory**

```bash
rm -rf app/components/playground
```

- [ ] **Step 3: Delete playground types, hook, and tests**

```bash
rm app/types/playground.ts
rm app/hooks/usePlayground.ts
rm app/__tests__/Playground.test.tsx
rm app/__tests__/FlowchartBlock.test.tsx
```

- [ ] **Step 4: Verify deletions**

```bash
# Should return no results
find app -path "*playground*" -o -path "*usePlayground*" -o -name "FlowchartBlock.test.tsx"
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: delete all playground-dedicated files (route, components, hook, types, tests)"
```

---

## Task 2: Remove playground from FloatingNav

**Files:**
- Modify: `app/components/layout/FloatingNav.tsx`

The playground adds significant complexity to this file: a dropdown with search, task filtering, and several state variables. After removal, unused imports and state must also be cleaned up.

- [ ] **Step 1: Remove unused imports**

Remove `useTaskManager` import (line 3) — it was only used for the playground dropdown task list.
Remove `getPriorityLabel` from the utils import (line 4) — only used in playground dropdown.
Remove `useMemo` from react import (line 8) — only used for playground task memos.

**KEEP `useRef`** — it is still used by `collapseTimer` (line 136) for the nav collapse behavior.

After cleanup, imports should be:
```tsx
import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
```

- [ ] **Step 2: Remove playground-related state and logic**

Remove these lines from the `FloatingNav` function body:

```tsx
// Remove these state declarations (lines 133-134):
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");

// Remove this ref (line 135):
const dropdownRef = useRef<HTMLDivElement>(null);

// Remove useTaskManager call (line 137):
const { tasks } = useTaskManager();

// Remove playground active check (line 139):
const isPlaygroundActive = currentPath.startsWith("/playground");

// Remove playgroundTasks memo (lines 141-144):
const playgroundTasks = useMemo(...)

// Remove filteredTasks memo (lines 146-150):
const filteredTasks = useMemo(...)

// Remove click-outside effect (lines 152-165):
useEffect(() => { function handleMouseDown... })
```

**KEEP the collapse timer cleanup effect (lines 167-172)** — this is for the general nav collapse behavior, not playground-related:
```tsx
useEffect(() => {
  return () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
  };
}, []);
```

Also remove `setIsDropdownOpen(false)` and `setSearchQuery("")` from the `handleMouseLeave` function (lines 185-186), keeping only `setIsExpanded(false)`. After cleanup:
```tsx
function handleMouseLeave() {
  collapseTimer.current = setTimeout(() => {
    setIsExpanded(false);
  }, 500);
}
```

- [ ] **Step 3: Remove playground nav item JSX**

Remove the entire playground nav block (lines 249-353): the `<motion.div ref={dropdownRef}>` containing the playground button, icon, dropdown, search field, and task list.

- [ ] **Step 4: Verify the file compiles**

```bash
npx tsc --noEmit app/components/layout/FloatingNav.tsx 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add app/components/layout/FloatingNav.tsx
git commit -m "refactor: remove playground nav item and dropdown from FloatingNav"
```

---

## Task 3: Remove playground link from TaskItem

**Files:**
- Modify: `app/components/task/TaskItem.tsx`

- [ ] **Step 1: Remove the playground link anchor**

Remove lines 114-135 (the `<a href={/playground/${task.id}}>` block with its SVG icon). Keep the edit and delete buttons that follow.

After removal, the actions div should look like:
```tsx
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button
    onClick={() => onEdit(task)}
    ...
  >
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit app/components/task/TaskItem.tsx 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/components/task/TaskItem.tsx
git commit -m "refactor: remove playground link from TaskItem actions"
```

---

## Task 4: Remove playground link from TaskModal

**Files:**
- Modify: `app/components/task/TaskModal.tsx`

- [ ] **Step 1: Remove playground link in modal actions**

Remove the conditional playground link block (lines 331-351):
```tsx
{editingTask && (
  <a
    href={`/playground/${editingTask.id}`}
    ...
  >
    <svg>...</svg>
    Playground
  </a>
)}
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit app/components/task/TaskModal.tsx 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/components/task/TaskModal.tsx
git commit -m "refactor: remove playground link from TaskModal actions"
```

---

## Task 5: Remove playground tip from GreetingBanner

**Files:**
- Modify: `app/components/task/GreetingBanner.tsx`

- [ ] **Step 1: Remove the playground tip string**

Remove this line from the tips array (line 26):
```tsx
"Use the Playground to jot down quick notes and checklists 🎨",
```

- [ ] **Step 2: Commit**

```bash
git add app/components/task/GreetingBanner.tsx
git commit -m "refactor: remove playground tip from GreetingBanner"
```

---

## Task 6: Update project documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `~/.claude/projects/.../memory/MEMORY.md`
- Modify: `README.md`
- Modify: `TODO.md`

- [ ] **Step 1: Update CLAUDE.md**

1. Update the project description (line 3) — remove "and a Playground" from:
   > A modern To-Do List app with Task Management, Calendar View, Dashboard Analytics, and a Playground.
2. Remove this line from the Project Structure section:
   ```
   ├── playground/[taskId] # /playground/[taskId] route
   ```

- [ ] **Step 2: Update MEMORY.md**

Remove all playground references:
- Routes section: remove `/playground/[taskId]` route entry
- Hooks table: remove `usePlayground` row
- Component Structure: remove entire `playground/` line and its children
- Types: remove `Playground Types` section
- Any other playground mentions

- [ ] **Step 3: Update README.md**

Remove all playground references:
- Project description mentioning "per-task playground"
- Playground entries in the mermaid architecture diagram
- The "Playground `/playground/:taskId`" feature section
- Playground entries in the project structure listing

- [ ] **Step 4: Update TODO.md**

Remove the Feature 4 (Playground) section entirely. If the remaining content is only Feature 5, keep the file with just that section.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md TODO.md
git commit -m "docs: remove playground references from project documentation"
```

---

## Task 7: Final verification

- [ ] **Step 1: Grep for any remaining playground references**

```bash
grep -ri "playground" app/ --include="*.tsx" --include="*.ts" --include="*.css"
```

Expected: No results.

- [ ] **Step 2: Run TypeScript compilation check**

```bash
npx tsc --noEmit
```

Expected: No errors (or only pre-existing errors unrelated to playground).

- [ ] **Step 3: Run existing tests**

```bash
npx jest --passWithNoTests
```

Expected: All remaining tests pass. The deleted playground tests should not cause failures.

- [ ] **Step 4: Start dev server and verify**

```bash
npx next dev
```

Verify:
- Home page (`/`) loads without errors
- FloatingNav shows only Tasks, Calendar, Dashboard (no Playground)
- Task items show Edit and Delete buttons only (no Playground icon)
- Task modal actions show only Cancel and Save (no Playground link)
- Navigating to `/playground/anything` shows Next.js 404

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve any remaining playground cleanup issues"
```

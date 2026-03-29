# Motion + Tailwind v4 Animation Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all violations of the Motion + Tailwind v4 color rules documented in CLAUDE.md across 4 components.

**Architecture:** The project uses `motion/react` (Motion) for animations and Tailwind CSS v4 for styling. Tailwind v4 outputs `oklab()` color values that Motion cannot interpolate. All `motion.*` elements that animate colors must use explicit `style={{}}` with `rgb()`/`rgba()` values, and must never mix Tailwind `hover:` classes with Motion `whileHover`/`whileTap` on the same property axis (border, background).

**Tech Stack:** React 19, motion/react, Tailwind CSS v4, TypeScript 5, Jest 30

---

## Findings Summary

| # | File | Issue | Rule Violated |
|---|------|-------|---------------|
| 1 | `app/components/task/TaskCard.tsx:67` | `hover:border-orange-500` on `motion.button` | Rule #3: No Tailwind hover on motion elements |
| 2 | `app/components/task/TaskItem.tsx:68` | `hover:border-orange-500` on `motion.button` | Rule #3: No Tailwind hover on motion elements |
| 3 | `app/components/task/SubtaskList.tsx:175` | `hover:border-emerald-500` on `motion.button` | Rule #3: No Tailwind hover on motion elements |
| 4 | `app/components/ui/Button.tsx:22-25` | `hover:bg-*` classes on `motion.button` across all 4 variants | Rule #3: No Tailwind hover on motion elements |

All four issues are the same category: Tailwind `hover:` color classes applied to `motion.*` elements. When Motion reads computed styles to animate, Tailwind v4's `oklab()` output causes broken/janky color transitions.

## File Structure

No new files. Modifications only:

- `app/components/task/TaskCard.tsx` - checkbox `motion.button` (line 58-97)
- `app/components/task/TaskItem.tsx` - checkbox `motion.button` (line 59-98)
- `app/components/task/SubtaskList.tsx` - checkbox `motion.button` (line 166-205)
- `app/components/ui/Button.tsx` - all variants (line 21-26, 34-43)

---

### Task 1: Fix TaskCard checkbox — remove Tailwind hover, add Motion whileHover

**Files:**
- Modify: `app/components/task/TaskCard.tsx:58-97`

- [ ] **Step 1: Verify the bug exists**

Run the dev server and navigate to the task list. Hover over an uncompleted task's checkbox. The border color transition may flash or jump due to `oklab()` interpolation failure. This confirms the issue.

- [ ] **Step 2: Replace Tailwind hover with Motion whileHover + explicit style**

In `app/components/task/TaskCard.tsx`, replace the `motion.button` checkbox (lines 58-69):

```tsx
// BEFORE (lines 58-69):
<motion.button
  onClick={() => onToggleComplete(task.id)}
  whileTap={{ scale: 0.8 }}
  transition={springBouncy}
  className={cn(
    "mt-0.5 h-4 w-4 shrink-0 rounded border-2 transition-colors duration-200",
    "flex items-center justify-center",
    task.completed
      ? "border-orange-500 bg-orange-500"
      : "border-zinc-500 hover:border-orange-500",
  )}
>
```

```tsx
// AFTER:
<motion.button
  onClick={() => onToggleComplete(task.id)}
  whileTap={{ scale: 0.8 }}
  whileHover={
    !task.completed
      ? { borderColor: "rgb(249, 115, 22)" }
      : undefined
  }
  transition={springBouncy}
  className={cn(
    "mt-0.5 h-4 w-4 shrink-0 rounded border-2",
    "flex items-center justify-center",
    task.completed && "border-orange-500 bg-orange-500",
  )}
  style={
    !task.completed
      ? { borderColor: "rgb(113, 113, 122)" }
      : undefined
  }
>
```

Key changes:
- Removed `hover:border-orange-500` (Tailwind hover on motion element)
- Removed `transition-colors duration-200` (let Motion handle the transition)
- Added `whileHover` with `rgb()` value for orange-500
- Added `style` with `rgb()` value for zinc-500 (initial border when uncompleted)
- When completed, the Tailwind classes `border-orange-500 bg-orange-500` are static (no animation needed), so no `style` override

- [ ] **Step 3: Verify the fix**

Run: `npx jest --testPathPattern="TaskItem|TaskCard|TaskList|CategoryBoardView" --passWithNoTests`

Hover over checkboxes in the browser — border should smoothly animate from zinc-500 to orange-500 on hover.

- [ ] **Step 4: Commit**

```bash
git add app/components/task/TaskCard.tsx
git commit -m "fix: replace Tailwind hover with Motion whileHover on TaskCard checkbox"
```

---

### Task 2: Fix TaskItem checkbox — same pattern as TaskCard

**Files:**
- Modify: `app/components/task/TaskItem.tsx:59-69`

- [ ] **Step 1: Replace Tailwind hover with Motion whileHover + explicit style**

In `app/components/task/TaskItem.tsx`, replace the `motion.button` checkbox (lines 59-69):

```tsx
// BEFORE (lines 59-69):
<motion.button
  onClick={() => onToggleComplete(task.id)}
  whileTap={{ scale: 0.8 }}
  transition={springBouncy}
  className={cn(
    "mt-1 h-5 w-5 shrink-0 rounded border-2 transition-colors duration-200",
    "flex items-center justify-center",
    task.completed
      ? "border-orange-500 bg-orange-500"
      : "border-zinc-600 hover:border-orange-500",
  )}
>
```

```tsx
// AFTER:
<motion.button
  onClick={() => onToggleComplete(task.id)}
  whileTap={{ scale: 0.8 }}
  whileHover={
    !task.completed
      ? { borderColor: "rgb(249, 115, 22)" }
      : undefined
  }
  transition={springBouncy}
  className={cn(
    "mt-1 h-5 w-5 shrink-0 rounded border-2",
    "flex items-center justify-center",
    task.completed && "border-orange-500 bg-orange-500",
  )}
  style={
    !task.completed
      ? { borderColor: "rgb(82, 82, 91)" }
      : undefined
  }
>
```

Key changes:
- Same pattern as Task 1
- `border-zinc-600` = `rgb(82, 82, 91)` used as initial style value
- `hover:border-orange-500` replaced with `whileHover`

- [ ] **Step 2: Run existing tests**

Run: `npx jest --testPathPattern="TaskItem" --passWithNoTests`

Expected: All existing tests pass (tests don't test hover animations).

- [ ] **Step 3: Verify in browser**

Hover over checkboxes on the task list page. Smooth border color animation from zinc-600 to orange-500.

- [ ] **Step 4: Commit**

```bash
git add app/components/task/TaskItem.tsx
git commit -m "fix: replace Tailwind hover with Motion whileHover on TaskItem checkbox"
```

---

### Task 3: Fix SubtaskList checkbox — emerald variant

**Files:**
- Modify: `app/components/task/SubtaskList.tsx:166-176`

- [ ] **Step 1: Replace Tailwind hover with Motion whileHover + explicit style**

In `app/components/task/SubtaskList.tsx`, replace the `motion.button` checkbox (lines 166-177):

```tsx
// BEFORE (lines 166-177):
<motion.button
  onClick={() => !readOnly && handleToggle(subtask.id)}
  disabled={readOnly}
  whileTap={!readOnly ? { scale: 0.75 } : undefined}
  transition={springBouncy}
  className={cn(
    "h-3.5 w-3.5 shrink-0 rounded border transition-colors duration-200 flex items-center justify-center",
    subtask.completed
      ? "border-emerald-500 bg-emerald-500"
      : "border-zinc-500 hover:border-emerald-500",
  )}
>
```

```tsx
// AFTER:
<motion.button
  onClick={() => !readOnly && handleToggle(subtask.id)}
  disabled={readOnly}
  whileTap={!readOnly ? { scale: 0.75 } : undefined}
  whileHover={
    !subtask.completed && !readOnly
      ? { borderColor: "rgb(16, 185, 129)" }
      : undefined
  }
  transition={springBouncy}
  className={cn(
    "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center",
    subtask.completed && "border-emerald-500 bg-emerald-500",
  )}
  style={
    !subtask.completed
      ? { borderColor: "rgb(113, 113, 122)" }
      : undefined
  }
>
```

Key changes:
- `hover:border-emerald-500` replaced with `whileHover` using `rgb(16, 185, 129)` (emerald-500)
- Also respects `readOnly` — no hover animation when read-only
- Removed `transition-colors duration-200` — Motion handles the transition
- `border-zinc-500` = `rgb(113, 113, 122)` as initial style

- [ ] **Step 2: Verify in browser**

Expand a task's subtask list. Hover over subtask checkboxes. Border should smoothly animate from zinc-500 to emerald-500.

- [ ] **Step 3: Commit**

```bash
git add app/components/task/SubtaskList.tsx
git commit -m "fix: replace Tailwind hover with Motion whileHover on SubtaskList checkbox"
```

---

### Task 4: Fix Button component — all 4 variants use Tailwind hover on motion.button

**Files:**
- Modify: `app/components/ui/Button.tsx:18-43`

This is the most impactful fix. The `Button` component is a shared UI primitive used across the app. All 4 variants use `hover:bg-*` classes on a `motion.button`, violating Rule #3.

- [ ] **Step 1: Define rgb() color mappings for all variants**

The Tailwind v4 → rgb() mapping for each variant:

| Variant | Tailwind bg | rgb() | Tailwind hover:bg | hover rgb() |
|---------|------------|-------|-------------------|------------|
| primary | `bg-orange-500` | `rgb(249, 115, 22)` | `hover:bg-orange-600` | `rgb(234, 88, 12)` |
| secondary | `bg-zinc-700` | `rgb(63, 63, 70)` | `hover:bg-zinc-600` | `rgb(82, 82, 91)` |
| ghost | `bg-transparent` | `rgba(0, 0, 0, 0)` | `hover:bg-zinc-800` | `rgb(39, 39, 42)` |
| danger | `bg-red-600` | `rgb(220, 38, 38)` | `hover:bg-red-700` | `rgb(185, 28, 28)` |

- [ ] **Step 2: Replace variant styles and add whileHover + style props**

Replace the entire Button component implementation in `app/components/ui/Button.tsx`:

```tsx
"use client";

import { springFast } from "@/app/lib/animation";
import { cn } from "@/app/lib/utils";
import { HTMLMotionProps, motion } from "motion/react";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: {
    className: "text-white",
    bg: "rgb(249, 115, 22)",
    hoverBg: "rgb(234, 88, 12)",
    ring: "focus:ring-orange-500",
  },
  secondary: {
    className: "text-white",
    bg: "rgb(63, 63, 70)",
    hoverBg: "rgb(82, 82, 91)",
    ring: "focus:ring-orange-500",
  },
  ghost: {
    className: "text-zinc-300",
    bg: "rgba(0, 0, 0, 0)",
    hoverBg: "rgb(39, 39, 42)",
    ring: "focus:ring-orange-500",
  },
  danger: {
    className: "text-white",
    bg: "rgb(220, 38, 38)",
    hoverBg: "rgb(185, 28, 28)",
    ring: "focus:ring-red-500",
  },
} as const;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, style, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none";

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-lg",
      lg: "h-12 px-6 text-base rounded-lg",
    };

    const v = variantStyles[variant];

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, v.ring, v.className, sizes[size], className)}
        style={{ backgroundColor: v.bg, ...style }}
        whileHover={{ backgroundColor: v.hoverBg }}
        whileTap={{ scale: 0.95 }}
        transition={springFast}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;
```

Key changes:
- Extracted variant colors into a `variantStyles` map with `rgb()`/`rgba()` values
- Removed all `hover:bg-*` and `bg-*` Tailwind classes from variants
- Added `style={{ backgroundColor: v.bg }}` for initial color (Motion reads from `style`)
- Added `whileHover={{ backgroundColor: v.hoverBg }}` for hover animation
- Preserved the `style` prop pass-through so consumers can still override
- Ghost variant uses `rgba(0, 0, 0, 0)` instead of `bg-transparent`
- Text colors kept as Tailwind classes (no animation needed on text, no conflict)
- Focus ring kept as Tailwind (not animated by Motion, no conflict)

- [ ] **Step 3: Run existing tests**

Run: `npx jest --passWithNoTests`

Expected: All existing tests still pass.

- [ ] **Step 4: Verify all button variants in browser**

1. Navigate to the task page — primary buttons (Add Task) should have smooth orange hover
2. Open modals — secondary/ghost buttons should animate correctly
3. Delete actions — danger buttons should smoothly transition to darker red

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/Button.tsx
git commit -m "fix: replace Tailwind hover:bg with Motion whileHover on all Button variants"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] Run full test suite: `npx jest`
- [ ] Check each fixed component in the browser:
  - TaskCard checkbox hover (zinc-500 → orange-500)
  - TaskItem checkbox hover (zinc-600 → orange-500)
  - SubtaskList checkbox hover (zinc-500 → emerald-500)
  - Button primary hover (orange-500 → orange-600)
  - Button secondary hover (zinc-700 → zinc-600)
  - Button ghost hover (transparent → zinc-800)
  - Button danger hover (red-600 → red-700)
- [ ] No `oklab()` animation warnings in the browser console
- [ ] No visual flash/jump on hover transitions

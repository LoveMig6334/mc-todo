# Calendar Tool System — Design Spec
**Date:** 2026-03-19
**Status:** Approved

---

## Overview

Improve the calendar page by adding a 4-tool selector in the header. Each tool changes the interaction mode of the calendar. Alongside this, redesign the task timeline appearance: gray body with category-colored solid end-caps, and a new per-task custom color stored in localStorage.

---

## 1. Data Model

### `Task` type (`app/types/task.ts`)
Add one optional field:
```ts
calendarColor?: string  // hex string, e.g. "#22c55e" — set by Color Bucket tool
```
- Stored in existing `mc-todo-tasks` localStorage key via `updateTask`
- No migration needed — existing tasks without the field default to gray (`#3f3f46`)
- `TaskFormData` is `Omit<Task, "id" | "createdAt" | "updatedAt">` — `calendarColor` is automatically included. No changes to `useTaskManager` needed.

### `TaskModal` prop change
Replace `prefilledDate?: string` with:
```ts
prefilledStart?: string   // YYYY-MM-DD
prefilledEnd?: string     // YYYY-MM-DD
```
Update `getDefaultFormData` inside `TaskModal`:
- If `prefilledProjectId` is provided and the project has its own `dueDate`, the project's dates take priority (existing behavior preserved)
- Otherwise, use `prefilledStart` as `dueDate.start` and `prefilledEnd` as `dueDate.end` when provided
- The old `prefilledDate` prop is fully removed — no backward-compat shim needed (`app/page.tsx` does not pass any date pre-fill)

### Active tool state in `page.tsx`
```ts
type CalendarTool = "normal" | "add" | "trim" | "color"
const [activeTool, setActiveTool] = useState<CalendarTool>("normal")
```

### `prefilledDateRange` state in `page.tsx`
The existing `prefilledDate: string | undefined` state is replaced by:
```ts
const [prefilledDateRange, setPrefilledDateRange] = useState<
  { start: string; end: string } | undefined
>()
```
When the Add Task drag completes, `setPrefilledDateRange({ start, end })` is called and the modal opens. On modal close, `setPrefilledDateRange(undefined)`.

### Task bar color logic
| Part | Source |
|------|--------|
| Body color | `task.calendarColor ?? "#3f3f46"` |
| Left end-cap (8px) | `category?.color ?? "#71717a"` |
| Right end-cap (8px) | `category?.color ?? "#71717a"` |

The Color Bucket tool changes only `calendarColor` (body). End-caps always reflect the category color and are never affected by the tool.

---

## 2. Prop Threading Summary

```
page.tsx  (instantiates useAddTaskDrag, useTaskColorPicker)
  ├─→ CalendarHeader: activeTool, onToolChange
  ├─→ CalendarGrid:   activeTool, onDragStart?, onDragHover?, onResizeStart?, onResizeHover?,
  │                   onOpenColorPicker,
  │                   onAddTaskMouseDown?, onAddTaskMouseEnter?   ← from useAddTaskDrag in page.tsx
  │                   addTaskPreviewDates                          ← Set<string> computed in page.tsx
  │     ├─→ CalendarWeekEvents: activeTool, onClickEvent, onOpenColorPicker,
  │     │                       onDragStart?, onDragHover?, onResizeStart?, onResizeHover?
  │     └─→ CalendarDayCell:    isInAddRange,
  │                             onAddTaskMouseDown?, onAddTaskMouseEnter?
  └─→ CalendarColorPickerPopover: openTaskId, anchorPosition, tasks, onClose, updateTask
```

`useAddTaskDrag` is instantiated in `page.tsx`. Its `handleMouseDown` and `handleMouseEnter` are passed to `CalendarGrid` as `onAddTaskMouseDown?` and `onAddTaskMouseEnter?`, which then forwards them to each `CalendarDayCell`. `page.tsx` also computes `addTaskPreviewDates` (a `Set<string>` of all dates between the normalized start and end of the current drag) and passes it to `CalendarGrid` → each `CalendarDayCell` as `isInAddRange`.

**Drag/resize gating:** `page.tsx` passes `onDragStart`, `onDragHover`, `onResizeStart`, `onResizeHover` as `undefined` when `activeTool !== "trim"`. All four props become optional (`?`) in `CalendarGridProps`, `CalendarWeekEventsProps`, and `CalendarDayCellProps`. Components check `if (onDragStart)` / `if (onResizeStart)` before calling — same as the existing optional-callback pattern already used for `onDragStart?` in `CalendarGrid`.

---

## 3. Toolbar Component

**File:** `app/components/calendar/CalendarToolbar.tsx`
Must include `"use client"` directive.

Renders inside `CalendarHeader`, to the right of the month navigation. Toolbar buttons are plain `<button>` elements — not Motion-animated — so Tailwind color classes are safe here.

| Tool | Lucide Icon | CSS cursor (applied to CalendarGrid outer container) | Display label |
|------|-------------|------------------------------------------------------|---------------|
| Normal | `MousePointer2` | `cursor-default` | Normal |
| Add Task | `Plus` | `cursor-crosshair` | Add Task |
| Trim & Move | `Scissors` | `cursor-cell` | Trim & Move |
| Color | `PaintBucket` | `cursor-cell` | Color |

> The type literal for Trim & Move is `"trim"` but the display label is "Trim & Move".

The cursor class is applied to the outermost container `<div>` in `CalendarGrid` via a lookup:
```ts
const cursorClass: Record<CalendarTool, string> = {
  normal: "cursor-default",
  add: "cursor-crosshair",
  trim: "cursor-cell",
  color: "cursor-cell",
}
```

**Active tool:** `bg-orange-500/20 border border-orange-500 text-orange-400`
**Inactive tool:** `bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600`

### Updated `CalendarHeader` props
```ts
interface CalendarHeaderProps {
  currentMonth: number
  currentYear: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  activeTool: CalendarTool              // NEW
  onToolChange: (tool: CalendarTool) => void  // NEW
}
```

---

## 4. Tool Behaviors

### 4.1 Normal Tool (default)

**Single-click on a task bar:** Opens `TaskModal` in edit mode (same as existing `handleClickEvent` behavior).

**Double-click on a day cell:** Removed. `handleDoubleClickDay` is deleted from `page.tsx`. `onDoubleClickDay` is removed from `CalendarGridProps` and `CalendarDayCellProps` entirely. Task creation from the calendar is now exclusively done via the Add Task tool.

**Hover animation:** The outer `motion.button` on each task bar retains Motion. The `whileHover` scale:
```ts
whileHover={{ scale: activeTool === "normal" && !isResizing && !isDragging ? 1.05 : 1 }}
transition={{ duration: 0.15 }}
```

**Drag/resize:** `onDragStart` / `onResizeStart` are `undefined` in this mode (see §2 gating).

### 4.2 Add Task Tool

**New hook:** `app/hooks/useAddTaskDrag.ts`

```ts
interface AddTaskDragState {
  isDragging: boolean
  startDate: string | null   // YYYY-MM-DD
  endDate: string | null     // YYYY-MM-DD
}

// Hook signature:
function useAddTaskDrag(
  onComplete: (range: { start: string; end: string }) => void
): {
  dragState: AddTaskDragState
  handleMouseDown: (date: string) => void
  handleMouseEnter: (date: string) => void
}
```

The `onComplete` callback is called internally by the hook's global mouseup listener — the caller does not invoke any `handleMouseUp` manually.

**Event routing:** Uses per-cell `onMouseDown` / `onMouseEnter` on `CalendarDayCell` — same approach as `useEventDrag`. New props on `CalendarDayCell`:
```ts
onAddTaskMouseDown?: (date: string) => void
onAddTaskMouseEnter?: (date: string) => void
```
These are only passed (non-undefined) when `activeTool === "add"`.

**Global mouseup:** A `window.addEventListener("mouseup", handleGlobalMouseUp)` listener is registered only while `isDragging === true`, via a `useEffect` that depends on `isDragging`:
```ts
useEffect(() => {
  if (!isDragging) return
  window.addEventListener("mouseup", handleGlobalMouseUp)
  return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
}, [isDragging])
```
This ensures the listener is active only during an active drag — it does not fire on unrelated mouse releases elsewhere on the page. The handler normalizes start/end (`start ≤ end`), calls `onComplete({ start, end })`, and resets drag state.

**Behavior:**
- `mousedown` on a day cell → `startDate = date`, `isDragging = true`
- `onMouseEnter` while dragging → `endDate = date`
- `mouseup` (global) → normalize, call `onComplete({ start, end })`, reset state
  - In `page.tsx`, `onComplete` is: `(range) => { setPrefilledDateRange(range); setIsModalOpen(true) }`
- Does not call `updateTask`. No ref-based update queue.

**Range highlight:** `page.tsx` computes `addTaskPreviewDates: Set<string>` from the hook's `dragState` — it always uses the normalized range `[min(startDate, endDate), max(startDate, endDate)]`, so the highlight updates in real time and covers all dates between the two endpoints regardless of drag direction. Each cell receives `isInAddRange: boolean`. When true, render a semi-transparent orange overlay as an absolutely-positioned child `<div>` with `position: absolute`, `inset: 0`, `background: rgba(249, 115, 22, 0.15)`, `pointer-events: none`. The `pointer-events: none` ensures the overlay does not intercept `onMouseEnter` / `onMouseDown` events on the cell. This is an intentional UI feedback tint — it is not glassmorphism.

### 4.3 Trim & Move Tool

- Existing `useEventDrag` and `useEventResize` hooks — no logic changes
- `onDragStart`, `onDragHover`, `onResizeStart`, `onResizeHover` are passed normally only when `activeTool === "trim"` (see §2 gating)
- Hover scale returns to 1 in this mode (see §4.1 guard)

### 4.4 Color Bucket Tool

**New hook:** `app/hooks/useTaskColorPicker.ts`

```ts
interface ColorPickerState {
  openTaskId: string | null
  anchorPosition: { x: number; y: number } | null
}

// Returns: { pickerState, openPicker, closePicker }
```

**Click routing in `CalendarWeekEvents`:** When `activeTool === "color"`, the task bar `onClick` handler branches:
```ts
onClick={(e) => {
  if (activeTool === "color") {
    onOpenColorPicker(task.id, { x: e.clientX, y: e.clientY })
    return   // suppress normal onClickEvent
  }
  onClickEvent(task)
}}
```

**Dismiss:** A full-screen transparent backdrop `<div>` inside `CalendarColorPickerPopover` (using `position: fixed`, `inset: 0`, z-index: 99) captures outside clicks and calls `onClose`.

**Popover component:** `app/components/calendar/CalendarColorPickerPopover.tsx`
Must include `"use client"` directive. Renders at `page.tsx` level (sibling to `CalendarGrid`) when `openTaskId !== null`.

**Z-index:** Backdrop = 99. Popover panel = 100. This is above `CalendarEventPopover` (z-50) and `TrashDropZone`.

**Popover dimensions:** 220px wide × ~260px tall.

**Position logic (applied inside the popover using `anchorPosition` with `position: fixed`):**
- Default: `top = anchorY + 8`, `left = anchorX` (8px below the click point, left-aligned with it)
- If `anchorX + 220 > window.innerWidth - 16` → flip: `left = anchorX - 220`
- If `anchorY + 8 + 260 > window.innerHeight - 16` → flip: `top = anchorY - 260`

**Color picker UI:**
- `HexColorPicker` from `react-colorful`
- A controlled `<input type="text">` below for manual hex entry; validates hex format (`/^#[0-9a-fA-F]{6}$/`) on blur — if invalid, the input silently reverts to the last valid hex value (no error state shown)
- Flat styling: `bg-zinc-800 border border-zinc-700 rounded-lg p-3` — no glassmorphism
- Color change → `updateTask(taskId, { calendarColor: hex })` immediately on change

---

## 5. Task Timeline Visual Design

### Which components render task bars

`CalendarGrid` always passes `hideEvents={true}` to `CalendarDayCell`, so `CalendarEvent.tsx` is not in the active render path — events render exclusively through `CalendarWeekEvents`. `CalendarEvent.tsx` is still updated for structural correctness.

### New DOM structure (primary: `CalendarWeekEvents`)

The outer `motion.button` wrapper is **retained** for click semantics and Motion animation. The end-cap structure is nested inside it:

```tsx
<motion.button
  whileHover={{ scale: activeTool === "normal" && !isResizing && !isDragging ? 1.05 : 1 }}
  transition={{ duration: 0.15 }}
  style={{ /* existing positioning */ }}
  onClick={(e) => { /* see §4.4 click routing */ }}
>
  <div style={{ display: "flex", borderRadius: 4, overflow: "hidden",
                height: "100%", width: "100%" }}>
    {spanStart && (
      <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
    )}
    <div style={{ flex: 1, background: task.calendarColor ?? "#3f3f46",
                  display: "flex", alignItems: "center", padding: "0 6px",
                  position: "relative", overflow: "hidden" }}>
      {activeTool === "trim" && <ResizeHandleStart ... />}
      {activeTool === "trim" && <ResizeHandleEnd ... />}
      <span style={{ color: "#e4e4e7", fontSize: 11, overflow: "hidden",
                     whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {task.title}
      </span>
    </div>
    {spanEnd && (
      <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
    )}
  </div>
</motion.button>
```

**Resize handles:** `position: absolute` inside the body `<div>` (`position: relative`). Only rendered when `activeTool === "trim"`.

**Multi-day spans:** End-caps only at true start/end. `spanMiddle` cells: body only, no caps.

**Color values:** All `rgb()`/`rgba()` strings in inline styles.

### `DragPreviewEvent` update

The ghost preview adopts the same end-cap structure but without interactive elements:
```tsx
<div style={{ display: "flex", borderRadius: 4, overflow: "hidden",
              height: "100%", opacity: 0.5 }}>
  {spanStart && <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />}
  <div style={{ flex: 1, background: task.calendarColor ?? "#3f3f46" }} />
  {spanEnd && <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />}
</div>
```

### `CalendarEventPopover` update

Each event row inside the overflow popover list adopts the end-cap design:
```tsx
<div style={{ display: "flex", borderRadius: 3, overflow: "hidden", height: 20 }}>
  <div style={{ width: 6, background: categoryColor, flexShrink: 0 }} />
  <div style={{ flex: 1, background: task.calendarColor ?? "#3f3f46",
                display: "flex", alignItems: "center", padding: "0 5px" }}>
    <span style={{ color: "#e4e4e7", fontSize: 10, overflow: "hidden",
                   whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
      {task.title}
    </span>
  </div>
  <div style={{ width: 6, background: categoryColor, flexShrink: 0 }} />
</div>
```
No `activeTool` prop needed in `CalendarEventPopover` — resize handles are not shown there.

---

## 6. New Files

| File | Purpose |
|------|---------|
| `app/components/calendar/CalendarToolbar.tsx` | 4-tool selector UI component |
| `app/components/calendar/CalendarColorPickerPopover.tsx` | Color picker popover with HexColorPicker + backdrop |
| `app/hooks/useAddTaskDrag.ts` | Drag-to-create date range state + event handlers |
| `app/hooks/useTaskColorPicker.ts` | Color picker open/close state + anchor position |

---

## 7. Modified Files

| File | Change |
|------|--------|
| `app/types/task.ts` | Add `calendarColor?: string` to `Task` |
| `app/components/task/TaskModal.tsx` | Replace `prefilledDate?` with `prefilledStart?` + `prefilledEnd?`; update `getDefaultFormData` |
| `app/calendar/page.tsx` | Add `activeTool`, `prefilledDateRange`; wire new hooks; remove `handleDoubleClickDay`; gate drag/resize props to Trim mode; pass new props to header, grid, modal; render `CalendarColorPickerPopover` |
| `app/components/calendar/CalendarHeader.tsx` | Add `activeTool` + `onToolChange` props; embed `CalendarToolbar` |
| `app/components/calendar/CalendarGrid.tsx` | Add `activeTool`; remove `onDoubleClickDay`; apply cursor class; pass drag/resize props as `undefined` when not Trim; wire add-task handlers; compute `addTaskPreviewDates`; pass new props to cells and `CalendarWeekEvents` |
| `app/components/calendar/CalendarDayCell.tsx` | Remove `onDoubleClick`; add `isInAddRange`, `onAddTaskMouseDown?`, `onAddTaskMouseEnter?` props; render orange overlay when `isInAddRange` |
| `app/components/calendar/CalendarWeekEvents.tsx` | Add `activeTool` + `onOpenColorPicker` props; new end-cap task bar structure; `whileHover` scale guard; conditional resize handles; click routing for Color tool |
| `app/components/calendar/CalendarEvent.tsx` | New end-cap task bar structure (structural update; not in active render path) |
| `app/components/calendar/DragPreviewEvent.tsx` | New end-cap task bar structure (see §5) |
| `app/components/calendar/CalendarEventPopover.tsx` | Each event row adopts end-cap design (see §5); no `activeTool` prop |
| `app/hooks/useEventDrag.ts` | No logic change — caller controls when props are passed |
| `app/hooks/useEventResize.ts` | No logic change — caller controls when props are passed |

---

## 8. New Dependency

**`react-colorful`** — lightweight color picker
- ~2.8kb gzipped, zero peer dependencies
- Used component: `HexColorPicker`
- `CalendarColorPickerPopover` must be a client component (`"use client"`)
- Install: `npm install react-colorful`

---

## 9. Out of Scope

- Keyboard shortcuts for switching tools
- Undo/redo for color changes
- Color presets or saved palette
- Changing category color via the Color Bucket tool (explicitly excluded)
- Right-click context menus
- Double-click-on-day-cell to create tasks (removed; Add Task tool is the replacement)

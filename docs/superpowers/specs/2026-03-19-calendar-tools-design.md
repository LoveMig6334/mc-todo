# Calendar Tool System — Design Spec
**Date:** 2026-03-19
**Status:** Approved

---

## Overview

Improve the calendar page by adding a 4-tool selector in the header. Each tool changes the interaction mode of the calendar. Alongside this, redesign the task timeline appearance: gray body with category-colored end-caps, and a new per-task custom color stored in localStorage.

---

## 1. Data Model

### `Task` type (`app/types/task.ts`)
Add one optional field:
```ts
calendarColor?: string  // hex string, e.g. "#22c55e" — set by Color Bucket tool
```
- Stored in existing `mc-todo-tasks` localStorage key via `updateTask`
- No migration needed — existing tasks without the field default to gray (`#3f3f46`)

### Task bar color logic
| Part | Source |
|------|--------|
| Body color | `task.calendarColor ?? "#3f3f46"` |
| Left end-cap | `category?.color ?? "#71717a"` |
| Right end-cap | `category?.color ?? "#71717a"` |

The Color Bucket tool changes only the body color. End-caps always reflect the category color and are never affected by the tool.

---

## 2. Tool Selector State

A `calendarTool` state lives in `app/calendar/page.tsx`:
```ts
type CalendarTool = "normal" | "add" | "trim" | "color"
const [activeTool, setActiveTool] = useState<CalendarTool>("normal")
```

- Passed as a prop to `CalendarGrid` and `CalendarHeader`
- The active tool gates which mouse event handlers respond
- The calendar grid container applies a tool-specific CSS cursor class

---

## 3. Toolbar Component

**File:** `app/components/calendar/CalendarToolbar.tsx`

Renders inline inside `CalendarHeader`, to the right of the month navigation.

| Tool | Lucide Icon | CSS Cursor | Label |
|------|-------------|------------|-------|
| Normal | `MousePointer2` | `cursor-default` | Normal |
| Add Task | `Plus` | `cursor-crosshair` | Add Task |
| Trim & Move | `Scissors` | custom scissors SVG cursor | Trim & Move |
| Color | `PaintBucket` | custom bucket SVG cursor | Color |

**Active tool styling:** `bg-orange-500/20 border border-orange-500 text-orange-400`
**Inactive tool styling:** `bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200`

All button colors use `rgba()`/`rgb()` inline styles for Motion-animated elements per project rules.

---

## 4. Tool Behaviors

### 4.1 Normal Tool (default)
- **Hover:** Scale-up animation on task bar — Motion `whileHover={{ scale: 1.05 }}` with `transition={{ duration: 0.15 }}`
- **Double-click:** Opens `TaskModal` in edit mode for the clicked task
- **Drag/resize:** Disabled

### 4.2 Add Task Tool
**New hook:** `app/hooks/useAddTaskDrag.ts`

State:
```ts
{ isDragging: boolean, startDate: string | null, endDate: string | null }
```

Behavior:
- `mousedown` on a day cell → records `startDate`
- `mousemove` across cells → updates `endDate`; highlights selected range with orange overlay
- `mouseup` → sorts start/end dates, opens `TaskModal` with `dueDate.start` and `dueDate.end` pre-filled
- Dragging right (forward) or left (backward) both work — dates are always normalized before passing to modal
- Uses the same ref-based update queue pattern as existing drag hooks

### 4.3 Trim & Move Tool
- Existing `useEventDrag` and `useEventResize` hooks, behavior unchanged
- Previously active in all modes — now **exclusively** active when this tool is selected
- No logic changes to the hooks themselves

### 4.4 Color Bucket Tool
**New hook:** `app/hooks/useTaskColorPicker.ts`

State:
```ts
{ openTaskId: string | null, anchorPosition: { x: number, y: number } | null }
```

Behavior:
- `click` on a task → records `taskId` and mouse position, opens popover
- Popover renders near the click position, with smart edge detection (flips left/up if near viewport edge)
- Popover contains: HSV color map + hue slider + hex text input (using `react-colorful`)
- Color selection → calls `updateTask(taskId, { calendarColor: hex })` immediately on change
- Click outside popover → dismisses it
- Category end-caps are unaffected — only `calendarColor` changes

---

## 5. Task Timeline Visual Design

All 4 calendar event components are updated to the new structure.

**Affected components:**
- `CalendarEvent.tsx`
- `CalendarWeekEvents.tsx`
- `DragPreviewEvent.tsx`
- `CalendarEventPopover.tsx`

**New DOM structure:**
```tsx
<div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: "100%" }}>
  {/* Left end-cap — only on spanStart */}
  {spanStart && (
    <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
  )}
  {/* Body */}
  <div style={{ flex: 1, background: task.calendarColor ?? "#3f3f46",
                display: "flex", alignItems: "center", padding: "0 6px" }}>
    <span style={{ color: "#e4e4e7", fontSize: 11, overflow: "hidden",
                   whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
      {task.title}
    </span>
  </div>
  {/* Right end-cap — only on spanEnd */}
  {spanEnd && (
    <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
  )}
</div>
```

**Multi-day spans:** End-caps render only at the true start/end of the event. Middle cells (`spanMiddle`) show body only, no caps — no visual interruption across week row boundaries.

**Color values:** All hardcoded as `rgb()`/`rgba()` strings — no Tailwind color keywords on animated elements.

---

## 6. New Files

| File | Purpose |
|------|---------|
| `app/components/calendar/CalendarToolbar.tsx` | 4-tool selector UI component |
| `app/hooks/useAddTaskDrag.ts` | Drag-to-create date range logic |
| `app/hooks/useTaskColorPicker.ts` | Color picker open/close state + anchor position |

---

## 7. Modified Files

| File | Change |
|------|--------|
| `app/types/task.ts` | Add `calendarColor?: string` |
| `app/calendar/page.tsx` | Add `activeTool` state; wire new hooks; pass tool down |
| `app/components/calendar/CalendarHeader.tsx` | Embed `CalendarToolbar` |
| `app/components/calendar/CalendarGrid.tsx` | Apply cursor class; gate drag/resize to Trim tool |
| `app/components/calendar/CalendarWeekEvents.tsx` | New task bar structure; hover scale on Normal tool |
| `app/components/calendar/CalendarEvent.tsx` | New task bar structure; hover scale on Normal tool |
| `app/components/calendar/DragPreviewEvent.tsx` | New task bar structure |
| `app/components/calendar/CalendarEventPopover.tsx` | New task bar structure |
| `app/hooks/useEventDrag.ts` | No logic change — called only when Trim tool active |
| `app/hooks/useEventResize.ts` | No logic change — called only when Trim tool active |

---

## 8. New Dependency

**`react-colorful`** — HSV/RGB color picker
- ~2.8kb gzipped
- Zero peer dependencies
- Install: `npm install react-colorful`

---

## 9. Out of Scope

- Keyboard shortcuts for switching tools
- Undo/redo for color changes
- Color presets or saved palette
- Changing category color via the Color Bucket tool (explicitly excluded)

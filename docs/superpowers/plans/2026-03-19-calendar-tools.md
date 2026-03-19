# Calendar Tool System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 interactive tools to the calendar page (Normal, Add Task, Trim & Move, Color Bucket) and redesign task timeline bars to use a gray body with category-colored 8px end-caps.

**Architecture:** A `calendarTool` state in `page.tsx` gates which mouse handlers are active. New hooks (`useAddTaskDrag`, `useTaskColorPicker`) follow the same ref-based patterns as existing drag/resize hooks. Task bar visuals change in `CalendarWeekEvents` (primary render path); other event components updated for structural correctness.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, Motion (Framer), Jest 30, `react-colorful` (new dependency)

**Spec:** `docs/superpowers/specs/2026-03-19-calendar-tools-design.md`

---

## File Map

**New files:**
- `app/hooks/useAddTaskDrag.ts` — drag-to-create date range logic
- `app/hooks/useTaskColorPicker.ts` — color picker open/close state
- `app/components/calendar/CalendarToolbar.tsx` — 4-tool selector UI
- `app/components/calendar/CalendarColorPickerPopover.tsx` — color picker popover with backdrop

**Modified files:**
- `app/types/task.ts` — add `calendarColor?: string`
- `app/components/task/TaskModal.tsx` — replace `prefilledDate` with `prefilledStart`/`prefilledEnd`
- `app/calendar/page.tsx` — add tool state, wire new hooks, update props
- `app/components/calendar/CalendarHeader.tsx` — add tool props, embed toolbar
- `app/components/calendar/CalendarGrid.tsx` — add tool prop, gate handlers, add-task wiring
- `app/components/calendar/CalendarDayCell.tsx` — remove double-click, add add-task props + highlight
- `app/components/calendar/CalendarWeekEvents.tsx` — new bar structure, tool-gated handlers
- `app/components/calendar/CalendarEvent.tsx` — new bar structure (structural)
- `app/components/calendar/DragPreviewEvent.tsx` — new bar structure
- `app/components/calendar/CalendarEventPopover.tsx` — new bar structure for event rows

---

## Task 1: Add `calendarColor` to Task type

**Files:**
- Modify: `app/types/task.ts`
- Test: `app/__tests__/taskType.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/taskType.test.ts`:
```ts
import { Task, TaskFormData } from "@/app/types/task";

describe("Task type calendarColor field", () => {
  it("allows calendarColor to be omitted", () => {
    const task: Partial<Task> = { id: "1", title: "Test" };
    expect(task.calendarColor).toBeUndefined();
  });

  it("accepts calendarColor as a hex string", () => {
    const task: Partial<Task> = { calendarColor: "#22c55e" };
    expect(task.calendarColor).toBe("#22c55e");
  });

  it("TaskFormData includes calendarColor", () => {
    const formData: Partial<TaskFormData> = { calendarColor: "#f97316" };
    expect(formData.calendarColor).toBe("#f97316");
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd "C:/Users/thatt/Documents/Coding Project/Web Projects/mc-todo"
npx jest taskType --no-coverage
```
Expected: FAIL — `calendarColor` does not exist on `Task`

- [ ] **Step 3: Add field to `app/types/task.ts`**

After `archived: boolean;` (line 49), add:
```ts
  calendarColor?: string; // Hex color set by Color Bucket tool on calendar page
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx jest taskType --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/types/task.ts app/__tests__/taskType.test.ts
git commit -m "feat: add calendarColor optional field to Task type"
```

---

## Task 2: Update TaskModal — replace `prefilledDate` with `prefilledStart`/`prefilledEnd`

**Files:**
- Modify: `app/components/task/TaskModal.tsx`

The `prefilledDate` prop is used in `calendar/page.tsx` and nowhere else. Replace with a date range.

- [ ] **Step 1: Update `TaskModalProps` interface in `app/components/task/TaskModal.tsx`**

Replace:
```ts
  prefilledDate?: string;
```
With:
```ts
  prefilledStart?: string; // YYYY-MM-DD pre-fill for dueDate.start
  prefilledEnd?: string;   // YYYY-MM-DD pre-fill for dueDate.end
```

- [ ] **Step 2: Update `getDefaultFormData` signature and logic**

Replace the function signature and body:
```ts
const getDefaultFormData = (
  prefilledStart?: string,
  prefilledEnd?: string,
  prefilledProjectId?: string,
  projects?: Project[],
): TaskFormData => {
  const today = new Date().toISOString().split("T")[0];

  let defaultDueDate: DateRange = {
    start: prefilledStart || today,
    end: prefilledEnd || null,
  };

  // prefilledProjectId takes priority when project has its own due dates
  if (prefilledProjectId && projects) {
    const proj = projects.find((p) => p.id === prefilledProjectId);
    if (proj) {
      defaultDueDate = { start: proj.dueDate.start, end: null };
    }
  }

  return {
    title: "",
    details: "",
    categoryId: "",
    priority: 5,
    status: "pending",
    dueDate: defaultDueDate,
    subtasks: [],
    referenceLinks: [],
    completed: false,
    completedAt: null,
    archived: false,
    projectId: prefilledProjectId,
  };
};
```

- [ ] **Step 3: Update `TaskModalContent` props and `useMemo` call**

In the `TaskModalContent` function signature, replace `prefilledDate` with `prefilledStart` and `prefilledEnd`:
```ts
function TaskModalContent({
  onClose,
  onSubmit,
  categories,
  onAddCategory,
  editingTask,
  prefilledStart,
  prefilledEnd,
  prefilledProjectId,
  projects,
}: Omit<TaskModalProps, "isOpen">) {
  const initialFormData = useMemo(() => {
    if (editingTask) {
      // Preserve the existing editingTask spread exactly as it is in the file —
      // do NOT replace it, just keep all existing fields including any new ones.
      return {
        title: editingTask.title,
        details: editingTask.details,
        categoryId: editingTask.categoryId,
        projectId: editingTask.projectId,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        subtasks: editingTask.subtasks,
        referenceLinks: editingTask.referenceLinks,
        completed: editingTask.completed,
        completedAt: editingTask.completedAt,
        archived: editingTask.archived,
        calendarColor: editingTask.calendarColor,
      };
    }
    return getDefaultFormData(prefilledStart, prefilledEnd, prefilledProjectId, projects);
  }, [editingTask, prefilledStart, prefilledEnd, prefilledProjectId, projects]);
```

- [ ] **Step 4: Update the outer `TaskModal` wrapper call to pass new props**

Find where `TaskModalContent` is rendered inside `TaskModal` and update:
```tsx
<TaskModalContent
  onClose={onClose}
  onSubmit={onSubmit}
  categories={categories}
  onAddCategory={onAddCategory}
  editingTask={editingTask}
  prefilledStart={prefilledStart}
  prefilledEnd={prefilledEnd}
  prefilledProjectId={prefilledProjectId}
  projects={projects}
/>
```

- [ ] **Step 5: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors (the `app/page.tsx` call site doesn't pass `prefilledDate` at all, so no breakage there)

- [ ] **Step 6: Commit**

```bash
git add app/components/task/TaskModal.tsx
git commit -m "feat: replace prefilledDate with prefilledStart/prefilledEnd in TaskModal"
```

---

## Task 3: Build `CalendarToolbar` component

**Files:**
- Create: `app/components/calendar/CalendarToolbar.tsx`

- [ ] **Step 1: Install `react-colorful` (needed later; install now to unblock builds)**

```bash
cd "C:/Users/thatt/Documents/Coding Project/Web Projects/mc-todo"
npm install react-colorful
```

- [ ] **Step 2: Create `app/components/calendar/CalendarToolbar.tsx`**

```tsx
"use client";

import { MousePointer2, Plus, Scissors, PaintBucket } from "lucide-react";
import { cn } from "@/app/lib/utils";

export type CalendarTool = "normal" | "add" | "trim" | "color";

interface CalendarToolbarProps {
  activeTool: CalendarTool;
  onToolChange: (tool: CalendarTool) => void;
}

const TOOLS: { id: CalendarTool; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "normal", label: "Normal", Icon: MousePointer2 },
  { id: "add", label: "Add Task", Icon: Plus },
  { id: "trim", label: "Trim & Move", Icon: Scissors },
  { id: "color", label: "Color", Icon: PaintBucket },
];

export default function CalendarToolbar({ activeTool, onToolChange }: CalendarToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onToolChange(id)}
          title={label}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            activeTool === id
              ? "border-orange-500 bg-orange-500/20 text-orange-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
          )}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/components/calendar/CalendarToolbar.tsx package.json package-lock.json
git commit -m "feat: add CalendarToolbar component with 4 tool buttons"
```

---

## Task 4: Wire `activeTool` state into calendar page and header

**Files:**
- Modify: `app/calendar/page.tsx`
- Modify: `app/components/calendar/CalendarHeader.tsx`

- [ ] **Step 1: Update `CalendarHeader` to accept and render toolbar**

Replace the entire `app/components/calendar/CalendarHeader.tsx` content:
```tsx
"use client";

import { MONTHS, THAI_MONTHS } from "@/app/lib/calendarUtils";
import { AnimatePresence, motion } from "motion/react";
import CalendarToolbar, { CalendarTool } from "./CalendarToolbar";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  activeTool: CalendarTool;
  onToolChange: (tool: CalendarTool) => void;
}

export default function CalendarHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onToday,
  activeTool,
  onToolChange,
}: CalendarHeaderProps) {
  const monthName = MONTHS[currentMonth];
  const thaiMonth = THAI_MONTHS[monthName];

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          <motion.h2
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-semibold text-white min-w-50 text-center"
            title={thaiMonth}
          >
            {monthName} {currentYear}
          </motion.h2>
        </AnimatePresence>

        <button
          type="button"
          onClick={onNextMonth}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <CalendarToolbar activeTool={activeTool} onToolChange={onToolChange} />
        <button
          type="button"
          onClick={onToday}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `activeTool` state and update `CalendarHeader` call in `app/calendar/page.tsx`**

Add after the `expandedDayKey` state (around line 32):
```ts
const [activeTool, setActiveTool] = useState<CalendarTool>("normal");
```

Add the import at the top:
```ts
import { CalendarTool } from "@/app/components/calendar/CalendarToolbar";
```

Update `<CalendarHeader ...>` to pass the new props:
```tsx
<CalendarHeader
  currentMonth={currentMonth}
  currentYear={currentYear}
  onPrevMonth={goToPrevMonth}
  onNextMonth={goToNextMonth}
  onToday={goToToday}
  activeTool={activeTool}
  onToolChange={setActiveTool}
/>
```

Also remove the `prefilledDate` state and replace with `prefilledDateRange`:
```ts
// Remove:
const [prefilledDate, setPrefilledDate] = useState<string | undefined>();

// Add:
const [prefilledDateRange, setPrefilledDateRange] = useState<
  { start: string; end: string } | undefined
>();
```

Update `handleClickEvent` and `handleCloseModal` to use the new state:
```ts
const handleClickEvent = (task: Task) => {
  setEditingTask(task);
  setPrefilledDateRange(undefined);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setEditingTask(null);
  setPrefilledDateRange(undefined);
};
```

Remove `handleDoubleClickDay` entirely.

Update `<TaskModal ...>`:
```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSubmit={handleSubmitTask}
  categories={categories}
  onAddCategory={addCategory}
  editingTask={editingTask}
  prefilledStart={prefilledDateRange?.start}
  prefilledEnd={prefilledDateRange?.end}
  projects={projects}
/>
```

Update the subtitle text in the page:
```tsx
<p className="mt-1 text-sm text-zinc-400">
  View and manage your tasks on the calendar. Use the Add Task tool to create tasks. Drag events to move them.
</p>
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/calendar/page.tsx app/components/calendar/CalendarHeader.tsx
git commit -m "feat: add activeTool state and toolbar to calendar page and header"
```

---

## Task 5: Redesign task bar visuals in `CalendarWeekEvents`

This is the primary render path. Changes the bar from a single category color to gray body + category end-caps, and updates the hover/animate/click logic for tools.

**Files:**
- Modify: `app/components/calendar/CalendarWeekEvents.tsx`

- [ ] **Step 1: Add `activeTool` and `onOpenColorPicker` to the props interface**

Replace `CalendarWeekEventsProps`:
```ts
interface CalendarWeekEventsProps {
  weekDays: string[];
  eventsByLane: Map<number, CalendarEventLayout[]>;
  maxLanes: number;
  onClickEvent: (task: Task) => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onDragStart?: (taskId: string, dateStr: string) => void;
  isResizing?: boolean;
  isDragging?: boolean;
  draggedTaskId?: string;
  previewDates?: string[];
  previewTask?: Task;
  previewCategory?: Category;
  activeTool: CalendarTool;
  onOpenColorPicker: (taskId: string, position: { x: number; y: number }) => void;
}
```

Add import at top:
```ts
import { CalendarTool } from "./CalendarToolbar";
```

- [ ] **Step 2: Destructure new props in the function signature**

```ts
export default function CalendarWeekEvents({
  // ... existing props
  activeTool,
  onOpenColorPicker,
}: CalendarWeekEventsProps) {
```

- [ ] **Step 3: Replace the event `motion.button` render with new end-cap structure**

Replace the entire `motion.button` block (from `<motion.button key={task.id}` to the closing `</motion.button>`) with:
```tsx
<motion.button
  key={task.id}
  type="button"
  onClick={(e) => {
    if (isResizing || isDragging) return;
    e.stopPropagation();
    if (activeTool === "color") {
      onOpenColorPicker(task.id, { x: e.clientX, y: e.clientY });
      return;
    }
    onClickEvent(task);
  }}
  onMouseDown={(e) => {
    if (activeTool === "trim") {
      handleDragMouseDown(e, task.id, task.dueDate.start);
    }
  }}
  title={task.title}
  className={cn(
    "group/event relative text-left text-[11px] leading-tight text-white pointer-events-auto",
    "h-6 rounded-md overflow-hidden",
    activeTool === "trim" && "cursor-grab",
    activeTool === "color" && "cursor-cell",
    activeTool === "normal" && "cursor-pointer",
    isResizing && "select-none",
    isDragTarget && "ring-2 ring-orange-400 ring-offset-1 ring-offset-zinc-900",
  )}
  style={{
    gridColumn: `${startCol} / ${endCol}`,
  }}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{
    opacity: task.completed ? 0.5 : 1,
    scale: isDragTarget ? 1.02 : 1,
  }}
  whileHover={{
    scale: activeTool === "normal" && !isResizing && !isDragging ? 1.05 : 1,
  }}
  transition={{ duration: 0.15 }}
>
  <div style={{ display: "flex", height: "100%", width: "100%" }}>
    {/* Left end-cap — category color, only at span start */}
    {layout.spanStart && (
      <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
    )}
    {/* Body */}
    <div
      style={{
        flex: 1,
        background: task.calendarColor ?? "#3f3f46",
        display: "flex",
        alignItems: "center",
        padding: "0 6px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Resize handles — only in Trim & Move mode */}
      {activeTool === "trim" && onResizeStart && (
        <motion.div
          data-resize-handle="start"
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 z-10"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          onMouseDown={(e) =>
            handleResizeMouseDown(e, task.id, "start", task.dueDate.start)
          }
          whileHover={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          transition={{ duration: 0.15 }}
        />
      )}
      <span
        className={cn("truncate text-[11px]", task.completed && "line-through")}
        style={{ color: "#e4e4e7" }}
      >
        {task.title}
      </span>
      {activeTool === "trim" && onResizeStart && (
        <motion.div
          data-resize-handle="end"
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 z-10"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          onMouseDown={(e) =>
            handleResizeMouseDown(
              e,
              task.id,
              "end",
              task.dueDate.end ?? task.dueDate.start,
            )
          }
          whileHover={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          transition={{ duration: 0.15 }}
        />
      )}
    </div>
    {/* Right end-cap — category color, only at span end */}
    {layout.spanEnd && (
      <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
    )}
  </div>
</motion.button>
```

Note: change `const bgColor = category?.color ?? "#71717a"` to `const categoryColor = category?.color ?? "#71717a"` at the top of the map.

**Important — end-cap visibility for multi-week events:** `CalendarWeekEvents` renders one spanning button per task per week, so `layout.spanStart`/`layout.spanEnd` from `events[0]` may not correctly reflect whether a task actually *starts* or *ends* in this week. Derive it from the actual dates instead:

```ts
const isActualStart = weekDays.includes(task.dueDate.start);
const isActualEnd = weekDays.includes(task.dueDate.end ?? task.dueDate.start);
```

Use `isActualStart` in place of `layout.spanStart` and `isActualEnd` in place of `layout.spanEnd` when deciding whether to render the end-cap divs.

- [ ] **Step 4: Update ghost preview to use end-cap structure**

Replace the ghost preview `motion.div` (the `previewStartCol !== null` block):
```tsx
{previewStartCol !== null && previewEndCol !== null && previewTask && (
  <motion.div
    data-testid="drag-preview"
    className="pointer-events-none h-6 rounded-md overflow-hidden"
    style={{
      gridColumn: `${previewStartCol} / ${previewEndCol}`,
      gridRow: 1,
      opacity: 0.6,
    }}
    initial={{ opacity: 0.4, scale: 1 }}
    animate={{ opacity: 0.6, scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  >
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div style={{ width: 8, background: previewCategory?.color ?? "#71717a", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          background: previewTask.calendarColor ?? "#3f3f46",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          borderTop: "2px dashed rgba(255,255,255,0.4)",
          borderBottom: "2px dashed rgba(255,255,255,0.4)",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, overflow: "hidden",
                       whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {previewTask.title}
        </span>
      </div>
      <div style={{ width: 8, background: previewCategory?.color ?? "#71717a", flexShrink: 0 }} />
    </div>
  </motion.div>
)}
```

- [ ] **Step 5: Build check**

```bash
npx tsc --noEmit
```
Expected: errors about `activeTool` and `onOpenColorPicker` not being passed from CalendarGrid — that's expected for now, will be fixed in Task 8.

- [ ] **Step 6: Commit once wired (after Task 8)**

Hold this commit — bundle with Task 8.

---

## Task 6: Update `DragPreviewEvent` visual

**Files:**
- Modify: `app/components/calendar/DragPreviewEvent.tsx`

- [ ] **Step 1: Replace the render with end-cap structure**

Replace the entire file content:
```tsx
"use client";

import { Category, Task } from "@/app/types/task";
import { motion } from "motion/react";

interface DragPreviewEventProps {
  task: Task;
  category: Category | undefined;
  spanStart: boolean;
  spanEnd: boolean;
  spanMiddle: boolean;
}

export default function DragPreviewEvent({
  task,
  category,
  spanStart,
  spanEnd,
  spanMiddle,
}: DragPreviewEventProps) {
  const categoryColor = category?.color ?? "#71717a";

  // Span connection styles for cell-based (non-overlay) rendering
  const spanStyles: React.CSSProperties = {};
  if (!spanEnd) {
    spanStyles.marginRight = "-5px";
    spanStyles.paddingRight = "5px";
  }
  if (!spanStart) {
    spanStyles.marginLeft = "-5px";
    spanStyles.paddingLeft = "5px";
  }

  return (
    <motion.div
      className="h-6 w-full pointer-events-none z-10 overflow-hidden rounded-md"
      style={{ opacity: 0.55, ...spanStyles }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 0.55, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div style={{ display: "flex", height: "100%", width: "100%" }}>
        {spanStart && (
          <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
        )}
        <div
          style={{
            flex: 1,
            background: task.calendarColor ?? "#3f3f46",
            borderTop: "2px dashed rgba(255,255,255,0.4)",
            borderBottom: "2px dashed rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            padding: "0 6px",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11,
                         overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {spanStart ? task.title : ""}
          </span>
        </div>
        {spanEnd && (
          <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/components/calendar/DragPreviewEvent.tsx
git commit -m "feat: update DragPreviewEvent to end-cap visual structure"
```

---

## Task 7: Update `CalendarEventPopover` event rows

**Files:**
- Modify: `app/components/calendar/CalendarEventPopover.tsx`

- [ ] **Step 1: Replace the event row color indicator with end-cap mini-bar**

In `CalendarEventPopover.tsx`, replace the `<button>` content inside the events map:

Current:
```tsx
<div
  className="h-2.5 w-2.5 shrink-0 rounded-sm"
  style={{ backgroundColor: event.category?.color ?? "#71717a" }}
/>
<span className={cn("truncate", event.task.completed && "line-through")}>
  {event.task.title}
</span>
```

Replace with a mini end-cap bar:
```tsx
<div style={{ display: "flex", borderRadius: 3, overflow: "hidden", height: 20, flex: 1, minWidth: 0 }}>
  <div style={{ width: 6, background: event.category?.color ?? "#71717a", flexShrink: 0 }} />
  <div
    style={{
      flex: 1,
      background: event.task.calendarColor ?? "#3f3f46",
      display: "flex",
      alignItems: "center",
      padding: "0 5px",
    }}
  >
    <span
      className={cn("truncate text-[10px]", event.task.completed && "line-through")}
      style={{ color: "#e4e4e7" }}
    >
      {event.task.title}
    </span>
  </div>
  <div style={{ width: 6, background: event.category?.color ?? "#71717a", flexShrink: 0 }} />
</div>
```

Also remove the `gap-2 px-2 py-1.5` classes from the button since the bar is now full-width. Keep `rounded-md hover:bg-zinc-700 transition-colors` and the `opacity-50` for completed. Update the button className:
```tsx
className={cn(
  "flex items-center rounded-md py-1 text-left hover:bg-zinc-700 transition-colors w-full",
  event.task.completed && "opacity-50",
)}
```

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/components/calendar/CalendarEventPopover.tsx
git commit -m "feat: update CalendarEventPopover rows to end-cap visual structure"
```

---

## Task 8: Gate drag/resize to Trim tool and wire `CalendarGrid`

**Files:**
- Modify: `app/components/calendar/CalendarGrid.tsx`
- Modify: `app/components/calendar/CalendarDayCell.tsx`
- Modify: `app/calendar/page.tsx`

- [ ] **Step 1: Update `CalendarGridProps` — add `activeTool`, remove `onDoubleClickDay`, make resize optional**

Replace the interface in `CalendarGrid.tsx`:
```ts
interface CalendarGridProps {
  grid: CalendarDay[][];
  activeTool: CalendarTool;
  onClickEvent: (task: Task) => void;
  expandedDayKey: string | null;
  onExpandDay: (dayKey: string | null) => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onResizeHover?: (dateStr: string) => void;
  resizeState: ResizeState | null;
  onDragStart?: (taskId: string, dateStr: string) => void;
  onDragHover?: (dateStr: string) => void;
  dragState?: DragState | null;
  previewDates?: string[];
  draggedTask?: Task;
  draggedCategory?: Category;
  projects?: Project[];
  onOpenColorPicker: (taskId: string, position: { x: number; y: number }) => void;
  addTaskPreviewDates?: Set<string>;
  onAddTaskMouseDown?: (date: string) => void;
  onAddTaskMouseEnter?: (date: string) => void;
}
```

Add import:
```ts
import { CalendarTool } from "./CalendarToolbar";
```

- [ ] **Step 2: Update `CalendarGrid` function signature and cursor class**

```ts
export default function CalendarGrid({
  grid,
  activeTool,
  onClickEvent,
  expandedDayKey,
  onExpandDay,
  onResizeStart,
  onResizeHover,
  resizeState,
  onDragStart,
  onDragHover,
  dragState,
  previewDates,
  draggedTask,
  draggedCategory,
  projects = [],
  onOpenColorPicker,
  addTaskPreviewDates,
  onAddTaskMouseDown,
  onAddTaskMouseEnter,
}: CalendarGridProps) {
```

Add cursor class lookup after the `isDragging` variable:
```ts
const cursorClass: Record<CalendarTool, string> = {
  normal: "cursor-default",
  add: "cursor-crosshair",
  trim: "cursor-cell",
  color: "cursor-cell",
};
```

Apply to the outer container div:
```tsx
<div className={`overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 ${cursorClass[activeTool]}`}>
```

- [ ] **Step 3: Pass `activeTool` and `onOpenColorPicker` to `CalendarWeekEvents`**

In the `CalendarWeekEvents` render, add the new props:
```tsx
<CalendarWeekEvents
  weekDays={weekDays}
  eventsByLane={eventsByLane}
  maxLanes={MAX_VISIBLE_EVENTS}
  onClickEvent={onClickEvent}
  onResizeStart={onResizeStart}
  onDragStart={onDragStart}
  isResizing={isResizing}
  isDragging={isDragging}
  draggedTaskId={dragState?.taskId}
  previewDates={previewDates}
  previewTask={draggedTask}
  previewCategory={draggedCategory}
  activeTool={activeTool}
  onOpenColorPicker={onOpenColorPicker}
/>
```

- [ ] **Step 4: Pass add-task props and `isInAddRange` to `CalendarDayCell`**

In the day cells render, pass add-task props:
```tsx
<CalendarDayCell
  day={day}
  onClickEvent={onClickEvent}
  isExpanded={expandedDayKey === day.date}
  onExpandDay={onExpandDay}
  onResizeStart={onResizeStart}
  onResizeHover={onResizeHover}
  onDragStart={onDragStart}
  onDragHover={onDragHover}
  isResizing={isResizing}
  isResizeTarget={isResizing && resizeState.currentDateStr === day.date}
  isDragging={isDragging}
  isDragTarget={isDragging && dragState?.currentDate === day.date}
  draggedTaskId={dragState?.taskId}
  previewData={previewMap.get(day.date)}
  hideEvents={true}
  isInAddRange={addTaskPreviewDates?.has(day.date) ?? false}
  onAddTaskMouseDown={onAddTaskMouseDown}
  onAddTaskMouseEnter={onAddTaskMouseEnter}
/>
```

Note: `resizeState.currentDateStr` requires a null check — use `isResizing && resizeState ? resizeState.currentDateStr === day.date : false`.

- [ ] **Step 5: Update `CalendarDayCell` props interface and implementation**

In `app/components/calendar/CalendarDayCell.tsx`, update the interface:
```ts
interface CalendarDayCellProps {
  day: CalendarDay;
  onClickEvent: (task: Task) => void;          // onDoubleClickDay removed
  isExpanded: boolean;
  onExpandDay: (dayKey: string | null) => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onResizeHover?: (dateStr: string) => void;
  onDragStart?: (taskId: string, dateStr: string) => void;
  onDragHover?: (dateStr: string) => void;
  isResizing?: boolean;
  isResizeTarget?: boolean;
  isDragging?: boolean;
  isDragTarget?: boolean;
  draggedTaskId?: string;
  previewData?: DragPreviewData;
  hideEvents?: boolean;
  isInAddRange?: boolean;                      // NEW
  onAddTaskMouseDown?: (date: string) => void; // NEW
  onAddTaskMouseEnter?: (date: string) => void; // NEW
}
```

Update function signature to match (remove `onDoubleClickDay`, add new props).

Remove the `onDoubleClick` handler from `motion.div`.

Update `onMouseEnter` to include add-task:
```ts
onMouseEnter={() => {
  if (isResizing) {
    onResizeHover?.(date);
  } else if (isDragging) {
    onDragHover?.(date);
  } else {
    onAddTaskMouseEnter?.(date);
    if (hasOverflow) onExpandDay(date);
  }
}}
```

Add `onMouseDown` to `motion.div`:
```ts
onMouseDown={() => {
  onAddTaskMouseDown?.(date);
}}
```

Add the orange range highlight overlay just before the closing `</motion.div>`:
```tsx
{isInAddRange && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(249, 115, 22, 0.15)",
      pointerEvents: "none",
    }}
  />
)}
```

- [ ] **Step 6: Update `page.tsx` to pass new props to `CalendarGrid`**

In `app/calendar/page.tsx`, update `handleDragStart`/`handleResizeStart` to be conditional on tool:
```ts
// Gate drag to Trim tool
const handleDragStart = activeTool === "trim"
  ? (taskId: string, dateStr: string) => {
      if (isResizing) return;
      startDrag(taskId, dateStr);
    }
  : undefined;

const handleDragHover = activeTool === "trim"
  ? (dateStr: string) => {
      if (isResizing) return;
      updateDrag(dateStr);
    }
  : undefined;

const handleResizeStart = activeTool === "trim"
  ? (taskId: string, edge: "start" | "end", dateStr: string) => {
      if (isDragging) return;
      startResize(taskId, edge, dateStr);
    }
  : undefined;

const handleResizeHover = activeTool === "trim"
  ? (dateStr: string) => {
      if (isDragging) return;
      updateResize(dateStr);
    }
  : undefined;
```

Update `<CalendarGrid ...>`:
```tsx
<CalendarGrid
  grid={grid}
  activeTool={activeTool}
  onClickEvent={handleClickEvent}
  expandedDayKey={expandedDayKey}
  onExpandDay={setExpandedDayKey}
  onResizeStart={handleResizeStart}
  onResizeHover={handleResizeHover}
  resizeState={resizeState}
  onDragStart={handleDragStart}
  onDragHover={handleDragHover}
  dragState={dragState}
  previewDates={previewDates}
  draggedTask={previewTask}
  draggedCategory={previewCategory}
  projects={projects}
  onOpenColorPicker={() => {}} // placeholder — wired in Task 13
  addTaskPreviewDates={undefined} // placeholder — wired in Task 10
/>
```

- [ ] **Step 7: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add app/components/calendar/CalendarGrid.tsx app/components/calendar/CalendarDayCell.tsx \
  app/calendar/page.tsx app/components/calendar/CalendarWeekEvents.tsx
git commit -m "feat: gate drag/resize to Trim tool, add tool prop threading to calendar grid"
```

---

## Task 9: Build `useAddTaskDrag` hook

**Files:**
- Create: `app/hooks/useAddTaskDrag.ts`
- Test: `app/__tests__/useAddTaskDrag.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `app/__tests__/useAddTaskDrag.test.ts`:
```ts
import { act, renderHook } from "@testing-library/react";
import { useAddTaskDrag } from "@/app/hooks/useAddTaskDrag";

describe("useAddTaskDrag", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useAddTaskDrag(jest.fn()));
    expect(result.current.dragState.isDragging).toBe(false);
    expect(result.current.dragState.startDate).toBeNull();
    expect(result.current.dragState.endDate).toBeNull();
  });

  it("sets isDragging and startDate on mouseDown", () => {
    const { result } = renderHook(() => useAddTaskDrag(jest.fn()));
    act(() => { result.current.handleMouseDown("2026-03-10"); });
    expect(result.current.dragState.isDragging).toBe(true);
    expect(result.current.dragState.startDate).toBe("2026-03-10");
  });

  it("updates endDate on mouseEnter while dragging", () => {
    const { result } = renderHook(() => useAddTaskDrag(jest.fn()));
    act(() => { result.current.handleMouseDown("2026-03-10"); });
    act(() => { result.current.handleMouseEnter("2026-03-15"); });
    expect(result.current.dragState.endDate).toBe("2026-03-15");
  });

  it("mouseEnter does nothing when not dragging", () => {
    const { result } = renderHook(() => useAddTaskDrag(jest.fn()));
    act(() => { result.current.handleMouseEnter("2026-03-15"); });
    expect(result.current.dragState.endDate).toBeNull();
  });

  it("normalizes date range so start <= end on complete", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAddTaskDrag(onComplete));
    act(() => { result.current.handleMouseDown("2026-03-15"); });
    act(() => { result.current.handleMouseEnter("2026-03-10"); });
    // Simulate mouseup via the global listener
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(onComplete).toHaveBeenCalledWith({ start: "2026-03-10", end: "2026-03-15" });
  });

  it("calls onComplete with same start/end for single-day selection", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useAddTaskDrag(onComplete));
    act(() => { result.current.handleMouseDown("2026-03-10"); });
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(onComplete).toHaveBeenCalledWith({ start: "2026-03-10", end: "2026-03-10" });
  });

  it("resets state after mouseup", () => {
    const { result } = renderHook(() => useAddTaskDrag(jest.fn()));
    act(() => { result.current.handleMouseDown("2026-03-10"); });
    act(() => { window.dispatchEvent(new MouseEvent("mouseup")); });
    expect(result.current.dragState.isDragging).toBe(false);
    expect(result.current.dragState.startDate).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest useAddTaskDrag --no-coverage
```
Expected: FAIL — module not found

- [ ] **Step 3: Create `app/hooks/useAddTaskDrag.ts`**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

interface AddTaskDragState {
  isDragging: boolean;
  startDate: string | null;
  endDate: string | null;
}

const INITIAL_STATE: AddTaskDragState = {
  isDragging: false,
  startDate: null,
  endDate: null,
};

export function useAddTaskDrag(
  onComplete: (range: { start: string; end: string }) => void,
) {
  const [dragState, setDragState] = useState<AddTaskDragState>(INITIAL_STATE);

  const handleMouseDown = useCallback((date: string) => {
    setDragState({ isDragging: true, startDate: date, endDate: date });
  }, []);

  const handleMouseEnter = useCallback((date: string) => {
    setDragState((prev) => {
      if (!prev.isDragging) return prev;
      return { ...prev, endDate: date };
    });
  }, []);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseUp = () => {
      setDragState((prev) => {
        if (!prev.isDragging || !prev.startDate) return INITIAL_STATE;

        const endDate = prev.endDate ?? prev.startDate;
        const start = prev.startDate < endDate ? prev.startDate : endDate;
        const end = prev.startDate < endDate ? endDate : prev.startDate;

        // Queue the callback after render via a timeout to avoid setState-in-effect
        setTimeout(() => onComplete({ start, end }), 0);

        return INITIAL_STATE;
      });
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [dragState.isDragging, onComplete]);

  return { dragState, handleMouseDown, handleMouseEnter };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest useAddTaskDrag --no-coverage
```
Expected: PASS (all 7 tests)

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useAddTaskDrag.ts app/__tests__/useAddTaskDrag.test.ts
git commit -m "feat: add useAddTaskDrag hook for drag-to-create date range"
```

---

## Task 10: Wire Add Task tool into `page.tsx`

**Files:**
- Modify: `app/calendar/page.tsx`

- [ ] **Step 1: Import and instantiate `useAddTaskDrag` in `page.tsx`**

Add import:
```ts
import { useAddTaskDrag } from "@/app/hooks/useAddTaskDrag";
```

Add after the drag/resize hook instantiations:
```ts
const handleAddTaskComplete = useCallback(
  (range: { start: string; end: string }) => {
    setPrefilledDateRange(range);
    setIsModalOpen(true);
  },
  [],
);

const { dragState: addTaskDragState, handleMouseDown: handleAddTaskMouseDown,
        handleMouseEnter: handleAddTaskMouseEnter } = useAddTaskDrag(handleAddTaskComplete);
```

- [ ] **Step 2: Compute `addTaskPreviewDates` set**

Add after the `previewDates` computation:
```ts
const addTaskPreviewDates = useMemo((): Set<string> => {
  const { isDragging, startDate, endDate } = addTaskDragState;
  if (!isDragging || !startDate) return new Set();

  const effectiveEnd = endDate ?? startDate;
  const start = startDate <= effectiveEnd ? startDate : effectiveEnd;
  const end = startDate <= effectiveEnd ? effectiveEnd : startDate;

  const dates = new Set<string>();
  const current = new Date(start);
  const endD = new Date(end);
  while (current <= endD) {
    dates.add(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}, [addTaskDragState]);
```

- [ ] **Step 3: Pass add-task props to `CalendarGrid`**

Update `<CalendarGrid ...>`:
```tsx
addTaskPreviewDates={activeTool === "add" ? addTaskPreviewDates : undefined}
onAddTaskMouseDown={activeTool === "add" ? handleAddTaskMouseDown : undefined}
onAddTaskMouseEnter={activeTool === "add" ? handleAddTaskMouseEnter : undefined}
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/calendar/page.tsx
git commit -m "feat: wire Add Task tool drag-to-create into calendar page"
```

---

## Task 11: Build `useTaskColorPicker` hook

**Files:**
- Create: `app/hooks/useTaskColorPicker.ts`
- Test: `app/__tests__/useTaskColorPicker.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `app/__tests__/useTaskColorPicker.test.ts`:
```ts
import { act, renderHook } from "@testing-library/react";
import { useTaskColorPicker } from "@/app/hooks/useTaskColorPicker";

describe("useTaskColorPicker", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useTaskColorPicker());
    expect(result.current.pickerState.openTaskId).toBeNull();
    expect(result.current.pickerState.anchorPosition).toBeNull();
  });

  it("opens for a task with position", () => {
    const { result } = renderHook(() => useTaskColorPicker());
    act(() => result.current.openPicker("task-1", { x: 100, y: 200 }));
    expect(result.current.pickerState.openTaskId).toBe("task-1");
    expect(result.current.pickerState.anchorPosition).toEqual({ x: 100, y: 200 });
  });

  it("closes the picker", () => {
    const { result } = renderHook(() => useTaskColorPicker());
    act(() => result.current.openPicker("task-1", { x: 100, y: 200 }));
    act(() => result.current.closePicker());
    expect(result.current.pickerState.openTaskId).toBeNull();
    expect(result.current.pickerState.anchorPosition).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest useTaskColorPicker --no-coverage
```
Expected: FAIL

- [ ] **Step 3: Create `app/hooks/useTaskColorPicker.ts`**

```ts
"use client";

import { useCallback, useState } from "react";

interface ColorPickerState {
  openTaskId: string | null;
  anchorPosition: { x: number; y: number } | null;
}

export function useTaskColorPicker() {
  const [pickerState, setPickerState] = useState<ColorPickerState>({
    openTaskId: null,
    anchorPosition: null,
  });

  const openPicker = useCallback(
    (taskId: string, position: { x: number; y: number }) => {
      setPickerState({ openTaskId: taskId, anchorPosition: position });
    },
    [],
  );

  const closePicker = useCallback(() => {
    setPickerState({ openTaskId: null, anchorPosition: null });
  }, []);

  return { pickerState, openPicker, closePicker };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest useTaskColorPicker --no-coverage
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useTaskColorPicker.ts app/__tests__/useTaskColorPicker.test.ts
git commit -m "feat: add useTaskColorPicker hook"
```

---

## Task 12: Build `CalendarColorPickerPopover` component

**Files:**
- Create: `app/components/calendar/CalendarColorPickerPopover.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { HexColorPicker } from "react-colorful";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CalendarColorPickerPopoverProps {
  openTaskId: string | null;
  anchorPosition: { x: number; y: number } | null;
  tasks: Task[];
  onClose: () => void;
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
}

export default function CalendarColorPickerPopover({
  openTaskId,
  anchorPosition,
  tasks,
  onClose,
  updateTask,
}: CalendarColorPickerPopoverProps) {
  if (!openTaskId || !anchorPosition) return null;

  const task = tasks.find((t) => t.id === openTaskId);
  if (!task) return null;

  return (
    <ColorPickerPopoverContent
      task={task}
      anchorPosition={anchorPosition}
      onClose={onClose}
      updateTask={updateTask}
    />
  );
}

function ColorPickerPopoverContent({
  task,
  anchorPosition,
  onClose,
  updateTask,
}: {
  task: Task;
  anchorPosition: { x: number; y: number };
  onClose: () => void;
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
}) {
  const POPOVER_W = 220;
  const POPOVER_H = 280;

  const position = useMemo(() => {
    const { x, y } = anchorPosition;
    const left = x + POPOVER_W > window.innerWidth - 16 ? x - POPOVER_W : x;
    const top = y + 8 + POPOVER_H > window.innerHeight - 16 ? y - POPOVER_H : y + 8;
    return { left, top };
  }, [anchorPosition]);

  const initialColor = task.calendarColor ?? "#3f3f46";
  const [color, setColor] = useState(initialColor);
  const [hexInput, setHexInput] = useState(initialColor);

  const handleColorChange = useCallback(
    (hex: string) => {
      setColor(hex);
      setHexInput(hex);
      updateTask(task.id, { calendarColor: hex });
    },
    [task.id, updateTask],
  );

  const handleHexInputBlur = () => {
    const isValid = /^#[0-9a-fA-F]{6}$/.test(hexInput);
    if (isValid) {
      handleColorChange(hexInput);
    } else {
      setHexInput(color); // revert to last valid
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
        }}
        onClick={onClose}
      />
      {/* Popover panel */}
      <div
        style={{
          position: "fixed",
          left: position.left,
          top: position.top,
          zIndex: 100,
          width: POPOVER_W,
          background: "rgb(39, 39, 42)",
          border: "1px solid rgb(63, 63, 70)",
          borderRadius: 8,
          padding: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ color: "rgb(161,161,170)", fontSize: 11, marginBottom: 8,
                    fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Task color
        </p>
        <HexColorPicker color={color} onChange={handleColorChange} style={{ width: "100%" }} />
        <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: color,
                        border: "1px solid rgb(63,63,70)", flexShrink: 0 }} />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexInputBlur}
            style={{
              flex: 1,
              background: "rgb(24,24,27)",
              border: "1px solid rgb(63,63,70)",
              borderRadius: 4,
              padding: "4px 8px",
              color: "rgb(228,228,231)",
              fontSize: 12,
              fontFamily: "monospace",
              outline: "none",
            }}
            maxLength={7}
            spellCheck={false}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 10,
            width: "100%",
            background: "rgb(63,63,70)",
            border: "none",
            borderRadius: 4,
            padding: "5px 0",
            color: "rgb(161,161,170)",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/calendar/CalendarColorPickerPopover.tsx
git commit -m "feat: add CalendarColorPickerPopover component with HexColorPicker"
```

---

## Task 13: Wire Color Bucket tool into `page.tsx`

**Files:**
- Modify: `app/calendar/page.tsx`

- [ ] **Step 1: Import and instantiate `useTaskColorPicker`**

Add import:
```ts
import { useTaskColorPicker } from "@/app/hooks/useTaskColorPicker";
import CalendarColorPickerPopover from "@/app/components/calendar/CalendarColorPickerPopover";
```

Add after the add-task hook instantiation:
```ts
const { pickerState, openPicker, closePicker } = useTaskColorPicker();
```

- [ ] **Step 2: Pass `onOpenColorPicker` to `CalendarGrid`**

Replace the placeholder `onOpenColorPicker={() => {}}` with:
```tsx
onOpenColorPicker={activeTool === "color" ? openPicker : () => {}}
```

- [ ] **Step 3: Render `CalendarColorPickerPopover` in the page JSX**

Add inside the return, after `<TrashDropZone .../>` and before `<TaskModal .../>`:
```tsx
{/* Color picker popover — Color Bucket tool */}
<CalendarColorPickerPopover
  openTaskId={pickerState.openTaskId}
  anchorPosition={pickerState.anchorPosition}
  tasks={tasks}
  onClose={closePicker}
  updateTask={updateTask}
/>
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Full test suite**

```bash
npx jest --no-coverage
```
Expected: all existing tests pass + new tests pass

- [ ] **Step 6: Commit**

```bash
git add app/calendar/page.tsx
git commit -m "feat: wire Color Bucket tool — color picker popover on calendar page"
```

---

## Task 14: Update `CalendarEvent.tsx` (structural correctness)

`CalendarEvent` is not in the active render path (`hideEvents` is always `true`), but update it for structural correctness in case that changes.

**Files:**
- Modify: `app/components/calendar/CalendarEvent.tsx`

- [ ] **Step 1: Read current file, replace single-color bar with end-cap structure**

Open `app/components/calendar/CalendarEvent.tsx`. Find where `backgroundColor` is set using `category?.color`. Replace the inner content of the event button with the same end-cap structure used in `CalendarWeekEvents` (Task 5, Step 3), but without the `activeTool`-gated resize handles (keep them always visible). Use `task.calendarColor ?? "#3f3f46"` for body and `category?.color ?? "#71717a"` for end-caps.

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/components/calendar/CalendarEvent.tsx
git commit -m "feat: update CalendarEvent to end-cap structure (structural alignment)"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Manual smoke test**
  - Open calendar page — toolbar appears with 4 buttons
  - Switch to Normal: task bars are gray with orange end-caps. Hovering scales up tasks. Single-click opens edit modal.
  - Switch to Add Task: drag across days highlights range in orange, releasing opens new task modal with dates pre-filled
  - Switch to Trim & Move: drag and resize handles work as before. Normal hover scale is disabled.
  - Switch to Color: clicking a task opens color picker popover. Changing color updates the task bar body. End-caps stay as category color. Color persists after page refresh.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete calendar tool system implementation"
```

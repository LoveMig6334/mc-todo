import { Category, Task } from "./task";

/** A single day in the calendar grid */
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEventLayout[];
}

/** A positioned event within a day cell */
export interface CalendarEventLayout {
  task: Task;
  category: Category | undefined;
  spanStart: boolean; // First day of multi-day event
  spanEnd: boolean; // Last day of multi-day event
  spanMiddle: boolean; // Middle day of multi-day event
  row: number; // Vertical stacking lane (0-based)
}

/** Resize edge being dragged */
export type ResizeEdge = "start" | "end";

/** Active resize state */
export interface ResizeState {
  taskId: string;
  edge: ResizeEdge;
  originalDateStr: string;
  currentDateStr: string;
}

/** Active drag (move) state */
export interface DragState {
  taskId: string;
  originalDate: string; // Where drag started
  currentDate: string; // Current hover target
  offsetDays: number; // Days moved from original
  isOverTrash: boolean; // Hovering over trash drop zone
}

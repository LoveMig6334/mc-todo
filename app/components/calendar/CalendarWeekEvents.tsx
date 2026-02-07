"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout, ResizeEdge } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";
import { motion } from "motion/react";

interface WeekEventData {
  layout: CalendarEventLayout;
  startCol: number; // 1-indexed column start (1-7)
  endCol: number; // 1-indexed column end (1-7)
}

interface CalendarWeekEventsProps {
  /** Week days in YYYY-MM-DD format */
  weekDays: string[];
  /** All events for this week, pre-assigned to lanes */
  eventsByLane: Map<number, CalendarEventLayout[]>;
  /** Maximum lanes to display */
  maxLanes: number;
  /** Event click handler */
  onClickEvent: (task: Task) => void;
  /** Resize start handler */
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  /** Drag start handler */
  onDragStart?: (taskId: string, dateStr: string) => void;
  /** Whether a resize is in progress */
  isResizing?: boolean;
  /** Whether a drag is in progress */
  isDragging?: boolean;
  /** Currently dragged task ID */
  draggedTaskId?: string;
  /** Preview dates for drag/resize ghost (YYYY-MM-DD format) */
  previewDates?: string[];
  /** Task being previewed */
  previewTask?: Task;
  /** Category of the previewed task */
  previewCategory?: Category;
}

/**
 * Renders events for a week using CSS Grid column spanning.
 * Each event spans from its start column to end column seamlessly.
 */
export default function CalendarWeekEvents({
  weekDays,
  eventsByLane,
  maxLanes,
  onClickEvent,
  onResizeStart,
  onDragStart,
  isResizing,
  isDragging,
  draggedTaskId,
  previewDates,
  previewTask,
  previewCategory,
}: CalendarWeekEventsProps) {
  // Build week events with column positions
  const weekEvents: WeekEventData[] = [];

  // Process events by lane to maintain vertical ordering
  for (let lane = 0; lane < maxLanes; lane++) {
    const laneEvents = eventsByLane.get(lane) || [];

    // Group consecutive events by task ID (they're the same multi-day event)
    const taskGroups = new Map<string, CalendarEventLayout[]>();

    for (const event of laneEvents) {
      const existing = taskGroups.get(event.task.id);
      if (existing) {
        existing.push(event);
      } else {
        taskGroups.set(event.task.id, [event]);
      }
    }

    // Convert each task group to a single spanning event
    for (const [, events] of taskGroups) {
      if (events.length === 0) continue;

      // Get start/end columns based on event date ranges
      let startCol = 7;
      let endCol = 0;

      for (const event of events) {
        const start = event.task.dueDate.start;
        const end = event.task.dueDate.end ?? start;

        for (let i = 0; i < weekDays.length; i++) {
          if (weekDays[i] >= start && weekDays[i] <= end) {
            startCol = Math.min(startCol, i);
            endCol = Math.max(endCol, i);
          }
        }
      }

      if (startCol <= endCol) {
        weekEvents.push({
          layout: events[0], // Use first event for task data
          startCol: startCol + 1, // CSS Grid is 1-indexed
          endCol: endCol + 2, // CSS Grid end is exclusive
        });
      }
    }
  }

  // Compute preview column positions if preview data is provided
  let previewStartCol: number | null = null;
  let previewEndCol: number | null = null;

  if (previewDates && previewDates.length > 0 && previewTask) {
    let startIdx = -1;
    let endIdx = -1;

    for (let i = 0; i < weekDays.length; i++) {
      if (previewDates.includes(weekDays[i])) {
        if (startIdx === -1) startIdx = i;
        endIdx = i;
      }
    }

    if (startIdx !== -1) {
      previewStartCol = startIdx + 1; // CSS Grid is 1-indexed
      previewEndCol = endIdx + 2; // CSS Grid end is exclusive
    }
  }

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    taskId: string,
    edge: ResizeEdge,
    dateStr: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(taskId, edge, dateStr);
  };

  const handleDragMouseDown = (
    e: React.MouseEvent,
    taskId: string,
    dateStr: string,
  ) => {
    if (
      (e.target as HTMLElement).closest("[data-resize-handle]") ||
      isResizing ||
      isDragging
    ) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onDragStart?.(taskId, dateStr);
  };

  return (
    <div
      className="absolute inset-x-0 top-6 grid grid-cols-7 gap-0 pointer-events-none z-10"
      style={{ paddingLeft: "1px", paddingRight: "1px" }}
    >
      {weekEvents.map((eventData) => {
        const { layout, startCol, endCol } = eventData;
        const { task, category } = layout;
        const bgColor = category?.color ?? "#71717a";
        const isDragTarget = isDragging && task.id === draggedTaskId;

        return (
          <motion.button
            key={task.id}
            type="button"
            onClick={(e) => {
              if (isResizing || isDragging) return;
              e.stopPropagation();
              onClickEvent(task);
            }}
            onMouseDown={(e) =>
              handleDragMouseDown(e, task.id, task.dueDate.start)
            }
            title={task.title}
            className={cn(
              "group/event relative flex items-center text-left text-[11px] leading-tight text-white cursor-grab pointer-events-auto",
              "h-6 px-1.5 rounded-md",
              isResizing && "select-none",
              isDragTarget &&
                "ring-2 ring-orange-400 ring-offset-1 ring-offset-zinc-900",
            )}
            style={{
              gridColumn: `${startCol} / ${endCol}`,
              backgroundColor: bgColor + "cc",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: task.completed ? 0.5 : 1,
              scale: isDragTarget ? 1.02 : 1,
            }}
            whileHover={{
              scale: isResizing || isDragging ? 1 : 1.01,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            {/* Left resize handle */}
            {onResizeStart && (
              <motion.div
                data-resize-handle="start"
                className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 hover:bg-white/30 z-10"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, task.id, "start", task.dueDate.start)
                }
                whileHover={{ backgroundColor: "rgba(255,255,255,0.4)" }}
                transition={{ duration: 0.15 }}
              />
            )}

            <span className={cn("truncate", task.completed && "line-through")}>
              {task.title}
            </span>

            {/* Right resize handle */}
            {onResizeStart && (
              <motion.div
                data-resize-handle="end"
                className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 hover:bg-white/30 z-10"
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
          </motion.button>
        );
      })}

      {/* Ghost preview for drag/resize operations */}
      {previewStartCol !== null && previewEndCol !== null && previewTask && (
        <motion.div
          data-testid="drag-preview"
          className={cn(
            "flex items-center text-left text-[11px] leading-tight text-white/70 pointer-events-none",
            "h-6 px-1.5 rounded-md",
            "border-2 border-dashed border-white/40",
          )}
          style={{
            gridColumn: `${previewStartCol} / ${previewEndCol}`,
            backgroundColor: (previewCategory?.color ?? "#71717a") + "66", // ~40% opacity
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <span className="truncate">{previewTask.title}</span>
        </motion.div>
      )}
    </div>
  );
}

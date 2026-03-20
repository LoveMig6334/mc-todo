"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout, ResizeEdge } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";
import { motion } from "motion/react";
import { CalendarTool } from "./CalendarToolbar";

interface WeekEventData {
  layout: CalendarEventLayout;
  startCol: number; // 1-indexed column start (1-7)
  endCol: number; // 1-indexed column end (1-7)
}

interface CalendarWeekEventsProps {
  weekDays: string[];
  eventsByLane: Map<number, CalendarEventLayout[]>;
  maxLanes: number;
  activeTool: CalendarTool;
  onClickEvent: (task: Task) => void;
  onOpenColorPicker?: (taskId: string, position: { x: number; y: number }) => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onDragStart?: (taskId: string, dateStr: string) => void;
  isResizing?: boolean;
  isDragging?: boolean;
  draggedTaskId?: string;
  previewDates?: string[];
  previewTask?: Task;
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
  activeTool,
  onClickEvent,
  onOpenColorPicker,
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
        const { task, category, spanStart, spanEnd } = layout;

        // Hide the original event when a preview is active for it
        if (previewTask?.id === task.id) {
          return null;
        }

        const categoryColor = category?.color ?? "#71717a";
        const bodyColor = task.calendarColor ?? "#3f3f46";
        const isDragTarget = isDragging && task.id === draggedTaskId;

        return (
          <motion.button
            key={task.id}
            type="button"
            onClick={(e) => {
              if (isResizing || isDragging) return;
              e.stopPropagation();
              if (activeTool === "color") {
                onOpenColorPicker?.(task.id, { x: e.clientX, y: e.clientY });
                return;
              }
              onClickEvent(task);
            }}
            onMouseDown={(e) =>
              handleDragMouseDown(e, task.id, task.dueDate.start)
            }
            title={task.title}
            className={cn(
              "group/event relative text-left pointer-events-auto",
              "h-6",
              activeTool === "trim" ? "cursor-cell" : activeTool === "color" ? "cursor-cell" : "cursor-grab",
              isResizing && "select-none",
              isDragTarget &&
                "ring-2 ring-orange-400 ring-offset-1 ring-offset-zinc-900",
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
            <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: "100%", width: "100%" }}>
              {/* Left end-cap */}
              {spanStart && (
                <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
              )}

              {/* Body */}
              <div style={{
                flex: 1,
                background: bodyColor,
                display: "flex",
                alignItems: "center",
                padding: "0 6px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Left resize handle */}
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

                <span style={{
                  color: "#e4e4e7",
                  fontSize: 11,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                className={cn(task.completed && "line-through")}
                >
                  {task.title}
                </span>

                {/* Right resize handle */}
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

              {/* Right end-cap */}
              {spanEnd && (
                <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />
              )}
            </div>
          </motion.button>
        );
      })}

      {/* Ghost preview for drag/resize operations */}
      {previewStartCol !== null && previewEndCol !== null && previewTask && (() => {
        const prevCategoryColor = previewCategory?.color ?? "#71717a";
        const prevBodyColor = previewTask.calendarColor ?? "#3f3f46";
        // Determine which ends are visible in this week
        const prevSpanStart = previewDates ? previewDates[0] === weekDays[previewStartCol - 1] && previewDates[0] <= (previewDates[previewDates.length - 1] ?? previewDates[0]) : true;
        const prevSpanEnd = previewDates ? previewDates[previewDates.length - 1] === weekDays[previewEndCol - 2] : true;

        return (
          <motion.div
            data-testid="drag-preview"
            className="pointer-events-none h-6"
            style={{
              gridColumn: `${previewStartCol} / ${previewEndCol}`,
              gridRow: 1,
            }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: "100%", opacity: 0.5 }}>
              {prevSpanStart && <div style={{ width: 8, background: prevCategoryColor, flexShrink: 0 }} />}
              <div style={{ flex: 1, background: prevBodyColor, display: "flex", alignItems: "center", padding: "0 6px" }}>
                <span style={{ color: "#e4e4e7", fontSize: 11, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {previewTask.title}
                </span>
              </div>
              {prevSpanEnd && <div style={{ width: 8, background: prevCategoryColor, flexShrink: 0 }} />}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

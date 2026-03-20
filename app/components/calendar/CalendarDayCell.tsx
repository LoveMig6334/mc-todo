"use client";

import { MAX_VISIBLE_EVENTS } from "@/app/lib/calendarUtils";
import { cn } from "@/app/lib/utils";
import {
  CalendarDay,
  CalendarEventLayout,
  DragPreviewData,
  ResizeEdge,
} from "@/app/types/calendar";
import { Task } from "@/app/types/task";
import { motion } from "motion/react";
import CalendarEvent from "./CalendarEvent";
import DragPreviewEvent from "./DragPreviewEvent";

interface CalendarDayCellProps {
  day: CalendarDay;
  onClickEvent: (task: Task) => void;
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
  /** When true, events are rendered in CalendarWeekEvents overlay instead */
  hideEvents?: boolean;
  /** Add Task tool */
  isInAddRange?: boolean;
  onAddTaskMouseDown?: (date: string) => void;
  onAddTaskMouseEnter?: (date: string) => void;
}

export default function CalendarDayCell({
  day,
  onClickEvent,
  isExpanded,
  onExpandDay,
  onResizeStart,
  onResizeHover,
  onDragStart,
  onDragHover,
  isResizing,
  isResizeTarget,
  isDragging,
  isDragTarget,
  draggedTaskId,
  previewData,
  hideEvents = false,
  isInAddRange = false,
  onAddTaskMouseDown,
  onAddTaskMouseEnter,
}: CalendarDayCellProps) {
  const { date, dayOfMonth, isCurrentMonth, isToday, events } = day;

  const visibleEvents = events.slice(0, MAX_VISIBLE_EVENTS);
  const collapsedEvents = events.slice(MAX_VISIBLE_EVENTS);
  const hasOverflow = collapsedEvents.length > 0;

  // Build a sparse array so events render at their correct lane positions
  // This preserves vertical spacing for multi-day event alignment
  const maxRow = events.length > 0 ? Math.max(...events.map((e) => e.row)) : -1;
  const slotCount = Math.min(maxRow + 1, MAX_VISIBLE_EVENTS);
  const slots: (CalendarEventLayout | null)[] = Array(slotCount).fill(null);
  for (const event of visibleEvents) {
    if (event.row < slotCount) {
      slots[event.row] = event;
    }
  }

  const isActiveTarget = isResizeTarget || isDragTarget;

  return (
    <motion.div
      className={cn(
        "relative flex min-h-30 flex-col border border-zinc-800 pt-1 overflow-visible",
        !isCurrentMonth && "opacity-40",
        isToday && "ring-1 ring-inset ring-orange-500",
        (isResizing || isDragging) && "select-none",
      )}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgb(39, 39, 42)",
      }}
      animate={{
        backgroundColor: isActiveTarget
          ? "rgba(249, 115, 22, 0.15)"
          : "rgba(0, 0, 0, 0)",
        borderColor: isActiveTarget ? "rgb(249, 115, 22)" : "rgb(39, 39, 42)",
      }}
      transition={{ duration: 0.15 }}
      onMouseDown={() => {
        onAddTaskMouseDown?.(date);
      }}
      onMouseEnter={() => {
        if (isResizing) {
          onResizeHover?.(date);
        } else if (isDragging) {
          onDragHover?.(date);
        } else if (onAddTaskMouseEnter) {
          onAddTaskMouseEnter(date);
        } else if (hasOverflow) {
          onExpandDay(date);
        }
      }}
      onMouseLeave={() =>
        isExpanded && !isResizing && !isDragging && onExpandDay(null)
      }
    >
      {/* Add Task range overlay */}
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

      {/* Day number */}
      <span
        className={cn(
          "mb-1 px-1 text-xs font-medium",
          isToday ? "text-orange-500" : "text-zinc-400",
          !isCurrentMonth && "text-zinc-600",
        )}
      >
        {dayOfMonth}
      </span>

      {/* Event slots - only rendered when not using overlay */}
      {!hideEvents && (
        <div className="flex flex-1 flex-col gap-0.5 overflow-visible relative z-0">
          {/* Drag preview - renders at top when this cell is in preview range */}
          {previewData && (
            <DragPreviewEvent
              task={previewData.task}
              category={previewData.category}
              spanStart={previewData.spanStart}
              spanEnd={previewData.spanEnd}
              spanMiddle={previewData.spanMiddle}
            />
          )}

          {slots.map((slot, idx) =>
            slot ? (
              <CalendarEvent
                key={slot.task.id}
                layout={slot}
                onClick={() => onClickEvent(slot.task)}
                onResizeStart={
                  onResizeStart
                    ? (taskId, edge) => onResizeStart(taskId, edge, date)
                    : undefined
                }
                onDragStart={
                  onDragStart
                    ? (taskId) => onDragStart(taskId, date)
                    : undefined
                }
                isResizing={isResizing}
                isDragging={isDragging}
                isDragTarget={isDragging && slot.task.id === draggedTaskId}
              />
            ) : (
              <div key={`empty-${idx}`} className="h-6" />
            ),
          )}

          {/* Collapsed events as thin colored lines */}
          {collapsedEvents.length > 0 && (
            <div className="mt-0.5 flex flex-col gap-px">
              {collapsedEvents.map((event) => (
                <motion.div
                  key={event.task.id}
                  className="h-1.5 rounded-sm"
                  style={{
                    backgroundColor:
                      (event.category?.color ?? "#71717a") + "cc",
                  }}
                  title={event.task.title}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spacer when events are hidden to maintain cell height */}
      {hideEvents && <div className="flex-1 min-h-16" />}

      {/* Overflow indicator */}
      {hasOverflow && (
        <button
          type="button"
          className="mt-0.5 text-[10px] text-zinc-500 hover:text-orange-500 transition-colors text-left"
          onClick={(e) => {
            e.stopPropagation();
            onExpandDay(isExpanded ? null : date);
          }}
        >
          +{collapsedEvents.length} more
        </button>
      )}

      {/* Drop target indicator */}
      {isDragTarget && (
        <motion.div
          className="absolute inset-0 pointer-events-none border-2 border-orange-500 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.div>
  );
}

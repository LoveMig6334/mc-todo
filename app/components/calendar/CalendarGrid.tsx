"use client";

import {
  DAYS_OF_WEEK,
  MAX_VISIBLE_EVENTS,
  THAI_DAYS,
} from "@/app/lib/calendarUtils";
import {
  CalendarDay,
  CalendarEventLayout,
  DragPreviewData,
  DragState,
  ResizeEdge,
  ResizeState,
} from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";
import { useMemo } from "react";
import CalendarDayCell from "./CalendarDayCell";
import CalendarEventPopover from "./CalendarEventPopover";
import CalendarWeekEvents from "./CalendarWeekEvents";

interface CalendarGridProps {
  grid: CalendarDay[][];
  onDoubleClickDay: (date: string) => void;
  onClickEvent: (task: Task) => void;
  expandedDayKey: string | null;
  onExpandDay: (dayKey: string | null) => void;
  onResizeStart: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onResizeHover: (dateStr: string) => void;
  resizeState: ResizeState | null;
  onDragStart?: (taskId: string, dateStr: string) => void;
  onDragHover?: (dateStr: string) => void;
  dragState?: DragState | null;
  // Preview data for drag operation
  previewDates?: string[];
  draggedTask?: Task;
  draggedCategory?: Category;
}

export default function CalendarGrid({
  grid,
  onDoubleClickDay,
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
}: CalendarGridProps) {
  const isResizing = resizeState !== null;
  const isDragging = dragState !== null;

  // Build preview data map for each date
  const previewMap = useMemo(() => {
    const map = new Map<string, DragPreviewData>();
    if (!previewDates || !draggedTask || previewDates.length === 0) {
      return map;
    }

    previewDates.forEach((date, idx) => {
      const spanStart = idx === 0;
      const spanEnd = idx === previewDates.length - 1;
      const spanMiddle = !spanStart && !spanEnd;

      map.set(date, {
        task: draggedTask,
        category: draggedCategory,
        spanStart,
        spanEnd,
        spanMiddle,
      });
    });

    return map;
  }, [previewDates, draggedTask, draggedCategory]);

  // Find expanded day data
  const expandedDay = expandedDayKey
    ? grid.flat().find((d) => d.date === expandedDayKey)
    : null;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-zinc-700 bg-zinc-800">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-zinc-400"
            title={THAI_DAYS[day]}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid rows */}
      {grid.map((week, weekIdx) => {
        // Build events by lane for this week
        const eventsByLane = new Map<number, CalendarEventLayout[]>();
        const weekDays = week.map((d) => d.date);

        // Collect all unique events in this week, grouped by lane
        const seenTaskIds = new Set<string>();
        for (const day of week) {
          for (const event of day.events) {
            if (!seenTaskIds.has(event.task.id)) {
              seenTaskIds.add(event.task.id);
              const lane = event.row;
              if (!eventsByLane.has(lane)) {
                eventsByLane.set(lane, []);
              }
              eventsByLane.get(lane)!.push(event);
            }
          }
        }

        return (
          <div key={weekIdx} className="relative">
            {/* Week events overlay using CSS Grid column spanning */}
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
            />

            {/* Day cells (just backgrounds and date numbers) */}
            <div className="grid grid-cols-7">
              {week.map((day) => (
                <div key={day.date} className="relative">
                  <CalendarDayCell
                    day={day}
                    onDoubleClickDay={onDoubleClickDay}
                    onClickEvent={onClickEvent}
                    isExpanded={expandedDayKey === day.date}
                    onExpandDay={onExpandDay}
                    onResizeStart={onResizeStart}
                    onResizeHover={onResizeHover}
                    onDragStart={onDragStart}
                    onDragHover={onDragHover}
                    isResizing={isResizing}
                    isResizeTarget={
                      isResizing && resizeState.currentDateStr === day.date
                    }
                    isDragging={isDragging}
                    isDragTarget={
                      isDragging && dragState?.currentDate === day.date
                    }
                    draggedTaskId={dragState?.taskId}
                    previewData={previewMap.get(day.date)}
                    hideEvents={true}
                  />
                  {/* Popover for expanded day */}
                  {expandedDayKey === day.date &&
                    expandedDay &&
                    !isResizing &&
                    !isDragging && (
                      <CalendarEventPopover
                        events={expandedDay.events}
                        onClickEvent={onClickEvent}
                        onClose={() => onExpandDay(null)}
                      />
                    )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

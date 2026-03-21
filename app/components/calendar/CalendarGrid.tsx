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
import { Category, Project, Task } from "@/app/types/task";
import { useMemo } from "react";
import CalendarDayCell from "./CalendarDayCell";
import CalendarEventPopover from "./CalendarEventPopover";
import { CalendarTool } from "./CalendarToolbar";
import CalendarWeekEvents from "./CalendarWeekEvents";
import ProjectOverlay from "./ProjectOverlay";

export const PAINT_BUCKET_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/%3E%3Cpath d='m5 2 5 5'/%3E%3Cpath d='M2 13h15'/%3E%3Cpath d='M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z'/%3E%3C/svg%3E") 2 22, auto`;

const cursorClass: Record<CalendarTool, string> = {
  normal: "cursor-default",
  add: "cursor-crosshair",
  trim: "cursor-default",
  color: "",
};

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
  onOpenColorPicker?: (
    taskId: string,
    position: { x: number; y: number },
  ) => void;
  // Add Task tool
  onAddTaskMouseDown?: (date: string) => void;
  onAddTaskMouseEnter?: (date: string) => void;
  addTaskPreviewDates?: Set<string>;
}

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
  onAddTaskMouseDown,
  onAddTaskMouseEnter,
  addTaskPreviewDates,
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
    <div
      className={`overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 ${cursorClass[activeTool]}`}
      style={activeTool === "color" ? { cursor: PAINT_BUCKET_CURSOR } : undefined}
    >
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
            {/* Project color overlays — rendered behind all other content */}
            {projects.map((project) => (
              <ProjectOverlay
                key={project.id}
                project={project}
                weekDays={weekDays}
              />
            ))}

            {/* Week events overlay using CSS Grid column spanning */}
            <CalendarWeekEvents
              weekDays={weekDays}
              eventsByLane={eventsByLane}
              maxLanes={MAX_VISIBLE_EVENTS}
              activeTool={activeTool}
              onClickEvent={onClickEvent}
              onOpenColorPicker={onOpenColorPicker}
              onResizeStart={onResizeStart}
              onDragStart={onDragStart}
              isResizing={isResizing}
              isDragging={isDragging}
              draggedTaskId={dragState?.taskId}
              previewDates={previewDates}
              previewTask={draggedTask}
              previewCategory={draggedCategory}
            />

            {/* Day cells (just backgrounds and date numbers) */}
            <div className="grid grid-cols-7">
              {week.map((day) => (
                <div key={day.date} className="relative">
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
                    isInAddRange={addTaskPreviewDates?.has(day.date) ?? false}
                    onAddTaskMouseDown={onAddTaskMouseDown}
                    onAddTaskMouseEnter={onAddTaskMouseEnter}
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

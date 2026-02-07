"use client";

import { DAYS_OF_WEEK, THAI_DAYS } from "@/app/lib/calendarUtils";
import { CalendarDay, ResizeEdge, ResizeState } from "@/app/types/calendar";
import { Task } from "@/app/types/task";
import CalendarDayCell from "./CalendarDayCell";
import CalendarEventPopover from "./CalendarEventPopover";

interface CalendarGridProps {
  grid: CalendarDay[][];
  onDoubleClickDay: (date: string) => void;
  onClickEvent: (task: Task) => void;
  expandedDayKey: string | null;
  onExpandDay: (dayKey: string | null) => void;
  onResizeStart: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onResizeHover: (dateStr: string) => void;
  resizeState: ResizeState | null;
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
}: CalendarGridProps) {
  const isResizing = resizeState !== null;

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
      {grid.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7">
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
                isResizing={isResizing}
                isResizeTarget={
                  isResizing && resizeState.currentDateStr === day.date
                }
              />
              {/* Popover for expanded day */}
              {expandedDayKey === day.date && expandedDay && !isResizing && (
                <CalendarEventPopover
                  events={expandedDay.events}
                  onClickEvent={onClickEvent}
                  onClose={() => onExpandDay(null)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

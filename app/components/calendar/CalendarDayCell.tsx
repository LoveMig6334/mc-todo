"use client";

import { cn } from "@/app/lib/utils";
import { MAX_VISIBLE_EVENTS } from "@/app/lib/calendarUtils";
import { CalendarDay, CalendarEventLayout, ResizeEdge } from "@/app/types/calendar";
import { Task } from "@/app/types/task";
import CalendarEvent from "./CalendarEvent";

interface CalendarDayCellProps {
  day: CalendarDay;
  onDoubleClickDay: (date: string) => void;
  onClickEvent: (task: Task) => void;
  isExpanded: boolean;
  onExpandDay: (dayKey: string | null) => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge, dateStr: string) => void;
  onResizeHover?: (dateStr: string) => void;
  isResizing?: boolean;
  isResizeTarget?: boolean;
}

export default function CalendarDayCell({
  day,
  onDoubleClickDay,
  onClickEvent,
  isExpanded,
  onExpandDay,
  onResizeStart,
  onResizeHover,
  isResizing,
  isResizeTarget,
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

  return (
    <div
      className={cn(
        "relative flex min-h-30 flex-col border border-zinc-800 p-1",
        !isCurrentMonth && "opacity-40",
        isToday && "ring-1 ring-inset ring-orange-500",
        isResizing && "select-none",
        isResizeTarget && "bg-orange-500/10",
      )}
      onDoubleClick={() => {
        if (isResizing) return;
        onDoubleClickDay(date);
      }}
      onMouseEnter={() => {
        if (isResizing) {
          onResizeHover?.(date);
        } else if (hasOverflow) {
          onExpandDay(date);
        }
      }}
      onMouseLeave={() => isExpanded && !isResizing && onExpandDay(null)}
    >
      {/* Day number */}
      <span
        className={cn(
          "mb-1 text-xs font-medium",
          isToday ? "text-orange-500" : "text-zinc-400",
          !isCurrentMonth && "text-zinc-600",
        )}
      >
        {dayOfMonth}
      </span>

      {/* Event slots */}
      <div className="flex flex-1 flex-col gap-0.5">
        {slots.map((slot, idx) =>
          slot ? (
            <CalendarEvent
              key={slot.task.id}
              layout={slot}
              onClick={() => onClickEvent(slot.task)}
              onResizeStart={onResizeStart ? (taskId, edge) => onResizeStart(taskId, edge, date) : undefined}
              isResizing={isResizing}
            />
          ) : (
            <div key={`empty-${idx}`} className="h-6" />
          ),
        )}

        {/* Collapsed events as thin colored lines */}
        {collapsedEvents.length > 0 && (
          <div className="mt-0.5 flex flex-col gap-px">
            {collapsedEvents.map((event) => (
              <div
                key={event.task.id}
                className="h-1.5 rounded-sm"
                style={{
                  backgroundColor: (event.category?.color ?? "#71717a") + "cc",
                }}
                title={event.task.title}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}

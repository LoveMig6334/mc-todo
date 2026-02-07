"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout } from "@/app/types/calendar";
import { Task } from "@/app/types/task";

interface CalendarEventPopoverProps {
  events: CalendarEventLayout[];
  onClickEvent: (task: Task) => void;
  onClose: () => void;
}

export default function CalendarEventPopover({
  events,
  onClickEvent,
  onClose,
}: CalendarEventPopoverProps) {
  if (events.length === 0) return null;

  return (
    <div
      className="absolute left-0 top-0 z-50 w-56 rounded-lg border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
      onMouseLeave={onClose}
    >
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        All events
      </p>
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {events.map((event) => (
          <button
            key={event.task.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClickEvent(event.task);
            }}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-700 transition-colors",
              event.task.completed && "opacity-50",
            )}
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{
                backgroundColor: event.category?.color ?? "#71717a",
              }}
            />
            <span
              className={cn(
                "truncate",
                event.task.completed && "line-through",
              )}
            >
              {event.task.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

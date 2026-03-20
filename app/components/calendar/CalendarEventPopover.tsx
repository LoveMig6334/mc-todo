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
      className="animate-in fade-in absolute left-0 top-0 z-50 w-56 rounded-lg border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
      onMouseLeave={onClose}
    >
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        All events
      </p>
      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {events.map((event) => {
          const categoryColor = event.category?.color ?? "#71717a";
          const bodyColor = event.task.calendarColor ?? "#3f3f46";

          return (
            <button
              key={event.task.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickEvent(event.task);
              }}
              className={cn(
                "w-full rounded-md px-1 py-1 text-left hover:bg-zinc-700 transition-colors",
                event.task.completed && "opacity-50",
              )}
            >
              <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", height: 20 }}>
                <div style={{ width: 6, background: categoryColor, flexShrink: 0 }} />
                <div style={{
                  flex: 1,
                  background: bodyColor,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 5px",
                }}>
                  <span style={{
                    color: "#e4e4e7",
                    fontSize: 10,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                  className={cn(event.task.completed && "line-through")}
                  >
                    {event.task.title}
                  </span>
                </div>
                <div style={{ width: 6, background: categoryColor, flexShrink: 0 }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

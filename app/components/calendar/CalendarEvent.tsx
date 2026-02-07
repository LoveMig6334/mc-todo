"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout } from "@/app/types/calendar";

interface CalendarEventProps {
  layout: CalendarEventLayout;
  onClick: () => void;
}

export default function CalendarEvent({ layout, onClick }: CalendarEventProps) {
  const { task, category, spanStart, spanEnd, spanMiddle } = layout;
  const bgColor = category?.color ?? "#71717a";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={task.title}
      className={cn(
        "group/event relative flex w-full items-center overflow-hidden text-left text-[11px] leading-tight text-white transition-opacity",
        "h-6 px-1.5",
        spanStart && !spanEnd && "rounded-l-md mr-0",
        spanEnd && !spanStart && "rounded-r-md ml-0",
        spanStart && spanEnd && "rounded-md",
        spanMiddle && "rounded-none mx-0",
        task.completed && "opacity-50",
      )}
      style={{ backgroundColor: bgColor + "cc" }}
    >
      <span
        className={cn(
          "truncate",
          task.completed && "line-through",
        )}
      >
        {spanStart ? task.title : ""}
      </span>
    </button>
  );
}

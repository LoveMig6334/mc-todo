"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout, ResizeEdge } from "@/app/types/calendar";

interface CalendarEventProps {
  layout: CalendarEventLayout;
  onClick: () => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge) => void;
  isResizing?: boolean;
}

export default function CalendarEvent({
  layout,
  onClick,
  onResizeStart,
  isResizing,
}: CalendarEventProps) {
  const { task, category, spanStart, spanEnd, spanMiddle } = layout;
  const bgColor = category?.color ?? "#71717a";

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    edge: ResizeEdge,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(task.id, edge);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        if (isResizing) return;
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
      {/* Left resize handle (on start edge) */}
      {spanStart && onResizeStart && (
        <div
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 hover:bg-white/30 transition-opacity z-10"
          onMouseDown={(e) => handleResizeMouseDown(e, "start")}
        />
      )}

      <span
        className={cn(
          "truncate",
          task.completed && "line-through",
        )}
      >
        {spanStart ? task.title : ""}
      </span>

      {/* Right resize handle (on end edge) */}
      {spanEnd && onResizeStart && (
        <div
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 hover:bg-white/30 transition-opacity z-10"
          onMouseDown={(e) => handleResizeMouseDown(e, "end")}
        />
      )}
    </button>
  );
}

"use client";

import { cn } from "@/app/lib/utils";
import { CalendarEventLayout, ResizeEdge } from "@/app/types/calendar";
import { motion } from "motion/react";

interface CalendarEventProps {
  layout: CalendarEventLayout;
  onClick: () => void;
  onResizeStart?: (taskId: string, edge: ResizeEdge) => void;
  onDragStart?: (taskId: string) => void;
  isResizing?: boolean;
  isDragging?: boolean;
  isDragTarget?: boolean;
}

export default function CalendarEvent({
  layout,
  onClick,
  onResizeStart,
  onDragStart,
  isResizing,
  isDragging,
  isDragTarget,
}: CalendarEventProps) {
  const { task, category, spanStart, spanEnd, spanMiddle } = layout;
  const bgColor = category?.color ?? "#71717a";

  // Calculate span connection styles for multi-day events
  // Each cell has a 1px border, so events need to extend ~5px to bridge gaps
  const spanStyles: React.CSSProperties = {};
  if (!spanEnd) {
    // Extend past right edge to connect with next cell
    spanStyles.marginRight = "-5px";
    spanStyles.paddingRight = "5px";
  }
  if (!spanStart) {
    // Pull in from left to connect with previous cell
    spanStyles.marginLeft = "-5px";
    spanStyles.paddingLeft = "5px";
  }

  const handleResizeMouseDown = (e: React.MouseEvent, edge: ResizeEdge) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(task.id, edge);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    // Only start drag if not clicking on resize handles
    if (
      (e.target as HTMLElement).closest("[data-resize-handle]") ||
      isResizing ||
      isDragging
    ) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onDragStart?.(task.id);
  };

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        if (isResizing || isDragging) return;
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={handleDragMouseDown}
      title={task.title}
      // Animation props
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: task.completed ? 0.5 : 1,
        scale: isDragTarget ? 1.05 : 1,
        boxShadow: isDragTarget
          ? "0 8px 25px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.1)",
      }}
      whileHover={{
        scale: isResizing || isDragging ? 1 : 1.02,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        "group/event relative flex w-full items-center overflow-hidden text-left text-[11px] leading-tight text-white cursor-grab z-10",
        "h-6 px-1.5",
        spanStart && !spanEnd && "rounded-l-md",
        spanEnd && !spanStart && "rounded-r-md",
        spanStart && spanEnd && "rounded-md",
        spanMiddle && "rounded-none",
        isResizing && "select-none",
        isDragTarget &&
          "ring-2 ring-orange-400 ring-offset-1 ring-offset-zinc-900",
      )}
      style={{ backgroundColor: bgColor + "cc", ...spanStyles }}
    >
      {/* Left resize handle (on start edge) */}
      {spanStart && onResizeStart && (
        <motion.div
          data-resize-handle="start"
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 z-10"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          onMouseDown={(e) => handleResizeMouseDown(e, "start")}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          transition={{ duration: 0.15 }}
        />
      )}

      <span className={cn("truncate", task.completed && "line-through")}>
        {spanStart ? task.title : ""}
      </span>

      {/* Right resize handle (on end edge) */}
      {spanEnd && onResizeStart && (
        <motion.div
          data-resize-handle="end"
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover/event:opacity-100 z-10"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          onMouseDown={(e) => handleResizeMouseDown(e, "end")}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.button>
  );
}

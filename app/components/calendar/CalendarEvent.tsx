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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: task.completed ? 0.5 : 1,
        scale: isDragTarget ? 1.05 : 1,
      }}
      whileHover={{
        scale: isResizing || isDragging ? 1 : 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        "group/event relative flex w-full items-center overflow-hidden text-left cursor-grab z-10",
        "h-6",
        isResizing && "select-none",
        isDragTarget &&
          "ring-2 ring-orange-400 ring-offset-1 ring-offset-zinc-900",
      )}
      style={spanStyles}
    >
      <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: "100%", width: "100%" }}>
        {spanStart && (
          <div style={{ width: 8, background: bgColor, flexShrink: 0 }} />
        )}
        <div style={{
          flex: 1,
          background: task.calendarColor ?? "#3f3f46",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          position: "relative",
          overflow: "hidden",
        }}>
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

          <span style={{
            color: "#e4e4e7",
            fontSize: 11,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          className={cn(task.completed && "line-through")}
          >
            {spanStart ? task.title : ""}
          </span>

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
        </div>
        {spanEnd && (
          <div style={{ width: 8, background: bgColor, flexShrink: 0 }} />
        )}
      </div>
    </motion.button>
  );
}

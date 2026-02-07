"use client";

import { cn } from "@/app/lib/utils";
import { Category, Task } from "@/app/types/task";
import { motion } from "motion/react";

interface DragPreviewEventProps {
  task: Task;
  category: Category | undefined;
  spanStart: boolean;
  spanEnd: boolean;
  spanMiddle: boolean;
}

/**
 * Renders a transparent "ghost" preview of an event during drag operations.
 * Shows where the event will land when dropped.
 */
export default function DragPreviewEvent({
  task,
  category,
  spanStart,
  spanEnd,
  spanMiddle,
}: DragPreviewEventProps) {
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

  return (
    <motion.div
      className={cn(
        "flex w-full items-center overflow-hidden text-left text-[11px] leading-tight text-white/70 pointer-events-none z-10",
        "h-6 px-1.5",
        spanStart && !spanEnd && "rounded-l-md",
        spanEnd && !spanStart && "rounded-r-md",
        spanStart && spanEnd && "rounded-md",
        spanMiddle && "rounded-none",
        "border-2 border-dashed border-white/40",
      )}
      style={{
        backgroundColor: bgColor + "66", // ~40% opacity
        ...spanStyles,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      <span className="truncate">{spanStart ? task.title : ""}</span>
    </motion.div>
  );
}

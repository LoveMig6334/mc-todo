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

  return (
    <motion.div
      className={cn(
        "flex w-full items-center overflow-hidden text-left text-[11px] leading-tight text-white/70 pointer-events-none",
        "h-6 px-1.5",
        spanStart && !spanEnd && "rounded-l-md mr-0",
        spanEnd && !spanStart && "rounded-r-md ml-0",
        spanStart && spanEnd && "rounded-md",
        spanMiddle && "rounded-none mx-0",
        "border-2 border-dashed border-white/40",
      )}
      style={{
        backgroundColor: bgColor + "66", // ~40% opacity
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

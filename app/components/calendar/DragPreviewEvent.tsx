"use client";

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
}: DragPreviewEventProps) {
  const categoryColor = category?.color ?? "#71717a";
  const bodyColor = task.calendarColor ?? "#3f3f46";

  return (
    <motion.div
      className="w-full pointer-events-none z-10 h-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: "100%", opacity: 0.5 }}>
        {spanStart && <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />}
        <div style={{ flex: 1, background: bodyColor, display: "flex", alignItems: "center", padding: "0 6px" }}>
          <span style={{
            color: "#e4e4e7",
            fontSize: 11,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}>
            {spanStart ? task.title : ""}
          </span>
        </div>
        {spanEnd && <div style={{ width: 8, background: categoryColor, flexShrink: 0 }} />}
      </div>
    </motion.div>
  );
}

"use client";

import {
  cn,
  formatDateRange,
  getPriorityColor,
  getPriorityLabel,
  isOverdue,
} from "@/app/lib/utils";
import { Category, Task, TaskFormData } from "@/app/types/task";
import { useCallback, useState } from "react";
import SubtaskList from "./SubtaskList";

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
}

export default function TaskItem({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdate,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const overdue = !task.completed && isOverdue(task.dueDate);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, input, a, select, textarea")) return;
      setExpanded((prev) => !prev);
    },
    [],
  );

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group rounded-xl border bg-zinc-900 p-4 transition-all duration-200",
        task.completed
          ? "border-zinc-800 opacity-60"
          : overdue
            ? "border-red-500/50 bg-red-500/5"
            : "border-zinc-800 hover:border-zinc-700",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={cn(
            "mt-1 h-5 w-5 shrink-0 rounded border-2 transition-all duration-200",
            "flex items-center justify-center",
            task.completed
              ? "border-orange-500 bg-orange-500"
              : "border-zinc-600 hover:border-orange-500",
          )}
        >
          {task.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-medium text-white",
                task.completed && "line-through text-zinc-500",
              )}
            >
              {task.title}
            </h3>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Edit task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-colors"
                aria-label="Delete task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Details */}
          {task.details && (
            <p
              className={cn(
                "mt-1 text-sm text-zinc-400 line-clamp-2",
                task.completed && "text-zinc-600",
              )}
            >
              {task.details}
            </p>
          )}

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {/* Category */}
            {category && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-zinc-400">{category.name}</span>
              </span>
            )}

            {/* Priority */}
            <span
              className={cn("font-medium", getPriorityColor(task.priority))}
            >
              {getPriorityLabel(task.priority)}
            </span>

            {/* Due date */}
            <span
              className={cn(
                "flex items-center gap-1",
                overdue ? "text-red-500" : "text-zinc-400",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDateRange(task.dueDate.start, task.dueDate.end)}
              {overdue && <span className="font-medium">(Overdue)</span>}
            </span>

            {/* Links count */}
            {task.referenceLinks.length > 0 && (
              <span className="flex items-center gap-1 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {task.referenceLinks.length} link
                {task.referenceLinks.length !== 1 && "s"}
              </span>
            )}

            {/* Subtask count */}
            {task.subtasks && task.subtasks.length > 0 && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex items-center rounded-full p-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-transform duration-200",
                    expanded && "rotate-180",
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>

          {/* Inline subtasks */}
          {expanded && (
            <div className="mt-3 border-t border-zinc-800 pt-3">
              <SubtaskList
                subtasks={task.subtasks ?? []}
                onChange={(subtasks) => onUpdate(task.id, { subtasks })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

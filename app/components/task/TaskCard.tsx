"use client";

import {
  cn,
  formatDateRange,
  getPriorityLabel,
  isOverdue,
} from "@/app/lib/utils";
import { Category, Task, TaskFormData } from "@/app/types/task";
import { useCallback, useState } from "react";
import SubtaskList from "./SubtaskList";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
}

export default function TaskCard({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdate,
}: TaskCardProps) {
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
        "group rounded-lg border bg-zinc-800/50 p-3 transition-all duration-200",
        task.completed
          ? "border-zinc-700 opacity-60"
          : overdue
            ? "border-red-500/50"
            : "border-zinc-700 hover:border-zinc-600",
      )}
    >
      {/* Header: Checkbox + Title */}
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded border-2 transition-all duration-200",
            "flex items-center justify-center",
            task.completed
              ? "border-orange-500 bg-orange-500"
              : "border-zinc-500 hover:border-orange-500",
          )}
        >
          {task.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
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
        <h4
          className={cn(
            "flex-1 text-sm font-medium text-white line-clamp-2",
            task.completed && "line-through text-zinc-500",
          )}
          title={task.title}
        >
          {task.title}
        </h4>
      </div>

      {/* Priority Tag */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            task.priority >= 8 && "bg-red-500/20 text-red-400",
            task.priority >= 5 &&
              task.priority < 8 &&
              "bg-orange-500/20 text-orange-400",
            task.priority >= 3 &&
              task.priority < 5 &&
              "bg-yellow-500/20 text-yellow-400",
            task.priority < 3 && "bg-zinc-700 text-zinc-400",
          )}
        >
          {getPriorityLabel(task.priority)}
        </span>
        {category && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.name}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
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
          className={overdue ? "text-red-500" : ""}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={overdue ? "text-red-500" : ""}>
          {formatDateRange(task.dueDate.start, task.dueDate.end)}
        </span>
      </div>

      {/* Link count */}
      {task.referenceLinks.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
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
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          <span
            className={
              task.subtasks.filter((s) => s.completed).length ===
              task.subtasks.length
                ? "text-emerald-400"
                : ""
            }
          >
            {task.subtasks.filter((s) => s.completed).length}/
            {task.subtasks.length}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
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
        </div>
      )}

      {/* Inline subtasks */}
      {expanded && (
        <div className="mt-2 border-t border-zinc-700 pt-2">
          <SubtaskList
            subtasks={task.subtasks ?? []}
            onChange={(subtasks) => onUpdate(task.id, { subtasks })}
          />
        </div>
      )}

      {/* Actions (visible on hover) */}
      <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          aria-label="Edit task"
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-700 transition-colors"
          aria-label="Delete task"
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
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

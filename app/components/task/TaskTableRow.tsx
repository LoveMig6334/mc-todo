"use client";

import {
  cn,
  formatDateRange,
  getDaysLeft,
  getStatusColor,
  getStatusLabel,
} from "@/app/lib/utils";
import { Category, Task, TaskFormData, TaskStatus } from "@/app/types/task";
import { useCallback } from "react";
import {
  InlineDateCell,
  InlineLinkCell,
  InlineNumberCell,
  InlineSelectCell,
  InlineTextCell,
} from "./InlineEditableCell";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "needs_approval", label: "Needs Approval" },
  { value: "paused", label: "Paused" },
];

interface TaskTableRowProps {
  task: Task;
  category?: Category;
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
}

export default function TaskTableRow({
  task,
  category,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdate,
}: TaskTableRowProps) {
  const daysLeft = getDaysLeft(task.dueDate);

  const handleUpdate = useCallback(
    (updates: Partial<TaskFormData>) => {
      onUpdate(task.id, updates);
    },
    [task.id, onUpdate],
  );

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  return (
    <tr
      className={cn(
        "group border-b border-zinc-800 transition-colors hover:bg-zinc-800/50",
        task.completed && "opacity-60",
      )}
    >
      {/* Checkbox */}
      <td className="w-12 py-3 pl-4">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={cn(
            "h-5 w-5 rounded border-2 transition-all duration-200",
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
      </td>

      {/* Subject */}
      <td className="py-3 pr-4">
        <InlineTextCell
          value={task.title}
          onSave={(title) => handleUpdate({ title })}
          className={cn(
            "font-medium text-white",
            task.completed && "line-through text-zinc-500",
          )}
        />
        {task.subtasks && task.subtasks.length > 0 && (
          <span
            className={cn(
              "mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]",
              task.subtasks.filter((s) => s.completed).length ===
                task.subtasks.length
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-zinc-700 text-zinc-400",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            {task.subtasks.filter((s) => s.completed).length}/
            {task.subtasks.length}
          </span>
        )}
      </td>

      {/* Description */}
      <td className="py-3 pr-4">
        <InlineTextCell
          value={task.details}
          onSave={(details) => handleUpdate({ details })}
          className={cn(
            "text-sm text-zinc-400",
            task.completed && "text-zinc-600",
          )}
          placeholder="—"
        />
      </td>

      {/* Category */}
      <td className="w-28 py-3 pr-4">
        <InlineSelectCell
          value={task.categoryId}
          options={categoryOptions}
          onSave={(categoryId) => handleUpdate({ categoryId })}
          renderDisplay={() =>
            category ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            ) : (
              <span className="text-xs text-zinc-600">—</span>
            )
          }
        />
      </td>

      {/* Status */}
      <td className="w-32 py-3 pr-4">
        <InlineSelectCell
          value={task.status}
          options={STATUS_OPTIONS}
          onSave={(status) => handleUpdate({ status: status as TaskStatus })}
          renderDisplay={(val) => (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                getStatusColor(val as TaskStatus),
              )}
            >
              {getStatusLabel(val as TaskStatus)}
            </span>
          )}
        />
      </td>

      {/* Priority */}
      <td className="w-20 py-3 pr-4">
        <InlineNumberCell
          value={task.priority}
          min={0}
          max={10}
          onSave={(priority) => handleUpdate({ priority })}
          renderDisplay={(val) => (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full w-7 h-7 text-sm font-bold",
                val >= 8 && "bg-red-500/20 text-red-400",
                val >= 5 && val < 8 && "bg-orange-500/20 text-orange-400",
                val >= 3 && val < 5 && "bg-yellow-500/20 text-yellow-400",
                val < 3 && "bg-zinc-700 text-zinc-400",
              )}
            >
              {val}
            </span>
          )}
        />
      </td>

      {/* Days Left */}
      <td className="w-24 py-3 pr-4">
        <InlineDateCell
          value={task.dueDate.end || task.dueDate.start}
          onSave={(newEnd) =>
            handleUpdate({
              dueDate: {
                start: task.dueDate.start,
                end: newEnd === task.dueDate.start ? null : newEnd,
              },
            })
          }
          renderDisplay={() => (
            <span
              className={cn(
                "text-xs font-medium",
                daysLeft < 0 && "text-red-500",
                daysLeft === 0 && "text-orange-500",
                daysLeft > 0 && daysLeft <= 3 && "text-yellow-500",
                daysLeft > 3 && "text-zinc-400",
              )}
            >
              {task.completed
                ? "Done"
                : daysLeft < 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft === 0
                    ? "Today"
                    : `${daysLeft}d left`}
            </span>
          )}
        />
      </td>

      {/* Time */}
      <td className="w-32 py-3 pr-4">
        <InlineDateCell
          value={task.dueDate.start}
          onSave={(newStart) =>
            handleUpdate({
              dueDate: {
                start: newStart,
                end: task.dueDate.end,
              },
            })
          }
          renderDisplay={() => (
            <>
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
                className="text-zinc-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-xs text-zinc-400">
                {formatDateRange(task.dueDate.start, task.dueDate.end)}
              </span>
            </>
          )}
        />
      </td>

      {/* Link */}
      <td className="w-20 py-3 pr-4">
        <InlineLinkCell
          value={task.referenceLinks[0] || ""}
          onSave={(url) =>
            handleUpdate({
              referenceLinks: url
                ? [url, ...task.referenceLinks.slice(1)]
                : task.referenceLinks.slice(1),
            })
          }
          renderDisplay={() =>
            task.referenceLinks.length > 0 ? (
              <a
                href={task.referenceLinks[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {task.referenceLinks.length > 1
                  ? `${task.referenceLinks.length} links`
                  : "Link"}
              </a>
            ) : (
              <span className="text-xs text-zinc-600">—</span>
            )
          }
        />
      </td>

      {/* Actions */}
      <td className="w-20 py-3 pr-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-700 transition-colors"
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
      </td>
    </tr>
  );
}

"use client";

import { Category, Task } from "@/app/types/task";
import { useMemo } from "react";
import TaskTableRow from "./TaskTableRow";

interface PriorityListViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

interface PriorityGroup {
  label: string;
  minPriority: number;
  maxPriority: number;
  tasks: Task[];
}

export default function PriorityListView({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
}: PriorityListViewProps) {
  const getCategoryById = (id: string) =>
    categories.find((cat) => cat.id === id);

  // Group tasks by priority and sort completed to bottom within each group
  const priorityGroups = useMemo(() => {
    const groups: PriorityGroup[] = [
      { label: "Urgent", minPriority: 8, maxPriority: 10, tasks: [] },
      { label: "High", minPriority: 5, maxPriority: 7, tasks: [] },
      { label: "Medium", minPriority: 3, maxPriority: 4, tasks: [] },
      { label: "Low", minPriority: 0, maxPriority: 2, tasks: [] },
    ];

    tasks.forEach((task) => {
      const group = groups.find(
        (g) => task.priority >= g.minPriority && task.priority <= g.maxPriority,
      );
      if (group) {
        group.tasks.push(task);
      }
    });

    // Sort tasks within each group: incomplete first, then by priority
    groups.forEach((group) => {
      group.tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return b.priority - a.priority;
      });
    });

    return groups.filter((g) => g.tasks.length > 0);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-zinc-800 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-500"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No tasks yet</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
            <th className="w-12 py-3 pl-4"></th>
            <th className="w-[30%] py-3 pr-4">Subject</th>
            <th className="w-[35%] py-3 pr-4">Description</th>
            <th className="w-20 py-3 pr-4">Priority</th>
            <th className="w-32 py-3 pr-4">Time</th>
            <th className="w-16 py-3 pr-4">Link</th>
            <th className="w-20 py-3 pr-4"></th>
          </tr>
        </thead>
        {priorityGroups.map((group) => (
          <tbody key={group.label}>
            {/* Priority Group Header */}
            <tr className="bg-zinc-800/50">
              <td colSpan={7} className="py-2 pl-4">
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      group.label === "Urgent"
                        ? "bg-red-500"
                        : group.label === "High"
                          ? "bg-orange-500"
                          : group.label === "Medium"
                            ? "bg-yellow-500"
                            : "bg-zinc-500"
                    }`}
                  />
                  {group.label} Priority
                  <span className="text-xs text-zinc-500">
                    ({group.tasks.length})
                  </span>
                </span>
              </td>
            </tr>
            {group.tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                category={getCategoryById(task.categoryId)}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

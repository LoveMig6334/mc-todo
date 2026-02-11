"use client";

import { Category, Task, TaskFormData } from "@/app/types/task";
import { useMemo } from "react";
import TaskCard from "./TaskCard";

interface CategoryBoardViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
}

interface CategoryColumn {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

const BACKLOG_COLUMN: CategoryColumn = {
  id: "backlog",
  name: "Backlog",
  color: "#71717a", // zinc-500
  tasks: [],
};

export default function CategoryBoardView({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdate,
}: CategoryBoardViewProps) {
  // Group tasks by category, with backlog for uncategorized
  const columns = useMemo(() => {
    const categoryMap = new Map<string, CategoryColumn>();

    // Initialize columns for each category
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        tasks: [],
      });
    });

    // Create backlog column for uncategorized tasks
    const backlog: CategoryColumn = { ...BACKLOG_COLUMN, tasks: [] };

    // Distribute tasks to columns
    tasks.forEach((task) => {
      const column = categoryMap.get(task.categoryId);
      if (column) {
        column.tasks.push(task);
      } else {
        backlog.tasks.push(task);
      }
    });

    // Sort tasks within each column: incomplete first, then by priority
    const sortTasks = (taskList: Task[]) => {
      return taskList.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return b.priority - a.priority;
      });
    };

    const allColumns = [...categoryMap.values()];
    allColumns.forEach((col) => sortTasks(col.tasks));
    sortTasks(backlog.tasks);

    // Add backlog at the end if it has tasks or if there are no categories
    if (backlog.tasks.length > 0 || categories.length === 0) {
      allColumns.push(backlog);
    }

    return allColumns;
  }, [tasks, categories]);

  const getCategoryById = (id: string) =>
    categories.find((cat) => cat.id === id);

  if (tasks.length === 0 && categories.length === 0) {
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex w-72 shrink-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900"
        >
          {/* Column Header */}
          <div className="flex items-center gap-2 border-b border-zinc-800 p-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-medium text-white">{column.name}</h3>
            <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {column.tasks.length}
            </span>
          </div>

          {/* Task Cards */}
          <div className="flex flex-col gap-2 p-3">
            {column.tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">No tasks</p>
            ) : (
              column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={getCategoryById(task.categoryId)}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

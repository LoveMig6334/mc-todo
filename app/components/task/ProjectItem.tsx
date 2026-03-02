"use client";

import { formatDateRange } from "@/app/lib/utils";
import { Category, Project, Task, TaskFormData } from "@/app/types/task";
import { useState } from "react";
import TaskItem from "./TaskItem";

interface ProjectItemProps {
  project: Project;
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<TaskFormData>) => void;
  onAddTask: (projectId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectItem({
  project,
  tasks,
  categories,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onAddTask,
  onEditProject,
  onDeleteProject,
}: ProjectItemProps) {
  const [collapsed, setCollapsed] = useState(false);

  const getCategoryById = (id: string) =>
    categories.find((c) => c.id === id);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="flex">
        {/* Left color accent bar */}
        <div
          className="w-1 shrink-0"
          style={{ backgroundColor: project.color }}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="group flex items-center gap-2 px-4 py-3">
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="shrink-0 text-zinc-400 hover:text-white transition-colors"
              aria-label={collapsed ? "Expand project" : "Collapse project"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Color dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />

            {/* Title */}
            <h2 className="font-semibold text-white flex-1 min-w-0 truncate">
              {project.title}
            </h2>

            {/* Date range */}
            <span className="shrink-0 flex items-center gap-1 text-xs text-zinc-400">
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
              {formatDateRange(project.dueDate.start, project.dueDate.end)}
            </span>

            {/* Task count */}
            <span className="shrink-0 text-xs text-zinc-500">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>

            {/* Edit / Delete — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditProject(project)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Edit project"
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
                onClick={() => onDeleteProject(project.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-colors"
                aria-label="Delete project"
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

          {/* Description */}
          {project.description && (
            <p className="px-4 pb-2 text-sm text-zinc-400 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Collapsible body */}
          {!collapsed && (
            <div className="border-t border-zinc-800">
              {/* Child tasks — indented one level */}
              {tasks.length > 0 ? (
                <div className="pl-8 pr-4 py-3 space-y-2">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      category={getCategoryById(task.categoryId)}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onUpdate={onUpdateTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="px-12 py-4 text-sm text-zinc-600">
                  No tasks in this project yet.
                </p>
              )}

              {/* Add task to project */}
              <div className="px-8 pb-3">
                <button
                  onClick={() => onAddTask(project.id)}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-500 transition-colors"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add task to project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Category, Project, Task, TaskFormData } from "@/app/types/task";
import { useMemo } from "react";
import ProjectItem from "./ProjectItem";
import TaskTableRow from "./TaskTableRow";

interface PriorityListViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  projects?: Project[];
  onAddTask?: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
}

export default function PriorityListView({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdate,
  projects = [],
  onAddTask = () => {},
  onEditProject = () => {},
  onDeleteProject = () => {},
}: PriorityListViewProps) {
  const getCategoryById = (id: string) =>
    categories.find((cat) => cat.id === id);

  // Build a set of known project IDs for quick lookup
  const projectIdSet = useMemo(
    () => new Set(projects.map((p) => p.id)),
    [projects],
  );

  // Split tasks: those belonging to a known project vs. standalone
  const { projectTasksMap, standaloneTasks } = useMemo(() => {
    const byProject: Record<string, Task[]> = {};
    const standalone: Task[] = [];

    for (const task of tasks) {
      if (task.projectId && projectIdSet.has(task.projectId)) {
        if (!byProject[task.projectId]) byProject[task.projectId] = [];
        byProject[task.projectId].push(task);
      } else {
        standalone.push(task);
      }
    }

    return { projectTasksMap: byProject, standaloneTasks: standalone };
  }, [tasks, projectIdSet]);

  // Sort standalone tasks: incomplete first, then by priority
  const sortedStandaloneTasks = useMemo(() => {
    return [...standaloneTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.priority - a.priority;
    });
  }, [standaloneTasks]);

  const isEmpty = projects.length === 0 && tasks.length === 0;

  if (isEmpty) {
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
    <div className="space-y-3">
      {/* Projects — each a full-width card containing its indented tasks */}
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          tasks={projectTasksMap[project.id] ?? []}
          categories={categories}
          onToggleComplete={onToggleComplete}
          onEditTask={onEdit}
          onDeleteTask={onDelete}
          onUpdateTask={onUpdate}
          onAddTask={onAddTask}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ))}

      {/* Standalone tasks — table layout, same as before */}
      {sortedStandaloneTasks.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                <th className="w-12 py-3 pl-4"></th>
                <th className="py-3 pr-4">Subject</th>
                <th className="py-3 pr-4">Description</th>
                <th className="w-28 py-3 pr-4">Category</th>
                <th className="w-32 py-3 pr-4">Status</th>
                <th className="w-20 py-3 pr-4">Priority</th>
                <th className="w-24 py-3 pr-4">Days Left</th>
                <th className="w-32 py-3 pr-4">Time</th>
                <th className="w-20 py-3 pr-4">Link</th>
                <th className="w-20 py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {sortedStandaloneTasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  category={getCategoryById(task.categoryId)}
                  categories={categories}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

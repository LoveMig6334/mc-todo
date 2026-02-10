"use client";

import { generateId, isOverdue } from "@/app/lib/utils";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useTaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("mc-todo-tasks", []);

  const addTask = useCallback(
    (formData: TaskFormData): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...formData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<TaskFormData>) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    },
    [setTasks],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const getTaskById = useCallback(
    (id: string) => {
      return tasks.find((task) => task.id === id);
    },
    [tasks],
  );

  // Normalize tasks to ensure subtasks field exists (backward compatibility)
  const normalizedTasks = useMemo(() => {
    return tasks.map((t) => ({
      ...t,
      subtasks: t.subtasks ?? [],
    }));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter((t) => t.completed).length;
    const overdue = normalizedTasks.filter(
      (t) => !t.completed && isOverdue(t.dueDate),
    ).length;
    const pending = normalizedTasks.filter(
      (t) => !t.completed && t.status === "pending",
    ).length;
    const inProgress = normalizedTasks.filter(
      (t) => !t.completed && t.status === "in_progress",
    ).length;
    const completionRate =
      total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, overdue, pending, inProgress, completionRate };
  }, [normalizedTasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Sort by priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by due date
      return (
        new Date(a.dueDate.start).getTime() -
        new Date(b.dueDate.start).getTime()
      );
    });
  }, [tasks]);

  return {
    tasks: sortedTasks,
    stats,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getTaskById,
  };
}

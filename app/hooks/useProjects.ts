"use client";

import { generateId } from "@/app/lib/utils";
import { Project, ProjectFormData } from "@/app/types/task";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    "mc-todo-projects",
    [],
  );

  const addProject = useCallback(
    (formData: ProjectFormData): Project => {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...formData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<ProjectFormData>) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project,
        ),
      );
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    },
    [setProjects],
  );

  const getProjectById = useCallback(
    (id: string) => {
      return projects.find((project) => project.id === id);
    },
    [projects],
  );

  // Normalize for backward compatibility
  const normalizedProjects = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      description: p.description ?? "",
      dueDate: p.dueDate ?? { start: "", end: null },
    }));
  }, [projects]);

  // Sort by start date
  const sortedProjects = useMemo(() => {
    return [...normalizedProjects].sort(
      (a, b) =>
        new Date(a.dueDate.start).getTime() -
        new Date(b.dueDate.start).getTime(),
    );
  }, [normalizedProjects]);

  return {
    projects: sortedProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
}

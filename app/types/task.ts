export type TaskStatus =
  | "needs_approval"
  | "in_progress"
  | "pending"
  | "paused";

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string; // User-selected hex color (e.g. "#f97316")
  dueDate: {
    start: string; // ISO date string (YYYY-MM-DD)
    end: string | null;
  };
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export type ProjectFormData = Omit<Project, "id" | "createdAt" | "updatedAt">;

export type SubtaskPriority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  status?: TaskStatus;
  priority?: SubtaskPriority;
  link?: string;
}

export interface Task {
  id: string;
  title: string;
  details: string;
  categoryId: string;
  projectId?: string; // undefined = standalone task
  priority: number; // 0-10, where 10 is most urgent
  status: TaskStatus;
  dueDate: {
    start: string; // ISO date string (YYYY-MM-DD)
    end: string | null; // null for single-day tasks
  };
  subtasks: Subtask[];
  referenceLinks: string[];
  completed: boolean;
  completedAt: string | null; // ISO datetime when marked complete, null if not completed
  archived: boolean; // Whether the task has been auto-archived
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color for visual distinction
}

export type TaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt">;

export interface DateRange {
  start: string;
  end: string | null;
}

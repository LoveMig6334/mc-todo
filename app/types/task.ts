export interface Task {
  id: string;
  title: string;
  details: string;
  categoryId: string;
  priority: number; // 0-10, where 10 is most urgent
  dueDate: {
    start: string; // ISO date string (YYYY-MM-DD)
    end: string | null; // null for single-day tasks
  };
  referenceLinks: string[];
  completed: boolean;
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

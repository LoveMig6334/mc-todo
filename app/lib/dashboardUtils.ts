import { Category, Task, TaskStatus } from "@/app/types/task";
import { getDaysLeft, isOverdue } from "./utils";

// --- Types ---

export interface SummaryStats {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  completionRate: number; // 0-100
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

export interface PriorityStat {
  label: string;
  count: number;
  color: string;
}

export interface StatusStat {
  status: TaskStatus;
  label: string;
  count: number;
  color: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  categoryColor: string;
  daysLeft: number;
}

export type MatrixQuadrant = "q1" | "q2" | "q3" | "q4";

export interface MatrixTask {
  id: string;
  title: string;
  quadrant: MatrixQuadrant;
  categoryColor: string;
  categoryName: string;
  priority: number;
  daysLeft: number;
}

export interface MatrixData {
  tasks: MatrixTask[];
  suggested: MatrixTask[]; // Top 3 tasks to do now
}

export interface DashboardStats {
  summary: SummaryStats;
  categoryBreakdown: CategoryStat[];
  priorityDistribution: PriorityStat[];
  statusDistribution: StatusStat[];
  upcomingDeadlines: UpcomingTask[];
  matrixData: MatrixData;
}

// --- Pure Functions ---

export function computeSummaryStats(tasks: Task[]): SummaryStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter(
    (t) => !t.completed && isOverdue(t.dueDate),
  ).length;
  const inProgress = tasks.filter(
    (t) => !t.completed && t.status === "in_progress",
  ).length;
  const completionRate =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, overdue, inProgress, completionRate };
}

export function computeCategoryBreakdown(
  tasks: Task[],
  categories: Category[],
): CategoryStat[] {
  const map = new Map<string, CategoryStat>();

  for (const cat of categories) {
    map.set(cat.id, {
      categoryId: cat.id,
      name: cat.name,
      color: cat.color,
      total: 0,
      completed: 0,
    });
  }

  for (const task of tasks) {
    const stat = map.get(task.categoryId);
    if (stat) {
      stat.total++;
      if (task.completed) stat.completed++;
    }
  }

  return Array.from(map.values())
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);
}

const PRIORITY_BUCKETS: {
  label: string;
  min: number;
  max: number;
  color: string;
}[] = [
  { label: "Low", min: 0, max: 2, color: "#71717a" },
  { label: "Medium", min: 3, max: 4, color: "#eab308" },
  { label: "High", min: 5, max: 7, color: "#f97316" },
  { label: "Urgent", min: 8, max: 10, color: "#ef4444" },
];

export function computePriorityDistribution(tasks: Task[]): PriorityStat[] {
  const activeTasks = tasks.filter((t) => !t.completed);

  return PRIORITY_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: activeTasks.filter(
      (t) => t.priority >= bucket.min && t.priority <= bucket.max,
    ).length,
    color: bucket.color,
  }));
}

const STATUS_CONFIG: { status: TaskStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "#eab308" },
  { status: "in_progress", label: "In Progress", color: "#3b82f6" },
  { status: "paused", label: "Paused", color: "#71717a" },
  { status: "needs_approval", label: "Needs Approval", color: "#a855f7" },
];

export function computeStatusDistribution(tasks: Task[]): StatusStat[] {
  const activeTasks = tasks.filter((t) => !t.completed);

  return STATUS_CONFIG.map((cfg) => ({
    status: cfg.status,
    label: cfg.label,
    count: activeTasks.filter((t) => t.status === cfg.status).length,
    color: cfg.color,
  })).filter((s) => s.count > 0);
}

export function computeUpcomingDeadlines(
  tasks: Task[],
  categories: Category[],
  limit: number = 5,
): UpcomingTask[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return tasks
    .filter((t) => !t.completed && getDaysLeft(t.dueDate) >= 0)
    .map((t) => ({
      id: t.id,
      title: t.title,
      categoryColor: categoryMap.get(t.categoryId)?.color ?? "#71717a",
      daysLeft: getDaysLeft(t.dueDate),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

export function computeMatrixData(
  tasks: Task[],
  categories: Category[],
): MatrixData {
  const activeTasks = tasks.filter((t) => !t.completed);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const matrixTasks: MatrixTask[] = activeTasks.map((t) => {
    const isImportant = t.priority >= 5;
    const daysLeft = getDaysLeft(t.dueDate);
    // Urgent if due within 3 days or overdue
    const isUrgent = daysLeft <= 3;

    let quadrant: MatrixQuadrant;
    if (isUrgent && isImportant)
      quadrant = "q1"; // Urgent & Important
    else if (!isUrgent && isImportant)
      quadrant = "q2"; // Not Urgent & Important
    else if (isUrgent && !isImportant)
      quadrant = "q3"; // Urgent & Not Important
    else quadrant = "q4"; // Not Urgent & Not Important

    const category = categoryMap.get(t.categoryId);

    return {
      id: t.id,
      title: t.title,
      quadrant,
      categoryColor: category?.color ?? "#71717a",
      categoryName: category?.name ?? "Unknown",
      priority: t.priority,
      daysLeft,
    };
  });

  // Suggest tasks: prioritize Q1, then Q2, then Q3, then Q4
  // Within same quadrant, rank by highest priority, then fewest days left
  const suggested = [...matrixTasks]
    .sort((a, b) => {
      const qWeight = { q1: 1, q2: 2, q3: 3, q4: 4 };
      if (qWeight[a.quadrant] !== qWeight[b.quadrant]) {
        return qWeight[a.quadrant] - qWeight[b.quadrant];
      }
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // higher priority first
      }
      return a.daysLeft - b.daysLeft; // fewer days left first
    })
    .slice(0, 3);

  return {
    tasks: matrixTasks,
    suggested,
  };
}

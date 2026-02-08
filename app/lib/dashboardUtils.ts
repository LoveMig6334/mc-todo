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

export interface DashboardStats {
  summary: SummaryStats;
  categoryBreakdown: CategoryStat[];
  priorityDistribution: PriorityStat[];
  statusDistribution: StatusStat[];
  upcomingDeadlines: UpcomingTask[];
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

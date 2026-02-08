"use client";

import {
  computeCategoryBreakdown,
  computePriorityDistribution,
  computeStatusDistribution,
  computeSummaryStats,
  computeUpcomingDeadlines,
  DashboardStats,
} from "@/app/lib/dashboardUtils";
import { Category, Task } from "@/app/types/task";
import { useMemo } from "react";

export function useDashboardStats(
  tasks: Task[],
  categories: Category[],
): DashboardStats {
  return useMemo(
    () => ({
      summary: computeSummaryStats(tasks),
      categoryBreakdown: computeCategoryBreakdown(tasks, categories),
      priorityDistribution: computePriorityDistribution(tasks),
      statusDistribution: computeStatusDistribution(tasks),
      upcomingDeadlines: computeUpcomingDeadlines(tasks, categories),
    }),
    [tasks, categories],
  );
}

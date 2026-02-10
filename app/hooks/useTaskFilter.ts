"use client";

import { Category, Task } from "@/app/types/task";
import { useCallback, useMemo, useState } from "react";

export type StatusFilterOption =
  | "all"
  | "pending"
  | "in_progress"
  | "needs_approval"
  | "paused"
  | "completed";

export interface TaskFilterState {
  searchQuery: string;
  statusFilter: StatusFilterOption;
  categoryFilter: string; // category ID or "all"
}

export function useTaskFilter(tasks: Task[], categories: Category[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDetails = task.details.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDetails) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "completed") {
          if (!task.completed) return false;
        } else {
          if (task.completed || task.status !== statusFilter) return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all") {
        if (task.categoryId !== categoryFilter) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, categoryFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    return count;
  }, [searchQuery, statusFilter, categoryFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredTasks,
    activeFilterCount,
    clearAllFilters,
    categories,
  };
}

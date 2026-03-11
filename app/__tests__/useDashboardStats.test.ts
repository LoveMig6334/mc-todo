import { useDashboardStats } from "@/app/hooks/useDashboardStats";
import { Category, Task } from "@/app/types/task";
import { renderHook } from "@testing-library/react";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    title: "Test Task",
    details: "",
    categoryId: "work",
    priority: 5,
    status: "pending",
    dueDate: { start: "2099-06-15", end: null },
    referenceLinks: [],
    subtasks: [],
    completed: false,
    completedAt: null,
    archived: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

const categories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

describe("useDashboardStats", () => {
  it("returns correct shape with all fields", () => {
    const tasks = [
      makeTask({ id: "1", categoryId: "work", status: "in_progress" }),
      makeTask({ id: "2", categoryId: "personal", completed: true }),
    ];

    const { result } = renderHook(() =>
      useDashboardStats(tasks, categories),
    );

    const stats = result.current;

    // Summary
    expect(stats.summary.total).toBe(2);
    expect(stats.summary.completed).toBe(1);
    expect(stats.summary.inProgress).toBe(1);
    expect(stats.summary.completionRate).toBe(50);

    // Category breakdown
    expect(stats.categoryBreakdown).toHaveLength(2);

    // Priority distribution (4 buckets always)
    expect(stats.priorityDistribution).toHaveLength(4);

    // Status distribution (only non-zero statuses)
    expect(stats.statusDistribution.length).toBeGreaterThan(0);

    // Upcoming deadlines
    expect(stats.upcomingDeadlines).toHaveLength(1);
  });

  it("handles empty tasks", () => {
    const { result } = renderHook(() =>
      useDashboardStats([], categories),
    );

    expect(result.current.summary.total).toBe(0);
    expect(result.current.categoryBreakdown).toEqual([]);
    expect(result.current.upcomingDeadlines).toEqual([]);
  });
});

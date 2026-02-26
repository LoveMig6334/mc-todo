import {
  computeCategoryBreakdown,
  computeMatrixData,
  computePriorityDistribution,
  computeStatusDistribution,
  computeSummaryStats,
  computeUpcomingDeadlines,
} from "@/app/lib/dashboardUtils";
import { Category, Task } from "@/app/types/task";

// Helper to create a task with sensible defaults
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    title: "Test Task",
    details: "",
    categoryId: "work",
    priority: 5,
    status: "pending",
    dueDate: { start: "2099-06-15", end: null },
    subtasks: [],
    referenceLinks: [],
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
  { id: "health", name: "Health", color: "#22c55e" },
];

describe("computeSummaryStats", () => {
  it("returns zeros for empty array", () => {
    const stats = computeSummaryStats([]);
    expect(stats).toEqual({
      total: 0,
      completed: 0,
      overdue: 0,
      inProgress: 0,
      completionRate: 0,
    });
  });

  it("counts completed tasks", () => {
    const tasks = [
      makeTask({ id: "1", completed: true }),
      makeTask({ id: "2", completed: false }),
      makeTask({ id: "3", completed: true }),
    ];
    const stats = computeSummaryStats(tasks);
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(2);
    expect(stats.completionRate).toBe(67);
  });

  it("counts overdue tasks (excluding completed)", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2020-01-01", end: null } }),
      makeTask({
        id: "2",
        dueDate: { start: "2020-01-01", end: null },
        completed: true,
      }),
    ];
    const stats = computeSummaryStats(tasks);
    expect(stats.overdue).toBe(1);
  });

  it("counts in-progress tasks", () => {
    const tasks = [
      makeTask({ id: "1", status: "in_progress" }),
      makeTask({ id: "2", status: "pending" }),
      makeTask({ id: "3", status: "in_progress", completed: true }),
    ];
    const stats = computeSummaryStats(tasks);
    expect(stats.inProgress).toBe(1);
  });
});

describe("computeCategoryBreakdown", () => {
  it("returns empty array when no tasks", () => {
    expect(computeCategoryBreakdown([], categories)).toEqual([]);
  });

  it("groups tasks by category and sorts by total desc", () => {
    const tasks = [
      makeTask({ id: "1", categoryId: "personal" }),
      makeTask({ id: "2", categoryId: "personal", completed: true }),
      makeTask({ id: "3", categoryId: "work" }),
    ];
    const result = computeCategoryBreakdown(tasks, categories);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Personal");
    expect(result[0].total).toBe(2);
    expect(result[0].completed).toBe(1);
    expect(result[1].name).toBe("Work");
    expect(result[1].total).toBe(1);
  });

  it("excludes categories with zero tasks", () => {
    const tasks = [makeTask({ id: "1", categoryId: "work" })];
    const result = computeCategoryBreakdown(tasks, categories);
    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("work");
  });

  it("ignores tasks with unknown category", () => {
    const tasks = [makeTask({ id: "1", categoryId: "nonexistent" })];
    const result = computeCategoryBreakdown(tasks, categories);
    expect(result).toEqual([]);
  });
});

describe("computePriorityDistribution", () => {
  it("returns 4 buckets with zero counts for empty array", () => {
    const result = computePriorityDistribution([]);
    expect(result).toHaveLength(4);
    expect(result.every((b) => b.count === 0)).toBe(true);
  });

  it("categorizes priorities into correct buckets", () => {
    const tasks = [
      makeTask({ id: "1", priority: 0 }),
      makeTask({ id: "2", priority: 2 }),
      makeTask({ id: "3", priority: 3 }),
      makeTask({ id: "4", priority: 5 }),
      makeTask({ id: "5", priority: 10 }),
    ];
    const result = computePriorityDistribution(tasks);
    expect(result[0]).toMatchObject({ label: "Low", count: 2 });
    expect(result[1]).toMatchObject({ label: "Medium", count: 1 });
    expect(result[2]).toMatchObject({ label: "High", count: 1 });
    expect(result[3]).toMatchObject({ label: "Urgent", count: 1 });
  });

  it("excludes completed tasks", () => {
    const tasks = [
      makeTask({ id: "1", priority: 10, completed: true }),
      makeTask({ id: "2", priority: 10 }),
    ];
    const result = computePriorityDistribution(tasks);
    expect(result[3].count).toBe(1);
  });

  it("handles boundary priority values correctly", () => {
    const tasks = [
      makeTask({ id: "1", priority: 2 }), // Low max
      makeTask({ id: "2", priority: 3 }), // Medium min
      makeTask({ id: "3", priority: 4 }), // Medium max
      makeTask({ id: "4", priority: 5 }), // High min
      makeTask({ id: "5", priority: 7 }), // High max
      makeTask({ id: "6", priority: 8 }), // Urgent min
    ];
    const result = computePriorityDistribution(tasks);
    expect(result[0].count).toBe(1); // Low
    expect(result[1].count).toBe(2); // Medium
    expect(result[2].count).toBe(2); // High
    expect(result[3].count).toBe(1); // Urgent
  });
});

describe("computeStatusDistribution", () => {
  it("returns empty when no active tasks", () => {
    const tasks = [makeTask({ id: "1", completed: true })];
    expect(computeStatusDistribution(tasks)).toEqual([]);
  });

  it("counts each status correctly", () => {
    const tasks = [
      makeTask({ id: "1", status: "pending" }),
      makeTask({ id: "2", status: "pending" }),
      makeTask({ id: "3", status: "in_progress" }),
      makeTask({ id: "4", status: "paused" }),
      makeTask({ id: "5", status: "needs_approval" }),
    ];
    const result = computeStatusDistribution(tasks);
    expect(result).toHaveLength(4);
    expect(result.find((s) => s.status === "pending")?.count).toBe(2);
    expect(result.find((s) => s.status === "in_progress")?.count).toBe(1);
    expect(result.find((s) => s.status === "paused")?.count).toBe(1);
    expect(result.find((s) => s.status === "needs_approval")?.count).toBe(1);
  });

  it("filters out statuses with zero count", () => {
    const tasks = [makeTask({ id: "1", status: "pending" })];
    const result = computeStatusDistribution(tasks);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("pending");
  });
});

describe("computeUpcomingDeadlines", () => {
  it("returns empty for no tasks", () => {
    expect(computeUpcomingDeadlines([], categories)).toEqual([]);
  });

  it("excludes completed tasks", () => {
    const tasks = [
      makeTask({
        id: "1",
        completed: true,
        dueDate: { start: "2099-06-15", end: null },
      }),
    ];
    expect(computeUpcomingDeadlines(tasks, categories)).toEqual([]);
  });

  it("excludes overdue tasks", () => {
    const tasks = [
      makeTask({
        id: "1",
        dueDate: { start: "2020-01-01", end: null },
      }),
    ];
    expect(computeUpcomingDeadlines(tasks, categories)).toEqual([]);
  });

  it("sorts by daysLeft ascending", () => {
    const tasks = [
      makeTask({
        id: "1",
        title: "Far",
        dueDate: { start: "2099-12-31", end: null },
      }),
      makeTask({
        id: "2",
        title: "Near",
        dueDate: { start: "2099-06-01", end: null },
      }),
    ];
    const result = computeUpcomingDeadlines(tasks, categories);
    expect(result[0].title).toBe("Near");
    expect(result[1].title).toBe("Far");
  });

  it("respects limit parameter", () => {
    const tasks = Array.from({ length: 10 }, (_, i) =>
      makeTask({ id: String(i), title: `Task ${i}` }),
    );
    const result = computeUpcomingDeadlines(tasks, categories, 3);
    expect(result).toHaveLength(3);
  });

  it("uses default limit of 5", () => {
    const tasks = Array.from({ length: 10 }, (_, i) =>
      makeTask({ id: String(i), title: `Task ${i}` }),
    );
    const result = computeUpcomingDeadlines(tasks, categories);
    expect(result).toHaveLength(5);
  });

  it("uses fallback color for unknown category", () => {
    const tasks = [makeTask({ id: "1", categoryId: "nonexistent" })];
    const result = computeUpcomingDeadlines(tasks, categories);
    expect(result[0].categoryColor).toBe("#71717a");
  });

  it("uses dueDate.end over dueDate.start when end is present", () => {
    const tasks = [
      makeTask({
        id: "1",
        title: "Has End",
        dueDate: { start: "2020-01-01", end: "2099-12-31" },
      }),
    ];
    const result = computeUpcomingDeadlines(tasks, categories);
    // Should not be excluded as overdue — end date is far future
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Has End");
  });
});

describe("computeMatrixData", () => {
  // Freeze time so date-relative tests don't break
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date("2026-02-26T00:00:00") });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns defaults for empty array", () => {
    const { tasks, suggested } = computeMatrixData([], categories);
    expect(tasks).toEqual([]);
    expect(suggested).toEqual([]);
  });

  it("excludes completed tasks", () => {
    const activeTask = makeTask({ id: "1", completed: false });
    const completedTask = makeTask({ id: "2", completed: true });
    const { tasks } = computeMatrixData(
      [activeTask, completedTask],
      categories,
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("1");
  });

  it("assigns tasks to correct quadrants", () => {
    // Today is 2026-02-26, so +1 day is 2026-02-27, +5 days is 2026-03-03
    const q1Task = makeTask({
      id: "q1",
      priority: 8,
      dueDate: { start: "2026-02-27", end: null },
    }); // Urgent, Important
    const q2Task = makeTask({
      id: "q2",
      priority: 8,
      dueDate: { start: "2026-03-03", end: null },
    }); // Not Urgent, Important
    const q3Task = makeTask({
      id: "q3",
      priority: 2,
      dueDate: { start: "2026-02-27", end: null },
    }); // Urgent, Not Important
    const q4Task = makeTask({
      id: "q4",
      priority: 2,
      dueDate: { start: "2026-03-03", end: null },
    }); // Not Urgent, Not Important

    const { tasks } = computeMatrixData(
      [q1Task, q2Task, q3Task, q4Task],
      categories,
    );

    expect(tasks.find((t) => t.id === "q1")?.quadrant).toBe("q1");
    expect(tasks.find((t) => t.id === "q2")?.quadrant).toBe("q2");
    expect(tasks.find((t) => t.id === "q3")?.quadrant).toBe("q3");
    expect(tasks.find((t) => t.id === "q4")?.quadrant).toBe("q4");
  });

  it("treats daysLeft === 3 as urgent and daysLeft === 4 as not urgent", () => {
    // Exactly 3 days out (2026-03-01) should be urgent
    const urgentBoundary = makeTask({
      id: "boundary-urgent",
      priority: 8,
      dueDate: { start: "2026-03-01", end: null },
    });
    // Exactly 4 days out (2026-03-02) should NOT be urgent
    const notUrgentBoundary = makeTask({
      id: "boundary-not-urgent",
      priority: 8,
      dueDate: { start: "2026-03-02", end: null },
    });

    const { tasks } = computeMatrixData(
      [urgentBoundary, notUrgentBoundary],
      categories,
    );

    expect(tasks.find((t) => t.id === "boundary-urgent")?.quadrant).toBe("q1");
    expect(tasks.find((t) => t.id === "boundary-not-urgent")?.quadrant).toBe(
      "q2",
    );
  });

  it("maps category color and name with fallback for unknown", () => {
    const knownCat = makeTask({
      id: "known",
      categoryId: "personal",
      dueDate: { start: "2026-02-27", end: null },
    });
    const unknownCat = makeTask({
      id: "unknown",
      categoryId: "nonexistent",
      dueDate: { start: "2026-02-27", end: null },
    });

    const { tasks } = computeMatrixData([knownCat, unknownCat], categories);

    const known = tasks.find((t) => t.id === "known");
    expect(known?.categoryColor).toBe("#3b82f6");
    expect(known?.categoryName).toBe("Personal");

    const unknown = tasks.find((t) => t.id === "unknown");
    expect(unknown?.categoryColor).toBe("#71717a");
    expect(unknown?.categoryName).toBe("Unknown");
  });

  it("sorts suggested tasks correctly", () => {
    // Testing sorting: Q1 > Q2, then by Priority (higher), then by Days Left (fewer)
    const t1 = makeTask({
      id: "t1",
      priority: 8,
      dueDate: { start: "2026-02-28", end: null },
    }); // Q1: Priority 8, Due in 2 days
    const t2 = makeTask({
      id: "t2",
      priority: 10,
      dueDate: { start: "2026-02-25", end: null },
    }); // Q1: Priority 10, Due -1 days (overdue)
    const t3 = makeTask({
      id: "t3",
      priority: 10,
      dueDate: { start: "2026-02-27", end: null },
    }); // Q1: Priority 10, Due 1 day
    const t4 = makeTask({
      id: "t4",
      priority: 9,
      dueDate: { start: "2026-03-05", end: null },
    }); // Q2: Priority 9, Due 7 days

    const { suggested } = computeMatrixData([t1, t2, t3, t4], categories);

    // Max 3 suggestions
    expect(suggested).toHaveLength(3);

    // Priority order expected:
    // 1. t2 (Q1, priority 10, overdue)
    // 2. t3 (Q1, priority 10, due in 1)
    // 3. t1 (Q1, priority 8, due in 2)
    // t4 (Q2) should be excluded
    expect(suggested[0].id).toBe("t2");
    expect(suggested[1].id).toBe("t3");
    expect(suggested[2].id).toBe("t1");
  });
});

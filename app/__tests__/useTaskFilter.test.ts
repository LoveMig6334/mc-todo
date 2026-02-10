import { useTaskFilter } from "@/app/hooks/useTaskFilter";
import { Category, Task } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

const mockCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Test Task",
  details: "Test details",
  categoryId: "work",
  priority: 5,
  status: "in_progress",
  dueDate: { start: "2099-01-15", end: null },
  subtasks: [],
  referenceLinks: [],
  completed: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockTasks: Task[] = [
  createTask({
    id: "1",
    title: "Work Task",
    categoryId: "work",
    status: "in_progress",
  }),
  createTask({
    id: "2",
    title: "Personal Task",
    categoryId: "personal",
    status: "pending",
  }),
  createTask({
    id: "3",
    title: "Completed Work",
    categoryId: "work",
    completed: true,
  }),
  createTask({
    id: "4",
    title: "Needs Review",
    categoryId: "personal",
    status: "needs_approval",
    details: "important review",
  }),
];

describe("useTaskFilter", () => {
  it("returns all tasks when no filters are active", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    expect(result.current.filteredTasks).toHaveLength(4);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it("filters by search query matching title", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setSearchQuery("Work");
    });

    expect(result.current.filteredTasks).toHaveLength(2);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("filters by search query matching details (case-insensitive)", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setSearchQuery("IMPORTANT");
    });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].title).toBe("Needs Review");
  });

  it("filters by status", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setStatusFilter("pending");
    });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].title).toBe("Personal Task");
  });

  it("filters by completed status", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setStatusFilter("completed");
    });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].title).toBe("Completed Work");
  });

  it("filters by category", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setCategoryFilter("personal");
    });

    expect(result.current.filteredTasks).toHaveLength(2);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("combines multiple filters", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setSearchQuery("Task");
      result.current.setCategoryFilter("work");
    });

    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].title).toBe("Work Task");
    expect(result.current.activeFilterCount).toBe(2);
  });

  it("clears all filters", () => {
    const { result } = renderHook(() =>
      useTaskFilter(mockTasks, mockCategories),
    );

    act(() => {
      result.current.setSearchQuery("Work");
      result.current.setStatusFilter("in_progress");
      result.current.setCategoryFilter("work");
    });

    expect(result.current.activeFilterCount).toBe(3);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filteredTasks).toHaveLength(4);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.statusFilter).toBe("all");
    expect(result.current.categoryFilter).toBe("all");
  });
});

import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { Task, Category } from "@/app/types/task";

const mockCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

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

// Mock hooks
jest.mock("@/app/hooks/useTaskManager", () => ({
  useTaskManager: jest.fn(),
}));

jest.mock("@/app/hooks/useCategories", () => ({
  useCategories: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useTaskManager } = require("@/app/hooks/useTaskManager");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useCategories } = require("@/app/hooks/useCategories");

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCategories.mockReturnValue({
      categories: mockCategories,
      addCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      getCategoryById: jest.fn(),
    });
  });

  it("renders empty state when no tasks", () => {
    useTaskManager.mockReturnValue({
      tasks: [],
      stats: { total: 0, completed: 0, overdue: 0 },
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      getTaskById: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Create tasks to see your analytics here."),
    ).toBeInTheDocument();
  });

  it("renders stat cards with task data", () => {
    const tasks = [
      makeTask({ id: "1", status: "in_progress" }),
      makeTask({ id: "2", completed: true }),
      makeTask({
        id: "3",
        dueDate: { start: "2020-01-01", end: null },
      }),
    ];

    useTaskManager.mockReturnValue({
      tasks,
      stats: { total: 3, completed: 1, overdue: 1 },
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      getTaskById: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    // "In Progress" appears in both stat card and status legend
    expect(screen.getAllByText("In Progress").length).toBeGreaterThanOrEqual(1);

    // Check completion rate subtitle
    expect(screen.getByText("33% completion rate")).toBeInTheDocument();
  });

  it("renders chart sections", () => {
    const tasks = [makeTask({ id: "1", categoryId: "work" })];

    useTaskManager.mockReturnValue({
      tasks,
      stats: { total: 1, completed: 0, overdue: 0 },
      addTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleComplete: jest.fn(),
      getTaskById: jest.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText("Tasks by Category")).toBeInTheDocument();
    expect(screen.getByText("Priority Distribution")).toBeInTheDocument();
    expect(screen.getByText("Status Overview")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Deadlines")).toBeInTheDocument();
  });
});

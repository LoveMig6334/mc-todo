import PriorityListView from "@/app/components/task/PriorityListView";
import { Category, Task } from "@/app/types/task";
import { render, screen } from "@testing-library/react";

const mockCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Test Task",
  details: "Test details",
  categoryId: "work",
  priority: 5,
  dueDate: { start: "2099-01-15", end: null },
  referenceLinks: [],
  completed: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockHandlers = {
  onToggleComplete: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("PriorityListView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no tasks", () => {
    render(
      <PriorityListView
        tasks={[]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("renders tasks in a table format", () => {
    render(
      <PriorityListView
        tasks={[createMockTask()]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test details")).toBeInTheDocument();
  });

  it("displays column headers", () => {
    render(
      <PriorityListView
        tasks={[createMockTask()]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  it("groups tasks by priority with section headers", () => {
    const highPriorityTask = createMockTask({
      id: "1",
      priority: 8,
      title: "Urgent Task",
    });
    const lowPriorityTask = createMockTask({
      id: "2",
      priority: 2,
      title: "Low Task",
    });

    render(
      <PriorityListView
        tasks={[highPriorityTask, lowPriorityTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Urgent Priority")).toBeInTheDocument();
    expect(screen.getByText("Low Priority")).toBeInTheDocument();
  });

  it("shows completed tasks with reduced opacity", () => {
    const completedTask = createMockTask({ completed: true });

    render(
      <PriorityListView
        tasks={[completedTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    // Check that the task title has line-through styling
    const taskTitle = screen.getByText("Test Task");
    expect(taskTitle).toHaveClass("line-through");
  });

  it("displays priority labels correctly", () => {
    const urgentTask = createMockTask({ id: "1", priority: 9 });
    const highTask = createMockTask({ id: "2", priority: 6 });
    const mediumTask = createMockTask({ id: "3", priority: 4 });
    const lowTask = createMockTask({ id: "4", priority: 1 });

    render(
      <PriorityListView
        tasks={[urgentTask, highTask, mediumTask, lowTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});

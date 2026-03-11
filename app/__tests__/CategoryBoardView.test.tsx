import CategoryBoardView from "@/app/components/task/CategoryBoardView";
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
  status: "pending",
  dueDate: { start: "2099-01-15", end: null },
  referenceLinks: [],
  subtasks: [],
  completed: false,
  completedAt: null,
  archived: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockHandlers = {
  onToggleComplete: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onUpdate: jest.fn(),
};

describe("CategoryBoardView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no tasks and no categories", () => {
    render(<CategoryBoardView tasks={[]} categories={[]} {...mockHandlers} />);

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("renders category columns", () => {
    render(
      <CategoryBoardView
        tasks={[]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("renders tasks in their category columns", () => {
    const workTask = createMockTask({
      id: "1",
      title: "Work Task",
      categoryId: "work",
    });
    const personalTask = createMockTask({
      id: "2",
      title: "Personal Task",
      categoryId: "personal",
    });

    render(
      <CategoryBoardView
        tasks={[workTask, personalTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Work Task")).toBeInTheDocument();
    expect(screen.getByText("Personal Task")).toBeInTheDocument();
  });

  it("shows Backlog column for uncategorized tasks", () => {
    const uncategorizedTask = createMockTask({
      id: "1",
      title: "Uncategorized Task",
      categoryId: "nonexistent",
    });

    render(
      <CategoryBoardView
        tasks={[uncategorizedTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized Task")).toBeInTheDocument();
  });

  it("displays task count in column headers", () => {
    const tasks = [
      createMockTask({ id: "1", categoryId: "work" }),
      createMockTask({ id: "2", categoryId: "work" }),
    ];

    render(
      <CategoryBoardView
        tasks={tasks}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows 'No tasks' message in empty columns", () => {
    render(
      <CategoryBoardView
        tasks={[]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    const noTasksMessages = screen.getAllByText("No tasks");
    expect(noTasksMessages.length).toBeGreaterThan(0);
  });

  it("displays priority labels on task cards", () => {
    const highPriorityTask = createMockTask({ priority: 8 });

    render(
      <CategoryBoardView
        tasks={[highPriorityTask]}
        categories={mockCategories}
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Very High")).toBeInTheDocument();
  });
});

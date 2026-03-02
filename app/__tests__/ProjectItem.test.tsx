import { render, screen, fireEvent } from "@testing-library/react";
import ProjectItem from "@/app/components/task/ProjectItem";
import { Project, Task, Category } from "@/app/types/task";

const mockProject: Project = {
  id: "proj-1",
  title: "My Project",
  description: "Project description",
  color: "#f97316",
  dueDate: { start: "2024-03-01", end: "2024-03-31" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockCategory: Category = {
  id: "cat-1",
  name: "Work",
  color: "#3b82f6",
};

const mockTask: Task = {
  id: "task-1",
  title: "Child Task",
  details: "",
  categoryId: "cat-1",
  priority: 3,
  status: "pending",
  dueDate: { start: "2024-03-10", end: null },
  referenceLinks: [],
  completed: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  projectId: "proj-1",
};

const mockHandlers = {
  onToggleComplete: jest.fn(),
  onEditTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onUpdateTask: jest.fn(),
  onAddTask: jest.fn(),
  onEditProject: jest.fn(),
  onDeleteProject: jest.fn(),
};

describe("ProjectItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders project title", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("renders project description", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("Project description")).toBeInTheDocument();
  });

  it("renders color accent bar with project color", () => {
    const { container } = render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    // Check that an element with the accent color exists
    const allDivs = container.querySelectorAll("div");
    const hasAccentColor = Array.from(allDivs).some(
      (el) => el.getAttribute("style")?.includes("#f97316") || el.getAttribute("style")?.includes("rgb(249, 115, 22)"),
    );
    expect(hasAccentColor).toBe(true);
  });

  it("shows task count", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[mockTask]}
        categories={[mockCategory]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });

  it("shows plural task count for multiple tasks", () => {
    const task2 = { ...mockTask, id: "task-2", title: "Another Task" };
    render(
      <ProjectItem
        project={mockProject}
        tasks={[mockTask, task2]}
        categories={[mockCategory]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("2 tasks")).toBeInTheDocument();
  });

  it("renders child tasks", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[mockTask]}
        categories={[mockCategory]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("Child Task")).toBeInTheDocument();
  });

  it("renders empty state when no tasks", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("No tasks in this project yet.")).toBeInTheDocument();
  });

  it("renders Add task button", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    expect(screen.getByText("Add task to project")).toBeInTheDocument();
  });

  it("calls onAddTask with project id when Add task button clicked", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    fireEvent.click(screen.getByText("Add task to project"));
    expect(mockHandlers.onAddTask).toHaveBeenCalledWith("proj-1");
  });

  it("calls onEditProject when edit button clicked", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    fireEvent.click(screen.getByLabelText("Edit project"));
    expect(mockHandlers.onEditProject).toHaveBeenCalledWith(mockProject);
  });

  it("calls onDeleteProject when delete button clicked", () => {
    render(
      <ProjectItem
        project={mockProject}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    fireEvent.click(screen.getByLabelText("Delete project"));
    expect(mockHandlers.onDeleteProject).toHaveBeenCalledWith("proj-1");
  });

  describe("expand/collapse", () => {
    it("is expanded by default (shows body content)", () => {
      render(
        <ProjectItem
          project={mockProject}
          tasks={[]}
          categories={[]}
          {...mockHandlers}
        />,
      );
      expect(screen.getByText("Add task to project")).toBeInTheDocument();
    });

    it("collapses when toggle button clicked", () => {
      render(
        <ProjectItem
          project={mockProject}
          tasks={[]}
          categories={[]}
          {...mockHandlers}
        />,
      );
      fireEvent.click(screen.getByLabelText("Collapse project"));
      expect(screen.queryByText("Add task to project")).not.toBeInTheDocument();
    });

    it("expands again when toggle button clicked twice", () => {
      render(
        <ProjectItem
          project={mockProject}
          tasks={[]}
          categories={[]}
          {...mockHandlers}
        />,
      );
      fireEvent.click(screen.getByLabelText("Collapse project"));
      fireEvent.click(screen.getByLabelText("Expand project"));
      expect(screen.getByText("Add task to project")).toBeInTheDocument();
    });
  });

  it("does not render description when empty", () => {
    const projectNoDesc = { ...mockProject, description: "" };
    render(
      <ProjectItem
        project={projectNoDesc}
        tasks={[]}
        categories={[]}
        {...mockHandlers}
      />,
    );
    expect(screen.queryByText("Project description")).not.toBeInTheDocument();
  });
});

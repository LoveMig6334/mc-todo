import { render, screen, fireEvent } from "@testing-library/react";
import ProjectModal from "@/app/components/task/ProjectModal";
import { Project } from "@/app/types/task";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
};

const mockProject: Project = {
  id: "proj-1",
  title: "Existing Project",
  description: "Existing description",
  color: "#3b82f6",
  dueDate: { start: "2024-03-01", end: "2024-03-31" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("ProjectModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<ProjectModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Create New Project")).not.toBeInTheDocument();
  });

  it("renders 'Create New Project' title when no editingProject", () => {
    render(<ProjectModal {...defaultProps} />);
    expect(screen.getByText("Create New Project")).toBeInTheDocument();
  });

  it("renders 'Edit Project' title when editingProject provided", () => {
    render(<ProjectModal {...defaultProps} editingProject={mockProject} />);
    expect(screen.getByText("Edit Project")).toBeInTheDocument();
  });

  it("renders Title input field", () => {
    render(<ProjectModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("Enter project title")).toBeInTheDocument();
  });

  it("renders Description textarea", () => {
    render(<ProjectModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("Describe this project...")).toBeInTheDocument();
  });

  it("renders 8 color picker buttons", () => {
    render(<ProjectModal {...defaultProps} />);
    const colorButtons = screen.getAllByRole("button", { name: /Select color/i });
    expect(colorButtons).toHaveLength(8);
  });

  it("pre-fills title and description from editingProject", () => {
    render(<ProjectModal {...defaultProps} editingProject={mockProject} />);
    expect(screen.getByDisplayValue("Existing Project")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing description")).toBeInTheDocument();
  });

  it("shows 'Create Project' submit button for new project", () => {
    render(<ProjectModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Create Project" })).toBeInTheDocument();
  });

  it("shows 'Save Changes' submit button when editing", () => {
    render(<ProjectModal {...defaultProps} editingProject={mockProject} />);
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("shows title validation error when submitted without title", () => {
    render(<ProjectModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });

  it("does not call onSubmit when title is empty", () => {
    render(<ProjectModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit and onClose when form is valid", () => {
    render(<ProjectModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("Enter project title"), {
      target: { value: "New Project" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Project" }),
    );
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Cancel button clicked", () => {
    render(<ProjectModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("selects a new color when color button clicked", () => {
    render(<ProjectModal {...defaultProps} />);
    // Click blue color (#3b82f6)
    fireEvent.click(screen.getByLabelText("Select color #3b82f6"));
    // Fill in a title so submit works
    fireEvent.change(screen.getByPlaceholderText("Enter project title"), {
      target: { value: "Colored Project" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ color: "#3b82f6" }),
    );
  });

  it("clears title error when user types in the title field", () => {
    render(<ProjectModal {...defaultProps} />);
    // Trigger validation error
    fireEvent.click(screen.getByRole("button", { name: "Create Project" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    // Now type something
    fireEvent.change(screen.getByPlaceholderText("Enter project title"), {
      target: { value: "A" },
    });
    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
  });
});

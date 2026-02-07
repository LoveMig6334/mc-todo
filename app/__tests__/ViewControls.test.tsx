import ViewControls from "@/app/components/task/ViewControls";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ViewControls", () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders list and board view buttons", () => {
    render(<ViewControls viewMode="list" onViewChange={mockOnViewChange} />);

    expect(screen.getByLabelText("Priority List View")).toBeInTheDocument();
    expect(screen.getByLabelText("Category Board View")).toBeInTheDocument();
  });

  it("highlights list button when viewMode is list", () => {
    render(<ViewControls viewMode="list" onViewChange={mockOnViewChange} />);

    const listButton = screen.getByLabelText("Priority List View");
    expect(listButton).toHaveClass("bg-orange-500");
  });

  it("highlights board button when viewMode is board", () => {
    render(<ViewControls viewMode="board" onViewChange={mockOnViewChange} />);

    const boardButton = screen.getByLabelText("Category Board View");
    expect(boardButton).toHaveClass("bg-orange-500");
  });

  it("calls onViewChange with 'list' when list button is clicked", () => {
    render(<ViewControls viewMode="board" onViewChange={mockOnViewChange} />);

    fireEvent.click(screen.getByLabelText("Priority List View"));
    expect(mockOnViewChange).toHaveBeenCalledWith("list");
  });

  it("calls onViewChange with 'board' when board button is clicked", () => {
    render(<ViewControls viewMode="list" onViewChange={mockOnViewChange} />);

    fireEvent.click(screen.getByLabelText("Category Board View"));
    expect(mockOnViewChange).toHaveBeenCalledWith("board");
  });

  it("renders filter and info placeholder buttons", () => {
    render(<ViewControls viewMode="list" onViewChange={mockOnViewChange} />);

    expect(screen.getByLabelText("Filter tasks")).toBeInTheDocument();
    expect(screen.getByLabelText("View info")).toBeInTheDocument();
  });
});

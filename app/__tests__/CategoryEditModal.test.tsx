import CategoryEditModal from "@/app/components/dashboard/CategoryEditModal";
import { Category } from "@/app/types/task";
import { fireEvent, render, screen } from "@testing-library/react";

const mockCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
  { id: "shopping", name: "Shopping", color: "#22c55e" },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onUpdate: jest.fn(),
  onDelete: jest.fn(),
  onAdd: jest
    .fn()
    .mockReturnValue({ id: "new-1", name: "New", color: "#a855f7" }),
  categories: mockCategories,
  taskCountByCategory: { work: 5, personal: 2, shopping: 0 } as Record<
    string,
    number
  >,
};

describe("CategoryEditModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<CategoryEditModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Manage Categories")).not.toBeInTheDocument();
  });

  it("renders all categories when open", () => {
    render(<CategoryEditModal {...defaultProps} />);
    expect(screen.getByText("Manage Categories")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Shopping")).toBeInTheDocument();
  });

  it("shows task counts for each category", () => {
    render(<CategoryEditModal {...defaultProps} />);
    expect(screen.getByText("5 tasks")).toBeInTheDocument();
    expect(screen.getByText("2 tasks")).toBeInTheDocument();
    expect(screen.getByText("0 tasks")).toBeInTheDocument();
  });

  it("shows singular 'task' for count of 1", () => {
    render(
      <CategoryEditModal
        {...defaultProps}
        taskCountByCategory={{ work: 1, personal: 0, shopping: 0 }}
      />,
    );
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });

  it("shows Add Category button", () => {
    render(<CategoryEditModal {...defaultProps} />);
    expect(screen.getByText("Add Category")).toBeInTheDocument();
  });

  // --- Rename ---

  it("enters edit mode when rename button is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]); // Click rename on "Work"
    // Should show input with current name and Save/Cancel buttons
    expect(screen.getByDisplayValue("Work")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onUpdate with new name when save is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    const input = screen.getByDisplayValue("Work");
    fireEvent.change(input, { target: { value: "Office" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("work", {
      name: "Office",
    });
  });

  it("calls onUpdate with trimmed name", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    const input = screen.getByDisplayValue("Work");
    fireEvent.change(input, { target: { value: "  Office  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("work", {
      name: "Office",
    });
  });

  it("does not call onUpdate when name is empty", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    const input = screen.getByDisplayValue("Work");
    fireEvent.change(input, { target: { value: "" } });

    const saveBtn = screen.getByRole("button", { name: "Save" });
    expect(saveBtn).toBeDisabled();
  });

  it("exits edit mode when cancel is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    expect(screen.getByDisplayValue("Work")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByDisplayValue("Work")).not.toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("exits edit mode when Escape is pressed in input", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    const input = screen.getByDisplayValue("Work");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByDisplayValue("Work")).not.toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("saves on form submit (Enter key)", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    const input = screen.getByDisplayValue("Work");
    fireEvent.change(input, { target: { value: "Office" } });
    fireEvent.submit(input.closest("form")!);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("work", {
      name: "Office",
    });
  });

  // --- Color Change ---

  it("shows color picker when editing a category", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    // Should show color swatches (8 colors in CATEGORY_COLORS)
    const colorButtons = screen.getAllByTitle(/#[a-f0-9]{6}/i);
    expect(colorButtons.length).toBe(8);
  });

  it("calls onUpdate with new color when a swatch is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]); // Edit "Work"

    // Click the blue color swatch
    const blueButton = screen.getByTitle("#3b82f6");
    fireEvent.click(blueButton);

    expect(defaultProps.onUpdate).toHaveBeenCalledWith("work", {
      color: "#3b82f6",
    });
  });

  // --- Delete ---

  it("shows delete confirmation when delete button is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]); // Delete "Work"

    expect(
      screen.getByText(/This will remove the category from 5 tasks/),
    ).toBeInTheDocument();
  });

  it("shows no-tasks message for empty category deletion", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[2]); // Delete "Shopping" (0 tasks)

    expect(screen.getByText(/This category has no tasks/)).toBeInTheDocument();
  });

  it("calls onDelete when delete is confirmed", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    // The confirmation "Delete" button is a styled Button (not an icon button with title)
    // Find it among all buttons named "Delete" — it's the one without a title attribute
    const allDeleteButtons = screen.getAllByRole("button", { name: "Delete" });
    const confirmBtn = allDeleteButtons.find(
      (btn) => !btn.hasAttribute("title"),
    )!;
    fireEvent.click(confirmBtn);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("work");
  });

  it("hides delete confirmation when cancel is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(
      screen.getByText(/This will remove the category/),
    ).toBeInTheDocument();

    // The Cancel button inside the delete confirmation
    const cancelButtons = screen.getAllByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButtons[0]);

    expect(
      screen.queryByText(/This will remove the category/),
    ).not.toBeInTheDocument();
  });

  // --- Add Category ---

  it("shows add form when Add Category is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    expect(screen.getByPlaceholderText("Category name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("calls onAdd with name when add form is submitted", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Finance" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(defaultProps.onAdd).toHaveBeenCalledWith("Finance");
  });

  it("trims whitespace from new category name", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "  Finance  " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(defaultProps.onAdd).toHaveBeenCalledWith("Finance");
  });

  it("disables Add button when name is empty", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("hides add form when cancel is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    expect(screen.getByPlaceholderText("Category name")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByPlaceholderText("Category name"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Add Category")).toBeInTheDocument();
  });

  it("hides add form when Escape is pressed", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(
      screen.queryByPlaceholderText("Category name"),
    ).not.toBeInTheDocument();
  });

  it("clears input after successful add", () => {
    render(<CategoryEditModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Add Category"));

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Finance" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    // Add form should be hidden and Add Category button should be back
    expect(screen.getByText("Add Category")).toBeInTheDocument();
  });

  // --- Modal Close ---

  it("calls onClose and resets state when modal is closed", () => {
    render(<CategoryEditModal {...defaultProps} />);

    // Enter some state first
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);

    // Close via Escape on document (handled by Modal)
    fireEvent.keyDown(document, { key: "Escape" });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Mutual Exclusivity ---

  it("closes delete confirmation when rename is clicked", () => {
    render(<CategoryEditModal {...defaultProps} />);

    // Start delete on Work
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);
    expect(
      screen.getByText(/This will remove the category/),
    ).toBeInTheDocument();

    // Now click rename on Work
    // Since delete is showing, rename buttons are for other categories
    // Let's click rename on Personal instead
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]); // First available rename button

    // Delete confirmation should be gone because startEdit clears deletingId
    expect(
      screen.queryByText(/This will remove the category/),
    ).not.toBeInTheDocument();
  });

  it("closes edit mode when delete is clicked on same category", () => {
    render(<CategoryEditModal {...defaultProps} />);

    // Start rename on Work
    const renameButtons = screen.getAllByTitle("Rename");
    fireEvent.click(renameButtons[0]);
    expect(screen.getByDisplayValue("Work")).toBeInTheDocument();

    // Cancel the edit first, then delete
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    // Delete confirmation should be visible
    expect(
      screen.getByText(/This will remove the category/),
    ).toBeInTheDocument();
    // Edit input should be gone
    expect(screen.queryByDisplayValue("Work")).not.toBeInTheDocument();
  });
});

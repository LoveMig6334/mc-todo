import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
};

describe("ConfirmModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Delete Task")).not.toBeInTheDocument();
  });

  it("renders default title and message when open", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Delete Task")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete this task? This action cannot be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        title="Remove Item"
        message="This will be permanent."
      />,
    );
    expect(screen.getByText("Remove Item")).toBeInTheDocument();
    expect(screen.getByText("This will be permanent.")).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Yes, delete" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "No, keep" }),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);
    // The backdrop is the outermost fixed div
    const backdrop = screen.getByText("Delete Task").closest(".fixed");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<ConfirmModal {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});

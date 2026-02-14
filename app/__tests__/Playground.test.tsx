import { render, screen, fireEvent } from "@testing-library/react";
import NoteBlock from "@/app/components/playground/NoteBlock";
import BlockWrapper from "@/app/components/playground/BlockWrapper";
import PlaygroundToolbar from "@/app/components/playground/PlaygroundToolbar";
import { PlaygroundBlock, NoteBlockData } from "@/app/types/playground";

// --- NoteBlock ---

const defaultNoteData: NoteBlockData = {
  title: "Test Note",
  body: "Test body content",
  color: "#27272a",
};

describe("NoteBlock", () => {
  it("renders title and body", () => {
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    const titleInput = screen.getByPlaceholderText("Title");
    expect(titleInput).toHaveValue("Test Note");

    const bodyTextarea = screen.getByPlaceholderText("Write something...");
    expect(bodyTextarea).toHaveValue("Test body content");
  });

  it("calls onUpdate when title changes", () => {
    const onUpdate = jest.fn();
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "New Title" },
    });
    expect(onUpdate).toHaveBeenCalledWith({ title: "New Title" });
  });

  it("calls onUpdate when body changes", () => {
    const onUpdate = jest.fn();
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Write something..."), {
      target: { value: "New body" },
    });
    expect(onUpdate).toHaveBeenCalledWith({ body: "New body" });
  });

  it("shows color picker when selected", () => {
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={true}
        onUpdate={jest.fn()}
      />,
    );

    // Color picker dots should be visible
    expect(screen.getByTitle("Zinc")).toBeInTheDocument();
    expect(screen.getByTitle("Blue")).toBeInTheDocument();
    expect(screen.getByTitle("Purple")).toBeInTheDocument();
  });

  it("hides color picker when not selected", () => {
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.queryByTitle("Zinc")).not.toBeInTheDocument();
  });

  it("calls onUpdate with new color when color dot clicked", () => {
    const onUpdate = jest.fn();
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={true}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByTitle("Blue"));
    expect(onUpdate).toHaveBeenCalledWith({ color: "#1e3a5f" });
  });
});

// --- BlockWrapper ---

const mockBlock: PlaygroundBlock = {
  id: "block-1",
  type: "note",
  position: { x: 100, y: 200 },
  size: { width: 280, height: 200 },
  zIndex: 1,
  data: defaultNoteData,
};

describe("BlockWrapper", () => {
  const defaultProps = {
    block: mockBlock,
    isSelected: false,
    onSelect: jest.fn(),
    onMove: jest.fn(),
    onResize: jest.fn(),
    onDelete: jest.fn(),
    onBringToFront: jest.fn(),
    zoom: 1,
  };

  it("renders children", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>Block Content</span>
      </BlockWrapper>,
    );

    expect(screen.getByText("Block Content")).toBeInTheDocument();
  });

  it("positions block correctly", () => {
    render(
      <BlockWrapper {...defaultProps}>
        <span>Block Content</span>
      </BlockWrapper>,
    );

    const wrapper = screen.getByRole("button");
    expect(wrapper.style.left).toBe("100px");
    expect(wrapper.style.top).toBe("200px");
    expect(wrapper.style.width).toBe("280px");
    expect(wrapper.style.height).toBe("200px");
  });

  it("shows delete button when selected", () => {
    const { container } = render(
      <BlockWrapper {...defaultProps} isSelected={true}>
        <span>Content</span>
      </BlockWrapper>,
    );

    // Delete button (the X icon) should exist inside the wrapper
    const deleteButtons = container.querySelectorAll("button");
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("does not show delete button when not selected", () => {
    render(
      <BlockWrapper {...defaultProps} isSelected={false}>
        <span>Content</span>
      </BlockWrapper>,
    );

    const wrapper = screen.getByRole("button");
    // Only the resize handle should be inside, no delete button
    const buttons = wrapper.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });
});

// --- PlaygroundToolbar ---

describe("PlaygroundToolbar", () => {
  const defaultProps = {
    viewport: { x: 0, y: 0, zoom: 1 },
    onViewportChange: jest.fn(),
    onAddNote: jest.fn(),
  };

  it("renders zoom percentage", () => {
    render(<PlaygroundToolbar {...defaultProps} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders with custom zoom level", () => {
    render(
      <PlaygroundToolbar
        {...defaultProps}
        viewport={{ x: 0, y: 0, zoom: 0.5 }}
      />,
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("calls onAddNote when Note button clicked", () => {
    render(<PlaygroundToolbar {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Add Note"));
    expect(defaultProps.onAddNote).toHaveBeenCalled();
  });

  it("calls onViewportChange when zoom in clicked", () => {
    render(<PlaygroundToolbar {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Zoom in"));
    expect(defaultProps.onViewportChange).toHaveBeenCalledWith({
      x: 0,
      y: 0,
      zoom: 1.1,
    });
  });

  it("calls onViewportChange when zoom out clicked", () => {
    render(<PlaygroundToolbar {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Zoom out"));
    expect(defaultProps.onViewportChange).toHaveBeenCalledWith({
      x: 0,
      y: 0,
      zoom: 0.9,
    });
  });

  it("resets viewport when zoom percentage clicked", () => {
    render(
      <PlaygroundToolbar
        {...defaultProps}
        viewport={{ x: 100, y: 200, zoom: 1.5 }}
      />,
    );
    fireEvent.click(screen.getByText("150%"));
    expect(defaultProps.onViewportChange).toHaveBeenCalledWith({
      x: 0,
      y: 0,
      zoom: 1,
    });
  });
});

import BlockWrapper from "@/app/components/playground/BlockWrapper";
import NoteBlock from "@/app/components/playground/NoteBlock";
import PlaygroundToolbar from "@/app/components/playground/PlaygroundToolbar";
import TodoListBlock from "@/app/components/playground/TodoListBlock";
import {
  NoteBlockData,
  PlaygroundBlock,
  TodoBlockData,
} from "@/app/types/playground";
import { fireEvent, render, screen } from "@testing-library/react";

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

    // Body is now a contentEditable div
    const bodyDiv = screen.getByText("Test body content");
    expect(bodyDiv).toBeInTheDocument();
    expect(bodyDiv).toHaveAttribute("contenteditable", "true");
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

  it("calls onUpdate when body is edited", () => {
    const onUpdate = jest.fn();
    render(
      <NoteBlock
        data={defaultNoteData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    const bodyDiv = screen.getByText("Test body content");
    // Simulate input event on contentEditable div
    bodyDiv.innerHTML = "New body";
    fireEvent.input(bodyDiv);
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

  // --- Formatting toolbar tests ---

  describe("formatting toolbar", () => {
    let execCommandMock: jest.Mock;

    beforeAll(() => {
      execCommandMock = jest.fn();
      document.execCommand = execCommandMock;
    });

    afterAll(() => {
      // @ts-expect-error clean up mock
      delete document.execCommand;
    });

    beforeEach(() => {
      execCommandMock.mockClear();
    });

    it("shows formatting toolbar when selected", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={true}
          onUpdate={jest.fn()}
        />,
      );

      expect(screen.getByTestId("formatting-toolbar")).toBeInTheDocument();
      expect(screen.getByTitle("Bold (Ctrl+B)")).toBeInTheDocument();
      expect(screen.getByTitle("Italic (Ctrl+I)")).toBeInTheDocument();
      expect(screen.getByTitle("Bullet list")).toBeInTheDocument();
      expect(screen.getByTitle("Ordered list")).toBeInTheDocument();
    });

    it("hides formatting toolbar when not selected", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={false}
          onUpdate={jest.fn()}
        />,
      );

      expect(
        screen.queryByTestId("formatting-toolbar"),
      ).not.toBeInTheDocument();
    });

    it("calls execCommand when bold button is clicked", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={true}
          onUpdate={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByTitle("Bold (Ctrl+B)"));
      expect(execCommandMock).toHaveBeenCalledWith("bold", false);
    });

    it("calls execCommand when italic button is clicked", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={true}
          onUpdate={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByTitle("Italic (Ctrl+I)"));
      expect(execCommandMock).toHaveBeenCalledWith("italic", false);
    });

    it("calls execCommand when bullet list button is clicked", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={true}
          onUpdate={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByTitle("Bullet list"));
      expect(execCommandMock).toHaveBeenCalledWith(
        "insertUnorderedList",
        false,
      );
    });

    it("calls execCommand when ordered list button is clicked", () => {
      render(
        <NoteBlock
          data={defaultNoteData}
          isSelected={true}
          onUpdate={jest.fn()}
        />,
      );

      fireEvent.click(screen.getByTitle("Ordered list"));
      expect(execCommandMock).toHaveBeenCalledWith("insertOrderedList", false);
    });
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
    onAddTodo: jest.fn(),
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

  it("calls onAddTodo when TODO button clicked", () => {
    render(<PlaygroundToolbar {...defaultProps} />);
    fireEvent.click(screen.getByTitle("Add TODO"));
    expect(defaultProps.onAddTodo).toHaveBeenCalled();
  });
});

// --- TodoListBlock ---

const defaultTodoData: TodoBlockData = {
  title: "My Checklist",
  items: [
    { id: "item-1", text: "Buy groceries", completed: false },
    { id: "item-2", text: "Clean house", completed: true },
  ],
  color: "#27272a",
};

describe("TodoListBlock", () => {
  it("renders title and items", () => {
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("My Checklist")).toBeInTheDocument();
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Clean house")).toBeInTheDocument();
  });

  it("renders empty checklist", () => {
    render(
      <TodoListBlock
        data={{ title: "", items: [], color: "#27272a" }}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Checklist title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add item...")).toBeInTheDocument();
    // No progress indicator when empty
    expect(screen.queryByTestId("todo-progress-text")).not.toBeInTheDocument();
  });

  it("adds a new item via Enter", () => {
    const onUpdate = jest.fn();
    render(
      <TodoListBlock
        data={{ title: "", items: [], color: "#27272a" }}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByPlaceholderText("Add item...");
    fireEvent.change(input, { target: { value: "New task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ text: "New task", completed: false }),
        ],
      }),
    );
  });

  it("toggles item completion", () => {
    const onUpdate = jest.fn();
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    // Toggle the first item (currently incomplete)
    const markCompleteBtn = screen.getByTitle("Mark complete");
    fireEvent.click(markCompleteBtn);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ id: "item-1", completed: true }),
        ]),
      }),
    );
  });

  it("removes an item", () => {
    const onUpdate = jest.fn();
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    const removeButtons = screen.getAllByTitle("Remove item");
    fireEvent.click(removeButtons[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ id: "item-2" })],
      }),
    );
  });

  it("shows progress indicator", () => {
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    // 1 of 2 items completed
    expect(screen.getByTestId("todo-progress-text")).toHaveTextContent(
      "1/2 done",
    );
    expect(screen.getByTestId("todo-progress-bar")).toBeInTheDocument();
  });

  it("shows color picker when selected", () => {
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={true}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.getByTitle("Zinc")).toBeInTheDocument();
    expect(screen.getByTitle("Blue")).toBeInTheDocument();
  });

  it("hides color picker when not selected", () => {
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={jest.fn()}
      />,
    );

    expect(screen.queryByTitle("Zinc")).not.toBeInTheDocument();
  });

  it("calls onUpdate when title changes", () => {
    const onUpdate = jest.fn();
    render(
      <TodoListBlock
        data={defaultTodoData}
        isSelected={false}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("My Checklist"), {
      target: { value: "New Title" },
    });
    expect(onUpdate).toHaveBeenCalledWith({ title: "New Title" });
  });
});

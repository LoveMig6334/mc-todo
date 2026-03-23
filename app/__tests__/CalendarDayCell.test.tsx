import { CalendarDay, CalendarEventLayout } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock motion/react to avoid animation issues in tests
jest.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      animate: _animate,
      initial: _initial,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      animate: _animate,
      initial: _initial,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

import CalendarDayCell from "@/app/components/calendar/CalendarDayCell";

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Test Task",
    details: "",
    categoryId: "work",
    priority: 5,
    status: "pending",
    dueDate: { start: "2026-02-15", end: null },
    subtasks: [],
    referenceLinks: [],
    completed: false,
    completedAt: null,
    archived: false,
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-01-01T00:00:00",
    ...overrides,
  };
}

function makeEventLayout(
  task: Task,
  overrides?: Partial<CalendarEventLayout>,
): CalendarEventLayout {
  return {
    task,
    category: { id: "work", name: "Work", color: "#f97316" } as Category,
    spanStart: true,
    spanEnd: true,
    spanMiddle: false,
    row: 0,
    ...overrides,
  };
}

function makeDay(overrides?: Partial<CalendarDay>): CalendarDay {
  return {
    date: "2026-02-15",
    dayOfMonth: 15,
    isCurrentMonth: true,
    isToday: false,
    events: [],
    ...overrides,
  };
}

const mockHandlers = {
  onClickEvent: jest.fn(),
  onExpandDay: jest.fn(),
};

describe("CalendarDayCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the day number", () => {
    render(
      <CalendarDayCell day={makeDay()} {...mockHandlers} isExpanded={false} />,
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders event bars", () => {
    const task = makeTask({ id: "1", title: "My Event" });
    const day = makeDay({
      events: [makeEventLayout(task)],
    });

    render(<CalendarDayCell day={day} {...mockHandlers} isExpanded={false} />);

    expect(screen.getByText("My Event")).toBeInTheDocument();
  });

  it("calls onClickEvent when clicking an event", () => {
    const task = makeTask({ id: "1", title: "Clickable Event" });
    const day = makeDay({
      events: [makeEventLayout(task)],
    });

    render(<CalendarDayCell day={day} {...mockHandlers} isExpanded={false} />);

    fireEvent.click(screen.getByText("Clickable Event"));
    expect(mockHandlers.onClickEvent).toHaveBeenCalledWith(task);
  });

  it("shows collapsed colored lines when events exceed threshold", () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeTask({ id: String(i), title: `Task ${i}` }),
    );
    const events = tasks.map((task, i) => makeEventLayout(task, { row: i }));
    const day = makeDay({ events });

    render(<CalendarDayCell day={day} {...mockHandlers} isExpanded={false} />);

    // First 3 events shown as full bars
    expect(screen.getByText("Task 0")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();

    // Remaining 2 shown as collapsed lines (no text, but title attribute exists)
    expect(screen.getByTitle("Task 3")).toBeInTheDocument();
    expect(screen.getByTitle("Task 4")).toBeInTheDocument();

    // +2 more indicator
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("renders with reduced opacity for non-current month days", () => {
    const { container } = render(
      <CalendarDayCell
        day={makeDay({ isCurrentMonth: false })}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    const cell = container.firstElementChild;
    expect(cell?.className).toContain("opacity-40");
  });

  it("does not render events when hideEvents is true", () => {
    const task = makeTask({ id: "1", title: "Hidden Event" });
    const day = makeDay({
      events: [makeEventLayout(task)],
    });

    render(
      <CalendarDayCell
        day={day}
        {...mockHandlers}
        isExpanded={false}
        hideEvents
      />,
    );

    expect(screen.queryByText("Hidden Event")).not.toBeInTheDocument();
  });

  it("renders add-task range overlay when isInAddRange is true", () => {
    const { container } = render(
      <CalendarDayCell
        day={makeDay()}
        {...mockHandlers}
        isExpanded={false}
        isInAddRange
      />,
    );

    // The overlay div uses inline style with the orange highlight
    const overlay = container.querySelector(
      '[style*="rgba(249, 115, 22, 0.15)"]',
    );
    expect(overlay).toBeInTheDocument();
  });

  it("calls onAddTaskMouseDown when mouseDown on cell", () => {
    const onAddTaskMouseDown = jest.fn();

    const { container } = render(
      <CalendarDayCell
        day={makeDay({ date: "2026-02-20", dayOfMonth: 20 })}
        {...mockHandlers}
        isExpanded={false}
        onAddTaskMouseDown={onAddTaskMouseDown}
      />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseDown(cell);

    expect(onAddTaskMouseDown).toHaveBeenCalledWith("2026-02-20");
  });

  it("calls onAddTaskMouseEnter on mouse enter", () => {
    const onAddTaskMouseEnter = jest.fn();

    const { container } = render(
      <CalendarDayCell
        day={makeDay({ date: "2026-02-20", dayOfMonth: 20 })}
        {...mockHandlers}
        isExpanded={false}
        onAddTaskMouseEnter={onAddTaskMouseEnter}
      />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseEnter(cell);

    expect(onAddTaskMouseEnter).toHaveBeenCalledWith("2026-02-20");
  });

  it("calls onResizeHover on mouse enter when resizing", () => {
    const onResizeHover = jest.fn();

    const { container } = render(
      <CalendarDayCell
        day={makeDay({ date: "2026-02-20", dayOfMonth: 20 })}
        {...mockHandlers}
        isExpanded={false}
        isResizing
        onResizeHover={onResizeHover}
      />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseEnter(cell);

    expect(onResizeHover).toHaveBeenCalledWith("2026-02-20");
  });

  it("calls onDragHover on mouse enter when dragging", () => {
    const onDragHover = jest.fn();

    const { container } = render(
      <CalendarDayCell
        day={makeDay({ date: "2026-02-20", dayOfMonth: 20 })}
        {...mockHandlers}
        isExpanded={false}
        isDragging
        onDragHover={onDragHover}
      />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseEnter(cell);

    expect(onDragHover).toHaveBeenCalledWith("2026-02-20");
  });

  it("highlights today with ring class", () => {
    const { container } = render(
      <CalendarDayCell
        day={makeDay({ isToday: true })}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    const cell = container.firstElementChild;
    expect(cell?.className).toContain("ring-orange-500");
  });

  it("collapses expanded day on mouse leave when not resizing or dragging", () => {
    const { container } = render(
      <CalendarDayCell day={makeDay()} {...mockHandlers} isExpanded={true} />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseLeave(cell);

    expect(mockHandlers.onExpandDay).toHaveBeenCalledWith(null);
  });

  it("does not collapse on mouse leave while resizing", () => {
    const { container } = render(
      <CalendarDayCell
        day={makeDay()}
        {...mockHandlers}
        isExpanded={true}
        isResizing
      />,
    );

    const cell = container.firstElementChild!;
    fireEvent.mouseLeave(cell);

    expect(mockHandlers.onExpandDay).not.toHaveBeenCalled();
  });
});

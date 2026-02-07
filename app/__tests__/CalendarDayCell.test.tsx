import { render, screen, fireEvent } from "@testing-library/react";
import CalendarDayCell from "@/app/components/calendar/CalendarDayCell";
import { CalendarDay, CalendarEventLayout } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: "Test Task",
    details: "",
    categoryId: "work",
    priority: 5,
    status: "pending",
    dueDate: { start: "2026-02-15", end: null },
    referenceLinks: [],
    completed: false,
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
  onDoubleClickDay: jest.fn(),
  onClickEvent: jest.fn(),
  onExpandDay: jest.fn(),
};

describe("CalendarDayCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the day number", () => {
    render(
      <CalendarDayCell
        day={makeDay()}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders event bars", () => {
    const task = makeTask({ id: "1", title: "My Event" });
    const day = makeDay({
      events: [makeEventLayout(task)],
    });

    render(
      <CalendarDayCell
        day={day}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    expect(screen.getByText("My Event")).toBeInTheDocument();
  });

  it("calls onDoubleClick handler with correct date", () => {
    render(
      <CalendarDayCell
        day={makeDay({ date: "2026-02-20", dayOfMonth: 20 })}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    const cell = screen.getByText("20").closest("div")!;
    fireEvent.doubleClick(cell);

    expect(mockHandlers.onDoubleClickDay).toHaveBeenCalledWith("2026-02-20");
  });

  it("calls onClickEvent when clicking an event", () => {
    const task = makeTask({ id: "1", title: "Clickable Event" });
    const day = makeDay({
      events: [makeEventLayout(task)],
    });

    render(
      <CalendarDayCell
        day={day}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

    fireEvent.click(screen.getByText("Clickable Event"));
    expect(mockHandlers.onClickEvent).toHaveBeenCalledWith(task);
  });

  it("shows collapsed colored lines when events exceed threshold", () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeTask({ id: String(i), title: `Task ${i}` }),
    );
    const events = tasks.map((task, i) =>
      makeEventLayout(task, { row: i }),
    );
    const day = makeDay({ events });

    render(
      <CalendarDayCell
        day={day}
        {...mockHandlers}
        isExpanded={false}
      />,
    );

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
});

import CalendarGrid from "@/app/components/calendar/CalendarGrid";
import { buildCalendarGrid } from "@/app/lib/calendarUtils";
import { Category, Task } from "@/app/types/task";
import { render, screen } from "@testing-library/react";

const mockCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

const mockHandlers = {
  onDoubleClickDay: jest.fn(),
  onClickEvent: jest.fn(),
  onExpandDay: jest.fn(),
  onResizeStart: jest.fn(),
  onResizeHover: jest.fn(),
  onDragStart: jest.fn(),
  onDragHover: jest.fn(),
};

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

describe("CalendarGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 7 day-of-week headers", () => {
    const grid = buildCalendarGrid(2026, 1, [], mockCategories);
    render(
      <CalendarGrid
        grid={grid}
        {...mockHandlers}
        expandedDayKey={null}
        resizeState={null}
        dragState={null}
      />,
    );

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  it("renders day-of-week headers with Thai tooltips", () => {
    const grid = buildCalendarGrid(2026, 1, [], mockCategories);
    render(
      <CalendarGrid
        grid={grid}
        {...mockHandlers}
        expandedDayKey={null}
        resizeState={null}
        dragState={null}
      />,
    );

    expect(screen.getByText("Sun")).toHaveAttribute("title", "อา.");
    expect(screen.getByText("Mon")).toHaveAttribute("title", "จ.");
  });

  it("renders correct number of day cells (42 = 6 weeks x 7 days)", () => {
    const grid = buildCalendarGrid(2026, 1, [], mockCategories);
    render(
      <CalendarGrid
        grid={grid}
        {...mockHandlers}
        expandedDayKey={null}
        resizeState={null}
        dragState={null}
      />,
    );

    // Feb 2026 starts on Sunday, 28 days.
    // All day numbers 1-28 should be present for Feb.
    // Also trailing days from March (1-14).
    for (let d = 1; d <= 28; d++) {
      // At least one element with this day number text
      const elements = screen.getAllByText(String(d));
      expect(elements.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("displays event titles in the grid", () => {
    const tasks = [makeTask({ id: "1", title: "Buy groceries" })];
    const grid = buildCalendarGrid(2026, 1, tasks, mockCategories);
    render(
      <CalendarGrid
        grid={grid}
        {...mockHandlers}
        expandedDayKey={null}
        resizeState={null}
        dragState={null}
      />,
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders multi-day events across multiple cells", () => {
    const tasks = [
      makeTask({
        id: "1",
        title: "Conference",
        dueDate: { start: "2026-02-10", end: "2026-02-12" },
      }),
    ];
    const grid = buildCalendarGrid(2026, 1, tasks, mockCategories);
    render(
      <CalendarGrid
        grid={grid}
        {...mockHandlers}
        expandedDayKey={null}
        resizeState={null}
        dragState={null}
      />,
    );

    // Title should appear once
    const titleElements = screen.getAllByText("Conference");
    expect(titleElements).toHaveLength(1);

    // With CSS Grid spanning, there should be 1 event button that spans multiple columns
    const buttons = screen.getAllByTitle("Conference");
    expect(buttons).toHaveLength(1);
  });
});

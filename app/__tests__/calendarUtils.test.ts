import {
  getCalendarDays,
  getTasksForDay,
  taskOverlapsDate,
  assignEventLanes,
  buildCalendarGrid,
  formatDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
  THAI_MONTHS,
  THAI_DAYS,
  MONTHS,
  DAYS_OF_WEEK,
  MAX_VISIBLE_EVENTS,
} from "@/app/lib/calendarUtils";
import { Category, Task } from "@/app/types/task";

// --- Helper to create test tasks ---
function makeTask(
  overrides: Partial<Task> & { id: string; dueDate: Task["dueDate"] },
): Task {
  return {
    title: "Test Task",
    details: "",
    categoryId: "work",
    priority: 5,
    status: "pending",
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

const defaultCategories: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
];

// --- Date Helpers ---

describe("formatDateString", () => {
  it("formats single-digit month and day with leading zeros", () => {
    expect(formatDateString(2026, 0, 5)).toBe("2026-01-05");
  });

  it("formats double-digit month and day", () => {
    expect(formatDateString(2026, 11, 25)).toBe("2026-12-25");
  });
});

describe("getDaysInMonth", () => {
  it("returns 31 for January", () => {
    expect(getDaysInMonth(2026, 0)).toBe(31);
  });

  it("returns 28 for February in a non-leap year", () => {
    expect(getDaysInMonth(2025, 1)).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it("returns 30 for April", () => {
    expect(getDaysInMonth(2026, 3)).toBe(30);
  });
});

describe("getFirstDayOfMonth", () => {
  it("returns correct day of week for a known date", () => {
    // February 1, 2026 is a Sunday (0)
    expect(getFirstDayOfMonth(2026, 1)).toBe(0);
  });

  it("returns correct day for January 2026 (Thursday)", () => {
    expect(getFirstDayOfMonth(2026, 0)).toBe(4);
  });
});

// --- Calendar Grid Generation ---

describe("getCalendarDays", () => {
  it("returns exactly 42 days (6 weeks)", () => {
    const days = getCalendarDays(2026, 1); // February 2026
    expect(days).toHaveLength(42);
  });

  it("starts with correct leading days from previous month", () => {
    // February 2026 starts on Sunday, so no leading days from January
    const days = getCalendarDays(2026, 1);
    expect(days[0]).toBe("2026-02-01");
  });

  it("includes leading days from previous month when month doesn't start on Sunday", () => {
    // January 2026 starts on Thursday (day 4), so 4 days from December 2025
    const days = getCalendarDays(2026, 0);
    expect(days[0]).toBe("2025-12-28"); // Sunday before Jan 1
    expect(days[3]).toBe("2025-12-31");
    expect(days[4]).toBe("2026-01-01");
  });

  it("includes trailing days from next month to fill 42 slots", () => {
    const days = getCalendarDays(2026, 1); // February 2026 (28 days, starts Sun)
    // 28 days from Feb + 14 trailing = 42
    expect(days[28]).toBe("2026-03-01");
    expect(days[41]).toBe("2026-03-14");
  });

  it("handles December correctly (next month is January of next year)", () => {
    const days = getCalendarDays(2025, 11); // December 2025
    const lastDay = days[days.length - 1];
    expect(lastDay.startsWith("2026-01-")).toBe(true);
  });
});

// --- Task Overlap ---

describe("taskOverlapsDate", () => {
  it("returns true for single-day task on matching date", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-15", end: null },
    });
    expect(taskOverlapsDate(task, "2026-02-15")).toBe(true);
  });

  it("returns false for single-day task on different date", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-15", end: null },
    });
    expect(taskOverlapsDate(task, "2026-02-16")).toBe(false);
  });

  it("returns true for multi-day task on start date", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-10", end: "2026-02-15" },
    });
    expect(taskOverlapsDate(task, "2026-02-10")).toBe(true);
  });

  it("returns true for multi-day task on end date", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-10", end: "2026-02-15" },
    });
    expect(taskOverlapsDate(task, "2026-02-15")).toBe(true);
  });

  it("returns true for multi-day task on middle date", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-10", end: "2026-02-15" },
    });
    expect(taskOverlapsDate(task, "2026-02-12")).toBe(true);
  });

  it("returns false for multi-day task outside range", () => {
    const task = makeTask({
      id: "1",
      dueDate: { start: "2026-02-10", end: "2026-02-15" },
    });
    expect(taskOverlapsDate(task, "2026-02-16")).toBe(false);
    expect(taskOverlapsDate(task, "2026-02-09")).toBe(false);
  });
});

describe("getTasksForDay", () => {
  const tasks = [
    makeTask({ id: "1", dueDate: { start: "2026-02-10", end: null } }),
    makeTask({
      id: "2",
      dueDate: { start: "2026-02-10", end: "2026-02-12" },
    }),
    makeTask({ id: "3", dueDate: { start: "2026-02-15", end: null } }),
  ];

  it("returns tasks matching a single day", () => {
    const result = getTasksForDay("2026-02-10", tasks);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(["1", "2"]);
  });

  it("returns tasks for a day within a range", () => {
    const result = getTasksForDay("2026-02-11", tasks);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns empty array for a day with no tasks", () => {
    const result = getTasksForDay("2026-02-20", tasks);
    expect(result).toHaveLength(0);
  });
});

// --- Lane Allocation ---

describe("assignEventLanes", () => {
  const weekDays = [
    "2026-02-08",
    "2026-02-09",
    "2026-02-10",
    "2026-02-11",
    "2026-02-12",
    "2026-02-13",
    "2026-02-14",
  ];

  it("assigns lane 0 to a single event", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2026-02-10", end: null } }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);
    const dayEvents = result.get("2026-02-10")!;
    expect(dayEvents).toHaveLength(1);
    expect(dayEvents[0].row).toBe(0);
  });

  it("assigns same lane to non-overlapping events", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2026-02-08", end: null } }),
      makeTask({ id: "2", dueDate: { start: "2026-02-12", end: null } }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);
    expect(result.get("2026-02-08")![0].row).toBe(0);
    expect(result.get("2026-02-12")![0].row).toBe(0);
  });

  it("assigns different lanes to overlapping events", () => {
    const tasks = [
      makeTask({
        id: "1",
        dueDate: { start: "2026-02-09", end: "2026-02-11" },
      }),
      makeTask({ id: "2", dueDate: { start: "2026-02-10", end: null } }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);
    const dayEvents = result.get("2026-02-10")!;
    expect(dayEvents).toHaveLength(2);

    const rows = dayEvents.map((e) => e.row);
    expect(rows).toContain(0);
    expect(rows).toContain(1);
  });

  it("maintains lane for multi-day events across days", () => {
    const tasks = [
      makeTask({
        id: "1",
        dueDate: { start: "2026-02-09", end: "2026-02-12" },
      }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);

    for (const day of ["2026-02-09", "2026-02-10", "2026-02-11", "2026-02-12"]) {
      const events = result.get(day)!;
      expect(events).toHaveLength(1);
      expect(events[0].row).toBe(0);
    }
  });

  it("sets correct span flags for multi-day events", () => {
    const tasks = [
      makeTask({
        id: "1",
        dueDate: { start: "2026-02-09", end: "2026-02-11" },
      }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);

    const startEvent = result.get("2026-02-09")![0];
    expect(startEvent.spanStart).toBe(true);
    expect(startEvent.spanEnd).toBe(false);
    expect(startEvent.spanMiddle).toBe(false);

    const midEvent = result.get("2026-02-10")![0];
    expect(midEvent.spanStart).toBe(false);
    expect(midEvent.spanEnd).toBe(false);
    expect(midEvent.spanMiddle).toBe(true);

    const endEvent = result.get("2026-02-11")![0];
    expect(endEvent.spanStart).toBe(false);
    expect(endEvent.spanEnd).toBe(true);
    expect(endEvent.spanMiddle).toBe(false);
  });

  it("sets spanStart and spanEnd to true for single-day events", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2026-02-10", end: null } }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);

    const event = result.get("2026-02-10")![0];
    expect(event.spanStart).toBe(true);
    expect(event.spanEnd).toBe(true);
    expect(event.spanMiddle).toBe(false);
  });

  it("returns empty arrays for days with no events", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2026-02-10", end: null } }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);
    expect(result.get("2026-02-08")!).toHaveLength(0);
    expect(result.get("2026-02-14")!).toHaveLength(0);
  });

  it("attaches correct category to events", () => {
    const tasks = [
      makeTask({
        id: "1",
        categoryId: "personal",
        dueDate: { start: "2026-02-10", end: null },
      }),
    ];
    const result = assignEventLanes(weekDays, tasks, defaultCategories);
    const event = result.get("2026-02-10")![0];
    expect(event.category?.id).toBe("personal");
    expect(event.category?.color).toBe("#3b82f6");
  });
});

// --- Full Grid ---

describe("buildCalendarGrid", () => {
  it("returns 6 rows of 7 days each", () => {
    const grid = buildCalendarGrid(2026, 1, [], defaultCategories);
    expect(grid).toHaveLength(6);
    for (const row of grid) {
      expect(row).toHaveLength(7);
    }
  });

  it("correctly marks current month days", () => {
    const grid = buildCalendarGrid(2026, 1, [], defaultCategories);
    // Feb 2026 starts on Sunday, 28 days
    // First row, first day should be Feb 1 (current month)
    expect(grid[0][0].isCurrentMonth).toBe(true);
    expect(grid[0][0].date).toBe("2026-02-01");

    // Last Feb day is Feb 28 (grid[3][6])
    expect(grid[3][6].date).toBe("2026-02-28");
    expect(grid[3][6].isCurrentMonth).toBe(true);

    // Next row starts with March (not current month)
    expect(grid[4][0].date).toBe("2026-03-01");
    expect(grid[4][0].isCurrentMonth).toBe(false);
  });

  it("places tasks in correct day cells", () => {
    const tasks = [
      makeTask({ id: "1", dueDate: { start: "2026-02-15", end: null } }),
    ];
    const grid = buildCalendarGrid(2026, 1, tasks, defaultCategories);

    // Find the cell for Feb 15
    let found = false;
    for (const row of grid) {
      for (const day of row) {
        if (day.date === "2026-02-15") {
          expect(day.events).toHaveLength(1);
          expect(day.events[0].task.id).toBe("1");
          found = true;
        }
      }
    }
    expect(found).toBe(true);
  });
});

// --- Thai Translations ---

describe("Thai translations", () => {
  it("has a Thai translation for every English month", () => {
    for (const month of MONTHS) {
      expect(THAI_MONTHS[month]).toBeDefined();
      expect(THAI_MONTHS[month].length).toBeGreaterThan(0);
    }
  });

  it("has a Thai translation for every day abbreviation", () => {
    for (const day of DAYS_OF_WEEK) {
      expect(THAI_DAYS[day]).toBeDefined();
      expect(THAI_DAYS[day].length).toBeGreaterThan(0);
    }
  });

  it("returns correct Thai for known months", () => {
    expect(THAI_MONTHS["January"]).toBe("มกราคม");
    expect(THAI_MONTHS["December"]).toBe("ธันวาคม");
  });
});

// --- Constants ---

describe("MAX_VISIBLE_EVENTS", () => {
  it("is set to 3", () => {
    expect(MAX_VISIBLE_EVENTS).toBe(3);
  });
});

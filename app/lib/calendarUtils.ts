import { CalendarDay, CalendarEventLayout } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";

// --- Thai Translation Constants ---

export const THAI_MONTHS: Record<string, string> = {
  January: "มกราคม",
  February: "กุมภาพันธ์",
  March: "มีนาคม",
  April: "เมษายน",
  May: "พฤษภาคม",
  June: "มิถุนายน",
  July: "กรกฎาคม",
  August: "สิงหาคม",
  September: "กันยายน",
  October: "ตุลาคม",
  November: "พฤศจิกายน",
  December: "ธันวาคม",
};

export const THAI_DAYS: Record<string, string> = {
  Sun: "อา.",
  Mon: "จ.",
  Tue: "อ.",
  Wed: "พ.",
  Thu: "พฤ.",
  Fri: "ศ.",
  Sat: "ส.",
};

export const THAI_DAYS_FULL: Record<string, string> = {
  Sunday: "วันอาทิตย์",
  Monday: "วันจันทร์",
  Tuesday: "วันอังคาร",
  Wednesday: "วันพุธ",
  Thursday: "วันพฤหัสบดี",
  Friday: "วันศุกร์",
  Saturday: "วันเสาร์",
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Date Helpers ---

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatDateString(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

/** Maximum events shown as full bars before collapsing */
export const MAX_VISIBLE_EVENTS = 3;

// --- Calendar Grid Generation ---

/**
 * Returns an array of 42 date strings (6 weeks x 7 days) for the calendar grid,
 * including leading days from the previous month and trailing days from the next month.
 */
export function getCalendarDays(year: number, month: number): string[] {
  const days: string[] = [];
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const daysInCurrentMonth = getDaysInMonth(year, month);

  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(
      formatDateString(prevYear, prevMonth, daysInPrevMonth - i),
    );
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    days.push(formatDateString(year, month, d));
  }

  // Next month padding (fill to 42)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let nextDay = 1;
  while (days.length < 42) {
    days.push(formatDateString(nextYear, nextMonth, nextDay));
    nextDay++;
  }

  return days;
}

/**
 * Checks if a task overlaps with a given date.
 */
export function taskOverlapsDate(task: Task, dateStr: string): boolean {
  const start = task.dueDate.start;
  const end = task.dueDate.end ?? task.dueDate.start;
  return dateStr >= start && dateStr <= end;
}

/**
 * Returns all tasks that overlap with a given date.
 */
export function getTasksForDay(dateStr: string, tasks: Task[]): Task[] {
  return tasks.filter((task) => taskOverlapsDate(task, dateStr));
}

/**
 * Assigns vertical lane positions to events within a single week row.
 * Multi-day events maintain the same lane across all days they span within the week.
 *
 * Returns a Map from date string to an array of CalendarEventLayout objects.
 */
export function assignEventLanes(
  weekDays: string[],
  tasks: Task[],
  categories: Category[],
): Map<string, CalendarEventLayout[]> {
  const result = new Map<string, CalendarEventLayout[]>();

  // Initialize empty arrays for each day
  for (const day of weekDays) {
    result.set(day, []);
  }

  // Collect all unique tasks that appear in this week
  const weekTaskIds = new Set<string>();
  const weekTasks: Task[] = [];

  for (const day of weekDays) {
    for (const task of tasks) {
      if (taskOverlapsDate(task, day) && !weekTaskIds.has(task.id)) {
        weekTaskIds.add(task.id);
        weekTasks.push(task);
      }
    }
  }

  // Sort: by start date, then by span length (longer first)
  weekTasks.sort((a, b) => {
    if (a.dueDate.start !== b.dueDate.start) {
      return a.dueDate.start < b.dueDate.start ? -1 : 1;
    }
    const spanA =
      parseDate(a.dueDate.end ?? a.dueDate.start).getTime() -
      parseDate(a.dueDate.start).getTime();
    const spanB =
      parseDate(b.dueDate.end ?? b.dueDate.start).getTime() -
      parseDate(b.dueDate.start).getTime();
    return spanB - spanA; // Longer spans first
  });

  // Track which lanes are occupied on each day
  // lanes[dayIndex][lane] = taskId or null
  const lanes: (string | null)[][] = weekDays.map(() => []);

  // Assign lanes greedily
  for (const task of weekTasks) {
    const start = task.dueDate.start;
    const end = task.dueDate.end ?? task.dueDate.start;

    // Find which days in this week this task spans
    const taskDayIndices: number[] = [];
    for (let i = 0; i < weekDays.length; i++) {
      if (weekDays[i] >= start && weekDays[i] <= end) {
        taskDayIndices.push(i);
      }
    }

    if (taskDayIndices.length === 0) continue;

    // Find the lowest lane available across all spanned days
    let lane = 0;
    let found = false;
    while (!found) {
      let laneAvailable = true;
      for (const dayIdx of taskDayIndices) {
        if (lanes[dayIdx][lane] !== undefined && lanes[dayIdx][lane] !== null) {
          laneAvailable = false;
          break;
        }
      }
      if (laneAvailable) {
        found = true;
      } else {
        lane++;
      }
    }

    // Occupy the lane
    for (const dayIdx of taskDayIndices) {
      // Extend lanes array if needed
      while (lanes[dayIdx].length <= lane) {
        lanes[dayIdx].push(null);
      }
      lanes[dayIdx][lane] = task.id;
    }

    // Create layout entries for each day
    const category = categories.find((c) => c.id === task.categoryId);
    const isMultiDay = task.dueDate.end !== null && task.dueDate.end !== task.dueDate.start;

    for (const dayIdx of taskDayIndices) {
      const dayStr = weekDays[dayIdx];
      const isStart = dayStr === start || dayIdx === 0; // Also treat week boundary as visual start
      const isEnd = dayStr === end || dayIdx === 6; // Also treat week boundary as visual end

      const layout: CalendarEventLayout = {
        task,
        category,
        spanStart: isMultiDay ? isStart : true,
        spanEnd: isMultiDay ? isEnd : true,
        spanMiddle: isMultiDay ? !isStart && !isEnd : false,
        row: lane,
      };

      result.get(dayStr)!.push(layout);
    }
  }

  // Sort each day's events by row
  for (const day of weekDays) {
    result.get(day)!.sort((a, b) => a.row - b.row);
  }

  return result;
}

/**
 * Builds the complete calendar grid for a given month.
 * Returns 6 rows of 7 CalendarDay objects.
 */
export function buildCalendarGrid(
  year: number,
  month: number,
  tasks: Task[],
  categories: Category[],
): CalendarDay[][] {
  const allDays = getCalendarDays(year, month);
  const today = new Date();
  const todayStr = formatDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const grid: CalendarDay[][] = [];

  // Process in 7-day chunks (weeks)
  for (let weekStart = 0; weekStart < allDays.length; weekStart += 7) {
    const weekDays = allDays.slice(weekStart, weekStart + 7);
    const eventLanes = assignEventLanes(weekDays, tasks, categories);

    const weekRow: CalendarDay[] = weekDays.map((dateStr) => {
      const date = parseDate(dateStr);
      const dayMonth = date.getMonth();
      const dayYear = date.getFullYear();

      return {
        date: dateStr,
        dayOfMonth: date.getDate(),
        isCurrentMonth: dayMonth === month && dayYear === year,
        isToday: dateStr === todayStr,
        events: eventLanes.get(dateStr) ?? [],
      };
    });

    grid.push(weekRow);
  }

  return grid;
}

"use client";

import { buildCalendarGrid } from "@/app/lib/calendarUtils";
import { CalendarDay } from "@/app/types/calendar";
import { Category, Task } from "@/app/types/task";
import { useMemo } from "react";

export function useCalendarGrid(
  year: number,
  month: number,
  tasks: Task[],
  categories: Category[],
): CalendarDay[][] {
  return useMemo(
    () => buildCalendarGrid(year, month, tasks, categories),
    [year, month, tasks, categories],
  );
}

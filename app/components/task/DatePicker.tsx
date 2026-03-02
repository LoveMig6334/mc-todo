"use client";

import { cn } from "@/app/lib/utils";
import { DateRange } from "@/app/types/task";
import { useCallback, useMemo, useRef, useState } from "react";

interface DatePickerProps {
  label?: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  projectBounds?: { start: string; end: string; color: string };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
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

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

export default function DatePicker({
  label,
  value,
  onChange,
  projectBounds,
}: DatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    value.start ? parseDate(value.start).getMonth() : today.getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    value.start ? parseDate(value.start).getFullYear() : today.getFullYear(),
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInRange = useCallback(
    (dateStr: string): boolean => {
      if (!value.start) return false;

      const date = parseDate(dateStr);
      const start = parseDate(value.start);

      if (!value.end) {
        return dateStr === value.start;
      }

      const end = parseDate(value.end);
      return date >= start && date <= end;
    },
    [value],
  );

  const isDateInDragRange = useCallback(
    (dateStr: string): boolean => {
      if (!isDragging || !dragStart || !hoverDate) return false;

      const date = parseDate(dateStr);
      const start = parseDate(dragStart);
      const end = parseDate(hoverDate);

      const minDate = start < end ? start : end;
      const maxDate = start < end ? end : start;

      return date >= minDate && date <= maxDate;
    },
    [isDragging, dragStart, hoverDate],
  );

  const handleMouseDown = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);

    // Start potential drag with a small delay to distinguish from click
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      setDragStart(dateStr);
    }, 150);
  };

  const handleMouseUp = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }

    if (isDragging && dragStart) {
      // Complete drag selection
      const start = parseDate(dragStart);
      const end = parseDate(dateStr);

      if (start <= end) {
        onChange({
          start: dragStart,
          end: dateStr === dragStart ? null : dateStr,
        });
      } else {
        onChange({
          start: dateStr,
          end: dragStart === dateStr ? null : dragStart,
        });
      }
    } else {
      // Single click
      onChange({ start: dateStr, end: null });
    }

    setIsDragging(false);
    setDragStart(null);
    setHoverDate(null);
  };

  const handleMouseEnter = (day: number) => {
    if (isDragging) {
      const dateStr = formatDateString(currentYear, currentMonth, day);
      setHoverDate(dateStr);
    }
  };

  const handleMouseLeave = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
  };

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isStartDate = (day: number): boolean => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    return value.start === dateStr;
  };

  const isEndDate = (day: number): boolean => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    return value.end === dateStr;
  };

  const isInProjectBounds = (dateStr: string): boolean => {
    if (!projectBounds) return false;
    return dateStr >= projectBounds.start && dateStr <= projectBounds.end;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
        {/* Month/Year Navigation */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span className="text-sm font-medium text-white">
            {MONTHS[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-zinc-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-8" />;
            }

            const dateStr = formatDateString(currentYear, currentMonth, day);
            const inRange = isDateInRange(dateStr);
            const inDragRange = isDateInDragRange(dateStr);
            const showRange = isDragging ? inDragRange : inRange;
            const inProject = isInProjectBounds(dateStr);
            const outsideProject = projectBounds && !inProject;
            const selected = isStartDate(day) || isEndDate(day);

            // Project bounds background — only when not selected/ranged
            const projectStyle =
              inProject && !selected && !showRange
                ? { backgroundColor: hexToRgba(projectBounds!.color, 0.18) }
                : undefined;

            return (
              <button
                key={day}
                type="button"
                onMouseDown={() => handleMouseDown(day)}
                onMouseUp={() => handleMouseUp(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseLeave={handleMouseLeave}
                style={projectStyle}
                className={cn(
                  "h-8 rounded text-sm transition-colors select-none",
                  "hover:bg-zinc-600",
                  isToday(day) && !showRange && "ring-1 ring-orange-500",
                  showRange && "bg-orange-500/30",
                  selected && "bg-orange-500 text-white hover:bg-orange-600",
                  !showRange && !selected && !outsideProject && "text-zinc-300",
                  outsideProject && "text-zinc-600",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected range display */}
        {value.start && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <p className="text-xs text-zinc-400">
              {value.end && value.start !== value.end ? (
                <>
                  <span className="text-orange-500">Range:</span>{" "}
                  {new Date(value.start + "T00:00:00").toLocaleDateString()} -{" "}
                  {new Date(value.end + "T00:00:00").toLocaleDateString()}
                </>
              ) : (
                <>
                  <span className="text-orange-500">Date:</span>{" "}
                  {new Date(value.start + "T00:00:00").toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        )}

        {/* Instructions */}
        <p className="mt-2 text-xs text-zinc-500">
          Click for single date. Drag to select a range.
        </p>

        {/* Project bounds legend */}
        {projectBounds && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: hexToRgba(projectBounds.color, 0.6) }}
            />
            Project:{" "}
            {new Date(projectBounds.start + "T00:00:00").toLocaleDateString()} –{" "}
            {new Date(projectBounds.end + "T00:00:00").toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

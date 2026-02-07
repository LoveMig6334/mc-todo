"use client";

import { ResizeEdge, ResizeState } from "@/app/types/calendar";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseEventResizeOptions {
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
  getTaskById: (id: string) => Task | undefined;
}

interface PendingUpdate {
  taskId: string;
  dueDate: { start: string; end: string | null };
}

/**
 * Computes the new due date after resizing a task edge
 */
export function computeNewDueDate(
  task: Task,
  state: ResizeState,
): { start: string; end: string | null } {
  const newDueDate = { ...task.dueDate };

  if (state.edge === "start") {
    newDueDate.start = state.currentDateStr;
    // Ensure start <= end
    if (newDueDate.end && newDueDate.start > newDueDate.end) {
      newDueDate.end = newDueDate.start;
    }
    // If start === end, make it single-day
    if (newDueDate.end === newDueDate.start) {
      newDueDate.end = null;
    }
  } else {
    newDueDate.end = state.currentDateStr;
    // Ensure end >= start
    if (newDueDate.end < newDueDate.start) {
      const temp = newDueDate.start;
      newDueDate.start = newDueDate.end;
      newDueDate.end = temp;
    }
    // If end === start, make it single-day
    if (newDueDate.end === newDueDate.start) {
      newDueDate.end = null;
    }
  }

  return newDueDate;
}

/**
 * Computes the array of date strings for resize preview rendering
 */
export function computeResizePreviewDates(
  task: Task,
  resizeState: ResizeState,
): string[] {
  const newDueDate = computeNewDueDate(task, resizeState);
  const dates: string[] = [];

  const startDate = new Date(newDueDate.start);
  const endDate = newDueDate.end ? new Date(newDueDate.end) : startDate;

  // Iterate from start to end date
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function useEventResize({
  updateTask,
  getTaskById,
}: UseEventResizeOptions) {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const isResizing = resizeState !== null;

  // Queue updates to avoid calling updateTask inside setState updater
  const pendingUpdateRef = useRef<PendingUpdate | null>(null);

  const startResize = useCallback(
    (taskId: string, edge: ResizeEdge, dateStr: string) => {
      setResizeState({
        taskId,
        edge,
        originalDateStr: dateStr,
        currentDateStr: dateStr,
      });
    },
    [],
  );

  const updateResize = useCallback((hoveredDateStr: string) => {
    setResizeState((prev) =>
      prev ? { ...prev, currentDateStr: hoveredDateStr } : null,
    );
  }, []);

  const endResize = useCallback(() => {
    // Capture the current state and queue the update, but don't call updateTask here
    setResizeState((prev) => {
      if (!prev) return null;

      const task = getTaskById(prev.taskId);
      if (task && prev.currentDateStr !== prev.originalDateStr) {
        const newDueDate = computeNewDueDate(task, prev);
        // Queue the update to be applied in useEffect (after render)
        pendingUpdateRef.current = { taskId: prev.taskId, dueDate: newDueDate };
      }

      return null;
    });
  }, [getTaskById]);

  // Apply pending updates after render to avoid setState-during-render
  useEffect(() => {
    if (pendingUpdateRef.current) {
      const { taskId, dueDate } = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      updateTask(taskId, { dueDate });
    }
  });

  // Global mouseup listener to handle drops outside the calendar
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseUp = () => {
      endResize();
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, endResize]);

  return {
    resizeState,
    isResizing,
    startResize,
    updateResize,
    endResize,
  };
}

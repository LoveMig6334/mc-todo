"use client";

import { DragState } from "@/app/types/calendar";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseEventDragOptions {
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
  getTaskById: (id: string) => Task | undefined;
}

interface PendingUpdate {
  taskId: string;
  dueDate: { start: string; end: string | null };
}

/**
 * Calculates the number of days between two date strings
 */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Adds days to a date string and returns a new date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Computes the new due date after dragging by offsetDays
 */
function computeNewDueDate(
  task: Task,
  offsetDays: number,
): { start: string; end: string | null } {
  const newStart = addDays(task.dueDate.start, offsetDays);
  const newEnd = task.dueDate.end
    ? addDays(task.dueDate.end, offsetDays)
    : null;
  return { start: newStart, end: newEnd };
}

export function useEventDrag({ updateTask, getTaskById }: UseEventDragOptions) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const isDragging = dragState !== null;

  // Queue updates to avoid calling updateTask inside setState updater
  const pendingUpdateRef = useRef<PendingUpdate | null>(null);

  const startDrag = useCallback((taskId: string, dateStr: string) => {
    setDragState({
      taskId,
      originalDate: dateStr,
      currentDate: dateStr,
      offsetDays: 0,
    });
  }, []);

  const updateDrag = useCallback((hoveredDateStr: string) => {
    setDragState((prev) => {
      if (!prev) return null;
      const offsetDays = daysBetween(prev.originalDate, hoveredDateStr);
      return {
        ...prev,
        currentDate: hoveredDateStr,
        offsetDays,
      };
    });
  }, []);

  const endDrag = useCallback(() => {
    // Capture the current state and queue the update, but don't call updateTask here
    setDragState((prev) => {
      if (!prev) return null;

      const task = getTaskById(prev.taskId);
      if (task && prev.offsetDays !== 0) {
        const newDueDate = computeNewDueDate(task, prev.offsetDays);
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
    if (!isDragging) return;

    const handleMouseUp = () => {
      endDrag();
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, endDrag]);

  return {
    dragState,
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
  };
}

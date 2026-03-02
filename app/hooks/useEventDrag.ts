"use client";

import { DragState } from "@/app/types/calendar";
import { Project, Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseEventDragOptions {
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getProjectById?: (id: string) => Project | undefined;
}

interface PendingUpdate {
  type: "move" | "delete";
  taskId: string;
  dueDate?: { start: string; end: string | null };
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

/**
 * Computes the array of date strings for preview rendering
 */
export function computePreviewDates(task: Task, offsetDays: number): string[] {
  const newDueDate = computeNewDueDate(task, offsetDays);
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

export function useEventDrag({
  updateTask,
  deleteTask,
  getTaskById,
  getProjectById,
}: UseEventDragOptions) {
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
      isOverTrash: false,
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
        isOverTrash: false,
      };
    });
  }, []);

  const setOverTrash = useCallback((isOver: boolean) => {
    setDragState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isOverTrash: isOver,
      };
    });
  }, []);

  const endDrag = useCallback(() => {
    // Capture the current state and queue the update, but don't call updateTask here
    setDragState((prev) => {
      if (!prev) return null;

      // If dropped on trash, queue delete
      if (prev.isOverTrash) {
        pendingUpdateRef.current = { type: "delete", taskId: prev.taskId };
        return null;
      }

      // Otherwise, move if offset changed
      const task = getTaskById(prev.taskId);
      if (task && prev.offsetDays !== 0) {
        const newDueDate = computeNewDueDate(task, prev.offsetDays);

        // Block moves that go outside the task's project bounds
        if (task.projectId && getProjectById) {
          const project = getProjectById(task.projectId);
          if (project) {
            const pStart = project.dueDate.start;
            const pEnd = project.dueDate.end ?? project.dueDate.start;
            const taskEnd = newDueDate.end ?? newDueDate.start;
            if (newDueDate.start < pStart || taskEnd > pEnd) {
              return null; // Reject the move — task snaps back
            }
          }
        }

        pendingUpdateRef.current = {
          type: "move",
          taskId: prev.taskId,
          dueDate: newDueDate,
        };
      }

      return null;
    });
  }, [getTaskById, getProjectById]);

  // Apply pending updates after render to avoid setState-during-render
  useEffect(() => {
    if (pendingUpdateRef.current) {
      const pending = pendingUpdateRef.current;
      pendingUpdateRef.current = null;

      if (pending.type === "delete") {
        deleteTask(pending.taskId);
      } else if (pending.dueDate) {
        updateTask(pending.taskId, { dueDate: pending.dueDate });
      }
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
    setOverTrash,
    endDrag,
  };
}

"use client";

import { ResizeEdge, ResizeState } from "@/app/types/calendar";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseEventResizeOptions {
  updateTask: (id: string, updates: Partial<TaskFormData>) => void;
  getTaskById: (id: string) => Task | undefined;
}

export function useEventResize({
  updateTask,
  getTaskById,
}: UseEventResizeOptions) {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const isResizing = resizeState !== null;
  const resizeStateRef = useRef<ResizeState | null>(null);

  // Keep ref in sync for use in global mouseup
  resizeStateRef.current = resizeState;

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

  const updateResize = useCallback(
    (hoveredDateStr: string) => {
      if (!resizeState) return;
      setResizeState((prev) =>
        prev ? { ...prev, currentDateStr: hoveredDateStr } : null,
      );
    },
    [resizeState],
  );

  const endResize = useCallback(() => {
    const state = resizeStateRef.current;
    if (!state) return;

    const task = getTaskById(state.taskId);
    if (!task) {
      setResizeState(null);
      return;
    }

    // Only update if the date actually changed
    if (state.currentDateStr !== state.originalDateStr) {
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
          // Swap: the user dragged end before start
          const temp = newDueDate.start;
          newDueDate.start = newDueDate.end;
          newDueDate.end = temp;
        }
        // If end === start, make it single-day
        if (newDueDate.end === newDueDate.start) {
          newDueDate.end = null;
        }
      }

      updateTask(state.taskId, { dueDate: newDueDate });
    }

    setResizeState(null);
  }, [getTaskById, updateTask]);

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

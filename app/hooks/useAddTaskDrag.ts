"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AddTaskDragState {
  isDragging: boolean;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
}

export function useAddTaskDrag(
  onComplete: (range: { start: string; end: string }) => void,
) {
  const [dragState, setDragState] = useState<AddTaskDragState>({
    isDragging: false,
    startDate: null,
    endDate: null,
  });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const handleMouseDown = useCallback((date: string) => {
    setDragState({
      isDragging: true,
      startDate: date,
      endDate: date,
    });
  }, []);

  const handleMouseEnter = useCallback((date: string) => {
    setDragState((prev) => {
      if (!prev.isDragging) return prev;
      return { ...prev, endDate: date };
    });
  }, []);

  // Global mouseup + prevent text selection — only active while dragging
  useEffect(() => {
    if (!dragState.isDragging) return;

    const preventSelect = (e: Event) => e.preventDefault();

    const handleGlobalMouseUp = () => {
      const { startDate, endDate } = dragState;
      if (startDate && endDate) {
        const start = startDate <= endDate ? startDate : endDate;
        const end = startDate <= endDate ? endDate : startDate;
        onCompleteRef.current({ start, end });
      }
      setDragState({ isDragging: false, startDate: null, endDate: null });
    };

    document.addEventListener("selectstart", preventSelect);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("selectstart", preventSelect);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [dragState]);

  return {
    dragState,
    handleMouseDown,
    handleMouseEnter,
  };
}

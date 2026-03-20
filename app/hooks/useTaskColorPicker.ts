"use client";

import { useCallback, useState } from "react";

interface ColorPickerState {
  openTaskId: string | null;
  anchorPosition: { x: number; y: number } | null;
}

export function useTaskColorPicker() {
  const [pickerState, setPickerState] = useState<ColorPickerState>({
    openTaskId: null,
    anchorPosition: null,
  });

  const openPicker = useCallback(
    (taskId: string, position: { x: number; y: number }) => {
      setPickerState({ openTaskId: taskId, anchorPosition: position });
    },
    [],
  );

  const closePicker = useCallback(() => {
    setPickerState({ openTaskId: null, anchorPosition: null });
  }, []);

  return { pickerState, openPicker, closePicker };
}

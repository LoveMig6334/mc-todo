"use client";

import { Task } from "@/app/types/task";
import { useCallback, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface CalendarColorPickerPopoverProps {
  openTaskId: string | null;
  anchorPosition: { x: number; y: number } | null;
  tasks: Task[];
  onClose: () => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
}

const POPOVER_WIDTH = 220;
const POPOVER_HEIGHT = 260;
const MARGIN = 16;

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function ColorPickerInner({
  task,
  openTaskId,
  updateTask,
}: {
  task: Task | undefined;
  openTaskId: string;
  updateTask: (taskId: string, data: Partial<Task>) => void;
}) {
  const currentColor = task?.calendarColor ?? "#3f3f46";
  const [hexInput, setHexInput] = useState(currentColor);
  const lastValidHex = useRef(currentColor);

  const handleColorChange = useCallback(
    (hex: string) => {
      setHexInput(hex);
      lastValidHex.current = hex;
      updateTask(openTaskId, { calendarColor: hex });
    },
    [openTaskId, updateTask],
  );

  const handleHexInputBlur = useCallback(() => {
    if (HEX_REGEX.test(hexInput)) {
      lastValidHex.current = hexInput;
      updateTask(openTaskId, { calendarColor: hexInput });
    } else {
      setHexInput(lastValidHex.current);
    }
  }, [hexInput, openTaskId, updateTask]);

  return (
    <>
      <HexColorPicker
        color={currentColor}
        onChange={handleColorChange}
        style={{ width: "100%" }}
      />
      <input
        type="text"
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
        onBlur={handleHexInputBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleHexInputBlur();
        }}
        className="mt-2 w-full rounded-md border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500"
        spellCheck={false}
      />
    </>
  );
}

export default function CalendarColorPickerPopover({
  openTaskId,
  anchorPosition,
  tasks,
  onClose,
  updateTask,
}: CalendarColorPickerPopoverProps) {
  const task = useMemo(
    () => (openTaskId ? tasks.find((t) => t.id === openTaskId) : undefined),
    [openTaskId, tasks],
  );

  if (!openTaskId || !anchorPosition) return null;

  // Compute position with viewport bounds
  const anchorX = anchorPosition.x;
  const anchorY = anchorPosition.y;

  let left = anchorX;
  let top = anchorY + 8;

  if (anchorX + POPOVER_WIDTH > window.innerWidth - MARGIN) {
    left = anchorX - POPOVER_WIDTH;
  }
  if (anchorY + 8 + POPOVER_HEIGHT > window.innerHeight - MARGIN) {
    top = anchorY - POPOVER_HEIGHT;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 99 }}
        onClick={onClose}
      />

      {/* Popover panel */}
      <div
        style={{
          position: "fixed",
          left,
          top,
          width: POPOVER_WIDTH,
          zIndex: 100,
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-800 p-3"
      >
        {/* key resets state when switching tasks */}
        <ColorPickerInner
          key={openTaskId}
          task={task}
          openTaskId={openTaskId}
          updateTask={updateTask}
        />
      </div>
    </>
  );
}

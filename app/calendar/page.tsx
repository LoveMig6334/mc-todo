"use client";

import CalendarColorPickerPopover from "@/app/components/calendar/CalendarColorPickerPopover";
import { formatDateString } from "@/app/lib/calendarUtils";
import CalendarGrid from "@/app/components/calendar/CalendarGrid";
import CalendarHeader from "@/app/components/calendar/CalendarHeader";
import { CalendarTool } from "@/app/components/calendar/CalendarToolbar";
import TrashDropZone from "@/app/components/calendar/TrashDropZone";
import TaskModal from "@/app/components/task/TaskModal";
import { useAddTaskDrag } from "@/app/hooks/useAddTaskDrag";
import { useCalendarGrid } from "@/app/hooks/useCalendarGrid";
import { useCategories } from "@/app/hooks/useCategories";
import { computePreviewDates, useEventDrag } from "@/app/hooks/useEventDrag";
import {
  computeResizePreviewDates,
  useEventResize,
} from "@/app/hooks/useEventResize";
import { useProjects } from "@/app/hooks/useProjects";
import { useTaskColorPicker } from "@/app/hooks/useTaskColorPicker";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CalendarPage() {
  const { tasks, addTask, updateTask, deleteTask, getTaskById } =
    useTaskManager();
  const { categories, addCategory } = useCategories();
  const { projects, getProjectById } = useProjects();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefilledDateRange, setPrefilledDateRange] = useState<
    { start: string; end: string } | undefined
  >();
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CalendarTool>("normal");

  const grid = useCalendarGrid(currentYear, currentMonth, tasks, categories);

  // --- Hooks ---
  const { resizeState, startResize, updateResize } = useEventResize({
    updateTask,
    getTaskById,
    getProjectById,
  });

  const { dragState, startDrag, updateDrag, setOverTrash } = useEventDrag({
    updateTask,
    deleteTask,
    getTaskById,
    getProjectById,
  });

  const addTaskDrag = useAddTaskDrag((range) => {
    setPrefilledDateRange(range);
    setIsModalOpen(true);
  });

  const { pickerState, openPicker, closePicker } = useTaskColorPicker();

  // --- Copy & Paste Tool ---
  const [copiedTask, setCopiedTask] = useState<Task | null>(null);
  const [copyMousePos, setCopyMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleCopySelect = useCallback(
    (task: Task) => {
      setCopiedTask(task);
    },
    [],
  );

  const handleCopyPaste = useCallback(
    (date: string) => {
      if (!copiedTask) return;
      const duration =
        copiedTask.dueDate.end && copiedTask.dueDate.start !== copiedTask.dueDate.end
          ? Math.round(
              (new Date(copiedTask.dueDate.end + "T00:00:00").getTime() -
                new Date(copiedTask.dueDate.start + "T00:00:00").getTime()) /
                86400000,
            )
          : 0;
      let endDate: string | null = null;
      if (duration > 0) {
        const end = new Date(date + "T00:00:00");
        end.setDate(end.getDate() + duration);
        const y = end.getFullYear();
        const m = String(end.getMonth() + 1).padStart(2, "0");
        const d = String(end.getDate()).padStart(2, "0");
        endDate = `${y}-${m}-${d}`;
      }
      const { id: _id, createdAt: _c, updatedAt: _u, ...formData } = copiedTask;
      addTask({
        ...formData,
        dueDate: { start: date, end: endDate },
      });
      setCopiedTask(null);
      setCopyMousePos(null);
    },
    [copiedTask, addTask],
  );

  // Track mouse position for copy floating preview
  useEffect(() => {
    if (!copiedTask) return;
    const handleMouseMove = (e: MouseEvent) => {
      setCopyMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [copiedTask]);

  // Clear copy state when switching away from copy tool
  useEffect(() => {
    if (activeTool !== "copy") {
      setCopiedTask(null);
      setCopyMousePos(null);
    }
  }, [activeTool]);

  const copiedCategory = copiedTask
    ? categories.find((c) => c.id === copiedTask.categoryId)
    : undefined;

  // Ensure resize and drag are mutually exclusive
  const isResizing = resizeState !== null;
  const isDragging = dragState !== null;

  // Compute preview data for drag operation
  const draggedTask = dragState ? getTaskById(dragState.taskId) : undefined;
  const draggedCategory = draggedTask
    ? categories.find((c) => c.id === draggedTask.categoryId)
    : undefined;

  const dragPreviewDates = useMemo(() => {
    if (!draggedTask || !dragState) {
      return undefined;
    }
    return computePreviewDates(draggedTask, dragState.offsetDays);
  }, [draggedTask, dragState]);

  // Compute preview data for resize operation
  const resizedTask = resizeState ? getTaskById(resizeState.taskId) : undefined;
  const resizedCategory = resizedTask
    ? categories.find((c) => c.id === resizedTask.categoryId)
    : undefined;

  const resizePreviewDates = useMemo(() => {
    if (!resizedTask || !resizeState) return undefined;
    return computeResizePreviewDates(resizedTask, resizeState);
  }, [resizedTask, resizeState]);

  // Unified preview data: resize takes priority when active
  const previewDates = resizePreviewDates ?? dragPreviewDates;
  const previewTask = resizedTask ?? draggedTask;
  const previewCategory = resizedCategory ?? draggedCategory;

  // Add Task tool: compute preview dates set
  const addTaskPreviewDates = useMemo(() => {
    const {
      isDragging: isAddDragging,
      startDate,
      endDate,
    } = addTaskDrag.dragState;
    if (!isAddDragging || !startDate || !endDate) return new Set<string>();
    const s = startDate <= endDate ? startDate : endDate;
    const e = startDate <= endDate ? endDate : startDate;
    const dates = new Set<string>();
    const current = new Date(s + "T00:00:00");
    const endD = new Date(e + "T00:00:00");
    while (current <= endD) {
      dates.add(
        formatDateString(
          current.getFullYear(),
          current.getMonth(),
          current.getDate(),
        ),
      );
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [addTaskDrag.dragState]);

  // --- Month Navigation ---
  const goToPrevMonth = () => {
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

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // --- Modal Handlers ---
  const handleClickEvent = (task: Task) => {
    setEditingTask(task);
    setPrefilledDateRange(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setPrefilledDateRange(undefined);
  };

  const handleSubmitTask = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  // --- Drag Handlers (only if not resizing) ---
  const handleDragStart = (taskId: string, dateStr: string) => {
    if (isResizing) return;
    startDrag(taskId, dateStr);
  };

  const handleDragHover = (dateStr: string) => {
    if (isResizing) return;
    updateDrag(dateStr);
  };

  // --- Resize Handlers (only if not dragging) ---
  const handleResizeStart = (
    taskId: string,
    edge: "start" | "end",
    dateStr: string,
  ) => {
    if (isDragging) return;
    startResize(taskId, edge, dateStr);
  };

  const handleResizeHover = (dateStr: string) => {
    if (isDragging) return;
    updateResize(dateStr);
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="mx-auto max-w-[80%] px-4 pb-8 pt-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-zinc-400">
            View and manage your tasks on the calendar. Use the toolbar to
            switch tools.
          </p>
        </div>

        {/* Calendar Navigation */}
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          grid={grid}
          activeTool={activeTool}
          onClickEvent={handleClickEvent}
          expandedDayKey={expandedDayKey}
          onExpandDay={setExpandedDayKey}
          onResizeStart={activeTool === "trim" ? handleResizeStart : undefined}
          onResizeHover={activeTool === "trim" ? handleResizeHover : undefined}
          resizeState={resizeState}
          onDragStart={activeTool === "trim" ? handleDragStart : undefined}
          onDragHover={activeTool === "trim" ? handleDragHover : undefined}
          dragState={dragState}
          previewDates={previewDates}
          draggedTask={previewTask}
          draggedCategory={previewCategory}
          projects={projects}
          onOpenColorPicker={activeTool === "color" ? openPicker : undefined}
          onAddTaskMouseDown={
            activeTool === "add" ? addTaskDrag.handleMouseDown : undefined
          }
          onAddTaskMouseEnter={
            activeTool === "add" ? addTaskDrag.handleMouseEnter : undefined
          }
          addTaskPreviewDates={
            activeTool === "add" ? addTaskPreviewDates : undefined
          }
          copiedTaskId={activeTool === "copy" ? copiedTask?.id : undefined}
          onCopySelect={activeTool === "copy" ? handleCopySelect : undefined}
          onCopyPaste={
            activeTool === "copy" && copiedTask ? handleCopyPaste : undefined
          }
        />
      </main>

      {/* Copy & Paste floating preview */}
      {copiedTask && copyMousePos && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: copyMousePos.x + 12,
            top: copyMousePos.y - 12,
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 4,
              overflow: "hidden",
              height: 24,
              width: 160,
              opacity: 0.85,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                width: 8,
                background: copiedCategory?.color ?? "#71717a",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                background: copiedTask.calendarColor ?? "#3f3f46",
                display: "flex",
                alignItems: "center",
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  color: "#e4e4e7",
                  fontSize: 11,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {copiedTask.title}
              </span>
            </div>
            <div
              style={{
                width: 8,
                background: copiedCategory?.color ?? "#71717a",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      )}

      {/* Trash Drop Zone - appears during drag */}
      <TrashDropZone
        isVisible={isDragging}
        isActive={dragState?.isOverTrash ?? false}
        onHoverStart={() => setOverTrash(true)}
        onHoverEnd={() => setOverTrash(false)}
      />

      {/* Color Picker Popover */}
      <CalendarColorPickerPopover
        openTaskId={pickerState.openTaskId}
        anchorPosition={pickerState.anchorPosition}
        tasks={tasks}
        onClose={closePicker}
        updateTask={updateTask}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
        categories={categories}
        onAddCategory={addCategory}
        editingTask={editingTask}
        prefilledStart={prefilledDateRange?.start}
        prefilledEnd={prefilledDateRange?.end}
        projects={projects}
      />
    </div>
  );
}

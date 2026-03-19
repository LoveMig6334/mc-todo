"use client";

import CalendarGrid from "@/app/components/calendar/CalendarGrid";
import CalendarHeader from "@/app/components/calendar/CalendarHeader";
import TrashDropZone from "@/app/components/calendar/TrashDropZone";
import TaskModal from "@/app/components/task/TaskModal";
import { useCalendarGrid } from "@/app/hooks/useCalendarGrid";
import { useCategories } from "@/app/hooks/useCategories";
import { computePreviewDates, useEventDrag } from "@/app/hooks/useEventDrag";
import {
  computeResizePreviewDates,
  useEventResize,
} from "@/app/hooks/useEventResize";
import { useProjects } from "@/app/hooks/useProjects";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { Task, TaskFormData } from "@/app/types/task";
import { useMemo, useState } from "react";

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
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  const grid = useCalendarGrid(currentYear, currentMonth, tasks, categories);

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
  const handleDoubleClickDay = (date: string) => {
    setEditingTask(null);
    setPrefilledDate(date);
    setIsModalOpen(true);
  };

  const handleClickEvent = (task: Task) => {
    setEditingTask(task);
    setPrefilledDate(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setPrefilledDate(undefined);
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
            View and manage your tasks on the calendar. Double-click a day to
            create a new task. Drag events to move them.
          </p>
        </div>

        {/* Calendar Navigation */}
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          grid={grid}
          onDoubleClickDay={handleDoubleClickDay}
          onClickEvent={handleClickEvent}
          expandedDayKey={expandedDayKey}
          onExpandDay={setExpandedDayKey}
          onResizeStart={handleResizeStart}
          onResizeHover={handleResizeHover}
          resizeState={resizeState}
          onDragStart={handleDragStart}
          onDragHover={handleDragHover}
          dragState={dragState}
          previewDates={previewDates}
          draggedTask={previewTask}
          draggedCategory={previewCategory}
          projects={projects}
        />
      </main>

      {/* Trash Drop Zone - appears during drag */}
      <TrashDropZone
        isVisible={isDragging}
        isActive={dragState?.isOverTrash ?? false}
        onHoverStart={() => setOverTrash(true)}
        onHoverEnd={() => setOverTrash(false)}
      />

      {/* Task Modal (reused from Feature 1) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
        categories={categories}
        onAddCategory={addCategory}
        editingTask={editingTask}
        prefilledStart={prefilledDate}
        projects={projects}
      />
    </div>
  );
}

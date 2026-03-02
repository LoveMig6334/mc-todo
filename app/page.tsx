"use client";

import FloatingNav from "@/app/components/layout/FloatingNav";
import ArchivedTasksPanel from "@/app/components/task/ArchivedTasksPanel";
import CategoryBoardView from "@/app/components/task/CategoryBoardView";
import GreetingBanner from "@/app/components/task/GreetingBanner";
import PriorityListView from "@/app/components/task/PriorityListView";
import ProgressBar from "@/app/components/task/ProgressBar";
import TaskFilterBar from "@/app/components/task/TaskFilterBar";
import TaskModal from "@/app/components/task/TaskModal";
import TaskPageStats from "@/app/components/task/TaskPageStats";
import ViewControls from "@/app/components/task/ViewControls";
import Button from "@/app/components/ui/Button";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import ShortcutHint from "@/app/components/ui/ShortcutHint";
import { useAutoArchive } from "@/app/hooks/useAutoArchive";
import { useCategories } from "@/app/hooks/useCategories";
import { useKeyboardShortcuts } from "@/app/hooks/useKeyboardShortcuts";
import { useTaskFilter } from "@/app/hooks/useTaskFilter";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { useViewPreference } from "@/app/hooks/useViewPreference";
import { Task, TaskFormData } from "@/app/types/task";
import { useCallback, useState } from "react";

export default function Home() {
  const {
    tasks,
    archivedTasks,
    stats,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    archiveTask,
    archiveAllCompleted,
    restoreTask,
  } = useTaskManager();
  const { categories, addCategory } = useCategories();
  const { viewMode, setViewMode } = useViewPreference();

  // Auto-archive completed tasks after threshold
  const { archiveThreshold, setArchiveThreshold } = useAutoArchive(
    tasks,
    archiveTask,
  );

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredTasks,
    activeFilterCount,
    clearAllFilters,
  } = useTaskFilter(tasks, categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const handleOpenModal = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmitTask = (formData: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  const handleDeleteTask = useCallback((id: string) => {
    setDeletingTaskId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  }, [deletingTaskId, deleteTask]);

  const handleCancelDelete = useCallback(() => {
    setDeletingTaskId(null);
  }, []);

  const handleFocusSearch = useCallback(() => {
    const searchInput = document.getElementById("task-search-input");
    searchInput?.focus();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: handleOpenModal,
    onFocusSearch: handleFocusSearch,
  });

  return (
    <div className="min-h-screen bg-zinc-900">
      <FloatingNav currentPath="/" />

      <main
        className={`mx-auto px-4 pb-8 pt-24 ${viewMode === "board" ? "max-w-[80%]" : "max-w-[80%]"}`}
      >
        {/* Greeting Banner */}
        <div className="mb-6">
          <GreetingBanner />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <ProgressBar completed={stats.completed} total={stats.total} />
        </div>

        {/* Quick Stats */}
        <div className="mb-4">
          <TaskPageStats
            total={stats.total}
            pending={stats.pending}
            completed={stats.completed}
            overdue={stats.overdue}
          />
        </div>

        {/* Filter Bar + View Controls */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <TaskFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                activeFilterCount={activeFilterCount}
                onClearAll={clearAllFilters}
              />
            </div>
            <ViewControls viewMode={viewMode} onViewChange={setViewMode} />
          </div>
          {activeFilterCount > 0 && (
            <p className="text-xs text-zinc-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          )}
        </div>

        {/* Task Views */}
        {viewMode === "list" ? (
          <PriorityListView
            tasks={filteredTasks}
            categories={categories}
            onToggleComplete={toggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onUpdate={updateTask}
          />
        ) : (
          <CategoryBoardView
            tasks={filteredTasks}
            categories={categories}
            onToggleComplete={toggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onUpdate={updateTask}
          />
        )}

        {/* Archived Tasks Panel */}
        <ArchivedTasksPanel
          archivedTasks={archivedTasks}
          archiveThreshold={archiveThreshold}
          onThresholdChange={setArchiveThreshold}
          onRestore={restoreTask}
          onDelete={deleteTask}
          onArchiveAllCompleted={archiveAllCompleted}
          hasCompletedTasks={tasks.some((t) => t.completed)}
        />

        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleOpenModal}
            variant="primary"
            size="lg"
            className="rounded-full w-15 h-15 p-0 shadow-lg shadow-orange-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <ShortcutHint />

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
          categories={categories}
          onAddCategory={addCategory}
          editingTask={editingTask}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deletingTaskId !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
}

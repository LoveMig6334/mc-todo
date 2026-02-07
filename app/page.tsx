"use client";

import FloatingNav from "@/app/components/layout/FloatingNav";
import CategoryBoardView from "@/app/components/task/CategoryBoardView";
import PriorityListView from "@/app/components/task/PriorityListView";
import TaskModal from "@/app/components/task/TaskModal";
import ViewControls from "@/app/components/task/ViewControls";
import Button from "@/app/components/ui/Button";
import { useCategories } from "@/app/hooks/useCategories";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { useViewPreference } from "@/app/hooks/useViewPreference";
import { Task, TaskFormData } from "@/app/types/task";
import { useState } from "react";

export default function Home() {
  const { tasks, stats, addTask, updateTask, deleteTask, toggleComplete } =
    useTaskManager();
  const { categories, addCategory } = useCategories();
  const { viewMode, setViewMode } = useViewPreference();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

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

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <FloatingNav currentPath="/" />

      <main
        className={`mx-auto px-4 pb-8 pt-24 ${viewMode === "board" ? "max-w-[95%]" : "max-w-[95%]"}`}
      >
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {stats.total === 0
                ? "No tasks yet. Create your first task!"
                : `${stats.completed} of ${stats.total} tasks completed`}
              {stats.overdue > 0 && (
                <span className="text-red-500"> · {stats.overdue} overdue</span>
              )}
            </p>
          </div>
          <ViewControls viewMode={viewMode} onViewChange={setViewMode} />
        </div>

        {/* Task Views */}
        {viewMode === "list" ? (
          <PriorityListView
            tasks={tasks}
            categories={categories}
            onToggleComplete={toggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onUpdate={updateTask}
          />
        ) : (
          <CategoryBoardView
            tasks={tasks}
            categories={categories}
            onToggleComplete={toggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}

        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleOpenModal}
            variant="primary"
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg shadow-orange-500/20"
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

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
          categories={categories}
          onAddCategory={addCategory}
          editingTask={editingTask}
        />
      </main>
    </div>
  );
}

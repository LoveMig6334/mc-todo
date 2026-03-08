"use client";

import FloatingNav from "@/app/components/layout/FloatingNav";
import ArchivedTasksPanel from "@/app/components/task/ArchivedTasksPanel";
import CategoryBoardView from "@/app/components/task/CategoryBoardView";
import GreetingBanner from "@/app/components/task/GreetingBanner";
import PriorityListView from "@/app/components/task/PriorityListView";
import ProgressBar from "@/app/components/task/ProgressBar";
import ProjectModal from "@/app/components/task/ProjectModal";
import TaskFilterBar from "@/app/components/task/TaskFilterBar";
import TaskModal from "@/app/components/task/TaskModal";
import TaskPageStats from "@/app/components/task/TaskPageStats";
import ViewControls from "@/app/components/task/ViewControls";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import ShortcutHint from "@/app/components/ui/ShortcutHint";
import { useAutoArchive } from "@/app/hooks/useAutoArchive";
import { useCategories } from "@/app/hooks/useCategories";
import { useKeyboardShortcuts } from "@/app/hooks/useKeyboardShortcuts";
import { useProjects } from "@/app/hooks/useProjects";
import { useTaskFilter } from "@/app/hooks/useTaskFilter";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { useViewPreference } from "@/app/hooks/useViewPreference";
import { fadeInUp, springSnappy, staggerContainer } from "@/app/lib/animation";
import { Project, ProjectFormData, Task, TaskFormData } from "@/app/types/task";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

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
    unlinkProjectTasks,
  } = useTaskManager();
  const { categories, addCategory } = useCategories();
  const { viewMode, setViewMode } = useViewPreference();
  const { projects, addProject, updateProject, deleteProject } = useProjects();

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

  // Task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefilledProjectId, setPrefilledProjectId] = useState<
    string | undefined
  >(undefined);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );

  // Floating add menu
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!addMenuRef.current?.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addMenuOpen]);

  const handleOpenModal = useCallback(() => {
    setAddMenuOpen(false);
    setEditingTask(null);
    setPrefilledProjectId(undefined);
    setIsModalOpen(true);
  }, []);

  const handleOpenTaskForProject = useCallback((projectId: string) => {
    setEditingTask(null);
    setPrefilledProjectId(projectId);
    setIsModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setPrefilledProjectId(undefined);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
    setPrefilledProjectId(undefined);
  }, []);

  const handleSubmitTask = useCallback(
    (formData: TaskFormData) => {
      if (editingTask) {
        updateTask(editingTask.id, formData);
      } else {
        addTask(formData);
      }
    },
    [editingTask, updateTask, addTask],
  );

  const handleOpenProjectModal = useCallback(() => {
    setAddMenuOpen(false);
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  }, []);

  const handleSubmitProject = useCallback(
    (formData: ProjectFormData) => {
      if (editingProject) {
        updateProject(editingProject.id, formData);
      } else {
        addProject(formData);
      }
    },
    [editingProject, updateProject, addProject],
  );

  const handleDeleteTask = useCallback((id: string) => {
    setDeletingTaskId(id);
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setDeletingProjectId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setDeletingTaskId(null);
    } else if (deletingProjectId) {
      deleteProject(deletingProjectId);
      unlinkProjectTasks(deletingProjectId);
      setDeletingProjectId(null);
    }
  }, [
    deletingTaskId,
    deletingProjectId,
    deleteTask,
    deleteProject,
    unlinkProjectTasks,
  ]);

  const handleCancelDelete = useCallback(() => {
    setDeletingTaskId(null);
    setDeletingProjectId(null);
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
            projects={projects}
            onAddTask={handleOpenTaskForProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
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

        {/* Floating Add Button with Type Menu */}
        <div
          ref={addMenuRef}
          className="fixed bottom-6 right-6 flex flex-col items-end gap-2"
        >
          <AnimatePresence>
            {addMenuOpen && (
              <motion.div
                key="submenu"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-end gap-2 mb-1"
              >
                <motion.button
                  variants={fadeInUp}
                  onClick={handleOpenProjectModal}
                  className="flex items-center gap-2 rounded-full bg-zinc-800 border border-zinc-700 pl-3 pr-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 hover:border-zinc-600 transition-colors shadow-lg whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Project
                </motion.button>
                <motion.button
                  variants={fadeInUp}
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 rounded-full bg-zinc-800 border border-zinc-700 pl-3 pr-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 hover:border-zinc-600 transition-colors shadow-lg whitespace-nowrap"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
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
                  Task
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setAddMenuOpen((v) => !v)}
            animate={{ rotate: addMenuOpen ? 45 : 0 }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            className="w-15 h-15 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label="Open add menu"
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
          </motion.button>
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
          prefilledProjectId={prefilledProjectId}
          projects={projects}
        />

        {/* Project Modal */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onSubmit={handleSubmitProject}
          editingProject={editingProject}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deletingTaskId !== null || deletingProjectId !== null}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
}

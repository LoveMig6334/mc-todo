"use client";

import Button from "@/app/components/ui/Button";
import Dropdown from "@/app/components/ui/Dropdown";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";
import Slider from "@/app/components/ui/Slider";
import Textarea from "@/app/components/ui/Textarea";
import { formatDateRange } from "@/app/lib/utils";
import {
  Category,
  DateRange,
  Project,
  Subtask,
  Task,
  TaskFormData,
} from "@/app/types/task";
import { useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import ReferenceLinks from "./ReferenceLinks";
import SubtaskList from "./SubtaskList";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  categories: Category[];
  onAddCategory: (name: string) => Category;
  editingTask?: Task | null;
  prefilledDate?: string;
  prefilledProjectId?: string;
  projects?: Project[];
}

const getDefaultFormData = (
  prefilledDate?: string,
  prefilledProjectId?: string,
): TaskFormData => {
  const today = new Date().toISOString().split("T")[0];
  return {
    title: "",
    details: "",
    categoryId: "",
    priority: 5,
    status: "pending",
    dueDate: {
      start: prefilledDate || today,
      end: null,
    },
    subtasks: [],
    referenceLinks: [],
    completed: false,
    completedAt: null,
    archived: false,
    projectId: prefilledProjectId,
  };
};

function TaskModalContent({
  onClose,
  onSubmit,
  categories,
  onAddCategory,
  editingTask,
  prefilledDate,
  prefilledProjectId,
  projects,
}: Omit<TaskModalProps, "isOpen">) {
  const initialFormData = useMemo(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        details: editingTask.details,
        categoryId: editingTask.categoryId,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        subtasks: editingTask.subtasks ?? [],
        referenceLinks: editingTask.referenceLinks,
        completed: editingTask.completed,
        completedAt: editingTask.completedAt,
        archived: editingTask.archived,
        projectId: editingTask.projectId,
      };
    }
    return getDefaultFormData(prefilledDate, prefilledProjectId);
  }, [editingTask, prefilledDate, prefilledProjectId]);

  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter projects to only those whose timeframe contains the task's due date
  const availableProjects = useMemo(() => {
    if (!projects) return [];
    if (!formData.dueDate.start) return projects;
    const taskStart = formData.dueDate.start;
    const taskEnd = formData.dueDate.end ?? formData.dueDate.start;
    return projects.filter((p) => {
      const projStart = p.dueDate.start;
      const projEnd = p.dueDate.end ?? p.dueDate.start;
      return taskStart >= projStart && taskEnd <= projEnd;
    });
  }, [projects, formData.dueDate]);

  // Derive active project to pass bounds to DatePicker and validate dates
  const activeProject = useMemo(() => {
    if (!formData.projectId || !projects) return undefined;
    return projects.find((p) => p.id === formData.projectId);
  }, [formData.projectId, projects]);

  const projectBounds = activeProject
    ? {
        start: activeProject.dueDate.start,
        end: activeProject.dueDate.end ?? activeProject.dueDate.start,
        color: activeProject.color,
      }
    : undefined;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.categoryId) {
      newErrors.category = "Please select a category";
    }

    if (!formData.dueDate.start) {
      newErrors.dueDate = "Please select a due date";
    } else if (projectBounds) {
      const taskEnd = formData.dueDate.end ?? formData.dueDate.start;
      if (
        formData.dueDate.start < projectBounds.start ||
        taskEnd > projectBounds.end
      ) {
        newErrors.dueDate = `Due date must be within the project's time frame (${formatDateRange(projectBounds.start, projectBounds.end)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formData);
    onClose();
  };

  const updateFormData = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddCategory = (name: string) => {
    const newCategory = onAddCategory(name);
    updateFormData("categoryId", newCategory.id);
  };

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => updateFormData("title", e.target.value)}
        placeholder="Enter task title"
        error={errors.title}
      />

      {/* Details */}
      <Textarea
        label="Details"
        value={formData.details}
        onChange={(e) => updateFormData("details", e.target.value)}
        placeholder="Add more details about this task..."
        rows={3}
      />

      {/* Category & Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Dropdown
            label="Category"
            options={categoryOptions}
            value={formData.categoryId}
            onChange={(value) => updateFormData("categoryId", value)}
            onAddNew={handleAddCategory}
            placeholder="Select category"
            allowAdd
          />
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        <Dropdown
          label="Status"
          options={[
            { id: "pending", label: "Pending" },
            { id: "in_progress", label: "In Progress" },
            { id: "needs_approval", label: "Needs Approval" },
            { id: "paused", label: "Paused" },
          ]}
          value={formData.status}
          onChange={(value) =>
            updateFormData("status", value as TaskFormData["status"])
          }
          placeholder="Select status"
        />
      </div>

      {/* Project (optional) */}
      {availableProjects.length > 0 && (
        <Dropdown
          label="Project (optional)"
          options={[
            { id: "", label: "None" },
            ...availableProjects.map((p) => ({ id: p.id, label: p.title, color: p.color })),
          ]}
          value={formData.projectId ?? ""}
          onChange={(value) =>
            updateFormData("projectId", value || undefined)
          }
          placeholder="No project"
        />
      )}

      {/* Priority */}
      <Slider
        label="Priority"
        value={formData.priority}
        onChange={(value) => updateFormData("priority", value)}
        min={0}
        max={10}
      />

      {/* Due Date */}
      <DatePicker
        label="Due Date"
        value={formData.dueDate}
        projectBounds={projectBounds}
        onChange={(value: DateRange) => {
          const taskStart = value.start;
          const taskEnd = value.end ?? value.start;
          let newProjectId = formData.projectId;
          if (newProjectId && projects) {
            const proj = projects.find((p) => p.id === newProjectId);
            if (proj) {
              const projStart = proj.dueDate.start;
              const projEnd = proj.dueDate.end ?? proj.dueDate.start;
              if (taskStart < projStart || taskEnd > projEnd) {
                newProjectId = undefined;
              }
            }
          }
          setFormData((prev) => ({ ...prev, dueDate: value, projectId: newProjectId }));
          if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: "" }));
        }}
      />
      {errors.dueDate && (
        <p className="-mt-3 text-xs text-red-500">{errors.dueDate}</p>
      )}

      {/* Subtasks */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Subtasks
        </label>
        <SubtaskList
          subtasks={formData.subtasks}
          onChange={(subtasks: Subtask[]) =>
            updateFormData("subtasks", subtasks)
          }
        />
      </div>

      {/* Reference Links */}
      <ReferenceLinks
        label="Reference Links"
        links={formData.referenceLinks}
        onChange={(links) => updateFormData("referenceLinks", links)}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        {editingTask && (
          <a
            href={`/playground/${editingTask.id}`}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Playground
          </a>
        )}
        <div className="ml-auto flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingTask ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  onAddCategory,
  editingTask,
  prefilledDate,
  prefilledProjectId,
  projects,
}: TaskModalProps) {
  // Generate a unique key when modal opens with different task or project context
  const modalKey = isOpen
    ? (editingTask?.id ?? prefilledProjectId ?? "new")
    : "closed";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? "Edit Task" : "Create New Task"}
      className="max-w-xl"
    >
      <TaskModalContent
        key={modalKey}
        onClose={onClose}
        onSubmit={onSubmit}
        categories={categories}
        onAddCategory={onAddCategory}
        editingTask={editingTask}
        prefilledDate={prefilledDate}
        prefilledProjectId={prefilledProjectId}
        projects={projects}
      />
    </Modal>
  );
}

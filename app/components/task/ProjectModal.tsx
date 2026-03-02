"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";
import Textarea from "@/app/components/ui/Textarea";
import { DateRange, Project, ProjectFormData } from "@/app/types/task";
import { useMemo, useState } from "react";
import DatePicker from "./DatePicker";

const PROJECT_COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#eab308", // yellow
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  editingProject?: Project | null;
}

const getDefaultFormData = (): ProjectFormData => {
  const today = new Date().toISOString().split("T")[0];
  return {
    title: "",
    description: "",
    color: PROJECT_COLORS[0],
    dueDate: { start: today, end: null },
  };
};

function ProjectModalContent({
  onClose,
  onSubmit,
  editingProject,
}: Omit<ProjectModalProps, "isOpen">) {
  const initialFormData = useMemo<ProjectFormData>(() => {
    if (editingProject) {
      return {
        title: editingProject.title,
        description: editingProject.description,
        color: editingProject.color,
        dueDate: editingProject.dueDate,
      };
    }
    return getDefaultFormData();
  }, [editingProject]);

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.dueDate.start) {
      newErrors.dueDate = "Please select a start date";
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

  const updateFormData = <K extends keyof ProjectFormData>(
    field: K,
    value: ProjectFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => updateFormData("title", e.target.value)}
        placeholder="Enter project title"
        error={errors.title}
      />

      {/* Description */}
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => updateFormData("description", e.target.value)}
        placeholder="Describe this project..."
        rows={3}
      />

      {/* Project Color */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Project Color
        </label>
        <div className="flex gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateFormData("color", color)}
              className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            >
              {formData.color === color && (
                <svg
                  className="absolute inset-0 m-auto"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Time Frame */}
      <DatePicker
        label="Time Frame"
        value={formData.dueDate}
        onChange={(value: DateRange) => {
          updateFormData("dueDate", value);
          if (errors.dueDate) {
            setErrors((prev) => ({ ...prev, dueDate: "" }));
          }
        }}
      />
      {errors.dueDate && (
        <p className="-mt-3 text-xs text-red-500">{errors.dueDate}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {editingProject ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
}: ProjectModalProps) {
  const modalKey = isOpen ? (editingProject?.id ?? "new") : "closed";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? "Edit Project" : "Create New Project"}
      className="max-w-xl"
    >
      <ProjectModalContent
        key={modalKey}
        onClose={onClose}
        onSubmit={onSubmit}
        editingProject={editingProject}
      />
    </Modal>
  );
}

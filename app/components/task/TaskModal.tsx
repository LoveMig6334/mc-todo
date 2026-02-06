'use client';

import { useState, useMemo } from 'react';
import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Button from '@/app/components/ui/Button';
import Slider from '@/app/components/ui/Slider';
import Dropdown from '@/app/components/ui/Dropdown';
import DatePicker from './DatePicker';
import ReferenceLinks from './ReferenceLinks';
import { Task, TaskFormData, Category, DateRange } from '@/app/types/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  categories: Category[];
  onAddCategory: (name: string) => Category;
  editingTask?: Task | null;
  prefilledDate?: string;
}

const getDefaultFormData = (prefilledDate?: string): TaskFormData => {
  const today = new Date().toISOString().split('T')[0];
  return {
    title: '',
    details: '',
    categoryId: '',
    priority: 5,
    dueDate: {
      start: prefilledDate || today,
      end: null,
    },
    referenceLinks: [],
    completed: false,
  };
};

function TaskModalContent({
  onClose,
  onSubmit,
  categories,
  onAddCategory,
  editingTask,
  prefilledDate,
}: Omit<TaskModalProps, 'isOpen'>) {
  const initialFormData = useMemo(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        details: editingTask.details,
        categoryId: editingTask.categoryId,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        referenceLinks: editingTask.referenceLinks,
        completed: editingTask.completed,
      };
    }
    return getDefaultFormData(prefilledDate);
  }, [editingTask, prefilledDate]);

  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.categoryId) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.dueDate.start) {
      newErrors.dueDate = 'Please select a due date';
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
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCategory = (name: string) => {
    const newCategory = onAddCategory(name);
    updateFormData('categoryId', newCategory.id);
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
        onChange={(e) => updateFormData('title', e.target.value)}
        placeholder="Enter task title"
        error={errors.title}
      />

      {/* Details */}
      <Textarea
        label="Details"
        value={formData.details}
        onChange={(e) => updateFormData('details', e.target.value)}
        placeholder="Add more details about this task..."
        rows={3}
      />

      {/* Category & Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Dropdown
            label="Category"
            options={categoryOptions}
            value={formData.categoryId}
            onChange={(value) => updateFormData('categoryId', value)}
            onAddNew={handleAddCategory}
            placeholder="Select category"
            allowAdd
          />
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        <Slider
          label="Priority"
          value={formData.priority}
          onChange={(value) => updateFormData('priority', value)}
          min={0}
          max={10}
        />
      </div>

      {/* Due Date */}
      <DatePicker
        label="Due Date"
        value={formData.dueDate}
        onChange={(value: DateRange) => {
          updateFormData('dueDate', value);
          if (errors.dueDate) {
            setErrors((prev) => ({ ...prev, dueDate: '' }));
          }
        }}
      />
      {errors.dueDate && (
        <p className="-mt-3 text-xs text-red-500">{errors.dueDate}</p>
      )}

      {/* Reference Links */}
      <ReferenceLinks
        label="Reference Links"
        links={formData.referenceLinks}
        onChange={(links) => updateFormData('referenceLinks', links)}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {editingTask ? 'Save Changes' : 'Create Task'}
        </Button>
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
}: TaskModalProps) {
  // Generate a unique key when modal opens with different task
  const modalKey = isOpen ? (editingTask?.id ?? 'new') : 'closed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? 'Edit Task' : 'Create New Task'}
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
      />
    </Modal>
  );
}

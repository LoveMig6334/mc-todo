"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";
import { CATEGORY_COLORS } from "@/app/hooks/useCategories";
import { Category } from "@/app/types/task";
import { useCallback, useMemo, useState } from "react";

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: (id: string, updates: Partial<Omit<Category, "id">>) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => Category;
  taskCountByCategory: Record<string, number>;
}

export default function CategoryEditModal({
  isOpen,
  onClose,
  categories,
  onUpdate,
  onDelete,
  onAdd,
  taskCountByCategory,
}: CategoryEditModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");

  const editingCategory = useMemo(
    () => categories.find((c) => c.id === editingId),
    [categories, editingId],
  );

  const startEdit = useCallback((cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setDeletingId(null);
    setAddingNew(false);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editName.trim()) return;
    onUpdate(editingId, { name: editName.trim() });
    setEditingId(null);
    setEditName("");
  }, [editingId, editName, onUpdate]);

  const handleColorChange = useCallback(
    (id: string, color: string) => {
      onUpdate(id, { color });
    },
    [onUpdate],
  );

  const confirmDelete = useCallback(() => {
    if (!deletingId) return;
    onDelete(deletingId);
    setDeletingId(null);
  }, [deletingId, onDelete]);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
    setAddingNew(false);
  }, [newName, onAdd]);

  const handleClose = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setDeletingId(null);
    setAddingNew(false);
    setNewName("");
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Categories">
      <div className="space-y-1">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          const isDeleting = deletingId === cat.id;
          const taskCount = taskCountByCategory[cat.id] ?? 0;

          return (
            <div key={cat.id}>
              {/* Category Row */}
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-800/50">
                {/* Color dot — clickable to expand color picker */}
                <button
                  onClick={() =>
                    setEditingId(
                      editingId === cat.id && !editName ? null : cat.id,
                    )
                  }
                  className="group relative shrink-0"
                  title="Change color"
                >
                  <span
                    className="block h-4 w-4 rounded-full ring-2 ring-transparent transition-all group-hover:ring-zinc-500"
                    style={{ backgroundColor: cat.color }}
                  />
                </button>

                {/* Name — inline edit or display */}
                {isEditing ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit();
                    }}
                  >
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditName("");
                        }
                      }}
                    />
                    <Button type="submit" size="sm" disabled={!editName.trim()}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setEditName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-zinc-200">
                      {cat.name}
                    </span>
                    <span className="mr-2 text-xs text-zinc-500">
                      {taskCount} {taskCount === 1 ? "task" : "tasks"}
                    </span>

                    {/* Edit button */}
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
                      title="Rename"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        setDeletingId(cat.id);
                        setEditingId(null);
                      }}
                      className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Color Picker (shown when editing) */}
              {isEditing && (
                <div className="ml-10 mb-2 flex flex-wrap gap-2 px-3">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(cat.id, color)}
                      className="relative h-6 w-6 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {editingCategory?.color === color && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="absolute inset-0 m-auto"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Delete confirmation */}
              {isDeleting && (
                <div className="ml-10 mb-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                  <p className="text-xs text-zinc-400">
                    {taskCount > 0
                      ? `This will remove the category from ${taskCount} ${taskCount === 1 ? "task" : "tasks"}.`
                      : "This category has no tasks."}{" "}
                    Delete &quot;{cat.name}&quot;?
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="danger" size="sm" onClick={confirmDelete}>
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add new category */}
        {addingNew ? (
          <form
            className="flex items-center gap-2 px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAddingNew(false);
                  setNewName("");
                }
              }}
            />
            <Button type="submit" size="sm" disabled={!newName.trim()}>
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddingNew(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <button
            onClick={() => {
              setAddingNew(true);
              setEditingId(null);
              setDeletingId(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
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
            Add Category
          </button>
        )}
      </div>
    </Modal>
  );
}

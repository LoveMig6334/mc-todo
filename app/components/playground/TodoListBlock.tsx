"use client";

import { generateId } from "@/app/lib/utils";
import { TodoBlockData, TodoItem } from "@/app/types/playground";
import { useCallback, useRef, useState } from "react";

const TODO_COLORS = [
  { hex: "#27272a", label: "Zinc" },
  { hex: "#1e3a5f", label: "Blue" },
  { hex: "#3b1f2b", label: "Rose" },
  { hex: "#1a3324", label: "Green" },
  { hex: "#3d2b1a", label: "Amber" },
  { hex: "#2d1b4e", label: "Purple" },
];

interface TodoListBlockProps {
  data: TodoBlockData;
  isSelected: boolean;
  onUpdate: (data: Partial<TodoBlockData>) => void;
}

export default function TodoListBlock({
  data,
  isSelected,
  onUpdate,
}: TodoListBlockProps) {
  const [newItemText, setNewItemText] = useState("");
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const dragStartY = useRef(0);
  const dragStartIndex = useRef(0);

  const completedCount = data.items.filter((i) => i.completed).length;
  const totalCount = data.items.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ title: e.target.value });
    },
    [onUpdate],
  );

  const handleAddItem = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && newItemText.trim()) {
        const newItem: TodoItem = {
          id: generateId(),
          text: newItemText.trim(),
          completed: false,
        };
        onUpdate({ items: [...data.items, newItem] });
        setNewItemText("");
      }
    },
    [newItemText, data.items, onUpdate],
  );

  const handleToggleItem = useCallback(
    (itemId: string) => {
      onUpdate({
        items: data.items.map((i) =>
          i.id === itemId ? { ...i, completed: !i.completed } : i,
        ),
      });
    },
    [data.items, onUpdate],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      onUpdate({
        items: data.items.filter((i) => i.id !== itemId),
      });
    },
    [data.items, onUpdate],
  );

  // --- Drag to reorder ---
  const handleDragStart = useCallback(
    (e: React.PointerEvent, itemId: string) => {
      e.stopPropagation();
      setDragItemId(itemId);
      dragStartY.current = e.clientY;
      dragStartIndex.current = data.items.findIndex((i) => i.id === itemId);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [data.items],
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragItemId) return;
      // Find the element under the pointer
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const itemEl = elements.find((el) =>
        el.getAttribute("data-todo-item-id"),
      );
      if (itemEl) {
        const overId = itemEl.getAttribute("data-todo-item-id");
        if (overId && overId !== dragItemId) {
          setDragOverItemId(overId);
        }
      }
    },
    [dragItemId],
  );

  const handleDragEnd = useCallback(() => {
    if (dragItemId && dragOverItemId && dragItemId !== dragOverItemId) {
      const items = [...data.items];
      const fromIndex = items.findIndex((i) => i.id === dragItemId);
      const toIndex = items.findIndex((i) => i.id === dragOverItemId);
      if (fromIndex !== -1 && toIndex !== -1) {
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        onUpdate({ items });
      }
    }
    setDragItemId(null);
    setDragOverItemId(null);
  }, [dragItemId, dragOverItemId, data.items, onUpdate]);

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Title */}
      <input
        type="text"
        value={data.title}
        onChange={handleTitleChange}
        placeholder="Checklist title"
        className="bg-transparent text-white text-sm font-semibold outline-none placeholder:text-zinc-500 w-full"
        onPointerDown={(e) => e.stopPropagation()}
      />

      {/* Items list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
        {data.items.map((item) => (
          <div
            key={item.id}
            data-todo-item-id={item.id}
            className={`group flex items-center gap-2 px-1.5 py-1 rounded-md transition-colors ${
              dragOverItemId === item.id
                ? "bg-orange-500/20 border border-orange-500/40"
                : "hover:bg-white/5 border border-transparent"
            } ${dragItemId === item.id ? "opacity-50" : ""}`}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            {/* Drag handle */}
            <button
              className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 touch-none"
              onPointerDown={(e) => handleDragStart(e, item.id)}
              title="Drag to reorder"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="9" cy="6" r="2" />
                <circle cx="15" cy="6" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="15" cy="12" r="2" />
                <circle cx="9" cy="18" r="2" />
                <circle cx="15" cy="18" r="2" />
              </svg>
            </button>

            {/* Checkbox */}
            <button
              onClick={() => handleToggleItem(item.id)}
              onPointerDown={(e) => e.stopPropagation()}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                item.completed
                  ? "bg-orange-500 border-orange-500"
                  : "border-zinc-500 hover:border-zinc-400"
              }`}
              title={item.completed ? "Mark incomplete" : "Mark complete"}
            >
              {item.completed && (
                <svg
                  width="10"
                  height="10"
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

            {/* Text */}
            <span
              className={`text-sm flex-1 min-w-0 truncate transition-colors ${
                item.completed ? "text-zinc-500 line-through" : "text-zinc-300"
              }`}
            >
              {item.text}
            </span>

            {/* Remove button */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              onPointerDown={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all shrink-0"
              title="Remove item"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add item input */}
        <div className="flex items-center gap-2 px-1.5 py-1">
          <svg
            className="text-zinc-600 shrink-0"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleAddItem}
            placeholder="Add item..."
            className="bg-transparent text-zinc-300 text-sm outline-none placeholder:text-zinc-600 flex-1"
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span
              className="text-xs text-zinc-500"
              data-testid="todo-progress-text"
            >
              {completedCount}/{totalCount} done
            </span>
            <span className="text-xs text-zinc-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              data-testid="todo-progress-bar"
            />
          </div>
        </div>
      )}

      {/* Color picker */}
      {isSelected && (
        <div className="flex gap-1.5 pt-1 border-t border-white/10">
          {TODO_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdate({ color: c.hex })}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor:
                  data.color === c.hex
                    ? "rgb(249, 115, 22)"
                    : "rgba(255,255,255,0.15)",
              }}
              title={c.label}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { cn, generateId } from "@/app/lib/utils";
import { Subtask } from "@/app/types/task";
import { useState } from "react";

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readOnly?: boolean;
}

export default function SubtaskList({
  subtasks,
  onChange,
  readOnly = false,
}: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress =
    subtasks.length === 0
      ? 0
      : Math.round((completedCount / subtasks.length) * 100);

  const handleAdd = () => {
    const title = newSubtask.trim();
    if (!title) return;
    onChange([...subtasks, { id: generateId(), title, completed: false }]);
    setNewSubtask("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleToggle = (id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    );
  };

  const handleRemove = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Header with progress */}
      {subtasks.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400">
            {completedCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Subtask items */}
      <ul className="space-y-1">
        {subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="group flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-zinc-800/50"
          >
            <button
              onClick={() => !readOnly && handleToggle(subtask.id)}
              disabled={readOnly}
              className={cn(
                "h-3.5 w-3.5 shrink-0 rounded border transition-all duration-200 flex items-center justify-center",
                subtask.completed
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-zinc-500 hover:border-emerald-500",
              )}
            >
              {subtask.completed && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                subtask.completed
                  ? "text-zinc-500 line-through"
                  : "text-zinc-200",
              )}
            >
              {subtask.title}
            </span>
            {!readOnly && (
              <button
                onClick={() => handleRemove(subtask.id)}
                className="rounded p-0.5 text-zinc-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                aria-label="Remove subtask"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Add subtask input */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a subtask..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!newSubtask.trim()}
            className="rounded-md border border-zinc-700 bg-zinc-800 p-1 text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-400"
            aria-label="Add subtask"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

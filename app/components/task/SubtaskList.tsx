"use client";

import { springBouncy } from "@/app/lib/animation";
import {
  cn,
  generateId,
  getStatusLabel,
  getStatusColor,
  getSubtaskPriorityLabel,
  getSubtaskPriorityColor,
} from "@/app/lib/utils";
import { Subtask, TaskStatus, SubtaskPriority } from "@/app/types/task";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readOnly?: boolean;
}

const STATUS_CYCLE: TaskStatus[] = [
  "pending",
  "in_progress",
  "needs_approval",
  "paused",
];
const PRIORITY_CYCLE: SubtaskPriority[] = ["low", "medium", "high"];

export default function SubtaskList({
  subtasks,
  onChange,
  readOnly = false,
}: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress =
    subtasks.length === 0
      ? 0
      : Math.round((completedCount / subtasks.length) * 100);

  const handleAdd = () => {
    const title = newSubtask.trim();
    if (!title) return;
    onChange([
      ...subtasks,
      {
        id: generateId(),
        title,
        completed: false,
        status: "pending",
        priority: "low",
        link: "",
      },
    ]);
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
    setConfirmDeleteId(null);
  };

  const handleCycleStatus = (id: string) => {
    onChange(
      subtasks.map((s) => {
        if (s.id !== id) return s;
        const current = s.status ?? "pending";
        const idx = STATUS_CYCLE.indexOf(current);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        return { ...s, status: next };
      }),
    );
  };

  const handleCyclePriority = (id: string) => {
    onChange(
      subtasks.map((s) => {
        if (s.id !== id) return s;
        const current = s.priority ?? "low";
        const idx = PRIORITY_CYCLE.indexOf(current);
        const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
        return { ...s, priority: next };
      }),
    );
  };

  const handleOpenLinkEdit = (subtask: Subtask) => {
    setEditingLinkId(subtask.id);
    setLinkInput(subtask.link ?? "");
  };

  const handleSaveLink = (id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, link: linkInput.trim() } : s,
      ),
    );
    setEditingLinkId(null);
    setLinkInput("");
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveLink(id);
    }
    if (e.key === "Escape") {
      setEditingLinkId(null);
      setLinkInput("");
    }
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
      <ul className="space-y-0.5">
        {subtasks.map((subtask) => {
          const status = subtask.status ?? "pending";
          const priority = subtask.priority ?? "low";
          const hasLink = !!subtask.link;
          const isConfirming = confirmDeleteId === subtask.id;

          return (
            <li
              key={subtask.id}
              className="group relative rounded-md py-1 pl-1.5 pr-9 hover:bg-zinc-800/50"
            >
              {/* Row 1: Checkbox + Title */}
              <div className="flex items-center gap-2">
                {/* Checkbox */}
                <motion.button
                  onClick={() => !readOnly && handleToggle(subtask.id)}
                  disabled={readOnly}
                  whileTap={!readOnly ? { scale: 0.75 } : undefined}
                  whileHover={
                    !subtask.completed && !readOnly
                      ? { borderColor: "rgb(16, 185, 129)" }
                      : undefined
                  }
                  transition={springBouncy}
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center",
                    subtask.completed && "border-emerald-500 bg-emerald-500",
                  )}
                  style={
                    !subtask.completed
                      ? { borderColor: "rgb(113, 113, 122)" }
                      : undefined
                  }
                >
                  <AnimatePresence>
                    {subtask.completed && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={springBouncy}
                        style={{ display: "inline-flex" }}
                      >
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
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Title */}
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm",
                    subtask.completed
                      ? "text-zinc-500 line-through"
                      : "text-zinc-200",
                  )}
                >
                  {subtask.title}
                </span>
              </div>

              {/* Row 2: Status + Priority + Link badges */}
              <div className="mt-1 ml-5.5 flex items-center gap-2">
                {/* Status badge */}
                {!readOnly ? (
                  <button
                    onDoubleClick={() => handleCycleStatus(subtask.id)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none transition-opacity select-none",
                      getStatusColor(status),
                    )}
                    title={`Status: ${getStatusLabel(status)} (double-click to cycle)`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      getStatusColor(status),
                    )}
                  >
                    {getStatusLabel(status)}
                  </span>
                )}

                {/* Priority badge */}
                {!readOnly ? (
                  <button
                    onDoubleClick={() => handleCyclePriority(subtask.id)}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none transition-opacity select-none",
                      getSubtaskPriorityColor(priority),
                    )}
                    title={`Priority: ${getSubtaskPriorityLabel(priority)} (double-click to cycle)`}
                  >
                    {getSubtaskPriorityLabel(priority)}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      getSubtaskPriorityColor(priority),
                    )}
                  >
                    {getSubtaskPriorityLabel(priority)}
                  </span>
                )}

                {/* Divider */}
                <span className="h-3 w-px bg-zinc-700" />

                {/* Link */}
                {hasLink ? (
                  <div className="flex items-center gap-1">
                    <a
                      href={subtask.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-blue-400 transition-colors hover:text-blue-300"
                      title={subtask.link}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span className="max-w-32 truncate">
                        {subtask.link!.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                    {!readOnly && (
                      <button
                        onClick={() => handleOpenLinkEdit(subtask)}
                        className="rounded p-0.5 text-zinc-600 transition-colors hover:text-zinc-400"
                        title="Edit link"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : !readOnly ? (
                  <button
                    onClick={() => handleOpenLinkEdit(subtask)}
                    className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
                    title="Add link"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>Add link</span>
                  </button>
                ) : null}
              </div>

              {/* Inline link editor */}
              {editingLinkId === subtask.id && (
                <div className="mt-1.5 ml-5.5 flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => handleLinkKeyDown(e, subtask.id)}
                    autoFocus
                    className="flex-1 rounded border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => handleSaveLink(subtask.id)}
                    className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300 transition-colors hover:border-blue-500 hover:text-blue-400"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingLinkId(null);
                      setLinkInput("");
                    }}
                    className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Delete confirm inline bar */}
              {isConfirming && (
                <div className="mt-1.5 ml-5.5 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5">
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
                    className="shrink-0 text-red-400"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="flex-1 text-xs text-red-300">
                    Delete this subtask?
                  </span>
                  <button
                    onClick={() => handleRemove(subtask.id)}
                    className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/30 hover:text-red-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded bg-zinc-700/50 px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Delete button — absolute right, vertically centered */}
              {!readOnly && (
                <button
                  onClick={() =>
                    setConfirmDeleteId(isConfirming ? null : subtask.id)
                  }
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 transition-all",
                    isConfirming
                      ? "text-red-400 opacity-100"
                      : "text-zinc-600 opacity-0 hover:bg-zinc-700/50 hover:text-red-400 group-hover:opacity-100",
                  )}
                  aria-label="Remove subtask"
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
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

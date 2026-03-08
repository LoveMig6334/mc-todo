"use client";

import { springSnappy } from "@/app/lib/animation";
import { formatDate } from "@/app/lib/utils";
import { Task } from "@/app/types/task";
import { motion } from "motion/react";
import { useState } from "react";

interface ArchivedTasksPanelProps {
  archivedTasks: Task[];
  archiveThreshold: number;
  onThresholdChange: (days: number) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onArchiveAllCompleted: () => void;
  hasCompletedTasks: boolean;
}

const THRESHOLD_OPTIONS = [
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export default function ArchivedTasksPanel({
  archivedTasks,
  archiveThreshold,
  onThresholdChange,
  onRestore,
  onDelete,
  onArchiveAllCompleted,
  hasCompletedTasks,
}: ArchivedTasksPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-2.5">
          {/* Archive icon */}
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
            className="text-zinc-400"
          >
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          <span className="text-sm font-medium text-zinc-300">
            Archived Tasks
          </span>
          <motion.span
            key={archivedTasks.length}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500 inline-block"
          >
            {archivedTasks.length}
          </motion.span>
        </div>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-500"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={springSnappy}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={springSnappy}
        style={{ overflow: "hidden" }}
      >
        <div className="border-t border-zinc-800">
          {/* Settings bar */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Auto-archive after:</span>
              <select
                value={archiveThreshold}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 outline-none focus:border-orange-500 transition-colors"
              >
                {THRESHOLD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onArchiveAllCompleted}
              disabled={!hasCompletedTasks}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10 hover:border-orange-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800 disabled:hover:border-zinc-700"
            >
              Archive All Done
            </button>
          </div>

          {/* Archived task list */}
          {archivedTasks.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">No archived tasks yet.</p>
              <p className="mt-1 text-xs text-zinc-600">
                Completed tasks will be archived after {archiveThreshold} days.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-800/30"
                >
                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-zinc-400 line-through">
                      {task.title}
                    </p>
                    {task.completedAt && (
                      <p className="mt-0.5 text-xs text-zinc-600">
                        Completed {formatDate(task.completedAt)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onRestore(task.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10"
                      title="Restore task"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete permanently"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

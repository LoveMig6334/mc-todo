"use client";

import FloatingNav from "@/app/components/layout/FloatingNav";
import { useAutoArchive } from "@/app/hooks/useAutoArchive";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { springSnappy } from "@/app/lib/animation";
import { formatDate } from "@/app/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

const THRESHOLD_OPTIONS = [
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export default function ArchivePage() {
  const {
    tasks,
    archivedTasks,
    deleteTask,
    restoreTask,
    archiveAllCompleted,
    archiveTask,
  } = useTaskManager();

  const { archiveThreshold, setArchiveThreshold } = useAutoArchive(
    tasks,
    archiveTask,
  );

  const hasCompletedTasks = tasks.some((t) => t.completed);

  return (
    <div className="min-h-screen bg-zinc-900">
      <FloatingNav currentPath="/archive" />

      <main className="mx-auto max-w-[80%] px-4 pb-8 pt-24">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
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
                  className="text-orange-500"
                >
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Archived Tasks
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                View and manage your completed tasks
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Auto-archive after:</span>
              <select
                value={archiveThreshold}
                onChange={(e) => setArchiveThreshold(Number(e.target.value))}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 outline-none transition-colors hover:border-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {THRESHOLD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={archiveAllCompleted}
              disabled={!hasCompletedTasks}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Archive All Done
            </button>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="mb-6 flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
             <span className="text-sm text-zinc-400">Auto-archive:</span>
             <select
                value={archiveThreshold}
                onChange={(e) => setArchiveThreshold(Number(e.target.value))}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-300 outline-none"
              >
                {THRESHOLD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
          </div>
          <button
              onClick={archiveAllCompleted}
              disabled={!hasCompletedTasks}
              className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Archive All Done
          </button>
        </div>


        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={springSnappy}
           className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1"
        >
          {archivedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-zinc-800/50 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-500"
                >
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-zinc-300">
                No archived tasks yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                Completed tasks will be automatically archived after {archiveThreshold} days, or you can archive them manually.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-800/30 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium text-zinc-300">
                      {task.title}
                    </h3>
                    {task.completedAt && (
                      <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        Completed on {formatDate(task.completedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreTask(task.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                      title="Restore task to active list"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      Restore
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title="Delete permanently"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

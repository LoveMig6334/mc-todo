"use client";

import { MatrixTask } from "@/app/lib/dashboardUtils";

interface Props {
  tasks: MatrixTask[];
}

export default function TopSuggestedTasks({ tasks }: Props) {
  if (tasks.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <h3 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
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
          className="text-amber-400"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        Top 3 Tasks To Do Now
      </h3>
      <div className="space-y-2">
        {tasks.map((t, i) => (
          <div
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-zinc-700/30 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-800 hidden sm:flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700 shrink-0 shadow-inner">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {t.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: t.categoryColor }}
                  />
                  {t.categoryName}
                </span>
                <span>•</span>
                <span
                  className={t.daysLeft <= 0 ? "text-red-400 font-medium" : ""}
                >
                  {t.daysLeft < 0
                    ? `${Math.abs(t.daysLeft)} days overdue`
                    : t.daysLeft === 0
                      ? "Due today"
                      : `Due in ${t.daysLeft} days`}
                </span>
              </div>
            </div>
            <div
              className={`text-xs px-2.5 py-1 rounded-md border whitespace-nowrap self-start sm:self-auto font-medium shadow-sm ${
                t.quadrant === "q1"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : t.quadrant === "q2"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : t.quadrant === "q3"
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
              }`}
            >
              {t.quadrant.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

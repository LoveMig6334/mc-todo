"use client";

import { springBouncy } from "@/app/lib/animation";
import { CategoryStat } from "@/app/lib/dashboardUtils";
import { motion } from "motion/react";

interface CategoryBarChartProps {
  data: CategoryStat[];
  onManage?: () => void;
}

export default function CategoryBarChart({ data, onManage }: CategoryBarChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Tasks by Category</h3>
        {onManage && (
          <button
            onClick={onManage}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
            title="Manage categories"
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          No categorized tasks yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((cat, index) => {
            const totalPct = (cat.total / maxTotal) * 100;
            const completedPct =
              cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;

            return (
              <div key={cat.categoryId}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-zinc-300">{cat.name}</span>
                  </div>
                  <span className="text-zinc-500">
                    {cat.completed}/{cat.total}
                  </span>
                </div>
                <motion.div
                  className="h-2 overflow-hidden rounded-full bg-zinc-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPct}%` }}
                  transition={{ ...springBouncy, delay: index * 0.06 }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completedPct}%` }}
                    transition={{ ...springBouncy, delay: index * 0.06 + 0.1 }}
                    style={{ backgroundColor: cat.color }}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

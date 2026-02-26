"use client";

import { MatrixData } from "@/app/lib/dashboardUtils";

interface Props {
  data: MatrixData;
}

export default function TimeManagementMatrix({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5 mt-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          Time Management Matrix
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Scatter plot layout: Y-axis represents Importance, X-axis represents
          Urgency.
        </p>
      </div>

      <div className="relative ml-8 mb-8 mt-8 lg:ml-12 lg:mb-12 h-80 rounded-lg border border-zinc-600 bg-zinc-900 overflow-hidden shadow-inner">
        {/* Background Quadrants */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top Left: Q1 Urgent & Important */}
          <div className="bg-red-500/5 transition-colors border-r border-b border-zinc-700/50 flex flex-col p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500/50 ml-auto whitespace-nowrap hidden sm:block">
              Q1: Do First
            </span>
          </div>
          {/* Top Right: Q2 Not Urgent & Important */}
          <div className="bg-blue-500/5 transition-colors border-b border-zinc-700/50 flex flex-col p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500/50 mr-auto whitespace-nowrap hidden sm:block">
              Q2: Schedule
            </span>
          </div>
          {/* Bottom Left: Q3 Urgent & Not Important */}
          <div className="bg-yellow-500/5 transition-colors border-r border-zinc-700/50 flex flex-col justify-end p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/50 ml-auto whitespace-nowrap hidden sm:block">
              Q3: Delegate
            </span>
          </div>
          {/* Bottom Right: Q4 Not Urgent & Not Important */}
          <div className="bg-zinc-700/10 transition-colors flex flex-col justify-end p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500/50 mr-auto whitespace-nowrap hidden sm:block">
              Q4: Eliminate
            </span>
          </div>
        </div>

        {/* Axes Labels */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold tracking-widest text-zinc-400 uppercase pointer-events-none whitespace-nowrap z-20">
          Importance
        </div>
        <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 text-xs font-bold tracking-widest text-zinc-400 uppercase pointer-events-none z-20">
          Urgency (Time)
        </div>

        <div className="absolute bottom-1 left-2 text-[10px] font-medium text-zinc-500 pointer-events-none z-20">
          Overdue
        </div>
        <div className="absolute bottom-1 right-2 text-[10px] font-medium text-zinc-500 pointer-events-none z-20">
          30+ Days
        </div>

        {/* Matrix Plot points */}
        {data.tasks.map((t) => (
          <div
            key={t.id}
            className="absolute w-4 h-4 rounded-full shadow-md shrink-0 cursor-crosshair transition-all hover:scale-150 group z-10 border border-zinc-900/50 ring-2 ring-transparent hover:ring-white/20 hover:z-50"
            // Note: HTML/CSS coords are calculated from top-left.
            // - Left (X): 0% = urgent (left), 100% = not urgent (right).
            // - Top (Y): 0% priority = 100% top (bottom), 100% priority = 0% top (top).
            // We subtract 8px (0.5rem) to center the dot accurately on its literal point.
            style={{
              backgroundColor: t.categoryColor,
              left: `calc(${t.x}% - 8px)`,
              top: `calc(${100 - t.y}% - 8px)`,
            }}
          >
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 border items-start justify-start border-zinc-600 shadow-2xl rounded-lg p-2.5 left-1/2 -translate-x-1/2 bottom-5 pointer-events-none z-50 w-max min-w-[200px] max-w-[240px]">
              <p className="text-zinc-100 text-sm font-semibold mb-1 truncate">
                {t.title}
              </p>
              <div className="flex flex-col gap-1 text-[11px] text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: t.categoryColor }}
                    />
                    {t.categoryName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      t.quadrant === "q1"
                        ? "text-red-400 bg-red-400/10"
                        : t.quadrant === "q2"
                          ? "text-blue-400 bg-blue-400/10"
                          : t.quadrant === "q3"
                            ? "text-yellow-400 bg-yellow-400/10"
                            : "text-zinc-400 bg-zinc-400/10"
                    }`}
                  >
                    {t.quadrant.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 border-t border-zinc-700 pt-1">
                  <span>
                    Priority <span className="text-white">{t.priority}/10</span>
                  </span>
                  <span className={t.daysLeft <= 0 ? "text-red-400" : ""}>
                    {t.daysLeft < 0
                      ? `${Math.abs(t.daysLeft)}d overdue`
                      : t.daysLeft === 0
                        ? "Due today"
                        : `Due ${t.daysLeft}d`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {data.tasks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-zinc-500 text-sm font-medium italic">
              No active tasks
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

      <div className="relative ml-8 mb-8 mt-8 lg:ml-12 lg:mb-12 h-96 rounded-xl border-2 border-zinc-700/50 bg-zinc-900/50 shadow-2xl">
        {/* Background Quadrants */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-[10px] overflow-hidden">
          {/* Top Left: Q1 Urgent & Important */}
          <div className="bg-red-500/10 transition-colors border-r-2 border-b-2 border-zinc-700/80 flex flex-col p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-400/70 ml-auto whitespace-nowrap hidden sm:block relative z-10">
              Q1: Do First
            </span>
          </div>
          {/* Top Right: Q2 Not Urgent & Important */}
          <div className="bg-blue-500/5 transition-colors border-b-2 border-zinc-700/80 flex flex-col p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-bl from-blue-500/5 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400/70 mr-auto whitespace-nowrap hidden sm:block relative z-10">
              Q2: Schedule
            </span>
          </div>
          {/* Bottom Left: Q3 Urgent & Not Important */}
          <div className="bg-yellow-500/5 transition-colors border-r-2 border-zinc-700/80 flex flex-col justify-end p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-yellow-500/5 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-500/70 ml-auto whitespace-nowrap hidden sm:block relative z-10">
              Q3: Delegate
            </span>
          </div>
          {/* Bottom Right: Q4 Not Urgent & Not Important */}
          <div className="bg-zinc-800/30 transition-colors flex flex-col justify-end p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tl from-zinc-500/5 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500/70 mr-auto whitespace-nowrap hidden sm:block relative z-10">
              Q4: Eliminate
            </span>
          </div>
        </div>

        {/* Axes Labels */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase pointer-events-none whitespace-nowrap z-20">
          Importance (Priority)
        </div>
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase pointer-events-none z-20">
          Urgency (Days Left)
        </div>

        <div className="absolute bottom-1.5 left-3 text-[10px] font-bold tracking-wider uppercase text-zinc-500 pointer-events-none z-20">
          Overdue / Today
        </div>
        <div className="absolute bottom-1.5 right-3 text-[10px] font-bold tracking-wider uppercase text-zinc-500 pointer-events-none z-20">
          30+ Days
        </div>
        <div className="absolute top-1.5 left-3 text-[10px] font-bold tracking-wider uppercase text-zinc-500 pointer-events-none z-20">
          Highest
        </div>
        <div className="absolute bottom-1.5 left-3 text-[10px] font-bold tracking-wider uppercase text-zinc-500 pointer-events-none z-20 mb-4">
          Lowest
        </div>

        {/* Matrix Plot points */}
        {data.tasks.map((t) => (
          <div
            key={t.id}
            className="absolute w-3.5 h-3.5 rounded-full shadow-lg shrink-0 cursor-crosshair transition-all duration-300 hover:scale-150 group z-10 border-2 border-zinc-900 ring-2 ring-transparent hover:ring-white/30 hover:z-50"
            // Note: HTML/CSS coords are calculated from top-left.
            // - Left (X): 0% = urgent (left), 100% = not urgent (right).
            // - Top (Y): 0% priority = 100% top (bottom), 100% priority = 0% top (top).
            // We subtract 10px (0.625rem) to center the dot accurately on its literal point.
            style={{
              backgroundColor: t.categoryColor,
              left: `calc(${t.x}% - 7px)`,
              top: `calc(${100 - t.y}% - 7px)`,
            }}
          >
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-800/95 backdrop-blur-sm border items-start justify-start border-zinc-600/50 shadow-xl rounded-lg px-2.5 py-2 left-1/2 -translate-x-1/2 bottom-6 pointer-events-none z-50 w-max min-w-40 max-w-52">
              <p className="text-zinc-50 text-[11px] font-semibold mb-1 leading-tight">
                {t.title}
              </p>
              <div className="flex flex-col gap-1 text-[10px] text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span
                      className="w-2 h-2 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: t.categoryColor }}
                    />
                    {t.categoryName}
                  </span>
                  <span
                    className={`px-1.5 py-px rounded font-bold text-[9px] uppercase tracking-wider ${
                      t.quadrant === "q1"
                        ? "text-red-400 bg-red-400/10 border border-red-400/20"
                        : t.quadrant === "q2"
                          ? "text-blue-400 bg-blue-400/10 border border-blue-400/20"
                          : t.quadrant === "q3"
                            ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                            : "text-zinc-400 bg-zinc-400/10 border border-zinc-400/20"
                    }`}
                  >
                    {t.quadrant}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 border-t border-zinc-700/50 pt-1.5">
                  <span className="flex gap-1">
                    Priority{" "}
                    <span className="text-white font-medium">
                      {t.priority}/10
                    </span>
                  </span>
                  <span
                    className={`font-medium ${t.daysLeft <= 0 ? "text-red-400" : "text-zinc-300"}`}
                  >
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

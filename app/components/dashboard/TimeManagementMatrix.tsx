"use client";

import { MatrixData, MatrixTask } from "@/app/lib/dashboardUtils";

interface Props {
  data: MatrixData;
}

function Quadrant({
  title,
  tasks,
  bgClass,
  borderColor,
}: {
  title: string;
  tasks: MatrixTask[];
  bgClass: string;
  borderColor: string;
}) {
  return (
    <div
      className={`p-4 flex flex-col h-48 border ${borderColor} ${bgClass} rounded-xl overflow-visible relative`}
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 opacity-80">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2 overflow-y-auto content-start flex-1 relative z-10">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="w-4 h-4 rounded-full shadow-sm shrink-0 cursor-help transition-transform hover:scale-125 hover:z-50 relative group"
            style={{ backgroundColor: t.categoryColor }}
          >
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-5 pointer-events-none z-50 shadow-xl w-max max-w-[150px] truncate">
              {t.title}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-zinc-500 text-xs italic mt-auto mb-auto w-full text-center opacity-50">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimeManagementMatrix({ data }: Props) {
  const q1 = data.tasks.filter((t) => t.quadrant === "q1");
  const q2 = data.tasks.filter((t) => t.quadrant === "q2");
  const q3 = data.tasks.filter((t) => t.quadrant === "q3");
  const q4 = data.tasks.filter((t) => t.quadrant === "q4");

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-200">
          Time Management Matrix
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Eisenhower method: prioritize tasks by urgency and importance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 relative ml-4 mb-4">
        {/* Axes labels */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold tracking-widest text-zinc-500 uppercase whitespace-nowrap">
          Importance
        </div>
        <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          Urgency (Time)
        </div>

        {/* Q1: Urgent & Important */}
        <Quadrant
          title="Do First (Urgent & Important)"
          bgClass="bg-red-500/10"
          borderColor="border-red-500/20"
          tasks={q1}
        />
        {/* Q2: Not Urgent & Important */}
        <Quadrant
          title="Schedule (Not Urgent & Important)"
          bgClass="bg-blue-500/10"
          borderColor="border-blue-500/20"
          tasks={q2}
        />
        {/* Q3: Urgent & Not Important */}
        <Quadrant
          title="Delegate (Urgent & Not Important)"
          bgClass="bg-yellow-500/10"
          borderColor="border-yellow-500/20"
          tasks={q3}
        />
        {/* Q4: Not Urgent & Not Important */}
        <Quadrant
          title="Eliminate (Not Urgent & Not Important)"
          bgClass="bg-zinc-700/30"
          borderColor="border-zinc-700/50"
          tasks={q4}
        />
      </div>
    </div>
  );
}

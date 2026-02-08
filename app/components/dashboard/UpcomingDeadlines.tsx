import { UpcomingTask } from "@/app/lib/dashboardUtils";
import { cn } from "@/app/lib/utils";

interface UpcomingDeadlinesProps {
  tasks: UpcomingTask[];
}

function getDaysLeftColor(daysLeft: number): string {
  if (daysLeft <= 2) return "bg-red-500/20 text-red-400";
  if (daysLeft <= 6) return "bg-yellow-500/20 text-yellow-400";
  return "bg-emerald-500/20 text-emerald-400";
}

function formatDaysLeft(daysLeft: number): string {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `${daysLeft}d left`;
}

export default function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <h3 className="text-sm font-medium text-zinc-400">
        Upcoming Deadlines
      </h3>

      {tasks.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          No upcoming deadlines.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg bg-zinc-900/50 px-3 py-2.5"
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: task.categoryColor }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
                {task.title}
              </span>
              <span
                className={cn(
                  "flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                  getDaysLeftColor(task.daysLeft),
                )}
              >
                {formatDaysLeft(task.daysLeft)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { PriorityStat } from "@/app/lib/dashboardUtils";

interface PriorityBarChartProps {
  data: PriorityStat[];
  maxCount: number;
}

export default function PriorityBarChart({
  data,
  maxCount,
}: PriorityBarChartProps) {
  const effectiveMax = Math.max(maxCount, 1);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <h3 className="text-sm font-medium text-zinc-400">
        Priority Distribution
      </h3>

      <div
        className="mt-4 flex items-end justify-around gap-3"
        style={{ height: 140 }}
      >
        {data.map((bucket) => {
          const pct = (bucket.count / effectiveMax) * 100;

          return (
            <div
              key={bucket.label}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span className="text-xs font-medium text-zinc-300">
                {bucket.count}
              </span>
              <div
                className="relative w-full overflow-hidden rounded-t-md bg-zinc-700"
                style={{ height: 100 }}
              >
                <div
                  className="absolute bottom-0 w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: bucket.color,
                    minHeight: bucket.count > 0 ? 4 : 0,
                  }}
                />
              </div>
              <span className="text-xs text-zinc-500">{bucket.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

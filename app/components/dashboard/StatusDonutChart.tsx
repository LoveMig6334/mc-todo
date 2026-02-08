import { StatusStat } from "@/app/lib/dashboardUtils";

interface StatusDonutChartProps {
  data: StatusStat[];
  total: number;
}

const RADIUS = 40;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 50;

export default function StatusDonutChart({
  data,
  total,
}: StatusDonutChartProps) {
  // Build segments with cumulative offsets
  const segments: { color: string; dashArray: string; dashOffset: number }[] =
    [];
  let accumulated = 0;

  for (const stat of data) {
    const fraction = total > 0 ? stat.count / total : 0;
    const segmentLength = fraction * CIRCUMFERENCE;
    const gapLength = CIRCUMFERENCE - segmentLength;
    // offset = rotate to start position (top = -90deg equivalent in dash offset)
    const offset = CIRCUMFERENCE * 0.25 - accumulated;

    segments.push({
      color: stat.color,
      dashArray: `${segmentLength} ${gapLength}`,
      dashOffset: offset,
    });

    accumulated += segmentLength;
  }

  const isEmpty = data.length === 0;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <h3 className="text-sm font-medium text-zinc-400">Status Overview</h3>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {/* Background circle */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#3f3f46"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Data segments */}
            {segments.map((seg, i) => (
              <circle
                key={data[i].status}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-xs text-zinc-500">
              {isEmpty ? "All done" : "active"}
            </span>
          </div>
        </div>

        {/* Legend */}
        {data.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {data.map((stat) => (
              <div
                key={stat.status}
                className="flex items-center gap-1.5 text-xs"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-zinc-400">{stat.label}</span>
                <span className="text-zinc-500">{stat.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

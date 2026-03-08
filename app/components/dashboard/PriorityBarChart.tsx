"use client";

import { springBouncy } from "@/app/lib/animation";
import { PriorityStat } from "@/app/lib/dashboardUtils";
import { motion } from "motion/react";

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
        {data.map((bucket, index) => {
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
                <motion.div
                  className="absolute bottom-0 w-full rounded-t-md"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${pct}%`,
                    minHeight: bucket.count > 0 ? 4 : 0,
                  }}
                  transition={{ ...springBouncy, delay: index * 0.05 }}
                  style={{ backgroundColor: bucket.color }}
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

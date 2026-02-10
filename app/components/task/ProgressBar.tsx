"use client";

import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export default function ProgressBar({
  completed,
  total,
  className,
}: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 p-4",
        className,
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{percentage}%</span>
        <span className="text-xs text-zinc-400">
          {completed}/{total} completed
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #86efac 100%)",
            boxShadow: "0 0 12px rgba(34, 197, 94, 0.4)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Shimmer effect */}
        {percentage > 0 && (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${percentage}%`,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["200% 0%", "-200% 0%"],
            }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        )}
      </div>
    </div>
  );
}

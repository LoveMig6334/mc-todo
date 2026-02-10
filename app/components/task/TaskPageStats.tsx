"use client";

import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

interface StatItem {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface TaskPageStatsProps {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-2xl font-bold"
    >
      {value}
    </motion.span>
  );
}

export default function TaskPageStats({
  total,
  pending,
  completed,
  overdue,
}: TaskPageStatsProps) {
  const stats: StatItem[] = [
    {
      label: "Total",
      value: total,
      color: "text-white",
      bgColor: "bg-zinc-700/50 border-zinc-600",
      icon: (
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
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    {
      label: "Pending",
      value: pending,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: completed,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      icon: (
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
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Overdue",
      value: overdue,
      color: "text-red-400",
      bgColor: "bg-red-500/10 border-red-500/30",
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn(
            "flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm",
            stat.bgColor,
          )}
        >
          <div className={cn("shrink-0", stat.color)}>{stat.icon}</div>
          <div className="min-w-0">
            <AnimatedNumber value={stat.value} />
            <p className="text-xs text-zinc-400">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

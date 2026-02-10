"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

const TIPS = [
  "Start with the hardest task first – eat that frog! 🐸",
  "Break big tasks into smaller subtasks for momentum 🧱",
  "Take a 5-minute break every 25 minutes (Pomodoro) 🍅",
  "Review your priorities at the start of each day 📋",
  "Celebrate small wins – every completed task counts! 🎉",
  "Focus on progress, not perfection ✨",
  "Set deadlines even for soft tasks to stay accountable ⏰",
  "Use categories to keep your work organized 📁",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function GreetingBanner() {
  const greeting = useMemo(() => getGreeting(), []);
  const date = useMemo(() => getFormattedDate(), []);
  const tip = TIPS[new Date().getMinutes() % TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting} 👋</h1>
          <p className="mt-0.5 text-sm text-zinc-400">{date}</p>
        </div>
      </div>
      {tip && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-2">
          <span className="text-xs text-orange-300/80">💡 Tip:</span>
          <span className="text-xs text-zinc-300">{tip}</span>
        </div>
      )}
    </motion.div>
  );
}

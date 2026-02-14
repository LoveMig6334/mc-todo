"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const TIPS = [
  // General productivity tips
  "Start with the hardest task first – eat that frog! 🐸",
  "Break big tasks into smaller subtasks for momentum 🧱",
  "Take a 5-minute break every 25 minutes (Pomodoro) 🍅",
  "Review your priorities at the start of each day 📋",
  "Celebrate small wins – every completed task counts! 🎉",
  "Focus on progress, not perfection ✨",
  "Set deadlines even for soft tasks to stay accountable ⏰",
  "Use categories to keep your work organized 📁",
  // Feature-specific tips
  "Add subtasks to break complex work into actionable steps 📝",
  "Press N to quickly create a new task without leaving the page ⌨️",
  "Use / to jump straight to the search bar and find tasks fast 🔍",
  "Check the Dashboard to visualize your progress with charts 📊",
  "Drag tasks on the Calendar to reschedule them instantly 📅",
  "Set priority levels (0–10) to focus on what matters most 🎯",
  "Completed tasks auto-archive so your list stays clean 🗂️",
  "Switch between Priority and Category views for a fresh perspective 🔄",
  "Add reference links to tasks to keep resources at your fingertips 🔗",
  "Use the Playground to jot down quick notes and checklists 🎨",
  "Color-code your categories for instant visual recognition 🌈",
  "Set due date ranges for tasks that span multiple days 📆",
  "Review upcoming deadlines on the Dashboard to stay ahead ⏳",
  "Press ? anytime to see all available keyboard shortcuts 💡",
  "Restore archived tasks if you need to revisit them later ♻️",
  "Give subtasks their own priority to manage complexity within tasks 🧩",
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

interface ClientData {
  greeting: string;
  date: string;
  tip: string;
}

export default function GreetingBanner() {
  const [clientData, setClientData] = useState<ClientData | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: defer Date-dependent values to client to prevent hydration mismatch
    setClientData({
      greeting: getGreeting(),
      date: getFormattedDate(),
      tip: TIPS[new Date().getMinutes() % TIPS.length],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {clientData ? `${clientData.greeting} 👋` : "\u00A0"}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            {clientData?.date ?? "\u00A0"}
          </p>
        </div>
      </div>
      {clientData?.tip && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-linear-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-2">
          <span className="text-xs text-orange-300/80">💡 Tip:</span>
          <span className="text-xs text-zinc-300">{clientData.tip}</span>
        </div>
      )}
    </motion.div>
  );
}

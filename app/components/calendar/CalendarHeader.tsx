"use client";

import { useState } from "react";
import { MONTHS, THAI_MONTHS } from "@/app/lib/calendarUtils";
import { AnimatePresence, motion } from "motion/react";
import CalendarToolbar, { CalendarTool } from "./CalendarToolbar";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  activeTool: CalendarTool;
  onToolChange: (tool: CalendarTool) => void;
}

export default function CalendarHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onToday,
  activeTool,
  onToolChange,
}: CalendarHeaderProps) {
  const monthName = MONTHS[currentMonth];
  const thaiMonth = THAI_MONTHS[monthName];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <AnimatePresence mode="wait">
          <motion.h2
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="text-xl font-semibold text-white min-w-50 text-center overflow-hidden relative cursor-default"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="inline-flex flex-col overflow-hidden" style={{ height: "1.5em" }}>
              <AnimatePresence mode="wait" initial={false}>
                {isHovered ? (
                  <motion.span
                    key="thai"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {thaiMonth} {currentYear}
                  </motion.span>
                ) : (
                  <motion.span
                    key="english"
                    initial={{ y: "-100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {monthName} {currentYear}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.h2>
        </AnimatePresence>

        <button
          type="button"
          onClick={onNextMonth}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <CalendarToolbar activeTool={activeTool} onToolChange={onToolChange} />
        <button
          type="button"
          onClick={onToday}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}

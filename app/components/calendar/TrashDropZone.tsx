"use client";

import { AnimatePresence, motion } from "motion/react";

interface TrashDropZoneProps {
  isVisible: boolean;
  isActive: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export default function TrashDropZone({
  isVisible,
  isActive,
  onHoverStart,
  onHoverEnd,
}: TrashDropZoneProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          className={`
            fixed bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-6 py-3 rounded-full
            border-2 border-dashed transition-colors cursor-pointer
            ${
              isActive
                ? "bg-red-500/20 border-red-500 text-red-400"
                : "bg-zinc-800/90 border-zinc-600 text-zinc-400 hover:border-red-500/50 hover:text-red-400"
            }
          `}
        >
          {/* Trash Icon */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            animate={{
              scale: isActive ? 1.2 : 1,
              rotate: isActive ? [0, -10, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </motion.svg>

          <span className="text-sm font-medium">
            {isActive ? "Release to delete" : "Drop here to delete"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

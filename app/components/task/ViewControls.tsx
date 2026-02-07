"use client";

import { ViewMode } from "@/app/hooks/useViewPreference";
import { cn } from "@/app/lib/utils";

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export default function ViewControls({
  viewMode,
  onViewChange,
}: ViewControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* List View Button */}
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "rounded-lg p-2 transition-colors",
          viewMode === "list"
            ? "bg-orange-500 text-white"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
        )}
        aria-label="Priority List View"
        title="Priority List View"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      {/* Board View Button */}
      <button
        onClick={() => onViewChange("board")}
        className={cn(
          "rounded-lg p-2 transition-colors",
          viewMode === "board"
            ? "bg-orange-500 text-white"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
        )}
        aria-label="Category Board View"
        title="Category Board View"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-zinc-700" />

      {/* Filter Button (placeholder) */}
      <button
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        aria-label="Filter tasks"
        title="Filter (coming soon)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      {/* Info Button (placeholder) */}
      <button
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        aria-label="View info"
        title="Info (coming soon)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
    </div>
  );
}

"use client";

import { cn } from "@/app/lib/utils";
import { useState } from "react";

const SHORTCUTS = [
  { keys: ["N"], description: "Create new task" },
  { keys: ["/"], description: "Focus search bar" },
  { keys: ["?"], description: "Show this help" },
  { keys: ["Esc"], description: "Close modal" },
];

export default function ShortcutHint() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating ? button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 shadow-lg transition-all hover:border-orange-500 hover:text-orange-400 hover:shadow-orange-500/10"
        aria-label="Keyboard shortcuts"
      >
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
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <path d="M6 8h.001" />
          <path d="M10 8h.001" />
          <path d="M14 8h.001" />
          <path d="M18 8h.001" />
          <path d="M6 12h.001" />
          <path d="M18 12h.001" />
          <path d="M8 16h8" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="animate-in zoom-in-95 fade-in w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-800 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-zinc-400 hover:text-white transition-colors"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5"
                >
                  <span className="text-sm text-zinc-300">
                    {shortcut.description}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className={cn(
                          "inline-flex min-w-[24px] items-center justify-center rounded-md border",
                          "border-zinc-600 bg-zinc-700 px-1.5 py-0.5 text-xs font-mono text-zinc-200",
                        )}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

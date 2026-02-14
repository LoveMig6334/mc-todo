"use client";

import { cn } from "@/app/lib/utils";
import { PlaygroundViewport } from "@/app/types/playground";

interface PlaygroundToolbarProps {
  viewport: PlaygroundViewport;
  onViewportChange: (viewport: PlaygroundViewport) => void;
  onAddNote: () => void;
}

export default function PlaygroundToolbar({
  viewport,
  onViewportChange,
  onAddNote,
}: PlaygroundToolbarProps) {
  const zoomPercent = Math.round(viewport.zoom * 100);

  const handleZoomIn = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.min(2, viewport.zoom + 0.1),
    });
  };

  const handleZoomOut = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.max(0.25, viewport.zoom - 0.1),
    });
  };

  const handleZoomReset = () => {
    onViewportChange({ x: 0, y: 0, zoom: 1 });
  };

  const buttonClass = cn(
    "flex items-center justify-center w-9 h-9 rounded-lg",
    "text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors",
  );

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2 py-1.5 shadow-lg">
      {/* Add Note button */}
      <button
        onClick={onAddNote}
        className={cn(buttonClass, "gap-1.5 w-auto px-3")}
        title="Add Note"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <span className="text-xs font-medium">Note</span>
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-zinc-700 mx-1" />

      {/* Zoom controls */}
      <button onClick={handleZoomOut} className={buttonClass} title="Zoom out">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <button
        onClick={handleZoomReset}
        className="text-xs text-zinc-400 hover:text-white transition-colors w-12 text-center tabular-nums"
        title="Reset zoom"
      >
        {zoomPercent}%
      </button>

      <button onClick={handleZoomIn} className={buttonClass} title="Zoom in">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

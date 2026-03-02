"use client";

import { cn } from "@/app/lib/utils";
import { PlaygroundViewport } from "@/app/types/playground";

interface PlaygroundToolbarProps {
  viewport: PlaygroundViewport;
  onViewportChange: (viewport: PlaygroundViewport) => void;
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddFlowchart: () => void;
  onAddDrawing: () => void;
}

export default function PlaygroundToolbar({
  viewport,
  onViewportChange,
  onAddNote,
  onAddTodo,
  onAddFlowchart,
  onAddDrawing,
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

      {/* Add TODO button */}
      <button
        onClick={onAddTodo}
        className={cn(buttonClass, "gap-1.5 w-auto px-3")}
        title="Add TODO"
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
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <span className="text-xs font-medium">TODO</span>
      </button>

      {/* Add Flowchart button */}
      <button
        onClick={onAddFlowchart}
        className={cn(buttonClass, "gap-1.5 w-auto px-3")}
        title="Add Flowchart"
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
          <rect x="2" y="3" width="8" height="6" rx="1" />
          <rect x="14" y="15" width="8" height="6" rx="1" />
          <path d="M6 9v3a2 2 0 002 2h6a2 2 0 012 2v2" />
        </svg>
        <span className="text-xs font-medium">Flowchart</span>
      </button>

      {/* Add Drawing button */}
      <button
        onClick={onAddDrawing}
        className={cn(buttonClass, "gap-1.5 w-auto px-3")}
        title="Add Drawing"
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
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        <span className="text-xs font-medium">Draw</span>
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

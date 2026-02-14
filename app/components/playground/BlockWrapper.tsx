"use client";

import { cn } from "@/app/lib/utils";
import { PlaygroundBlock } from "@/app/types/playground";
import { useCallback, useRef } from "react";

interface BlockWrapperProps {
  block: PlaygroundBlock;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  zoom: number;
  children: React.ReactNode;
}

const MIN_WIDTH = 160;
const MIN_HEIGHT = 120;

export default function BlockWrapper({
  block,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onDelete,
  onBringToFront,
  zoom,
  children,
}: BlockWrapperProps) {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
      e.stopPropagation();
      onSelect(block.id);
      onBringToFront(block.id);

      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialPos.current = { ...block.position };

      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
    },
    [block.id, block.position, onSelect, onBringToFront],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) {
        const dx = (e.clientX - dragStart.current.x) / zoom;
        const dy = (e.clientY - dragStart.current.y) / zoom;
        onMove(block.id, {
          x: initialPos.current.x + dx,
          y: initialPos.current.y + dy,
        });
      }
      if (isResizing.current) {
        const dx = (e.clientX - dragStart.current.x) / zoom;
        const dy = (e.clientY - dragStart.current.y) / zoom;
        onResize(block.id, {
          width: Math.max(MIN_WIDTH, initialSize.current.width + dx),
          height: Math.max(MIN_HEIGHT, initialSize.current.height + dy),
        });
      }
    },
    [block.id, zoom, onMove, onResize],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  const handleResizeDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect(block.id);
      isResizing.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      initialSize.current = { ...block.size };

      const el = e.currentTarget.parentElement as HTMLElement;
      el.setPointerCapture(e.pointerId);
    },
    [block.id, block.size, onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const tag = (e.target as HTMLElement).tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          (e.target as HTMLElement).isContentEditable
        )
          return;
        onDelete(block.id);
      }
    },
    [block.id, onDelete],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "absolute rounded-xl border transition-shadow duration-150 outline-none",
        isSelected
          ? "border-orange-500 shadow-lg shadow-orange-500/10"
          : "border-zinc-700 hover:border-zinc-600",
      )}
      style={{
        left: block.position.x,
        top: block.position.y,
        width: block.size.width,
        height: block.size.height,
        zIndex: block.zIndex,
        backgroundColor: block.data.color || "#27272a",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {children}

      {/* Delete button */}
      {isSelected && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Resize handle */}
      <div
        data-resize-handle
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onPointerDown={handleResizeDown}
      >
        <svg
          className="absolute bottom-1 right-1 text-zinc-500"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="6" cy="2" r="1.5" />
          <circle cx="2" cy="6" r="1.5" />
        </svg>
      </div>
    </div>
  );
}

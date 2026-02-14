"use client";

import {
  BlockData,
  FlowchartBlockData,
  NoteBlockData,
  PlaygroundBlock,
  PlaygroundViewport,
  TodoBlockData,
} from "@/app/types/playground";
import { useCallback, useRef } from "react";
import BlockWrapper from "./BlockWrapper";
import FlowchartBlock from "./FlowchartBlock";
import NoteBlock from "./NoteBlock";
import TodoListBlock from "./TodoListBlock";

interface PlaygroundCanvasProps {
  blocks: PlaygroundBlock[];
  viewport: PlaygroundViewport;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onMoveBlock: (id: string, position: { x: number; y: number }) => void;
  onResizeBlock: (id: string, size: { width: number; height: number }) => void;
  onDeleteBlock: (id: string) => void;
  onUpdateBlock: (id: string, data: Partial<BlockData>) => void;
  onBringToFront: (id: string) => void;
  onViewportChange: (viewport: PlaygroundViewport) => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export default function PlaygroundCanvas({
  blocks,
  viewport,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onResizeBlock,
  onDeleteBlock,
  onUpdateBlock,
  onBringToFront,
  onViewportChange,
}: PlaygroundCanvasProps) {
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const initialViewport = useRef({ x: 0, y: 0 });

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only pan on direct canvas click (not on blocks)
      if (e.target !== e.currentTarget) return;
      onSelectBlock(null);

      // Middle mouse or left mouse on canvas background
      if (e.button === 1 || e.button === 0) {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        initialViewport.current = { x: viewport.x, y: viewport.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    },
    [viewport.x, viewport.y, onSelectBlock],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      onViewportChange({
        ...viewport,
        x: initialViewport.current.x + dx,
        y: initialViewport.current.y + dy,
      });
    },
    [viewport, onViewportChange],
  );

  const handleCanvasPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        const newZoom = Math.min(
          ZOOM_MAX,
          Math.max(ZOOM_MIN, viewport.zoom + delta),
        );

        // Zoom toward cursor position
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const scaleChange = newZoom / viewport.zoom;
        onViewportChange({
          zoom: newZoom,
          x: cursorX - (cursorX - viewport.x) * scaleChange,
          y: cursorY - (cursorY - viewport.y) * scaleChange,
        });
      } else {
        // Regular scroll = pan
        onViewportChange({
          ...viewport,
          x: viewport.x - e.deltaX,
          y: viewport.y - e.deltaY,
        });
      }
    },
    [viewport, onViewportChange],
  );

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-zinc-900 cursor-grab active:cursor-grabbing"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* Transform container */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={onSelectBlock}
            onMove={onMoveBlock}
            onResize={onResizeBlock}
            onDelete={onDeleteBlock}
            onBringToFront={onBringToFront}
            zoom={viewport.zoom}
          >
            {block.type === "note" && (
              <NoteBlock
                data={block.data as NoteBlockData}
                isSelected={selectedBlockId === block.id}
                onUpdate={(data) => onUpdateBlock(block.id, data)}
              />
            )}
            {block.type === "todo" && (
              <TodoListBlock
                data={block.data as TodoBlockData}
                isSelected={selectedBlockId === block.id}
                onUpdate={(data) => onUpdateBlock(block.id, data)}
              />
            )}
            {block.type === "flowchart" && (
              <FlowchartBlock
                data={block.data as FlowchartBlockData}
                isSelected={selectedBlockId === block.id}
                onUpdate={(data) => onUpdateBlock(block.id, data)}
                blockSize={block.size}
              />
            )}
          </BlockWrapper>
        ))}
      </div>
    </div>
  );
}

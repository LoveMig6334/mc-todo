"use client";

import PlaygroundCanvas from "@/app/components/playground/PlaygroundCanvas";
import PlaygroundToolbar from "@/app/components/playground/PlaygroundToolbar";
import FloatingNav from "@/app/components/layout/FloatingNav";
import { usePlayground } from "@/app/hooks/usePlayground";
import { useTaskManager } from "@/app/hooks/useTaskManager";
import { NoteBlockData } from "@/app/types/playground";
import Link from "next/link";
import { use, useCallback, useState } from "react";

interface PlaygroundPageProps {
  params: Promise<{ taskId: string }>;
}

export default function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { taskId } = use(params);
  const { getTaskById } = useTaskManager();
  const task = getTaskById(taskId);

  const {
    blocks,
    viewport,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    resizeBlock,
    bringToFront,
    setViewport,
  } = usePlayground(taskId);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleAddNote = useCallback(() => {
    // Place new note near center of current viewport
    const centerX = (-viewport.x + 400) / viewport.zoom;
    const centerY = (-viewport.y + 300) / viewport.zoom;
    const id = addBlock("note", { x: centerX, y: centerY });
    setSelectedBlockId(id);
  }, [viewport, addBlock]);

  const handleUpdateBlock = useCallback(
    (id: string, data: Partial<NoteBlockData>) => {
      updateBlock(id, data);
    },
    [updateBlock],
  );

  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <FloatingNav currentPath="" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Task Not Found
          </h1>
          <p className="text-zinc-400 mb-6">
            The task you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <FloatingNav currentPath="" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-2 border-b border-zinc-800">
        <Link
          href="/"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-zinc-500 uppercase tracking-wider shrink-0">
            Playground
          </span>
          <span className="text-zinc-600">/</span>
          <h1 className="text-sm font-medium text-white truncate">
            {task.title}
          </h1>
        </div>
        <div className="ml-auto text-xs text-zinc-500">
          {blocks.length} block{blocks.length !== 1 && "s"}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <PlaygroundCanvas
          blocks={blocks}
          viewport={viewport}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onMoveBlock={moveBlock}
          onResizeBlock={resizeBlock}
          onDeleteBlock={deleteBlock}
          onUpdateBlock={handleUpdateBlock}
          onBringToFront={bringToFront}
          onViewportChange={setViewport}
        />
        <PlaygroundToolbar
          viewport={viewport}
          onViewportChange={setViewport}
          onAddNote={handleAddNote}
        />
      </div>
    </div>
  );
}

"use client";

import { MousePointer2, Plus, Scissors, PaintBucket } from "lucide-react";
import { cn } from "@/app/lib/utils";

export type CalendarTool = "normal" | "add" | "trim" | "color";

interface CalendarToolbarProps {
  activeTool: CalendarTool;
  onToolChange: (tool: CalendarTool) => void;
}

const TOOLS: { id: CalendarTool; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "normal", label: "Normal", Icon: MousePointer2 },
  { id: "add", label: "Add Task", Icon: Plus },
  { id: "trim", label: "Trim & Move", Icon: Scissors },
  { id: "color", label: "Color", Icon: PaintBucket },
];

export default function CalendarToolbar({ activeTool, onToolChange }: CalendarToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onToolChange(id)}
          title={label}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            activeTool === id
              ? "border-orange-500 bg-orange-500/20 text-orange-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
          )}
        >
          <Icon size={13} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

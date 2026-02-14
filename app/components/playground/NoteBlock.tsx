"use client";

import { NoteBlockData } from "@/app/types/playground";
import { useCallback } from "react";

const NOTE_COLORS = [
  { hex: "#27272a", label: "Zinc" },
  { hex: "#1e3a5f", label: "Blue" },
  { hex: "#3b1f2b", label: "Rose" },
  { hex: "#1a3324", label: "Green" },
  { hex: "#3d2b1a", label: "Amber" },
  { hex: "#2d1b4e", label: "Purple" },
];

interface NoteBlockProps {
  data: NoteBlockData;
  isSelected: boolean;
  onUpdate: (data: Partial<NoteBlockData>) => void;
}

export default function NoteBlock({
  data,
  isSelected,
  onUpdate,
}: NoteBlockProps) {
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ title: e.target.value });
    },
    [onUpdate],
  );

  const handleBodyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ body: e.target.value });
    },
    [onUpdate],
  );

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <input
        type="text"
        value={data.title}
        onChange={handleTitleChange}
        placeholder="Title"
        className="bg-transparent text-white text-sm font-semibold outline-none placeholder:text-zinc-500 w-full"
        onPointerDown={(e) => e.stopPropagation()}
      />
      <textarea
        value={data.body}
        onChange={handleBodyChange}
        placeholder="Write something..."
        className="bg-transparent text-zinc-300 text-sm outline-none placeholder:text-zinc-600 flex-1 resize-none w-full"
        onPointerDown={(e) => e.stopPropagation()}
      />
      {isSelected && (
        <div className="flex gap-1.5 pt-1 border-t border-white/10">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdate({ color: c.hex })}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor:
                  data.color === c.hex
                    ? "rgb(249, 115, 22)"
                    : "rgba(255,255,255,0.15)",
              }}
              title={c.label}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { NoteBlockData } from "@/app/types/playground";
import { useCallback, useEffect, useRef } from "react";

const NOTE_COLORS = [
  { hex: "#27272a", label: "Zinc" },
  { hex: "#1e3a5f", label: "Blue" },
  { hex: "#3b1f2b", label: "Rose" },
  { hex: "#1a3324", label: "Green" },
  { hex: "#3d2b1a", label: "Amber" },
  { hex: "#2d1b4e", label: "Purple" },
];

interface FormatButton {
  command: string;
  label: string;
  icon: string;
  title: string;
}

const FORMAT_BUTTONS: FormatButton[] = [
  { command: "bold", label: "B", icon: "bold", title: "Bold (Ctrl+B)" },
  { command: "italic", label: "I", icon: "italic", title: "Italic (Ctrl+I)" },
  {
    command: "insertUnorderedList",
    label: "•",
    icon: "ul",
    title: "Bullet list",
  },
  {
    command: "insertOrderedList",
    label: "1.",
    icon: "ol",
    title: "Ordered list",
  },
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const isInternalEdit = useRef(false);

  // Only set innerHTML on mount or when body changes externally
  useEffect(() => {
    if (bodyRef.current && !isInternalEdit.current) {
      bodyRef.current.innerHTML = data.body;
    }
    isInternalEdit.current = false;
  }, [data.body]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ title: e.target.value });
    },
    [onUpdate],
  );

  const handleBodyInput = useCallback(() => {
    if (bodyRef.current) {
      isInternalEdit.current = true;
      onUpdate({ body: bodyRef.current.innerHTML });
    }
  }, [onUpdate]);

  const handleFormat = useCallback((command: string) => {
    document.execCommand(command, false);
    // Refocus the editor after toolbar click
    bodyRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        handleFormat("bold");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        handleFormat("italic");
      }
    },
    [handleFormat],
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

      {/* Formatting toolbar */}
      {isSelected && (
        <div className="flex gap-0.5 shrink-0" data-testid="formatting-toolbar">
          {FORMAT_BUTTONS.map((btn) => (
            <button
              key={btn.command}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleFormat(btn.command);
              }}
              className="w-7 h-7 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center text-xs font-semibold"
              title={btn.title}
              style={
                btn.command === "italic" ? { fontStyle: "italic" } : undefined
              }
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Rich text body */}
      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleBodyInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Write something..."
        className="bg-transparent text-zinc-300 text-sm outline-none flex-1 overflow-y-auto w-full note-block-body"
        onPointerDown={(e) => e.stopPropagation()}
      />

      {/* Color picker */}
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

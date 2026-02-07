"use client";

import { cn } from "@/app/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

// --- Text Cell ---

interface InlineTextCellProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function InlineTextCell({
  value,
  onSave,
  className,
  placeholder = "—",
}: InlineTextCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
  }, [draft, value, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  if (!editing) {
    return (
      <span
        className={cn("cursor-pointer rounded px-1 -mx-1 hover:bg-zinc-700/50 transition-colors", className)}
        onDoubleClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Double-click to edit"
      >
        {value || placeholder}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
      }}
      className="w-full rounded border border-orange-500/50 bg-zinc-800 px-1.5 py-0.5 text-sm text-white outline-none focus:border-orange-500"
    />
  );
}

// --- Select Cell ---

interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface InlineSelectCellProps {
  value: string;
  options: SelectOption[];
  onSave: (value: string) => void;
  renderDisplay: (value: string) => React.ReactNode;
}

export function InlineSelectCell({
  value,
  options,
  onSave,
  renderDisplay,
}: InlineSelectCellProps) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) {
      selectRef.current?.focus();
    }
  }, [editing]);

  const commit = useCallback(
    (newValue: string) => {
      setEditing(false);
      if (newValue !== value) {
        onSave(newValue);
      }
    },
    [value, onSave],
  );

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 -mx-1 hover:bg-zinc-700/50 transition-colors inline-flex"
        onDoubleClick={() => setEditing(true)}
        title="Double-click to edit"
      >
        {renderDisplay(value)}
      </span>
    );
  }

  return (
    <select
      ref={selectRef}
      value={value}
      onChange={(e) => commit(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-full rounded border border-orange-500/50 bg-zinc-800 px-1 py-0.5 text-xs text-white outline-none focus:border-orange-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// --- Number Cell ---

interface InlineNumberCellProps {
  value: number;
  min?: number;
  max?: number;
  onSave: (value: number) => void;
  renderDisplay: (value: number) => React.ReactNode;
}

export function InlineNumberCell({
  value,
  min = 0,
  max = 10,
  onSave,
  renderDisplay,
}: InlineNumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max && parsed !== value) {
      onSave(parsed);
    } else {
      setDraft(String(value));
    }
  }, [draft, value, min, max, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(String(value));
  }, [value]);

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 -mx-1 hover:bg-zinc-700/50 transition-colors inline-flex"
        onDoubleClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        title="Double-click to edit"
      >
        {renderDisplay(value)}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      min={min}
      max={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
      }}
      className="w-16 rounded border border-orange-500/50 bg-zinc-800 px-1.5 py-0.5 text-sm text-white text-center outline-none focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

// --- Date Cell ---

interface InlineDateCellProps {
  value: string; // ISO date string YYYY-MM-DD
  onSave: (value: string) => void;
  renderDisplay: () => React.ReactNode;
}

export function InlineDateCell({
  value,
  onSave,
  renderDisplay,
}: InlineDateCellProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const commit = useCallback(
    (newValue: string) => {
      setEditing(false);
      if (newValue && newValue !== value) {
        onSave(newValue);
      }
    },
    [value, onSave],
  );

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 -mx-1 hover:bg-zinc-700/50 transition-colors inline-flex items-center gap-1.5"
        onDoubleClick={() => setEditing(true)}
        title="Double-click to edit"
      >
        {renderDisplay()}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="date"
      defaultValue={value}
      onChange={(e) => commit(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setEditing(false);
      }}
      className="w-full rounded border border-orange-500/50 bg-zinc-800 px-1.5 py-0.5 text-xs text-white outline-none focus:border-orange-500 [color-scheme:dark]"
    />
  );
}

// --- Link Cell ---

interface InlineLinkCellProps {
  value: string;
  onSave: (value: string) => void;
  renderDisplay: () => React.ReactNode;
}

export function InlineLinkCell({
  value,
  onSave,
  renderDisplay,
}: InlineLinkCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
  }, [draft, value, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  if (!editing) {
    return (
      <span
        className="cursor-pointer rounded px-1 -mx-1 hover:bg-zinc-700/50 transition-colors inline-flex"
        onDoubleClick={(e) => {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }}
        title="Double-click to edit"
      >
        {renderDisplay()}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="url"
      value={draft}
      placeholder="https://..."
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
      }}
      className="w-full rounded border border-orange-500/50 bg-zinc-800 px-1.5 py-0.5 text-xs text-white outline-none focus:border-orange-500"
    />
  );
}

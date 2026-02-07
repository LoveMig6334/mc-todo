"use client";

import { useLocalStorage } from "./useLocalStorage";

export type ViewMode = "list" | "board";

export function useViewPreference() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    "mc-todo-view-mode",
    "list",
  );

  return { viewMode, setViewMode };
}

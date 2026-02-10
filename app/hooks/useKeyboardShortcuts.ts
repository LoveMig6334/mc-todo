"use client";

import { useEffect } from "react";

interface ShortcutActions {
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onShowHelp,
}: ShortcutActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          onNewTask?.();
          break;
        case "/":
          e.preventDefault();
          onFocusSearch?.();
          break;
        case "?":
          e.preventDefault();
          onShowHelp?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewTask, onFocusSearch, onShowHelp]);
}

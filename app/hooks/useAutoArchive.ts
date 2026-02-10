"use client";

import { isArchiveEligible } from "@/app/lib/utils";
import { Task } from "@/app/types/task";
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

const ARCHIVE_THRESHOLD_KEY = "mc-todo-archive-threshold";
const DEFAULT_THRESHOLD_DAYS = 7;
const CHECK_INTERVAL_MS = 60_000; // 1 minute

export function useAutoArchive(
  tasks: Task[],
  archiveTask: (id: string) => void,
) {
  const [archiveThreshold, setArchiveThreshold] = useLocalStorage<number>(
    ARCHIVE_THRESHOLD_KEY,
    DEFAULT_THRESHOLD_DAYS,
  );

  const runAutoArchive = useCallback(() => {
    for (const task of tasks) {
      if (isArchiveEligible(task, archiveThreshold)) {
        archiveTask(task.id);
      }
    }
  }, [tasks, archiveThreshold, archiveTask]);

  // Run on mount and when tasks/threshold change
  useEffect(() => {
    runAutoArchive();
  }, [runAutoArchive]);

  // Run periodically
  useEffect(() => {
    const interval = setInterval(runAutoArchive, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runAutoArchive]);

  return { archiveThreshold, setArchiveThreshold };
}

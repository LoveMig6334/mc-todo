import {
  computeNewDueDate,
  computeResizePreviewDates,
  useEventResize,
} from "@/app/hooks/useEventResize";
import { ResizeState } from "@/app/types/calendar";
import { Task } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

describe("useEventResize", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "Test Task",
    details: "",
    categoryId: "cat-1",
    priority: 3,
    status: "pending",
    dueDate: { start: "2024-01-15", end: "2024-01-20" },
    referenceLinks: [],
    subtasks: [],
    completed: false,
    completedAt: null,
    archived: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const createMocks = () => ({
    updateTask: jest.fn(),
    getTaskById: jest.fn().mockReturnValue(mockTask),
  });

  describe("startResize", () => {
    it("sets resize state with task id, edge, and date", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      expect(result.current.resizeState).toBeNull();
      expect(result.current.isResizing).toBe(false);

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      expect(result.current.resizeState).toEqual({
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-20",
        currentDateStr: "2024-01-20",
      });
      expect(result.current.isResizing).toBe(true);
    });
  });

  describe("updateResize", () => {
    it("updates currentDateStr while resizing", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      act(() => {
        result.current.updateResize("2024-01-25");
      });

      expect(result.current.resizeState?.currentDateStr).toBe("2024-01-25");
      expect(result.current.resizeState?.originalDateStr).toBe("2024-01-20");
    });

    it("does nothing when not resizing", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.updateResize("2024-01-25");
      });

      expect(result.current.resizeState).toBeNull();
    });
  });

  describe("endResize", () => {
    it("resets resize state to null", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      act(() => {
        result.current.endResize();
      });

      expect(result.current.resizeState).toBeNull();
      expect(result.current.isResizing).toBe(false);
    });

    it("calls updateTask after render when date changed", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      act(() => {
        result.current.updateResize("2024-01-25");
      });

      // updateTask should NOT be called yet (during render)
      expect(mocks.updateTask).not.toHaveBeenCalled();

      act(() => {
        result.current.endResize();
      });

      // Now updateTask should be called (after render, via useEffect)
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        dueDate: { start: "2024-01-15", end: "2024-01-25" },
      });
    });

    it("does not call updateTask when date unchanged", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      // No updateResize call - date stays the same

      act(() => {
        result.current.endResize();
      });

      expect(mocks.updateTask).not.toHaveBeenCalled();
    });

    it("does nothing when not resizing", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.endResize();
      });

      expect(mocks.updateTask).not.toHaveBeenCalled();
      expect(result.current.resizeState).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("makes single-day task when start is dragged past end", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "start", "2024-01-15");
      });

      act(() => {
        // Drag start to after the end date
        result.current.updateResize("2024-01-25");
      });

      act(() => {
        result.current.endResize();
      });

      // When start goes past end, it becomes a single-day task at the new start date
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        dueDate: { start: "2024-01-25", end: null },
      });
    });

    it("sets end to null when resizing makes start equal end", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventResize(mocks));

      act(() => {
        result.current.startResize("task-1", "end", "2024-01-20");
      });

      act(() => {
        // Drag end to match start
        result.current.updateResize("2024-01-15");
      });

      act(() => {
        result.current.endResize();
      });

      // Should become single-day task
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        dueDate: { start: "2024-01-15", end: null },
      });
    });
  });
});

describe("computeNewDueDate", () => {
  const mockMultiDayTask: Task = {
    id: "task-1",
    title: "Multi-Day Task",
    details: "",
    categoryId: "cat-1",
    priority: 3,
    status: "pending",
    dueDate: { start: "2024-01-15", end: "2024-01-20" },
    referenceLinks: [],
    subtasks: [],
    completed: false,
    completedAt: null,
    archived: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockSingleDayTask: Task = {
    ...mockMultiDayTask,
    id: "task-2",
    dueDate: { start: "2024-01-15", end: null },
  };

  describe("resizing end edge", () => {
    it("extends end date forward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-20",
        currentDateStr: "2024-01-25",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-15", end: "2024-01-25" });
    });

    it("contracts end date backward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-20",
        currentDateStr: "2024-01-17",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-15", end: "2024-01-17" });
    });

    it("swaps start and end when end crosses before start", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-20",
        currentDateStr: "2024-01-10",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-10", end: "2024-01-15" });
    });

    it("makes single-day when end equals start", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-20",
        currentDateStr: "2024-01-15",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-15", end: null });
    });

    it("adds end date to single-day task", () => {
      const state: ResizeState = {
        taskId: "task-2",
        edge: "end",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-20",
      };

      const result = computeNewDueDate(mockSingleDayTask, state);
      expect(result).toEqual({ start: "2024-01-15", end: "2024-01-20" });
    });
  });

  describe("resizing start edge", () => {
    it("extends start date backward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-10",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-10", end: "2024-01-20" });
    });

    it("contracts start date forward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-18",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-18", end: "2024-01-20" });
    });

    it("clamps end when start moves past end", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-25",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-25", end: null });
    });

    it("makes single-day when start equals end", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-20",
      };

      const result = computeNewDueDate(mockMultiDayTask, state);
      expect(result).toEqual({ start: "2024-01-20", end: null });
    });
  });
});

describe("computeResizePreviewDates", () => {
  const mockMultiDayTask: Task = {
    id: "task-1",
    title: "Multi-Day Task",
    details: "",
    categoryId: "cat-1",
    priority: 3,
    status: "pending",
    dueDate: { start: "2024-01-15", end: "2024-01-18" },
    referenceLinks: [],
    subtasks: [],
    completed: false,
    completedAt: null,
    archived: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockSingleDayTask: Task = {
    ...mockMultiDayTask,
    id: "task-2",
    dueDate: { start: "2024-01-15", end: null },
  };

  describe("resizing end edge", () => {
    it("returns extended date range when extending end forward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-18",
        currentDateStr: "2024-01-22",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual([
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
        "2024-01-19",
        "2024-01-20",
        "2024-01-21",
        "2024-01-22",
      ]);
    });

    it("returns contracted date range when contracting end backward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-18",
        currentDateStr: "2024-01-16",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual(["2024-01-15", "2024-01-16"]);
    });

    it("returns single date when end equals start", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-18",
        currentDateStr: "2024-01-15",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual(["2024-01-15"]);
    });
  });

  describe("resizing start edge", () => {
    it("returns extended date range when extending start backward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-12",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual([
        "2024-01-12",
        "2024-01-13",
        "2024-01-14",
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
      ]);
    });

    it("returns contracted date range when contracting start forward", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-17",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual(["2024-01-17", "2024-01-18"]);
    });

    it("returns single date when start equals end", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-18",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual(["2024-01-18"]);
    });
  });

  describe("single-day task", () => {
    it("returns single date for unchanged single-day task", () => {
      const state: ResizeState = {
        taskId: "task-2",
        edge: "end",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-15",
      };

      const dates = computeResizePreviewDates(mockSingleDayTask, state);
      expect(dates).toEqual(["2024-01-15"]);
    });

    it("returns date range when extending single-day task end", () => {
      const state: ResizeState = {
        taskId: "task-2",
        edge: "end",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-18",
      };

      const dates = computeResizePreviewDates(mockSingleDayTask, state);
      expect(dates).toEqual([
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
      ]);
    });
  });

  describe("edge crossing", () => {
    it("handles end crossing before start (swaps dates)", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "end",
        originalDateStr: "2024-01-18",
        currentDateStr: "2024-01-10",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual([
        "2024-01-10",
        "2024-01-11",
        "2024-01-12",
        "2024-01-13",
        "2024-01-14",
        "2024-01-15",
      ]);
    });

    it("handles start crossing past end (clamps to single day)", () => {
      const state: ResizeState = {
        taskId: "task-1",
        edge: "start",
        originalDateStr: "2024-01-15",
        currentDateStr: "2024-01-25",
      };

      const dates = computeResizePreviewDates(mockMultiDayTask, state);
      expect(dates).toEqual(["2024-01-25"]);
    });
  });
});

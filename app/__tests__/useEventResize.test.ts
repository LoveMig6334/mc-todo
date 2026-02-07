import { useEventResize } from "@/app/hooks/useEventResize";
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
    completed: false,
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

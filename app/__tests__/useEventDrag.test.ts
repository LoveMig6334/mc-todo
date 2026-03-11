import { computePreviewDates, useEventDrag } from "@/app/hooks/useEventDrag";
import { Task } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

describe("useEventDrag", () => {
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

  const mockSingleDayTask: Task = {
    ...mockTask,
    id: "task-2",
    dueDate: { start: "2024-01-15", end: null },
  };

  const createMocks = (task: Task = mockTask) => ({
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    getTaskById: jest.fn().mockReturnValue(task),
  });

  describe("startDrag", () => {
    it("sets drag state with task id and original date", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      expect(result.current.dragState).toBeNull();
      expect(result.current.isDragging).toBe(false);

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      expect(result.current.dragState).toEqual({
        taskId: "task-1",
        originalDate: "2024-01-15",
        currentDate: "2024-01-15",
        offsetDays: 0,
        isOverTrash: false,
      });
      expect(result.current.isDragging).toBe(true);
    });
  });

  describe("updateDrag", () => {
    it("updates currentDate and calculates offsetDays", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-18");
      });

      expect(result.current.dragState?.currentDate).toBe("2024-01-18");
      expect(result.current.dragState?.offsetDays).toBe(3);
      expect(result.current.dragState?.isOverTrash).toBe(false);
    });

    it("calculates negative offset for backward drag", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-10");
      });

      expect(result.current.dragState?.currentDate).toBe("2024-01-10");
      expect(result.current.dragState?.offsetDays).toBe(-5);
    });

    it("does nothing when not dragging", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.updateDrag("2024-01-18");
      });

      expect(result.current.dragState).toBeNull();
    });
  });

  describe("setOverTrash", () => {
    it("sets isOverTrash to true", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.setOverTrash(true);
      });

      expect(result.current.dragState?.isOverTrash).toBe(true);
    });

    it("sets isOverTrash to false", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.setOverTrash(true);
      });

      act(() => {
        result.current.setOverTrash(false);
      });

      expect(result.current.dragState?.isOverTrash).toBe(false);
    });

    it("does nothing when not dragging", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.setOverTrash(true);
      });

      expect(result.current.dragState).toBeNull();
    });
  });

  describe("endDrag", () => {
    it("resets drag state to null", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.dragState).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });

    it("calls updateTask after render when date changed (multi-day task)", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-18"); // +3 days
      });

      // updateTask should NOT be called yet (during render)
      expect(mocks.updateTask).not.toHaveBeenCalled();

      act(() => {
        result.current.endDrag();
      });

      // Now updateTask should be called (after render, via useEffect)
      // Original: start 2024-01-15, end 2024-01-20
      // Shifted +3 days: start 2024-01-18, end 2024-01-23
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        dueDate: { start: "2024-01-18", end: "2024-01-23" },
      });
    });

    it("calls updateTask for single-day task (keeps end as null)", () => {
      const mocks = createMocks(mockSingleDayTask);
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-2", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-20"); // +5 days
      });

      act(() => {
        result.current.endDrag();
      });

      expect(mocks.updateTask).toHaveBeenCalledWith("task-2", {
        dueDate: { start: "2024-01-20", end: null },
      });
    });

    it("does not call updateTask when date unchanged", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      // No updateDrag call - date stays the same

      act(() => {
        result.current.endDrag();
      });

      expect(mocks.updateTask).not.toHaveBeenCalled();
    });

    it("does nothing when not dragging", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.endDrag();
      });

      expect(mocks.updateTask).not.toHaveBeenCalled();
      expect(result.current.dragState).toBeNull();
    });

    it("calls deleteTask when dropped on trash", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.setOverTrash(true);
      });

      act(() => {
        result.current.endDrag();
      });

      expect(mocks.deleteTask).toHaveBeenCalledWith("task-1");
      expect(mocks.updateTask).not.toHaveBeenCalled();
    });

    it("does not call deleteTask when not over trash", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-18");
      });

      act(() => {
        result.current.endDrag();
      });

      expect(mocks.deleteTask).not.toHaveBeenCalled();
      expect(mocks.updateTask).toHaveBeenCalled();
    });
  });

  describe("backward drag", () => {
    it("correctly shifts dates backward", () => {
      const mocks = createMocks();
      const { result } = renderHook(() => useEventDrag(mocks));

      act(() => {
        result.current.startDrag("task-1", "2024-01-15");
      });

      act(() => {
        result.current.updateDrag("2024-01-10"); // -5 days
      });

      act(() => {
        result.current.endDrag();
      });

      // Original: start 2024-01-15, end 2024-01-20
      // Shifted -5 days: start 2024-01-10, end 2024-01-15
      expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
        dueDate: { start: "2024-01-10", end: "2024-01-15" },
      });
    });
  });
});

describe("computePreviewDates", () => {
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

  it("returns single date for single-day task", () => {
    const dates = computePreviewDates(mockSingleDayTask, 3);
    expect(dates).toEqual(["2024-01-18"]);
  });

  it("returns correct date range for multi-day task", () => {
    const dates = computePreviewDates(mockMultiDayTask, 0);
    expect(dates).toEqual([
      "2024-01-15",
      "2024-01-16",
      "2024-01-17",
      "2024-01-18",
    ]);
  });

  it("shifts dates forward with positive offset", () => {
    const dates = computePreviewDates(mockMultiDayTask, 5);
    expect(dates).toEqual([
      "2024-01-20",
      "2024-01-21",
      "2024-01-22",
      "2024-01-23",
    ]);
  });

  it("shifts dates backward with negative offset", () => {
    const dates = computePreviewDates(mockMultiDayTask, -5);
    expect(dates).toEqual([
      "2024-01-10",
      "2024-01-11",
      "2024-01-12",
      "2024-01-13",
    ]);
  });

  it("handles month boundary correctly", () => {
    const task: Task = {
      ...mockSingleDayTask,
      dueDate: { start: "2024-01-30", end: null },
    };
    const dates = computePreviewDates(task, 5);
    expect(dates).toEqual(["2024-02-04"]);
  });
});

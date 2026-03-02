/**
 * Tests for project-based constraints on calendar drag and resize operations.
 */
import { useEventDrag } from "@/app/hooks/useEventDrag";
import { useEventResize } from "@/app/hooks/useEventResize";
import { Project, Task } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

const mockProject: Project = {
  id: "proj-1",
  title: "Sprint",
  description: "",
  color: "#f97316",
  dueDate: { start: "2024-01-10", end: "2024-01-20" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const taskInsideProject: Task = {
  id: "task-1",
  title: "Project Task",
  details: "",
  categoryId: "cat-1",
  priority: 3,
  status: "pending",
  dueDate: { start: "2024-01-12", end: "2024-01-14" },
  referenceLinks: [],
  completed: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  projectId: "proj-1",
};

const standaloneTask: Task = {
  ...taskInsideProject,
  id: "task-2",
  title: "Standalone Task",
  projectId: undefined,
};

// ─── useEventDrag constraints ────────────────────────────────────────────────

describe("useEventDrag — project constraints", () => {
  const createMocks = (task: Task = taskInsideProject) => ({
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    getTaskById: jest.fn().mockReturnValue(task),
    getProjectById: jest.fn().mockReturnValue(mockProject),
  });

  it("allows a move that stays within project bounds", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventDrag(mocks));

    act(() => {
      result.current.startDrag("task-1", "2024-01-12");
    });
    act(() => {
      result.current.updateDrag("2024-01-13"); // +1 day — still within 01-10…01-20
    });
    act(() => {
      result.current.endDrag();
    });

    expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
      dueDate: { start: "2024-01-13", end: "2024-01-15" },
    });
  });

  it("blocks a move that would push the task past the project end", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventDrag(mocks));

    act(() => {
      result.current.startDrag("task-1", "2024-01-12");
    });
    act(() => {
      // Shift +8 days: task would become 01-20…01-22, but project ends 01-20
      result.current.updateDrag("2024-01-20");
    });
    act(() => {
      result.current.endDrag();
    });

    // Task end (01-22) > project end (01-20) → rejected
    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(result.current.dragState).toBeNull();
  });

  it("blocks a move that would push the task before the project start", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventDrag(mocks));

    act(() => {
      result.current.startDrag("task-1", "2024-01-12");
    });
    act(() => {
      // Shift -5 days: task would start 01-07, before project start 01-10
      result.current.updateDrag("2024-01-07");
    });
    act(() => {
      result.current.endDrag();
    });

    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(result.current.dragState).toBeNull();
  });

  it("does not constrain standalone tasks (no projectId)", () => {
    const mocks = {
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      getTaskById: jest.fn().mockReturnValue(standaloneTask),
      getProjectById: jest.fn().mockReturnValue(mockProject),
    };
    const { result } = renderHook(() => useEventDrag(mocks));

    act(() => {
      result.current.startDrag("task-2", "2024-01-12");
    });
    act(() => {
      // Way outside project — should be allowed for standalone task
      result.current.updateDrag("2024-02-01");
    });
    act(() => {
      result.current.endDrag();
    });

    expect(mocks.updateTask).toHaveBeenCalled();
  });

  it("allows the move when getProjectById is not provided", () => {
    const mocks = {
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      getTaskById: jest.fn().mockReturnValue(taskInsideProject),
      // no getProjectById
    };
    const { result } = renderHook(() => useEventDrag(mocks));

    act(() => {
      result.current.startDrag("task-1", "2024-01-12");
    });
    act(() => {
      result.current.updateDrag("2024-01-25"); // outside project, but no constraint fn
    });
    act(() => {
      result.current.endDrag();
    });

    expect(mocks.updateTask).toHaveBeenCalled();
  });
});

// ─── useEventResize constraints ──────────────────────────────────────────────

describe("useEventResize — project constraints", () => {
  const createMocks = (task: Task = taskInsideProject) => ({
    updateTask: jest.fn(),
    getTaskById: jest.fn().mockReturnValue(task),
    getProjectById: jest.fn().mockReturnValue(mockProject),
  });

  it("allows a resize that stays within project bounds", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventResize(mocks));

    act(() => {
      result.current.startResize("task-1", "end", "2024-01-14");
    });
    act(() => {
      result.current.updateResize("2024-01-18"); // still within 01-10…01-20
    });
    act(() => {
      result.current.endResize();
    });

    expect(mocks.updateTask).toHaveBeenCalledWith("task-1", {
      dueDate: { start: "2024-01-12", end: "2024-01-18" },
    });
  });

  it("blocks a resize that would push end past the project end", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventResize(mocks));

    act(() => {
      result.current.startResize("task-1", "end", "2024-01-14");
    });
    act(() => {
      result.current.updateResize("2024-01-25"); // beyond project end 01-20
    });
    act(() => {
      result.current.endResize();
    });

    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(result.current.resizeState).toBeNull();
  });

  it("blocks a resize that would pull start before the project start", () => {
    const mocks = createMocks();
    const { result } = renderHook(() => useEventResize(mocks));

    act(() => {
      result.current.startResize("task-1", "start", "2024-01-12");
    });
    act(() => {
      result.current.updateResize("2024-01-05"); // before project start 01-10
    });
    act(() => {
      result.current.endResize();
    });

    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(result.current.resizeState).toBeNull();
  });

  it("does not constrain standalone tasks (no projectId)", () => {
    const mocks = {
      updateTask: jest.fn(),
      getTaskById: jest.fn().mockReturnValue(standaloneTask),
      getProjectById: jest.fn().mockReturnValue(mockProject),
    };
    const { result } = renderHook(() => useEventResize(mocks));

    act(() => {
      result.current.startResize("task-2", "end", "2024-01-14");
    });
    act(() => {
      result.current.updateResize("2024-02-10"); // far outside project
    });
    act(() => {
      result.current.endResize();
    });

    expect(mocks.updateTask).toHaveBeenCalled();
  });

  it("allows resize when getProjectById is not provided", () => {
    const mocks = {
      updateTask: jest.fn(),
      getTaskById: jest.fn().mockReturnValue(taskInsideProject),
      // no getProjectById
    };
    const { result } = renderHook(() => useEventResize(mocks));

    act(() => {
      result.current.startResize("task-1", "end", "2024-01-14");
    });
    act(() => {
      result.current.updateResize("2024-02-28"); // outside project, but no constraint fn
    });
    act(() => {
      result.current.endResize();
    });

    expect(mocks.updateTask).toHaveBeenCalled();
  });
});

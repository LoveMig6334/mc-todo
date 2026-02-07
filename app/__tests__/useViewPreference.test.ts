import { useViewPreference } from "@/app/hooks/useViewPreference";
import { act, renderHook } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useViewPreference", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("returns default view mode as list", () => {
    const { result } = renderHook(() => useViewPreference());
    expect(result.current.viewMode).toBe("list");
  });

  it("can change view mode to board", () => {
    const { result } = renderHook(() => useViewPreference());

    act(() => {
      result.current.setViewMode("board");
    });

    expect(result.current.viewMode).toBe("board");
  });

  it("persists view mode in localStorage", () => {
    const { result } = renderHook(() => useViewPreference());

    act(() => {
      result.current.setViewMode("board");
    });

    expect(localStorageMock.getItem("mc-todo-view-mode")).toBe('"board"');
  });

  it("reads initial value from localStorage", () => {
    localStorageMock.setItem("mc-todo-view-mode", '"board"');

    const { result } = renderHook(() => useViewPreference());
    expect(result.current.viewMode).toBe("board");
  });
});

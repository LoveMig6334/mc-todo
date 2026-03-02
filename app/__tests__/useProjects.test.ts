import { useProjects } from "@/app/hooks/useProjects";
import { ProjectFormData } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

// Mock localStorage (same pattern as useViewPreference.test.ts)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const baseFormData: ProjectFormData = {
  title: "Test Project",
  description: "A test project",
  color: "#f97316",
  dueDate: { start: "2024-03-01", end: "2024-03-31" },
};

describe("useProjects", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("addProject", () => {
    it("adds a project and returns it", () => {
      const { result } = renderHook(() => useProjects());

      let added: ReturnType<typeof result.current.addProject>;
      act(() => {
        added = result.current.addProject(baseFormData);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Test Project");
      expect(result.current.projects[0].color).toBe("#f97316");
      expect(added!.id).toBeTruthy();
      expect(added!.createdAt).toBeTruthy();
      expect(added!.updatedAt).toBeTruthy();
    });

    it("generates a unique id for each project", () => {
      const { result } = renderHook(() => useProjects());

      act(() => {
        result.current.addProject(baseFormData);
        result.current.addProject({ ...baseFormData, title: "Second" });
      });

      const ids = result.current.projects.map((p) => p.id);
      expect(new Set(ids).size).toBe(2);
    });

    it("persists to localStorage", () => {
      const { result } = renderHook(() => useProjects());

      act(() => {
        result.current.addProject(baseFormData);
      });

      const stored = localStorageMock.getItem("mc-todo-projects");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Test Project");
    });
  });

  describe("updateProject", () => {
    it("updates a project by id", () => {
      const { result } = renderHook(() => useProjects());

      let id: string;
      act(() => {
        const p = result.current.addProject(baseFormData);
        id = p.id;
      });

      act(() => {
        result.current.updateProject(id!, { title: "Updated Title" });
      });

      const updated = result.current.projects.find((p) => p.id === id);
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.description).toBe("A test project");
    });

    it("does not affect other projects", () => {
      const { result } = renderHook(() => useProjects());

      let id1: string;
      act(() => {
        const p1 = result.current.addProject(baseFormData);
        id1 = p1.id;
        result.current.addProject({ ...baseFormData, title: "Second" });
      });

      act(() => {
        result.current.updateProject(id1!, { title: "Modified" });
      });

      const titles = result.current.projects.map((p) => p.title);
      expect(titles).toContain("Modified");
      expect(titles).toContain("Second");
    });
  });

  describe("deleteProject", () => {
    it("removes a project by id", () => {
      const { result } = renderHook(() => useProjects());

      let id: string;
      act(() => {
        const p = result.current.addProject(baseFormData);
        id = p.id;
      });

      act(() => {
        result.current.deleteProject(id!);
      });

      expect(result.current.projects).toHaveLength(0);
    });

    it("does not remove other projects", () => {
      const { result } = renderHook(() => useProjects());

      let id1: string;
      act(() => {
        const p1 = result.current.addProject(baseFormData);
        id1 = p1.id;
        result.current.addProject({ ...baseFormData, title: "Keep me" });
      });

      act(() => {
        result.current.deleteProject(id1!);
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Keep me");
    });
  });

  describe("getProjectById", () => {
    it("returns the project with the matching id", () => {
      const { result } = renderHook(() => useProjects());

      let id: string;
      act(() => {
        const p = result.current.addProject(baseFormData);
        id = p.id;
      });

      const found = result.current.getProjectById(id!);
      expect(found?.title).toBe("Test Project");
    });

    it("returns undefined for unknown id", () => {
      const { result } = renderHook(() => useProjects());

      const found = result.current.getProjectById("non-existent");
      expect(found).toBeUndefined();
    });
  });

  describe("sorting", () => {
    it("returns projects sorted by start date ascending", () => {
      const { result } = renderHook(() => useProjects());

      act(() => {
        result.current.addProject({
          ...baseFormData,
          title: "Later",
          dueDate: { start: "2024-06-01", end: null },
        });
        result.current.addProject({
          ...baseFormData,
          title: "Earlier",
          dueDate: { start: "2024-01-01", end: null },
        });
      });

      expect(result.current.projects[0].title).toBe("Earlier");
      expect(result.current.projects[1].title).toBe("Later");
    });
  });

  describe("normalization (backward compat)", () => {
    it("reads back from localStorage on fresh hook mount", () => {
      // Write directly to storage as if from a prior session
      localStorageMock.setItem(
        "mc-todo-projects",
        JSON.stringify([
          {
            id: "old-id",
            title: "Old Project",
            description: "",
            color: "#3b82f6",
            dueDate: { start: "2024-01-01", end: null },
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ]),
      );

      const { result } = renderHook(() => useProjects());
      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0].title).toBe("Old Project");
    });

    it("provides empty array as default when no storage", () => {
      const { result } = renderHook(() => useProjects());
      expect(result.current.projects).toEqual([]);
    });
  });
});

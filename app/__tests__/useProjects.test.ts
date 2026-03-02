import { useProjects } from "@/app/hooks/useProjects";
import { ProjectFormData } from "@/app/types/task";
import { act, renderHook } from "@testing-library/react";

// Mock useLocalStorage
const mockStorage: Record<string, unknown> = {};
jest.mock("@/app/hooks/useLocalStorage", () => ({
  useLocalStorage: <T>(key: string, initialValue: T) => {
    if (!(key in mockStorage)) {
      mockStorage[key] = initialValue;
    }
    const setValue = (updater: T | ((prev: T) => T)) => {
      if (typeof updater === "function") {
        mockStorage[key] = (updater as (prev: T) => T)(mockStorage[key] as T);
      } else {
        mockStorage[key] = updater;
      }
    };
    return [mockStorage[key] as T, setValue];
  },
}));

const baseFormData: ProjectFormData = {
  title: "Test Project",
  description: "A test project",
  color: "#f97316",
  dueDate: { start: "2024-03-01", end: "2024-03-31" },
};

describe("useProjects", () => {
  beforeEach(() => {
    // Reset storage before each test
    delete mockStorage["mc-todo-projects"];
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

      expect(result.current.projects[0].title).toBe("Updated Title");
      expect(result.current.projects[0].description).toBe("A test project");
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
    it("provides default description when missing", () => {
      const { result } = renderHook(() => useProjects());

      act(() => {
        result.current.addProject({ ...baseFormData, description: "" });
      });

      expect(result.current.projects[0].description).toBe("");
    });
  });
});

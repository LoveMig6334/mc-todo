import { Task, TaskFormData } from "@/app/types/task";

describe("Task type calendarColor field", () => {
  it("allows calendarColor to be omitted", () => {
    const task: Partial<Task> = { id: "1", title: "Test" };
    expect(task.calendarColor).toBeUndefined();
  });

  it("accepts calendarColor as a hex string", () => {
    const task: Partial<Task> = { calendarColor: "#22c55e" };
    expect(task.calendarColor).toBe("#22c55e");
  });

  it("TaskFormData includes calendarColor", () => {
    const formData: Partial<TaskFormData> = { calendarColor: "#f97316" };
    expect(formData.calendarColor).toBe("#f97316");
  });
});

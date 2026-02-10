import { getCompletedDaysAgo, isArchiveEligible } from "@/app/lib/utils";

describe("getCompletedDaysAgo", () => {
  it("returns 0 for tasks completed today", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    expect(getCompletedDaysAgo(today.toISOString())).toBe(0);
  });

  it("returns correct number of days for past completion", () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(12, 0, 0, 0);
    expect(getCompletedDaysAgo(sevenDaysAgo.toISOString())).toBe(7);
  });

  it("returns correct days for 1 day ago", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    expect(getCompletedDaysAgo(yesterday.toISOString())).toBe(1);
  });

  it("returns large number for very old completion", () => {
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - 365);
    expect(getCompletedDaysAgo(longAgo.toISOString())).toBe(365);
  });
});

describe("isArchiveEligible", () => {
  const makeTask = (
    overrides: Partial<{
      completed: boolean;
      completedAt: string | null;
      archived: boolean;
    }> = {},
  ) => ({
    completed: true,
    completedAt: new Date().toISOString(),
    archived: false,
    ...overrides,
  });

  it("returns false for incomplete tasks", () => {
    const task = makeTask({ completed: false });
    expect(isArchiveEligible(task, 7)).toBe(false);
  });

  it("returns false for already archived tasks", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);
    const task = makeTask({
      archived: true,
      completedAt: oldDate.toISOString(),
    });
    expect(isArchiveEligible(task, 7)).toBe(false);
  });

  it("returns false for tasks with null completedAt", () => {
    const task = makeTask({ completedAt: null });
    expect(isArchiveEligible(task, 7)).toBe(false);
  });

  it("returns false for recently completed tasks (under threshold)", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const task = makeTask({ completedAt: twoDaysAgo.toISOString() });
    expect(isArchiveEligible(task, 7)).toBe(false);
  });

  it("returns true for tasks completed exactly at threshold", () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(12, 0, 0, 0);
    const task = makeTask({ completedAt: sevenDaysAgo.toISOString() });
    expect(isArchiveEligible(task, 7)).toBe(true);
  });

  it("returns true for tasks completed well past threshold", () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const task = makeTask({ completedAt: thirtyDaysAgo.toISOString() });
    expect(isArchiveEligible(task, 7)).toBe(true);
  });

  it("respects different threshold values", () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const task = makeTask({ completedAt: tenDaysAgo.toISOString() });

    expect(isArchiveEligible(task, 7)).toBe(true);
    expect(isArchiveEligible(task, 14)).toBe(false);
    expect(isArchiveEligible(task, 3)).toBe(true);
  });
});

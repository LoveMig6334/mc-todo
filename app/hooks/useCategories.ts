"use client";

import { generateId } from "@/app/lib/utils";
import { Category } from "@/app/types/task";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#f97316" },
  { id: "personal", name: "Personal", color: "#3b82f6" },
  { id: "shopping", name: "Shopping", color: "#22c55e" },
  { id: "health", name: "Health", color: "#ef4444" },
];

export const CATEGORY_COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#eab308", // yellow
];

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    "mc-todo-categories",
    DEFAULT_CATEGORIES,
  );

  const addCategory = useCallback(
    (name: string) => {
      const colorIndex = categories.length % CATEGORY_COLORS.length;
      const newCategory: Category = {
        id: generateId(),
        name,
        color: CATEGORY_COLORS[colorIndex],
      };
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    },
    [categories.length, setCategories],
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Omit<Category, "id">>) => {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
      );
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    },
    [setCategories],
  );

  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find((cat) => cat.id === id);
    },
    [categories],
  );

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}

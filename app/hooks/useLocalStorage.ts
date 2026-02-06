"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Cache the initial value once so it's stable across renders
  const initialValueRef = useRef(initialValue);

  // Cache the last raw string and parsed value to avoid creating new references
  const cacheRef = useRef<{ raw: string | null; parsed: T }>({
    raw: null,
    parsed: initialValue,
  });

  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          callback();
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    },
    [key],
  );

  const getSnapshot = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return initialValueRef.current;
      }
      // Only re-parse if the raw string changed
      if (raw !== cacheRef.current.raw) {
        cacheRef.current = { raw, parsed: JSON.parse(raw) as T };
      }
      return cacheRef.current.parsed;
    } catch {
      return initialValueRef.current;
    }
  }, [key]);

  const getServerSnapshot = useCallback((): T => {
    return initialValueRef.current;
  }, []);

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const raw = window.localStorage.getItem(key);
        const currentValue: T =
          raw !== null ? (JSON.parse(raw) as T) : initialValueRef.current;

        const valueToStore =
          value instanceof Function ? value(currentValue) : value;

        const newRaw = JSON.stringify(valueToStore);
        // Update cache immediately so getSnapshot returns the new value
        cacheRef.current = { raw: newRaw, parsed: valueToStore };

        window.localStorage.setItem(key, newRaw);
        window.dispatchEvent(
          new StorageEvent("storage", { key, newValue: newRaw }),
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}

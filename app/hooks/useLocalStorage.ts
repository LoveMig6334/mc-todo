'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';

function getServerSnapshot<T>(initialValue: T): T {
  return initialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [internalValue, setInternalValue] = useState<T>(initialValue);

  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          callback();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => getServerSnapshot(initialValue)
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentValue =
          typeof window !== 'undefined'
            ? (() => {
                const item = window.localStorage.getItem(key);
                return item ? (JSON.parse(item) as T) : initialValue;
              })()
            : initialValue;

        const valueToStore =
          value instanceof Function ? value(currentValue) : value;

        setInternalValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(
            new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [storedValue ?? internalValue, setValue];
}

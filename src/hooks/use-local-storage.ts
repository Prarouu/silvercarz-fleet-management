'use client';

import { useCallback, useSyncExternalStore } from 'react';

type CacheEntry = {
  raw: string | null;
  value: unknown;
};

const cache = new Map<string, CacheEntry>();

function readStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    const cached = cache.get(key);
    if (cached && cached.raw === raw) {
      return cached.value as T;
    }

    if (raw === null) {
      cache.set(key, { raw, value: initialValue });
      return initialValue;
    }

    const value = JSON.parse(raw) as T;
    cache.set(key, { raw, value });
    return value;
  } catch {
    return initialValue;
  }
}

function subscribe(key: string, onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      onStoreChange();
    }
  };
  const onLocal = () => onStoreChange();
  const localEvent = `local-storage:${key}`;

  window.addEventListener('storage', onStorage);
  window.addEventListener(localEvent, onLocal);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(localEvent, onLocal);
  };
}

/**
 * Persist a serializable value in `localStorage`.
 * Falls back to `initialValue` when storage is unavailable or corrupt.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: T | ((previous: T) => T)) => void] {
  const value = useSyncExternalStore(
    (onStoreChange) => subscribe(key, onStoreChange),
    () => readStorage(key, initialValue),
    () => initialValue,
  );

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = readStorage(key, initialValue);
      const nextValue = typeof next === 'function' ? (next as (prev: T) => T)(previous) : next;

      try {
        const raw = JSON.stringify(nextValue);
        window.localStorage.setItem(key, raw);
        cache.set(key, { raw, value: nextValue });
      } catch {
        cache.set(key, { raw: null, value: nextValue });
      }

      window.dispatchEvent(new Event(`local-storage:${key}`));
    },
    [key, initialValue],
  );

  return [value, setValue] as const;
}

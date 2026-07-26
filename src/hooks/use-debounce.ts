'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that updates after `delayMs`.
 * Useful for search inputs and other high-frequency UI state.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

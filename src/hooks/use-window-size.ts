'use client';

import { useCallback, useSyncExternalStore } from 'react';

export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

const SERVER_SNAPSHOT: WindowSize = { width: 0, height: 0 };

function subscribe(onStoreChange: () => void) {
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function getSnapshot(): WindowSize {
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Returns the current viewport size; `{ width: 0, height: 0 }` on the server. */
export function useWindowSize(): WindowSize {
  const getServerSnapshot = useCallback(() => SERVER_SNAPSHOT, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/** Returns `true` after the component has mounted on the client. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

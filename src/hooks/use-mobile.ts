'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

const MOBILE_BREAKPOINT = 768;

/** Returns `true` when the viewport is below the app mobile breakpoint. */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

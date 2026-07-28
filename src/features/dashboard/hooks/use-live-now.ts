'use client';

import { useEffect, useState } from 'react';

/**
 * Client-only live clock. Returns `null` until after mount so SSR and the
 * first client render stay identical (avoids hydration mismatches).
 */
export function useLiveNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Live clock for dashboard chrome.
 * Starts with a real Date on first paint so greetings/clocks reserve their
 * final size immediately (avoids post-hydration CLS from "Welcome" → "Good Afternoon").
 * Greeting/clock nodes that may differ across the server/client timezone boundary
 * should use `suppressHydrationWarning`.
 */
export function useLiveNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

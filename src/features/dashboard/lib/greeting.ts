/**
 * Time-of-day greeting helpers for the Admin Dashboard header.
 */

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export function resolveDayPeriod(date: Date = new Date()): DayPeriod {
  const hour = date.getHours();
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  return 'evening';
}

export function greetingForPeriod(period: DayPeriod): string {
  switch (period) {
    case 'morning':
      return 'Good Morning';
    case 'afternoon':
      return 'Good Afternoon';
    case 'evening':
      return 'Good Evening';
    default: {
      const _exhaustive: never = period;
      return _exhaustive;
    }
  }
}

export function resolveGreeting(date: Date = new Date()): string {
  return greetingForPeriod(resolveDayPeriod(date));
}

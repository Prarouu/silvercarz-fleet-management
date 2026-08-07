/**
 * Pure date helpers for the customer availability calendar.
 */

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';

export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayLocalDate(): Date {
  return startOfDay(new Date());
}

export function todayIsoLocal(): string {
  return toIsoDate(todayLocalDate());
}

export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/** Current calendar month (local) and the single allowed next month. */
export function getAllowedCalendarMonths(asOf: Date = todayLocalDate()): {
  readonly currentMonth: Date;
  readonly nextMonth: Date;
} {
  const currentMonth = startOfMonth(asOf);
  return {
    currentMonth,
    nextMonth: addMonths(currentMonth, 1),
  };
}

export function expandInclusiveDateRange(deliveryDate: string, returnDate: string): string[] {
  if (!deliveryDate || !returnDate || returnDate < deliveryDate) {
    return [];
  }

  return eachDayOfInterval({
    start: parseISO(deliveryDate),
    end: parseISO(returnDate),
  }).map(toIsoDate);
}

export function rangeContainsBookedDate(
  deliveryDate: string,
  returnDate: string,
  bookedDates: ReadonlySet<string>,
): boolean {
  return expandInclusiveDateRange(deliveryDate, returnDate).some((day) => bookedDates.has(day));
}

export function buildMonthCells(month: Date): Array<{
  readonly isoDate: string | null;
  readonly dayNumber: number | null;
}> {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  // Monday-first grid to match common rental calendars; Sunday = 0 → offset 6
  const mondayOffset = (start.getDay() + 6) % 7;
  const leading: Array<{ isoDate: string | null; dayNumber: number | null }> = Array.from(
    { length: mondayOffset },
    () => ({ isoDate: null, dayNumber: null }),
  );

  const body = days.map((day) => ({
    isoDate: toIsoDate(day),
    dayNumber: day.getDate(),
  }));

  return [...leading, ...body];
}

export function isPastDate(isoDate: string, asOf: Date = todayLocalDate()): boolean {
  return isBefore(parseISO(isoDate), startOfDay(asOf));
}

export function addDaysIso(isoDate: string, amount: number): string {
  return toIsoDate(addDays(parseISO(isoDate), amount));
}

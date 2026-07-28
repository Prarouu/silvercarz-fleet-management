'use server';

/**
 * Fleet Calendar Server Actions.
 */

import { getCalendarService } from '@/features/calendar/service';
import type { CalendarPageData, CalendarQuery } from '@/features/calendar/types';
import type { ApiResponse } from '@/types';

export async function getCalendarData(
  query: CalendarQuery,
): Promise<ApiResponse<CalendarPageData>> {
  return getCalendarService().getCalendarData(query);
}

import { getCalendarData } from '@/features/calendar/actions';
import { CalendarPage } from '@/features/calendar/components';
import { parseCalendarUrlState, toCalendarQuery } from '@/features/calendar/lib/calendar-params';

type CalendarRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarRoute({ searchParams }: CalendarRouteProps) {
  const params = await searchParams;
  const state = parseCalendarUrlState(params);
  const query = toCalendarQuery(state);
  const response = await getCalendarData(query);

  if (!response.success) {
    return <CalendarPage state={state} data={null} errorMessage={response.error.message} />;
  }

  return <CalendarPage state={state} data={response.data} />;
}

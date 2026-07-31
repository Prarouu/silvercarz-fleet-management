/**
 * Fleet Availability Calendar feature public exports.
 */

export type {
  CalendarEvent,
  CalendarPageData,
  CalendarQuery,
  CalendarSummary,
  CalendarVehicleOption,
  CalendarView,
  CalendarViewImplemented,
  FleetOccupancyBlock,
  FleetTimelineRow,
} from './types';

export { CALENDAR_VIEWS, CALENDAR_VIEW_OPTIONS } from './types';

export {
  createCalendarService,
  getCalendarService,
  type CalendarService,
  type CalendarServiceDeps,
} from './service';

export { getCalendarData } from './actions';

export {
  CalendarFilters,
  CalendarPage,
  CalendarSkeleton,
  CalendarSummaryCards,
  CalendarToolbar,
  FleetTimeline,
} from './components';

export {
  parseCalendarUrlState,
  toCalendarQuery,
  buildCalendarSearchParams,
  hasActiveCalendarFilters,
  type CalendarUrlState,
} from './lib/calendar-params';

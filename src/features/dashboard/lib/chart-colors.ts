/**
 * Chart color tokens bound to Admin Theme CSS variables.
 * Never hardcode hex values in chart components — use these.
 */

import type { BookingDisplayStatus } from '@/features/bookings/service/status.service';
import type { VehicleAvailabilityStatus } from '@/types';
import { VEHICLE_AVAILABILITY_STATUSES } from '@/types/enums';

/** CSS custom properties from `@/themes` → `--chart-1` … `--chart-5`. */
export const CHART_COLOR_VARS = {
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
} as const;

export type ChartColorVar = (typeof CHART_COLOR_VARS)[keyof typeof CHART_COLOR_VARS];

export const BOOKING_STATUS_CHART_COLORS: Record<
  Extract<BookingDisplayStatus, 'upcoming' | 'active' | 'completed' | 'cancelled'>,
  ChartColorVar
> = {
  upcoming: CHART_COLOR_VARS.chart4,
  active: CHART_COLOR_VARS.chart3,
  completed: CHART_COLOR_VARS.chart2,
  cancelled: CHART_COLOR_VARS.chart5,
};

export const FLEET_AVAILABILITY_CHART_COLORS: Record<VehicleAvailabilityStatus, ChartColorVar> = {
  [VEHICLE_AVAILABILITY_STATUSES.available]: CHART_COLOR_VARS.chart3,
  [VEHICLE_AVAILABILITY_STATUSES.booked]: CHART_COLOR_VARS.chart1,
  [VEHICLE_AVAILABILITY_STATUSES.reserved]: CHART_COLOR_VARS.chart4,
  [VEHICLE_AVAILABILITY_STATUSES.maintenance]: CHART_COLOR_VARS.chart2,
  [VEHICLE_AVAILABILITY_STATUSES.inactive]: CHART_COLOR_VARS.chart5,
};

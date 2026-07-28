export type {
  BookingStatusChartData,
  BookingStatusChartSlice,
  DashboardData,
  DashboardFleetSnapshotItem,
  DashboardKpis,
  DashboardScheduleItem,
  FleetAvailabilityChartBar,
  FleetAvailabilityChartData,
} from './types';

export { getDashboardData } from './actions';
export { createDashboardService, getDashboardService } from './service';
export type { DashboardService, DashboardServiceDeps } from './service';

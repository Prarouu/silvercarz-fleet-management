'use client';

import { useRouter } from 'next/navigation';

import { ErrorState } from '@/components/shared/error-state';
import { PageContainer } from '@/components/shared/page-container';
import { BookingStatusChart } from '@/features/dashboard/components/booking-status-chart';
import { DashboardEmpty } from '@/features/dashboard/components/dashboard-empty';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { DashboardKpiGrid } from '@/features/dashboard/components/dashboard-kpi-grid';
import { DashboardQuickActions } from '@/features/dashboard/components/dashboard-quick-actions';
import { DashboardWelcome } from '@/features/dashboard/components/dashboard-welcome';
import { FleetAvailabilityChart } from '@/features/dashboard/components/fleet-availability-chart';
import { RecentBookingsTable } from '@/features/dashboard/components/recent-bookings-table';
import { TodaysSchedule } from '@/features/dashboard/components/todays-schedule';
import type { DashboardData } from '@/features/dashboard/types';

type DashboardPageProps = {
  readonly data: DashboardData | null;
  readonly errorMessage?: string;
};

/**
 * Admin Dashboard composition.
 * Layout: Header → Welcome → Quick Actions → KPIs → Charts → Schedule → Recent.
 */
export function DashboardPage({ data, errorMessage }: DashboardPageProps) {
  const router = useRouter();

  if (errorMessage || !data) {
    return (
      <PageContainer className="max-w-7xl xl:max-w-[90rem]">
        <ErrorState
          title="Dashboard unavailable"
          description={
            errorMessage ??
            'We could not load your fleet overview. Check your connection and try again.'
          }
          onRetry={() => router.refresh()}
        />
      </PageContainer>
    );
  }

  if (data.isEmpty) {
    return (
      <PageContainer className="max-w-7xl xl:max-w-[90rem]">
        <div className="space-y-6">
          <DashboardHeader asOfDate={data.asOfDate} />
          <DashboardEmpty />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <DashboardHeader asOfDate={data.asOfDate} />
          <DashboardQuickActions />
        </div>

        <DashboardWelcome asOfDate={data.asOfDate} />

        <DashboardKpiGrid kpis={data.kpis} />

        <div className="grid gap-4 lg:grid-cols-2">
          <BookingStatusChart data={data.bookingStatusChart} />
          <FleetAvailabilityChart data={data.fleetAvailabilityChart} />
        </div>

        <TodaysSchedule items={data.todaysSchedule} />

        <RecentBookingsTable bookings={data.recentBookings} />
      </div>
    </PageContainer>
  );
}

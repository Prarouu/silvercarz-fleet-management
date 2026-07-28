import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { DashboardQuickActions } from '@/features/dashboard/components/dashboard-quick-actions';
import { ROUTES } from '@/constants/routes';

/** Illustration-friendly empty layout when the database has no fleet data. */
export function DashboardEmpty() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Your fleet workspace is ready"
      description="Add vehicles and create bookings to unlock KPIs, schedules, availability charts, and recent activity on this dashboard."
      action={
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href={ROUTES.vehiclesNew}>Add your first vehicle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.bookingsNew}>Create a booking</Link>
            </Button>
          </div>
          <DashboardQuickActions />
        </div>
      }
    />
  );
}

'use client';

import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarCheck2,
  Car,
  CircleCheck,
  Clock3,
} from 'lucide-react';

import { KpiCard } from '@/features/dashboard/components/kpi-card';
import type { DashboardKpis } from '@/features/dashboard/types';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type DashboardKpiGridProps = {
  readonly kpis: DashboardKpis;
  readonly className?: string;
};

const CARDS = [
  {
    key: 'activeBookings' as const,
    title: 'Active Bookings',
    description: 'Hires in progress right now',
    icon: CalendarCheck2,
    iconClassName: 'bg-success/15 text-success',
    href: `${ROUTES.bookings}?status=active`,
  },
  {
    key: 'upcomingBookings' as const,
    title: 'Upcoming Bookings',
    description: 'Confirmed future deliveries',
    icon: Clock3,
    iconClassName: 'bg-info/15 text-info',
    href: `${ROUTES.bookings}?status=upcoming`,
  },
  {
    key: 'availableVehicles' as const,
    title: 'Available Vehicles',
    description: 'Ready for new hires',
    icon: CircleCheck,
    iconClassName: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    href: `${ROUTES.vehicles}?availability=available`,
  },
  {
    key: 'todaysPickups' as const,
    title: "Today's Pickups",
    description: 'Deliveries scheduled for today',
    icon: CalendarArrowUp,
    iconClassName: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    href: ROUTES.calendar,
  },
  {
    key: 'todaysReturns' as const,
    title: "Today's Returns",
    description: 'Vehicles due back today',
    icon: CalendarArrowDown,
    iconClassName: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    href: ROUTES.calendar,
  },
  {
    key: 'totalVehicles' as const,
    title: 'Total Vehicles',
    description: 'Entire fleet roster',
    icon: Car,
    iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    href: ROUTES.vehicles,
  },
] as const;

export function DashboardKpiGrid({ kpis, className }: DashboardKpiGridProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-6', className)}
      aria-label="Fleet management KPIs"
    >
      {CARDS.map((card, index) => (
        <KpiCard
          key={card.key}
          title={card.title}
          value={kpis[card.key]}
          description={card.description}
          icon={card.icon}
          iconClassName={card.iconClassName}
          href={card.href}
          index={index}
        />
      ))}
    </section>
  );
}

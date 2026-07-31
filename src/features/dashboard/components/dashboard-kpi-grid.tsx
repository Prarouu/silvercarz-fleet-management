'use client';

import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarCheck2,
  Car,
  CircleCheck,
  Clock3,
} from 'lucide-react';

import type { MetricCardTone } from '@/components/shared/metric-card';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import type { DashboardKpis } from '@/features/dashboard/types';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type DashboardKpiGridProps = {
  readonly kpis: DashboardKpis;
  readonly className?: string;
};

const CARDS: readonly {
  readonly key: keyof DashboardKpis;
  readonly title: string;
  readonly icon: typeof Car;
  readonly tone: MetricCardTone;
  readonly href: string;
}[] = [
  {
    key: 'activeBookings',
    title: 'Active Bookings',
    icon: CalendarCheck2,
    tone: 'ink',
    href: `${ROUTES.bookings}?status=active`,
  },
  {
    key: 'upcomingBookings',
    title: 'Upcoming Bookings',
    icon: Clock3,
    tone: 'gold',
    href: `${ROUTES.bookings}?status=upcoming`,
  },
  {
    key: 'availableVehicles',
    title: 'Available Vehicles',
    icon: CircleCheck,
    tone: 'mint',
    href: `${ROUTES.vehicles}?availability=available`,
  },
  {
    key: 'todaysPickups',
    title: "Today's Pickups",
    icon: CalendarArrowUp,
    tone: 'lavender',
    href: ROUTES.calendar,
  },
  {
    key: 'todaysReturns',
    title: "Today's Returns",
    icon: CalendarArrowDown,
    tone: 'ink',
    href: ROUTES.calendar,
  },
  {
    key: 'totalVehicles',
    title: 'Total Vehicles',
    icon: Car,
    tone: 'gold',
    href: ROUTES.vehicles,
  },
] as const;

export function DashboardKpiGrid({ kpis, className }: DashboardKpiGridProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6', className)}
      aria-label="Fleet management KPIs"
    >
      {CARDS.map((card, index) => (
        <KpiCard
          key={card.key}
          title={card.title}
          value={kpis[card.key]}
          icon={card.icon}
          tone={card.tone}
          href={card.href}
          index={index}
        />
      ))}
    </section>
  );
}

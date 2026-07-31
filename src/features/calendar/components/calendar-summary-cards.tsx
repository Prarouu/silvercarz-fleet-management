import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarCheck2,
  Car,
  CircleCheck,
  Clock3,
  type LucideIcon,
} from 'lucide-react';

import { MetricCard, type MetricCardTone } from '@/components/shared/metric-card';
import type { CalendarSummary } from '@/features/calendar/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type SummaryMetric = {
  readonly key: keyof CalendarSummary;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly tone: MetricCardTone;
};

const METRICS: readonly SummaryMetric[] = [
  { key: 'availableVehicles', label: 'Available Vehicles', icon: CircleCheck, tone: 'mint' },
  { key: 'bookedVehicles', label: 'Booked Vehicles', icon: Car, tone: 'ink' },
  { key: 'todaysPickups', label: "Today's Pickups", icon: CalendarArrowUp, tone: 'gold' },
  { key: 'todaysReturns', label: "Today's Returns", icon: CalendarArrowDown, tone: 'lavender' },
  { key: 'activeBookings', label: 'Active Bookings', icon: CalendarCheck2, tone: 'ink' },
  { key: 'upcomingBookings', label: 'Upcoming Bookings', icon: Clock3, tone: 'gold' },
];

type CalendarSummaryCardsProps = {
  readonly summary: CalendarSummary;
  readonly className?: string;
};

export function CalendarSummaryCards({ summary, className }: CalendarSummaryCardsProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3', className)}
      aria-label="Fleet calendar summary"
    >
      {METRICS.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.label}
          value={formatNumber(summary[metric.key])}
          icon={metric.icon}
          tone={metric.tone}
        />
      ))}
    </section>
  );
}

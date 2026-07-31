import { Car, CircleCheck, CircleMinus, CalendarCheck2, type LucideIcon } from 'lucide-react';

import { MetricCard, type MetricCardTone } from '@/components/shared/metric-card';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type VehicleFleetSummary = {
  readonly total: number;
  readonly available: number;
  readonly booked: number;
  readonly inactive: number;
};

type SummaryMetric = {
  readonly key: keyof VehicleFleetSummary;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly tone: MetricCardTone;
};

const METRICS: readonly SummaryMetric[] = [
  { key: 'total', label: 'Total Vehicles', icon: Car, tone: 'ink' },
  { key: 'available', label: 'Available Vehicles', icon: CircleCheck, tone: 'mint' },
  { key: 'booked', label: 'Booked Vehicles', icon: CalendarCheck2, tone: 'gold' },
  { key: 'inactive', label: 'Inactive Vehicles', icon: CircleMinus, tone: 'lavender' },
];

type VehicleSummaryCardsProps = {
  readonly summary: VehicleFleetSummary;
  readonly className?: string;
};

export function VehicleSummaryCards({ summary, className }: VehicleSummaryCardsProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4', className)}
      aria-label="Fleet summary"
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

import { CalendarDays, Fuel, IndianRupee } from 'lucide-react';

import { MetricCard, type MetricCardTone } from '@/components/shared/metric-card';
import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { FUEL_TYPE_LABELS, type FuelType } from '@/types';

export type VehicleDetailStatsData = {
  readonly dailyRate: number;
  readonly fuelType: FuelType;
  /**
   * Total bookings for this vehicle from the bookings backend.
   * `null` isolates the placeholder when the count is unavailable.
   */
  readonly totalBookings: number | null;
};

type StatCardConfig = {
  readonly key: keyof VehicleDetailStatsData;
  readonly title: string;
  readonly description: string;
  readonly icon: typeof Fuel;
  readonly tone: MetricCardTone;
};

const CARDS: readonly StatCardConfig[] = [
  {
    key: 'dailyRate',
    title: 'Daily Rate',
    description: 'Default rental charge',
    icon: IndianRupee,
    tone: 'gold',
  },
  {
    key: 'fuelType',
    title: 'Fuel Type',
    description: 'Powertrain classification',
    icon: Fuel,
    tone: 'mint',
  },
  {
    key: 'totalBookings',
    title: 'Total Bookings',
    description: 'All linked hire records',
    icon: CalendarDays,
    tone: 'lavender',
  },
];

type VehicleDetailStatsProps = {
  readonly stats: VehicleDetailStatsData;
  readonly className?: string;
};

function formatStatValue(key: keyof VehicleDetailStatsData, stats: VehicleDetailStatsData): string {
  switch (key) {
    case 'dailyRate':
      return formatCurrency(stats.dailyRate) || '—';
    case 'fuelType':
      return FUEL_TYPE_LABELS[stats.fuelType];
    case 'totalBookings':
      // Isolated placeholder when booking count is not yet available from the backend.
      return stats.totalBookings === null ? '—' : formatNumber(stats.totalBookings);
    default:
      return '—';
  }
}

/** Responsive quick-stat cards for the fleet profile. */
export function VehicleDetailStats({ stats, className }: VehicleDetailStatsProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3', className)}
      aria-label="Vehicle quick statistics"
    >
      {CARDS.map((card) => (
        <MetricCard
          key={card.key}
          title={card.title}
          value={formatStatValue(card.key, stats)}
          description={card.description}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </section>
  );
}

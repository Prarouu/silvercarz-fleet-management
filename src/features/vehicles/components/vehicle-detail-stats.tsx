import { CalendarDays, Fuel, Gauge, IndianRupee } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { FUEL_TYPE_LABELS, type FuelType } from '@/types';

export type VehicleDetailStatsData = {
  readonly currentOdometer: number;
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
  readonly icon: typeof Gauge;
  readonly iconClassName: string;
};

const CARDS: readonly StatCardConfig[] = [
  {
    key: 'currentOdometer',
    title: 'Current Odometer',
    description: 'Latest recorded reading',
    icon: Gauge,
    iconClassName: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  {
    key: 'dailyRate',
    title: 'Daily Rate',
    description: 'Default rental charge',
    icon: IndianRupee,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    key: 'fuelType',
    title: 'Fuel Type',
    description: 'Powertrain classification',
    icon: Fuel,
    iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  {
    key: 'totalBookings',
    title: 'Total Bookings',
    description: 'All linked hire records',
    icon: CalendarDays,
    iconClassName: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
];

type VehicleDetailStatsProps = {
  readonly stats: VehicleDetailStatsData;
  readonly className?: string;
};

function formatStatValue(key: keyof VehicleDetailStatsData, stats: VehicleDetailStatsData): string {
  switch (key) {
    case 'currentOdometer':
      return `${formatNumber(stats.currentOdometer)} km`;
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
      className={cn('grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4', className)}
      aria-label="Vehicle quick statistics"
    >
      {CARDS.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 sm:gap-3">
              <div className="min-w-0 space-y-1">
                <CardDescription className="line-clamp-2 text-pretty sm:line-clamp-none">
                  {card.title}
                </CardDescription>
                <CardTitle className="font-heading text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                  {formatStatValue(card.key, stats)}
                </CardTitle>
              </div>
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9',
                  card.iconClassName,
                )}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="hidden sm:block">
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

import { Ban, CalendarCheck2, Car, CircleCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type VehicleFleetSummary = {
  readonly total: number;
  readonly available: number;
  readonly booked: number;
  readonly inactive: number;
};

type SummaryCardConfig = {
  readonly key: keyof VehicleFleetSummary;
  readonly title: string;
  readonly description: string;
  readonly icon: typeof Car;
  readonly iconClassName: string;
};

const CARDS: readonly SummaryCardConfig[] = [
  {
    key: 'total',
    title: 'Total Vehicles',
    description: 'All vehicles in the fleet',
    icon: Car,
    iconClassName: 'bg-primary/10 text-primary',
  },
  {
    key: 'available',
    title: 'Available Vehicles',
    description: 'Ready for new bookings',
    icon: CircleCheck,
    iconClassName: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  {
    key: 'booked',
    title: 'Booked Vehicles',
    description: 'Currently on active hire',
    icon: CalendarCheck2,
    iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  {
    key: 'inactive',
    title: 'Inactive Vehicles',
    description: 'Retired or unavailable',
    icon: Ban,
    iconClassName: 'bg-muted text-muted-foreground',
  },
];

type VehicleSummaryCardsProps = {
  readonly summary: VehicleFleetSummary;
  readonly className?: string;
};

export function VehicleSummaryCards({ summary, className }: VehicleSummaryCardsProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4', className)}
      aria-label="Fleet summary"
    >
      {CARDS.map((card) => {
        const Icon = card.icon;
        const count = summary[card.key];

        return (
          <Card key={card.key} size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 sm:gap-3">
              <div className="min-w-0 space-y-1">
                <CardDescription className="line-clamp-2 text-pretty sm:line-clamp-none">
                  {card.title}
                </CardDescription>
                <CardTitle className="font-heading text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                  {formatNumber(count)}
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

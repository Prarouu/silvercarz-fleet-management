import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarCheck2,
  Car,
  CircleCheck,
  Clock3,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalendarSummary } from '@/features/calendar/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type SummaryCardConfig = {
  readonly key: keyof CalendarSummary;
  readonly title: string;
  readonly description: string;
  readonly icon: typeof Car;
  readonly iconClassName: string;
};

const CARDS: readonly SummaryCardConfig[] = [
  {
    key: 'availableVehicles',
    title: 'Available Vehicles',
    description: 'Ready for new hires right now',
    icon: CircleCheck,
    iconClassName: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  {
    key: 'bookedVehicles',
    title: 'Booked Vehicles',
    description: 'Reserved or on active hire',
    icon: Car,
    iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  {
    key: 'todaysPickups',
    title: "Today's Pickups",
    description: 'Deliveries scheduled for today',
    icon: CalendarArrowUp,
    iconClassName: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  {
    key: 'todaysReturns',
    title: "Today's Returns",
    description: 'Vehicles due back today',
    icon: CalendarArrowDown,
    iconClassName: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  {
    key: 'activeBookings',
    title: 'Active Bookings',
    description: 'Hires in progress (Status Engine)',
    icon: CalendarCheck2,
    iconClassName: 'bg-success/15 text-success',
  },
  {
    key: 'upcomingBookings',
    title: 'Upcoming Bookings',
    description: 'Confirmed future deliveries',
    icon: Clock3,
    iconClassName: 'bg-info/15 text-info',
  },
];

type CalendarSummaryCardsProps = {
  readonly summary: CalendarSummary;
  readonly className?: string;
};

export function CalendarSummaryCards({ summary, className }: CalendarSummaryCardsProps) {
  return (
    <section
      className={cn('grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-6', className)}
      aria-label="Fleet calendar summary"
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

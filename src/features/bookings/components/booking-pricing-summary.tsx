import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PricingSummary } from '@/features/bookings/service/pricing.service';

type BookingPricingSummaryProps = {
  readonly pricing: PricingSummary;
  readonly className?: string;
  /** When true, announce live updates for screen readers (forms). */
  readonly live?: boolean;
};

function money(value: number): string {
  return formatCurrency(value) || formatNumber(value) || '0';
}

function km(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return `${formatNumber(value)} km`;
}

type SummaryItem = {
  readonly label: string;
  readonly value: string;
  readonly emphasize?: boolean;
};

/**
 * Accessible pricing breakdown driven exclusively by the Pricing Engine.
 * Forms and detail pages must not invent parallel money math.
 */
export function BookingPricingSummary({
  pricing,
  className,
  live = false,
}: BookingPricingSummaryProps) {
  const items: readonly SummaryItem[] = [
    {
      label: 'Rental days',
      value: pricing.rentalDays > 0 ? formatNumber(pricing.rentalDays) : '—',
    },
    { label: 'Daily rate', value: money(pricing.dailyRate) },
    { label: 'Rental charge', value: money(pricing.rentalCharge) },
    { label: 'Total km', value: km(pricing.totalKilometers) },
    { label: 'Km charge', value: money(pricing.kilometerCharge) },
    { label: 'Subtotal', value: money(pricing.subtotal) },
    { label: 'Amount paid', value: money(pricing.amountPaid) },
    { label: 'Security deposit', value: money(pricing.securityDeposit) },
    { label: 'Remaining balance', value: money(pricing.remainingBalance), emphasize: true },
    { label: 'Grand total', value: money(pricing.grandTotal), emphasize: true },
  ];

  return (
    <section
      className={cn('rounded-xl border bg-muted/20 p-4 sm:p-5', className)}
      aria-label="Pricing summary"
      {...(live
        ? {
            'aria-live': 'polite' as const,
            'aria-atomic': true,
          }
        : {})}
    >
      <header className="mb-3 space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">Pricing summary</h3>
        <p className="text-xs text-muted-foreground">
          Calculated by the Pricing Engine. Security deposit is tracked separately.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 space-y-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd
              className={cn(
                'text-sm tabular-nums',
                item.emphasize ? 'font-semibold tracking-tight' : 'font-medium',
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

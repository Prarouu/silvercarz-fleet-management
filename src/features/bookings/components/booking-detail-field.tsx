import { cn } from '@/lib/utils';

type BookingDetailFieldProps = {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly className?: string;
};

/** Label / value pair for booking detail definition lists. */
export function BookingDetailField({ label, value, className }: BookingDetailFieldProps) {
  const display =
    value === null || value === undefined || value === '' ? (
      <span className="text-muted-foreground">—</span>
    ) : (
      value
    );

  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{display}</dd>
    </div>
  );
}

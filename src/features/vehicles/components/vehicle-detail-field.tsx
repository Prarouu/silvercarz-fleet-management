import { cn } from '@/lib/utils';

type VehicleDetailFieldProps = {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly className?: string;
};

/** Label / value pair for vehicle detail definition lists. */
export function VehicleDetailField({ label, value, className }: VehicleDetailFieldProps) {
  const display =
    value === null || value === undefined || value === '' ? (
      <span className="text-muted-foreground">—</span>
    ) : (
      value
    );

  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm leading-snug break-words">{display}</dd>
    </div>
  );
}

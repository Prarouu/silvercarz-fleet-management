import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function VehicleStatusBadge({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  const label = isActive ? 'Active' : 'Inactive';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium tracking-wide',
        isActive
          ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
          : 'border-border/60 bg-muted text-muted-foreground',
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      {label}
    </Badge>
  );
}

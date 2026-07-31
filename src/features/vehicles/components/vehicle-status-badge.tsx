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
          ? 'border-success/25 bg-success/10 text-success'
          : 'border-border/60 bg-muted text-muted-foreground',
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      {label}
    </Badge>
  );
}

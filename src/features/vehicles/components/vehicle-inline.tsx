'use client';

import {
  VehicleThumbnail,
  type VehicleThumbnailSize,
} from '@/features/vehicles/components/vehicle-thumbnail';
import { cn } from '@/lib/utils';

type VehicleInlineProps = {
  readonly imagePath: string | null | undefined;
  readonly name: string;
  readonly number?: string | null;
  readonly size?: VehicleThumbnailSize;
  readonly className?: string;
  readonly nameClassName?: string;
  readonly numberClassName?: string;
};

/**
 * Vehicle identity chip: dynamic photo thumbnail + name / registration.
 * Use wherever a booking or schedule row references a fleet unit.
 */
export function VehicleInline({
  imagePath,
  name,
  number,
  size = 'sm',
  className,
  nameClassName,
  numberClassName,
}: VehicleInlineProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <VehicleThumbnail imagePath={imagePath} alt={`${name} photo`} size={size} />
      <div className="min-w-0">
        <p className={cn('truncate font-medium', nameClassName)}>{name}</p>
        {number ? (
          <p className={cn('truncate text-xs text-muted-foreground tabular-nums', numberClassName)}>
            {number}
          </p>
        ) : null}
      </div>
    </div>
  );
}

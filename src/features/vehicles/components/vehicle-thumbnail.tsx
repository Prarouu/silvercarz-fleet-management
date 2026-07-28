'use client';

import { CarFront } from 'lucide-react';
import { useState } from 'react';

import { getVehicleImagePublicUrl } from '@/features/vehicles/lib/vehicle-image-url';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  xs: 'size-8 rounded-md [&_svg]:size-3.5',
  sm: 'size-10 rounded-lg [&_svg]:size-4',
  md: 'size-12 rounded-lg [&_svg]:size-5',
  lg: 'size-16 rounded-lg sm:size-[4.5rem] [&_svg]:size-6',
} as const;

export type VehicleThumbnailSize = keyof typeof SIZE_CLASSES;

type VehicleThumbnailProps = {
  readonly imagePath: string | null | undefined;
  readonly alt: string;
  readonly size?: VehicleThumbnailSize;
  readonly className?: string;
};

/** Compact fleet thumbnail from `vehicles.image_path`, with a car fallback. */
export function VehicleThumbnail({
  imagePath,
  alt,
  size = 'lg',
  className,
}: VehicleThumbnailProps) {
  const url = getVehicleImagePublicUrl(imagePath);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border bg-muted/40',
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden={showImage ? undefined : true}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase Storage URL
        <img
          src={url!}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <CarFront className="text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  );
}

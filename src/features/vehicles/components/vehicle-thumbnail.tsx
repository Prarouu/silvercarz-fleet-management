'use client';

import { CarFront } from 'lucide-react';
import { useState } from 'react';

import { getVehicleImagePublicUrl } from '@/features/vehicles/lib/vehicle-image-url';
import { cn } from '@/lib/utils';

type VehicleThumbnailProps = {
  readonly imagePath: string | null | undefined;
  readonly alt: string;
  readonly className?: string;
};

/** Compact fleet thumbnail from `vehicles.image_path`, with a car fallback. */
export function VehicleThumbnail({ imagePath, alt, className }: VehicleThumbnailProps) {
  const url = getVehicleImagePublicUrl(imagePath);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  return (
    <div
      className={cn(
        'flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40 sm:size-[4.5rem]',
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
        <CarFront className="size-6 text-muted-foreground" aria-hidden="true" />
      )}
    </div>
  );
}

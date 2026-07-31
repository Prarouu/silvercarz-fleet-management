'use client';

import { CarFront } from 'lucide-react';
import { useState } from 'react';

import { getVehicleImagePublicUrl } from '@/features/vehicles/lib/vehicle-image-url';
import { cn } from '@/lib/utils';

type VehicleDetailImageProps = {
  readonly imagePath: string | null | undefined;
  readonly alt: string;
  readonly className?: string;
};

/** Responsive vehicle image preview for the fleet profile overview. */
export function VehicleDetailImage({ imagePath, alt, className }: VehicleDetailImageProps) {
  const url = getVehicleImagePublicUrl(imagePath);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  return (
    <div
      className={cn(
        'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border bg-muted/40 sm:aspect-square sm:max-w-[16rem]',
        className,
      )}
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
        <div className="flex flex-col items-center gap-2 px-4 text-center" aria-hidden="true">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <CarFront className="size-7 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">No image available</p>
        </div>
      )}
    </div>
  );
}

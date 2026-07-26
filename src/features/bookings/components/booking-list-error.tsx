'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { ErrorState } from '@/components/shared/error-state';

export function BookingListError({
  title = 'Unable to load bookings',
  description,
}: {
  title?: string;
  description: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <ErrorState
      title={title}
      description={description}
      onRetry={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
    />
  );
}

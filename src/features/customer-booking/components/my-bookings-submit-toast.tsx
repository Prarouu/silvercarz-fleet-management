'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Shows a one-time success toast after document submission redirect.
 */
export function MyBookingsSubmitToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) {
      return;
    }

    if (searchParams.get('submitted') !== '1') {
      return;
    }

    shown.current = true;
    const ref = searchParams.get('ref')?.trim();

    toast.success('Booking request submitted', {
      description: ref
        ? `Request ${ref} and your documents were sent to Silver Carz for review.`
        : 'Your booking request and documents were sent to Silver Carz for review.',
    });

    router.replace(pathname);
  }, [pathname, router, searchParams]);

  return null;
}

import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function BookingDetailNotFound() {
  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Booking not found"
        description="This booking does not exist, may have been removed, or you may not have access to view it."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.bookings}>Return to Bookings</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}

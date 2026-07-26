import { Car } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function VehicleDetailNotFound() {
  return (
    <PageContainer className="max-w-5xl">
      <EmptyState
        icon={Car}
        title="Vehicle not found"
        description="This vehicle does not exist, may have been removed, or you may not have access to view it."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.vehicles}>Return to Fleet</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}

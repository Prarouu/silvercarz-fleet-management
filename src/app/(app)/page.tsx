import { Wrench } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';

export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Welcome to Silver Carz"
        description="Internal rental and fleet management for the Silver Carz team."
      />
      <EmptyState
        icon={Wrench}
        title="Modules coming soon"
        description="The dashboard, bookings, vehicles, customers, and drivers modules will appear here as they are built in upcoming phases."
      />
    </PageContainer>
  );
}

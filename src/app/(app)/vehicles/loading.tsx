import { PageContainer } from '@/components/shared/page-container';
import { VehicleListSkeleton } from '@/features/vehicles/components';

export default function VehiclesLoading() {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <VehicleListSkeleton />
    </PageContainer>
  );
}

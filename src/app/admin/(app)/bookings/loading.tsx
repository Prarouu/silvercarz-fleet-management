import { PageContainer } from '@/components/shared/page-container';
import { BookingListSkeleton } from '@/features/bookings/components';

export default function BookingsLoading() {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <BookingListSkeleton />
    </PageContainer>
  );
}

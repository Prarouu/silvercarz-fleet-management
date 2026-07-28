import { PageContainer } from '@/components/shared/page-container';
import { CalendarSkeleton } from '@/features/calendar/components';

export default function CalendarLoading() {
  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <CalendarSkeleton />
    </PageContainer>
  );
}

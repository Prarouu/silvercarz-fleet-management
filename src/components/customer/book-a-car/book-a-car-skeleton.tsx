import { CustomerContainer } from '@/components/customer/shared/customer-container';
import { Skeleton } from '@/components/ui/skeleton';
import { BookACarHero } from '@/components/customer/book-a-car/book-a-car-hero';
import { BookingProgressSteps } from '@/components/customer/book-a-car/booking-progress-steps';

export function BookACarSkeleton() {
  return (
    <>
      <BookACarHero />
      <BookingProgressSteps />
      <CustomerContainer className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-md" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </CustomerContainer>
    </>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { BookACarSkeleton } from '@/components/customer/book-a-car/book-a-car-skeleton';
import { BookACarView } from '@/components/customer/book-a-car/book-a-car-view';
import { appConfig } from '@/config';
import {
  getPublicVehicle,
  listPublicVehicles,
} from '@/features/vehicles/actions/list-public-vehicles';
import {
  parseCustomerBookACarUrlState,
  toPublicVehicleListQuery,
} from '@/features/vehicles/lib/public-vehicle-list-params';
import type { PublicVehicle } from '@/types';

export const metadata: Metadata = {
  title: `Book a Car | ${appConfig.companyName}`,
  description: 'Browse the Silver Carz fleet and select a car to book.',
};

/**
 * Root customer page — Book a Car (single source of truth).
 * C1: browse, filter, select, summary. No booking submission yet.
 */
export default async function BookACarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<BookACarSkeleton />}>
      <BookACarPageContent searchParams={params} />
    </Suspense>
  );
}

async function BookACarPageContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const state = parseCustomerBookACarUrlState(searchParams);
  const result = await listPublicVehicles(toPublicVehicleListQuery(state));

  if (!result.success) {
    return (
      <BookACarView
        state={state}
        vehicles={[]}
        meta={null}
        selectedVehicle={null}
        errorMessage={result.error.message}
      />
    );
  }

  const vehicles = result.data.data;
  const selectedVehicle = await resolveSelectedVehicle(vehicles, state.vehicleId);

  return (
    <BookACarView
      state={state}
      vehicles={vehicles}
      meta={result.data.meta}
      selectedVehicle={selectedVehicle}
    />
  );
}

async function resolveSelectedVehicle(
  vehicles: readonly PublicVehicle[],
  vehicleId: string | null,
): Promise<PublicVehicle | null> {
  if (!vehicleId) {
    return null;
  }

  const onPage = vehicles.find((vehicle) => vehicle.id === vehicleId);
  if (onPage) {
    return onPage;
  }

  const selected = await getPublicVehicle(vehicleId);
  return selected.success ? selected.data : null;
}

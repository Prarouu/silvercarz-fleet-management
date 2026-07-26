import { createPaginatedResult, normalizePaginationParams } from '@/lib/pagination';
import { countVehicles, listVehicles } from '@/features/vehicles/actions';
import { VehicleList } from '@/features/vehicles/components';
import type { VehicleFleetSummary } from '@/features/vehicles/components';
import {
  isFutureAvailabilityFilter,
  parseVehicleListUrlState,
  toVehicleListQuery,
} from '@/features/vehicles/lib/vehicle-list-params';

type VehiclesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadFleetSummary(): Promise<VehicleFleetSummary | null> {
  const [totalRes, availableRes, inactiveRes] = await Promise.all([
    countVehicles({ includeInactive: true }),
    countVehicles({ available: true }),
    countVehicles({ isActive: false }),
  ]);

  if (!totalRes.success || !availableRes.success || !inactiveRes.success) {
    return null;
  }

  return {
    total: totalRes.data,
    available: availableRes.data,
    // Booking-conflict availability lands with hire conflict detection.
    booked: 0,
    inactive: inactiveRes.data,
  };
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const state = parseVehicleListUrlState(params);
  const query = toVehicleListQuery(state);

  const summaryPromise = loadFleetSummary();

  if (isFutureAvailabilityFilter(state)) {
    const pagination = normalizePaginationParams(query);
    const emptyResult = createPaginatedResult([], pagination, 0);
    const summary = await summaryPromise;

    return <VehicleList state={state} result={emptyResult} summary={summary} />;
  }

  const [response, summary] = await Promise.all([listVehicles(query), summaryPromise]);

  if (!response.success) {
    return (
      <VehicleList
        state={state}
        result={null}
        summary={summary}
        errorMessage={response.error.message}
      />
    );
  }

  return <VehicleList state={state} result={response.data} summary={summary} />;
}

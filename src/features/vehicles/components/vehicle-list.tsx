import { CarFront, Plus } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { VehicleListError } from '@/features/vehicles/components/vehicle-list-error';
import { VehicleListPagination } from '@/features/vehicles/components/vehicle-list-pagination';
import { VehicleListRefreshButton } from '@/features/vehicles/components/vehicle-list-refresh-button';
import { VehicleListTable } from '@/features/vehicles/components/vehicle-list-table';
import { VehicleListToolbar } from '@/features/vehicles/components/vehicle-list-toolbar';
import {
  VehicleSummaryCards,
  type VehicleFleetSummary,
} from '@/features/vehicles/components/vehicle-summary-cards';
import {
  hasActiveVehicleListFilters,
  type VehicleListUrlState,
} from '@/features/vehicles/lib/vehicle-list-params';
import type { PaginatedResult, Vehicle } from '@/types';

type VehicleListProps = {
  readonly state: VehicleListUrlState;
  readonly result: PaginatedResult<Vehicle> | null;
  readonly summary: VehicleFleetSummary | null;
  readonly errorMessage?: string;
};

function AddVehicleButton() {
  return (
    <Button asChild>
      <Link href={ROUTES.vehiclesNew}>
        <Plus data-icon="inline-start" />
        Add Vehicle
      </Link>
    </Button>
  );
}

export function VehicleList({ state, result, summary, errorMessage }: VehicleListProps) {
  const filtersActive = hasActiveVehicleListFilters(state);

  return (
    <PageContainer className="max-w-7xl xl:max-w-[90rem]">
      <PageHeader title="Fleet Management" description="Manage all company vehicles.">
        <AddVehicleButton />
      </PageHeader>

      <div className="space-y-4">
        {summary ? <VehicleSummaryCards summary={summary} /> : null}

        <VehicleListToolbar state={state} />

        {errorMessage ? <VehicleListError description={errorMessage} /> : null}

        {!errorMessage && result && result.data.length === 0 ? (
          <EmptyState
            icon={CarFront}
            title={filtersActive ? 'No matching vehicles' : 'No vehicles yet'}
            description={
              filtersActive
                ? 'Try adjusting your search or filters to find what you need.'
                : 'Add your first vehicle to start managing the Silver Carz fleet.'
            }
            action={
              filtersActive ? (
                <VehicleListRefreshButton label="Clear filters" clearFilters />
              ) : (
                <AddVehicleButton />
              )
            }
          />
        ) : null}

        {!errorMessage && result && result.data.length > 0 ? (
          <div className="space-y-4">
            <VehicleListTable data={result.data} state={state} />
            <VehicleListPagination state={state} meta={result.meta} />
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

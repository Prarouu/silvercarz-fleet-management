import type { Metadata } from 'next';

import { CustomerPlaceholderPage } from '@/components/customer/shared/customer-placeholder';

export const metadata: Metadata = {
  title: 'Select Vehicle',
};

/** Placeholder — per-vehicle booking step (future). */
export default async function BookACarVehiclePage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;

  return (
    <CustomerPlaceholderPage
      title="Vehicle booking"
      description={`Placeholder for vehicle "${vehicleId}". Selection, dates, and request submission will arrive in a later phase.`}
    />
  );
}

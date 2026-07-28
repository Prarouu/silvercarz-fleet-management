import Link from 'next/link';
import { CalendarRange, Car, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Primary dashboard shortcuts — reuses shared Button primitives. */
export function DashboardQuickActions() {
  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Dashboard quick actions">
      <Button asChild size="sm">
        <Link href={ROUTES.bookingsNew}>
          <Plus className="size-4" aria-hidden="true" />
          New Booking
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={ROUTES.vehiclesNew}>
          <Plus className="size-4" aria-hidden="true" />
          Add Vehicle
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={ROUTES.vehicles}>
          <Car className="size-4" aria-hidden="true" />
          View Fleet
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={ROUTES.bookings}>
          <CalendarRange className="size-4" aria-hidden="true" />
          Manage Bookings
        </Link>
      </Button>
    </nav>
  );
}

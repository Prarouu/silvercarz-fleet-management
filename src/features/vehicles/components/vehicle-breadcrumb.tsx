import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ROUTES } from '@/constants/routes';

type VehicleBreadcrumbProps = {
  readonly current: string;
  /** Optional middle crumb (e.g. "Vehicle" on the edit page). */
  readonly middle?: string;
};

/** Shared Fleet Management → current-page breadcrumb for vehicle routes. */
export function VehicleBreadcrumb({ current, middle }: VehicleBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={ROUTES.vehicles}>Fleet Management</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {middle ? (
          <>
            <BreadcrumbItem>
              <span className="text-muted-foreground">{middle}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

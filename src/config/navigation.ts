import {
  CalendarRange,
  Car,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

/**
 * Sidebar navigation. Routes are placeholders until their modules are
 * implemented in later phases — keeping them here means the sidebar needs
 * no changes when pages arrive.
 */
export const mainNavItems: readonly NavItem[] = [
  { title: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard },
  { title: 'Bookings', href: ROUTES.bookings, icon: CalendarRange },
  { title: 'Vehicles', href: ROUTES.vehicles, icon: Car },
  { title: 'Customers', href: ROUTES.customers, icon: Users },
  { title: 'Drivers', href: ROUTES.drivers, icon: UserRound },
];

export const secondaryNavItems: readonly NavItem[] = [
  { title: 'Settings', href: ROUTES.settings, icon: Settings },
];

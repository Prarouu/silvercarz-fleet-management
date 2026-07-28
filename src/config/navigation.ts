import {
  CalendarDays,
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
 * Sidebar navigation. Dashboard, Bookings, Calendar, and Vehicles are live.
 * Customers / Drivers / Settings remain placeholders until those modules land.
 */
export const mainNavItems: readonly NavItem[] = [
  { title: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard },
  { title: 'Bookings', href: ROUTES.bookings, icon: CalendarRange },
  { title: 'Calendar', href: ROUTES.calendar, icon: CalendarDays },
  { title: 'Vehicles', href: ROUTES.vehicles, icon: Car },
  { title: 'Customers', href: ROUTES.customers, icon: Users },
  { title: 'Drivers', href: ROUTES.drivers, icon: UserRound },
];

export const secondaryNavItems: readonly NavItem[] = [
  { title: 'Settings', href: ROUTES.settings, icon: Settings },
];

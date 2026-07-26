import {
  CalendarRange,
  Car,
  LayoutDashboard,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

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
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Bookings', href: '/bookings', icon: CalendarRange },
  { title: 'Vehicles', href: '/vehicles', icon: Car },
  { title: 'Customers', href: '/customers', icon: Users },
  { title: 'Drivers', href: '/drivers', icon: UserRound },
];

export const secondaryNavItems: readonly NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
];

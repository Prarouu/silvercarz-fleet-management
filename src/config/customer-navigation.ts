import { ROUTES } from '@/constants/routes';

export interface CustomerNavItem {
  readonly title: string;
  readonly href: string;
}

/**
 * Primary customer header / footer navigation.
 * Labels match the customer portal design language (marketing chrome).
 */
export const customerMainNavItems: readonly CustomerNavItem[] = [
  { title: 'Home', href: ROUTES.home },
  { title: 'About Us', href: ROUTES.about },
  { title: 'Our Fleet', href: ROUTES.ourFleet },
  { title: 'Pricing', href: ROUTES.pricing },
  { title: 'How It Works', href: ROUTES.howItWorks },
  { title: 'Contact Us', href: ROUTES.contact },
] as const;

/** Secondary customer links used in the footer quick-links column. */
export const customerQuickLinkItems: readonly CustomerNavItem[] = [
  { title: 'Book a Car', href: ROUTES.bookACar },
  { title: 'Car Pooling', href: ROUTES.carPooling },
  { title: 'Detailing', href: ROUTES.detailing },
  { title: 'Our Fleet', href: ROUTES.ourFleet },
  { title: 'Pricing', href: ROUTES.pricing },
  { title: 'Contact Us', href: ROUTES.contact },
] as const;

/** Legal links for the customer footer bar. */
export const customerLegalNavItems: readonly CustomerNavItem[] = [
  { title: 'Terms & Conditions', href: ROUTES.contact },
  { title: 'Privacy Policy', href: ROUTES.contact },
] as const;

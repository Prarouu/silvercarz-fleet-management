/**
 * Canonical application route paths.
 *
 * Feature modules and navigation must import from here — never hardcode
 * path strings. Add new routes as modules are introduced.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  dashboard: '/dashboard',
  bookings: '/bookings',
  bookingsNew: '/bookings/new',
  vehicles: '/vehicles',
  customers: '/customers',
  drivers: '/drivers',
  settings: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

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

/** Dynamic detail path for a booking id. */
export function bookingDetailPath(id: string): string {
  return `${ROUTES.bookings}/${id}`;
}

/** Dynamic edit path for a booking id. */
export function bookingEditPath(id: string): string {
  return `${ROUTES.bookings}/${id}/edit`;
}

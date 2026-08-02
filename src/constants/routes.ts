/**
 * Canonical application route paths.
 *
 * Feature modules and navigation must import from here — never hardcode
 * path strings. Add new routes as modules are introduced.
 *
 * Admin portal lives under `/admin`. The public customer site uses `/`.
 *
 * Primary customer pages (nav):
 *   /                 Book a Car
 *   /car-pooling      Car Pooling
 *   /car-detailing    Car Detailing
 *   /about-us         About Us
 */

export const ROUTES = {
  // --- Customer portal (primary pages) ---
  home: '/',
  bookACar: '/',
  carPooling: '/car-pooling',
  carDetailing: '/car-detailing',
  aboutUs: '/about-us',

  // --- Customer account / workflow (not primary nav) ---
  customerLogin: '/login',
  customerSignup: '/signup',
  myBookings: '/my-bookings',
  profile: '/profile',

  // --- Admin portal ---
  admin: '/admin',
  login: '/admin/login',
  forgotPassword: '/admin/forgot-password',
  resetPassword: '/admin/reset-password',
  authCallback: '/auth/callback',
  dashboard: '/admin/dashboard',
  bookings: '/admin/bookings',
  bookingsNew: '/admin/bookings/new',
  vehicles: '/admin/vehicles',
  vehiclesNew: '/admin/vehicles/new',
  calendar: '/admin/calendar',
  customers: '/admin/customers',
  drivers: '/admin/drivers',
  settings: '/admin/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Dynamic detail path for a booking id (admin). */
export function bookingDetailPath(id: string): string {
  return `${ROUTES.bookings}/${id}`;
}

/** Dynamic edit path for a booking id (admin). */
export function bookingEditPath(id: string): string {
  return `${ROUTES.bookings}/${id}/edit`;
}

/** Dynamic detail path for a vehicle id (admin). */
export function vehicleDetailPath(id: string): string {
  return `${ROUTES.vehicles}/${id}`;
}

/** Dynamic edit path for a vehicle id (admin). */
export function vehicleEditPath(id: string): string {
  return `${ROUTES.vehicles}/${id}/edit`;
}

/** Customer booking request detail path (future booking flow). */
export function customerBookingPath(bookingId: string): string {
  return `/booking/${bookingId}`;
}

/** Customer booking documents step (future booking flow). */
export function customerBookingDocumentsPath(bookingId: string): string {
  return `/booking/${bookingId}/documents`;
}

/** Customer booking payment step (future booking flow). */
export function customerBookingPaymentPath(bookingId: string): string {
  return `/booking/${bookingId}/payment`;
}

/** Customer booking confirmation step (future booking flow). */
export function customerBookingConfirmationPath(bookingId: string): string {
  return `/booking/${bookingId}/confirmation`;
}

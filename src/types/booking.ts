/**
 * Booking domain models.
 *
 * Row / insert / update shapes are aliases of generated Supabase types —
 * do not redefine column interfaces here.
 */

import type { PaginationParams, SortParams } from '@/types/pagination';
import type { BookingStatus, PaymentMethod, RentalMode } from '@/types/enums';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import type { Vehicle } from '@/types/vehicle';

/** Persisted booking row (`public.bookings`). */
export type Booking = Tables<'bookings'>;

/** Payload for inserting a booking (Supabase insert shape). */
export type BookingCreateInput = TablesInsert<'bookings'>;

/** Payload for updating a booking (Supabase update shape). */
export type BookingUpdateInput = TablesUpdate<'bookings'>;

/** Booking with its related vehicle (future joins / nested selects). */
export type BookingWithVehicle = Booking & {
  readonly vehicle: Vehicle;
};

/** Allowed sort columns for booking list queries. */
export type BookingSortField =
  | 'invoice_date'
  | 'delivery_date'
  | 'return_date'
  | 'created_at'
  | 'customer_name'
  | 'invoice_number';

/** Common list / filter inputs for booking queries. */
export interface BookingListFilters {
  readonly search?: string;
  readonly status?: BookingStatus;
  readonly vehicleId?: string;
  readonly mode?: RentalMode;
  readonly paymentMethod?: PaymentMethod;
  readonly deliveryDateFrom?: string;
  readonly deliveryDateTo?: string;
  readonly returnDateFrom?: string;
  readonly returnDateTo?: string;
  /** When false (default), soft-deleted (`cancelled`) rows are excluded. */
  readonly includeCancelled?: boolean;
  /**
   * Cursor-ready token for keyset pagination (unused by offset pagination today).
   * Reserved so list APIs can adopt cursors without breaking callers.
   */
  readonly cursor?: string;
}

/** Full list query: filters + pagination + sorting. */
export interface BookingListQuery
  extends BookingListFilters, Partial<PaginationParams>, SortParams<BookingSortField> {}

/** Vehicle overlap check input (availability architecture). */
export interface BookingVehicleOverlapQuery {
  readonly vehicleId: string;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly excludeBookingId?: string;
}

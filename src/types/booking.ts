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
  /**
   * Display status from the Status Automation Engine
   * (`upcoming` | `active` | `completed` | `cancelled` | `draft`).
   * Lifecycle filters use delivery/return dates — not raw DB enum equality.
   */
  readonly status?: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'draft' | BookingStatus;
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
   * When true, exclude `draft` rows (admin "Confirmed" bookings queue).
   * Ignored when `status` is set explicitly.
   */
  readonly excludeDraft?: boolean;
  /**
   * Cursor-ready token for keyset pagination (unused by offset pagination today).
   * Reserved so list APIs can adopt cursors without breaking callers.
   */
  readonly cursor?: string;
}

/** Full list query: filters + pagination + sorting. */
export interface BookingListQuery
  extends BookingListFilters, Partial<PaginationParams>, SortParams<BookingSortField> {}

/** Vehicle overlap check input (conflict / availability queries). */
export interface BookingVehicleOverlapQuery {
  readonly vehicleId: string;
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly excludeBookingId?: string;
}

/**
 * Fleet-wide overlap query for calendar / scheduler viewports.
 * Closed-interval overlap: delivery_date <= returnDate AND return_date >= deliveryDate.
 */
export interface BookingFleetOverlapQuery {
  readonly deliveryDate: string;
  readonly returnDate: string;
  readonly vehicleId?: string;
  readonly vehicleIds?: readonly string[];
  readonly driverName?: string;
  readonly search?: string;
  /** When false (default), cancelled rows are excluded. */
  readonly includeCancelled?: boolean;
  /** When true (default), draft rows are excluded from the schedule. */
  readonly excludeDraft?: boolean;
  readonly excludeBookingId?: string;
  /** Soft cap to avoid unbounded history loads (calendar viewports). */
  readonly limit?: number;
}

/** Input for the Booking Conflict Detection Engine. */
export interface BookingConflictCheckParams {
  readonly vehicleId: string;
  readonly deliveryDate: string;
  readonly returnDate: string;
  /** When editing, exclude this booking so it does not conflict with itself. */
  readonly excludeBookingId?: string;
}

/** One conflicting hire returned by the conflict engine. */
export interface BookingConflict {
  readonly bookingId: string;
  readonly invoiceNumber: string;
  readonly customerName: string;
  readonly status: BookingStatus;
  readonly deliveryDate: string;
  readonly returnDate: string;
}

/** Result of a conflict detection pass. */
export interface BookingConflictResult {
  readonly hasConflict: boolean;
  readonly conflicts: readonly BookingConflict[];
  /** Friendly message for the primary conflict (safe for UI). */
  readonly message?: string;
}

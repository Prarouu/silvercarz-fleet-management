/**
 * Booking service — business rules, authorization, and repository orchestration.
 *
 * Server Actions and future API routes call this layer only.
 * Never import the repository from UI code.
 */

import 'server-only';

import {
  createBookingNotFoundError,
  createBookingValidationError,
  createDuplicateInvoiceError,
  createInvalidBookingDatesError,
  createUnauthorizedBookingAccessError,
  createVehicleUnavailableError,
} from '@/features/bookings/errors';
import {
  createBookingRepository,
  getBookingRepository,
  type BookingRepository,
} from '@/features/bookings/repository';
import {
  buildInvoiceNumberSuggestion,
  calculateBookingAmount,
  calculateDurationDays,
  calculateTotalAmount,
  calculateTotalKilometers,
} from '@/features/bookings/service/booking-calculations';
import { PERMISSIONS, requirePermission, type AuthUser } from '@/lib/auth';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { fromPromise } from '@/services';
import type {
  Booking,
  BookingCreateInput,
  BookingListFilters,
  BookingListQuery,
  BookingUpdateInput,
  BookingWithVehicle,
  PaginatedResult,
} from '@/types';
import type { ApiResponse } from '@/types';
import {
  bookingListFiltersSchema,
  bookingListQuerySchema,
  createBookingSchema,
  updateBookingSchema,
  type CreateBookingValues,
  type UpdateBookingValues,
} from '@/validations';
import { BOOKING_STATUSES } from '@/types/enums';

export interface BookingServiceDeps {
  readonly repository?: BookingRepository;
  readonly client?: TypedSupabaseClient;
  /** Optional override for tests; defaults to `requirePermission`. */
  readonly requirePermission?: typeof requirePermission;
}

export interface BookingService {
  createBooking(input: unknown): Promise<ApiResponse<Booking>>;
  updateBooking(id: string, input: unknown): Promise<ApiResponse<Booking>>;
  /** Soft-delete (status → cancelled). Preferred application delete. */
  deleteBooking(id: string): Promise<ApiResponse<Booking>>;
  /** Permanent delete — reserved for trusted admin flows. */
  permanentlyDeleteBooking(id: string): Promise<ApiResponse<null>>;
  getBooking(id: string): Promise<ApiResponse<Booking>>;
  getBookingWithVehicle(id: string): Promise<ApiResponse<BookingWithVehicle>>;
  getBookingByInvoiceNumber(invoiceNumber: string): Promise<ApiResponse<Booking>>;
  listBookings(query?: BookingListQuery): Promise<ApiResponse<PaginatedResult<Booking>>>;
  searchBookings(
    search: string,
    query?: BookingListQuery,
  ): Promise<ApiResponse<PaginatedResult<Booking>>>;
  countBookings(filters?: BookingListFilters): Promise<ApiResponse<number>>;
  /** Extension point for sequential invoice numbers. */
  suggestInvoiceNumber(sequence: number, issuedOn?: string): string;
}

function assertValidDates(deliveryDate: string, returnDate: string): void {
  if (returnDate < deliveryDate) {
    throw createInvalidBookingDatesError();
  }
}

function parseCreateInput(input: unknown): CreateBookingValues {
  const parsed = createBookingSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw createBookingValidationError(first?.message ?? 'Invalid booking details.');
  }

  return parsed.data;
}

function parseUpdateInput(input: unknown): UpdateBookingValues {
  const parsed = updateBookingSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw createBookingValidationError(first?.message ?? 'Invalid booking details.');
  }

  return parsed.data;
}

async function ensureInvoiceUnique(
  repository: BookingRepository,
  invoiceNumber: string,
  excludeBookingId?: string,
): Promise<void> {
  const existing = await repository.findByInvoiceNumber(invoiceNumber);

  if (existing && existing.id !== excludeBookingId) {
    throw createDuplicateInvoiceError(invoiceNumber);
  }
}

async function ensureVehicleAvailable(
  repository: BookingRepository,
  params: {
    vehicleId: string;
    deliveryDate: string;
    returnDate: string;
    excludeBookingId?: string;
    /** Skip overlap enforcement for draft / cancelled targets. */
    status?: string | null;
  },
): Promise<void> {
  if (params.status === BOOKING_STATUSES.cancelled || params.status === BOOKING_STATUSES.draft) {
    return;
  }

  const overlaps = await repository.findOverlappingForVehicle({
    vehicleId: params.vehicleId,
    deliveryDate: params.deliveryDate,
    returnDate: params.returnDate,
    excludeBookingId: params.excludeBookingId,
  });

  if (overlaps.length > 0) {
    throw createVehicleUnavailableError();
  }
}

function applyCreateDerivedFields(
  values: CreateBookingValues,
  actor: AuthUser,
): BookingCreateInput {
  assertValidDates(values.delivery_date, values.return_date);

  const duration =
    values.duration ?? calculateDurationDays(values.delivery_date, values.return_date);
  const totalKilometers =
    values.total_kilometers ?? calculateTotalKilometers(values.start_odometer, values.end_odometer);
  const bookingAmount =
    values.booking_amount > 0
      ? values.booking_amount
      : calculateBookingAmount({
          dailyCharge: values.daily_charge,
          durationDays: duration,
          kilometerRate: values.kilometer_rate,
          totalKilometers,
        });
  const totalAmount =
    values.total_amount > 0 ? values.total_amount : calculateTotalAmount(bookingAmount);

  return {
    ...values,
    duration,
    total_kilometers: totalKilometers,
    booking_amount: bookingAmount,
    total_amount: totalAmount,
    created_by: values.created_by ?? actor.id,
  };
}

function applyUpdateDerivedFields(
  existing: Booking,
  values: UpdateBookingValues,
): BookingUpdateInput {
  const deliveryDate = values.delivery_date ?? existing.delivery_date;
  const returnDate = values.return_date ?? existing.return_date;
  assertValidDates(deliveryDate, returnDate);

  const startOdometer =
    values.start_odometer !== undefined ? values.start_odometer : existing.start_odometer;
  const endOdometer =
    values.end_odometer !== undefined ? values.end_odometer : existing.end_odometer;
  const dailyCharge = values.daily_charge ?? existing.daily_charge;
  const kilometerRate =
    values.kilometer_rate !== undefined ? values.kilometer_rate : existing.kilometer_rate;

  const shouldRecalculateDuration =
    values.duration === undefined &&
    (values.delivery_date !== undefined || values.return_date !== undefined);
  const duration = shouldRecalculateDuration
    ? calculateDurationDays(deliveryDate, returnDate)
    : (values.duration ?? existing.duration);

  const shouldRecalculateKm =
    values.total_kilometers === undefined &&
    (values.start_odometer !== undefined || values.end_odometer !== undefined);
  const totalKilometers = shouldRecalculateKm
    ? calculateTotalKilometers(startOdometer, endOdometer)
    : (values.total_kilometers ?? existing.total_kilometers);

  const shouldRecalculateAmounts =
    values.booking_amount === undefined &&
    (values.daily_charge !== undefined ||
      values.delivery_date !== undefined ||
      values.return_date !== undefined ||
      values.duration !== undefined ||
      values.kilometer_rate !== undefined ||
      values.start_odometer !== undefined ||
      values.end_odometer !== undefined ||
      values.total_kilometers !== undefined);

  const bookingAmount = shouldRecalculateAmounts
    ? calculateBookingAmount({
        dailyCharge,
        durationDays: duration ?? calculateDurationDays(deliveryDate, returnDate),
        kilometerRate,
        totalKilometers,
      })
    : (values.booking_amount ?? existing.booking_amount);

  const totalAmount =
    values.total_amount !== undefined
      ? values.total_amount
      : shouldRecalculateAmounts
        ? calculateTotalAmount(bookingAmount)
        : existing.total_amount;

  return {
    ...values,
    duration,
    total_kilometers: totalKilometers,
    booking_amount: bookingAmount,
    total_amount: totalAmount,
  };
}

export function createBookingService(deps: BookingServiceDeps = {}): BookingService {
  const requirePerm = deps.requirePermission ?? requirePermission;

  async function getRepository(): Promise<BookingRepository> {
    if (deps.repository) {
      return deps.repository;
    }

    if (deps.client) {
      return createBookingRepository(deps.client);
    }

    return getBookingRepository();
  }

  const service: BookingService = {
    createBooking(input) {
      return fromPromise(async () => {
        const actor = await requirePerm(PERMISSIONS.bookingsWrite);
        const repository = await getRepository();
        const values = parseCreateInput(input);
        const payload = applyCreateDerivedFields(values, actor);

        await ensureInvoiceUnique(repository, payload.invoice_number);
        await ensureVehicleAvailable(repository, {
          vehicleId: payload.vehicle_id,
          deliveryDate: payload.delivery_date,
          returnDate: payload.return_date,
          status: payload.status,
        });

        return repository.create(payload);
      });
    },

    updateBooking(id, input) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsWrite);
        const repository = await getRepository();
        const existing = await repository.findById(id);

        if (!existing) {
          throw createBookingNotFoundError();
        }

        const values = parseUpdateInput(input);
        const payload = applyUpdateDerivedFields(existing, values);

        if (payload.invoice_number) {
          await ensureInvoiceUnique(repository, payload.invoice_number, id);
        }

        const vehicleId = payload.vehicle_id ?? existing.vehicle_id;
        const deliveryDate = payload.delivery_date ?? existing.delivery_date;
        const returnDate = payload.return_date ?? existing.return_date;
        const status = payload.status ?? existing.status;

        await ensureVehicleAvailable(repository, {
          vehicleId,
          deliveryDate,
          returnDate,
          excludeBookingId: id,
          status,
        });

        return repository.update(id, payload);
      });
    },

    deleteBooking(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsDelete);
        const repository = await getRepository();
        const existing = await repository.findById(id);

        if (!existing) {
          throw createBookingNotFoundError();
        }

        return repository.softDelete(id);
      });
    },

    permanentlyDeleteBooking(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsDelete);
        const repository = await getRepository();
        await repository.delete(id);
        return null;
      });
    },

    getBooking(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const repository = await getRepository();
        const booking = await repository.findById(id);

        if (!booking) {
          throw createBookingNotFoundError();
        }

        return booking;
      });
    },

    getBookingWithVehicle(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const repository = await getRepository();
        const booking = await repository.findByIdWithVehicle(id);

        if (!booking) {
          // Distinguish missing booking vs missing vehicle join.
          const bare = await repository.findById(id);
          if (!bare) {
            throw createBookingNotFoundError();
          }
          throw createBookingValidationError('Booking vehicle could not be loaded.');
        }

        return booking;
      });
    },

    getBookingByInvoiceNumber(invoiceNumber) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const normalized = invoiceNumber.trim().toUpperCase();

        if (!normalized) {
          throw createBookingValidationError('Invoice number is required.');
        }

        const repository = await getRepository();
        const booking = await repository.findByInvoiceNumber(normalized);

        if (!booking) {
          throw createBookingNotFoundError();
        }

        return booking;
      });
    },

    listBookings(query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const parsed = bookingListQuerySchema.safeParse(query);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createBookingValidationError(first?.message ?? 'Invalid list query.');
        }

        const repository = await getRepository();
        return repository.list(parsed.data);
      });
    },

    searchBookings(search, query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const term = search.trim();

        if (!term) {
          throw createBookingValidationError('Search term is required.');
        }

        const parsed = bookingListQuerySchema.safeParse(query);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createBookingValidationError(first?.message ?? 'Invalid search query.');
        }

        const repository = await getRepository();
        return repository.search(term, parsed.data);
      });
    },

    countBookings(filters = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsRead);
        const parsed = bookingListFiltersSchema.safeParse(filters);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createBookingValidationError(first?.message ?? 'Invalid booking filters.');
        }

        const repository = await getRepository();
        return repository.count(parsed.data);
      });
    },

    suggestInvoiceNumber(sequence, issuedOn) {
      return buildInvoiceNumberSuggestion({ sequence, issuedOn });
    },
  };

  return service;
}

/** Default request-scoped service (server client + live auth). */
export function getBookingService(): BookingService {
  return createBookingService();
}

/** Exported for rare cases where a caller needs an explicit unauthorized error. */
export { createUnauthorizedBookingAccessError };

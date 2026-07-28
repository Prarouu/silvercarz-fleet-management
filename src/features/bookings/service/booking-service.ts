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
  calculateBookingAmount,
  calculateDurationDays,
  calculateTotalAmount,
  calculateTotalKilometers,
} from '@/features/bookings/service/booking-calculations';
import {
  createConflictService,
  getConflictService,
  type ConflictService,
} from '@/features/bookings/service/conflict.service';
import {
  createInvoiceNumberService,
  getInvoiceNumberService,
  type InvoiceNumberService,
} from '@/features/bookings/service/invoice-number.service';
import {
  createAvailabilityService,
  getAvailabilityService,
  type AvailabilityService,
} from '@/features/vehicles/service/availability.service';
import { PERMISSIONS, requirePermission, type AuthUser } from '@/lib/auth';
import { AppError } from '@/lib/errors';
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
  readonly invoiceNumberService?: InvoiceNumberService;
  readonly availabilityService?: AvailabilityService;
  readonly conflictService?: ConflictService;
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
  listBookings(query?: BookingListQuery): Promise<ApiResponse<PaginatedResult<BookingWithVehicle>>>;
  searchBookings(
    search: string,
    query?: BookingListQuery,
  ): Promise<ApiResponse<PaginatedResult<BookingWithVehicle>>>;
  countBookings(filters?: BookingListFilters): Promise<ApiResponse<number>>;
  /** Non-allocating preview for the create form. */
  previewNextInvoiceNumber(issuedOn?: string): Promise<string>;
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

/**
 * Operational bookability + schedule conflict detection.
 * Conflict rules live in ConflictService — never duplicate them here.
 */
async function ensureVehicleScheduleClear(
  availability: AvailabilityService,
  conflict: ConflictService,
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

  try {
    await availability.assertVehicleBookable(params.vehicleId);
  } catch (error) {
    if (error instanceof AppError) {
      throw createVehicleUnavailableError(error.message);
    }
    throw error;
  }

  await conflict.assertNoConflict({
    vehicleId: params.vehicleId,
    deliveryDate: params.deliveryDate,
    returnDate: params.returnDate,
    excludeBookingId: params.excludeBookingId,
    status: params.status,
  });
}

function applyCreateDerivedFields(
  values: CreateBookingValues,
  actor: AuthUser,
  invoiceNumber: string,
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
    invoice_number: invoiceNumber,
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

  function getInvoiceService(): InvoiceNumberService {
    if (deps.invoiceNumberService) {
      return deps.invoiceNumberService;
    }

    if (deps.client) {
      return createInvoiceNumberService({ client: deps.client });
    }

    return getInvoiceNumberService();
  }

  function getAvailability(): AvailabilityService {
    if (deps.availabilityService) {
      return deps.availabilityService;
    }

    if (deps.client) {
      return createAvailabilityService({
        client: deps.client,
        requirePermission: requirePerm,
      });
    }

    return getAvailabilityService();
  }

  function getConflict(): ConflictService {
    if (deps.conflictService) {
      return deps.conflictService;
    }

    if (deps.client) {
      return createConflictService({ client: deps.client });
    }

    return getConflictService();
  }

  async function syncVehicleAvailability(vehicleId: string | null | undefined): Promise<void> {
    if (!vehicleId) {
      return;
    }

    await getAvailability().syncAvailabilityFromBookings(vehicleId);
  }

  const service: BookingService = {
    createBooking(input) {
      return fromPromise(async () => {
        const actor = await requirePerm(PERMISSIONS.bookingsWrite);
        const repository = await getRepository();
        const invoiceService = getInvoiceService();
        const availability = getAvailability();
        const conflict = getConflict();
        const values = parseCreateInput(input);

        assertValidDates(values.delivery_date, values.return_date);

        // Validate → operational status → conflict → invoice → save
        await ensureVehicleScheduleClear(availability, conflict, {
          vehicleId: values.vehicle_id,
          deliveryDate: values.delivery_date,
          returnDate: values.return_date,
          status: values.status,
        });

        const invoiceNumber = await invoiceService.generateNextInvoiceNumber({
          issuedOn: values.invoice_date,
        });
        const payload = applyCreateDerivedFields(values, actor, invoiceNumber);

        await ensureInvoiceUnique(repository, payload.invoice_number);

        const created = await repository.create(payload);
        await syncVehicleAvailability(created.vehicle_id);
        return created;
      });
    },

    updateBooking(id, input) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsWrite);
        const repository = await getRepository();
        const availability = getAvailability();
        const conflict = getConflict();
        const existing = await repository.findById(id);

        if (!existing) {
          throw createBookingNotFoundError();
        }

        const values = parseUpdateInput(input);
        const { invoice_number: _ignoredInvoice, ...safeValues } = values;
        const payload = applyUpdateDerivedFields(existing, safeValues);

        const vehicleId = payload.vehicle_id ?? existing.vehicle_id;
        const deliveryDate = payload.delivery_date ?? existing.delivery_date;
        const returnDate = payload.return_date ?? existing.return_date;
        const status = payload.status ?? existing.status;

        await ensureVehicleScheduleClear(availability, conflict, {
          vehicleId,
          deliveryDate,
          returnDate,
          excludeBookingId: id,
          status,
        });

        const updated = await repository.update(id, payload);

        await syncVehicleAvailability(existing.vehicle_id);
        if (updated.vehicle_id !== existing.vehicle_id) {
          await syncVehicleAvailability(updated.vehicle_id);
        }

        return updated;
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

        const cancelled = await repository.softDelete(id);
        await syncVehicleAvailability(existing.vehicle_id);
        return cancelled;
      });
    },

    permanentlyDeleteBooking(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.bookingsDelete);
        const repository = await getRepository();
        const existing = await repository.findById(id);
        const vehicleId = existing?.vehicle_id;
        await repository.delete(id);
        await syncVehicleAvailability(vehicleId);
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

    previewNextInvoiceNumber(issuedOn) {
      return getInvoiceService().previewNextInvoiceNumber({ issuedOn });
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

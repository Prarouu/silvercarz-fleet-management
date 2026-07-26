/**
 * Vehicle service — business rules, authorization, and repository orchestration.
 *
 * Server Actions and future API routes call this layer only.
 * Never import the repository from UI code.
 */

import 'server-only';

import {
  createDuplicateVehicleNumberError,
  createInactiveVehicleError,
  createUnauthorizedVehicleAccessError,
  createVehicleNotFoundError,
  createVehicleValidationError,
} from '@/features/vehicles/errors';
import {
  createVehicleRepository,
  getVehicleRepository,
  type VehicleRepository,
} from '@/features/vehicles/repository';
import { PERMISSIONS, requirePermission } from '@/lib/auth';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { fromPromise } from '@/services';
import type {
  PaginatedResult,
  Vehicle,
  VehicleAvailabilityQuery,
  VehicleCreateInput,
  VehicleListFilters,
  VehicleListQuery,
  VehicleUpdateInput,
} from '@/types';
import type { ApiResponse } from '@/types';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleListFiltersSchema,
  vehicleListQuerySchema,
  type CreateVehicleValues,
  type UpdateVehicleValues,
} from '@/validations';

export interface VehicleServiceDeps {
  readonly repository?: VehicleRepository;
  readonly client?: TypedSupabaseClient;
  /** Optional override for tests; defaults to `requirePermission`. */
  readonly requirePermission?: typeof requirePermission;
}

export interface VehicleService {
  createVehicle(input: unknown): Promise<ApiResponse<Vehicle>>;
  updateVehicle(id: string, input: unknown): Promise<ApiResponse<Vehicle>>;
  /** Soft-delete (`is_active → false`). Preferred application delete. */
  deleteVehicle(id: string): Promise<ApiResponse<Vehicle>>;
  /** Permanent delete — reserved for trusted admin flows. */
  permanentlyDeleteVehicle(id: string): Promise<ApiResponse<null>>;
  getVehicle(id: string): Promise<ApiResponse<Vehicle>>;
  getVehicleByNumber(vehicleNumber: string): Promise<ApiResponse<Vehicle>>;
  listVehicles(query?: VehicleListQuery): Promise<ApiResponse<PaginatedResult<Vehicle>>>;
  searchVehicles(
    search: string,
    query?: VehicleListQuery,
  ): Promise<ApiResponse<PaginatedResult<Vehicle>>>;
  countVehicles(filters?: VehicleListFilters): Promise<ApiResponse<number>>;
  /**
   * Architecture-ready availability helper.
   * Today: active vehicles only. Future: booking conflict window.
   */
  isVehicleAvailable(query: VehicleAvailabilityQuery): Promise<ApiResponse<boolean>>;
  /**
   * Ensures a vehicle exists and is active — for future booking / hire flows.
   */
  requireActiveVehicle(id: string): Promise<ApiResponse<Vehicle>>;
}

function parseCreateInput(input: unknown): CreateVehicleValues {
  const parsed = createVehicleSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw createVehicleValidationError(first?.message ?? 'Invalid vehicle details.');
  }

  return parsed.data;
}

function parseUpdateInput(input: unknown): UpdateVehicleValues {
  const parsed = updateVehicleSchema.safeParse(input);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw createVehicleValidationError(first?.message ?? 'Invalid vehicle details.');
  }

  return parsed.data;
}

function normalizeVehicleNumber(vehicleNumber: string): string {
  return vehicleNumber.replace(/\s+/g, '').toUpperCase();
}

async function ensureVehicleNumberUnique(
  repository: VehicleRepository,
  vehicleNumber: string,
  excludeVehicleId?: string,
): Promise<void> {
  const existing = await repository.findByNumber(vehicleNumber);

  if (existing && existing.id !== excludeVehicleId) {
    throw createDuplicateVehicleNumberError(vehicleNumber);
  }
}

function toCreatePayload(values: CreateVehicleValues): VehicleCreateInput {
  return {
    ...values,
    vehicle_number: normalizeVehicleNumber(values.vehicle_number),
  };
}

function toUpdatePayload(values: UpdateVehicleValues): VehicleUpdateInput {
  return {
    ...values,
    ...(values.vehicle_number !== undefined
      ? { vehicle_number: normalizeVehicleNumber(values.vehicle_number) }
      : {}),
  };
}

export function createVehicleService(deps: VehicleServiceDeps = {}): VehicleService {
  const requirePerm = deps.requirePermission ?? requirePermission;

  async function getRepository(): Promise<VehicleRepository> {
    if (deps.repository) {
      return deps.repository;
    }

    if (deps.client) {
      return createVehicleRepository(deps.client);
    }

    return getVehicleRepository();
  }

  const service: VehicleService = {
    createVehicle(input) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesWrite);
        const repository = await getRepository();
        const values = parseCreateInput(input);
        const payload = toCreatePayload(values);

        await ensureVehicleNumberUnique(repository, payload.vehicle_number);

        return repository.create(payload);
      });
    },

    updateVehicle(id, input) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesWrite);
        const repository = await getRepository();
        const existing = await repository.findById(id);

        if (!existing) {
          throw createVehicleNotFoundError();
        }

        const values = parseUpdateInput(input);
        const payload = toUpdatePayload(values);

        if (payload.vehicle_number) {
          await ensureVehicleNumberUnique(repository, payload.vehicle_number, id);
        }

        return repository.update(id, payload);
      });
    },

    deleteVehicle(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesDelete);
        const repository = await getRepository();
        const existing = await repository.findById(id);

        if (!existing) {
          throw createVehicleNotFoundError();
        }

        return repository.softDelete(id);
      });
    },

    permanentlyDeleteVehicle(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesDelete);
        const repository = await getRepository();
        await repository.delete(id);
        return null;
      });
    },

    getVehicle(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getRepository();
        const vehicle = await repository.findById(id);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        return vehicle;
      });
    },

    getVehicleByNumber(vehicleNumber) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const normalized = normalizeVehicleNumber(vehicleNumber.trim());

        if (!normalized) {
          throw createVehicleValidationError('Vehicle number is required.');
        }

        const repository = await getRepository();
        const vehicle = await repository.findByNumber(normalized);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        return vehicle;
      });
    },

    listVehicles(query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const parsed = vehicleListQuerySchema.safeParse(query);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createVehicleValidationError(first?.message ?? 'Invalid list query.');
        }

        const repository = await getRepository();
        return repository.list(parsed.data);
      });
    },

    searchVehicles(search, query = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const term = search.trim();

        if (!term) {
          throw createVehicleValidationError('Search term is required.');
        }

        const parsed = vehicleListQuerySchema.safeParse(query);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createVehicleValidationError(first?.message ?? 'Invalid search query.');
        }

        const repository = await getRepository();
        return repository.search(term, parsed.data);
      });
    },

    countVehicles(filters = {}) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const parsed = vehicleListFiltersSchema.safeParse(filters);

        if (!parsed.success) {
          const first = parsed.error.issues[0];
          throw createVehicleValidationError(first?.message ?? 'Invalid vehicle filters.');
        }

        const repository = await getRepository();
        return repository.count(parsed.data);
      });
    },

    isVehicleAvailable(query) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getRepository();
        const vehicle = await repository.findById(query.vehicleId);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        // Architecture only: active check today.
        // Future: honor deliveryDate / returnDate / excludeBookingId for conflicts.
        if (!vehicle.is_active) {
          return false;
        }

        return true;
      });
    },

    requireActiveVehicle(id) {
      return fromPromise(async () => {
        await requirePerm(PERMISSIONS.vehiclesRead);
        const repository = await getRepository();
        const vehicle = await repository.findById(id);

        if (!vehicle) {
          throw createVehicleNotFoundError();
        }

        if (!vehicle.is_active) {
          throw createInactiveVehicleError();
        }

        return vehicle;
      });
    },
  };

  return service;
}

/** Default request-scoped service (server client + live auth). */
export function getVehicleService(): VehicleService {
  return createVehicleService();
}

/** Exported for rare cases where a caller needs an explicit unauthorized error. */
export { createUnauthorizedVehicleAccessError };

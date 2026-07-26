'use server';

/**
 * Clear a vehicle's image: remove the Storage object (when enabled) and null
 * `image_path` via `setVehicleImagePath` (avoids full update-schema rewrites).
 */

import { VEHICLE_ERROR_CODES, createVehicleNotFoundError } from '@/features/vehicles/errors';
import {
  isVehicleImageUploadEnabled,
  removeVehicleImage,
} from '@/features/vehicles/lib/vehicle-image-storage';
import { getVehicleService } from '@/features/vehicles/service';
import { AppError } from '@/lib/errors';
import { fromPromise } from '@/services';
import type { ApiResponse } from '@/types';

export type RemoveVehicleImageResult = {
  readonly cleared: boolean;
  readonly skipped: boolean;
};

export async function removeVehicleImageAction(
  vehicleId: string,
): Promise<ApiResponse<RemoveVehicleImageResult>> {
  return fromPromise(async () => {
    const service = getVehicleService();
    const existing = await service.getVehicle(vehicleId);

    if (!existing.success) {
      throw new AppError(
        existing.error.message || 'Vehicle not found.',
        existing.error.code || VEHICLE_ERROR_CODES.notFound,
      );
    }

    const previousPath = existing.data.image_path;

    if (!previousPath) {
      return { cleared: false, skipped: true };
    }

    if (isVehicleImageUploadEnabled()) {
      await removeVehicleImage({ path: previousPath });
    }

    const updateResult = await service.setVehicleImagePath(vehicleId, null);

    if (!updateResult.success) {
      if (updateResult.error.code === VEHICLE_ERROR_CODES.notFound) {
        throw createVehicleNotFoundError();
      }

      throw new AppError(
        updateResult.error.message || 'Unable to clear the vehicle image.',
        updateResult.error.code || VEHICLE_ERROR_CODES.storageFailure,
      );
    }

    return { cleared: true, skipped: false };
  });
}

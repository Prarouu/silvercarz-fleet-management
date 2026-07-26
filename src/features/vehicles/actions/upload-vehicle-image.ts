'use server';

/**
 * Upload a vehicle image and persist `image_path` on the vehicle row.
 *
 * Uses `setVehicleImagePath` (not `updateVehicle`) so create-time status fields
 * cannot be rewritten by update-schema defaults.
 */

import { VEHICLE_ERROR_CODES, createVehicleValidationError } from '@/features/vehicles/errors';
import {
  isVehicleImageUploadEnabled,
  removeVehicleImage,
  uploadVehicleImage,
} from '@/features/vehicles/lib/vehicle-image-storage';
import { getVehicleService } from '@/features/vehicles/service';
import { AppError } from '@/lib/errors';
import { fromPromise } from '@/services';
import type { ApiResponse } from '@/types';

export type UploadVehicleImageResult = {
  readonly path: string;
  readonly skipped: boolean;
};

export async function uploadVehicleImageAction(
  vehicleId: string,
  formData: FormData,
): Promise<ApiResponse<UploadVehicleImageResult>> {
  return fromPromise(async () => {
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw createVehicleValidationError('Select an image to upload.');
    }

    if (!isVehicleImageUploadEnabled()) {
      return { path: '', skipped: true };
    }

    const service = getVehicleService();
    const existing = await service.getVehicle(vehicleId);
    const previousPath = existing.success ? existing.data.image_path : null;

    const uploaded = await uploadVehicleImage({ vehicleId, file });

    if (!uploaded) {
      return { path: '', skipped: true };
    }

    const updateResult = await service.setVehicleImagePath(vehicleId, uploaded.path);

    if (!updateResult.success) {
      throw new AppError(
        updateResult.error.message || 'Unable to save the vehicle image path.',
        updateResult.error.code || VEHICLE_ERROR_CODES.storageFailure,
      );
    }

    // Best-effort cleanup of the previous object after a successful replace.
    if (previousPath && previousPath !== uploaded.path) {
      try {
        await removeVehicleImage({ path: previousPath });
      } catch {
        // Keep the new path; orphan cleanup can be handled later.
      }
    }

    return { path: uploaded.path, skipped: false };
  });
}

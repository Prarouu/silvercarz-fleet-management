'use server';

/**
 * Upload a vehicle image and persist `image_path` on the vehicle row.
 *
 * Storage details live in `vehicle-image-storage` so the form can stay stable
 * when the bucket is provisioned or toggled.
 */

import { createVehicleValidationError } from '@/features/vehicles/errors';
import {
  isVehicleImageUploadEnabled,
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

    const uploaded = await uploadVehicleImage({ vehicleId, file });

    if (!uploaded) {
      return { path: '', skipped: true };
    }

    const updateResult = await getVehicleService().updateVehicle(vehicleId, {
      image_path: uploaded.path,
    });

    if (!updateResult.success) {
      throw new AppError(
        updateResult.error.message || 'Unable to save the vehicle image path.',
        updateResult.error.code || 'storage_failure',
      );
    }

    return { path: uploaded.path, skipped: false };
  });
}

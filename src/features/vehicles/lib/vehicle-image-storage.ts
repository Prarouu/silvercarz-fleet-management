/**
 * Vehicle image Storage abstraction.
 *
 * Isolates Supabase Storage so the Add Vehicle form can stay stable while
 * bucket / RLS configuration is completed in each environment.
 */

import 'server-only';

import { VEHICLE_IMAGE } from '@/constants/vehicle-image';
import {
  createVehicleStorageFailureError,
  createVehicleValidationError,
} from '@/features/vehicles/errors';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ACCEPT_MIME = new Set<string>(VEHICLE_IMAGE.acceptMimeTypes);

export type VehicleImageUploadResult = {
  readonly path: string;
  readonly publicUrl: string | null;
};

export function isVehicleImageUploadEnabled(): boolean {
  return VEHICLE_IMAGE.uploadEnabled;
}

export function validateVehicleImageFile(file: File): void {
  if (!ACCEPT_MIME.has(file.type)) {
    throw createVehicleValidationError('Use a JPG, PNG, or WEBP image.');
  }

  if (file.size <= 0) {
    throw createVehicleValidationError('The selected image is empty.');
  }

  if (file.size > VEHICLE_IMAGE.maxBytes) {
    throw createVehicleValidationError('Image must be 5 MB or smaller.');
  }
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function buildObjectPath(vehicleId: string, mime: string): string {
  const stamp = Date.now().toString(36);
  return `${vehicleId}/${stamp}.${extensionForMime(mime)}`;
}

/**
 * Uploads a vehicle image when Storage is enabled.
 * Returns `null` (no-op) when upload is disabled so callers can proceed without
 * changing form flow later.
 */
export async function uploadVehicleImage(params: {
  readonly vehicleId: string;
  readonly file: File;
  readonly client?: TypedSupabaseClient;
}): Promise<VehicleImageUploadResult | null> {
  validateVehicleImageFile(params.file);

  if (!isVehicleImageUploadEnabled()) {
    return null;
  }

  const client = params.client ?? (await createSupabaseServerClient());
  const path = buildObjectPath(params.vehicleId, params.file.type);

  const { error } = await client.storage.from(VEHICLE_IMAGE.bucket).upload(path, params.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: params.file.type,
  });

  if (error) {
    throw createVehicleStorageFailureError(
      'Unable to upload the vehicle image. Please try again.',
      error,
    );
  }

  const { data } = client.storage.from(VEHICLE_IMAGE.bucket).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl || null,
  };
}

/** Removes a stored object. Safe no-op when upload is disabled or path is empty. */
export async function removeVehicleImage(params: {
  readonly path: string | null | undefined;
  readonly client?: TypedSupabaseClient;
}): Promise<void> {
  const path = params.path?.trim();
  if (!path || !isVehicleImageUploadEnabled()) {
    return;
  }

  const client = params.client ?? (await createSupabaseServerClient());
  const { error } = await client.storage.from(VEHICLE_IMAGE.bucket).remove([path]);

  if (error) {
    throw createVehicleStorageFailureError(
      'Unable to remove the previous vehicle image. Please try again.',
      error,
    );
  }
}

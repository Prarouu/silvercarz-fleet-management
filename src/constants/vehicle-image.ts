/**
 * Vehicle image upload constraints and Storage identifiers.
 *
 * Keep MIME / size rules here so the form UI and Storage abstraction stay aligned.
 */

export const VEHICLE_IMAGE = {
  /** Supabase Storage bucket id (see vehicles migration). */
  bucket: 'vehicle-images',
  /**
   * When false, the form still collects a previewable file but upload is a no-op.
   * Flip to true after the `vehicle-images` bucket migration is applied.
   */
  uploadEnabled: true,
  maxBytes: 5 * 1024 * 1024,
  acceptMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  acceptAttribute: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
} as const;

export type VehicleImageMimeType = (typeof VEHICLE_IMAGE.acceptMimeTypes)[number];

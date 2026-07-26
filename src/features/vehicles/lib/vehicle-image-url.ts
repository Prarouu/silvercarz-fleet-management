/**
 * Client-safe helpers for resolving vehicle Storage paths to public URLs.
 */

import { VEHICLE_IMAGE } from '@/constants/vehicle-image';
import { supabaseConfig } from '@/lib/supabase/config';

/** Builds a public Supabase Storage URL from a stored `image_path`, or null. */
export function getVehicleImagePublicUrl(imagePath: string | null | undefined): string | null {
  const path = imagePath?.trim();
  if (!path) {
    return null;
  }

  // Already a full URL (defensive — rows should store object paths only).
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = supabaseConfig.url.replace(/\/$/, '');
  const objectPath = path.replace(/^\/+/, '');
  return `${base}/storage/v1/object/public/${VEHICLE_IMAGE.bucket}/${objectPath}`;
}

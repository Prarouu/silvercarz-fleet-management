/**
 * Client-safe booking document file validation (UX only).
 * Server-side validation in Storage helpers remains authoritative.
 */

import { BOOKING_DOCUMENT } from '@/constants/booking-documents';

const ACCEPT_MIME = new Set<string>(BOOKING_DOCUMENT.acceptMimeTypes);

export function validateBookingDocumentFileClient(file: File): string | null {
  if (!ACCEPT_MIME.has(file.type)) {
    return 'Use a PDF, JPG, or PNG file.';
  }

  if (file.size <= 0) {
    return 'The selected file is empty.';
  }

  if (file.size > BOOKING_DOCUMENT.maxBytes) {
    return 'File must be 5 MB or smaller.';
  }

  return null;
}

export function formatDocumentFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

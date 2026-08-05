/**
 * Booking document domain models (C4).
 */

import type { BookingDocumentType } from '@/constants/booking-documents';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

/** Persisted booking document metadata (`public.booking_documents`). */
export type BookingDocument = Tables<'booking_documents'>;

export type BookingDocumentCreateInput = TablesInsert<'booking_documents'>;

export type BookingDocumentUpdateInput = TablesUpdate<'booking_documents'>;

/** Safe client-facing document metadata (no storage path leakage by default). */
export type BookingDocumentSummary = {
  readonly id: string;
  readonly bookingId: string;
  readonly documentType: BookingDocumentType;
  readonly fileName: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export function toBookingDocumentSummary(row: BookingDocument): BookingDocumentSummary {
  return {
    id: row.id,
    bookingId: row.booking_id,
    documentType: row.document_type as BookingDocumentType,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

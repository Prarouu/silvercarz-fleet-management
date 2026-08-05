'use server';

/**
 * Customer booking document Server Actions (C4).
 */

import { getBookingDocumentService } from '@/features/booking-documents/service/booking-document-service';
import type { ApiResponse, Booking, BookingDocumentSummary } from '@/types';

export async function listOwnBookingDocuments(
  bookingId: string,
): Promise<ApiResponse<BookingDocumentSummary[]>> {
  return getBookingDocumentService().listOwnDocuments(bookingId);
}

export async function uploadOwnBookingDocument(
  formData: FormData,
): Promise<ApiResponse<BookingDocumentSummary>> {
  const bookingId = String(formData.get('bookingId') ?? '');
  const documentType = String(formData.get('documentType') ?? '');
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return {
      success: false,
      error: {
        code: 'validation',
        message: 'Select a file to upload.',
      },
    };
  }

  return getBookingDocumentService().uploadOwnDocument({
    bookingId,
    documentType,
    file,
  });
}

export async function deleteOwnBookingDocument(input: {
  readonly bookingId: string;
  readonly documentType: string;
}): Promise<ApiResponse<{ readonly deleted: true }>> {
  return getBookingDocumentService().deleteOwnDocument(input);
}

export async function submitOwnBookingDocuments(bookingId: string): Promise<ApiResponse<Booking>> {
  return getBookingDocumentService().submitOwnDocuments(bookingId);
}

export async function getOwnBookingDocumentSignedUrl(input: {
  readonly bookingId: string;
  readonly documentType: string;
}): Promise<ApiResponse<{ readonly url: string }>> {
  return getBookingDocumentService().getOwnDocumentSignedUrl(input);
}

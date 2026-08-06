/**
 * Document completeness helpers for admin review and approval gates (C5).
 */

import {
  BOOKING_DOCUMENT_REQUIREMENTS,
  bookingDocumentLabel,
  requiredBookingDocumentTypes,
  type BookingDocumentType,
} from '@/constants/booking-documents';

export type BookingDocumentCompleteness = {
  readonly requiredCount: number;
  readonly submittedCount: number;
  readonly missingTypes: readonly BookingDocumentType[];
  readonly missingLabels: readonly string[];
  readonly isComplete: boolean;
};

export function getBookingDocumentCompleteness(
  uploadedTypes: readonly string[],
): BookingDocumentCompleteness {
  const required = requiredBookingDocumentTypes();
  const uploaded = new Set(uploadedTypes);
  const missingTypes = required.filter((type) => !uploaded.has(type));

  return {
    requiredCount: required.length,
    submittedCount: required.filter((type) => uploaded.has(type)).length,
    missingTypes,
    missingLabels: missingTypes.map((type) => bookingDocumentLabel(type)),
    isComplete: missingTypes.length === 0,
  };
}

export function formatBookingDocumentCompletenessLabel(
  completeness: Pick<
    BookingDocumentCompleteness,
    'submittedCount' | 'requiredCount' | 'isComplete'
  >,
): string {
  if (completeness.isComplete) {
    return 'Complete';
  }

  return `${completeness.submittedCount} / ${completeness.requiredCount}`;
}

export function bookingDocumentRequirementChecklist(uploadedTypes: readonly string[]): readonly {
  readonly type: BookingDocumentType;
  readonly label: string;
  readonly present: boolean;
}[] {
  const uploaded = new Set(uploadedTypes);
  return BOOKING_DOCUMENT_REQUIREMENTS.filter((item) => item.required).map((item) => ({
    type: item.type,
    label: item.label,
    present: uploaded.has(item.type),
  }));
}

/**
 * Customer-safe conflict copy — dates only, no invoice / name / status.
 */

import { formatDate } from '@/lib/format';

export function customerSafeConflictMessage(deliveryDate: string, returnDate: string): string {
  const from = formatDate(deliveryDate);
  const to = formatDate(returnDate);
  return `This vehicle is unavailable between ${from} and ${to}. Please choose different dates.`;
}

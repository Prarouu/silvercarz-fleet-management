/**
 * Client-safe estimated total using the shared Pricing Engine helpers.
 */

import { calculatePricing, calculateRentalDays } from '@/features/bookings/service/pricing.service';

export function estimateBookingTotal(params: {
  readonly dailyRate: number;
  readonly deliveryDate: string;
  readonly returnDate: string;
}): {
  readonly rentalDays: number;
  readonly estimatedTotal: number;
} {
  if (!params.deliveryDate || !params.returnDate || params.returnDate < params.deliveryDate) {
    return { rentalDays: 0, estimatedTotal: 0 };
  }

  const summary = calculatePricing({
    dailyRate: params.dailyRate,
    deliveryDate: params.deliveryDate,
    returnDate: params.returnDate,
    amountPaid: 0,
  });

  return {
    rentalDays: summary.rentalDays,
    estimatedTotal: summary.grandTotal,
  };
}

export { calculateRentalDays };

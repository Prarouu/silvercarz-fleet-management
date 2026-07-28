-- =============================================================================
-- Backfill vehicles.availability_status from existing bookings
-- =============================================================================
-- Bookings created before the Availability Engine never ran
-- syncAvailabilityFromBookings, leaving vehicles stuck on `available`.
-- Mirrors resolveAvailabilityFromBookings (UTC as-of date).
-- Preserves explicit `maintenance` and already-`inactive` rows.
-- =============================================================================

-- Soft-retired roster → inactive
UPDATE public.vehicles
SET availability_status = 'inactive'::public.vehicle_availability
WHERE is_active = false
  AND availability_status IS DISTINCT FROM 'inactive'::public.vehicle_availability;

-- Booking-derived statuses for active, non-maintenance vehicles
WITH as_of AS (
  SELECT (timezone('utc', now()))::date AS today
),
derived AS (
  SELECT
    v.id AS vehicle_id,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.vehicle_id = v.id
          AND b.status = 'ongoing'::public.booking_status
      )
      OR EXISTS (
        SELECT 1
        FROM public.bookings b
        CROSS JOIN as_of
        WHERE b.vehicle_id = v.id
          AND b.status = 'confirmed'::public.booking_status
          AND b.delivery_date <= as_of.today
          AND b.return_date >= as_of.today
      ) THEN 'booked'::public.vehicle_availability
      WHEN EXISTS (
        SELECT 1
        FROM public.bookings b
        CROSS JOIN as_of
        WHERE b.vehicle_id = v.id
          AND b.status = 'confirmed'::public.booking_status
          AND b.delivery_date > as_of.today
      ) THEN 'reserved'::public.vehicle_availability
      ELSE 'available'::public.vehicle_availability
    END AS next_status
  FROM public.vehicles v
  WHERE v.is_active = true
    AND v.availability_status IS DISTINCT FROM 'maintenance'::public.vehicle_availability
    AND v.availability_status IS DISTINCT FROM 'inactive'::public.vehicle_availability
)
UPDATE public.vehicles v
SET availability_status = d.next_status
FROM derived d
WHERE v.id = d.vehicle_id
  AND v.availability_status IS DISTINCT FROM d.next_status;

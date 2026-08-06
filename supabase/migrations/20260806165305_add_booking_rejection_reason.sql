-- =============================================================================
-- Add rejection_reason for denied customer booking requests (C5)
-- =============================================================================
-- Staff must provide a reason when denying a draft customer request.
-- Kept separate from `notes` so operational notes are not overwritten.
-- =============================================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rejection_reason text;

COMMENT ON COLUMN public.bookings.rejection_reason IS
  'Staff-provided reason when a customer draft request is denied. Null for non-denied bookings.';

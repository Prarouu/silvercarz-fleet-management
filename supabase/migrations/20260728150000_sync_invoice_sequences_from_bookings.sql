-- =============================================================================
-- Sync invoice sequences with existing bookings + harden peek/next
-- =============================================================================
-- Existing bookings (e.g. SC-2026-00001) created before invoice_sequences must
-- raise the counter floor so New Booking never re-offers the same sequence.
-- Depends on: public.invoice_sequences, public.bookings, public.next_invoice_sequence
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: highest numeric sequence already used for (prefix, year)
-- Parses PREFIX-YEAR-NNNNN (any zero-pad width).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.max_booking_invoice_sequence(
  p_prefix text,
  p_year integer
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    MAX(
      NULLIF(
        regexp_replace(split_part(b.invoice_number, '-', 3), '[^0-9]', '', 'g'),
        ''
      )::integer
    ),
    0
  )
  FROM public.bookings AS b
  WHERE b.invoice_number ~ (
    '^'
    || upper(trim(p_prefix))
    || '-'
    || p_year::text
    || '-[0-9]+$'
  );
$$;

COMMENT ON FUNCTION public.max_booking_invoice_sequence(text, integer) IS
  'Highest invoice sequence already present on bookings for (prefix, year). Used to seed / floor the allocator.';

GRANT EXECUTE ON FUNCTION public.max_booking_invoice_sequence(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.max_booking_invoice_sequence(text, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- Seed / raise counters from existing booking invoice numbers
-- ---------------------------------------------------------------------------
INSERT INTO public.invoice_sequences (prefix, year, current_sequence)
SELECT
  upper(split_part(b.invoice_number, '-', 1)) AS prefix,
  split_part(b.invoice_number, '-', 2)::integer AS year,
  MAX(
    NULLIF(
      regexp_replace(split_part(b.invoice_number, '-', 3), '[^0-9]', '', 'g'),
      ''
    )::integer
  ) AS current_sequence
FROM public.bookings AS b
WHERE b.invoice_number ~ '^[A-Z0-9]+-[0-9]{4}-[0-9]+$'
GROUP BY 1, 2
ON CONFLICT (prefix, year)
DO UPDATE SET
  current_sequence = GREATEST(
    public.invoice_sequences.current_sequence,
    EXCLUDED.current_sequence
  ),
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- Atomic allocator — never allocate below max(existing bookings, counter)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.next_invoice_sequence(
  p_prefix text,
  p_year integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_prefix text;
  max_existing integer;
  next_val integer;
BEGIN
  normalized_prefix := upper(trim(p_prefix));

  IF normalized_prefix IS NULL OR char_length(normalized_prefix) = 0 THEN
    RAISE EXCEPTION 'Invoice prefix is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_year IS NULL OR p_year < 2000 OR p_year > 2100 THEN
    RAISE EXCEPTION 'Invoice year is invalid'
      USING ERRCODE = '22023';
  END IF;

  max_existing := public.max_booking_invoice_sequence(normalized_prefix, p_year);

  INSERT INTO public.invoice_sequences AS s (prefix, year, current_sequence)
  VALUES (normalized_prefix, p_year, max_existing + 1)
  ON CONFLICT (prefix, year)
  DO UPDATE SET
    current_sequence = GREATEST(s.current_sequence, max_existing) + 1,
    updated_at = timezone('utc', now())
  RETURNING s.current_sequence INTO next_val;

  RETURN next_val;
END;
$$;

COMMENT ON FUNCTION public.next_invoice_sequence(text, integer) IS
  'Atomically allocates the next invoice sequence for (prefix, year), floored by existing booking numbers.';

-- ---------------------------------------------------------------------------
-- Peek — reflect bookings + counter without consuming
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.peek_next_invoice_sequence(
  p_prefix text,
  p_year integer
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_prefix text;
  current_val integer;
  max_existing integer;
BEGIN
  normalized_prefix := upper(trim(p_prefix));

  IF normalized_prefix IS NULL OR char_length(normalized_prefix) = 0 THEN
    RAISE EXCEPTION 'Invoice prefix is required'
      USING ERRCODE = '22023';
  END IF;

  IF p_year IS NULL OR p_year < 2000 OR p_year > 2100 THEN
    RAISE EXCEPTION 'Invoice year is invalid'
      USING ERRCODE = '22023';
  END IF;

  SELECT s.current_sequence
  INTO current_val
  FROM public.invoice_sequences AS s
  WHERE s.prefix = normalized_prefix
    AND s.year = p_year;

  max_existing := public.max_booking_invoice_sequence(normalized_prefix, p_year);

  RETURN GREATEST(COALESCE(current_val, 0), max_existing) + 1;
END;
$$;

COMMENT ON FUNCTION public.peek_next_invoice_sequence(text, integer) IS
  'Returns the next sequence that would be allocated without incrementing, including existing bookings.';

-- =============================================================================
-- Invoice sequences — concurrency-safe yearly invoice numbering
-- =============================================================================
-- Stores per-(prefix, year) counters. Allocation happens only via
-- public.next_invoice_sequence(), which uses INSERT … ON CONFLICT DO UPDATE
-- so concurrent booking creates never share the same sequence value.
-- Depends on: public.set_updated_at(), public.is_active_staff()
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table: invoice_sequences
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix text NOT NULL,
  year integer NOT NULL,
  current_sequence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT invoice_sequences_prefix_not_blank CHECK (char_length(trim(prefix)) > 0),
  CONSTRAINT invoice_sequences_prefix_uppercase CHECK (prefix = upper(prefix)),
  CONSTRAINT invoice_sequences_year_valid CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT invoice_sequences_current_sequence_non_negative CHECK (current_sequence >= 0),
  CONSTRAINT invoice_sequences_prefix_year_unique UNIQUE (prefix, year)
);

COMMENT ON TABLE public.invoice_sequences IS
  'Yearly invoice counters keyed by company prefix. Source of truth for SC-YYYY-XXXX allocation.';
COMMENT ON COLUMN public.invoice_sequences.prefix IS
  'Company invoice prefix stored uppercase (default SC).';
COMMENT ON COLUMN public.invoice_sequences.year IS
  'Calendar year (UTC) for this sequence bucket. Resets automatically when a new year row is created.';
COMMENT ON COLUMN public.invoice_sequences.current_sequence IS
  'Last allocated sequence for (prefix, year). Next invoice uses current_sequence + 1 via next_invoice_sequence().';

CREATE INDEX IF NOT EXISTS invoice_sequences_year_idx
  ON public.invoice_sequences (year);

DROP TRIGGER IF EXISTS invoice_sequences_set_updated_at ON public.invoice_sequences;
CREATE TRIGGER invoice_sequences_set_updated_at
  BEFORE UPDATE ON public.invoice_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Atomic allocator (concurrency-safe)
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

  INSERT INTO public.invoice_sequences AS s (prefix, year, current_sequence)
  VALUES (normalized_prefix, p_year, 1)
  ON CONFLICT (prefix, year)
  DO UPDATE SET
    current_sequence = s.current_sequence + 1,
    updated_at = timezone('utc', now())
  RETURNING s.current_sequence INTO next_val;

  RETURN next_val;
END;
$$;

COMMENT ON FUNCTION public.next_invoice_sequence(text, integer) IS
  'Atomically allocates the next invoice sequence for (prefix, year). Safe under concurrent callers.';

GRANT EXECUTE ON FUNCTION public.next_invoice_sequence(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_invoice_sequence(text, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- Non-allocating peek (UI preview only — never consume a number)
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

  RETURN COALESCE(current_val, 0) + 1;
END;
$$;

COMMENT ON FUNCTION public.peek_next_invoice_sequence(text, integer) IS
  'Returns the next sequence that would be allocated without incrementing. For form preview only.';

GRANT EXECUTE ON FUNCTION public.peek_next_invoice_sequence(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.peek_next_invoice_sequence(text, integer) TO service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security — staff may read counters; writes only via SECURITY DEFINER
-- ---------------------------------------------------------------------------
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_sequences_select_staff ON public.invoice_sequences;
CREATE POLICY invoice_sequences_select_staff
  ON public.invoice_sequences
  FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

-- No INSERT/UPDATE/DELETE policies for authenticated — mutations go through
-- next_invoice_sequence() (SECURITY DEFINER) only.

GRANT SELECT ON public.invoice_sequences TO authenticated;
GRANT ALL ON public.invoice_sequences TO service_role;

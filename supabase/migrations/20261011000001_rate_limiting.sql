-- =====================================================================
-- DATABASE-BACKED RATE LIMITING FOR SERVERLESS / VERCEL
-- Run this in Supabase SQL Editor
-- =====================================================================

-- 1. Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 1
);

-- 2. Enable RLS (Internal system access only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 3. Atomic Rate Limiter Function
-- Returns true if allowed, false if limit exceeded
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Insert initial record or lock existing record
  INSERT INTO rate_limits (key, window_start, count)
  VALUES (p_key, v_now, 1)
  ON CONFLICT (key) DO UPDATE
  SET 
    count = CASE 
      WHEN (v_now - rate_limits.window_start) > (p_window_seconds || ' seconds')::INTERVAL THEN 1
      ELSE rate_limits.count + 1
    END,
    window_start = CASE
      WHEN (v_now - rate_limits.window_start) > (p_window_seconds || ' seconds')::INTERVAL THEN v_now
      ELSE rate_limits.window_start
    END
  RETURNING count INTO v_count;

  RETURN (v_count <= p_limit);
END;
$$;

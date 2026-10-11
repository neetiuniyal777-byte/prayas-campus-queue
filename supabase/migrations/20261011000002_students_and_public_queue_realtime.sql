-- =====================================================================
-- TERNA AUTONOMOUS ENGINEERING COLLEGE
-- MIGRATION: 20261011000002_students_and_public_queue_realtime.sql
-- 
-- 1. Creates `students` table (TUF ID unique, PII strictly guarded with RLS)
-- 2. Links `applications` and `tokens` to `student_id`
-- 3. Creates `public_queue_state` table for safe, anonymized Realtime subscriptions
-- 4. Creates database trigger `trg_tokens_sync_public_queue` to keep `public_queue_state` instantly updated
-- 5. Updates `issue_token` to upsert students and record student_id
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. STUDENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tuf_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  class_year TEXT NOT NULL,
  branch TEXT NOT NULL,
  division TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_tuf_id ON public.students (tuf_id);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (full_name);

-- RLS: Staff and Admin read-only, no anonymous access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and Admin read students" ON public.students;
CREATE POLICY "Staff and Admin read students" ON public.students
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE staff_profiles.id = auth.uid() AND staff_profiles.is_active = true
  ));

DROP POLICY IF EXISTS "Admin manage students" ON public.students;
CREATE POLICY "Admin manage students" ON public.students
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE staff_profiles.id = auth.uid() AND staff_profiles.role = 'admin' AND staff_profiles.is_active = true
  ));

-- ---------------------------------------------------------------------
-- 2. LINK APPLICATIONS & TOKENS TO STUDENTS
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN student_id UUID REFERENCES public.students(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tokens' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE public.tokens ADD COLUMN student_id UUID REFERENCES public.students(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 3. PUBLIC QUEUE STATE TABLE (SAFE ANONYMIZED REALTIME)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.public_queue_state (
  service_id UUID PRIMARY KEY REFERENCES public.services(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_prefix TEXT NOT NULL,
  service_status TEXT NOT NULL DEFAULT 'open',
  counter_id UUID REFERENCES public.counters(id) ON DELETE SET NULL,
  counter_label TEXT,
  now_serving_label TEXT,
  next_labels TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  waiting_count INTEGER NOT NULL DEFAULT 0,
  avg_duration_min INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_queue_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read public_queue_state" ON public.public_queue_state;
CREATE POLICY "Allow anon read public_queue_state" ON public.public_queue_state
  FOR SELECT TO public
  USING (true);

-- Ensure public_queue_state is in the realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.public_queue_state;
    EXCEPTION WHEN duplicate_object THEN
      -- Table already added
    END;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4. FUNCTION TO SYNC PUBLIC QUEUE STATE
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_public_queue_state()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  r_service RECORD;
  v_serving_label TEXT;
  v_counter_id UUID;
  v_counter_label TEXT;
  v_next TEXT[];
  v_waiting INTEGER;
BEGIN
  FOR r_service IN SELECT * FROM services WHERE is_active = true ORDER BY sort_order LOOP
    -- Get current serving token & counter
    SELECT t.label, t.counter_id, c.label
    INTO v_serving_label, v_counter_id, v_counter_label
    FROM tokens t
    LEFT JOIN counters c ON t.counter_id = c.id
    WHERE t.service_id = r_service.id
      AND t.service_date = v_today
      AND t.status IN ('called', 'serving')
    ORDER BY t.number DESC
    LIMIT 1;

    -- Waiting count
    SELECT COUNT(*) INTO v_waiting
    FROM tokens
    WHERE service_id = r_service.id
      AND service_date = v_today
      AND status = 'waiting';

    -- Next 3 upcoming tokens
    SELECT ARRAY_AGG(sub.label) INTO v_next
    FROM (
      SELECT label FROM tokens
      WHERE service_id = r_service.id
        AND service_date = v_today
        AND status = 'waiting'
      ORDER BY number ASC
      LIMIT 3
    ) sub;

    INSERT INTO public_queue_state (
      service_id,
      service_slug,
      service_name,
      service_prefix,
      service_status,
      counter_id,
      counter_label,
      now_serving_label,
      next_labels,
      waiting_count,
      avg_duration_min,
      updated_at
    ) VALUES (
      r_service.id,
      r_service.slug,
      r_service.name,
      r_service.prefix,
      r_service.status,
      v_counter_id,
      v_counter_label,
      v_serving_label,
      COALESCE(v_next, '{}'::TEXT[]),
      v_waiting,
      r_service.default_duration_min,
      NOW()
    )
    ON CONFLICT (service_id) DO UPDATE SET
      service_slug = EXCLUDED.service_slug,
      service_name = EXCLUDED.service_name,
      service_prefix = EXCLUDED.service_prefix,
      service_status = EXCLUDED.service_status,
      counter_id = EXCLUDED.counter_id,
      counter_label = EXCLUDED.counter_label,
      now_serving_label = EXCLUDED.now_serving_label,
      next_labels = EXCLUDED.next_labels,
      waiting_count = EXCLUDED.waiting_count,
      avg_duration_min = EXCLUDED.avg_duration_min,
      updated_at = NOW();
  END LOOP;
END;
$$;

-- Trigger Function on tokens
CREATE OR REPLACE FUNCTION public.trg_tokens_sync_queue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_public_queue_state();
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_tokens_change_sync_public ON public.tokens;
CREATE TRIGGER trg_tokens_change_sync_public
AFTER INSERT OR UPDATE OR DELETE ON public.tokens
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_tokens_sync_queue();

-- Initial population of public_queue_state
SELECT public.sync_public_queue_state();

-- ---------------------------------------------------------------------
-- 5. UPDATE issue_token WITH STUDENT UPSERT & LINKING
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION issue_token(
  p_service_id UUID,
  p_tuf_id TEXT,
  p_student_name TEXT,
  p_tracking_secret TEXT,
  p_application_payload JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_service RECORD;
  v_token_number INTEGER;
  v_token_label TEXT;
  v_tracking_hash TEXT;
  v_student_id UUID;
  v_application_id UUID := NULL;
  v_token_id UUID;
  v_waiting_before INTEGER;
BEGIN
  -- 1. Fetch and validate service
  SELECT * INTO v_service FROM services WHERE id = p_service_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service not found or is currently inactive.';
  END IF;

  IF v_service.status = 'paused' THEN
    RAISE EXCEPTION 'Service is temporarily paused. Please check back shortly.';
  ELSIF v_service.status = 'closed' THEN
    RAISE EXCEPTION 'Service is currently closed for the day.';
  END IF;

  -- 2. Verify student doesn't already hold an active token for this service today
  IF EXISTS (
    SELECT 1 FROM tokens 
    WHERE service_id = p_service_id 
      AND service_date = v_today 
      AND tuf_id = p_tuf_id 
      AND status IN ('waiting', 'called', 'serving')
  ) THEN
    RAISE EXCEPTION 'You already have an active token for this service today.';
  END IF;

  -- 3. Upsert student record
  INSERT INTO public.students (
    tuf_id,
    full_name,
    class_year,
    branch,
    division,
    email,
    phone,
    updated_at
  ) VALUES (
    p_tuf_id,
    p_student_name,
    COALESCE(p_application_payload->>'class_year', 'FE'),
    COALESCE(p_application_payload->>'branch', 'Computer Engineering'),
    p_application_payload->>'division',
    p_application_payload->>'email',
    p_application_payload->>'phone',
    NOW()
  )
  ON CONFLICT (tuf_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    class_year = EXCLUDED.class_year,
    branch = EXCLUDED.branch,
    division = COALESCE(EXCLUDED.division, students.division),
    email = COALESCE(EXCLUDED.email, students.email),
    phone = COALESCE(EXCLUDED.phone, students.phone),
    updated_at = NOW()
  RETURNING id INTO v_student_id;

  -- 4. Atomic counter increment with row-locking per service per day (Asia/Kolkata) starting at 1
  INSERT INTO daily_counters (service_id, service_date, last_number)
  VALUES (p_service_id, v_today, 1)
  ON CONFLICT (service_id, service_date)
  DO UPDATE SET last_number = daily_counters.last_number + 1
  RETURNING last_number INTO v_token_number;

  -- Check daily cap
  IF v_token_number > v_service.daily_cap THEN
    RAISE EXCEPTION 'Daily token limit of % has been reached for this service.', v_service.daily_cap;
  END IF;

  -- Format token label (e.g. B-001)
  v_token_label := v_service.prefix || '-' || LPAD(v_token_number::TEXT, 3, '0');

  -- Compute SHA-256 hash of tracking secret
  IF length(p_tracking_secret) = 64 AND p_tracking_secret ~ '^[0-9a-fA-F]+$' THEN
    v_tracking_hash := lower(p_tracking_secret);
  ELSE
    BEGIN
      v_tracking_hash := encode(sha256(p_tracking_secret::bytea), 'hex');
    EXCEPTION WHEN OTHERS THEN
      v_tracking_hash := encode(extensions.digest(p_tracking_secret::bytea, 'sha256'), 'hex');
    END;
  END IF;

  -- 5. Store application details if provided
  IF p_application_payload IS NOT NULL THEN
    INSERT INTO applications (
      service_id,
      student_id,
      template_id,
      student_name,
      tuf_id,
      class_year,
      branch,
      division,
      academic_year,
      email,
      phone,
      data,
      status
    ) VALUES (
      p_service_id,
      v_student_id,
      (p_application_payload->>'template_id')::UUID,
      p_student_name,
      p_tuf_id,
      COALESCE(p_application_payload->>'class_year', 'FE'),
      COALESCE(p_application_payload->>'branch', 'Computer Engineering'),
      p_application_payload->>'division',
      COALESCE(p_application_payload->>'academic_year', '2026-27'),
      p_application_payload->>'email',
      p_application_payload->>'phone',
      COALESCE(p_application_payload->'data', '{}'::JSONB),
      'submitted'
    ) RETURNING id INTO v_application_id;
  END IF;

  -- 6. Insert token
  INSERT INTO tokens (
    service_id,
    student_id,
    service_date,
    number,
    label,
    tuf_id,
    student_name,
    status,
    tracking_hash,
    application_id,
    issued_at
  ) VALUES (
    p_service_id,
    v_student_id,
    v_today,
    v_token_number,
    v_token_label,
    p_tuf_id,
    p_student_name,
    'waiting',
    v_tracking_hash,
    v_application_id,
    NOW()
  ) RETURNING id INTO v_token_id;

  -- 7. Log event
  INSERT INTO token_events (token_id, from_status, to_status, actor_type, reason)
  VALUES (v_token_id, NULL, 'waiting', 'student', 'Token issued');

  -- 8. Position calculation: people ahead = waiting tokens of the same service with a lower number
  SELECT COUNT(*) INTO v_waiting_before
  FROM tokens
  WHERE service_id = p_service_id
    AND service_date = v_today
    AND status = 'waiting'
    AND number < v_token_number;

  RETURN jsonb_build_object(
    'token_id', v_token_id,
    'label', v_token_label,
    'number', v_token_number,
    'service_name', v_service.name,
    'status', 'waiting',
    'queue_position', v_waiting_before + 1,
    'waiting_ahead', v_waiting_before,
    'estimated_wait_min', v_waiting_before * v_service.default_duration_min,
    'application_id', v_application_id,
    'student_id', v_student_id
  );
END;
$$;

-- ---------------------------------------------------------------------
-- 6. UPDATE get_token_by_tracking_hash WITH EXACT POSITION LOGIC
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_token_by_tracking_hash(p_tracking_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token RECORD;
  v_service RECORD;
  v_counter_label TEXT;
  v_current_serving_label TEXT;
  v_waiting_before INTEGER := 0;
  v_app RECORD;
BEGIN
  SELECT * INTO v_token FROM tokens WHERE tracking_hash = p_tracking_hash;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_service FROM services WHERE id = v_token.service_id;
  IF v_token.counter_id IS NOT NULL THEN
    SELECT label INTO v_counter_label FROM counters WHERE id = v_token.counter_id;
  END IF;

  -- Currently serving token for this service
  SELECT label INTO v_current_serving_label
  FROM tokens
  WHERE service_id = v_token.service_id
    AND service_date = v_token.service_date
    AND status IN ('called', 'serving')
  ORDER BY number DESC
  LIMIT 1;

  -- People ahead = waiting tokens of the same service with a lower number
  IF v_token.status = 'waiting' THEN
    SELECT COUNT(*) INTO v_waiting_before
    FROM tokens
    WHERE service_id = v_token.service_id
      AND service_date = v_token.service_date
      AND status = 'waiting'
      AND number < v_token.number;
  END IF;

  -- Application status if linked
  IF v_token.application_id IS NOT NULL THEN
    SELECT status, review_note, reference_number, application_pdf_path, certificate_pdf_path
    INTO v_app
    FROM applications
    WHERE id = v_token.application_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_token.id,
    'label', v_token.label,
    'number', v_token.number,
    'service_name', v_service.name,
    'service_slug', v_service.slug,
    'status', v_token.status,
    'counter_label', v_counter_label,
    'now_serving_label', v_current_serving_label,
    'queue_position', v_waiting_before + 1,
    'waiting_ahead', v_waiting_before,
    'estimated_wait_min', v_waiting_before * v_service.default_duration_min,
    'issued_at', v_token.issued_at,
    'called_at', v_token.called_at,
    'application_status', v_app.status,
    'application_review_note', v_app.review_note,
    'reference_number', v_app.reference_number
  );
END;
$$;

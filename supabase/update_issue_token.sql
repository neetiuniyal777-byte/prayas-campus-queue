-- =====================================================================
-- QUICK PATCH: UPDATE issue_token WITH ROBUST NATIVE SHA-256 HASHING
-- Run this in Supabase SQL Editor to update issue_token immediately.
-- =====================================================================

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
  v_application_id UUID := NULL;
  v_token_id UUID;
  v_queue_position INTEGER;
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

  -- 3. Atomic counter increment with row-locking (prevents duplicate token numbers)
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

  -- Compute SHA-256 hash of the tracking secret
  IF length(p_tracking_secret) = 64 AND p_tracking_secret ~ '^[0-9a-fA-F]+$' THEN
    v_tracking_hash := lower(p_tracking_secret);
  ELSE
    BEGIN
      v_tracking_hash := encode(sha256(p_tracking_secret::bytea), 'hex');
    EXCEPTION WHEN OTHERS THEN
      v_tracking_hash := encode(extensions.digest(p_tracking_secret::bytea, 'sha256'), 'hex');
    END;
  END IF;

  -- 4. Store application details if provided
  IF p_application_payload IS NOT NULL THEN
    INSERT INTO applications (
      service_id,
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

  -- 5. Insert token
  INSERT INTO tokens (
    service_id,
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

  -- 6. Log event
  INSERT INTO token_events (token_id, from_status, to_status, actor_type, reason)
  VALUES (v_token_id, NULL, 'waiting', 'student', 'Token issued');

  -- 7. Calculate current queue position
  SELECT COUNT(*) INTO v_queue_position
  FROM tokens
  WHERE service_id = p_service_id
    AND service_date = v_today
    AND status = 'waiting'
    AND number <= v_token_number;

  RETURN jsonb_build_object(
    'token_id', v_token_id,
    'label', v_token_label,
    'number', v_token_number,
    'service_name', v_service.name,
    'status', 'waiting',
    'queue_position', v_queue_position,
    'estimated_wait_min', (v_queue_position - 1) * v_service.default_duration_min,
    'application_id', v_application_id
  );
END;
$$;

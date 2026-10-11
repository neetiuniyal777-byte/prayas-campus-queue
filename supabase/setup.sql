-- =====================================================================
-- PRAYAS CAMPUS QUEUE & TOKEN SYSTEM
-- MASTER SETUP SCRIPT (Run in Supabase SQL Editor)
-- Follows PRD.md Section 9 & 10 and RULES.md
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP EXISTING OBJECTS (CLEAN RE-RUN CAPABILITY)
DROP FUNCTION IF EXISTS issue_token(uuid, text, text, text, jsonb);
DROP FUNCTION IF EXISTS call_next(uuid, uuid, uuid);
DROP FUNCTION IF EXISTS set_token_status(uuid, text, text, uuid);
DROP FUNCTION IF EXISTS get_token_by_tracking_hash(text);
DROP FUNCTION IF EXISTS get_public_queue_state();

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS token_events CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS template_fields CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS daily_counters CASCADE;
DROP TABLE IF EXISTS staff_services CASCADE;
DROP TABLE IF EXISTS counter_services CASCADE;
DROP TABLE IF EXISTS counters CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff_profiles CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

-- 3. TABLES
-- Staff Profiles (references Supabase auth.users)
CREATE TABLE staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL UNIQUE,
  description TEXT,
  default_duration_min INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
  daily_cap INTEGER NOT NULL DEFAULT 150,
  requires_form BOOLEAN NOT NULL DEFAULT true,
  instructions TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Counters
CREATE TABLE counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Counter to Service mapping
CREATE TABLE counter_services (
  counter_id UUID REFERENCES counters(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (counter_id, service_id)
);

-- Staff to Service assignment
CREATE TABLE staff_services (
  staff_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- Daily Counters (Lock row on token generation to prevent duplicate token numbers)
CREATE TABLE daily_counters (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, service_date)
);

-- Document Templates (Versioned templates for forms & certificates)
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('application', 'certificate')),
  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  header_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  footer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  blank_pdf_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template Form Fields (Drives the dynamic apply form)
CREATE TABLE template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'dropdown', 'number', 'textarea')),
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Applications (Submitted student form data)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  template_version INTEGER NOT NULL DEFAULT 1,
  student_name TEXT NOT NULL,
  tuf_id TEXT NOT NULL,
  class_year TEXT NOT NULL,
  branch TEXT NOT NULL,
  division TEXT,
  academic_year TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'needs_correction', 'approved', 'ready_for_collection', 'completed', 'rejected')),
  review_note TEXT,
  application_pdf_path TEXT,
  certificate_pdf_path TEXT,
  reference_number TEXT UNIQUE,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application Documents (Supporting uploaded files)
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tokens (Issued queue items)
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  number INTEGER NOT NULL,
  label TEXT NOT NULL,
  tuf_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'skipped', 'no_show', 'cancelled')),
  tracking_hash TEXT NOT NULL,
  counter_id UUID REFERENCES counters(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  CONSTRAINT unique_service_date_number UNIQUE (service_id, service_date, number)
);

-- Token Events (Full audit trail of queue transitions)
CREATE TABLE token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_type TEXT NOT NULL, -- 'system', 'student', 'staff'
  actor_id TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INDEXES & CONSTRAINTS
-- Fast queue lookups
CREATE INDEX idx_tokens_queue ON tokens (service_id, service_date, status, number);
CREATE INDEX idx_tokens_tracking_hash ON tokens (tracking_hash);

-- Prevent two ACTIVE tokens for the same student (TUF ID) on the same service on the same calendar day
CREATE UNIQUE INDEX idx_tokens_active_tuf_service_date 
  ON tokens (service_id, service_date, tuf_id) 
  WHERE status IN ('waiting', 'called', 'serving');

-- 5. ROW LEVEL SECURITY (RLS) - DEFAULT DENY EVERYWHERE
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current authenticated user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Helper function: Is current authenticated user assigned to the given service?
CREATE OR REPLACE FUNCTION is_staff_assigned(p_service_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_services
    WHERE staff_id = auth.uid() AND service_id = p_service_id
  ) OR is_admin();
$$;

-- POLICIES: services (Public can read active services)
CREATE POLICY "Public read active services" ON services
  FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Staff read all services" ON services
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage services" ON services
  FOR ALL TO authenticated USING (is_admin());

-- POLICIES: announcements (Public can read active)
CREATE POLICY "Public read active announcements" ON announcements
  FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin manage announcements" ON announcements
  FOR ALL TO authenticated USING (is_admin());

-- POLICIES: document_templates & template_fields (Public can read published)
CREATE POLICY "Public read published templates" ON document_templates
  FOR SELECT TO public USING (is_published = true);
CREATE POLICY "Admin manage templates" ON document_templates
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Public read template fields" ON template_fields
  FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage template fields" ON template_fields
  FOR ALL TO authenticated USING (is_admin());

-- POLICIES: counters & mappings
CREATE POLICY "Public read active counters" ON counters
  FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin manage counters" ON counters
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Public read counter_services" ON counter_services
  FOR SELECT TO public USING (true);
CREATE POLICY "Admin manage counter_services" ON counter_services
  FOR ALL TO authenticated USING (is_admin());

-- POLICIES: staff_profiles
CREATE POLICY "Staff read own profile" ON staff_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admin manage staff profiles" ON staff_profiles
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Staff read own assignments" ON staff_services
  FOR SELECT TO authenticated USING (staff_id = auth.uid() OR is_admin());
CREATE POLICY "Admin manage staff assignments" ON staff_services
  FOR ALL TO authenticated USING (is_admin());

-- POLICIES: tokens & applications (Default deny to public direct table access)
-- Token reads by staff for assigned services
CREATE POLICY "Staff read assigned tokens" ON tokens
  FOR SELECT TO authenticated USING (is_staff_assigned(service_id));
CREATE POLICY "Staff update assigned tokens" ON tokens
  FOR UPDATE TO authenticated USING (is_staff_assigned(service_id));

CREATE POLICY "Staff read assigned applications" ON applications
  FOR SELECT TO authenticated USING (is_staff_assigned(service_id));
CREATE POLICY "Staff update assigned applications" ON applications
  FOR UPDATE TO authenticated USING (is_staff_assigned(service_id));

CREATE POLICY "Staff read assigned token events" ON token_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM tokens WHERE tokens.id = token_events.token_id AND is_staff_assigned(tokens.service_id))
  );

CREATE POLICY "Admin view audit log" ON audit_log
  FOR SELECT TO authenticated USING (is_admin());

-- 6. CORE DATABASE FUNCTIONS (ATOMIC LOCKING)

-- FUNCTION: issue_token
-- Allocates a unique daily token number atomically with row-locking
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

-- FUNCTION: call_next
-- Calls the next waiting token with SKIP LOCKED so concurrent staff members never get the same token
CREATE OR REPLACE FUNCTION call_next(
  p_service_id UUID,
  p_counter_id UUID,
  p_staff_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_token RECORD;
  v_counter_label TEXT;
BEGIN
  SELECT label INTO v_counter_label FROM counters WHERE id = p_counter_id;

  -- Lock and fetch oldest waiting token
  SELECT * INTO v_token
  FROM tokens
  WHERE service_id = p_service_id
    AND service_date = v_today
    AND status = 'waiting'
  ORDER BY number ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'No waiting tokens for this service.');
  END IF;

  -- Update token to called
  UPDATE tokens
  SET status = 'called',
      counter_id = p_counter_id,
      called_at = NOW()
  WHERE id = v_token.id;

  -- Log event
  INSERT INTO token_events (token_id, from_status, to_status, actor_type, actor_id, reason)
  VALUES (v_token.id, 'waiting', 'called', 'staff', p_staff_id::TEXT, 'Called to ' || COALESCE(v_counter_label, 'counter'));

  RETURN jsonb_build_object(
    'success', true,
    'token_id', v_token.id,
    'label', v_token.label,
    'number', v_token.number,
    'student_name', v_token.student_name,
    'tuf_id', v_token.tuf_id,
    'counter_label', v_counter_label,
    'called_at', NOW()
  );
END;
$$;

-- FUNCTION: set_token_status
-- Transition token status with validation
CREATE OR REPLACE FUNCTION set_token_status(
  p_token_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_staff_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token RECORD;
BEGIN
  IF p_new_status NOT IN ('serving', 'completed', 'skipped', 'no_show', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition: %', p_new_status;
  END IF;

  SELECT * INTO v_token FROM tokens WHERE id = p_token_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token not found.';
  END IF;

  UPDATE tokens
  SET status = p_new_status,
      started_at = CASE WHEN p_new_status = 'serving' AND started_at IS NULL THEN NOW() ELSE started_at END,
      completed_at = CASE WHEN p_new_status IN ('completed', 'skipped', 'no_show', 'cancelled') THEN NOW() ELSE completed_at END
  WHERE id = p_token_id;

  INSERT INTO token_events (token_id, from_status, to_status, actor_type, actor_id, reason)
  VALUES (p_token_id, v_token.status, p_new_status, 'staff', p_staff_id::TEXT, p_reason);

  RETURN jsonb_build_object(
    'success', true,
    'token_id', p_token_id,
    'from_status', v_token.status,
    'to_status', p_new_status
  );
END;
$$;

-- FUNCTION: get_token_by_tracking_hash
-- Safe lookup for student tracking page using tracking secret hash
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
  v_position INTEGER := 0;
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

  -- Queue position if waiting
  IF v_token.status = 'waiting' THEN
    SELECT COUNT(*) INTO v_position
    FROM tokens
    WHERE service_id = v_token.service_id
      AND service_date = v_token.service_date
      AND status = 'waiting'
      AND number <= v_token.number;

    v_waiting_before := GREATEST(0, v_position - 1);
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
    'queue_position', v_position,
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

-- FUNCTION: get_public_queue_state
-- Safe data only for display screens and home page (ZERO student PII)
CREATE OR REPLACE FUNCTION get_public_queue_state()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_services JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'prefix', s.prefix,
      'status', s.status,
      'default_duration_min', s.default_duration_min,
      'waiting_count', (
        SELECT COUNT(*) FROM tokens t 
        WHERE t.service_id = s.id AND t.service_date = v_today AND t.status = 'waiting'
      ),
      'current_token', (
        SELECT t.label FROM tokens t 
        WHERE t.service_id = s.id AND t.service_date = v_today AND t.status IN ('called', 'serving')
        ORDER BY t.number DESC LIMIT 1
      ),
      'current_counter', (
        SELECT c.label FROM tokens t 
        JOIN counters c ON t.counter_id = c.id
        WHERE t.service_id = s.id AND t.service_date = v_today AND t.status IN ('called', 'serving')
        ORDER BY t.number DESC LIMIT 1
      )
    ) ORDER BY s.sort_order ASC
  ) INTO v_services
  FROM services s
  WHERE s.is_active = true;

  RETURN jsonb_build_object(
    'date', v_today,
    'services', COALESCE(v_services, '[]'::JSONB)
  );
END;
$$;

-- 7. SEED DATA
-- Counters
INSERT INTO counters (id, label, is_active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Counter 1 (Bonafide & General)', true),
  ('11111111-1111-1111-1111-111111111102', 'Counter 2 (Accounts & Fees)', true),
  ('11111111-1111-1111-1111-111111111103', 'Counter 3 (Examinations & Verification)', true)
ON CONFLICT (label) DO NOTHING;

-- Services
INSERT INTO services (id, name, slug, prefix, description, default_duration_min, status, daily_cap, requires_form, sort_order) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Bonafide Certificate', 'bonafide', 'B', 'Application for official Bonafide Certificate for scholarship, passport, bank, or visa.', 5, 'open', 150, true, 1),
  ('22222222-2222-2222-2222-222222222202', 'Fee Certificate', 'fee_certificate', 'F', 'Application for Fee Structure / Certificate of fees paid for bank loans & reimbursements.', 5, 'open', 100, true, 2),
  ('22222222-2222-2222-2222-222222222203', 'Fee Query & Accounts', 'fee_query', 'Q', 'Enquiry and resolution regarding tuition fee installments, receipts, and excess deductions.', 10, 'open', 80, true, 3),
  ('22222222-2222-2222-2222-222222222204', 'Exam Form Correction', 'exam_form_correction', 'E', 'Corrections for examination form subjects, candidate name, or roll number.', 8, 'open', 80, true, 4),
  ('22222222-2222-2222-2222-222222222205', 'Document Verification', 'document_verification', 'D', 'Attestation and verification of grade cards, leaving certificates, and transcripts.', 7, 'open', 100, true, 5),
  ('22222222-2222-2222-2222-222222222206', 'Duplicate Marksheet', 'duplicate_marksheet', 'M', 'Application for duplicate semester grade cards or consolidated transcript.', 10, 'open', 50, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Counter to Service Assignments
INSERT INTO counter_services (counter_id, service_id) VALUES
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201'), -- Counter 1 -> Bonafide
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202'), -- Counter 2 -> Fee Certificate
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203'), -- Counter 2 -> Fee Query
  ('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222204'), -- Counter 3 -> Exam Form Correction
  ('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222205'), -- Counter 3 -> Document Verification
  ('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222206')  -- Counter 3 -> Duplicate Marksheet
ON CONFLICT (counter_id, service_id) DO NOTHING;

-- Document Templates (from form_templates_config.json)
-- 1. Bonafide
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'application', 'APPLICATION FOR BONAFIDE CERTIFICATE', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333301', 'purpose', 'Purpose of Certificate', 'dropdown', true, '["Scholarship", "Passport", "Bank Loan", "Other"]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333301', 'copies', 'Number of Copies', 'number', true, '[]'::jsonb, 2)
ON CONFLICT DO NOTHING;

-- 2. Fee Certificate
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 'application', 'APPLICATION FOR FEE CERTIFICATE', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333302', 'fee_type', 'Fee Type (Tuition / Exam / Other)', 'text', true, '[]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333302', 'receipt_no', 'Fee Receipt Number', 'text', true, '[]'::jsonb, 2),
  ('33333333-3333-3333-3333-333333333302', 'purpose', 'Purpose (e.g. Bank Loan, Income Tax)', 'text', true, '[]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- 3. Fee Query
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 'application', 'FEE QUERY FORM', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333303', 'category', 'Query Category', 'text', true, '[]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333303', 'receipt_no', 'Receipt Number (if applicable)', 'text', false, '[]'::jsonb, 2),
  ('33333333-3333-3333-3333-333333333303', 'details', 'Query Details / Remarks', 'textarea', true, '[]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- 4. Exam Form Correction
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', 'application', 'EXAMINATION FORM CORRECTION REQUEST', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333304', 'session', 'Exam Session (e.g. Winter 2026)', 'text', true, '[]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333304', 'seat_no', 'Seat / Hall Ticket Number', 'text', true, '[]'::jsonb, 2),
  ('33333333-3333-3333-3333-333333333304', 'field', 'Field to Correct (Subject, Name, Roll No)', 'text', true, '[]'::jsonb, 3),
  ('33333333-3333-3333-3333-333333333304', 'correct_value', 'Correct Value Required', 'text', true, '[]'::jsonb, 4)
ON CONFLICT DO NOTHING;

-- 5. Document Verification
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222205', 'application', 'DOCUMENT VERIFICATION REQUEST', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333305', 'doc_type', 'Document Type (Degree, Marksheet, LC)', 'text', true, '[]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333305', 'issuer', 'Issuing Body / University', 'text', true, '[]'::jsonb, 2),
  ('33333333-3333-3333-3333-333333333305', 'count', 'Number of Documents', 'number', true, '[]'::jsonb, 3),
  ('33333333-3333-3333-3333-333333333305', 'purpose', 'Purpose of Attestation', 'text', true, '[]'::jsonb, 4)
ON CONFLICT DO NOTHING;

-- 6. Duplicate Marksheet
INSERT INTO document_templates (id, service_id, kind, title, version) VALUES
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222206', 'application', 'REQUEST FOR DUPLICATE MARKSHEET / TRANSCRIPT', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_fields (template_id, key, label, type, required, options, sort_order) VALUES
  ('33333333-3333-3333-3333-333333333306', 'semester', 'Semester / Term (e.g. Sem 3)', 'text', true, '[]'::jsonb, 1),
  ('33333333-3333-3333-3333-333333333306', 'reason', 'Reason (Lost / Damaged / Misplaced)', 'text', true, '[]'::jsonb, 2),
  ('33333333-3333-3333-3333-333333333306', 'copies', 'Number of Copies Required', 'number', true, '[]'::jsonb, 3)
ON CONFLICT DO NOTHING;

-- Announcements Seed
INSERT INTO announcements (message, is_active) VALUES
  ('Welcome to the Campus Administration Office. Please generate your digital token to be called in order.', true)
ON CONFLICT DO NOTHING;

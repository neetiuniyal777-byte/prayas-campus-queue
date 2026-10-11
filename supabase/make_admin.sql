-- =====================================================================
-- PRAYAS CAMPUS QUEUE: CREATE / PROMOTE ADMIN PROFILE
-- Run this in the Supabase SQL Editor AFTER signing up / creating
-- a user under Supabase Authentication -> Users.
-- =====================================================================

DO $$
DECLARE
  -- >>> REPLACE THIS WITH YOUR SUPABASE AUTH EMAIL <<<
  v_target_email TEXT := 'neetiuniyal777@gmail.com';
  v_user_id UUID;
BEGIN
  -- 1. Locate auth.users record by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = LOWER(TRIM(v_target_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email "%" not found in auth.users! Please create the user under Supabase Authentication -> Users first.', v_target_email;
  END IF;

  -- 2. Insert or update the staff_profiles row with admin privileges
  INSERT INTO public.staff_profiles (id, full_name, role, is_active)
  VALUES (v_user_id, 'Campus Administrator', 'admin', true)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin',
      is_active = true,
      updated_at = NOW();

  RAISE NOTICE 'SUCCESS: User % (ID: %) is now registered as an active Admin!', v_target_email, v_user_id;
END;
$$;

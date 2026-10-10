import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a privileged Supabase client using the SERVICE ROLE key.
 * 
 * SECURITY RULES:
 * 1. This file imports 'server-only' so any accidental import into client-side code will fail at build time.
 * 2. SUPABASE_SERVICE_ROLE_KEY must NEVER start with NEXT_PUBLIC_.
 * 3. Use ONLY for trusted backend operations (atomic token generation, system cron tasks).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

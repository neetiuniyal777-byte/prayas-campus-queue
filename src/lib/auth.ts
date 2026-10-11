import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

type AuthSuccess = {
  error?: undefined;
  session: any;
  profile: any;
  adminClient: any;
};

type AuthFailure = {
  error: string;
  status: number;
  session?: undefined;
  profile?: undefined;
  adminClient?: undefined;
};

export async function checkStaffAuth(
  request: NextRequest,
  requireAdmin = false
): Promise<AuthSuccess | AuthFailure> {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { error: "Supabase environment variables not configured", status: 500 };
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  const { data: { session }, error: authErr } = await supabase.auth.getSession();
  if (authErr || !session) {
    return { error: "Unauthorized. Staff authentication session required.", status: 401 };
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profErr } = await adminClient
    .from("staff_profiles")
    .select("id, full_name, role, is_active")
    .eq("id", session.user.id)
    .single();

  if (profErr || !profile || !profile.is_active) {
    return { error: "Forbidden. Inactive or unregistered staff account.", status: 403 };
  }

  if (requireAdmin && profile.role !== "admin") {
    return { error: "Forbidden. Administrative privileges required.", status: 403 };
  }

  return { session, profile, adminClient };
}

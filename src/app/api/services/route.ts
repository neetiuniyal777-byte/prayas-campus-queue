import { NextResponse } from "next/server";
import { SERVICES_CONFIG } from "@/lib/templates";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Attempt to load from Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const { data, error } = await supabase.rpc("get_public_queue_state");

      if (!error && data?.services?.length > 0) {
        return NextResponse.json({
          date: data.date,
          services: data.services,
        });
      }
    }
  } catch {
    // Fall back to config if Supabase is offline or credentials not yet entered
  }

  // Fallback to static services config
  const fallbackServices = Object.values(SERVICES_CONFIG).map((s) => ({
    id: s.slug,
    name: s.name,
    slug: s.slug,
    prefix: s.prefix,
    status: "open",
    default_duration_min: s.durationMin,
    waiting_count: 0,
    current_token: null,
    current_counter: null,
  }));

  return NextResponse.json({
    date: new Date().toISOString().split("T")[0],
    services: fallbackServices,
  });
}

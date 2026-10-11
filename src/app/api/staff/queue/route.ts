import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await checkStaffAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { adminClient } = auth;
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1. Fetch counters
    const { data: counters } = await adminClient
      .from("counters")
      .select("id, label, is_active")
      .order("label");

    // 2. Fetch services
    const { data: services } = await adminClient
      .from("services")
      .select("id, name, slug, prefix, status, default_duration_min")
      .order("sort_order");

    // 3. Fetch waiting and active tokens today
    const { data: tokens } = await adminClient
      .from("tokens")
      .select(`
        id,
        number,
        label,
        service_id,
        service_date,
        student_name,
        tuf_id,
        status,
        counter_id,
        issued_at,
        called_at,
        started_at,
        completed_at,
        application_id
      `)
      .eq("service_date", today)
      .order("number", { ascending: true });

    // 4. Calculate daily stats
    const allTokens: any[] = tokens || [];
    const waitingTokens = allTokens.filter((t: any) => t.status === "waiting");
    const activeTokens = allTokens.filter((t: any) => t.status === "called" || t.status === "serving");
    const completedTokens = allTokens.filter((t: any) => t.status === "completed");
    const skippedTokens = allTokens.filter((t: any) => t.status === "skipped" || t.status === "no_show");

    return NextResponse.json({
      counters: counters || [],
      services: services || [],
      waitingTokens,
      activeTokens,
      allTokens,
      stats: {
        totalIssued: allTokens.length,
        served: completedTokens.length,
        waiting: waitingTokens.length,
        skipped: skippedTokens.length,
        avgWaitMin: 6,
      },
      staff: auth.profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

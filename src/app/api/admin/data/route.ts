import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await checkStaffAuth(request, true); // Admin only
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { adminClient } = auth;

  try {
    const [services, tokens, applications, tokenEvents, auditLog, students] = await Promise.all([
      adminClient.from("services").select("*").order("sort_order"),
      adminClient.from("tokens").select("*").order("issued_at", { ascending: false }).limit(50),
      adminClient.from("applications").select("*").order("created_at", { ascending: false }).limit(50),
      adminClient.from("token_events").select("*").order("created_at", { ascending: false }).limit(50),
      adminClient.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50),
      adminClient.from("students").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      services: services.data || [],
      tokens: tokens.data || [],
      applications: applications.data || [],
      tokenEvents: tokenEvents.data || [],
      auditLog: auditLog.data || [],
      students: students.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await checkStaffAuth(request, true); // Admin only
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { adminClient } = auth;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    let query = adminClient
      .from("students")
      .select(`
        id,
        tuf_id,
        full_name,
        class_year,
        branch,
        division,
        email,
        phone,
        created_at,
        updated_at,
        applications (
          id,
          reference_number,
          status,
          created_at,
          services (name)
        )
      `)
      .order("updated_at", { ascending: false });

    if (q) {
      query = query.or(`tuf_id.ilike.%${q}%,full_name.ilike.%${q}%,branch.ilike.%${q}%`);
    }

    const { data: students, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format students with request count and latest request
    const formatted = (students || []).map((s: any) => {
      const apps = s.applications || [];
      const latestApp = apps.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: s.id,
        tuf_id: s.tuf_id,
        full_name: s.full_name,
        class_year: s.class_year,
        branch: s.branch,
        division: s.division,
        email: s.email,
        phone: s.phone,
        created_at: s.created_at,
        updated_at: s.updated_at,
        request_count: apps.length,
        latest_request: latestApp
          ? {
              id: latestApp.id,
              service_name: Array.isArray(latestApp.services)
                ? latestApp.services[0]?.name
                : latestApp.services?.name || "Official Service",
              status: latestApp.status,
              created_at: latestApp.created_at,
              reference_number: latestApp.reference_number,
            }
          : null,
      };
    });

    return NextResponse.json({ students: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

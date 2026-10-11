import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { generateApplicationPdf } from "@/lib/pdf/generateApplicationPdf";
import { SERVICES_CONFIG } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkStaffAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { adminClient } = auth;

  try {
    const { data: application, error: appErr } = await adminClient
      .from("applications")
      .select("*, services(name, slug, prefix)")
      .eq("id", params.id)
      .single();

    if (appErr || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data: token } = await adminClient
      .from("tokens")
      .select("label")
      .eq("application_id", params.id)
      .maybeSingle();

    const serviceSlug = application.services?.slug || "bonafide";
    const serviceDef = SERVICES_CONFIG[serviceSlug];

    const pdfBytes = await generateApplicationPdf({
      serviceTitle: serviceDef?.title || application.services?.name || "Official Application Form",
      serviceSlug,
      isBlank: false,
      studentDetails: {
        fullName: application.student_name,
        tufId: application.tuf_id,
        classYear: application.class_year,
        branch: application.branch,
        division: application.division,
        academicYear: application.academic_year,
      },
      extraFields: application.data || {},
      trackingLabel: token?.label,
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Application_${application.tuf_id}_${serviceSlug}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Staff application PDF retrieval error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

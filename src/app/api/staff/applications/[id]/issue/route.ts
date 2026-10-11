import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { generateIssuedCertificatePdf } from "@/lib/pdf/generateApplicationPdf";

export const dynamic = "force-dynamic";

export async function POST(
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
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    // Generate atomic reference number if not already generated
    const currentYear = new Date().getFullYear();
    const servicePrefix = application.services?.prefix || "BON";
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = application.reference_number || `${servicePrefix}/${currentYear}/${String(randomSeq).padStart(6, "0")}`;

    // Generate Certificate PDF
    const pdfBytes = await generateIssuedCertificatePdf({
      referenceNumber,
      serviceTitle: application.services?.name || "Bonafide Certificate",
      studentName: application.student_name,
      tufId: application.tuf_id,
      classYear: application.class_year,
      branch: application.branch,
      academicYear: application.academic_year,
      purpose: application.data?.purpose || "Official College Requirement",
    });

    // Update application with reference number and issued status
    await adminClient
      .from("applications")
      .update({
        status: "ready_for_collection",
        reference_number: referenceNumber,
        issued_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    return NextResponse.json({
      success: true,
      referenceNumber,
      message: "Certificate generated and issued successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET handler to download issued certificate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = (await import("@/lib/supabase/admin")).createAdminClient();

  try {
    const { data: application, error: appErr } = await adminClient
      .from("applications")
      .select("*, services(name, slug, prefix)")
      .eq("id", params.id)
      .single();

    if (appErr || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const currentYear = new Date().getFullYear();
    const referenceNumber = application.reference_number || `BON/${currentYear}/000101`;

    const pdfBytes = await generateIssuedCertificatePdf({
      referenceNumber,
      serviceTitle: application.services?.name || "Bonafide Certificate",
      studentName: application.student_name,
      tufId: application.tuf_id,
      classYear: application.class_year,
      branch: application.branch,
      academicYear: application.academic_year,
      purpose: application.data?.purpose || "Official College Requirement",
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate_${referenceNumber.replace(/\//g, "_")}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { SERVICES_CONFIG } from "@/lib/templates";
import { generateApplicationPdf } from "@/lib/pdf/generateApplicationPdf";
import { z } from "zod";

const previewRequestSchema = z.object({
  studentDetails: z.object({
    fullName: z.string().optional(),
    tufId: z.string().optional(),
    classYear: z.string().optional(),
    branch: z.string().optional(),
    division: z.string().optional(),
    academicYear: z.string().optional(),
  }),
  extraFields: z.record(z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceSlug: string } }
) {
  const service = SERVICES_CONFIG[params.serviceSlug];
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = previewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { studentDetails, extraFields } = parsed.data;

    const pdfBytes = await generateApplicationPdf({
      serviceTitle: service.title,
      serviceSlug: service.slug,
      isBlank: false,
      studentDetails,
      extraFields,
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${service.slug}_preview.pdf"`,
      },
    });
  } catch (error) {
    console.error("Preview PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate preview form" },
      { status: 500 }
    );
  }
}

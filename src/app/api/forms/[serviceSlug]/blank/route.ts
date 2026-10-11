import { NextRequest, NextResponse } from "next/server";
import { SERVICES_CONFIG } from "@/lib/templates";
import { generateApplicationPdf } from "@/lib/pdf/generateApplicationPdf";

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceSlug: string } }
) {
  const service = SERVICES_CONFIG[params.serviceSlug];
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  try {
    const pdfBytes = await generateApplicationPdf({
      serviceTitle: service.title,
      serviceSlug: service.slug,
      isBlank: true,
      extraFields: service.extraFields.reduce((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {} as Record<string, string>),
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${service.slug}_blank_form.pdf"`,
      },
    });
  } catch (error) {
    console.error("Blank PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate blank form" },
      { status: 500 }
    );
  }
}

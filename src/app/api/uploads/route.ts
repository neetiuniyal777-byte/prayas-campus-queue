import { NextRequest, NextResponse } from "next/server";
import { checkDbRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "anonymous_client";

  // Database-backed rate limiting for document uploads (20 uploads per minute per IP)
  const rateResult = await checkDbRateLimit(`rate:upload:ip:${ip}`, 20, 60);
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Limit check: 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
    }

    // Allowed mime types
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      message: "File validated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

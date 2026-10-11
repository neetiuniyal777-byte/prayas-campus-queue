import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { SERVICES_CONFIG } from "@/lib/templates";
import { createAdminClient } from "@/lib/supabase/admin";

const submitApplicationSchema = z.object({
  serviceSlug: z.string().min(1),
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(80, "Full name must not exceed 80 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
  classYear: z.enum(["FE", "SE", "TE", "BE"]),
  branch: z.enum([
    "Computer Engineering",
    "IT",
    "Mechanical",
    "Civil",
    "Electrical",
    "E&TC",
  ]),
  tufId: z.string().min(1, "TUF ID is required").max(30),
  division: z.string().optional(),
  academicYear: z.string().min(1, "Academic year is required"),
  extraFields: z.record(z.any()).default({}),
});

import { checkDbRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "anonymous_client";

    // 1. Database-backed rate limiting per IP (max 30 token creations per 60 seconds)
    const ipLimit = await checkDbRateLimit(`rate:token:ip:${ip}`, 30, 60);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before requesting another token." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = submitApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const {
      serviceSlug,
      fullName,
      classYear,
      branch,
      tufId,
      division,
      academicYear,
      extraFields,
    } = result.data;

    const serviceDef = SERVICES_CONFIG[serviceSlug];
    if (!serviceDef) {
      return NextResponse.json({ error: "Invalid service requested" }, { status: 400 });
    }

    // Generate 128-bit unguessable random tracking secret
    const trackingSecret = crypto.randomBytes(16).toString("hex");
    const trackingHash = crypto.createHash("sha256").update(trackingSecret).digest("hex");

    // Try Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createAdminClient();

        // 1. Get service UUID
        const { data: serviceRow, error: sErr } = await supabase
          .from("services")
          .select("id")
          .eq("slug", serviceSlug)
          .single();

        if (serviceRow && !sErr) {
          const payload = {
            class_year: classYear,
            branch: branch,
            division: division,
            academic_year: academicYear,
            data: extraFields,
          };

          const { data: rpcData, error: rpcErr } = await supabase.rpc("issue_token", {
            p_service_id: serviceRow.id,
            p_tuf_id: tufId,
            p_student_name: fullName,
            p_tracking_secret: trackingSecret,
            p_application_payload: payload,
          });

          if (rpcErr) {
            return NextResponse.json(
              { error: rpcErr.message || "Failed to issue token" },
              { status: 400 }
            );
          }

          return NextResponse.json({
            success: true,
            token: rpcData,
            trackingSecret,
            trackingUrl: `/token/${trackingSecret}`,
          });
        }

        if (sErr) {
          return NextResponse.json(
            { error: `Service query failed: ${sErr.message}` },
            { status: 400 }
          );
        }
      } catch (err: any) {
        console.error("Supabase RPC issue_token error:", err);
        return NextResponse.json(
          { error: `Database operation failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    // Fallback simulation mode ONLY when Supabase credentials are not set at all
    const simulatedNumber = Math.floor(Math.random() * 50) + 1;
    const tokenLabel = `${serviceDef.prefix}-${String(simulatedNumber).padStart(3, "0")}`;

    return NextResponse.json({
      success: true,
      token: {
        token_id: crypto.randomUUID(),
        label: tokenLabel,
        number: simulatedNumber,
        service_name: serviceDef.name,
        status: "waiting",
        queue_position: simulatedNumber,
        estimated_wait_min: (simulatedNumber - 1) * serviceDef.durationMin,
      },
      trackingSecret,
      trackingUrl: `/token/${trackingSecret}`,
      note: "Live generated token (Ready for Supabase credentials)",
    });
  } catch (error) {
    console.error("Application submission failed:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while creating token." },
      { status: 500 }
    );
  }
}

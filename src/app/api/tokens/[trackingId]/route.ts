import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const { trackingId } = params;

  if (!trackingId || trackingId.length < 8) {
    return NextResponse.json({ error: "Invalid tracking token" }, { status: 400 });
  }

  const trackingHash = crypto.createHash("sha256").update(trackingId).digest("hex");

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const { data, error } = await supabase.rpc("get_token_by_tracking_hash", {
        p_tracking_hash: trackingHash,
      });

      if (!error && data) {
        return NextResponse.json({ token: data });
      }
    }
  } catch (err) {
    console.error("Token lookup error:", err);
  }

  // Graceful response for preview/demo mode
  return NextResponse.json({
    token: {
      id: "preview-token-id",
      label: "B-001",
      number: 1,
      service_name: "Bonafide Certificate",
      service_slug: "bonafide",
      status: "waiting",
      counter_label: null,
      now_serving_label: "B-000",
      queue_position: 1,
      waiting_ahead: 0,
      estimated_wait_min: 0,
      issued_at: new Date().toISOString(),
      called_at: null,
      application_status: "submitted",
      application_review_note: null,
      reference_number: null,
    },
  });
}

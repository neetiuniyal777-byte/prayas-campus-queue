import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["serving", "completed", "skipped", "no_show", "cancelled"]),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkStaffAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    const { status, reason } = parsed.data;
    const { adminClient, profile } = auth;

    const { data, error } = await adminClient.rpc("set_token_status", {
      p_token_id: params.id,
      p_new_status: status,
      p_reason: reason || null,
      p_staff_id: profile.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

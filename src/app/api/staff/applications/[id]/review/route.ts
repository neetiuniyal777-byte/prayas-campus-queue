import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { z } from "zod";

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
    const { data: application, error } = await adminClient
      .from("applications")
      .select("*, services(name, slug, prefix)")
      .eq("id", params.id)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    // Also get linked token if any
    const { data: token } = await adminClient
      .from("tokens")
      .select("id, label, status, number, counter_id")
      .eq("application_id", params.id)
      .single();

    return NextResponse.json({ application, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected", "needs_correction"]),
  reviewNote: z.string().optional(),
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
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid review parameters" }, { status: 400 });
    }

    const { status, reviewNote } = parsed.data;
    const { adminClient } = auth;

    const { data, error } = await adminClient
      .from("applications")
      .update({
        status,
        review_note: reviewNote || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

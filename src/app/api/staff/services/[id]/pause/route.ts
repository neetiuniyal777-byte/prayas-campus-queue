import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { z } from "zod";

const pauseSchema = z.object({
  status: z.enum(["open", "paused", "closed"]),
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
    const parsed = pauseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { status } = parsed.data;
    const { adminClient } = auth;

    const { data, error } = await adminClient
      .from("services")
      .update({ status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, service: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

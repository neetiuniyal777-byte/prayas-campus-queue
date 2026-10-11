import { NextRequest, NextResponse } from "next/server";
import { checkStaffAuth } from "@/lib/auth";
import { z } from "zod";

const callNextSchema = z.object({
  serviceId: z.string().uuid(),
  counterId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const auth = await checkStaffAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = callNextSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid counter or service ID" }, { status: 400 });
    }

    const { serviceId, counterId } = parsed.data;
    const { adminClient, profile } = auth;

    const { data, error } = await adminClient.rpc("call_next", {
      p_service_id: serviceId,
      p_counter_id: counterId,
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

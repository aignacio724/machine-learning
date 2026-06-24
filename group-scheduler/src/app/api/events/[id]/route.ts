import { NextResponse } from "next/server";
import { getEventWithParticipants } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = getEventWithParticipants(id);

  if (!result) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

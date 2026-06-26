import { NextRequest, NextResponse } from "next/server";
import { getEventWithParticipants, upsertParticipant } from "@/lib/store";
import { AVAILABILITY_STATUSES, type AvailabilityStatus } from "@/lib/types";

const MAX_NAME_LENGTH = 50;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await params;
  const result = getEventWithParticipants(eventId);

  if (!result) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const participantId =
    typeof body?.participantId === "string" ? body.participantId : null;
  const rawAvailability =
    body?.availability && typeof body.availability === "object"
      ? body.availability
      : null;

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: "name is required and must be 1-50 characters" },
      { status: 400 },
    );
  }

  if (!rawAvailability) {
    return NextResponse.json(
      { error: "availability is required" },
      { status: 400 },
    );
  }

  const validDays = new Set(result.event.days);
  const availability: Record<string, AvailabilityStatus> = {};

  for (const [day, status] of Object.entries(rawAvailability)) {
    if (!validDays.has(day)) {
      return NextResponse.json(
        { error: `"${day}" is not a candidate day for this event` },
        { status: 400 },
      );
    }
    if (!AVAILABILITY_STATUSES.includes(status as AvailabilityStatus)) {
      return NextResponse.json(
        { error: `"${status}" is not a valid availability status` },
        { status: 400 },
      );
    }
    availability[day] = status as AvailabilityStatus;
  }

  const participant = upsertParticipant(
    eventId,
    participantId,
    name,
    availability,
  );

  // result above already confirmed the event exists, so this can't be null.
  return NextResponse.json(participant, { status: 200 });
}

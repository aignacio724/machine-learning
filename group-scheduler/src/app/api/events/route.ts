import { NextRequest, NextResponse } from "next/server";
import { createEvent } from "@/lib/store";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TITLE_LENGTH = 200;

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const record = typeof body === "object" && body !== null ? body : {};

  const title =
    "title" in record && typeof record.title === "string"
      ? record.title.trim()
      : "";
  const rawDays: unknown[] =
    "days" in record && Array.isArray(record.days) ? record.days : [];

  if (!title || title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: "title is required and must be 1-200 characters" },
      { status: 400 },
    );
  }

  const days = Array.from(
    new Set(
      rawDays.filter(
        (d): d is string => typeof d === "string" && DATE_RE.test(d),
      ),
    ),
  ).sort();

  if (days.length === 0) {
    return NextResponse.json(
      { error: "days must be a non-empty array of YYYY-MM-DD strings" },
      { status: 400 },
    );
  }

  const event = createEvent(title, days);
  return NextResponse.json(event, { status: 201 });
}

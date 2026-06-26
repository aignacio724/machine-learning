import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { createEvent } from "@/lib/store";
import { POST } from "@/app/api/events/[id]/availability/route";

function postRequest(eventId: string, body: unknown) {
  const req = new NextRequest(
    `http://localhost/api/events/${eventId}/availability`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return POST(req, { params: Promise.resolve({ id: eventId }) });
}

describe("POST /api/events/[id]/availability", () => {
  it("404s when the event does not exist", async () => {
    const res = await postRequest("does-not-exist", {
      participantId: null,
      name: "Alice",
      availability: {},
    });
    expect(res.status).toBe(404);
  });

  it("creates a participant and returns its generated id", async () => {
    const event = createEvent("Lunch", ["2026-06-24", "2026-06-25"]);

    const res = await postRequest(event.id, {
      participantId: null,
      name: "Alice",
      availability: { "2026-06-24": "available" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Alice");
    expect(body.availability).toEqual({ "2026-06-24": "available" });
    expect(typeof body.id).toBe("string");
  });

  it("updates the same participant when participantId matches", async () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    const first = await (
      await postRequest(event.id, {
        participantId: null,
        name: "Alice",
        availability: { "2026-06-24": "available" },
      })
    ).json();

    const second = await (
      await postRequest(event.id, {
        participantId: first.id,
        name: "Alice",
        availability: { "2026-06-24": "ifNeeded" },
      })
    ).json();

    expect(second.id).toBe(first.id);
    expect(second.availability).toEqual({ "2026-06-24": "ifNeeded" });
  });

  it("rejects a blank name", async () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    const res = await postRequest(event.id, {
      participantId: null,
      name: "   ",
      availability: {},
    });
    expect(res.status).toBe(400);
  });

  it("rejects an availability day that isn't a candidate day for the event", async () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    const res = await postRequest(event.id, {
      participantId: null,
      name: "Alice",
      availability: { "2099-01-01": "available" },
    });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid availability status value", async () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    const res = await postRequest(event.id, {
      participantId: null,
      name: "Alice",
      availability: { "2026-06-24": "maybe" },
    });
    expect(res.status).toBe(400);
  });
});

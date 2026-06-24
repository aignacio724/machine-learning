import { describe, expect, it } from "vitest";
import { createEvent } from "@/lib/store";
import { GET } from "@/app/api/events/[id]/route";

function getRequest(id: string) {
  return GET(new Request(`http://localhost/api/events/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe("GET /api/events/[id]", () => {
  it("returns the event and its (empty) participants", async () => {
    const event = createEvent("Lunch", ["2026-06-24"]);

    const res = await getRequest(event.id);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.event).toEqual(event);
    expect(body.participants).toEqual([]);
  });

  it("404s for an unknown event id", async () => {
    const res = await getRequest("does-not-exist");
    expect(res.status).toBe(404);
  });
});

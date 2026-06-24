import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/events/route";

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/events", () => {
  it("creates an event with deduped, sorted days", async () => {
    const res = await POST(
      postRequest({
        title: "  Team Offsite  ",
        days: ["2026-06-26", "2026-06-24", "2026-06-24"],
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.title).toBe("Team Offsite");
    expect(body.days).toEqual(["2026-06-24", "2026-06-26"]);
    expect(typeof body.id).toBe("string");
    expect(typeof body.createdAt).toBe("number");
  });

  it("rejects a missing or blank title", async () => {
    const res = await POST(postRequest({ title: "   ", days: ["2026-06-24"] }));
    expect(res.status).toBe(400);
  });

  it("rejects an empty days array", async () => {
    const res = await POST(postRequest({ title: "Lunch", days: [] }));
    expect(res.status).toBe(400);
  });

  it("filters out malformed day strings, 400s if none remain", async () => {
    const res = await POST(
      postRequest({ title: "Lunch", days: ["not-a-date", "2026/06/24"] })
    );
    expect(res.status).toBe(400);
  });

  it("400s on an unparsable request body", async () => {
    const req = new NextRequest("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

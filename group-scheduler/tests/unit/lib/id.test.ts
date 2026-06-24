import { describe, expect, it } from "vitest";
import { generateEventId, generateParticipantId } from "@/lib/id";

const ID_PATTERN = /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/;

describe("generateEventId / generateParticipantId", () => {
  it("generates 10-character ids from the unambiguous alphabet", () => {
    expect(generateEventId()).toMatch(ID_PATTERN);
    expect(generateParticipantId()).toMatch(ID_PATTERN);
  });

  it("avoids ambiguous characters (0, O, 1, l, I)", () => {
    const ids = Array.from({ length: 200 }, () => generateEventId());
    expect(ids.join("")).not.toMatch(/[0O1lI]/);
  });

  it("generates unique ids across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateEventId()));
    expect(ids.size).toBe(1000);
  });
});

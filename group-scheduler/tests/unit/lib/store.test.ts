import { describe, expect, it } from "vitest";
import {
  createEvent,
  getEventWithParticipants,
  upsertParticipant,
} from "@/lib/store";

describe("createEvent / getEventWithParticipants", () => {
  it("creates an event retrievable by its generated id", () => {
    const event = createEvent("Team Offsite", ["2026-06-24", "2026-06-25"]);

    expect(event.title).toBe("Team Offsite");
    expect(event.days).toEqual(["2026-06-24", "2026-06-25"]);

    const result = getEventWithParticipants(event.id);
    expect(result?.event).toEqual(event);
    expect(result?.participants).toEqual([]);
  });

  it("returns null for an unknown event id", () => {
    expect(getEventWithParticipants("does-not-exist")).toBeNull();
  });
});

describe("upsertParticipant", () => {
  it("returns null when the event does not exist", () => {
    const result = upsertParticipant("does-not-exist", null, "Alice", {});
    expect(result).toBeNull();
  });

  it("creates a new participant when participantId is null", () => {
    const event = createEvent("Lunch", ["2026-06-24"]);

    const participant = upsertParticipant(event.id, null, "Alice", {
      "2026-06-24": "available",
    });

    expect(participant).not.toBeNull();
    expect(participant?.name).toBe("Alice");
    expect(participant?.availability).toEqual({ "2026-06-24": "available" });

    const result = getEventWithParticipants(event.id);
    expect(result?.participants).toHaveLength(1);
    expect(result?.participants[0]).toEqual(participant);
  });

  it("updates the existing participant in place when participantId matches", () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    const first = upsertParticipant(event.id, null, "Alice", {
      "2026-06-24": "available",
    });

    const second = upsertParticipant(event.id, first!.id, "Alice", {
      "2026-06-24": "ifNeeded",
    });

    expect(second?.id).toBe(first?.id);

    const result = getEventWithParticipants(event.id);
    expect(result?.participants).toHaveLength(1);
    expect(result?.participants[0].availability).toEqual({
      "2026-06-24": "ifNeeded",
    });
  });

  it("creates a fresh participant when given a participantId unknown to this event", () => {
    const event = createEvent("Lunch", ["2026-06-24"]);
    upsertParticipant(event.id, null, "Alice", {});

    const stranger = upsertParticipant(
      event.id,
      "stale-id-from-elsewhere",
      "Bob",
      {},
    );

    expect(stranger?.id).not.toBe("stale-id-from-elsewhere");

    const result = getEventWithParticipants(event.id);
    expect(result?.participants).toHaveLength(2);
  });
});

import { describe, expect, it } from "vitest";
import { computeDayTallies, rankDays } from "@/lib/bestDay";
import type { Participant } from "@/lib/types";

function participant(
  id: string,
  availability: Participant["availability"]
): Participant {
  return { id, name: id, availability, updatedAt: 0 };
}

describe("computeDayTallies", () => {
  const days = ["2026-06-24", "2026-06-25", "2026-06-26"];

  it("tallies each status per day", () => {
    const participants = [
      participant("p1", {
        "2026-06-24": "available",
        "2026-06-25": "ifNeeded",
        "2026-06-26": "unavailable",
      }),
      participant("p2", {
        "2026-06-24": "available",
        "2026-06-25": "unavailable",
        "2026-06-26": "unavailable",
      }),
    ];

    const tallies = computeDayTallies(days, participants);

    expect(tallies).toEqual([
      {
        day: "2026-06-24",
        available: 2,
        ifNeeded: 0,
        unavailable: 0,
        totalParticipants: 2,
        isUnanimous: true,
      },
      {
        day: "2026-06-25",
        available: 0,
        ifNeeded: 1,
        unavailable: 1,
        totalParticipants: 2,
        isUnanimous: false,
      },
      {
        day: "2026-06-26",
        available: 0,
        ifNeeded: 0,
        unavailable: 2,
        totalParticipants: 2,
        isUnanimous: false,
      },
    ]);
  });

  it("treats a missing day entry as unavailable", () => {
    const participants = [participant("p1", {})];
    const tallies = computeDayTallies(["2026-06-24"], participants);
    expect(tallies[0].unavailable).toBe(1);
    expect(tallies[0].available).toBe(0);
  });

  it("is never unanimous with zero participants", () => {
    const tallies = computeDayTallies(days, []);
    expect(tallies.every((t) => !t.isUnanimous)).toBe(true);
    expect(tallies.every((t) => t.totalParticipants === 0)).toBe(true);
  });
});

describe("rankDays", () => {
  it("ranks fewest unavailable first", () => {
    const tallies = computeDayTallies(
      ["a", "b"],
      [
        participant("p1", { a: "unavailable", b: "available" }),
        participant("p2", { a: "unavailable", b: "available" }),
      ]
    );
    const ranked = rankDays(tallies);
    expect(ranked.map((t) => t.day)).toEqual(["b", "a"]);
  });

  it("breaks ties on most available, then most ifNeeded", () => {
    const tallies = computeDayTallies(
      ["a", "b", "c"],
      [
        participant("p1", { a: "available", b: "ifNeeded", c: "ifNeeded" }),
        participant("p2", { a: "ifNeeded", b: "available", c: "ifNeeded" }),
      ]
    );
    // a: 1 available, 1 ifNeeded, 0 unavailable
    // b: 1 available, 1 ifNeeded, 0 unavailable (tied with a)
    // c: 0 available, 2 ifNeeded, 0 unavailable
    const ranked = rankDays(tallies);
    expect(ranked[2].day).toBe("c");
    expect(new Set([ranked[0].day, ranked[1].day])).toEqual(new Set(["a", "b"]));
  });

  it("does not mutate the input array", () => {
    const tallies = computeDayTallies(["a", "b"], []);
    const original = [...tallies];
    rankDays(tallies);
    expect(tallies).toEqual(original);
  });
});

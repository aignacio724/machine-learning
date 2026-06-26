import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsSummary from "@/components/ResultsSummary";
import type { Participant } from "@/lib/types";

function participant(
  id: string,
  availability: Participant["availability"],
): Participant {
  return { id, name: id, availability, updatedAt: 0 };
}

const DAYS = ["2026-06-24", "2026-06-25", "2026-06-26"];

describe("ResultsSummary", () => {
  it("shows an empty state with no participants", () => {
    render(<ResultsSummary days={DAYS} participants={[]} />);
    expect(screen.getByText("No responses yet.")).toBeInTheDocument();
  });

  it("highlights the unanimous day when everyone is available", () => {
    const participants = [
      participant("p1", {
        "2026-06-24": "available",
        "2026-06-25": "ifNeeded",
      }),
      participant("p2", {
        "2026-06-24": "available",
        "2026-06-25": "unavailable",
      }),
    ];
    render(<ResultsSummary days={DAYS} participants={participants} />);

    const banner = screen
      .getByText(/Best day — everyone's available/)
      .closest("div");
    expect(banner).toHaveTextContent("Wed, Jun 24");
  });

  it("falls back to closest match when no day is unanimous", () => {
    const participants = [
      participant("p1", {
        "2026-06-24": "available",
        "2026-06-25": "unavailable",
      }),
      participant("p2", {
        "2026-06-24": "unavailable",
        "2026-06-25": "available",
      }),
    ];
    render(<ResultsSummary days={DAYS} participants={participants} />);

    expect(screen.getByText(/Closest match/)).toBeInTheDocument();
  });

  it("renders a tally row for every day", () => {
    const participants = [participant("p1", { "2026-06-24": "available" })];
    render(<ResultsSummary days={DAYS} participants={participants} />);

    expect(
      screen.getByText(/1 available · 0 if needed · 0 unavailable/),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/0 available · 0 if needed · 1 unavailable/),
    ).toHaveLength(2);
  });
});

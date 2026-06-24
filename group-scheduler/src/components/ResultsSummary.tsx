import type { Participant } from "@/lib/types";
import { computeDayTallies, rankDays, type DayTally } from "@/lib/bestDay";
import { formatDay } from "./AvailabilityGrid";

interface ResultsSummaryProps {
  days: string[];
  participants: Participant[];
}

function topTiedDays(ranked: DayTally[]): string[] {
  if (ranked.length === 0) return [];
  const top = ranked[0];
  return ranked
    .filter(
      (t) =>
        t.unavailable === top.unavailable &&
        t.available === top.available &&
        t.ifNeeded === top.ifNeeded
    )
    .map((t) => t.day);
}

export default function ResultsSummary({ days, participants }: ResultsSummaryProps) {
  if (participants.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="mt-2 text-sm text-zinc-600">No responses yet.</p>
      </div>
    );
  }

  const tallies = computeDayTallies(days, participants);
  const ranked = rankDays(tallies);
  const unanimous = tallies.filter((t) => t.isUnanimous);

  const bestDays = unanimous.length > 0 ? unanimous.map((t) => t.day) : topTiedDays(ranked);
  const bestLabel =
    unanimous.length > 0 ? "Best day — everyone's available" : "Closest match";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        Results ({participants.length}{" "}
        {participants.length === 1 ? "response" : "responses"})
      </h2>

      {bestDays.length > 0 && (
        <div className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm">
          <span className="font-medium">{bestLabel}:</span>{" "}
          {bestDays.map(formatDay).join(", ")}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tallies.map((tally) => (
          <div
            key={tally.day}
            className={[
              "flex items-center justify-between rounded border px-3 py-2 text-sm",
              bestDays.includes(tally.day)
                ? "border-green-300 bg-green-50"
                : "border-gray-200",
            ].join(" ")}
          >
            <span className="font-medium">{formatDay(tally.day)}</span>
            <span className="text-zinc-600">
              {tally.available} available · {tally.ifNeeded} if needed ·{" "}
              {tally.unavailable} unavailable
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Participant } from "./types";

export interface DayTally {
  day: string;
  available: number;
  ifNeeded: number;
  unavailable: number;
  totalParticipants: number;
  isUnanimous: boolean;
}

export function computeDayTallies(
  days: string[],
  participants: Participant[]
): DayTally[] {
  return days.map((day) => {
    let available = 0;
    let ifNeeded = 0;
    let unavailable = 0;

    for (const participant of participants) {
      const status = participant.availability[day] ?? "unavailable";
      if (status === "available") available++;
      else if (status === "ifNeeded") ifNeeded++;
      else unavailable++;
    }

    return {
      day,
      available,
      ifNeeded,
      unavailable,
      totalParticipants: participants.length,
      isUnanimous: participants.length > 0 && available === participants.length,
    };
  });
}

export function rankDays(tallies: DayTally[]): DayTally[] {
  return [...tallies].sort((a, b) => {
    if (a.unavailable !== b.unavailable) return a.unavailable - b.unavailable;
    if (a.available !== b.available) return b.available - a.available;
    return b.ifNeeded - a.ifNeeded;
  });
}

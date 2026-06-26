import type { Participant } from "./types";

export interface DayTally {
  day: string;
  available: number;
  ifNeeded: number;
  unavailable: number;
  totalParticipants: number;
  isUnanimous: boolean;
}

/**
 * Method to compute and build a map of availabilities for days given
 * For each day given, build a map with how many participants are available,
 * possibly available, or not available.
 * @param days Array of ISO "YYYY-MM-DD" date strings
 * @param participants Array of participants in the event
 * @returns Array of Days with tallies for availablities
 */
export function computeDayTallies(
  days: string[],
  participants: Participant[],
): DayTally[] {
  return days.map((day) => {
    let available = 0;
    let ifNeeded = 0;
    let unavailable = 0;

    for (const participant of participants) {
      // if no availability is found on this day for this participant, default to 'unavailable'
      const status = participant.availability[day] ?? "unavailable";
      if (status === "available") available += 1;
      else if (status === "ifNeeded") ifNeeded += 1;
      else unavailable += 1;
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

/**
 * Sorts the Day tallies by days with highest availability where every participant can attend
 * @param tallies Array of DayTally
 * @returns Sorted Array of Tallied Days
 */
export function rankDays(tallies: DayTally[]): DayTally[] {
  return [...tallies].sort((a, b) => {
    if (a.unavailable !== b.unavailable) return a.unavailable - b.unavailable;
    if (a.available !== b.available) return b.available - a.available;
    return b.ifNeeded - a.ifNeeded;
  });
}

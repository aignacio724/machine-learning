export type AvailabilityStatus = "available" | "ifNeeded" | "unavailable";

export const AVAILABILITY_STATUSES: AvailabilityStatus[] = [
  "available",
  "ifNeeded",
  "unavailable",
];

export interface Event {
  id: string;
  title: string;
  /** ISO "YYYY-MM-DD" strings, sorted ascending. */
  days: string[];
  createdAt: number;
}

export interface Participant {
  id: string;
  name: string;
  /** Keyed by day ("YYYY-MM-DD"). Sparse — missing days are treated as "unavailable". */
  availability: Record<string, AvailabilityStatus>;
  updatedAt: number;
}

export interface EventWithParticipants {
  event: Event;
  participants: Participant[];
}

// In-memory only — no database. Data lives in this process's memory and is
// lost on restart. This only behaves correctly as a single long-lived Node
// process (e.g. `next dev`, or one `next start` instance) — it will NOT work
// across multiple serverless function instances. See README for details.

import { generateEventId, generateParticipantId } from "./id";
import type {
  AvailabilityStatus,
  Event,
  EventWithParticipants,
  Participant,
} from "./types";

interface EventRecord {
  event: Event;
  participants: Map<string, Participant>;
}

interface Store {
  events: Map<string, EventRecord>;
}

declare global {
  var __groupSchedulerStore: Store | undefined;
}

// Stashed on globalThis (not module scope) so the store survives Next.js
// dev-server Fast Refresh recompiles, which re-evaluate this module without
// restarting the process.
function getStore(): Store {
  if (!globalThis.__groupSchedulerStore) {
    globalThis.__groupSchedulerStore = { events: new Map() };
  }
  return globalThis.__groupSchedulerStore;
}

export function createEvent(title: string, days: string[]): Event {
  const store = getStore();

  let id = generateEventId();
  while (store.events.has(id)) {
    id = generateEventId();
  }

  const event: Event = { id, title, days, createdAt: Date.now() };
  store.events.set(id, { event, participants: new Map() });
  return event;
}

export function getEventWithParticipants(
  eventId: string
): EventWithParticipants | null {
  const record = getStore().events.get(eventId);
  if (!record) return null;
  return {
    event: record.event,
    participants: Array.from(record.participants.values()),
  };
}

export function upsertParticipant(
  eventId: string,
  participantId: string | null,
  name: string,
  availability: Record<string, AvailabilityStatus>
): Participant | null {
  const record = getStore().events.get(eventId);
  if (!record) return null;

  const id =
    participantId && record.participants.has(participantId)
      ? participantId
      : generateParticipantId();

  const participant: Participant = {
    id,
    name,
    availability,
    updatedAt: Date.now(),
  };
  record.participants.set(id, participant);
  return participant;
}

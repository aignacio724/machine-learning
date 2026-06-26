"use client";

import { useEffect, useState } from "react";
import type { AvailabilityStatus, Event, Participant } from "@/lib/types";
import AvailabilityGrid from "./AvailabilityGrid";
import ResultsSummary from "./ResultsSummary";

interface EventClientProps {
  eventId: string;
  event: Event;
  initialParticipants: Participant[];
}

function storageKey(eventId: string): string {
  return `gs:${eventId}:participantId`;
}

function defaultAvailability(
  days: string[],
): Record<string, AvailabilityStatus> {
  const entries: [string, AvailabilityStatus][] = days.map((day) => [
    day,
    "unavailable",
  ]);
  return Object.fromEntries(entries);
}

export default function EventClient({
  eventId,
  event,
  initialParticipants,
}: EventClientProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [nameEntered, setNameEntered] = useState(false);
  const [name, setName] = useState("");
  const [availability, setAvailability] = useState<
    Record<string, AvailabilityStatus>
  >(defaultAvailability(event.days));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem(storageKey(eventId));
    if (!storedId) return;

    const existing = initialParticipants.find((p) => p.id === storedId);
    if (!existing) {
      localStorage.removeItem(storageKey(eventId));
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect -- syncing local
       component state from localStorage (an external system) once on
       mount; this is the canonical effect use case, not derived state. */
    setParticipantId(existing.id);
    setName(existing.name);
    setAvailability({
      ...defaultAvailability(event.days),
      ...existing.availability,
    });
    setNameEntered(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Only run once on mount — initialParticipants/event.days are stable for this page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  function handleStatusChange(day: string, status: AvailabilityStatus) {
    setAvailability((prev) => ({ ...prev, [day]: status }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, name, availability }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSaving(false);
        return;
      }

      localStorage.setItem(storageKey(eventId), data.id);
      setParticipantId(data.id);

      const refreshed = await fetch(`/api/events/${eventId}`);
      const refreshedData = await refreshed.json();
      setParticipants(refreshedData.participants);

      setSavedAt(Date.now());
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">{event.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Share this page&apos;s link with the group so everyone can mark their
          availability.
        </p>
      </div>

      {!nameEntered ? (
        <NameGate
          onSubmit={(enteredName) => {
            setName(enteredName);
            setNameEntered(true);
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
            Marking availability as <span className="font-medium">{name}</span>
          </p>
          <AvailabilityGrid
            days={event.days}
            availability={availability}
            onChange={handleStatusChange}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save my availability"}
            </button>
            {savedAt && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        </div>
      )}

      <ResultsSummary days={event.days} participants={participants} />
    </div>
  );
}

function NameGate({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  function submit() {
    setTouched(true);
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium">
        Enter your name to mark your availability
      </label>
      <div className="flex gap-2">
        <input
          data-testid="name-input"
          id="name"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          maxLength={50}
          className="flex-1 rounded border border-gray-300 px-3 py-2"
          placeholder="Your name"
        />
        <button
          data-testid="event-submit"
          type="button"
          onClick={submit}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white"
        >
          Continue
        </button>
      </div>
      {touched && !value.trim() && (
        <p data-testid="name-input-error" className="text-sm text-red-600">
          Please enter a name.
        </p>
      )}
    </div>
  );
}

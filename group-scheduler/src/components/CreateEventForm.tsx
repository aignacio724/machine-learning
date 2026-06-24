"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import DatePicker from "./DatePicker";

export default function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleDay(day: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a title.");
      return;
    }
    if (selectedDays.size === 0) {
      setError("Please select at least one candidate day.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          days: Array.from(selectedDays),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push(`/event/${data.id}`);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Event title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Team offsite"
          maxLength={200}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">
          Candidate days ({selectedDays.size} selected)
        </span>
        <DatePicker selected={selectedDays} onToggle={toggleDay} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

interface DatePickerProps {
  selected: Set<string>;
  onToggle: (day: string) => void;
}

function daysBetween(startDate: string, endDate: string) {
  // start and end strings are of YYYY-MM-DD format.
  // Order the endpoints so a range works whether the new click is
  // before or after the anchor.
  const [from, to] =
    startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  const dates: string[] = [];

  // Use UTC to prevent local daylight saving time timezone shifts
  const current = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);

  // Loop day-by-day until the end date is passed
  while (current <= end) {
    // Extract the YYYY-MM-DD part and push to array
    const isoString = current.toISOString().split("T")[0];
    dates.push(isoString);

    // Advance current date by exactly 1 day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

export default function DatePicker({ selected, onToggle }: DatePickerProps) {
  const [anchor, setAnchor] = useState<string | null>(null);

  const today = startOfToday();
  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1),
    ),
  ];

  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function handleClick(iso: string, shift: boolean) {
    if (shift && anchor) {
      // Fill the range: only add days that aren't already selected, so we
      // never toggle off the anchor or any already-selected day in between.
      for (const d of daysBetween(anchor, iso)) {
        if (!selected.has(d)) onToggle(d);
      }
    } else {
      onToggle(iso);
    }
    setAnchor(iso);
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          data-testid="previous-month"
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
            )
          }
          className="rounded px-2 py-1 hover:bg-gray-100"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="font-medium">{monthLabel}</span>
        <button
          data-testid="next-month"
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
            )
          }
          className="rounded px-2 py-1 hover:bg-gray-100"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`pad-${i}`} />;

          const iso = toISODate(date);
          const isPast = date < today;
          const isSelected = selected.has(iso);

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={(e) => handleClick(iso, e.shiftKey)}
              className={[
                "aspect-square rounded text-sm",
                isPast
                  ? "cursor-not-allowed text-gray-300"
                  : isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

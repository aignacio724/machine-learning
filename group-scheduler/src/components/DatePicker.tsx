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

export default function DatePicker({ selected, onToggle }: DatePickerProps) {
  const today = startOfToday();
  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0
  ).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)
    ),
  ];

  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
            )
          }
          className="px-2 py-1 rounded hover:bg-gray-100"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="font-medium">{monthLabel}</span>
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
            )
          }
          className="px-2 py-1 rounded hover:bg-gray-100"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
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
              onClick={() => onToggle(iso)}
              className={[
                "aspect-square rounded text-sm",
                isPast
                  ? "text-gray-300 cursor-not-allowed"
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

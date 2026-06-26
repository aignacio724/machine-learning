import type { AvailabilityStatus } from "@/lib/types";

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  ifNeeded: "If Needed",
  unavailable: "Not Available",
};

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  available: "bg-green-600 text-white",
  ifNeeded: "bg-amber-500 text-white",
  unavailable: "bg-gray-400 text-white",
};

export function formatDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface AvailabilityGridProps {
  days: string[];
  availability: Record<string, AvailabilityStatus>;
  onChange: (day: string, status: AvailabilityStatus) => void;
}

export default function AvailabilityGrid({
  days,
  availability,
  onChange,
}: AvailabilityGridProps) {
  return (
    <div className="flex flex-col gap-2">
      {days.map((day) => {
        const status = availability[day] ?? "unavailable";
        return (
          <div
            key={day}
            className="flex items-center justify-between gap-3 rounded border border-gray-200 px-3 py-2"
          >
            <span className="text-sm font-medium">{formatDay(day)}</span>
            <div className="flex gap-1">
              {(Object.keys(STATUS_LABELS) as AvailabilityStatus[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(day, option)}
                    className={[
                      "rounded px-2 py-1 text-xs font-medium",
                      status === option
                        ? STATUS_STYLES[option]
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                    ].join(" ")}
                  >
                    {STATUS_LABELS[option]}
                  </button>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

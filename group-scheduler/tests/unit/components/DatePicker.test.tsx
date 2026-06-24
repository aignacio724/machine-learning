import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DatePicker from "@/components/DatePicker";

beforeEach(() => {
  // Monday, June 15 2026 — fixes "today" so past/future day assertions are deterministic.
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 15));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DatePicker", () => {
  it("renders the current month and year", () => {
    render(<DatePicker selected={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByText("June 2026")).toBeInTheDocument();
  });

  it("disables days before today and keeps future days clickable", () => {
    render(<DatePicker selected={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByRole("button", { name: "10" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "20" })).toBeEnabled();
  });

  it("calls onToggle with the ISO date when a future day is clicked", () => {
    const onToggle = vi.fn();
    render(<DatePicker selected={new Set()} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "20" }));

    expect(onToggle).toHaveBeenCalledWith("2026-06-20");
  });

  it("highlights days present in the selected set", () => {
    render(
      <DatePicker selected={new Set(["2026-06-20"])} onToggle={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "20" }).className).toContain(
      "bg-blue-600"
    );
  });

  it("navigates to the next/previous month", () => {
    render(<DatePicker selected={new Set()} onToggle={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("July 2026")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("June 2026")).toBeInTheDocument();
  });
});

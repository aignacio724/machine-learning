import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvailabilityGrid from "@/components/AvailabilityGrid";
import type { AvailabilityStatus } from "@/lib/types";

const DAYS = ["2026-06-24", "2026-06-25"];

function renderGrid(
  availability: Record<string, AvailabilityStatus> = {},
  onChange = vi.fn()
) {
  render(
    <AvailabilityGrid days={DAYS} availability={availability} onChange={onChange} />
  );
  return onChange;
}

describe("AvailabilityGrid", () => {
  it("renders a formatted label and three status buttons per day", () => {
    renderGrid();
    expect(screen.getByText(/Jun 24/)).toBeInTheDocument();
    expect(screen.getByText(/Jun 25/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Available" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "If Needed" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Not Available" })).toHaveLength(2);
  });

  it("defaults a day with no entry to Not Available styling", () => {
    renderGrid();
    const buttons = screen.getAllByRole("button", { name: "Not Available" });
    expect(buttons[0].className).toContain("bg-gray-400");
  });

  it("highlights the currently selected status for each day", () => {
    renderGrid({ "2026-06-24": "available", "2026-06-25": "ifNeeded" });
    const [available24] = screen.getAllByRole("button", { name: "Available" });
    const [, ifNeeded25] = screen.getAllByRole("button", { name: "If Needed" });
    expect(available24.className).toContain("bg-green-600");
    expect(ifNeeded25.className).toContain("bg-amber-500");
  });

  it("calls onChange with the day and clicked status", async () => {
    const onChange = renderGrid();
    const [, available25] = screen.getAllByRole("button", { name: "Available" });

    await userEvent.click(available25);

    expect(onChange).toHaveBeenCalledWith("2026-06-25", "available");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateEventForm from "@/components/CreateEventForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  // Fixes "today" so a specific day cell is reliably clickable across the test run.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 15));
  push.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("CreateEventForm", () => {
  it("shows a validation error when submitting without a title", () => {
    render(<CreateEventForm />);
    fireEvent.click(screen.getByRole("button", { name: "20" }));
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(screen.getByText("Please enter a title.")).toBeInTheDocument();
  });

  it("shows a validation error when no days are selected", () => {
    render(<CreateEventForm />);
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Team Offsite" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(
      screen.getByText("Please select at least one candidate day.")
    ).toBeInTheDocument();
  });

  it("submits the title and selected days, then redirects to the new event", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "abc123", title: "Team Offsite", days: ["2026-06-20"] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CreateEventForm />);
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Team Offsite" },
    });
    fireEvent.click(screen.getByRole("button", { name: "20" }));
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/event/abc123"));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/events",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Team Offsite", days: ["2026-06-20"] }),
      })
    );
  });

  it("shows the server error message when creation fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "days must be a non-empty array of YYYY-MM-DD strings" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<CreateEventForm />);
    fireEvent.change(screen.getByLabelText("Event title"), {
      target: { value: "Team Offsite" },
    });
    fireEvent.click(screen.getByRole("button", { name: "20" }));
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(
      await screen.findByText("days must be a non-empty array of YYYY-MM-DD strings")
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

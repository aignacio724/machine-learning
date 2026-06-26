import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EventClient from "@/components/EventClient";
import type { Event, Participant } from "@/lib/types";

const EVENT: Event = {
  id: "evt1",
  title: "Team Offsite",
  days: ["2026-06-24", "2026-06-25"],
  createdAt: 0,
};

function storageKey(eventId: string) {
  return `gs:${eventId}:participantId`;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("EventClient", () => {
  it("shows the name gate for a first-time visitor, then the grid after entering a name", () => {
    render(
      <EventClient eventId={EVENT.id} event={EVENT} initialParticipants={[]} />,
    );

    expect(
      screen.getByLabelText("Enter your name to mark your availability"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Marking availability as")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    // A brand new participant defaults every day to Not Available.
    expect(
      screen.getAllByRole("button", { name: "Not Available" })[0].className,
    ).toContain("bg-gray-400");
  });

  it("saves availability, stores the participant id, and refreshes results", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/availability")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "p1",
            name: "Alice",
            availability: { "2026-06-24": "available" },
            updatedAt: 0,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          event: EVENT,
          participants: [
            {
              id: "p1",
              name: "Alice",
              availability: { "2026-06-24": "available" },
              updatedAt: 0,
            },
          ],
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EventClient eventId={EVENT.id} event={EVENT} initialParticipants={[]} />,
    );

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const [firstDayRow] = screen.getAllByRole("button", { name: "Available" });
    fireEvent.click(firstDayRow);
    fireEvent.click(
      screen.getByRole("button", { name: "Save my availability" }),
    );

    await waitFor(() => expect(screen.getByText("Saved!")).toBeInTheDocument());

    expect(localStorage.getItem(storageKey(EVENT.id))).toBe("p1");
    expect(screen.getByText("Results (1 response)")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/events/${EVENT.id}/availability`,
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(`/api/events/${EVENT.id}`);
  });

  it("pre-fills name and availability for a returning participant", () => {
    localStorage.setItem(storageKey(EVENT.id), "p1");
    const initialParticipants: Participant[] = [
      {
        id: "p1",
        name: "Bob",
        availability: { "2026-06-24": "ifNeeded" },
        updatedAt: 0,
      },
    ];

    render(
      <EventClient
        eventId={EVENT.id}
        event={EVENT}
        initialParticipants={initialParticipants}
      />,
    );

    expect(
      screen.queryByLabelText("Enter your name to mark your availability"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    const [ifNeeded24] = screen.getAllByRole("button", { name: "If Needed" });
    expect(ifNeeded24.className).toContain("bg-amber-500");
  });

  it("clears a stale participant id that no longer matches any participant", () => {
    localStorage.setItem(storageKey(EVENT.id), "does-not-exist");

    render(
      <EventClient eventId={EVENT.id} event={EVENT} initialParticipants={[]} />,
    );

    expect(
      screen.getByLabelText("Enter your name to mark your availability"),
    ).toBeInTheDocument();
    expect(localStorage.getItem(storageKey(EVENT.id))).toBeNull();
  });
});

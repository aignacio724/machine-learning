import { notFound } from "next/navigation";
import { getEventWithParticipants } from "@/lib/store";
import EventClient from "@/components/EventClient";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = getEventWithParticipants(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <EventClient
          eventId={id}
          event={result.event}
          initialParticipants={result.participants}
        />
      </div>
    </div>
  );
}

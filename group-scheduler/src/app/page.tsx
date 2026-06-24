import CreateEventForm from "@/components/CreateEventForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Group Scheduler</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Pick candidate days, share the link, and find a day that works
            for everyone.
          </p>
        </div>
        <CreateEventForm />
      </div>
    </div>
  );
}

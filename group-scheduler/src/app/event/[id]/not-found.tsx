import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50 px-6 text-center">
      <h1 className="text-xl font-semibold">Event not found</h1>
      <p className="max-w-sm text-sm text-zinc-600">
        This link may be invalid, or the server may have restarted since this
        event was created (this prototype only keeps data in memory).
      </p>
      <Link href="/" className="text-sm font-medium text-blue-600">
        Create a new event
      </Link>
    </div>
  );
}

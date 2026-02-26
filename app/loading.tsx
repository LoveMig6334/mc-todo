export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="mx-auto max-w-[95%] px-4 pb-8 pt-24">
        {/* Greeting skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-zinc-800 animate-pulse" />
        </div>

        {/* Progress bar skeleton */}
        <div className="mb-4 h-2 rounded-full bg-zinc-800 animate-pulse" />

        {/* Stats row skeleton */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-4 h-10 rounded-lg bg-zinc-800 animate-pulse" />

        {/* Task list skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

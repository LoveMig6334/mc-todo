export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="mx-auto max-w-[80%] px-4 pb-8 pt-24">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-36 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-4 w-80 rounded bg-zinc-800 animate-pulse" />
        </div>

        {/* Calendar nav skeleton */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-10 w-32 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-6 w-40 rounded bg-zinc-800 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-zinc-800 animate-pulse" />
        </div>

        {/* Weekday headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-6 rounded bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Calendar grid skeleton (5 weeks) */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

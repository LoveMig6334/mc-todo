export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="mx-auto max-w-[60%] px-4 pb-12 pt-24">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-40 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-zinc-800 animate-pulse" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-zinc-800 animate-pulse" />
        </div>

        {/* Insights skeleton */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-zinc-800 animate-pulse" />
        </div>
      </main>
    </div>
  );
}

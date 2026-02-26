export default function Loading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-900">
      {/* Header bar skeleton */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 pb-2 pt-14">
        <div className="h-6 w-6 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-48 rounded bg-zinc-800 animate-pulse" />
        <div className="ml-auto h-4 w-16 rounded bg-zinc-800 animate-pulse" />
      </div>

      {/* Canvas skeleton */}
      <div className="relative flex-1">
        <div className="absolute inset-4 rounded-xl bg-zinc-800/50 animate-pulse" />
      </div>
    </div>
  );
}

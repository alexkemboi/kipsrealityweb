// app/marketplace/categories/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar shimmer */}
      <div className="mx-auto max-w-6xl px-4 pt-24">
        <div className="h-8 w-56 rounded bg-gray-200 animate-pulse" />
        <div className="mt-3 h-4 w-80 rounded bg-gray-200 animate-pulse" />
      </div>

      {/* Grid shimmer */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
              <div className="mt-3 h-4 w-full rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
              <div className="mt-6 h-9 w-28 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

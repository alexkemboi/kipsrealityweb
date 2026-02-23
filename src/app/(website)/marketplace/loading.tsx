"use client";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 md:py-14 space-y-5 md:space-y-6">
        {/* Toolbar skeleton */}
        <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-background/70 p-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status tabs skeleton */}
        <div className="rounded-2xl border bg-card p-3 md:p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <Skeleton className="h-10 w-full sm:max-w-md rounded-xl" />
              <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
              <Skeleton className="h-10 w-full sm:w-52 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Desktop rows skeleton */}
        <div className="hidden md:block rounded-2xl border bg-card p-4 shadow-sm">
          {/* Header row */}
          <div className="mb-3 grid grid-cols-[36px_minmax(260px,2fr)_120px_140px_160px_140px_120px_120px] gap-3 px-1">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          <div className="space-y-3">
            {[...Array(6)].map((_, row) => (
              <div
                key={row}
                className="rounded-xl border bg-card px-4 py-3 shadow-sm"
              >
                <div className="grid grid-cols-[36px_minmax(260px,2fr)_120px_140px_160px_140px_120px_120px] items-center gap-3">
                  {/* checkbox */}
                  <Skeleton className="h-4 w-4 rounded" />

                  {/* listing summary */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>

                  {/* status */}
                  <Skeleton className="h-6 w-20 rounded-full" />

                  {/* price/type */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-14" />
                  </div>

                  {/* location */}
                  <Skeleton className="h-4 w-28" />

                  {/* performance */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>

                  {/* updated */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>

                  {/* actions */}
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile cards skeleton */}
        <div className="space-y-3 md:hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded mt-1" />
                <Skeleton className="h-14 w-14 rounded-lg" />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-background/60 p-2 space-y-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <div className="rounded-lg border bg-background/60 p-2 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>

                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />

                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-9 w-12 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

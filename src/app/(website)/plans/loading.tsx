import { Loader2 } from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-muted motion-safe:animate-pulse ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading pricing page content...</span>

      {/* Hero Section Loading */}
      <section className="relative w-full overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-12 top-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute bottom-8 left-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <Skeleton className="mx-auto h-8 w-40 rounded-full bg-white/10" />
            <Skeleton className="mx-auto h-12 w-11/12 bg-white/10 md:h-14" />
            <Skeleton className="mx-auto h-6 w-9/12 bg-white/10" />
            <div className="flex flex-col justify-center gap-3 pt-3 sm:flex-row">
              <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
              <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Loading */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 space-y-3 text-center md:mb-12">
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="mx-auto h-5 w-96 max-w-[90%]" />
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
              >
                <div className="space-y-6">
                  <Skeleton className="h-7 w-1/2" />

                  <div className="space-y-2">
                    <Skeleton className="h-11 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>

                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>

                  <Skeleton className="mt-2 h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section Loading */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center md:mb-12">
            <Skeleton className="mx-auto h-8 w-64" />
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Loading Indicator */}
      <div className="pointer-events-none fixed bottom-8 right-8 z-50 rounded-full border border-border bg-card p-4 shadow-lg">
        <div aria-label="Loading">
          <Loader2 className="h-6 w-6 text-primary motion-safe:animate-spin" />
        </div>
      </div>
    </div>
  );
}

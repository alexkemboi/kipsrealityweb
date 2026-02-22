"use client";

import { Loader2 } from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Loading (premium dark gradient like your marketplace pages) */}
      <section className="relative w-full overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-16 right-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute bottom-8 left-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <Skeleton className="h-8 w-40 mx-auto rounded-full bg-white/10" />
            <Skeleton className="h-12 md:h-14 w-11/12 mx-auto bg-white/10" />
            <Skeleton className="h-6 w-9/12 mx-auto bg-white/10" />
            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
              <Skeleton className="h-11 w-44 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Loading */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10 md:mb-12 space-y-3">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto max-w-[90%]" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
              >
                <div className="space-y-6">
                  {/* Plan name */}
                  <Skeleton className="h-7 w-1/2" />

                  {/* Price */}
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Skeleton className="h-11 w-full rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section Loading */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10 md:mb-12">
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm"
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

      {/* Floating Loading Indicator (theme-safe) */}
      <div className="fixed bottom-8 right-8 rounded-full border border-border bg-card p-4 shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );
}

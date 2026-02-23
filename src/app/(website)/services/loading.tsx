"use client";

import { Loader2 } from "lucide-react";

type LoadingVariant = "privacy-policy" | "plans" | "marketplace";

type RouteLoadingProps = {
  variant?: LoadingVariant;
};

function FloatingLoader({ label }: { label: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-3 rounded-full border bg-background/90 backdrop-blur px-4 py-3 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground/80">{label}</span>
      </div>
    </div>
  );
}

function HeroShell({
  lines = 3,
  pillWidth = "w-28",
}: {
  lines?: number;
  pillWidth?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center animate-pulse space-y-5">
          <div
            className={`mx-auto h-6 ${pillWidth} rounded-full bg-white/10 border border-white/10`}
          />
          <div className="mx-auto h-12 md:h-14 w-4/5 rounded-xl bg-white/10" />
          {lines >= 2 && (
            <div className="mx-auto h-5 w-2/3 rounded-lg bg-white/10" />
          )}
          {lines >= 3 && (
            <div className="mx-auto h-5 w-1/2 rounded-lg bg-white/10" />
          )}
          {lines >= 4 && (
            <div className="flex justify-center gap-3 pt-2">
              <div className="h-11 w-36 rounded-xl bg-white/10 border border-white/10" />
              <div className="h-11 w-28 rounded-xl bg-white/10 border border-white/10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PrivacyPolicyLoadingView() {
  return (
    <>
      <section className="relative w-full overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl animate-pulse">
            <div className="flex gap-2 mb-6">
              <div className="h-7 w-16 rounded-full border border-white/10 bg-white/10" />
              <div className="h-7 w-20 rounded-full border border-white/10 bg-white/10" />
            </div>

            <div className="h-10 md:h-14 w-4/5 rounded-xl bg-white/10 mb-4" />
            <div className="h-10 md:h-14 w-2/3 rounded-xl bg-white/10 mb-6" />

            <div className="flex flex-wrap gap-4">
              <div className="h-5 w-56 rounded bg-white/10" />
              <div className="h-5 w-48 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-10">
          <div className="p-6 md:p-8 space-y-8 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
              <div className="h-12 w-full rounded-xl bg-muted" />
            </div>

            <div className="space-y-4">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl border bg-background/40 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-muted shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-5/6 rounded bg-muted" />
                        <div className="h-4 w-2/3 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card shadow-sm overflow-hidden animate-pulse"
            >
              <div className="px-5 md:px-6 py-5 flex items-start gap-4">
                <div className="hidden sm:block h-10 w-10 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-4/5 rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-lg bg-muted" />
                  <div className="h-9 w-9 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FloatingLoader label="Loading policy…" />
    </>
  );
}

function PlansLoadingView() {
  return (
    <>
      <HeroShell lines={3} pillWidth="w-24" />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16 space-y-4 animate-pulse">
            <div className="mx-auto h-8 w-56 rounded-lg bg-muted" />
            <div className="mx-auto h-5 w-96 max-w-full rounded-lg bg-muted" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-card p-6 md:p-8 shadow-sm animate-pulse ${
                  i === 1 ? "ring-1 ring-primary/20" : ""
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-28 rounded bg-muted" />
                    {i === 1 && (
                      <div className="h-6 w-20 rounded-full bg-primary/20" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="h-10 w-36 rounded bg-muted" />
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>

                  <div className="space-y-3 pt-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-muted" />
                        <div className="h-4 flex-1 rounded bg-muted" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <div className="h-11 w-full rounded-xl bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16 space-y-4 animate-pulse">
            <div className="mx-auto h-8 w-64 rounded-lg bg-muted" />
            <div className="mx-auto h-5 w-80 rounded-lg bg-muted" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-card p-6 shadow-sm animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
                <div className="space-y-3">
                  <div className="h-5 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FloatingLoader label="Loading plans…" />
    </>
  );
}

function MarketplaceLoadingView() {
  return (
    <>
      <HeroShell lines={2} pillWidth="w-32" />

      <section className="container mx-auto px-6 -mt-6 relative z-10">
        <div className="rounded-2xl border bg-card shadow-sm p-4 md:p-5 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="h-11 flex-1 rounded-xl bg-muted" />
            <div className="h-11 w-full lg:w-44 rounded-xl bg-muted" />
            <div className="h-11 w-full lg:w-44 rounded-xl bg-muted" />
            <div className="h-11 w-full lg:w-32 rounded-xl bg-muted" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10 md:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="space-y-3 animate-pulse">
            <div className="h-7 w-56 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
          <div className="hidden md:flex gap-2 animate-pulse">
            <div className="h-10 w-24 rounded-xl bg-muted" />
            <div className="h-10 w-24 rounded-xl bg-muted" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-48 w-full bg-muted" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-6 w-2/3 rounded bg-muted" />
                  <div className="h-6 w-16 rounded-full bg-muted" />
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-20 rounded bg-muted" />
                  <div className="h-9 w-28 rounded-xl bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FloatingLoader label="Loading marketplace…" />
    </>
  );
}

export default function RouteLoading({
  variant = "marketplace",
}: RouteLoadingProps) {
  return (
    <div className="min-h-screen bg-background">
      {variant === "privacy-policy" && <PrivacyPolicyLoadingView />}
      {variant === "plans" && <PlansLoadingView />}
      {variant === "marketplace" && <MarketplaceLoadingView />}
    </div>
  );
}

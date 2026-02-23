import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading page content...</span>

      {/* Hero Section Loading */}
      <div className="w-full bg-gray-100 py-32">
        <div className="container mx-auto px-6">
          <div className="animate-pulse space-y-6 text-center">
            <div className="mx-auto h-12 w-3/4 rounded-lg bg-gray-200" />
            <div className="mx-auto h-6 w-2/3 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Pricing Tiers Loading */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 animate-pulse space-y-4 text-center">
            <div className="mx-auto h-8 w-64 rounded-lg bg-gray-200" />
            <div className="mx-auto h-6 w-96 max-w-full rounded-lg bg-gray-200" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-200 p-8"
              >
                <div className="space-y-6">
                  {/* Plan Name */}
                  <div className="h-8 w-1/2 rounded-lg bg-gray-200" />

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="h-12 w-3/4 rounded-lg bg-gray-200" />
                    <div className="h-4 w-1/2 rounded-lg bg-gray-200" />
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-gray-200" />
                        <div className="h-4 flex-1 rounded-lg bg-gray-200" />
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 h-12 w-full rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section Loading */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 animate-pulse text-center">
            <div className="mx-auto h-8 w-64 rounded-lg bg-gray-200" />
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-2/3 rounded-lg bg-gray-200" />
                  <div className="h-6 w-6 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Loading Indicator */}
      <div className="pointer-events-none fixed bottom-8 right-8 rounded-full bg-white p-4 shadow-lg">
        <Loader2
          className="h-6 w-6 animate-spin text-blue-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

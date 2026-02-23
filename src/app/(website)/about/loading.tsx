import { Loader2 } from "lucide-react";

type SkeletonProps = {
  className?: string;
  rounded?: "lg" | "full";
};

function SkeletonShimmer({ className = "", rounded = "lg" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "relative overflow-hidden bg-gray-200/90",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        className,
      ].join(" ")}
    >
      <div className="skeleton-shimmer absolute inset-0 motion-reduce:hidden" />
    </div>
  );
}

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
      <section className="w-full py-32 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6">
            <SkeletonShimmer className="h-12 w-3/4 mx-auto" />
            <SkeletonShimmer className="h-6 w-2/3 mx-auto" />
          </div>
        </div>
      </section>

      {/* About Content Loading */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Mission Section */}
          <div className="max-w-3xl mx-auto mb-24">
            <div className="space-y-4 text-center">
              <SkeletonShimmer className="h-8 w-64 mx-auto" />
              <SkeletonShimmer className="h-4 w-full" />
              <SkeletonShimmer className="h-4 w-5/6 mx-auto" />
              <SkeletonShimmer className="h-4 w-4/5 mx-auto" />
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <SkeletonShimmer className="h-8 w-48 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center">
                <SkeletonShimmer
                  rounded="full"
                  className="w-48 h-48 mx-auto mb-4"
                />
                <div className="space-y-2">
                  <SkeletonShimmer className="h-6 w-3/4 mx-auto" />
                  <SkeletonShimmer className="h-4 w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section Loading */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <SkeletonShimmer className="h-8 w-48 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <SkeletonShimmer className="h-12 w-12 mb-4" />
                <div className="space-y-3">
                  <SkeletonShimmer className="h-6 w-3/4" />
                  <SkeletonShimmer className="h-4 w-full" />
                  <SkeletonShimmer className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white/95 backdrop-blur p-4 rounded-full shadow-lg border border-gray-100 pointer-events-none">
        <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none text-blue-500" />
      </div>

      <style jsx>{`
        .skeleton-shimmer {
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.55) 45%,
            rgba(255, 255, 255, 0.85) 50%,
            rgba(255, 255, 255, 0.55) 55%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.6s ease-in-out infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer {
            animation: none;
            transform: none;
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
}

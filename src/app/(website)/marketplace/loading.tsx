"use client";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Loading skeleton for the filters */}
      <div className="w-full max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between animate-pulse">
            <div className="w-full md:w-1/3 h-10 bg-gray-200 rounded-xl" />
            <div className="w-full md:w-1/4 h-10 bg-gray-200 rounded-xl" />
            <div className="w-full md:w-1/4 h-10 bg-gray-200 rounded-xl" />
          </div>
        </div>

        {/* Loading skeleton for listings grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="w-full h-60 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex items-center justify-between mt-4">
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

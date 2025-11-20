"use client";

export default function Loading() {
  return (
    <div className="min-h-[400px] p-6 bg-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer spinner */}
          <div className="w-16 h-16 border-4 border-[#15386a] border-t-[#30D5C8] rounded-full animate-spin"></div>
          {/* Inner spinner (smaller, opposite direction) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-[#15386a] border-b-[#30D5C8] rounded-full animate-[spin_0.8s_linear_infinite_reverse]"></div>
        </div>
        {/* Loading text */}
        <p className="mt-4 text-gray-400">Loading maintenance requests...</p>
      </div>
    </div>
  );
}
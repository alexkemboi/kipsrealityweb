"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-12 h-12 relative">
          <div className="w-12 h-12 rounded-full border-4 border-[#15386a] border-t-[#30D5C8] animate-spin" />
        </div>
        {/* Loading text */}
        <p className="text-[#30D5C8] font-medium">Loading || Please wait...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
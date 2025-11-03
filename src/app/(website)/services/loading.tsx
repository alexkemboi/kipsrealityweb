"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Loading */}
      <div className="w-full py-32 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto" />
            <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto" />
          </div>
        </div>
      </div>

      {/* Services Grid Loading */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 shadow-lg animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-6" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg w-full" />
                    <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                    <div className="h-4 bg-gray-200 rounded-lg w-4/6" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg w-32 mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section Loading */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto" />
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-lg w-full" />
                  <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Loading Indicator */}
      <div className="fixed bottom-8 right-8 bg-white p-4 rounded-full shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    </div>
  );
}
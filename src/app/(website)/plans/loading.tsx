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

      {/* Pricing Tiers Loading */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto" />
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 p-8 animate-pulse">
                <div className="space-y-6">
                  {/* Plan Name */}
                  <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
                  
                  {/* Price */}
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                  </div>
                  
                  {/* Features List */}
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-200 rounded-full" />
                        <div className="h-4 bg-gray-200 rounded-lg flex-1" />
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <div className="h-12 bg-gray-200 rounded-lg w-full mt-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section Loading */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto" />
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-xl shadow-sm animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3" />
                  <div className="h-6 w-6 bg-gray-200 rounded-full" />
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
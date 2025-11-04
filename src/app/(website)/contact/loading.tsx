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

      {/* Contact Form Loading */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8 animate-pulse">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-lg w-full" />
                  <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-gray-200 rounded-lg w-1/2" />
                        <div className="h-4 bg-gray-200 rounded-lg w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-6 animate-pulse">
                {/* Name Field */}
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded-lg w-20" />
                  <div className="h-12 bg-gray-200 rounded-lg w-full" />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded-lg w-16" />
                  <div className="h-12 bg-gray-200 rounded-lg w-full" />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded-lg w-24" />
                  <div className="h-32 bg-gray-200 rounded-lg w-full" />
                </div>

                {/* Submit Button */}
                <div className="h-12 bg-gray-200 rounded-lg w-full" />
              </div>
            </div>
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
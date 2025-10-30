"use client";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-700 text-white overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto space-y-6 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          Streamline Your Property Management
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Simplify operations, automate rent collection, and manage tenants seamlessly — 
          all in one professional platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Button
            size="lg"
            className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-full shadow-lg"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white hover:bg-white/10 px-8 py-3 rounded-full"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Elegant Deep Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-[160px]"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,224L48,197.3C96,171,192,117,288,106.7C384,96,480,128,576,154.7C672,181,768,203,864,213.3C960,224,1056,224,1152,197.3C1248,171,1344,117,1392,90.7L1440,64V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}

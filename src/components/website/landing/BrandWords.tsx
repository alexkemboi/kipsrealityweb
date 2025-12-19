

"use client";

import { TypewriterEffect } from "../../ui/typewriter-effect";
import { motion } from "framer-motion";

export function TypewriterEffectDemo() {
  const words = [
    { text: "Professional." },
    { text: "Reliable.", className: "text-blue-200" },
    { text: "Innovative", className: "text-blue-200" },
  ];

  return (
    <section className="relative min-h-[15vh] flex justify-center bg-gray-50 items-center overflow-hidden">


      {/* --- Content --- */}
      <div className="relative z-20 container mx-auto px-6 py-8 text-center">
        {/* Section Heading */}
        <h3 className="text-gray-900 mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-sm pb-4">
          Our Brand{" "}
          <span className="text-blue-700">
            Promise
          </span>
        </h3>

        {/* --- Card --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="relative bg-blue-700 backdrop-blur-2xl border border-white/20 rounded-2xl 
                     p-10 md:p-14 shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center 
                     justify-center space-y-10 hover:border-white/40 
                      transition-all duration-500 group"
        >
          {/* Card Glow */}
          <div className="absolute inset-0 rounded-2xl  opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

          {/* Typewriter Text */}
          <div className="relative z-10">
            <TypewriterEffect words={words} />
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-white/90 text-lg md:text-xl max-w-3xl leading-relaxed font-light tracking-wide relative z-10"
          >
            We deliver excellence through{" "}
            <span className="text-blue-200 font-medium">professionalism</span>,{" "}
            <span className="text-blue-200 font-medium">reliability</span>, and{" "}
            <span className="text-blue-200 font-medium">innovation</span> —
            redefining how property management feels.
          </motion.p>

          {/* Divider Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="relative z-10 mt-4"
          >
            <div className="w-32 h-1 bg-blue-200 rounded-full opacity-60" />
          </motion.div>
        </motion.div>


      </div>
    </section>
  );
}

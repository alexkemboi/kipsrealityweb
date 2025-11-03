

"use client";

import { TypewriterEffect } from "../../ui/typewriter-effect";
import { motion } from "framer-motion";

export function TypewriterEffectDemo() {
  const words = [
    { text: "Professional." },
    { text: "Reliable.", className: "text-blue-400" },
    { text: "Innovative", className: "text-cyan-400" },
  ];

  return (
    <section className="relative min-h-[15vh] flex justify-center bg-[#0b1f3a] items-center overflow-hidden">
      

      {/* --- Content --- */}
      <div className="relative z-20 container mx-auto px-6 py-18 text-center">
        {/* Section Heading */}
        <h3 className="text-white mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pb-4">
          Our Brand{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient-x">
            Promise
          </span>
        </h3>

        {/* --- Card --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl 
                     p-10 md:p-14 shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center 
                     justify-center space-y-10 hover:bg-white/15 hover:border-white/30 
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
            <span className="text-blue-300 font-medium">professionalism</span>,{" "}
            <span className="text-cyan-300 font-medium">reliability</span>, and{" "}
            <span className="text-indigo-300 font-medium">innovation</span> — 
            redefining how property management feels.
          </motion.p>

          {/* Divider Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="relative z-10 mt-4"
          >
            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-60" />
          </motion.div>
        </motion.div>

        
      </div>
    </section>
  );
}

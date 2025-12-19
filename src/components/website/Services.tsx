"use client";

import Image from "next/image";
import bgImage from "@/assets/hero-cityscape.jpg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <section
      id="what-makes"
      className="relative min-h-[95vh] flex justify-center items-center overflow-hidden"
    >
      {/* --- Background --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Background image for What Makes Us Different"
          fill
          className="object-cover"
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-neutral-900/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/40 via-transparent to-neutral-900/40" />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-24 left-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-medium delay-1000" />
      </div>

      {/* --- Content --- */}
      <div className="relative z-20 container mx-auto px-6 py-24 text-center">
        <h3 className="text-white mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pb-4">
          Our{" "}
          <span className="text-blue-400">
            Services
          </span>
        </h3>

        {/* --- Adjusted Card Width --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl 
                     shadow-2xl w-full max-w-6xl mx-auto flex flex-col items-center 
                     justify-center space-y-10 p-10 md:p-14 
                     hover:bg-white/15 hover:border-white/30 
                     hover:shadow-blue-500/30 transition-all duration-500 group"
        >
          {/* Card Glow */}
          <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light tracking-wide">
              At <span className="text-blue-400 font-medium">RentFlow360</span>,
              we offer a comprehensive range of real estate services — from property
              management and tenant placement to investment advisory and digital listings.
              Whatever your goal, we’re here to help you achieve it with confidence.
            </p>

            <Link href="/services">
              <Button
                size="lg"
                className="font-inter text-lg px-8 py-6 bg-blue-700 hover:bg-blue-800 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative">Go To Services</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function WhatMakes() {
  return (
    <section
      id="what-makes"
      className="relative min-h-[65vh] flex justify-center items-center overflow-hidden"
    >
     {/* Background Image */}
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
           </div>
        

      {/* --- Content --- */}
      <div className="relative z-20 container mx-auto px-6 py-24 text-center">
        <h3 className="text-black mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pb-4">
          Our{" "}
          <span className="text-transparent bg-clip-text text-gradient-primary animate-gradient">
            Services
          </span>
        </h3>

          <div className="relative z-10 space-y-8 max-w-5xl mx-auto">
            <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed mb-8 max-w-5xl mx-autoe">
              At <span className="text-transparent bg-clip-text text-gradient-primary animate-gradient">RentFlow360</span>, 
              we offer a comprehensive range of real estate services, from property 
              management and tenant placement to investment advisory and digital listings. 
              Whatever your goal, we’re here to help you achieve it with confidence.
            </p>

            <Link href="/services">
              <Button
                size="lg"
                className="font-inter text-lg px-8 py-6 bg-gradient-primary hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative">Go To Services</span>
              </Button>

            </Link>
          </div>
      </div>
    </section>
  );
}

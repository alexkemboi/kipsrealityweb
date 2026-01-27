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
      className="relative flex justify-center items-center overflow-hidden bg-slate-50 py-16"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-transparent"></div>
      </div>


      {/* Content Section */}
      <div className="relative z-20 container mx-auto px-6 py-12 text-center">
        <h3 className="text-black mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pb-4">
          Our{" "}
          <span className="text-[#003b73]">
            Services
          </span>
        </h3>

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <p className="text-lg lg:text-xl text-[#151b1f]/80 leading-relaxed mb-6">
            At <span className="text-[#003b73] font-bold">RentFlow360</span>,
            we offer a comprehensive range of real estate services, from property
            management and tenant placement to investment advisory and digital listings.
          </p>

          <Link href="/services">
            <Button
              size="lg"
              className="font-inter text-lg px-8 py-6 bg-[#003b73] hover:bg-[#002b5b] text-white shadow-2xl hover:shadow-[#003b73]/30 transition-all duration-300 group relative overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative">Explore All Services</span>
            </Button>

          </Link>
        </div>
      </div>
    </section>
  );
}

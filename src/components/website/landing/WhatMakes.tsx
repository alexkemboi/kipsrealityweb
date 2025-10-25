"use client";

import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Shield, Zap, BarChart3, Layers, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatMakes() {
  const features = [
    {
      icon: Layers,
      title: "All-in-One Platform",
      desc: "From property listings to lease signing, rent collection, and utility management — everything is integrated.",
    },
    {
      icon: Zap,
      title: "Automation That Works",
      desc: "Save time with automated bill splitting, invoice generation, and tenant screening.",
    },
    {
      icon: BarChart3,
      title: "Data-Driven Decisions",
      desc: "Our analytics tools help property owners make informed choices and optimize performance.",
    },
    {
      icon: Shield,
      title: "Compliance & Security First",
      desc: "We prioritize secure digital processes and tax compliance to protect both landlords and tenants.",
    },
    {
      icon: Lock,
      title: "Smart Financial Tools",
      desc: "With Stripe and Plaid integrations, we offer secure, fast, and reliable payment processing and financial verification.",
    },
  ];

  return (
    <section
      id="what-makes"
      className="relative min-h-[95vh] flex justify-center items-center overflow-hidden"
    >
      {/* --- Background --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      {/* --- Content --- */}
      <div className="relative z-20 container mx-auto px-6 py-24 text-center">
        <h3 className="text-black mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pb-4">
          What Makes{" "}
          <span className="text-transparent bg-clip-text text-gradient-primary animate-gradient">
            Us Different
          </span>
        </h3>

        <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed mb-16 max-w-3xl mx-auto">
          We don’t just manage properties  we elevate them. Discover why thousands of landlords and tenants choose{" "}
          <span className="text-blue-600 font-semibold">Kips Reality LLC</span>.
        </p>

        {/* --- Features Grid --- */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
              className="relative bg-[#1d3d67] backdrop-blur-2xl border border-white/20 rounded-2xl 
                         p-8 shadow-2xl flex flex-col items-center text-center 
                         hover:border-white/30 hover:shadow-blue-500/30 transition-all duration-500 
                         group cursor-pointer"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 rounded-xl group-hover:from-blue-500/50 group-hover:to-cyan-400/50 transition-all duration-500">
                <item.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h5 className="relative z-10 text-2xl font-semibold text-white mb-3 ">
                {item.title}
              </h5>

              {/* Description */}
              <p className="relative z-10 text-white/80 text-lg leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

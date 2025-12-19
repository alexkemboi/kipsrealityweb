"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  platform,
  automation,
  decisions,
  compliance,
  financialTools,
} from "@/app/data/DifferentData";
import { Layers, Zap, BarChart3, Shield, Lock, LucideIcon } from "lucide-react";



const iconMap: Record<string, LucideIcon> = {
  Layers: Layers,
  Zap: Zap,
  BarChart3: BarChart3,
  Shield: Shield,
  Lock: Lock,
  // Mapping for possible DB string variations
  "All-in-One Platform": Layers,
  "Automation That Works": Zap,
  "Data-Driven Decisions": BarChart3,
  "Compliance & Security First": Shield,
  "Smart Financial Tools": Lock
};

export default function WhatMakes() {
  // Using static data for specific feature display
  const displayFeatures = [
    { ...platform[0], iconStr: "Layers" },
    { ...automation[0], iconStr: "Zap" },
    { ...decisions[0], iconStr: "BarChart3" },
    { ...compliance[0], iconStr: "Shield" },
    { ...financialTools[0], iconStr: "Lock" },
  ];

  return (
    <section
      id="features"
      className="relative py-16 bg-white overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-white">
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-700 mb-4 tracking-tight">
              What Makes <span className="text-black">Us Different</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Powerful features designed for modern landlords to automate workflows and maximize returns.
            </p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {displayFeatures!.map((item, index) => {
            let IconComponent = Layers; // Default

            // Static item handling
            if (item.iconStr && iconMap[item.iconStr]) {

              IconComponent = iconMap[item.iconStr];
            } else {

              IconComponent = item.icon || Layers;
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="relative bg-white rounded-2xl p-8 
                           border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] 
                           hover:bg-blue-50/50 hover:shadow-[0_15px_30px_rgb(0,0,0,0.08)] 
                           transition-all duration-300 group flex flex-col h-full"
              >
                {/* Icon Container */}
                <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-700 text-white shadow-sm transition-transform group-hover:scale-110">
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-blue-700 mb-3 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-[15px] leading-relaxed flex-grow">
                  {item.description}
                </p>

                {/* Bottom Border Accent */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600/10 group-hover:bg-blue-600 transition-colors rounded-b-2xl"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

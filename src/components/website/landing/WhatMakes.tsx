import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Shield, Zap, BarChart3, Layers, Lock } from "lucide-react";

export default function WhatMakes() {
  return (
    <section
      id="what-makes"
      className="relative min-h-screen flex items-center bg-linear-to-b from-gray-50 to-white justify-center overflow-hidden"
    >
     
  {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>
      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h3 className="text-4xl md:text-5xl font-bold text-[#151b1f]">
              What Makes{" "}
              <span className="text-gradient-primary animate-gradient">
                Us Different
              </span>
            </h3>
            <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed">
              We don’t just manage properties — we elevate them. Discover why
              thousands of landlords and tenants choose Kips Reality LLC
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "All-in-One Platform",
                desc: "From property listings to lease signing, rent collection, and utility management—everything is integrated.",
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
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-[#1d3d67] shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 bg-gradient-to-r from-blue-500/40 to-cyan-400/40 rounded-xl group-hover:from-blue-500/60 group-hover:to-cyan-400/60 transition-all">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h5>
                <p className="text-white/70 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import bgImage from "@/assets/hero-cityscape.jpg";
import { Shield, Zap, BarChart3, Layers, Lock } from "lucide-react";

export default function WhatMakes() {
  return (
    <section
      id="what-makes"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
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

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-24 left-16 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-medium delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              What Makes{" "}
              <span className="text-gradient-primary animate-gradient">
                Us Different
              </span>
            </h3>
            <p className="text-white/70 text-lg max-w-3xl mx-auto leading-relaxed">
              We don’t just manage properties — we elevate them. Discover why
              thousands of landlords and tenants choose{" "}
              <span className="text-white font-semibold">Kips Reality LLC</span>.
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
                className="group bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-lg shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
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

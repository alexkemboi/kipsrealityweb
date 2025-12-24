"use client";

import Image from "next/image";
import { AboutUs as AboutUsType } from "@/app/data/AboutUsData";
import { HeroData } from "@/lib/aboutUs";
import { motion } from "framer-motion";

interface AboutProps {
  aboutData: AboutUsType[];
  heroData: HeroData | null;
}



export default function AboutUsPage({ aboutData, heroData }: AboutProps) {
  // Find specific sections by ID or fallback
  const discover = aboutData.find((s) => s.section === "company-overview") || aboutData[0];
  const vision = aboutData.find((s) => s.section === "vision") || aboutData[2];

  return (
    <main className="bg-white">
      {/* Section 1: Who We Are */}
      <section className="pt-28 pb-8 sm:pt-24 lg:pt-32 lg:pb-12">
        <div className="site-container">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 tracking-tight font-heading text-neutral-900">
                Who We Are
              </h1>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#003b73] leading-[1.1] mb-6 tracking-tight font-heading">
                Redefining Property Management for the Modern Era.
              </h2>

              <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed max-w-2xl font-medium mb-8">
                RentFlow360 is more than just a platform; we are a team of visionaries dedicated to making rental living seamless, automated, and rewarding for everyone involved.
              </p>

              {/* Accent line */}
              <div className="h-1.5 w-20 bg-[#003b73] rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story */}
      <section className="py-16 lg:py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="site-container">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-[#003b73] mb-8 font-heading">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-[#4B5563] leading-relaxed font-medium">
                  <p>
                    {discover?.description || "It all started with a simple observation: property management was stuck in the past. Landlords were overwhelmed by paperwork, and tenants felt disconnected. We knew there had to be a better way."}
                  </p>
                  <p>
                    Founded with a clear mission, RentFlow360 set out to bridge this gap. By combining deep real estate expertise with cutting-edge technology, we created a platform that automates the mundane, clarifies the complex, and brings humanity back to the rental experience.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Visual/Image */}
            <div className="flex-1 w-full flex justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1200"
                  alt="Our Story House"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Vision */}
      <section className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="site-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 text-[#003b73] text-sm md:text-base font-black tracking-[0.3em] uppercase mb-12">
              Our Vision
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111827] leading-[1.2] tracking-tight font-heading mb-10">
              To empower every landlord and tenant with a frictionless rental future.
            </h2>

            <p className="text-xl text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              {vision?.description || "Building a world where property management is no longer a burden, but a tool for growth and community building."}
            </p>

            <div className="flex justify-center">
              <div className="w-px h-20 bg-linear-to-b from-[#003b73] to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

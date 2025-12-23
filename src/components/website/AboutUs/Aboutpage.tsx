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
      <section className="pt-24 pb-8 lg:pt-32 lg:pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >

              <div className="flex items-center gap-3 text-black text-4xl md:text-5xl font-bold mb-8 font-sen">
                Who We Are
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-blue-700 leading-[1.1] mb-6 tracking-tight font-heading">
                Redefining <span className="text-blue-700">Property Management</span> for the Modern Era.
              </h1>

              <p className="text-lg md:text-xl text-slate-500/90 leading-relaxed max-w-2xl font-medium">
                RentFlow360 is more than just a platform; we are a team of visionaries dedicated to making rental living seamless, automated, and rewarding for everyone involved.
              </p>

              {/* Tighter accent line */}
              <div className="mt-6 h-1 w-20 bg-blue-700 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Story */}
      <section className="py-6 lg:py-8 bg-blue-50/10 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

            {/* Left Content */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-blue-700 mb-5 tracking-tight font-heading">
                  Our <span className="text-blue-700">Story</span>
                </h2>
                <div className="space-y-4 text-base md:text-lg text-slate-500/90 leading-relaxed font-medium">
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
            <div className="flex-1 w-full relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[16/9] rounded-[24px] overflow-hidden shadow-lg border-2 border-white"
              >
                <Image
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470"
                  alt="Our Story background"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Our Vision */}
      <section className="py-10 lg:py-12 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 text-blue-700 text-[13px] md:text-base font-black tracking-[0.3em] md:tracking-[0.4em] uppercase mb-12">
              Our Vision
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-blue-700 leading-[1.2] tracking-tight font-heading">
              To empower every landlord and tenant with a <span className="text-blue-700">frictionless</span> rental future.
            </h2>

            <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed opacity-95">
              {vision?.description}
            </p>

            <div className="mt-10 flex justify-center">
              <div className="w-px h-16 bg-gradient-to-b from-blue-700 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

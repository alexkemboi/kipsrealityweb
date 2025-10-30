"use client";

import Image from "next/image";
import { FlipWords } from "../../ui/flip-words";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { AboutUs as AboutUsType } from "@/app/data/AboutUsData";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AboutProps {
  aboutData: AboutUsType[];
}

export default function About({ aboutData }: AboutProps) {
  const words = ["platform", "experience", "solution"];

  const aboutUs = aboutData.find((s) => s.id === 1);
  const ourStory = aboutData.find((s) => s.id === 2);
  const ourVision = aboutData.find((s) => s.id === 3);

  return (
    <section
      id="about"
      className="relative min-h-[80vh] overflow-hidden bg-white"
    >
      {/* Soft Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* Gentle fade to white for clean transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/90 to-white"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#0089bf] mb-4">
            <span className="text-[#151b1f]">One</span>{" "}
            <FlipWords words={words} />
          </h2>
          <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed">
            Simplifying property management with a seamless, tech-driven platform
            that connects landlords and tenants effortlessly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {aboutUs && (
            <div className="bg-[#1d3d67] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                About <span className="text-[#4fd1c5]">Us</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {aboutUs.description}
              </p>
            </div>
          )}

          {ourStory && (
            <div className="bg-[#1d3d67] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Our <span className="text-[#4fd1c5]">Story</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourStory.description}
              </p>
            </div>
          )}

          {ourVision && (
            <div className="bg-[#1d3d67] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Our <span className="text-[#4fd1c5]">Vision</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourVision.description}
              </p>
            </div>
          )}
        </div>

        {/* Learn More Button */}
        <div className="flex justify-center mt-16">
          <Link href="/about">
            <Button
              size="lg"
              className="font-inter text-lg px-8 py-6 bg-gradient-to-r from-[#0089bf] to-[#4fd1c5] hover:from-[#0072a6] hover:to-[#36a89e] text-white shadow-xl hover:shadow-[#4fd1c5]/40 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative">Learn More</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

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
      className="relative min-h-auto overflow-hidden bg-white pt-0 pb-2"
    >

      <div className="absolute inset-0 z-0 bg-white">
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-6 text-center">
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#003b73] mb-4">
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
            <div className="bg-[#003b73] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                About <span className="text-white/80">Us</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {aboutUs.description}
              </p>
            </div>
          )}

          {ourStory && (
            <div className="bg-[#003b73] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Our <span className="text-white/80">Story</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourStory.description}
              </p>
            </div>
          )}

          {ourVision && (
            <div className="bg-[#003b73] text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02] duration-300">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Our <span className="text-white/80">Vision</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourVision.description}
              </p>
            </div>
          )}
        </div>

        {/* Learn More Button */}
        <div className="flex justify-center mt-12">
          <Link href="/about">
            <Button
              size="lg"
              className="font-inter text-lg px-8 py-6 bg-[#003b73] hover:bg-[#002b5b] text-white shadow-xl hover:shadow-[#003b73]/30 transition-all duration-300 group relative overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative">Learn More</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

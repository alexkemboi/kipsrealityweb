import React from "react";
import { FlipWords } from "../../ui/flip-words";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Button } from "../../ui/button";
import Link from "next/link";

export default function About() {
    const words = ["platform", "experience", "solution"];

  return (
    <section
      id="about"
      className="relative min-h-[80vh] flex  justify-center overflow-hidden"
    >
      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="City skyline background for About section"
          fill
          className="object-cover"
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-neutral-900/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-900/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/40 via-transparent to-neutral-900/40" />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-medium delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20 lg:py-20 text-center">
        <div className="max-w-6xl mx-auto space-y-4">
           <div className=" flex  px-4">
                  <div className="text-3xl lg:text-5xl pb-6  mx-auto font-bold text-[#0089bf] ">
                    <span className="text-white">One</span>
                    <FlipWords words={words} /> <br />
                  </div>
                </div>
          {/* Intro */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl ">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              About{" "}
              <span className="text-gradient-primary animate-gradient">
                Us
              </span>
            </h3>

            
           
            <p className="text-white/70 max-w-4xl mx-auto leading-relaxed ">
              At{" "}
              <span className="font-semibold text-white">
                RentFlow360
              </span>
              , we’re redefining the rental experience with a modern,
              tech-driven approach. Our platform was built to solve everyday
              challenges landlords and tenants face—and replace them with a
              single, seamless solution.
            </p>
           

           
                          
          </div>

          {/* Our Story */}
          <div className="space-y-4  bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto">
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Our {""}
             <span className="text-gradient-primary animate-gradient">

              Story
              </span>
              </h4>
            <p className="text-white/70 ">
             RentFlow360 was born out of a simple idea: property management
              shouldn’t be complicated. Our founders, with deep roots in
              finance, compliance, and real estate, saw firsthand how people
              struggled with disconnected systems.            
            </p>
          
          </div>

          {/* Mission */}
          <div className="space-y-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto">
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Our {""}
               <span className="text-gradient-primary animate-gradient">

              Mission
              </span>
              </h4>
            <p className="text-white/80 leading-relaxed">
              To simplify property management by providing a seamless,
              technology-driven platform that connects landlords and tenants
              while ensuring transparency, efficiency, and trust.
            </p>
          </div>
        </div>

          
        

        </div>
      </div>
    </section>
  );
}

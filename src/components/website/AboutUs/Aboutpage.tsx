// src/components/website/AboutUs/Aboutpage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { AboutUs as AboutUsType } from "@/app/data/AboutUsData";
import { HeroData, CTAData } from "@/lib/aboutUs";
import { useEffect, useState } from "react";
import { theme } from "@/app/data/servicesData";
import { ArrowRight, Sparkles } from "lucide-react";

interface AboutProps {
  aboutData: AboutUsType[];
  heroData: HeroData | null;
  ctaData: CTAData | null;
}

export default function AboutUsPage({ aboutData, heroData, ctaData }: AboutProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Find specific sections by ID
  const discover = aboutData.find((s) => s.section === "company-overview");
  const mission = aboutData.find((s) => s.section === "mission");
  const vision = aboutData.find((s) => s.section === "vision");


  // Default values with proper types
  const defaultHero: HeroData = {
    id: "default",
    page: "about",
    title: "Discover Our Story",
    subtitle: "Empowering real estate solutions through innovation and dedication.",
    description: undefined,
    imageUrl: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=500",
    gradient: "bg-[#1d3d67]/80",
    buttonText: undefined,
    buttonUrl: undefined
  };

  const defaultCTA: CTAData = {
    id: "default",
    page: "about",
    title: "Ready to Join Our Journey?",
    subtitle: "Whether you're a landlord, tenant, or partner, we're here to transform your real estate experience.",
    buttonText: "Get in Touch",
    buttonUrl: "/contact",
    gradient: undefined
  };

  const hero = heroData || defaultHero;
  const cta = ctaData || defaultCTA;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
     
      
   <>
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes hero-float {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      50% {
        transform: translate(40px, -40px) scale(1.05);
      }
    }
    @keyframes hero-shimmer {
      0% {
        background-position: 0% center;
      }
      100% {
        background-position: 200% center;
      }
    }
    .hero-animate-float {
      animation: hero-float 20s ease-in-out infinite;
    }
    .hero-animate-float-reverse {
      animation: hero-float 25s ease-in-out infinite reverse;
    }
    .hero-animate-shimmer {
      animation: hero-shimmer 4s linear infinite;
    }
  `}} />
  
  <section
    className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-screen"
    style={{
      background: hero?.gradient || defaultHero.gradient || "linear-gradient(135deg, #1e3a8a 0%, #0c4a6e 100%)",
    }}
  >
    {/* Floating background shapes */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl hero-animate-float"
        style={{
          background: "#00b7ff",
          top: "-10%",
          right: "-5%",
        }}
      />
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl hero-animate-float-reverse"
        style={{
          background: "#0099dd",
          bottom: "-15%",
          left: "-5%",
        }}
      />
    </div>

    {/* Left Section - Dynamic Text */}
    <div className="relative z-10 w-full md:w-1/2 px-6 md:px-16 py-16 md:py-24">
      {/* Badge */}
      {(hero?.page || defaultHero.page) && (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Sparkles size={16} className="text-[#00b7ff]" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            {hero?.page || defaultHero.page}
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-white">
        {hero?.title}
      </h1>

      {/* Subtitle with shimmer effect */}
      {(hero?.subtitle || defaultHero.subtitle) && (
        <h2
          className="text-xl sm:text-2xl font-medium mb-8 hero-animate-shimmer"
          style={{
            backgroundImage: "linear-gradient(90deg, #00b7ff, #ffffff, #00b7ff)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {hero?.subtitle || defaultHero.subtitle}
        </h2>
      )}

      {/* Description */}
      {(hero?.description || discover?.description || defaultHero.description) && (
        <p className="text-base sm:text-lg max-w-xl mb-8 text-white/80 leading-relaxed">
          {hero?.description }
        </p>
      )}

      {/* Button */}
      {hero?.buttonText && hero?.buttonUrl && (
        <Link
          href={hero.buttonUrl}
          className="inline-flex items-center gap-2 bg-[#00b7ff] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0099dd] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {hero.buttonText}
          <ArrowRight size={20} />
        </Link>
      )}
    </div>

    {/* Right Section - Image */}
    {hero?.imageUrl && (
      <div className="relative z-10 w-50% md:w-1/2 px-6 md:px-16 py-10 md:py-24">
        <div className="relative">
          {/* Main Image */}
          <div className="relative rounded-3xl overflow-hidden ">
            <Image
              src={hero.imageUrl}
              alt={hero.title || "Hero Image"}
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          
        </div>
      </div>
    )}
  </section>
</>
      {/* Our Journey */}
      {discover && (
        <section className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="text-[#00b7ff] font-semibold text-sm uppercase tracking-wider">Our Story</span>
                <div className="h-1 w-20 bg-[#00b7ff] mt-2 rounded-full"></div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">
                {discover.section}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {discover.description}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00b7ff] rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Innovation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00b7ff] rounded-full animate-pulse delay-100"></div>
                  <span className="text-sm text-gray-600">Dedication</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00b7ff] rounded-full animate-pulse delay-200"></div>
                  <span className="text-sm text-gray-600">Excellence</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=600"
                alt="Our Team Journey"
                width={600}
                height={400}
                className="object-cover w-full h-auto"
              />
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {vision && (
        <section className="relative bg-gradient-to-br from-[#1d3d67] to-[#0f1f3d] text-white py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#00b7ff] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00b7ff] rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="text-[#00b7ff] font-semibold text-sm uppercase tracking-wider">Our Vision</span>
                <div className="h-1 w-20 bg-[#00b7ff] mt-2 rounded-full"></div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold">
                {vision.section}
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                {vision.description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-12 bg-[#00b7ff] rounded-full"></div>
                <span className="text-sm tracking-widest uppercase text-white/70">
                  Building tomorrow's homes today
                </span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1521316730702-829a8e30dfd0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=600"
                alt="Mission and Vision"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Innovation Section */}
      {mission && (
        <section className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transform hover:scale-105 transition-transform duration-300">
              <Image 
                src="https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=600"
                alt="Innovation at Work" 
                width={600}
                height={400}
                className="object-cover w-full h-full" 
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-[#00b7ff] font-semibold text-sm uppercase tracking-wider">Innovation</span>
                <div className="h-1 w-20 bg-[#00b7ff] mt-2 rounded-full"></div>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">
                {mission.section}
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {mission.description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-[#00b7ff]">100+</div>
                  <div className="text-sm text-gray-600 mt-1">Properties Managed</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-[#00b7ff]">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Happy Clients</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#1d3d67] to-[#0f1f3d] text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00b7ff] rounded-full blur-3xl"></div>
        </div>
        <div className={`absolute inset-0 ${cta.gradient || ''}`}></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            {cta.title}
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-10 text-lg">
            {cta.subtitle}
          </p>
          <Link
            href={cta.buttonUrl}
            className="inline-block bg-[#00b7ff] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#0099dd] hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            {cta.buttonText}
          </Link>
        </div>
      </section>
    </main>
  );
}
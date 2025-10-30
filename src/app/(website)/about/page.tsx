"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/website/Navbar";

interface HeroData {
  title: string;
  subtitle: string;
  imageUrl: string;
  gradient?: string;
}

export default function AboutUsPage() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch("/api/hero?page=About");
        const data = await res.json();
        //  FIX: Use data[0] since your API returns an array
        setHero(data[0]);
      } catch (error) {
        console.error("Error fetching hero:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHero();
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Navbar />

      {/*  Dynamic Hero Section */}
      <section className="relative flex items-center justify-center h-[70vh] overflow-hidden">
        {loading ? (
          <div className="text-white text-xl">Loading...</div>
        ) : hero ? (
          <>
            {/* Background Image */}
            <Image
              src={hero.imageUrl}
              alt={hero.title}
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              priority
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={{
                background:
                  hero.gradient ||
                  "linear-gradient(to right, #0f172a, #1f2937, #334155)",
              }}
            ></div>

            {/* Hero Text */}
            <div className="relative z-10 text-center px-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
                {hero.title}
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto text-lg md:text-xl">
                {hero.subtitle}
              </p>
            </div>
          </>
        ) : (
          <div className="text-white">No hero data available</div>
        )}
      </section>

      {/* Our Journey */}
      <section className="container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">Our Journey</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Our story began with a shared belief — that technology could simplify the complexities of property management.
            From a small team of innovators to a platform trusted by countless users, we’ve stayed committed to making
            property transactions seamless, transparent, and human-centered.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Today, we stand as a bridge between landlords and tenants, transforming how people find, manage, and experience their homes.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-[#1d3d67]/10">
          <Image
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=500"
            alt="Our Team Journey"
            width={500}
            height={350}
            className="object-cover w-full h-auto rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative bg-[#1d3d67] text-white py-24">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">Our Mission & Vision</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Our mission is to simplify property management through smart, user-focused solutions.  
              We envision a future where every property owner and tenant enjoys effortless, transparent,
              and trusted interactions powered by technology.
            </p>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-12 bg-[#00b7ff] rounded-full"></div>
              <span className="text-sm tracking-widest uppercase text-white/70">
                Building tomorrow’s homes today
              </span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1521316730702-829a8e30dfd0?auto=format&fit=crop&q=80&w=500"
              alt="Mission and Vision"
              width={500}
              height={350}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-[#1d3d67]/10">
          <Image
            src="https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=464"
            alt="Innovation at Work"
            width={500}
            height={350}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">Driven by Innovation</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            We continuously evolve by listening to our users, adapting to the market, and pushing the boundaries of
            what’s possible in real estate technology. Innovation isn’t just a strategy — it’s our culture.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            From AI-assisted property recommendations to seamless payment integrations, our solutions redefine how people connect with property.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#1d3d67] text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Join Our Journey?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
            Whether you’re a landlord, tenant, or partner, we’re here to transform your real estate experience.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#00b7ff] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#0099dd] transition-all duration-300 shadow-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}

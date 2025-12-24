"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface HeroData {
  id: number;
  page: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
  gradient?: string;
}

export const HeroSection = ({ page }: { page: string }) => {
  const [hero, setHero] = useState<HeroData | null>(null);

  const theme = {
    accent: "#003b73",
    secondary: "#1F2933",
    white: "#ffffff",
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`/api/hero?page=${page}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setHero(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Error fetching hero:", error);
      }
    };

    fetchHero();
  }, [page]);

  if (!hero)
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-[#02051c] text-white">
        <p>Loading hero section...</p>
      </section>
    );

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center overflow-hidden bg-[#1F2933] mx-4 md:mx-10 rounded-3xl mt-4"
      style={{
        minHeight: "60vh",
        position: "relative",
      }}
    >
      {/* Background Shapes */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{
            background: theme.accent,
            top: "-10%",
            right: "-5%",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full blur-3xl"
          style={{
            background: theme.secondary,
            bottom: "-15%",
            left: "-5%",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 py-24 max-w-4xl">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: `${theme.white}15`,
            border: `1px solid ${theme.white}20`,
          }}
        >
          <Sparkles size={16} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">
            {hero.page || "HERO"}
          </span>
        </div>

        {hero.title && (
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-4 text-white max-w-3xl">
            {hero.title}
          </h1>
        )}

        {hero.subtitle && (
          <h2 className="text-lg sm:text-2xl font-medium mb-6 max-w-2xl text-blue-200">
            {hero.subtitle}
          </h2>
        )}

        {hero.description && (
          <p
            className="text-base sm:text-lg max-w-2xl mb-8"
            style={{ color: `${theme.white}B3` }}
          >
            {hero.description}
          </p>
        )}

        {hero.buttonText && hero.buttonUrl && (
          <a
            href={hero.buttonUrl}
            className="inline-block bg-[#003b73] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#002b5b] transition"
          >
            {hero.buttonText}
          </a>
        )}
      </div>

      {/* Hero Image */}
      {hero.imageUrl && (
        <div className="relative z-10 mt-10">
          <img
            src={hero.imageUrl}
            alt={hero.title || "Hero Image"}
            className="rounded-3xl shadow-2xl max-w-md md:max-w-xl w-full object-cover"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -40px) scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </section>
  );
};

"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  const [hero, setHero] = useState<any>(null);

  const theme = {
    accent: "#00a8e8",
    secondary: "#004e92",
    white: "#ffffff",
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        setHero(data[0]);
      } catch (error) {
        console.error("Error fetching hero:", error);
      }
    };

    fetchHero();
  }, []);

  if (!hero)
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#02051c] text-white">
        <p>Loading hero section...</p>
      </section>
    );

  return (
    <section
      className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
      style={{
        background: hero.gradient || "#02051c",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Floating background shapes */}
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

      {/* Left Section - Dynamic Text */}
      <div className="relative z-10 w-full md:w-1/2 px-6 md:px-16 py-24">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: `${theme.white}15`,
            border: `1px solid ${theme.white}20`,
          }}
        >
          <Sparkles size={16} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold text-white uppercase">
            {hero.page || "SERVICES"}
          </span>
        </div>

        {/* Title */}
        {hero.title && (
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-4 text-white">
            {hero.title}
          </h1>
        )}

        {/* Subtitle (smaller + gradient shimmer) */}
        {hero.subtitle && (
          <h2
            className="text-xl sm:text-2xl font-medium mb-8"
            style={{
              color: `${theme.white}cc`,
              backgroundImage: `linear-gradient(90deg, ${theme.accent}, ${theme.white}, ${theme.accent})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}
          >
            {hero.subtitle}
          </h2>
        )}

        {/* Description */}
        {hero.description && hero.description.trim() !== "" && (
          <p
            className="text-lg max-w-md mb-8"
            style={{ color: `${theme.white}B3` }}
          >
            {hero.description}
          </p>
        )}

        {/* Button */}
        {hero.buttonText && hero.buttonUrl && (
          <a
            href={hero.buttonUrl}
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
          >
            {hero.buttonText}
          </a>
        )}
      </div>

      {/* Right Section – Image */}
      {hero.imageUrl && (
        <div className="relative w-full md:w-1/2 px-6 md:px-16 py-10 md:py-0">
          <div className="relative">
            <img
              src={hero.imageUrl}
              alt={hero.title || "Hero Image"}
              className="rounded-3xl shadow-2xl w-full object-cover"
            />
            <div
              className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 w-64"
              style={{ color: theme.secondary }}
            >
              <h3 className="font-semibold text-lg">Stylish home near the city</h3>
              <p className="text-sm text-gray-500">2 bed • 1 bath • from $120</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
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

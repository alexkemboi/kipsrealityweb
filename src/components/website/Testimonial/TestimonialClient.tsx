"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Testimonial } from "@/app/data/TestimonialData";
import { TestimonialCard } from "./TestimonialCard";
import { useState } from "react";

interface TestimonialsProps {
  initialTestimonials: Testimonial[];
}

export function Testimonials({ initialTestimonials }: TestimonialsProps) {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % initialTestimonials.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + initialTestimonials.length) % initialTestimonials.length);

  const testimonial = initialTestimonials[index];

  return (
    <section
      id="testimonials"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-12"
    >
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


      {/* Title */}
      <h2 className="relative z-10 font-poppins font-bold text-4xl lg:text-5xl mb-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-white animate-gradient">
        What Do Our <span className="text-gradient-primary animate-gradient">Customers Say?</span>
      </h2>

     {/* Card + Arrows together */}
<div className="relative z-10 flex items-center justify-center w-full max-w-6xl ">
  <button
    onClick={prevSlide}
    className="absolute left-0 inset-y-0 my-auto ml-4 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-[#2c7cd6] rounded-full transition-all duration-300"
    style={{ zIndex: 20 }}
  >
    <ChevronLeft className="w-6 h-6 text-white" />
  </button>

  <TestimonialCard testimonial={testimonial} />

  <button
    onClick={nextSlide}
    className="absolute right-0 inset-y-0 my-auto mr-4 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-[#2c7cd6]  rounded-full transition-all duration-300"
    style={{ zIndex: 20 }}
  >
    <ChevronRight className="w-6 h-6 text-white" />
  </button>
</div>

    </section>
  );
}

"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import aboutBg from "@/assets/hero-cityscape.jpg";

import { useState } from "react";

const testimonials = [
  {
    name: "John Doe",
    role: "Tenant",
    image: "/lady.jpg", 
    text: "RentFlow360 made managing my property effortless. Rent payments are automated and communication is seamless.",
  },
  {
    name: "Jane Smith",
    role: "Landlord",
    image: "/lady.jpg",
    text: "The analytics dashboard is a game changer — I can see all my income and occupancy data in one place.",
  },
  {
    name: "Jane Brown",
    role: "Agent",
    image: "/lady.jpg",
    text: "I love how sleek and easy-to-use the system is. RentFlow360 has saved me hours every week.",
  },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const { name, role, image, text } = testimonials[index];

  return (
   <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
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

      {/* Main Container */}
      <div className="relative z-10 w-[90%] -w-4xl bg-white/10 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center text-center transition-all duration-300 hover:shadow-blue-500/20">
        {/* Heading */}
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-white animate-gradient">
          What Do Our Customers Say?
        </h2>

        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg mb-6">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>

        {/* Quote Icon */}
        <Quote className="w-10 h-10 text-blue-400/60 mb-4" />

        {/* Testimonial Text */}
        <p className="max-w-2xl text-lg md:text-xl font-inter text-white/80 leading-relaxed mb-6">
          {text}
        </p>

        {/* Name + Role */}
        <div>
          <div className="font-semibold text-white text-lg">{name}</div>
          <div className="text-sm text-white/60">{role}</div>
        </div>

        {/* Navigation */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/10 hover:bg-blue-500/30 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <button
            onClick={nextSlide}
            className="p-2 bg-white/10 hover:bg-blue-500/30 rounded-full transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

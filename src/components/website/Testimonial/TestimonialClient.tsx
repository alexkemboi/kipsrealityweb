"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
      

        
    {/* --- Background --- */}
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
           </div>


      {/* Title */}
      <h2 className="relative z-10 font-poppins font-bold text-4xl lg:text-5xl mb-10  bg-clip-text text-black animate-gradient">
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
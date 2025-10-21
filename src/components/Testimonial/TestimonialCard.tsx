import {Testimonial} from "@/app/data/TestimonialData"
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import aboutBg from "@/assets/hero-cityscape.jpg";


interface TestimonialsCardProps {
    testimonial: Testimonial;
}


  export const TestimonialCard = ({testimonial}: TestimonialsCardProps) => {
  return (
<div className="relative z-10 container mx-auto px-6 md:px-8 max-w-6xl bg-white/10 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-10 md:p-14 flex flex-col items-center text-center transition-all duration-300 hover:shadow-blue-500/30">
      

        {/* Avatar */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#0984cb]  shadow-lg mb-6">
          <Image src={testimonial.image} 
          alt={testimonial.name} 
          fill className="object-cover" />
        </div>

        {/* Quote Icon */}
        <Quote className="w-10 h-10 text-[#2c7cd6]  mb-4" />

        {/* Testimonial Text */}
        <p className="max-w-2xl text-lg md:text-xl font-inter text-white/80 leading-relaxed mb-6">
          {testimonial.text}
        </p>

        {/* Name + Role */}
        <div>
          <div className="font-semibold text-white text-lg">{testimonial.name}</div>
          <div className="text-sm text-white/60">{testimonial.role}</div>
        </div>

       
     
        </div>
  );
};


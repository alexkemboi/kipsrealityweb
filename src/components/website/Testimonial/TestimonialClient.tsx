"use client";

import { Testimonial } from "@/app/data/TestimonialData";
import { TestimonialCard } from "./TestimonialCard";
import { motion } from "framer-motion";

interface TestimonialsProps {
  initialTestimonials: Testimonial[];
}

export function Testimonials({ initialTestimonials }: TestimonialsProps) {
  return (
    <section id="testimonials" className="bg-white py-8 lg:py-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <div className="text-[#003b73] text-sm md:text-base font-black tracking-[0.3em] md:tracking-[0.4em] uppercase mb-8">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111827] mb-6 tracking-tight font-heading">
            What Do Our <span className="text-[#003b73]">Customers</span> Say?
          </h2>
          <p className="text-lg md:text-xl text-[#4B5563] max-w-3xl mx-auto font-medium opacity-95 leading-relaxed">
            Real feedback from property managers and tenants who have transformed their rental experience with RentFlow360.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {initialTestimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

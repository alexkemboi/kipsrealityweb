"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Enter a valid international phone number (e.g. +14155552671)"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    console.log("Form Data:", data);
    reset(); // Clear form after submit (you can remove this if posting to API)
  };

  return (
    <section
      id="contact"
      className="relative min-h-[80vh] flex justify-center overflow-hidden px-8 py-20 md:px-20"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      {/* Form */}
      <div className="relative z-20 container">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
          Contact{" "}
          <span className="text-gradient-primary animate-gradient">Us</span>
        </h3>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Your Name"
              {...register("name")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Your Email"
              {...register("email")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              placeholder="Your Phone (e.g. +14155552671)"
              {...register("phone")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <textarea
              placeholder="Your Message"
              rows={5}
              {...register("message")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none resize-none"
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2b7dfb] text-white font-semibold py-3 rounded-md hover:bg-[#0f172a] transition"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
